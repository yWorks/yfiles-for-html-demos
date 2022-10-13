/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultEdgePathCropper,
  DefaultLabelStyle,
  EdgeStyleDecorationInstaller,
  Fill,
  FreeEdgeLabelModel,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSnapContext,
  HorizontalTextAlignment,
  ICanvasObjectDescriptor,
  ICommand,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  Insets,
  Intersection,
  IntersectionItemTypes,
  Intersections,
  LabelPositionHandler,
  LabelSnapContext,
  LabelStyleDecorationInstaller,
  License,
  NodeStyleDecorationInstaller,
  OrientedRectangle,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  QueryItemToolTipEventArgs,
  ShapeNodeStyle,
  StyleDecorationZoomPolicy,
  TimeSpan,
  VerticalTextAlignment,
  Visualization
} from 'yfiles'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import { IntersectionVisualCreator } from './DemoVisuals.js'
import { applyDemoTheme, colorSets, initDemoStyles } from '../../resources/demo-styles.js'
import GraphData from './resources/GraphData.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import { createToolTipContent } from './TooltipHelper.js'

/**
 * The graph component
 * @type {GraphComponent}
 */
let graphComponent

/**
 * The canvas object for the intersection visual.
 * @type {IntersectionVisualCreator}
 */
let intersectionVisualCreator

const considerSourceTargetIntersectionsBox = document.getElementById(
  'consider-source-target-node-intersections'
)
const considerGroupContentIntersectionsBox = document.getElementById(
  'consider-group-content-intersections'
)
const considerLabelOwnerIntersectionsBox = document.getElementById(
  'consider-label-owner-intersections'
)
const considerItemGeometryBox = document.getElementById('consider-item-geometry')
const considerSelectionBox = document.getElementById('consider-only-selection')
const intersectionCountLabel = document.getElementById('intersection-count')
const nodeNodeCountLabel = document.getElementById('node-node-count')
const nodeEdgeCountLabel = document.getElementById('node-edge-count')
const edgeEdgeCountLabel = document.getElementById('edge-edge-count')
const labelCountLabel = document.getElementById('label-count')
const consideredItemsSelect = document.getElementById('considered-items-select')
/** @type {Array} */
let intersectionInfoArray = []

/**
 * This demo shows how to find and highlight intersections and overlaps between graph elements.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the input mode
  initializeInputMode()

  // initialize the graph and the defaults
  initializeGraph(graphComponent)

  // bind the buttons to their commands
  registerCommands()

  // load a sample graph
  loadSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  initializeIntersectionVisual()

  // finally, run the intersection algorithm on it
  runIntersectionAlgorithm()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Applies the intersection algorithm.
 */
function runIntersectionAlgorithm() {
  // configure the algorithm that computes intersections
  const intersections = new Intersections()

  // define which items are generally considered
  switch (consideredItemsSelect.value) {
    default:
    case 'all':
      intersections.consideredItemTypes = IntersectionItemTypes.ALL
      break
    case 'nodes':
      intersections.consideredItemTypes = IntersectionItemTypes.NODE
      break
    case 'edges':
      intersections.consideredItemTypes = IntersectionItemTypes.EDGE
      break
    case 'labels':
      intersections.consideredItemTypes = IntersectionItemTypes.LABEL
      break
    case 'nodes-and-edges':
      intersections.consideredItemTypes = IntersectionItemTypes.NODE | IntersectionItemTypes.EDGE
      break
    case 'nodes-and-labels':
      intersections.consideredItemTypes = IntersectionItemTypes.NODE | IntersectionItemTypes.LABEL
      break
  }

  // define which item types are considered to be independent of their owner
  let independentItems = GraphItemTypes.NONE
  if (considerLabelOwnerIntersectionsBox.checked) {
    // labels should be independent, e.g., a label intersection with its owning node is found
    independentItems |= GraphItemTypes.LABEL
  }
  if (considerSourceTargetIntersectionsBox.checked) {
    // edges should be independent, e.g., the intersection with the edges source node is found too, including the port
    independentItems |= GraphItemTypes.EDGE
  }
  if (considerGroupContentIntersectionsBox.checked) {
    // nodes should be independent, so that an intersection with an enclosing group node is included
    independentItems |= GraphItemTypes.NODE
  }
  intersections.independentItems = independentItems

  // whether to consider the shape geometry of the items
  intersections.considerItemGeometry = considerItemGeometryBox.checked

  // whether to consider only the selected elements
  if (considerSelectionBox.checked) {
    intersections.affectedItems.delegate = item => graphComponent.selection.isSelected(item)
  }

  // run the algorithm and obtain the result
  const intersectionsResult = intersections.run(graphComponent.graph)

  // store information of results in right side panel
  intersectionInfoArray = intersectionsResult.intersections.toArray()
  updateIntersectionInfoPanel(intersectionInfoArray)

  updateIntersectionVisual(intersectionInfoArray)
}

