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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EdgeLabelPreferredPlacement,
  EdgePathLabelModel,
  ExteriorNodeLabelModel,
  FolderNodeConverter,
  FoldingEdgeConverter,
  FoldingManager,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  GraphSnapContext,
  GridInfo,
  GridRenderer,
  GridStyle,
  HierarchicalLayout,
  HierarchicalLayoutData,
  HierarchicalNestingPolicy,
  IGraph,
  IGroupPaddingProvider,
  ILayoutAlgorithm,
  INode,
  Insets,
  LabelAngleReferences,
  LabelEdgeSides,
  LabelLayerPolicy,
  LabelSideReferences,
  LabelStyle,
  LayoutData,
  LayoutExecutor,
  License,
  Matrix,
  OrthogonalLayout,
  OrthogonalLayoutData,
  PolylineEdgeStyle,
  Rect,
  RenderMode,
  SerializationProperties,
  StretchNodeLabelModel,
  Stroke
} from '@yfiles/yfiles'
import IsometricData from './resources/IsometricData'
import { HeightHandleProvider } from './HeightHandleProvider'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { openGraphML } from '@yfiles/demo-utils/graphml-support'
import { IsometricNodeComparator } from './IsometricNodeComparator'
import { IsometricNodeStyle } from './IsometricNodeStyle'
const MINIMUM_NODE_HEIGHT = 3
let graphComponent = null
/**
 * A flag that signals whether a layout is currently running to prevent re-entrant layout
 * calculations.
 */
let layoutRunning = false
let gridRenderer = null
/**
 * Orders nodes such their z-order in a graph component works well for the component's current
 * projection.
 */
