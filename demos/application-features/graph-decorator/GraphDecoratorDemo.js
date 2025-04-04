/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeStyle,
  HierarchicalLayout,
  IGraph,
  INode,
  IPortCandidateProvider,
  LabelStyle,
  LayoutExecutor,
  License,
  NodeDecorator,
  Size
} from '@yfiles/yfiles'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
let graphComponent
/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()
  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)
  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData)
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
  await graphComponent.fitGraphBounds()
  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
  // configure port candidate provider
  configurePortCandidateProvider(graphComponent.graph)
}
/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })
  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)
  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  graphBuilder.buildGraph()
}
/**
 * Configures custom port candidates by utilizing the portCandidateProvider of the {@link NodeDecorator}.
 */
function configurePortCandidateProvider(graph) {
  // Don't remove unoccupied ports.
  graph.nodeDefaults.ports.autoCleanUp = false
  // First, get the GraphDecorator from the IGraph.
  // GraphDecorator is a utility class that aids in decorating
  // functionality to model items from a graph instance.
  const decorator = graph.decorator
  // Here, we obtain the nodeDecorator.portCandidateProvider
  // to access the lookup decorator that handles ports candidates at nodes.
  // Basically this means that if any INode instance in the graph is queried for
  // the IPortCandidateProvider interface, the query will be handled by our code below.
  const portCandidateProvider = decorator.nodes.portCandidateProvider
  // One way to decorate the graph is to use the factory design pattern.
  // For each INode in the graph that will be queried for the IPortCandidateProvider interface, the below
  // factory method will be called with the node instance as argument.
  // We set the factory to a function expression which
  // returns a custom instance that implements the IPortCandidateProvider interface.
  // IPortCandidateProvider.combine() combines various port candidate providers.
  // IPortCandidateProvider.fromExistingPorts provides port candidates at the locations of already existing ports.
  // IPortCandidateProvider.fromNodeCenter provides a single port candidate at the center of the node.
  // IPortCandidateProvider.fromShapeGeometry provides several port candidates based on the shape of the node's style.
  portCandidateProvider.addFactory((node) =>
    IPortCandidateProvider.combine(
      graph.isGroupNode(node)
        ? [IPortCandidateProvider.fromShapeGeometry(node, 0.5)]
        : [
            IPortCandidateProvider.fromExistingPorts(node),
            IPortCandidateProvider.fromNodeCenter(node),
            IPortCandidateProvider.fromShapeGeometry(node, 0.5)
          ]
    )
  )
}
/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph, { orthogonalEditing: true })
  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#46a8d5',
    stroke: '2px solid #b5dcee',
    contentAreaFill: '#b5dcee'
  })
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#eee'
  })
  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}
run().then(finishLoading)
