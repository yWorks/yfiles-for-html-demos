/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CircularLayout,
  Color,
  DefaultGraph,
  DefaultLabelStyle,
  EdgeBundleDescriptor,
  EdgeStyleDecorationInstaller,
  FilteredGraphWrapper,
  FreeNodeLabelModel,
  GeneralPath,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphOverviewComponent,
  GraphViewerInputMode,
  HoveredItemChangedEventArgs,
  IAnimation,
  ICommand,
  IEdge,
  IGraph,
  ILabelOwner,
  ILayoutAlgorithm,
  IListEnumerable,
  IModelItem,
  INode,
  Insets,
  InterleavedMode,
  ItemClickedEventArgs,
  Key,
  KeyEventArgs,
  LayoutExecutor,
  License,
  NodeAggregation,
  NodeAggregationPolicy,
  NodeAggregationResult,
  NodeLabelingPolicy,
  NodeStyleDecorationInstaller,
  Point,
  PropertyChangedEventArgs,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  SolidColorFill,
  StringTemplateNodeStyle,
  Stroke,
  StyleDecorationZoomPolicy,
  TimeSpan,
  TreeReductionStage,
  TreeReductionStageData,
  ViewportAnimation,
  YRectangle
} from 'yfiles'

import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { AggregationHelper, AggregationNodeInfo } from './AggregationHelper.js'
import {
  AggregationGraphWrapper,
  EdgeReplacementPolicy
} from '../../utils/AggregationGraphWrapper.js'
import SampleGraph from './resources/SampleGraph.js'

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

const calculatingIndicator = document.getElementById('calculating-indicator')
const switchViewButton = document.getElementById('switch-view')
const runButton = document.getElementById('run-aggregation')
const aggregationModeSelect = document.getElementById('aggregation-mode-select')
const maximumDurationRange = document.getElementById('maximum-duration-range')
const minimumClusterSizeRange = document.getElementById('minimum-cluster-size-range')
const maximumClusterSizeRange = document.getElementById('maximum-cluster-size-range')

/**
 * Bootstraps the demo.
 * @param {!object} licenseData
 * @returns {!Promise}
 */
async function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')
  const overviewComponent = new GraphOverviewComponent('#overviewComponent', graphComponent)

  // initialize node click listener that toggles the aggregation status
  initializeToggleAggregation()

  // initialize navigation along edges connecting to outside the viewport
  initializeSmartNavigation()

  initializeHighlight()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent, overviewComponent)

  // disable UI
  await setUiDisabled(true)

  // loads an initial sample graph from file
  originalGraph = loadGraph(graphComponent.graph)

  initializeStyles()

  // run smart aggregation algorithm with default settings and set graph to graphControl
  await runAggregationAndReplaceGraph(originalGraph)

  // notify UI
  onInfoPanelPropertiesChanged()

  // enable UI
  await setUiDisabled(false)
}

/**
 * Registers a listener to the {@link GraphViewerInputMode#addItemClickedListener ItemClicked} event that toggles the aggregation of a node, runs a layout and sets the current item.
 */
