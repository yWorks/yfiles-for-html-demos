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
  AdjacencyTypes,
  Arrow,
  ArrowType,
  BalloonLayout,
  BezierEdgeStyle,
  CactusGroupLayout,
  CircularLayout,
  Color,
  DataProviders,
  DefaultGraph,
  DefaultLabelStyle,
  EdgeBundleDescriptor,
  FilteredGraphWrapper,
  FreeNodeLabelModel,
  GeneralPath,
  GraphBuilder,
  GraphComponent,
  GraphFocusIndicatorManager,
  GraphHighlightIndicatorManager,
  GraphItemTypes,
  GraphOverviewComponent,
  GraphSelectionIndicatorManager,
  GraphViewerInputMode,
  HoveredItemChangedEventArgs,
  IAnimation,
  IEdge,
  IGraph,
  ILabelOwner,
  ILayoutAlgorithm,
  IListEnumerable,
  IModelItem,
  IndicatorEdgeStyleDecorator,
  IndicatorNodeStyleDecorator,
  INode,
  Insets,
  InterleavedMode,
  ItemClickedEventArgs,
  Key,
  KeyEventArgs,
  LayoutExecutor,
  LayoutGraph,
  LayoutGraphHider,
  LayoutGroupingSupport,
  LayoutStageBase,
  License,
  NodeAggregation,
  NodeAggregationPolicy,
  NodeAggregationResult,
  NodeLabelingPolicy,
  Point,
  PropertyChangedEventArgs,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  SolidColorFill,
  StringTemplateNodeStyle,
  Stroke,
  TemporaryGroupDescriptor,
  TemporaryGroupNodeInsertionData,
  TemporaryGroupNodeInsertionStage,
  TimeSpan,
  TreeReductionStage,
  TreeReductionStageData,
  ViewportAnimation,
  VoidEdgeStyle,
  VoidNodeStyle,
  YRectangle
} from 'yfiles'

import { AggregationHelper, AggregationNodeInfo } from './AggregationHelper.js'
import { AggregationGraphWrapper, EdgeReplacementPolicy } from 'demo-utils/AggregationGraphWrapper'
import SampleGraph from './resources/SampleGraph.js'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * The original graph before aggregation.
 * @type {IGraph}
 */
let originalGraph = null

/**
 * Encapsulates aggregation and separation methods.
 * @type {AggregationHelper}
 */
let aggregationHelper = null

/** @type {GraphViewerInputMode} */
let graphViewerInputMode = null
/** @type {StringTemplateNodeStyle} */
let aggregationNodeStyle = null
/** @type {BezierEdgeStyle} */
let hierarchyEdgeStyle = null
/** @type {DefaultLabelStyle} */
let descendantLabelStyle = null

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
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
 * Registers a listener to the {@link GraphViewerInputMode.addItemClickedListener ItemClicked} event that toggles the aggregation of a node, runs a layout and sets the current item.
 */
function initializeToggleAggregation() {
  graphViewerInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    focusableItems: GraphItemTypes.NODE
  })
  graphViewerInputMode.addItemClickedListener((_, evt) => {
    if (!(evt.item instanceof INode)) {
      return
    }
    // prevent default behavior, which would select nodes that are no longer in the graph
    evt.handled = true

    toggleAggregationNode(evt.item)
  })
  graphComponent.inputMode = graphViewerInputMode

  graphComponent.addKeyUpListener((_, evt) => {
    if (evt.key === Key.ENTER) {
      toggleAggregationNode(graphComponent.currentItem)
    }
  })
  graphComponent.addCurrentItemChangedListener((_, evt) => {
    onInfoPanelPropertiesChanged()
  })
}

/**
 * Toggles the aggregation of a node, runs a layout and sets the current item.
 * @param {!INode} node
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
  graphComponent.currentItem = affectedNodes.get(0)

  // run layout
  runLayoutOnHierarchyView(affectedNodes)
}

/**
 * Initializes the input mode for this component.
 */
