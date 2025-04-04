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
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridConstraintProvider,
  GridInfo,
  GridRenderer,
  GridSnapTypes,
  IGraph,
  LabelStyle,
  License,
  List,
  Point,
  Rect,
  ShapeNodeStyle,
  Size,
  SmartEdgeLabelModel,
  SnappableItems
} from '@yfiles/yfiles'
import { AdditionalSnapLineVisualCreator } from './AdditionalSnapLineVisualCreator'
import { OrthogonalLabelSnapLineProviderWrapper } from './OrthogonalLabelSnapLineProviderWrapper'
import { ShapeBasedGridNodeSnapResultProvider } from './ShapeBasedGridNodeSnapResultProvider'
import { AdditionalSnapLineMoveInputMode } from './AdditionalSnapLineMoveInputMode'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
/**
 * Returns a list of the free {@link AdditionalSnapLineVisualCreator}s used in this demo.
 * This property is used by {@link AdditionalSnapLineMoveInputMode} to access the
 * {@link AdditionalSnapLineVisualCreator}s used in this demo.
 */
let additionalSnapLineVisualCreators = null
async function run() {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph
  decorateModelItemLookupForCustomSnappingBehaviour(graph)
  const graphSnapContext = createGraphSnapContext()
  initializeGrid(graphComponent, graphSnapContext)
  // initialize two free snap lines that are also visualized in the demo's GraphComponent
  additionalSnapLineVisualCreators = new List()
  addAdditionalSnapLineVisualCreator(graphComponent, new Point(0, -70), new Point(500, -70))
  addAdditionalSnapLineVisualCreator(graphComponent, new Point(-230, -50), new Point(-230, 400))
  // initialize the input mode for this demo
  const graphEditorInputMode = new GraphEditorInputMode({
    snapContext: graphSnapContext
  })
  // add an input mode that allows to move the additional snap lines
  const additionalSnapLineMoveInputMode = new AdditionalSnapLineMoveInputMode(
    additionalSnapLineVisualCreators
  )
  // ensure the new mode is the first to process mouse events
  additionalSnapLineMoveInputMode.priority = -50
  graphEditorInputMode.add(additionalSnapLineMoveInputMode)
  graphComponent.inputMode = graphEditorInputMode
  graph.undoEngineEnabled = true
  initializeGraphDefaults(graph)
  // create a sample graph for the demo
  createSampleGraph(graph)
  // center the sample graph in the demo's GraphComponent
  void graphComponent.fitGraphBounds()
}
/**
 * Creates a pre-configured {@link GraphSnapContext}.
 */
function createGraphSnapContext() {
  const context = new GraphSnapContext({
    snappableItems:
      SnappableItems.ALL & ~(SnappableItems.BEND | SnappableItems.ORTHOGONAL_MOVEMENT),
    gridSnapType: GridSnapTypes.LINES,
    snapDistance: 10
  })
  // use the free additional snap lines
  context.addEventListener('collect-snap-references', (evt) => {
    // Creates and adds snap lines for the free AdditionalSnapLineVisualCreator to a GraphSnapContext.
    // While the AdditionalSnapLineVisualCreators are used to visualize free snap lines, corresponding
    // OrthogonalSnapLines have to be added to the snapping mechanism to provide the snapping behavior.
    additionalSnapLineVisualCreators.forEach((creator) =>
      creator.createSnapLines().forEach((snapLine) => evt.addSnapReference(snapLine))
    )
  })
  return context
}
/**
 * Registers the demo's custom snap line providers for nodes and edges.
 * @param graph The demo's graph
 */
