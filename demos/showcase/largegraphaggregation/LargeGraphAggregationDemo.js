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
  AdjacencyTypes,
  Arrow,
  ArrowType,
  BezierEdgeStyle,
  CircularLayout,
  Color,
  EdgeBundleDescriptor,
  EdgeStyleIndicatorRenderer,
  FilteredGraphWrapper,
  FreeNodeLabelModel,
  GeneralPath,
  GenericLayoutData,
  Graph,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphOverviewComponent,
  GraphViewerInputMode,
  HoveredItemChangedEventArgs,
  IAnimation,
  IEdge,
  IEdgeStyle,
  IEnumerable,
  IGraph,
  ILabelOwner,
  ILayoutAlgorithm,
  INode,
  Insets,
  LabelStyle,
  LayoutExecutor,
  LayoutGraph,
  LayoutGraphGrouping,
  LayoutGraphHider,
  LayoutStageBase,
  License,
  NodeAggregation,
  NodeAggregationPolicy,
  NodeAggregationResult,
  NodeDataKey,
  NodeStyleIndicatorRenderer,
  Point,
  RadialGroupLayout,
  RadialTreeLayout,
  RadialTreeLayoutData,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  StraightLineEdgeRouter,
  Stroke,
  TemporaryGroupDescriptor,
  TemporaryGroupInsertionData,
  TemporaryGroupInsertionStage,
  TimeSpan,
  TreeReductionStageData,
  ViewportAnimation
} from '@yfiles/yfiles'
import { AggregationHelper, AggregationNodeInfo } from './AggregationHelper'
import {
  AggregationGraphWrapper,
  EdgeReplacementPolicy
} from '@yfiles/demo-utils/AggregationGraphWrapper'
import SampleGraph from './resources/SampleGraph'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { LitNodeStyle } from '@yfiles/demo-utils/LitNodeStyle'
// @ts-ignore Import via URL
import { svg } from 'lit-html'
let graphComponent = null
/**
 * The original graph before aggregation.
 */
let originalGraph = null
/**
 * Encapsulates aggregation and separation methods.
 */
let aggregationHelper = null
let graphViewerInputMode = null
let aggregationNodeStyle = null
let hierarchyEdgeStyle = null
let descendantLabelStyle = null
/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  const overviewComponent = new GraphOverviewComponent('#overviewComponent', graphComponent)
  // initialize node click listener that toggles the aggregation status
  initializeToggleAggregation()
  // initialize navigation along edges connecting to outside the viewport
  initializeSmartNavigation()
  initializeHighlight()
  // bind actions to the buttons in the toolbar and option panel
  initializeUI()
  // disable UI
  await setUiDisabled(true)
  // loads an initial sample graph from file
  originalGraph = loadGraph(graphComponent.graph)
  initializeStyles()
  // run the smart aggregation algorithm with default settings and set graph to the graph component
  await runAggregationAndReplaceGraph(originalGraph)
  // notify UI
  onInfoPanelPropertiesChanged()
  // enable UI
  await setUiDisabled(false)
}
/**
 * Registers a listener to the {@link GraphViewerInputMode} 'item-clicked' event that toggles the
 * aggregation of a node, runs a layout and sets the current item.
 */
function initializeToggleAggregation() {
  graphViewerInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    focusableItems: GraphItemTypes.NODE
  })
  graphViewerInputMode.addEventListener('item-clicked', (evt) => {
    if (!(evt.item instanceof INode)) {
      return
    }
    // prevent default behavior, which would select nodes that are no longer in the graph
    evt.handled = true
    toggleAggregationNode(evt.item)
  })
  graphComponent.inputMode = graphViewerInputMode
  graphComponent.addEventListener('key-up', (evt) => {
    if (evt.key === 'Enter') {
      toggleAggregationNode(graphComponent.currentItem)
    }
  })
  graphComponent.addEventListener('current-item-changed', () => {
    onInfoPanelPropertiesChanged()
  })
}
/**
 * Toggles the aggregation of a node, runs a layout and sets the current item.
 */