/**
 * Updates the labels in the information panel with the number of intersections by type.
 * @param {!Array.<Intersection>} intersections
 */
function updateIntersectionInfoPanel(intersections) {
  let nodeNodeIntersections = 0
  let nodeEdgeIntersections = 0
  let edgeEdgeIntersections = 0
  let labelIntersections = 0
  for (const intersection of intersections) {
    const item1 = intersection.item1
    const item2 = intersection.item2
    if (item1 instanceof INode && item2 instanceof INode) {
      nodeNodeIntersections++
    } else if (item1 instanceof IEdge && item2 instanceof IEdge) {
      edgeEdgeIntersections++
    } else if (
      (item1 instanceof IEdge && item2 instanceof INode) ||
      (item1 instanceof INode && item2 instanceof IEdge)
    ) {
      nodeEdgeIntersections++
    } else {
      labelIntersections++
    }
  }

  intersectionCountLabel.innerText = `${intersections.length}`
  nodeNodeCountLabel.innerText = `${nodeNodeIntersections}`
  nodeEdgeCountLabel.innerText = `${nodeEdgeIntersections}`
  edgeEdgeCountLabel.innerText = `${edgeEdgeIntersections}`
  labelCountLabel.innerText = `${labelIntersections}`
}

/**
 * Updates the intersection visualization to show the given intersections.
 * @param {!Array.<Intersection>} intersections
 */
function updateIntersectionVisual(intersections) {
  intersectionVisualCreator.intersections = intersections
  graphComponent.invalidate()
}

/**
 * Creates the visualization for intersections calculated in this demo.
 */