let isometricNodeComparator = null
/**
 * Starts the demo which displays graphs in an isometric fashion to create an impression of a
 * 3-dimensional view.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  initializeProjection()
  initializeFolding()
  initializeInputMode()
  initializeGridVisual()
  initializeGraph(graphComponent.graph)
  await loadGraph()
  initializeUI()
}
function initializeProjection() {
  // enable isometric projection
  graphComponent.projection = Matrix.ISOMETRIC
  // configure the GraphModelManager to render the nodes in their correct z-order
  configureGraphModelManager(graphComponent)
}
function configureGraphModelManager(graphComponent) {
  isometricNodeComparator = new IsometricNodeComparator(graphComponent)
  const manager = graphComponent.graphModelManager
  manager.hierarchicalNestingPolicy = HierarchicalNestingPolicy.GROUP_NODES
  manager.nodeLabelLayerPolicy = LabelLayerPolicy.AT_OWNER
  manager.edgeLabelLayerPolicy = LabelLayerPolicy.AT_OWNER
  manager.nodeManager.comparator = isometricNodeComparator.compare.bind(isometricNodeComparator)
  manager.provideRenderTagOnMainRenderTreeElement = true
}
function initializeFolding() {
  const manager = new FoldingManager(graphComponent.graph)
  manager.folderNodeConverter = new FolderNodeConverter({
    folderNodeDefaults: {
      copyLabels: true,
      shareStyleInstance: false,
      size: [210, 120]
    }
  })
  manager.foldingEdgeConverter = new FoldingEdgeConverter({
    foldingEdgeDefaults: { copyLabels: true }
  })
  graphComponent.graph = manager.createFoldingView().graph
}
function initializeInputMode() {
  const graphEditorInputMode = new GraphEditorInputMode()
  // we use orthogonal edge editing and snapping, both very helpful for editing in isometric views
  graphEditorInputMode.snapContext = new GraphSnapContext()
  graphComponent.inputMode = graphEditorInputMode
  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
}
function initializeGridVisual() {
  gridRenderer = new GridRenderer({
    gridStyle: GridStyle.LINES,
    stroke: new Stroke(210, 210, 210, 255, 0.1),
    renderMode: RenderMode.WEBGL,
    visibilityThreshold: 10
  })
  graphComponent.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    new GridInfo(20, 20),
    gridRenderer
  )
}
function runHierarchicalLayout() {
  const layout = new HierarchicalLayout({
    nodeToEdgeDistance: 50,
    minimumLayerDistance: 40,
    gridSpacing: 10
  })
  const layoutData = new HierarchicalLayoutData({
    edgeLabelPreferredPlacements: new EdgeLabelPreferredPlacement({
      angle: 0,
      distanceToEdge: 10,
      angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
      edgeSide: LabelEdgeSides.LEFT_OF_EDGE,
      sideReference: LabelSideReferences.ABSOLUTE_WITH_RIGHT_ABOVE
    }),
    incrementalEdges: graphComponent.graph.edges
  })
  return runLayout(layout, layoutData)
}
function runOrthogonalLayout() {
  const layout = new OrthogonalLayout({
    gridSpacing: 20
  })
  const layoutData = new OrthogonalLayoutData({
    edgeLabelPreferredPlacements: new EdgeLabelPreferredPlacement({
      angle: 0,
      distanceToEdge: 10,
      angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW,
      edgeSide: LabelEdgeSides.LEFT_OF_EDGE,
      sideReference: LabelSideReferences.ABSOLUTE_WITH_RIGHT_ABOVE
    })
  })
  return runLayout(layout, layoutData)
}
async function runLayout(layout, layoutData) {
  if (layoutRunning) {
    return Promise.reject(new Error('layout is running'))
  }
  layoutRunning = true
  setUIDisabled(true)
  // configure layout execution to not move the view port
  const executor = new LayoutExecutor({
    graphComponent,
    layout,
    layoutData,
    animateViewport: true,
    animationDuration: '0.5s'
  })
  // start layout
  const promise = await executor.start()
  layoutRunning = false
  setUIDisabled(false)
  return promise
}
function initializeGraph(graph) {
  graph.nodeDefaults.style = new IsometricNodeStyle()
  graph.nodeDefaults.labels.layoutParameter = ExteriorNodeLabelModel.BOTTOM_LEFT
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px #444',
    orthogonalEditing: true
  })
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel(10).createRatioParameter()
  graph.groupNodeDefaults.labels.layoutParameter = new StretchNodeLabelModel({
    padding: 10
  }).createParameter('bottom')
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    font: 'bold 14px Arial,sans-serif',
    horizontalTextAlignment: 'right'
  })
  graph.groupNodeDefaults.style = new IsometricNodeStyle()
  // add a handle that enables the user to change the height of a node
  graph.decorator.nodes.handleProvider.addWrapperFactory(
    (n) => !graph.isGroupNode(n),
    (node, delegateProvider) =>
      new HeightHandleProvider(node, delegateProvider, MINIMUM_NODE_HEIGHT)
  )
  graph.decorator.nodes.groupPaddingProvider.addConstant(
    (node) => graph.isGroupNode(node),
    IGroupPaddingProvider.create(() => new Insets(10, 10, 50, 10))
  )
  // ensure that every node has geometry and color information
  graph.addEventListener('node-created', (evt) => {
    ensureNodeTag(evt.item)
    if (graph.isGroupNode(evt.item)) {
      adaptGroupNodes()
    }
  })
  graph.addEventListener('is-group-node-changed', () => {
    adaptGroupNodes()
  })
}
/**
 * Loads a graph from JSON and initializes all styles and isometric data.
 * The graph also gets an initial layout.
 */
async function loadGraph() {
  const graph = graphComponent.graph
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: IsometricData.nodesSource,
    id: 'id',
    parentId: 'group',
    labels: ['label'],
    layout: (data) => new Rect(0, 0, data.width, data.depth)
  })
  graphBuilder.createGroupNodesSource({
    data: IsometricData.groupsSource,
    id: 'id',
    labels: ['label']
  })
  const edgesSource = graphBuilder.createEdgesSource({
    data: IsometricData.edgesSource,
    sourceId: 'from',
    targetId: 'to'
  })
  edgesSource.edgeCreator.createLabelsSource((edgeData) => [edgeData.label])
  graphBuilder.buildGraph()
  await runHierarchicalLayout()
}
/**
 * Adapt the group node height and colors: group nodes should be flat,
 * but nested group nodes should still be drawn on top of each other
 */