function toggleAggregationNode(node) {
  if (!aggregationHelper.aggregateGraph.isAggregationItem(node)) {
    // is an original node -> only set current item
    graphComponent.currentItem = node
    return
  }
  // toggle the aggregation
  const affectedNodes = aggregationHelper.toggleAggregation(node)
  // set the current item to the new aggregation node (which is the first in the list)
  graphComponent.currentItem = affectedNodes.first()
  // run layout
  runLayoutOnHierarchyView(affectedNodes)
}
/**
 * Initializes the input mode for this component.
 */
function initializeSmartNavigation() {
  // Implements the smart click navigation
  graphComponent.inputMode.addEventListener('item-clicked', (evt) => {
    if (evt.item instanceof IEdge) {
      evt.handled = true
      zoomToLocation(evt.item, evt.location)
    }
  })
}
/**
 * Zooms to the suitable point.
 * @param edge The element that we clicked.
 * @param currentMouseClickLocation The arguments that is used by the event.
 */
function zoomToLocation(edge, currentMouseClickLocation) {
  // Get the point where we should zoom in
  const location = getFocusPoint(edge)
  // The distance between where we clicked and the viewport center
  const offset = currentMouseClickLocation.subtract(graphComponent.viewport.center)
  // Zooms to the new location of the mouse
  graphComponent.zoomToAnimated(graphComponent.zoom, location.subtract(offset))
}
/**
 * Gets the focus point.
 * @param edge The element that we clicked.
 * @returns The point that we should zoom to.
 */
function getFocusPoint(edge) {
  // if the source and the target node are in the view port, then zoom to the middle point of the edge
  const sourceNodeCenter = edge.sourcePort.location
  const targetNodeCenter = edge.targetPort.location
  const viewport = graphComponent.viewport
  if (viewport.contains(targetNodeCenter) && viewport.contains(sourceNodeCenter)) {
    return new Point(
      (sourceNodeCenter.x + targetNodeCenter.x) / 2,
      (sourceNodeCenter.y + targetNodeCenter.y) / 2
    )
  } else {
    if (
      viewport.center.subtract(targetNodeCenter).vectorLength <
      viewport.center.subtract(sourceNodeCenter).vectorLength
    ) {
      // update current item to display the info of the newly focused node
      graphComponent.currentItem = edge.sourcePort.owner
      // if the source node is out of the view port, then zoom to it
      return sourceNodeCenter
    } else {
      // update current item to display the info of the newly focused node
      graphComponent.currentItem = edge.targetPort.owner
      // else zoom to the target node
      return targetNodeCenter
    }
  }
}
function initializeHighlight() {
  // we want to get reports of the mouse being hovered over nodes and edges
  // first enable queries
  graphViewerInputMode.itemHoverInputMode.enabled = true
  // set the items to be reported
  graphViewerInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.NODE
  // whenever the currently hovered item changes call our method
  graphViewerInputMode.itemHoverInputMode.addEventListener(
    'hovered-item-changed',
    (evt, inputMode) => {
      onHoveredItemChanged(inputMode, evt)
    }
  )
}
function onHoveredItemChanged(sender, evt) {
  // first remove previous highlights
  graphComponent.highlights.clear()
  // then see where we are hovering over, now
  const newItem = evt.item
  if (newItem) {
    // we highlight the item itself
    const node = newItem instanceof INode ? newItem : null
    const edge = newItem instanceof IEdge ? newItem : null
    if (node && aggregationHelper.isOriginalNodeOrPlaceHolder(node)) {
      addHighlight(node)
      // and if it's a node, we highlight all adjacent edges, too
      graphComponent.graph.edgesAt(node, AdjacencyTypes.ALL).forEach((adjacentEdge) => {
        if (aggregationHelper.isHierarchyEdge(adjacentEdge)) {
          return
        }
        addHighlight(adjacentEdge)
        addHighlight(
          node === adjacentEdge.sourceNode ? adjacentEdge.targetNode : adjacentEdge.sourceNode
        )
      })
    } else if (edge && !aggregationHelper.isHierarchyEdge(edge)) {
      addHighlight(edge)
      // if it's an edge - we highlight the adjacent nodes
      addHighlight(edge.sourceNode)
      addHighlight(edge.targetNode)
    }
  }
}
function addHighlight(item) {
  if (
    (item instanceof INode && aggregationHelper.isOriginalNodeOrPlaceHolder(item)) ||
    (item instanceof IEdge && !aggregationHelper.isHierarchyEdge(item))
  ) {
    graphComponent.highlights.add(item)
  }
}
function initializeHighlightStyles() {
  // we want to create a non-default nice highlight styling
  // for the hover highlight, create semi transparent orange stroke first
  const orangeRed = Color.ORANGE
  const orangePen = new Stroke(
    Color.fromRGBA(orangeRed.r, orangeRed.g, orangeRed.b, 0.85),
    3
  ).freeze()
  // now set the custom hover highlight styles for the nodes and edges
  // hide the default selection indicator
  graphComponent.graph.decorator.nodes.selectionRenderer.hide()
  // nodes should be given a rectangular orange rectangle highlight shape
  const highlightNodeStyle = new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      shape: ShapeNodeShape.ELLIPSE,
      stroke: orangePen,
      fill: null
    }),
    margins: 5
  })
  graphComponent.graph.decorator.nodes.focusRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      nodeStyle: new ShapeNodeStyle({
        shape: 'ellipse',
        fill: null,
        stroke: '1.5px dashed #696969'
      }),
      zoomPolicy: 'world-coordinates'
    })
  )
  // a similar style for the edges, however cropped by the highlight's insets
  const dummyCroppingArrow = new Arrow({
    type: ArrowType.NONE,
    cropLength: 5
  })
  const highlightEdgeStyle = new EdgeStyleIndicatorRenderer({
    edgeStyle: new BezierEdgeStyle({
      stroke: orangePen,
      targetArrow: dummyCroppingArrow,
      sourceArrow: dummyCroppingArrow
    })
  })
  graphComponent.graph.decorator.nodes.highlightRenderer.addConstant(highlightNodeStyle)
  graphComponent.graph.decorator.edges.highlightRenderer.addConstant(highlightEdgeStyle)
}
/**
 * Runs the smart {@link NodeAggregation} algorithm with the settings from the properties panel.
 */
