/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IEdgeReconnectionPortCandidateProvider,
  IGraph,
  INode,
  IPortCandidateProvider,
  License,
  NodeStylePortStyleAdapter,
  Point,
  PortCandidateValidity,
  Rect,
  ShapeNodeStyle
} from 'yfiles'
import type { ColorSetName } from 'demo-resources/demo-styles'
import {
  applyDemoTheme,
  createDemoEdgeStyle,
  createDemoNodeStyle
} from 'demo-resources/demo-styles'
import GreenEdgePortCandidateProvider from './GreenEdgePortCandidateProvider'
import BlueEdgePortCandidateProvider from './BlueEdgePortCandidateProvider'
import OrangeEdgePortCandidateProvider from './OrangeEdgePortCandidateProvider'
import RedEdgePortCandidateProvider from './RedEdgePortCandidateProvider'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/**
 * Registers a callback function as decorator that provides a custom
 * {@link IEdgeReconnectionPortCandidateProvider} for each node.
 * This callback function is called whenever a node in the graph is queried
 * for its {@link IEdgePortCandidateProvider}. In this case, the 'node'
 * parameter will be set to that node.
 * @param graph The given graph
 */
function registerEdgePortCandidateProvider(graph: IGraph): void {
  const edgeDecorator = graph.decorator.edgeDecorator
  edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setFactory(edge => {
    // obtain the tag from the edge
    const edgeTag = edge.tag

    // Check if it is a known tag and choose the respective implementation
    if (typeof edgeTag !== 'string') {
      return null
    } else if (edgeTag === 'red') {
      return new RedEdgePortCandidateProvider(edge)
    } else if (edgeTag === 'orange') {
      return new OrangeEdgePortCandidateProvider(edge)
    } else if (edgeTag === 'blue') {
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
async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
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
}

/**
 * Creates the sample graph of this demo.
 * @param graphComponent The given graphComponent
 */
function createSampleGraph(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph
  const blackPortStyle = new NodeStylePortStyleAdapter(
    new ShapeNodeStyle({
      shape: 'ellipse'
    })
  )
  createSubgraph(graph, 'demo-red', 'red', 0)
  createSubgraph(graph, 'demo-orange', 'orange', 200)
  createSubgraph(graph, 'demo-green', 'green', 600)

  // the blue nodes have some additional ports besides the ones used by the edge
  const nodes = createSubgraph(graph, 'demo-lightblue', 'blue', 400)
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
  graph.undoEngine!.clear()
}

/**
 * Creates new graph items in the given graph using the given color set.
 * @param graph The graph instance in which to create sample items.
 * @param colorSet The color set to use for the new sample items.
 * @param tag The tag for new nodes created by this method.
 * @param yOffset An y-coordinate offset for new nodes created by this method.
 */
function createSubgraph(
  graph: IGraph,
  colorSet: ColorSetName,
  tag: string,
  yOffset: number
): INode[] {
  const nodeStyle = createDemoNodeStyle(colorSet)

  const n1 = graph.createNode(new Rect(100, 100 + yOffset, 60, 60), nodeStyle, tag)
  const n2 = graph.createNode(new Rect(500, 100 + yOffset, 60, 60), nodeStyle, tag)
  const n3 = graph.createNode(new Rect(300, 160 + yOffset, 60, 60), nodeStyle, tag)

  const edgeStyle = createDemoEdgeStyle({ colorSetName: colorSet, showTargetArrow: false })
  graph.createEdge(n1, n2, edgeStyle, tag)
  return [n1, n2, n3]
}

run().then(finishLoading)