function initializeSmartNavigation() {
  // Implements the smart click navigation
  graphComponent.inputMode.addItemClickedListener((_, evt) => {
    if (evt.item instanceof IEdge) {
      evt.handled = true
      zoomToLocation(evt.item, evt.location)
    }
  })
}

/**
 * Zooms to the suitable point.
 * @param {!IEdge} edge The element that we clicked.
 * @param {!Point} currentMouseClickLocation The arguments that is used by the event.
 */
function zoomToLocation(edge, currentMouseClickLocation) {
  // Get the point where we should zoom in
  const location = getFocusPoint(edge)
  // The distance between where we clicked and the viewport center
  const offset = currentMouseClickLocation.subtract(graphComponent.viewport.center)
  // Zooms to the new location of the mouse
  graphComponent.zoomToAnimated(location.subtract(offset), graphComponent.zoom)
}

/**
 * Gets the focus point.
 * @param {!IEdge} edge The element that we clicked.
 * @returns {!Point} The point that we should zoom to.
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
  // if there are other items (most importantly labels) in front of edges or nodes
  // they should be discarded, rather than be reported as "null"
  graphViewerInputMode.itemHoverInputMode.discardInvalidItems = false
  // whenever the currently hovered item changes call our method
  graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener((inputMode, evt) => {
    onHoveredItemChanged(inputMode, evt)
  })
}

/**
 * @param {!object} sender
 * @param {!HoveredItemChangedEventArgs} evt
 */
function onHoveredItemChanged(sender, evt) {
  // first remove previous highlights
  graphComponent.highlightIndicatorManager.clearHighlights()
  // then see where we are hovering over, now
  const newItem = evt.item
  if (newItem) {
    // we highlight the item itself
    const node = newItem instanceof INode ? newItem : null
    const edge = newItem instanceof IEdge ? newItem : null
    if (node && aggregationHelper.isOriginalNodeOrPlaceHolder(node)) {
      addHighlight(node)
      // and if it's a node, we highlight all adjacent edges, too
      graphComponent.graph.edgesAt(node, AdjacencyTypes.ALL).forEach(adjacentEdge => {
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

/**
 * @param {!(INode|IEdge)} item
 */
function addHighlight(item) {
  if (
    (item instanceof INode && aggregationHelper.isOriginalNodeOrPlaceHolder(item)) ||
    (item instanceof IEdge && !aggregationHelper.isHierarchyEdge(item))
  ) {
    graphComponent.highlightIndicatorManager.addHighlight(item)
  }
}

function initializeHighlightStyles() {
  // we want to create a non-default nice highlight styling
  // for the hover highlight, create semi transparent orange stroke first
  const orangeRed = Color.ORANGE
  const orangePen = new Stroke(
    new SolidColorFill(Color.fromArgb(220, orangeRed.r, orangeRed.g, orangeRed.b)),
    3
  ).freeze()

  // now set the custom hover highlight styles for the nodes and edges

  // hide the default selection indicator
  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })

  // nodes should be given a rectangular orange rectangle highlight shape
  const highlightNodeStyle = new IndicatorNodeStyleDecorator({
    wrapped: new ShapeNodeStyle({
      shape: ShapeNodeShape.ELLIPSE,
      stroke: orangePen,
      fill: null
    }),
    padding: new Insets(5)
  })
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: new ShapeNodeStyle({
      shape: 'ellipse',
      fill: null,
      stroke: '1.5px dashed #696969'
    })
  })

  // a similar style for the edges, however cropped by the highlight's insets
  const dummyCroppingArrow = new Arrow({
    type: ArrowType.NONE,
    cropLength: 5
  })
  const highlightEdgeStyle = new IndicatorEdgeStyleDecorator({
    wrapped: new BezierEdgeStyle({
      stroke: orangePen,
      targetArrow: dummyCroppingArrow,
      sourceArrow: dummyCroppingArrow
    })
  })
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    nodeStyle: highlightNodeStyle,
    edgeStyle: highlightEdgeStyle
  })
}

/**
 * Runs the smart {@link NodeAggregation} algorithm with the settings from the properties panel.
 * @returns {!Promise}
 */