async function runAggregation() {
  await setUiDisabled(true)
  graphComponent.graph = new Graph()
  aggregationHelper.aggregateGraph.dispose()
  await runAggregationAndReplaceGraph(originalGraph)
  document.querySelector('#switch-view').innerText = 'Switch To Filtered View'
  await setUiDisabled(false)
  onInfoPanelPropertiesChanged()
}
/**
 * Switches between the view with hierarchy nodes and without and runs an appropriate layout.
 */
async function switchView() {
  const switchViewButton = document.querySelector('#switch-view')
  if (graphComponent.graph instanceof AggregationGraphWrapper) {
    graphComponent.graph = createFilteredView()
    await runCircularLayout()
    switchViewButton.innerText = 'Switch To Hierarchical View'
  } else {
    graphComponent.graph = aggregationHelper.aggregateGraph
    await runLayoutOnHierarchyView()
    switchViewButton.innerText = 'Switch To Filtered View'
  }
}
/**
 * Creates a new {@link FilteredGraphWrapper} that shows the currently visible original nodes.
 * Nodes without currently visible edges are also filtered out.
 */
function createFilteredView() {
  // create a new FilteredGraphWrapper that filters the original graph and shows only the currently visible nodes
  const filteredGraph = new FilteredGraphWrapper(
    originalGraph,
    (node) => {
      node = aggregationHelper.getPlaceholder(node)
      const aggregateGraph = aggregationHelper.aggregateGraph
      return aggregateGraph.contains(node)
    },
    () => true
  )
  // set the node layouts for a smooth transition
  for (const node of filteredGraph.nodes) {
    filteredGraph.setNodeLayout(node, aggregationHelper.getPlaceholder(node).layout.toRect())
  }
  // reset any rotated node labels
  for (const label of filteredGraph.nodeLabels) {
    filteredGraph.setLabelLayoutParameter(label, FreeNodeLabelModel.CENTER)
  }
  return filteredGraph
}
/**
 * Creates a new {@link AggregationGraphWrapper} and runs the aggregation algorithm.
 */