function initializeIntersectionVisual() {
  intersectionVisualCreator = new IntersectionVisualCreator()
  graphComponent.highlightGroup
    .addChild(intersectionVisualCreator, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
    .toFront()
}

/**
 * Loads the sample graph.
 * @param {!IGraph} graph
 */
function loadSampleGraph(graph) {
  const builder = new GraphBuilder(graph)
  const ns = builder.createNodesSource({
    data: GraphData.nodeList.filter(data => !data.isGroup),
    id: 'id',
    layout: 'layout',
    parentId: dataItem => dataItem.parent
  })
  ns.nodeCreator.addNodeCreatedListener((sender, evt) => {
    if (evt.dataItem.isEllipse) {
      const defaultStyle = graph.nodeDefaults.style
      graph.setStyle(
        evt.item,
        new ShapeNodeStyle({
          shape: 'ellipse',
          fill: defaultStyle.fill,
          stroke: defaultStyle.stroke
        })
      )
    }
  })
  const nodeLabelCreator = ns.nodeCreator.createLabelsSource(data => data.labels || []).labelCreator
  nodeLabelCreator.textProvider = data => data.text || ''
  nodeLabelCreator.addLabelAddedListener((sender, evt) => {
    const label = evt.item
    const data = evt.dataItem
    graph.setLabelLayoutParameter(
      label,
      FreeNodeLabelModel.INSTANCE.findBestParameter(
        label,
        FreeNodeLabelModel.INSTANCE,
        new OrientedRectangle(data.anchorX, data.anchorY, data.width, data.height)
      )
    )
  })

  const groupSource = builder.createGroupNodesSource({
    data: GraphData.nodeList.filter(data => data.isGroup),
    id: 'id',
    layout: 'layout'
  })
  const groupLabelCreator = groupSource.nodeCreator.createLabelsSource(
    data => data.labels
  ).labelCreator
  groupLabelCreator.textProvider = data => data.text || ''

  const es = builder.createEdgesSource({
    data: GraphData.edgeList,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    bends: 'bends'
  })
  const edgeLabelCreator = es.edgeCreator.createLabelsSource(data => data.labels || []).labelCreator
  edgeLabelCreator.textProvider = data => data.text || ''
  edgeLabelCreator.addLabelAddedListener((sender, evt) => {
    const label = evt.item
    const data = evt.dataItem
    graph.setLabelLayoutParameter(
      label,
      FreeEdgeLabelModel.INSTANCE.findBestParameter(
        label,
        FreeEdgeLabelModel.INSTANCE,
        new OrientedRectangle(data.anchorX, data.anchorY, data.width, data.height)
      )
    )
  })

  builder.buildGraph()

  graph.edges.forEach(edge => {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort, Point.from(edge.tag.sourcePort))
    }
    if (edge.tag.targetPort) {
      graph.setPortLocation(edge.targetPort, Point.from(edge.tag.targetPort))
    }
  })
}

/**
 * Initializes default styles for the given graph.
 * @param {!GraphComponent} graphComponent
 */
function initializeGraph(graphComponent) {
  const graph = graphComponent.graph
  // set style defaults
  const theme = 'demo-palette-75'
  initDemoStyles(graph, { theme })
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: colorSets[theme].fill,
    stroke: `1px ${colorSets[theme].stroke}`
  })

  const nodeLabelStyle = new DefaultLabelStyle()
  nodeLabelStyle.backgroundFill = Fill.from(colorSets[theme].nodeLabelFill)
  nodeLabelStyle.textFill = Fill.from(colorSets[theme].text)
  nodeLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  nodeLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  nodeLabelStyle.insets = new Insets(4, 2, 4, 1)
  graph.nodeDefaults.labels.style = nodeLabelStyle
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createDefaultParameter()

  const edgeLabelStyle = new DefaultLabelStyle()
  edgeLabelStyle.backgroundFill = Fill.from(colorSets[theme].edgeLabelFill)
  edgeLabelStyle.textFill = Fill.from(colorSets[theme].text)
  edgeLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  edgeLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  edgeLabelStyle.insets = new Insets(4, 2, 4, 1)
  graph.edgeDefaults.labels.style = edgeLabelStyle
  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  graph.decorator.portDecorator.edgePathCropperDecorator.setImplementation(
    new DefaultEdgePathCropper({ cropAtPort: false, extraCropLength: 0 })
  )
  graph.decorator.labelDecorator.positionHandlerDecorator.setFactory(label => {
    const positionHandler = new LabelPositionHandler(label)
    positionHandler.visualization = Visualization.LIVE
    return positionHandler
  })

  // add some highlighting for the nodes/edges/labels involved in an intersection
  graph.decorator.nodeDecorator.highlightDecorator.setImplementation(
    new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        shape: 'rectangle',
        stroke: '2px #f0c808',
        fill: 'transparent'
      }),
      margins: 0,
      zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
    })
  )

  graph.decorator.labelDecorator.highlightDecorator.setImplementation(
    new LabelStyleDecorationInstaller({
      labelStyle: new DefaultLabelStyle({
        shape: 'rectangle',
        backgroundStroke: '2px #56926e',
        backgroundFill: 'transparent',
        textFill: 'transparent'
      }),
      margins: 0,
      zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
    })
  )

  graph.decorator.edgeDecorator.highlightDecorator.setImplementation(
    new EdgeStyleDecorationInstaller({
      edgeStyle: new PolylineEdgeStyle({
        stroke: '2px #ff6c00'
      }),
      zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
    })
  )

  graphComponent.selection.addItemSelectionChangedListener(() => {
    if (considerSelectionBox.checked) {
      runIntersectionAlgorithm()
    }
  })
}