function initializeToggleAggregation() {
  graphViewerInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    focusableItems: GraphItemTypes.NODE
  })
  graphViewerInputMode.addItemClickedListener((sender, evt) => {
    if (!(evt.item instanceof INode)) {
      return
    }
    // prevent default behavior, which would select nodes that are no longer in the graph
    evt.handled = true

    toggleAggregationNode(evt.item)
  })
  graphComponent.inputMode = graphViewerInputMode

  graphComponent.addKeyUpListener((sender, evt) => {
    if (evt.key === Key.ENTER) {
      toggleAggregationNode(graphComponent.currentItem)
    }
  })
  graphComponent.addCurrentItemChangedListener((sender, evt) => {
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
  runBalloonLayout(affectedNodes)
}

/**
 * Initializes the input mode for this component.
 */
function initializeSmartNavigation() {
  // Implements the smart click navigation
  graphComponent.inputMode.addItemClickedListener((sender, args) => {
    if (args.item instanceof IEdge) {
      args.handled = true
      zoomToLocation(args.item, args.location)
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
  graphViewerInputMode.itemHoverInputMode.addHoveredItemChangedListener((o, evt) => {
    onHoveredItemChanged(o, evt)
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
  )
  // freeze it for slightly improved performance
  orangePen.freeze()

  // now decorate the nodes and edges with custom hover highlight styles
  const decorator = graphComponent.graph.decorator

  // hide the default selection indicator
  decorator.nodeDecorator.selectionDecorator.hideImplementation()

  // nodes should be given a rectangular orange rectangle highlight shape
  const nodeStyleHighlight = new NodeStyleDecorationInstaller({
    nodeStyle: new ShapeNodeStyle({
      shape: ShapeNodeShape.ELLIPSE,
      stroke: orangePen,
      fill: null
    }),
    margins: new Insets(5),
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
  })
  // register it as the default implementation for all nodes
  decorator.nodeDecorator.highlightDecorator.setImplementation(nodeStyleHighlight)

  decorator.nodeDecorator.focusIndicatorDecorator.setImplementation(
    new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        shape: 'ellipse',
        fill: null,
        stroke: '1.5px dashed #696969'
      }),
      margins: Insets.EMPTY,
      zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
    })
  )

  // a similar style for the edges, however cropped by the highlight's insets
  const dummyCroppingArrow = new Arrow({
    type: ArrowType.NONE,
    cropLength: 5
  })
  const edgeStyle = new BezierEdgeStyle({
    stroke: orangePen,
    targetArrow: dummyCroppingArrow,
    sourceArrow: dummyCroppingArrow
  })
  const edgeStyleHighlight = new EdgeStyleDecorationInstaller({
    edgeStyle: edgeStyle,
    zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES
  })
  decorator.edgeDecorator.highlightDecorator.setImplementation(edgeStyleHighlight)
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

  switchViewButton.innerText = 'Switch To Filtered View'

  await setUiDisabled(false)

  onInfoPanelPropertiesChanged()
}

/**
 * Switches between the view with hierarchy nodes and without and runs an appropriate layout.
 * @returns {!Promise}
 */
async function switchView() {
  if (graphComponent.graph instanceof AggregationGraphWrapper) {
    graphComponent.graph = createFilteredView()
    await runCircularLayout()
    switchViewButton.innerText = 'Switch To Hierarchic View'
  } else {
    graphComponent.graph = aggregationHelper.aggregateGraph
    await runBalloonLayout()
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

  // reset any rotated labels
  for (const label of filteredGraph.labels) {
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

  await runBalloonLayout()
}

/**
 * Asynchronously runs the {@link NodeAggregation} algorithm with the settings from the properties panel.
 * Afterwards, the {@link NodeAggregationResult} is applied to the <code>aggregateGraph</code>.
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
  const aggregationMode = aggregationModeSelect.value
  const maximumDuration = maximumDurationRange.value
  const minimumClusterSize = minimumClusterSizeRange.value
  const maximumClusterSize = maximumClusterSizeRange.value
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
 * Runs a balloon layout where the hierarchy edges are the tree edges and original edges are bundled.
 * @param {!IListEnumerable.<INode>} [affectedNodes]
 * @returns {!Promise}
 */
async function runBalloonLayout(affectedNodes) {
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
 * @yjs:keep=c
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

  const templateString = `<ellipse cx="{TemplateBinding width, Converter=radius}"
        cy="{TemplateBinding height, Converter=radius}"
        rx="{TemplateBinding width, Converter=radius}"
        ry="{TemplateBinding height, Converter=radius}"
        stroke="{Binding, Converter=strokeColor, Parameter=rgba(0,0,0,0.45)}" stroke-dasharray="{Binding, Converter=strokeStyle}" stroke-width="1.5"
        fill="{Binding, Converter=fillColor, Parameter=rgba(108,145,191,0.16)|rgba(108,145,191,0.13)}" style="cursor: pointer"></ellipse>
      <path d="{Binding isAggregated, Converter=sign}" stroke="#4B4B4B" stroke-width="1.5" transform="{TemplateBinding bounds, Converter=centered}"></path>`

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
 * Enables/disables the UI.
 * @param {boolean} disabled
 * @returns {!Promise}
 */
function setUiDisabled(disabled) {
  return new Promise(resolve => {
    calculatingIndicator.style.display = !disabled ? 'none' : 'block'
    aggregationModeSelect.disabled = disabled
    maximumDurationRange.disabled = disabled
    minimumClusterSizeRange.disabled = disabled
    maximumClusterSizeRange.disabled = disabled
    graphComponent.inputMode.waitInputMode.waiting = disabled
    runButton.disabled = disabled

    // enable switching to filtered view only if there are some real edges in the graph
    // otherwise the graph in filtered view will be empty
    switchViewButton.disabled =
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
      'fill="{Binding c}" stroke="#696969"></ellipse>',
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
  const originalNodesElement = document.getElementById('original-nodes')
  originalNodesElement.innerText = `${aggregationHelper ? aggregationHelper.visibleNodes : 0} / ${
    originalGraph.nodes.size
  }`
  const originalEdgesElement = document.getElementById('original-edges')
  originalEdgesElement.innerText = `${aggregationHelper ? aggregationHelper.visibleEdges : 0} / ${
    originalGraph.edges.size
  }`
  const currentItem = graphComponent.currentItem
  const nodeLabel = currentItem instanceof ILabelOwner ? currentItem.labels.firstOrDefault() : null
  const nodeName = nodeLabel ? nodeLabel.text.replace('\n', ' ') : ''
  const currentItemElement = document.getElementById('current-item')
  currentItemElement.innerText = nodeName
  currentItemElement.style.display = nodeName !== '' ? 'block' : 'none'

  let aggregate = null
  if (aggregationHelper && graphComponent.currentItem instanceof INode) {
    aggregate = aggregationHelper.getAggregateForNode(graphComponent.currentItem)
  }
  const descendantCountElement = document.getElementById('descendant-count')
  descendantCountElement.innerText = aggregate ? aggregate.descendantCount.toString() : '0'
  const descendantWeightSumElement = document.getElementById('descendant-weight-sum')
  if (aggregate) {
    const descendantWeightSum =
      Math.round((aggregate.descendantWeightSum + Number.EPSILON) * 100) / 100
    descendantWeightSumElement.innerText = descendantWeightSum.toString()
  } else {
    descendantWeightSumElement.innerText = '0'
  }

  // enable switching to filtered view only if there are some real edges in the graph
  // otherwise the graph in filtered view will be empty
  switchViewButton.disabled = graphComponent.graph.nodes.every(node =>
    aggregationHelper.aggregateGraph.isAggregationItem(node)
  )
}

/**
 * A LayoutExecutor that modifies the viewport animation to zoom to a list of nodes.
 */
class ZoomToNodesLayoutExecutor extends LayoutExecutor {
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
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  const maximumDurationLabel = document.getElementById('maximum-duration-label')
  bindChangeListener(
    "input[data-command='MaximumDuration']",
    value => (maximumDurationLabel.innerText = value)
  )
  const minimumClusterSizeLabel = document.getElementById('minimum-cluster-size-label')
  bindChangeListener(
    "input[data-command='MinimumClusterSize']",
    value => (minimumClusterSizeLabel.innerText = value)
  )
  const maximumClusterSizeLabel = document.getElementById('maximum-cluster-size-label')
  bindChangeListener(
    "input[data-command='MaximumClusterSize']",
    value => (maximumClusterSizeLabel.innerText = value)
  )

  bindAction("button[data-command='RunAggregation']", runAggregation)
  bindAction("button[data-command='SwitchView']", switchView)
}

// start tutorial
loadJson().then(run)
