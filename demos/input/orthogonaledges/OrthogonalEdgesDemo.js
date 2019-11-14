/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
'use strict'

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

/**
 * Shows how orthogonal edge editing can be customized by implementing the
 * {@link yfiles.input.IOrthogonalEdgeHelper} interface.
 */
require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'BlueOrthogonalEdgeHelper.js',
  'OrangeOrthogonalEdgeHelper.js',
  'PurpleOrthogonalEdgeHelper.js',
  'RedOrthogonalEdgeHelper.js',
  'BlueBendCreator.js',
  'PortLookupEdgePortHandleProvider.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  BlueOrthogonalEdgeHelper,
  OrangeOrthogonalEdgeHelper,
  PurpleOrthogonalEdgeHelper,
  RedOrthogonalEdgeHelper,
  BlueBendCreator,
  PortLookupEdgePortHandleProvider
) => {
  /**
   * Registers different IOrthogonalEdgeHelpers to demonstrate various custom behaviour.
   * @param {yfiles.graph.IGraph} graph The given graph
   */
  function registerOrthogonalEdgeHelperDecorators(graph) {
    const edgeDecorator = graph.decorator.edgeDecorator

    // Add different IOrthogonalEdgeHelpers to demonstrate various custom behaviour
    edgeDecorator.orthogonalEdgeHelperDecorator.setImplementation(
      edge => edge.tag === 'firebrick',
      new RedOrthogonalEdgeHelper()
    )
    // Green edges have the regular orthogonal editing behavior and therefore,
    // don't need a custom implementation
    edgeDecorator.orthogonalEdgeHelperDecorator.setImplementation(
      edge => edge.tag === 'green',
      new yfiles.input.OrthogonalEdgeHelper()
    )
    edgeDecorator.orthogonalEdgeHelperDecorator.setImplementation(
      edge => edge.tag === 'purple',
      new PurpleOrthogonalEdgeHelper()
    )
    edgeDecorator.orthogonalEdgeHelperDecorator.setImplementation(
      edge => edge.tag === 'orange',
      new OrangeOrthogonalEdgeHelper()
    )
    edgeDecorator.orthogonalEdgeHelperDecorator.setImplementation(
      edge => edge.tag === 'royalblue',
      new BlueOrthogonalEdgeHelper()
    )

    // Disable moving of the complete edge for orthogonal edges since this would create way too many bends
    edgeDecorator.positionHandlerDecorator.hideImplementation(
      edge => edge.tag === 'orange' || edge.tag === 'green' || edge.tag === 'purple'
    )

    // Add a custom BendCreator for blue edges that ensures orthogonality
    // if a bend is added to the first or last (non-orthogonal) segment
    edgeDecorator.bendCreatorDecorator.setImplementation(
      edge => edge.tag === 'royalblue',
      new BlueBendCreator()
    )

    // Add a custom EdgePortHandleProvider to make the handles of a
    // orange edge move within the bounds of the node
    edgeDecorator.edgePortHandleProviderDecorator.setImplementationWrapper(
      edge => edge.tag === 'orange',
      (edge, provider) => new PortLookupEdgePortHandleProvider()
    )

    // Allow the relocating of an edge to another node
    edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setImplementation(
      yfiles.input.IEdgeReconnectionPortCandidateProvider.ALL_NODE_CANDIDATES
    )
  }

  function run() {
    // initialize the GraphComponent
    const graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const graph = graphComponent.graph

    // enable snapping for edges only,
    const newGraphSnapContext = new yfiles.input.GraphSnapContext({
      collectNodeSnapLines: false,
      collectNodePairCenterSnapLines: false,
      collectNodePairSnapLines: false,
      collectNodePairSegmentSnapLines: false,
      collectNodeSizes: false,
      snapNodesToSnapLines: false,
      snapOrthogonalMovement: false
    })

    // Create a default editor input mode
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode({
      // Enable orthogonal edge editing
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext(),
      // Just for user convenience: disable node, edge creation and clipboard operations
      allowCreateEdge: false,
      allowCreateNode: false,
      allowClipboardOperations: false,
      // disable deleting items
      deletableItems: yfiles.graph.GraphItemTypes.NONE,
      snapContext: newGraphSnapContext
    })

    // and enable the undo feature.
    graph.undoEngineEnabled = true

    // Finally, set the input mode to the graph component.
    graphComponent.inputMode = graphEditorInputMode

    // Disable auto-cleanup of ports since the purple nodes have explicit ports
    graph.nodeDefaults.ports.autoCleanUp = false

    // Create and register the edge decorations
    registerOrthogonalEdgeHelperDecorators(graph)

    createSampleGraph(graph)

    app.show(graphComponent)
  }

  /**
   * Creates the sample graph of this demo.
   * @param {yfiles.graph.IGraph} graph The input graph
   */
  function createSampleGraph(graph) {
    createSubgraph(graph, 'firebrick', 0, false)
    createSubgraph(graph, 'green', 110, false)
    createSubgraph(graph, 'purple', 220, true)
    createSubgraph(graph, 'orange', 330, false)

    // The blue edge has more bends than the other edges
    const blueEdge = createSubgraph(graph, 'royalblue', 440, false)
    const blueBends = blueEdge.bends.toArray()
    graph.remove(blueBends[1])
    graph.remove(blueBends[0])
    graph.addBend(blueEdge, new yfiles.geometry.Point(220, blueEdge.sourcePort.location.y - 30))
    graph.addBend(blueEdge, new yfiles.geometry.Point(300, blueEdge.sourcePort.location.y - 30))
    graph.addBend(blueEdge, new yfiles.geometry.Point(300, blueEdge.targetPort.location.y + 30))
    graph.addBend(blueEdge, new yfiles.geometry.Point(380, blueEdge.targetPort.location.y + 30))

    // clear undo after initial graph loading
    graph.undoEngine.clear()
  }

  /**
   * Creates the sample graph of the given color with two nodes and a single edge.
   * @param {yfiles.graph.IGraph} graph
   * @param {string} cssClass
   * @param {number} yOffset
   * @param {boolean} createPorts
   * @return {yfiles.graph.IEdge}
   */
  function createSubgraph(graph, cssClass, yOffset, createPorts) {
    // Create two nodes
    const nodeStyle = new DemoStyles.DemoNodeStyle()
    nodeStyle.cssClass = cssClass

    const n1 = graph.createNode(
      new yfiles.geometry.Rect(110, 100 + yOffset, 40, 40),
      nodeStyle,
      cssClass
    )
    const n2 = graph.createNode(
      new yfiles.geometry.Rect(450, 130 + yOffset, 40, 40),
      nodeStyle,
      cssClass
    )

    // Create an edge, either between the two nodes or between the nodes's ports
    let edge
    const edgeStyle = new DemoStyles.DemoEdgeStyle()
    edgeStyle.cssClass = cssClass
    edgeStyle.showTargetArrows = false

    if (!createPorts) {
      edge = graph.createEdge(n1, n2, edgeStyle, cssClass)
    } else {
      const p1 = createSamplePorts(graph, n1, true)
      const p2 = createSamplePorts(graph, n2, false)
      edge = graph.createEdge(p1[1], p2[2], edgeStyle, cssClass)
    }

    // Add bends that create a vertical segment in the middle of the edge
    const x = (edge.sourcePort.location.x + edge.targetPort.location.x) / 2
    graph.addBend(edge, new yfiles.geometry.Point(x, edge.sourcePort.location.y))
    graph.addBend(edge, new yfiles.geometry.Point(x, edge.targetPort.location.y))

    return edge
  }

  /**
   * Adds some ports to the given node.
   * @param {yfiles.graph.IGraph} graph
   * @param {yfiles.graph.INode} node
   * @param {boolean} toEastSide
   * @return {yfiles.graph.IPort[]}
   */
  function createSamplePorts(graph, node, toEastSide) {
    const nodeScaledPortLocationModel = yfiles.graph.FreeNodePortLocationModel.INSTANCE
    const x = toEastSide ? 0.9 : 0.1
    const ports = []
    ports.push(
      graph.addPort(
        node,
        nodeScaledPortLocationModel.createParameterForRatios(new yfiles.geometry.Point(x, 0.05))
      )
    )
    ports.push(
      graph.addPort(
        node,
        nodeScaledPortLocationModel.createParameterForRatios(new yfiles.geometry.Point(x, 0.35))
      )
    )
    ports.push(
      graph.addPort(
        node,
        nodeScaledPortLocationModel.createParameterForRatios(new yfiles.geometry.Point(x, 0.65))
      )
    )
    ports.push(
      graph.addPort(
        node,
        nodeScaledPortLocationModel.createParameterForRatios(new yfiles.geometry.Point(x, 0.95))
      )
    )
    return ports
  }

  // run the demo
  run()
})
