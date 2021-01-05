/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import {
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSnapContext,
  IEdgeReconnectionPortCandidateProvider,
  IGraph,
  INode,
  License,
  OrthogonalEdgeEditingContext,
  OrthogonalEdgeHelper,
  Point,
  Rect
} from 'yfiles'

import { DemoEdgeStyle, DemoNodeStyle } from '../../resources/demo-styles.js'
import { showApp } from '../../resources/demo-app.js'
import PortLookupEdgePortHandleProvider from './PortLookupEdgePortHandleProvider.js'
import BlueBendCreator from './BlueBendCreator.js'
import BlueOrthogonalEdgeHelper from './BlueOrthogonalEdgeHelper.js'
import OrangeOrthogonalEdgeHelper from './OrangeOrthogonalEdgeHelper.js'
import PurpleOrthogonalEdgeHelper from './PurpleOrthogonalEdgeHelper.js'
import RedOrthogonalEdgeHelper from './RedOrthogonalEdgeHelper.js'
import loadJson from '../../resources/load-json.js'

/**
 * Registers different IOrthogonalEdgeHelpers to demonstrate various custom behaviour.
 * @param {IGraph} graph The given graph
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
    new OrthogonalEdgeHelper()
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
    IEdgeReconnectionPortCandidateProvider.ALL_NODE_CANDIDATES
  )
}

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // enable snapping for edges only,
  const newGraphSnapContext = new GraphSnapContext({
    collectNodeSnapLines: false,
    collectNodePairCenterSnapLines: false,
    collectNodePairSnapLines: false,
    collectNodePairSegmentSnapLines: false,
    collectNodeSizes: false,
    snapNodesToSnapLines: false,
    snapOrthogonalMovement: false
  })

  // Create a default editor input mode
  const graphEditorInputMode = new GraphEditorInputMode({
    // Enable orthogonal edge editing
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    // Just for user convenience: disable node, edge creation and clipboard operations
    allowCreateEdge: false,
    allowCreateNode: false,
    allowClipboardOperations: false,
    // disable deleting items
    deletableItems: GraphItemTypes.NONE,
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

  showApp(graphComponent)
}

/**
 * Creates the sample graph of this demo.
 * @param {IGraph} graph The input graph
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
  graph.addBend(blueEdge, new Point(220, blueEdge.sourcePort.location.y - 30))
  graph.addBend(blueEdge, new Point(300, blueEdge.sourcePort.location.y - 30))
  graph.addBend(blueEdge, new Point(300, blueEdge.targetPort.location.y + 30))
  graph.addBend(blueEdge, new Point(380, blueEdge.targetPort.location.y + 30))

  // clear undo after initial graph loading
  graph.undoEngine.clear()
}

/**
 * Creates the sample graph of the given color with two nodes and a single edge.
 * @param {IGraph} graph
 * @param {string} cssClass
 * @param {number} yOffset
 * @param {boolean} createPorts
 * @return {IEdge}
 */
function createSubgraph(graph, cssClass, yOffset, createPorts) {
  // Create two nodes
  const nodeStyle = new DemoNodeStyle()
  nodeStyle.cssClass = cssClass

  const n1 = graph.createNode(new Rect(110, 100 + yOffset, 40, 40), nodeStyle, cssClass)
  const n2 = graph.createNode(new Rect(450, 130 + yOffset, 40, 40), nodeStyle, cssClass)

  // Create an edge, either between the two nodes or between the nodes's ports
  let edge
  const edgeStyle = new DemoEdgeStyle()
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
  graph.addBend(edge, new Point(x, edge.sourcePort.location.y))
  graph.addBend(edge, new Point(x, edge.targetPort.location.y))

  return edge
}

/**
 * Adds some ports to the given node.
 * @param {IGraph} graph
 * @param {INode} node
 * @param {boolean} toEastSide
 * @return {IPort[]}
 */
function createSamplePorts(graph, node, toEastSide) {
  const nodeScaledPortLocationModel = FreeNodePortLocationModel.INSTANCE
  const x = toEastSide ? 0.9 : 0.1
  const ports = []
  ports.push(
    graph.addPort(node, nodeScaledPortLocationModel.createParameterForRatios(new Point(x, 0.05)))
  )
  ports.push(
    graph.addPort(node, nodeScaledPortLocationModel.createParameterForRatios(new Point(x, 0.35)))
  )
  ports.push(
    graph.addPort(node, nodeScaledPortLocationModel.createParameterForRatios(new Point(x, 0.65)))
  )
  ports.push(
    graph.addPort(node, nodeScaledPortLocationModel.createParameterForRatios(new Point(x, 0.95)))
  )
  return ports
}

// run the demo
loadJson().then(run)