async function runAggregationAndReplaceGraph(originalGraph) {
  const aggregateGraph = new AggregationGraphWrapper(originalGraph)
  aggregateGraph.edgeReplacementPolicy = EdgeReplacementPolicy.NONE
  await applyAggregation(originalGraph, aggregateGraph)
  graphComponent.graph = aggregateGraph
  // initializes the highlight styles of the graphComponent's current graph
  initializeHighlightStyles()
  await runLayoutOnHierarchyView()
}
/**
 * Asynchronously runs the {@link NodeAggregation} algorithm with the settings from the properties panel.
 * Afterwards, the {@link NodeAggregationResult} is applied to the `aggregateGraph`.
 */
async function applyAggregation(originalGraph, aggregateGraph) {
  return new Promise((resolve) => {
    const nodeAggregation = createConfiguredAggregation()
    const aggregationResult = nodeAggregation.run(originalGraph)
    aggregationHelper = new AggregationHelper(aggregationResult, aggregateGraph)
    aggregationHelper.aggregationNodeStyle = aggregationNodeStyle
    aggregationHelper.hierarchyEdgeStyle = hierarchyEdgeStyle
    aggregationHelper.descendantLabelStyle = descendantLabelStyle
    aggregationHelper.separate(aggregationHelper.aggregateRecursively(aggregationResult.root))
    resolve()
  })
}
function createConfiguredAggregation() {
  const aggregationMode = document.querySelector('#aggregation-mode-select').value
  const stopDuration = document.querySelector('#maximum-duration-range').value
  const minimumClusterSize = document.querySelector('#minimum-cluster-size-range').value
  const maximumClusterSize = document.querySelector('#maximum-cluster-size-range').value
  return new NodeAggregation({
    aggregationPolicy:
      aggregationMode === 'structural'
        ? NodeAggregationPolicy.STRUCTURAL
        : NodeAggregationPolicy.GEOMETRIC,
    stopDuration: TimeSpan.fromSeconds(parseFloat(stopDuration)),
    minimumClusterSize: parseInt(minimumClusterSize),
    maximumClusterSize: parseInt(maximumClusterSize),
    nodesOnlyOnLeaves: false
  })
}
/**
 * Runs a layout on the hierarchy view.
 */
async function runLayoutOnHierarchyView(affectedNodes) {
  return document.querySelector('#layout-style-select').value === 'radial-group'
    ? runRadialGroupLayout(affectedNodes)
    : runRadialTreeLayout(affectedNodes)
}
/**
 * Runs a {@link RadialTreeLayout} where the hierarchy edges are the tree edges and original edges are bundled.
 */
async function runRadialTreeLayout(affectedNodes) {
  switchHierarchyEdgeVisibility(graphComponent.graph, true)
  // create the radial tree layout
  const layout = new RadialTreeLayout({
    nodeLabelPlacement: 'ray-like-leaves',
    childOrderingPolicy: 'from-sketch',
    compactnessFactor: 0.9,
    allowOverlaps: true
  })
  // prepend a TreeReduction stage with the hierarchy edges as tree edges
  const treeReductionStage = layout.treeReductionStage
  treeReductionStage.nonTreeEdgeRouter = new StraightLineEdgeRouter()
  treeReductionStage.edgeBundling.bundlingStrength = 1
  const nonTreeEdges = graphComponent.graph.edges
    .filter((e) => !aggregationHelper.isHierarchyEdge(e))
    .toList()
  const treeReductionStageData = new TreeReductionStageData({
    nonTreeEdges: nonTreeEdges,
    edgeBundleDescriptors: (edge) => {
      return new EdgeBundleDescriptor({
        bundled: nonTreeEdges.includes(edge),
        bezierFitting: true
      })
    }
  })
  // create a layout executor that also zooms to all nodes that were affected by the last operation
  const layoutExecutor = new ZoomToNodesLayoutExecutor(
    affectedNodes || IEnumerable.EMPTY,
    graphComponent,
    layout
  )
  layoutExecutor.animationDuration = TimeSpan.fromSeconds(0.5)
  layoutExecutor.animateViewport = true
  layoutExecutor.easedAnimation = true
  layoutExecutor.layoutData = treeReductionStageData
  await layoutExecutor.start()
}
async function runCircularLayout() {
  const circularLayout = new CircularLayout()
  const radialTreeLayoutData = new RadialTreeLayoutData()
  radialTreeLayoutData.interleavedNodes = () => true
  await graphComponent.applyLayoutAnimated(circularLayout, '0.5s', radialTreeLayoutData)
}
/**
 * Runs a {@link RadialGroupLayout} where the hierarchy edges are not shown but the hierarchy is
 * visualized by placing child nodes along the circular border of the parent node.
 * The original edges are drawn in a bundled style.
 *
 * The approach uses {@link TemporaryGroupInsertionStage} and some custom layout stage code
 * to temporarily represent inner tree nodes (which have successors) as group nodes with children.
 * This is required because the radialGroupLayout layout works on hierarchical grouping structures as
 * input and not on tree graph structures.
 */