async function runAggregation() {
  await setUiDisabled(true)

  graphComponent.graph = new DefaultGraph()
  aggregationHelper.aggregateGraph.dispose()
  await runAggregationAndReplaceGraph(originalGraph)

  document.querySelector('#switch-view').innerText = 'Switch To Filtered View'

  await setUiDisabled(false)

  onInfoPanelPropertiesChanged()
}

/**
 * Switches between the view with hierarchy nodes and without and runs an appropriate layout.
 * @returns {!Promise}
 */
async function switchView() {
  const switchViewButton = document.querySelector('#switch-view')
  if (graphComponent.graph instanceof AggregationGraphWrapper) {
    graphComponent.graph = createFilteredView()
    await runCircularLayout()
    switchViewButton.innerText = 'Switch To Hierarchic View'
  } else {
    graphComponent.graph = aggregationHelper.aggregateGraph
    await runLayoutOnHierarchyView()
    switchViewButton.innerText = 'Switch To Filtered View'
  }
}

/**
 * Creates a new {@link FilteredGraphWrapper} that shows the currently visible original nodes.
 * Nodes without currently visible edges are also filtered out.
 * @returns {!FilteredGraphWrapper}
 */
function createFilteredView() {
  // create a new FilteredGraphWrapper that filters the original graph and shows only the currently visible nodes
  const filteredGraph = new FilteredGraphWrapper(
    originalGraph,
    node => {
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
    filteredGraph.setLabelLayoutParameter(
      label,
      FreeNodeLabelModel.INSTANCE.createDefaultParameter()
    )
  }

  return filteredGraph
}

/**
 * Creates a new {@link AggregationGraphWrapper} and runs the aggregation algorithm.
 * @param {!IGraph} originalGraph
 * @returns {!Promise}
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
 * @param {!IGraph} originalGraph
 * @param {!AggregationGraphWrapper} aggregateGraph
 * @returns {!Promise}
 */
async function applyAggregation(originalGraph, aggregateGraph) {
  return new Promise(resolve => {
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

/**
 * @returns {!NodeAggregation}
 */
function createConfiguredAggregation() {
  const aggregationMode = document.querySelector('#aggregation-mode-select').value
  const maximumDuration = document.querySelector('#maximum-duration-range').value
  const minimumClusterSize = document.querySelector('#minimum-cluster-size-range').value
  const maximumClusterSize = document.querySelector('#maximum-cluster-size-range').value
  return new NodeAggregation({
    aggregation:
      aggregationMode === 'structural'
        ? NodeAggregationPolicy.STRUCTURAL
        : NodeAggregationPolicy.GEOMETRIC,
    maximumDuration: TimeSpan.fromSeconds(parseFloat(maximumDuration)),
    minimumClusterSize: parseInt(minimumClusterSize),
    maximumClusterSize: parseInt(maximumClusterSize),
    nodesOnlyOnLeaves: false
  })
}

/**
 * Runs a layout on the hierarchy view.
 * @param {!IListEnumerable.<INode>} [affectedNodes]
 * @returns {!Promise}
 */
async function runLayoutOnHierarchyView(affectedNodes) {
  return document.querySelector('#layout-style-select').value === 'cactus'
    ? runCactusLayout(affectedNodes)
    : runBalloonLayout(affectedNodes)
}

/**
 * Runs a {@link BalloonLayout} where the hierarchy edges are the tree edges and original edges are bundled.
 * @param {!IListEnumerable.<INode>} [affectedNodes]
 * @returns {!Promise}
 */
async function runBalloonLayout(affectedNodes) {
  switchHierarchyEdgeVisibility(graphComponent.graph, true)

  // create the balloon layout
  const layout = new BalloonLayout({
    integratedNodeLabeling: true,
    nodeLabelingPolicy: NodeLabelingPolicy.RAY_LIKE_LEAVES,
    fromSketchMode: true,
    compactnessFactor: 0.1,
    allowOverlaps: true
  })
  // prepend a TreeReduction stage with the hierarchy edges as tree edges
  const treeReductionStage = new TreeReductionStage()
  treeReductionStage.nonTreeEdgeRouter = treeReductionStage.createStraightLineRouter()
  treeReductionStage.edgeBundling.bundlingStrength = 1
  layout.prependStage(treeReductionStage)
  const nonTreeEdges = graphComponent.graph.edges
    .filter(e => !aggregationHelper.isHierarchyEdge(e))
    .toList()

  const treeReductionStageData = new TreeReductionStageData({
    nonTreeEdges: nonTreeEdges,
    edgeBundleDescriptors: edge => {
      return new EdgeBundleDescriptor({
        bundled: nonTreeEdges.includes(edge),
        bezierFitting: true
      })
    }
  })

  // create a layout executor that also zooms to all nodes that were affected by the last operation
  const layoutExecutor = new ZoomToNodesLayoutExecutor(
    affectedNodes || IListEnumerable.EMPTY,
    graphComponent,
    layout
  )
  layoutExecutor.duration = TimeSpan.fromSeconds(0.5)
  layoutExecutor.animateViewport = true
  layoutExecutor.easedAnimation = true
  layoutExecutor.layoutData = treeReductionStageData
  await layoutExecutor.start()
}

/**
 * @returns {!Promise}
 */
async function runCircularLayout() {
  const circularLayout = new CircularLayout()
  circularLayout.balloonLayout.interleavedMode = InterleavedMode.ALL_NODES
  await graphComponent.morphLayout(circularLayout, '0.5s')
}

/**
 * Runs a {@link CactusGroupLayout} where the hierarchy edges are not shown but the hierarchy is
 * visualized by placing child nodes along the circular border of the parent node.
 * The original edges are drawn in a bundled style.
 *
 * The approach uses {@link TemporaryGroupNodeInsertionStage} and some custom layout stage code
 * to temporarily represent inner tree nodes (which have successors) as group nodes with children.
 * This is required because the cactus layout works on hierarchical grouping structures as
 * input and not on tree graph structures.
 * @param {!IListEnumerable.<INode>} [affectedNodes]
 * @returns {!Promise}
 */
async function runCactusLayout(affectedNodes) {
  const graph = graphComponent.graph
  switchHierarchyEdgeVisibility(graph, false)

  // collect hierarchy tree nodes that have children, which must temporarily be modeled as a groups
  const innerTreeNodes = []
  const innerTreeNode2Descriptor = new Map()
  for (const node of graph.nodes) {
    if (graph.outEdgesAt(node).some(e => aggregationHelper.isHierarchyEdge(e))) {
      innerTreeNodes.push(node)
      innerTreeNode2Descriptor.set(node, new TemporaryGroupDescriptor())
    }
  }

  // prepare the layout data for the TemporaryGroupNodeInsertionStage
  const tmpGroupStageData = new TemporaryGroupNodeInsertionData()
  for (const treeNode of innerTreeNodes) {
    const descriptor = innerTreeNode2Descriptor.get(treeNode)

    // register a temporary group for each inner tree node...
    const temporaryGroup = tmpGroupStageData.temporaryGroups.add(descriptor)
    // ... members of the group are all the successor nodes
    temporaryGroup.source = graph
      .outEdgesAt(treeNode)
      .filter(e => aggregationHelper.isHierarchyEdge(e))
      .map(e => e.targetNode)

    // if the tree node has a parent too, then the parent descriptor must be setup as well
    const inEdge = graph
      .inEdgesAt(treeNode)
      .filter(e => aggregationHelper.isHierarchyEdge(e))
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
  const innerNodesMapper = graph.mapperRegistry.createDelegateMapper(
    INode.$class,
    TemporaryGroupDescriptor.$class,
    'INNER_TREE_NODES',
    n => {
      if (innerTreeNode2Descriptor.has(n)) {
        return innerTreeNode2Descriptor.get(n)
      }
      return null
    }
  )

  // create a layout executor that also zooms to all nodes that were affected by the last operation
  const layoutExecutor = new ZoomToNodesLayoutExecutor(
    affectedNodes || IListEnumerable.EMPTY,
    graphComponent,
    new CustomCactusLayoutStage()
  )
  layoutExecutor.duration = TimeSpan.fromSeconds(0.5)
  layoutExecutor.animateViewport = true
  layoutExecutor.easedAnimation = true
  layoutExecutor.layoutData = tmpGroupStageData
  await layoutExecutor.start()

  // clean-up the mapper registered earlier
  graph.mapperRegistry.removeMapper(innerNodesMapper)
}

/**
 * A layout stage that configures and applies the {@link CactusGroupLayout} and uses further
 * stages to make the input suitable for it.
 */
class CustomCactusLayoutStage extends LayoutStageBase {
  /**
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    if (graph.nodeCount < 2) {
      // single node or no node: nothing to do for the layout
      return
    }

    // configure the cactus group layout
    const cactus = new CactusGroupLayout({
      fromSketchMode: true,
      preferredRootWedge: 360,
      integratedNodeLabeling: true,
      nodeLabelingPolicy: NodeLabelingPolicy.RAY_LIKE_LEAVES
    })
    // ... configure bundling
    cactus.edgeBundling.defaultBundleDescriptor.bundled = true
    cactus.edgeBundling.defaultBundleDescriptor.bezierFitting = true

    // ... configure the parent-child overlap ratio so that they are allowed to overlap a bit
    graph.addDataProvider(
      CactusGroupLayout.PARENT_OVERLAP_RATIO_DP_KEY,
      DataProviders.createConstantDataProvider(0.5)
    )

    // apply the cactus group layout with temporary groups
    new TemporaryGroupNodeInsertionStage(new TemporaryGroupCustomizationStage(cactus)).applyLayout(
      graph
    )

    // clean-up
    graph.removeDataProvider(CactusGroupLayout.PARENT_OVERLAP_RATIO_DP_KEY)
  }
}

/**
 * A layout stage that prepares the temporary group nodes inserted by
 * {@link TemporaryGroupDescriptor} for the {@link CactusGroupLayout} algorithm.
 */
class TemporaryGroupCustomizationStage extends LayoutStageBase {
  /**
   * @param {!CactusGroupLayout} cactus
   */
  constructor(cactus) {
    super(cactus)
  }

  /**
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    const innerNodesDp = graph.getDataProvider('INNER_TREE_NODES')
    const isInsertedTmpGroupDp = graph.getDataProvider(
      TemporaryGroupNodeInsertionStage.INSERTED_GROUP_NODE_DP_KEY
    )
    const childNode2DescriptorDp = graph.getDataProvider(
      TemporaryGroupNodeInsertionStage.TEMPORARY_GROUP_DESCRIPTOR_DP_KEY
    )
    const grouping = new LayoutGroupingSupport(graph)

    // collect the temporary group nodes inserted by TemporaryGroupNodeInsertionStage earlier
    // and the respective original tree node
    const temporaryGroups = graph.nodes
      .filter(n => isInsertedTmpGroupDp.getBoolean(n))
      .map(tmpGroup => {
        const child = grouping.getChildren(tmpGroup).firstNode()
        const originalTreeNode = graph.nodes.find(
          n => innerNodesDp.get(n) === childNode2DescriptorDp.get(child)
        )
        return { group: tmpGroup, treeNode: originalTreeNode }
      })
      .toArray()
    grouping.dispose()

    // pre-processing: transfer data from original tree node to temporary group node
    for (const group of temporaryGroups) {
      const groupNode = group.group
      const treeNode = group.treeNode

      // transfer sketch (size and location) from the original tree node to the temporary group
      graph.setSize(groupNode, graph.getSize(treeNode))
      graph.setCenter(groupNode, graph.getCenter(treeNode))

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

    // apply the cactus layout
    super.applyLayoutCore(graph)

    // un-hide all the hidden tree nodes
    treeNodeHider.unhideAll()

    // post-processing: transfer from temporary group node to original tree node
    for (const group of temporaryGroups) {
      const groupNode = group.group
      const treeNode = group.treeNode

      // transfer size and location
      graph.setSize(treeNode, graph.getSize(groupNode))
      graph.setLocation(treeNode, graph.getLocation(groupNode))

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
  StringTemplateNodeStyle.CONVERTERS.radius = diameter => diameter * 0.5
  StringTemplateNodeStyle.CONVERTERS.sign = aggregated =>
    aggregated ? 'M 0 -7 L 0 7 M -7 0 L 7 0' : 'M -5 0 L 5 0'
  StringTemplateNodeStyle.CONVERTERS.centered = bounds =>
    `translate(${bounds.width * 0.5},${bounds.height * 0.5})`
  StringTemplateNodeStyle.CONVERTERS.fillColor = (info, parameter) => {
    if (!info || !parameter) {
      return null
    }

    const aggregationInfo = info
    if (aggregationInfo.aggregate.node) {
      return aggregationInfo.aggregate.node.tag.c
    }

    const defaultColors = parameter.split('|')
    return aggregationInfo.isAggregated ? defaultColors[0] : defaultColors[1]
  }
  StringTemplateNodeStyle.CONVERTERS.strokeColor = (info, parameter) => {
    if (!info || !parameter) {
      return null
    }

    if (info.aggregate.node) {
      return '#696969'
    }

    return parameter
  }
  StringTemplateNodeStyle.CONVERTERS.strokeStyle = info => {
    const aggregationInfo = info
    if (aggregationInfo && aggregationInfo.aggregate.node) {
      return ''
    }

    return '2,2'
  }

  const templateString = `<ellipse cx='{TemplateBinding width, Converter=radius}'
        cy='{TemplateBinding height, Converter=radius}'
        rx='{TemplateBinding width, Converter=radius}'
        ry='{TemplateBinding height, Converter=radius}'
        stroke='{Binding, Converter=strokeColor, Parameter=rgba(0,0,0,0.45)}' stroke-dasharray='{Binding, Converter=strokeStyle}' stroke-width='1.5'
        fill='{Binding, Converter=fillColor, Parameter=rgba(108,145,191,0.16)|rgba(108,145,191,0.13)}' style='cursor: pointer'/>
      <path d='{Binding isAggregated, Converter=sign}' stroke='#4B4B4B' stroke-width='1.5' transform='{TemplateBinding bounds, Converter=centered}'/>`

  const outline = new GeneralPath()
  outline.appendEllipse(new Rect(0, 0, 1, 1), false)

  aggregationNodeStyle = new StringTemplateNodeStyle({
    svgContent: templateString,
    normalizedOutline: outline
  })
  hierarchyEdgeStyle = new BezierEdgeStyle({
    stroke: 'dashed #73000000',
    targetArrow: new Arrow({ type: ArrowType.SIMPLE, stroke: '#73000000' })
  })
  descendantLabelStyle = new DefaultLabelStyle({
    textFill: '#80000000',
    textSize: 10
  })
}

/**
 * Switches the visibility of hierarchy edges by setting either the default hierarchy edge
 * style or a void edge style that does not visualize the edge.
 * @param {!IGraph} graph
 * @param {boolean} visible
 */
function switchHierarchyEdgeVisibility(graph, visible) {
  for (const edge of graph.edges) {
    if (aggregationHelper.isHierarchyEdge(edge)) {
      if (visible && edge.style !== hierarchyEdgeStyle) {
        graph.setStyle(edge, hierarchyEdgeStyle)
      } else if (!visible && edge.style !== VoidEdgeStyle.INSTANCE) {
        graph.setStyle(edge, VoidEdgeStyle.INSTANCE)
      }
    }
  }
}

/**
 * Enables/disables the UI.
 * @param {boolean} disabled
 * @returns {!Promise}
 */
function setUiDisabled(disabled) {
  return new Promise(resolve => {
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
      graphComponent.graph.nodes.every(node =>
        aggregationHelper.aggregateGraph.isAggregationItem(node)
      )

    setTimeout(resolve, 0)
  })
}

/**
 * Creates an initial sample graph.
 * @param {!IGraph} graph
 * @returns {!IGraph}
 */
function loadGraph(graph) {
  // set default styles that are applied to the loaded graph
  const outline = new GeneralPath()
  outline.appendEllipse(new Rect(0, 0, 1, 1), false)
  graph.nodeDefaults.size = new Size(30, 30)
  graph.nodeDefaults.style = new StringTemplateNodeStyle({
    svgContent:
      '<ellipse rx="{TemplateBinding width, Converter=radius}" ry="{TemplateBinding height, Converter=radius}" ' +
      'cx="{TemplateBinding width, Converter=radius}" cy="{TemplateBinding height, Converter=radius}" ' +
      'fill="{Binding c}" stroke="#696969"/>',
    normalizedOutline: outline
  })
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    textFill: '#4b4b4b',
    textSize: 10
  })
  graph.edgeDefaults.style = new BezierEdgeStyle({
    stroke: '#696969'
  })
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()

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
  originalNodesElement.innerText = `${aggregationHelper ? aggregationHelper.visibleNodes : 0} / ${
    originalGraph.nodes.size
  }`
  const originalEdgesElement = document.querySelector('#original-edges')
  originalEdgesElement.innerText = `${aggregationHelper ? aggregationHelper.visibleEdges : 0} / ${
    originalGraph.edges.size
  }`
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
  document.querySelector('#switch-view').disabled = graphComponent.graph.nodes.every(node =>
    aggregationHelper.aggregateGraph.isAggregationItem(node)
  )
}

/**
 * A LayoutExecutor that modifies the viewport animation to zoom to a list of nodes.
 */
class ZoomToNodesLayoutExecutor extends LayoutExecutor {
  nodes

  /**
   * @param {!IListEnumerable.<INode>} nodes
   * @param {!GraphComponent} graphComponent
   * @param {!ILayoutAlgorithm} layout
   */
  constructor(nodes, graphComponent, layout) {
    super(graphComponent, layout)
    this.nodes = nodes
  }

  /**
   * @param {!Rect} targetBounds
   * @returns {!IAnimation}
   */
  createViewportAnimation(targetBounds) {
    if (this.nodes.size === 0) {
      return super.createViewportAnimation(targetBounds)
    }

    if (!this.nodes.every(node => this.graph.contains(node))) {
      throw new Error('Cannot zoom to nodes that are not in the graph')
    }

    const layoutGraph = this.layoutGraph
    const bounds = this.nodes
      .map(node => layoutGraph.getBoundingBox(layoutGraph.getCopiedNode(node)))
      .reduce((acc, current) => Rect.add(acc, current.toRect()), Rect.EMPTY)

    const viewportAnimation = new ViewportAnimation(this.graphComponent, bounds, this.duration)
    viewportAnimation.targetViewMargins = new Insets(20, 20, 36, 36)
    viewportAnimation.maximumTargetZoom = 1
    return viewportAnimation
  }
}

/**
 * Binds the buttons in the toolbar to their functionality.
 */
function initializeUI() {
  document.querySelector('#maximum-duration-range').addEventListener('change', evt => {
    const maximumDurationLabel = document.querySelector('#maximum-duration-label')
    maximumDurationLabel.innerText = evt.target.value
  })
  document.querySelector('#minimum-cluster-size-range').addEventListener('change', evt => {
    const minimumClusterSizeLabel = document.querySelector('#minimum-cluster-size-label')
    minimumClusterSizeLabel.innerText = evt.target.value
  })
  document.querySelector('#maximum-cluster-size-range').addEventListener('change', evt => {
    const maximumClusterSizeLabel = document.querySelector('#maximum-cluster-size-label')
    maximumClusterSizeLabel.innerText = evt.target.value
  })
  document.querySelector('#run-aggregation').addEventListener('click', runAggregation)
  document.querySelector('#switch-view').addEventListener('click', switchView)
  document.querySelector('#layout-style-select').addEventListener('change', runAggregation)
}

run().then(finishLoading)
