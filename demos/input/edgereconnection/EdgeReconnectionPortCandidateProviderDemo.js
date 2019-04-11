/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  IGraph,
  IPortCandidateProvider,
  License,
  NodeStylePortStyleAdapter,
  Point,
  PortCandidateValidity,
  Rect,
  ShapeNodeStyle,
  YString
} from 'yfiles'

import { DemoNodeStyle, DemoEdgeStyle } from '../../resources/demo-styles.js'
import { showApp } from '../../resources/demo-app.js'
import GreenEdgePortCandidateProvider from './GreenEdgePortCandidateProvider.js'
import BlueEdgePortCandidateProvider from './BlueEdgePortCandidateProvider.js'
import OrangeEdgePortCandidateProvider from './OrangeEdgePortCandidateProvider.js'
import RedEdgePortCandidateProvider from './RedEdgePortCandidateProvider.js'
import loadJson from '../../resources/load-json.js'
/**
 * Registers a callback function as decorator that provides a custom
 * {@link IEdgeReconnectionPortCandidateProvider} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its <code>IEdgePortCandidateProvider</code>. In this case, the 'node'
 * parameter will be set to that node.
 * @param {IGraph} graph The given graph
 */
function registerEdgePortCandidateProvider(graph) {
  const edgeDecorator = graph.decorator.edgeDecorator
  edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setFactory(edge => {
    // obtain the tag from the edge
    const edgeTag = edge.tag

    // Check if it is a known tag and choose the respective implementation
    if (!YString.isInstance(edgeTag)) {
      return null
    } else if (edgeTag === 'firebrick') {
      return new RedEdgePortCandidateProvider(edge)
    } else if (edgeTag === 'orange') {
      return new OrangeEdgePortCandidateProvider(edge)
    } else if (edgeTag === 'royalblue') {
      return new BlueEdgePortCandidateProvider()
    } else if (edgeTag === 'green') {
      return new GreenEdgePortCandidateProvider()
    }
    // otherwise revert to default behavior
    return null
  })
}

/**
 * Called after this application has been set up by the demo framework.
 */
function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // Disable automatic cleanup of unconnected ports since some nodes have a predefined set of ports
  graph.nodeDefaults.ports.autoCleanUp = false

  // Create a default editor input mode
  const graphEditorInputMode = new GraphEditorInputMode({
    // Just for user convenience: disable node/edge creation and clipboard operations
    allowCreateEdge: false,
    allowCreateNode: false,
    allowClipboardOperations: false
  })
  // and enable the undo feature.
  graph.undoEngineEnabled = true

  // Finally, set the input mode to the graph component.
  graphComponent.inputMode = graphEditorInputMode

  // Set a port style that makes the pre-defined ports visible
  graph.nodeDefaults.ports.style = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      shape: 'ellipse'
    })
  )

  registerEdgePortCandidateProvider(graph)

  createSampleGraph(graphComponent)
  graphComponent.updateContentRect()

  showApp(graphComponent)
}

/**
 * Creates the sample graph of this demo.
 * @param {GraphComponent} graphComponent The given graphComponent
 */
function createSampleGraph(graphComponent) {
  const graph = graphComponent.graph
  const blackPortStyle = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      shape: 'ellipse'
    })
  )
  createSubgraph(graph, 'firebrick', 0)
  createSubgraph(graph, 'orange', 200)
  createSubgraph(graph, 'green', 600)

  // the blue nodes have some additional ports besides the ones used by the edge
  const nodes = createSubgraph(graph, 'royalblue', 400)
  graph.addPort(
    nodes[0],
    FreeNodePortLocationModel.INSTANCE.createParameterForRatios(new Point(1.0, 0.2)),
    blackPortStyle
  )
  graph.addPort(
    nodes[0],
    FreeNodePortLocationModel.INSTANCE.createParameterForRatios(new Point(1.0, 0.8)),
    blackPortStyle
  )

  const candidateProvider = IPortCandidateProvider.fromShapeGeometry(nodes[2], 0, 0.25, 0.5, 0.75)
  candidateProvider.style = blackPortStyle
  const candidates = candidateProvider.getAllSourcePortCandidates(graphComponent.inputModeContext)
  candidates.forEach(portCandidate => {
    if (portCandidate.validity !== PortCandidateValidity.DYNAMIC) {
      portCandidate.createPort(graphComponent.inputModeContext)
    }
  })

  // clear undo after initial graph loading
  graph.undoEngine.clear()
}

/**
 * Creates the sample graph of the given css class for different colored graphs.
 * @param {IGraph} graph The given graph
 * @param {string} cssClass The given cssClass
 * @param {number} yOffset An y-offset
 * @return {INode[]}
 */
function createSubgraph(graph, cssClass, yOffset) {
  const nodeStyle = new DemoNodeStyle()
  nodeStyle.cssClass = cssClass

  const n1 = graph.createNode(new Rect(100, 100 + yOffset, 60, 60), nodeStyle, cssClass)
  const n2 = graph.createNode(new Rect(500, 100 + yOffset, 60, 60), nodeStyle, cssClass)
  const n3 = graph.createNode(new Rect(300, 160 + yOffset, 60, 60), nodeStyle, cssClass)

  const edgeStyle = new DemoEdgeStyle()
  edgeStyle.cssClass = cssClass
  edgeStyle.showTargetArrows = false

  graph.createEdge(n1, n2, edgeStyle, cssClass)
  return [n1, n2, n3]
}

// run the demo
loadJson().then(run)