function adaptGroupNodes() {
  const graph = graphComponent.graph
  for (const groupNode of graph.nodes.filter((n) => graph.isGroupNode(n))) {
    const nestingLevel = graph.groupingSupport.getAncestors(groupNode).size
    const tag = groupNode.tag
    tag.height = nestingLevel * 0.01
    tag.color.a = (Math.min(1, 0.4 + nestingLevel * 0.1) * 255) | 0
  }
  graphComponent.invalidate()
}
/**
 * Ensures that the node has geometry and color information present in its tag.
 */
function ensureNodeTag(node) {
  if (!node.tag || typeof node.tag !== 'object') {
    node.tag = {}
  }
  if (typeof node.tag.height !== 'number') {
    node.tag.height = MINIMUM_NODE_HEIGHT + Math.round(Math.random() * 30)
  }
  if (typeof node.tag.color !== 'object') {
    node.tag.color = {}
  }
  const color = node.tag.color
  for (const component of 'rgba'.split('')) {
    if (typeof color[component] !== 'number' || color[component] < 0 || 255 < color[component]) {
      color[component] = component === 'a' ? 255 : (Math.random() * 256) | 0
    }
  }
}
function updateRotation(angle) {
  const isometricProjection = Matrix.ISOMETRIC.clone()
  isometricProjection.rotate(parseFloat(angle))
  graphComponent.projection = isometricProjection
  // update the z-order of model items to match new projection
  // has to be done each time the projection changes
  // can be omitted in applications which do not change the projection
  isometricNodeComparator.update()
  const nodeManager = graphComponent.graphModelManager.nodeManager
  for (const node of graphComponent.graph.nodes) {
    nodeManager.update(node)
  }
  graphComponent.invalidate()
}
async function openFile(graphMLIOHandler) {
  try {
    const graph = graphComponent.graph
    await openGraphML(graphComponent, graphMLIOHandler)
    const nodeStyle = graph.nodeDefaults.style
    const groupStyle = graph.groupNodeDefaults.style
    for (const node of graph.nodes) {
      if (graph.isGroupNode(node)) {
        graph.setStyle(node, groupStyle)
      } else {
        graph.setStyle(node, nodeStyle)
      }
    }
    const edgeStyle = graph.edgeDefaults.style
    for (const edge of graph.edges) {
      graph.setStyle(edge, edgeStyle)
    }
    setUIDisabled(true)
    await runHierarchicalLayout()
  } finally {
    setUIDisabled(false)
  }
}
/**
 * Binds actions to the toolbar buttons.
 */
function initializeUI() {
  // ignore deserialization errors when loading graphs that use different styles
  // the styles will be replaced with isometric styles later
  const graphMLIOHandler = new GraphMLIOHandler()
  graphMLIOHandler.deserializationPropertyOverrides.set(
    SerializationProperties.IGNORE_XAML_DESERIALIZATION_ERRORS,
    true
  )
  const slider = document.querySelector('#rotation')
  slider.addEventListener('input', () => updateRotation(slider.value))
  document.querySelector('#open-file-button').addEventListener('click', async () => {
    await openFile(graphMLIOHandler)
  })
  document.querySelector('#hierarchical-layout').addEventListener('click', runHierarchicalLayout)
  document.querySelector('#orthogonal-layout').addEventListener('click', runOrthogonalLayout)
  document.querySelector('#grid-toggle').addEventListener('click', () => {
    gridRenderer.visible = !gridRenderer.visible
    graphComponent.invalidate()
  })
}
/**
 * Disables buttons in the toolbar.
 */
function setUIDisabled(disabled) {
  document.querySelector('#open-file-button').disabled = disabled
  document.querySelector('#hierarchical-layout').disabled = disabled
  document.querySelector('#orthogonal-layout').disabled = disabled
  document.querySelector('#grid-toggle').disabled = disabled
  document.querySelector('#rotation').disabled = disabled
}
run().then(finishLoading)
