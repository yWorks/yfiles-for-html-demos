/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
 * Shows how to customize the port relocation feature
 * by implementing a custom {@link yfiles.input.IPortCandidateProvider}.
 */
require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'GreenPortCandidateProvider.js',
  'OrangePortCandidateProvider.js',
  'BluePortCandidateProvider.js',
  'RedPortCandidateProvider.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  GreenPortCandidateProvider,
  OrangePortCandidateProvider,
  BluePortCandidateProvider,
  RedPortCandidateProvider
) => {
  function run() {
    // initialize the GraphComponent
    const graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const graph = graphComponent.graph

    // Disable automatic cleanup of unconnected ports since some nodes have a predefined set of ports
    graph.nodeDefaults.ports.autoCleanUp = false
    graph.nodeDefaults.ports.style = new yfiles.styles.NodeStylePortStyleAdapter(
      new yfiles.styles.ShapeNodeStyle({
        shape: 'ellipse'
      })
    )

    // Create a default editor input mode and configure it
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode({
      // Just for user convenience: disable node creation and clipboard operations
      allowCreateNode: false,
      allowClipboardOperations: false
    })
    graphEditorInputMode.createEdgeInputMode.useHitItemsCandidatesOnly = true
    // and enable the undo feature.
    graph.undoEngineEnabled = true

    // Initialize the default style of the nodes and edges
    DemoStyles.initDemoStyles(graph)

    // Finally, set the input mode to the graph component.
    graphComponent.inputMode = graphEditorInputMode

    registerPortCandidateProvider(graph)
    createSampleGraph(graphComponent)
    graphComponent.updateContentRect()

    app.show(graphComponent)
  }

  /**
   * Registers a callback function as decorator that provides a custom
   * {@link yfiles.input.IPortCandidateProvider} for each node.
   * This callback function is called whenever a node in the graph is queried
   * for its <code>IPortCandidateProvider</code>. In this case, the 'node'
   * parameter will be assigned that node.
   * @param {yfiles.graph.IGraph} graph The given graph
   * @return {yfiles.input.IPortCandidateProvider | null}
   */
  function registerPortCandidateProvider(graph) {
    const nodeDecorator = graph.decorator.nodeDecorator
    nodeDecorator.portCandidateProviderDecorator.setFactory(node => {
      // Obtain the tag from the edge
      const nodeTag = node.tag

      // Check if it is a known tag and choose the respective implementation
      if (!yfiles.lang.String.isInstance(nodeTag)) {
        return null
      } else if (nodeTag === 'firebrick') {
        return new RedPortCandidateProvider(node)
      } else if (nodeTag === 'royalblue') {
        return new BluePortCandidateProvider(node)
      } else if (nodeTag === 'green') {
        return new GreenPortCandidateProvider(node)
      } else if (nodeTag === 'orange') {
        return new OrangePortCandidateProvider(node)
      }
      // otherwise revert to default behavior
      return null
    })
  }

  /**
   * Creates the sample graph for this demo.
   * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent
   */
  function createSampleGraph(graphComponent) {
    const graph = graphComponent.graph

    createNode(graph, 100, 100, 80, 30, 'firebrick', 'No Edge')
    createNode(graph, 350, 200, 80, 30, 'firebrick', 'No Edge')
    createNode(graph, 350, 100, 80, 30, 'green', 'Green Only')
    createNode(graph, 100, 200, 80, 30, 'green', 'Green Only')

    const blue1 = createNode(graph, 100, 300, 80, 30, 'royalblue', 'One   Port')
    graph.addPortAt(blue1, blue1.layout.center)

    const blue2 = createNode(graph, 350, 300, 100, 100, 'royalblue', 'Many Ports')
    const portCandidateProvider = yfiles.input.IPortCandidateProvider.fromShapeGeometry(
      blue2,
      0,
      0.25,
      0.5,
      0.75
    )
    const candidates = portCandidateProvider.getAllSourcePortCandidates(
      graphComponent.inputModeContext
    )
    candidates.forEach(portCandidate => {
      if (portCandidate.validity !== yfiles.input.PortCandidateValidity.DYNAMIC) {
        portCandidate.createPort(graphComponent.inputModeContext)
      }
    })

    // The orange node
    const nodeStyle = new DemoStyles.DemoNodeStyle()
    nodeStyle.cssClass = 'orange'

    const orange = graph.createNode(
      new yfiles.geometry.Rect(100, 400, 100, 100),
      nodeStyle,
      'orange'
    )
    graph.addLabel(orange, 'Dynamic Ports')

    // clear undo after initial graph loading
    graph.undoEngine.clear()
  }

  /**
   * Creates a sample node for this demo.
   * @param {yfiles.graph.IGraph} graph The given graph
   * @param {number} x The node's x-coordinate
   * @param {number} y The node's y-coordinate
   * @param {number} w The node's width
   * @param {number} h The node's height
   * @param {string} cssClass The given css class
   * @param {string} labelText The nodes label's text
   * @return {yfiles.graph.INode}
   */
  function createNode(graph, x, y, w, h, cssClass, labelText) {
    const whiteTextLabelStyle = new yfiles.styles.DefaultLabelStyle({
      textFill: 'white'
    })

    const nodeStyle = new DemoStyles.DemoNodeStyle()
    nodeStyle.cssClass = cssClass

    const node = graph.createNode(new yfiles.geometry.Rect(x, y, w, h), nodeStyle, cssClass)
    graph.addLabel({
      owner: node,
      text: labelText,
      style: whiteTextLabelStyle
    })
    return node
  }

  // run the demo
  run()
})