async function runRadialGroupLayout(affectedNodes) {
  const graph = graphComponent.graph
  switchHierarchyEdgeVisibility(graph, false)
  // collect hierarchy tree nodes that have children, which must temporarily be modeled as a groups
  const innerTreeNodes = []
  const innerTreeNode2Descriptor = new Map()
  for (const node of graph.nodes) {
    if (graph.outEdgesAt(node).some((e) => aggregationHelper.isHierarchyEdge(e))) {
      innerTreeNodes.push(node)
      innerTreeNode2Descriptor.set(node, new TemporaryGroupDescriptor())
    }
  }
  // prepare the layout data for the TemporaryGroupNodeInsertionStage
  const tmpGroupStageData = new TemporaryGroupInsertionData()
  for (const treeNode of innerTreeNodes) {
    const descriptor = innerTreeNode2Descriptor.get(treeNode)
    // register a temporary group for each inner tree node...
    const temporaryGroup = tmpGroupStageData.temporaryGroups.add(descriptor)
    // ... members of the group are all the successor nodes
    temporaryGroup.source = graph
      .outEdgesAt(treeNode)
      .filter((e) => aggregationHelper.isHierarchyEdge(e))
      .map((e) => e.targetNode)
    // if the tree node has a parent too, then the parent descriptor must be setup as well
    const inEdge = graph
      .inEdgesAt(treeNode)
      .filter((e) => aggregationHelper.isHierarchyEdge(e))
      .at(0)
    if (inEdge) {
      const parentGroupDescriptor = innerTreeNode2Descriptor.get(inEdge.sourceNode)
      if (parentGroupDescriptor) {
        descriptor.parent = parentGroupDescriptor
      }
    }
  }
  // create a mapper that maps from the inner tree node to the temporary group descriptor,
  // which is necessary that the custom layout stages know
  const innerNodesLayoutData = new GenericLayoutData()
  innerNodesLayoutData.addItemMapping(
    TemporaryGroupCustomizationStage.innerTreeNodesDataKey
  ).mapperFunction = (n) => {
    if (innerTreeNode2Descriptor.has(n)) {
      return innerTreeNode2Descriptor.get(n)
    }
    return null
  }
  // create a layout executor that also zooms to all nodes that were affected by the last operation
  const layoutExecutor = new ZoomToNodesLayoutExecutor(
    affectedNodes || IEnumerable.EMPTY,
    graphComponent,
    new CustomRadialGroupLayoutStage()
  )
  layoutExecutor.animationDuration = TimeSpan.fromSeconds(0.5)
  layoutExecutor.animateViewport = true
  layoutExecutor.easedAnimation = true
  layoutExecutor.layoutData = tmpGroupStageData.combineWith(innerNodesLayoutData)
  await layoutExecutor.start()
}
/**
 * A layout stage that configures and applies the {@link RadialGroupLayout} and uses further
 * stages to make the input suitable for it.
 */