/**
 * Initializes the supported user interactions for this demo.
 */
function initializeInputMode() {
  // configure interaction
  const inputMode = new GraphEditorInputMode({
    allowCreateBend: true,
    selectableItems: 'all',
    marqueeSelectableItems: 'all',
    allowGroupingOperations: true,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext(),
    snapContext: new GraphSnapContext(),
    labelSnapContext: new LabelSnapContext()
  })

  // register listeners so that the intersections are re-calculated when changing the graph
  inputMode.addDeletedSelectionListener(runIntersectionAlgorithm)
  inputMode.createEdgeInputMode.addEdgeCreatedListener(runIntersectionAlgorithm)
  inputMode.addNodeCreatedListener(runIntersectionAlgorithm)
  inputMode.addLabelTextChangedListener(runIntersectionAlgorithm)
  inputMode.moveInputMode.addDraggedListener(runIntersectionAlgorithm)
  inputMode.handleInputMode.addDraggedListener(runIntersectionAlgorithm)
  inputMode.moveLabelInputMode.addDraggedListener(runIntersectionAlgorithm)

  inputMode.itemHoverInputMode.hoverItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
    const item = args.item
    const highlightIndicatorManager = graphComponent.highlightIndicatorManager
    highlightIndicatorManager.clearHighlights()

    for (const intersection of intersectionInfoArray) {
      const item1 = intersection.item1
      const item2 = intersection.item2
      if (item === item1 || item === item2) {
        highlightIndicatorManager.addHighlight(item1)
        highlightIndicatorManager.addHighlight(item2)
      }
    }
  })
  configureToolTips(inputMode)

  graphComponent.inputMode = inputMode
}

/**
 * Wires the GUI elements with the corresponding commands.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent, null)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent, null)

  bindChangeListener(
    "input[data-command='ConsiderSourceTargetNodeIntersections']",
    runIntersectionAlgorithm
  )
  bindChangeListener(
    "input[data-command='ConsiderGroupContentIntersections']",
    runIntersectionAlgorithm
  )
  bindChangeListener(
    "input[data-command='ConsiderLabelOwnerIntersections']",
    runIntersectionAlgorithm
  )
  bindChangeListener("input[data-command='ConsiderItemGeometry']", runIntersectionAlgorithm)
  bindChangeListener("input[data-command='ConsiderOnlySelection']", runIntersectionAlgorithm)
  consideredItemsSelect.addEventListener('change', runIntersectionAlgorithm)

  bindAction('#snapping-button', () => {
    const snappingEnabled = document.querySelector('#snapping-button').checked
    const geim = graphComponent.inputMode
    geim.snapContext.enabled = snappingEnabled
    geim.labelSnapContext.enabled = snappingEnabled
  })
}

/**
 * Configures the given input mode to show tool tips for labels.
 * The tool tips show a description of the corresponding label's configuration.
 * @param {!GraphEditorInputMode} inputMode
 */
function configureToolTips(inputMode) {
  // Customize the tool tip's behavior to our liking.
  const mouseHoverInputMode = inputMode.mouseHoverInputMode
  mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
  mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(50)
  mouseHoverInputMode.duration = TimeSpan.fromSeconds(10)

  // Register a listener for when a tool tip should be shown.
  inputMode.addQueryItemToolTipListener((src, eventArgs) => {
    if (eventArgs.handled) {
      // Tool tip content has already been assigned -> nothing to do.
      return
    }

    // Use a rich HTML element as tool tip content. Alternatively, a plain string would do as well.
    eventArgs.toolTip = createToolTipContent(eventArgs.item, intersectionInfoArray)
    // Indicate that the tool tip content has been set.
    eventArgs.handled = true
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