function decorateModelItemLookupForCustomSnappingBehaviour(graph) {
  // add additional snap lines for orthogonal labels of nodes
  const decorator = graph.decorator
  decorator.nodes.snapReferenceProvider.addWrapperFactory(
    (node, wrappedProvider) => new OrthogonalLabelSnapLineProviderWrapper(node, wrappedProvider)
  )
  // add additional snap lines for orthogonal labels of edges
  decorator.edges.snapReferenceProvider.addWrapperFactory(
    (edge, wrappedProvider) => new OrthogonalLabelSnapLineProviderWrapper(edge, wrappedProvider)
  )
  // for nodes using ShapeNodeStyle use a customized grid snapping behavior based on their shape
  decorator.nodes.snapResultProvider.addConstant(new ShapeBasedGridNodeSnapResultProvider())
}
/**
 * Configures grid visualization and grid snapping for the given graph component.
 * @param graphComponent The graph component to set up for grid visualization and grid snapping
 * @param graphSnapContext The snap context to set up for grid snapping
 */
function initializeGrid(graphComponent, graphSnapContext) {
  const gridInfo = new GridInfo()
  gridInfo.horizontalSpacing = 200
  gridInfo.verticalSpacing = 200
  graphComponent.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    gridInfo,
    new GridRenderer()
  )
  graphComponent.invalidate()
  graphComponent.addEventListener('zoom-changed', () => {
    graphComponent.invalidate()
  })
  graphComponent.addEventListener('viewport-changed', () => graphComponent.invalidate())
  graphSnapContext.nodeGridConstraintProvider = new GridConstraintProvider(gridInfo)
  graphSnapContext.bendGridConstraintProvider = new GridConstraintProvider(gridInfo)
}
/**
 * Configures default styles for the given graph.
 * @param graph The graph for which default styles are configured
 */
function initializeGraphDefaults(graph) {
  const labelStyle = new LabelStyle()
  graph.nodeDefaults.labels.style = labelStyle
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 0.0],
    [0, -10],
    [0.5, 1.0],
    [0, 0],
    0.0
  )
  graph.edgeDefaults.labels.style = labelStyle
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(
    0,
    0,
    0.5
  )
  initDemoStyles(graph)
  graph.nodeDefaults.size = new Size(50, 50)
}
/**
 * Adds a new {@link AdditionalSnapLineVisualCreator} to the given graph component that spans between
 * `from` and `to`.
 * @param graphComponent The graph component for which to add snap line visualizations
 * @param from The start location of the snap line.
 * @param to The end location of the snap line.
 */
function addAdditionalSnapLineVisualCreator(graphComponent, from, to) {
  const lineVisualCreator = new AdditionalSnapLineVisualCreator(from, to)
  additionalSnapLineVisualCreators.add(lineVisualCreator)
  graphComponent.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    lineVisualCreator
  )
}
/**
 * Creates the demo's sample graph.
 * @param graph The graph to populate
 */
function createSampleGraph(graph) {
  graph.clear()
  const starShape = new ShapeNodeStyle({
    shape: 'star5',
    fill: '#46A8D5',
    stroke: '#224556'
  })
  graph.createNode(new Rect(-100, 260, 75, 75), starShape)
  graph.createNode(new Rect(40, 260, 75, 75), starShape)
  const n1 = graph.createNode(new Rect(-80, 60, 50, 50))
  graph.addLabel(
    n1,
    'This node label has an extra extended super long text\nso you can see how nodes snap all along its border.'
  )
  const n2 = graph.createNode(new Rect(360, 280, 50, 50))
  graph.createNode(new Rect(50, -90, 50, 50))
  const edge = graph.createEdge(n1, n2)
  graph.addBend(edge, new Point(130, 85), 0)
  graph.addBend(edge, new Point(130, 210), 1)
  graph.addBend(edge, new Point(280, 210), 2)
  graph.addBend(edge, new Point(320, 305), 3)
  const smartEdgeLabelModel = new SmartEdgeLabelModel()
  graph.addLabel(
    edge,
    'Other graph items can snap\nto this edge label as long as\nit is orthogonal.',
    smartEdgeLabelModel.createParameterFromSource(2, 10, 0.5)
  )
}
run().then(finishLoading)