class CustomRadialGroupLayoutStage extends LayoutStageBase {
  applyLayoutImpl(graph) {
    if (graph.nodes.size < 2) {
      // single node or no node: nothing to do for the layout
      return
    }
    // configure the radialGroupLayout group layout
    const radialGroup = new RadialGroupLayout({
      fromSketchMode: true,
      preferredRootSectorAngle: 360,
      nodeLabelPlacement: 'ray-like-leaves',
      // ... configure bundling
      edgeBundling: {
        defaultBundleDescriptor: { bundled: true, bezierFitting: true }
      }
    })
    const radialGroupLayoutData = radialGroup.createLayoutData(graph)
    // ... configure the parent-child overlap ratio so that they are allowed to overlap a bit
    radialGroupLayoutData.parentOverlapRatios = () => 0.5
    // apply the radialGroupLayout group layout with temporary groups
    const layout = new TemporaryGroupInsertionStage(
      new TemporaryGroupCustomizationStage(radialGroup)
    )
    graph.applyLayout(layout, radialGroupLayoutData)
  }
}
/**
 * A layout stage that prepares the temporary group nodes inserted by
 * {@link TemporaryGroupDescriptor} for the {@link RadialGroupLayout} algorithm.
 */
class TemporaryGroupCustomizationStage extends LayoutStageBase {
  radialGroupLayout
  constructor(radialGroupLayout) {
    super(radialGroupLayout)
    this.radialGroupLayout = radialGroupLayout
  }
  static innerTreeNodesDataKey = new NodeDataKey('INNER_TREE_NODES')
  applyLayoutImpl(graph) {
    if (!this.coreLayout) {
      return
    }
    const innerNodesDp = graph.context.getItemData(
      TemporaryGroupCustomizationStage.innerTreeNodesDataKey
    )
    const isInsertedTmpGroupDp = graph.context.getItemData(
      TemporaryGroupInsertionStage.INSERTED_GROUP_NODE_DATA_KEY
    )
    const childNode2DescriptorDp = graph.context.getItemData(
      TemporaryGroupInsertionStage.TEMPORARY_GROUP_DESCRIPTOR_DATA_KEY
    )
    const grouping = LayoutGraphGrouping.createReadOnlyView(graph)
    // collect the temporary group nodes inserted by TemporaryGroupNodeInsertionStage earlier
    // and the respective original tree node
    const temporaryGroups = graph.nodes
      .filter((n) => isInsertedTmpGroupDp.get(n))
      .map((tmpGroup) => {
        const child = grouping.getChildren(tmpGroup).find((n) => !isInsertedTmpGroupDp.get(n))
        const originalTreeNode = graph.nodes.find(
          (n) => innerNodesDp.get(n) === childNode2DescriptorDp.get(child)
        )
        return { group: tmpGroup, treeNode: originalTreeNode }
      })
      .toArray()
    // pre-processing: transfer data from original tree node to temporary group node
    for (const group of temporaryGroups) {
      const groupNode = group.group
      const treeNode = group.treeNode
      // transfer sketch (size and location) from the original tree node to the temporary group
      groupNode.layout.width = treeNode.layout.width
      groupNode.layout.height = treeNode.layout.height
      groupNode.layout.center = treeNode.layout.center
      // change edges such that they connect to the group node (if there are any)
      for (const edge of treeNode.edges.toArray()) {
        const atSource = edge.source == treeNode
        const other = edge.opposite(treeNode)
        graph.changeEdge(edge, atSource ? groupNode : other, atSource ? other : groupNode)
      }
    }
    // now hide all the tree node, they are now modeled by the inserted temporary group nodes
    const treeNodeHider = new LayoutGraphHider(graph)
    for (const group of temporaryGroups) {
      treeNodeHider.hide(group.treeNode)
    }
    // apply the radial group layout
    this.coreLayout.applyLayout(graph)
    // un-hide all the hidden tree nodes
    treeNodeHider.unhideAll()
    // post-processing: transfer from temporary group node to original tree node
    for (const group of temporaryGroups) {
      const groupNode = group.group
      const treeNode = group.treeNode
      // transfer size and location
      treeNode.layout.width = groupNode.layout.width
      treeNode.layout.height = groupNode.layout.height
      treeNode.layout.center = groupNode.layout.center
      // change edges such that they again connect to the original tree nodes
      for (const edge of groupNode.edges.toArray()) {
        const atSource = edge.source == groupNode
        const other = edge.opposite(groupNode)
        graph.changeEdge(edge, atSource ? treeNode : other, atSource ? other : treeNode)
      }
    }
  }
}
/**
 * @yjs:keep = c
 */
function initializeStyles() {
  aggregationNodeStyle = new LitNodeStyle(({ layout, tag }) => {
    const fillColor =
      tag.aggregate.node?.tag.c ??
      (tag.isAggregated ? 'rgba(108,145,191,0.16)' : 'rgba(108,145,191,0.13)')
    const plus = 'M 0 -7 L 0 7 M -7 0 L 7 0'
    const minus = 'M -5 0 L 5 0'
    return svg`<ellipse cx='${layout.width * 0.5}' cy='${layout.height * 0.5}'
    rx='${layout.width * 0.5}' ry='${layout.height * 0.5}'
    stroke='${tag.aggregate.node ? '#696969' : 'rgba(0,0,0,0.45)'}'
    stroke-dasharray='${tag.aggregate.node ? '' : '2,2'}' stroke-width='1.5'
    fill='${fillColor}' style='cursor: pointer'/>
    <path d='${tag.isAggregated ? plus : minus}' stroke='#4B4B4B' stroke-width='1.5'
     transform='translate(${layout.width * 0.5} ${layout.height * 0.5})'/>`
  })
  const outline = new GeneralPath()
  outline.appendEllipse(new Rect(0, 0, 1, 1), false)
  aggregationNodeStyle.normalizedOutline = outline
  hierarchyEdgeStyle = new BezierEdgeStyle({
    stroke: 'dashed #00000073',
    targetArrow: new Arrow({ type: ArrowType.OPEN, stroke: '#00000073' })
  })
  descendantLabelStyle = new LabelStyle({
    textFill: '#00000080',
    textSize: 10
  })
}
/**
 * Switches the visibility of hierarchy edges by setting either the default hierarchy edge
 * style or a void edge style that does not visualize the edge.
 */
function switchHierarchyEdgeVisibility(graph, visible) {
  for (const edge of graph.edges) {
    if (aggregationHelper.isHierarchyEdge(edge)) {
      if (visible && edge.style !== hierarchyEdgeStyle) {
        graph.setStyle(edge, hierarchyEdgeStyle)
      } else if (!visible && edge.style !== IEdgeStyle.VOID_EDGE_STYLE) {
        graph.setStyle(edge, IEdgeStyle.VOID_EDGE_STYLE)
      }
    }
  }
}
/**
 * Enables/disables the UI.
 */
function setUiDisabled(disabled) {
  return new Promise((resolve) => {
    document.querySelector('#calculating-indicator').style.display = !disabled ? 'none' : 'block'
    document.querySelector('#aggregation-mode-select').disabled = disabled
    document.querySelector('#maximum-duration-range').disabled = disabled
    document.querySelector('#minimum-cluster-size-range').disabled = disabled
    document.querySelector('#maximum-cluster-size-range').disabled = disabled
    graphComponent.inputMode.waitInputMode.waiting = disabled
    document.querySelector('#run-aggregation').disabled = disabled
    // enable switching to filtered view only if there are some real edges in the graph
    // otherwise the graph in filtered view will be empty
    document.querySelector('#switch-view').disabled =
      disabled ||
      graphComponent.graph.nodes.every((node) =>
        aggregationHelper.aggregateGraph.isAggregationItem(node)
      )
    setTimeout(resolve, 0)
  })
}
/**
 * Creates an initial sample graph.
 */
function loadGraph(graph) {
  // set default styles that are applied to the loaded graph
  graph.nodeDefaults.size = new Size(30, 30)
  const nodeStyle = new LitNodeStyle(
    ({ layout, tag }) => svg`<ellipse cx='${layout.width * 0.5}' cy='${layout.height * 0.5}'
    rx='${layout.width * 0.5}' ry='${layout.height * 0.5}'
    stroke='#696969' fill='${tag.c}'/>`
  )
  const outline = new GeneralPath()
  outline.appendEllipse(new Rect(0, 0, 1, 1), false)
  nodeStyle.normalizedOutline = outline
  graph.nodeDefaults.style = nodeStyle
  graph.nodeDefaults.labels.style = new LabelStyle({
    textFill: '#4b4b4b',
    textSize: 10
  })
  graph.edgeDefaults.style = new BezierEdgeStyle({
    stroke: '#696969'
  })
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.CENTER
  // build the graph from json-data
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder.createNodesSource({
    data: SampleGraph.nodes,
    id: 'id',
    labels: ['l']
  })
  graphBuilder.createEdgesSource(SampleGraph.edges, 's', 't', 'id')
  return graphBuilder.buildGraph()
}
/**
 * Updates the info panels.
 */
function onInfoPanelPropertiesChanged() {
  const originalNodesElement = document.querySelector('#original-nodes')
  originalNodesElement.innerText = `${aggregationHelper ? aggregationHelper.visibleNodes : 0} / ${originalGraph.nodes.size}`
  const originalEdgesElement = document.querySelector('#original-edges')
  originalEdgesElement.innerText = `${aggregationHelper ? aggregationHelper.visibleEdges : 0} / ${originalGraph.edges.size}`
  const currentItem = graphComponent.currentItem
  const nodeLabel = currentItem instanceof ILabelOwner ? currentItem.labels.at(0) : null
  const nodeName = nodeLabel ? nodeLabel.text.replace('\n', ' ') : ''
  const currentItemElement = document.querySelector('#current-item')
  currentItemElement.innerText = nodeName
  currentItemElement.style.display = nodeName !== '' ? 'block' : 'none'
  let aggregate = null
  if (aggregationHelper && graphComponent.currentItem instanceof INode) {
    aggregate = aggregationHelper.getAggregateForNode(graphComponent.currentItem)
  }
  const descendantCountElement = document.querySelector('#descendant-count')
  descendantCountElement.innerText = aggregate ? aggregate.descendantCount.toString() : '0'
  const descendantWeightSumElement = document.querySelector('#descendant-weight-sum')
  descendantWeightSumElement.innerText = aggregate
    ? (aggregate.descendantWeightSum + Number.EPSILON).toFixed(2)
    : '0'
  // enable switching to filtered view only if there are some real edges in the graph
  // otherwise the graph in filtered view will be empty
  document.querySelector('#switch-view').disabled = graphComponent.graph.nodes.every((node) =>
    aggregationHelper.aggregateGraph.isAggregationItem(node)
  )
}
/**
 * A LayoutExecutor that modifies the viewport animation to zoom to a list of nodes.
 */
class ZoomToNodesLayoutExecutor extends LayoutExecutor {
  nodes
  constructor(nodes, graphComponent, layout) {
    super(graphComponent, layout)
    this.nodes = nodes
  }
  createViewportAnimation(targetBounds) {
    if (this.nodes.size === 0) {
      return super.createViewportAnimation(targetBounds)
    }
    if (!this.nodes.every((node) => this.graph.contains(node))) {
      throw new Error('Cannot zoom to nodes that are not in the graph')
    }
    const layoutNodes = this.nodes.map((node) => this.adapter.getLayoutNode(node))
    const bounds = this.adapter.layoutGraph.getBounds(layoutNodes)
    const viewportAnimation = new ViewportAnimation(
      this.graphComponent,
      bounds,
      this.animationDuration
    )
    viewportAnimation.targetMargins = new Insets(20, 36, 36, 20)
    viewportAnimation.maximumTargetZoom = 1
    return viewportAnimation
  }
}
/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI() {
  document.querySelector('#maximum-duration-range').addEventListener('change', (evt) => {
    const stopDurationLabel = document.querySelector('#stop-duration-label')
    stopDurationLabel.innerText = evt.target.value
  })
  document.querySelector('#minimum-cluster-size-range').addEventListener('change', (evt) => {
    const minimumClusterSizeLabel = document.querySelector('#minimum-cluster-size-label')
    minimumClusterSizeLabel.innerText = evt.target.value
  })
  document.querySelector('#maximum-cluster-size-range').addEventListener('change', (evt) => {
    const maximumClusterSizeLabel = document.querySelector('#maximum-cluster-size-label')
    maximumClusterSizeLabel.innerText = evt.target.value
  })
  document.querySelector('#run-aggregation').addEventListener('click', runAggregation)
  document.querySelector('#switch-view').addEventListener('click', switchView)
  document.querySelector('#layout-style-select').addEventListener('change', runAggregation)
}
run().then(finishLoading)
