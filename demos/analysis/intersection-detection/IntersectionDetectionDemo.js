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
  EdgePathCropper,
  SmartEdgeLabelModel,
  FreeNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSnapContext,
  HorizontalTextAlignment,
  IEdge,
  IGraph,
  INode,
  Intersection,
  IntersectionItemTypes,
  Intersections,
  LabelPositionHandler,
  LabelStyle,
  License,
  OrientedRectangle,
  Point,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  TimeSpan,
  VerticalTextAlignment,
  Visualization,
  NodeStyleIndicatorRenderer,
  LabelStyleIndicatorRenderer,
  EdgeStyleIndicatorRenderer
} from '@yfiles/yfiles'
import { IntersectionVisualCreator } from './DemoVisuals'
import { colorSets, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import GraphData from './resources/GraphData'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { createToolTipContent } from './TooltipHelper'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * The graph component
 */
let graphComponent

/**
 * The canvas object for the intersection visual.
 */
let intersectionVisualCreator

const considerSourceTargetIntersectionsBox = document.querySelector(
  '#consider-source-target-node-intersections'
)
const considerGroupContentIntersectionsBox = document.querySelector(
  '#consider-group-content-intersections'
)
const considerLabelOwnerIntersectionsBox = document.querySelector(
  '#consider-label-owner-intersections'
)
const considerItemGeometryBox = document.querySelector('#consider-item-geometry')
const considerSelectionBox = document.querySelector('#consider-only-selection')
const intersectionCountLabel = document.querySelector('#intersection-count')
const nodeNodeCountLabel = document.querySelector('#node-node-count')
const nodeEdgeCountLabel = document.querySelector('#node-edge-count')
const edgeEdgeCountLabel = document.querySelector('#edge-edge-count')
const labelCountLabel = document.querySelector('#label-count')
const consideredItemsSelect = document.querySelector('#considered-items-select')
let intersectionInfoArray = []

/**
 * This demo shows how to find and highlight intersections and overlaps between graph elements.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  // initialize the input mode
  initializeInputMode()

  // initialize the graph and the defaults
  initializeGraph(graphComponent)

  // bind the buttons to their change listener
  initializeUI()

  // load a sample graph
  loadSampleGraph(graphComponent.graph)
  void graphComponent.fitGraphBounds()

  initializeIntersectionVisual()

  // finally, run the intersection algorithm on it
  runIntersectionAlgorithm()
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
    intersections.affectedItems = (item) => graphComponent.selection.includes(item)
  }

  // run the algorithm and obtain the result
  const intersectionsResult = intersections.run(graphComponent.graph)

  // store information of results in the right-side panel
  intersectionInfoArray = intersectionsResult.intersections.toArray()
  updateIntersectionInfoPanel(intersectionInfoArray)

  updateIntersectionVisual(intersectionInfoArray)
}

/**
 * Updates the labels in the information panel with the number of intersections by type.
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
  graphComponent.renderTree
    .createElement(graphComponent.renderTree.highlightGroup, intersectionVisualCreator)
    .toFront()
}

/**
 * Loads the sample graph.
 */
function loadSampleGraph(graph) {
  const builder = new GraphBuilder(graph)
  const ns = builder.createNodesSource({
    data: GraphData.nodeList.filter((data) => !data.isGroup),
    id: 'id',
    layout: 'layout',
    parentId: (dataItem) => dataItem.parent
  })
  ns.nodeCreator.addEventListener('node-created', (evt) => {
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
  const nodeLabelCreator = ns.nodeCreator.createLabelsSource(
    (data) => data.labels || []
  ).labelCreator
  nodeLabelCreator.textProvider = (data) => data.text || ''
  nodeLabelCreator.addEventListener('label-added', (evt) => {
    const label = evt.item
    const data = evt.dataItem
    graph.setLabelLayoutParameter(
      label,
      FreeNodeLabelModel.INSTANCE.findBestParameter(
        label,
        new OrientedRectangle(data.anchorX, data.anchorY, data.width, data.height)
      )
    )
  })

  const groupSource = builder.createGroupNodesSource({
    data: GraphData.nodeList.filter((data) => data.isGroup),
    id: 'id',
    layout: 'layout'
  })
  const groupLabelCreator = groupSource.nodeCreator.createLabelsSource(
    (data) => data.labels
  ).labelCreator
  groupLabelCreator.textProvider = (data) => data.text || ''

  const es = builder.createEdgesSource({
    data: GraphData.edgeList,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    bends: 'bends'
  })
  const edgeLabelCreator = es.edgeCreator.createLabelsSource(
    (data) => data.labels || []
  ).labelCreator
  edgeLabelCreator.textProvider = (data) => data.text || ''
  edgeLabelCreator.addEventListener('label-added', (evt) => {
    const label = evt.item
    const data = evt.dataItem
    graph.setLabelLayoutParameter(
      label,
      new SmartEdgeLabelModel().findBestParameter(
        label,
        new OrientedRectangle(data.anchorX, data.anchorY, data.width, data.height)
      )
    )
  })

  builder.buildGraph()

  graph.edges.forEach((edge) => {
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
 */
function initializeGraph(graphComponent) {
  const graph = graphComponent.graph
  // set style defaults
  const theme = 'demo-palette-75'
  initDemoStyles(graph, { theme, orthogonalEditing: true })
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: colorSets[theme].fill,
    stroke: `1px ${colorSets[theme].stroke}`
  })

  graph.nodeDefaults.labels.style = new LabelStyle({
    backgroundFill: colorSets[theme].nodeLabelFill,
    textFill: colorSets[theme].text,
    verticalTextAlignment: VerticalTextAlignment.CENTER,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER,
    padding: [2, 4, 1, 4]
  })
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.CENTER

  graph.edgeDefaults.labels.style = new LabelStyle({
    backgroundFill: colorSets[theme].edgeLabelFill,
    textFill: colorSets[theme].text,
    verticalTextAlignment: VerticalTextAlignment.CENTER,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER,
    padding: [2, 4, 1, 4]
  })
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(0)

  graph.decorator.ports.edgePathCropper.addConstant(
    new EdgePathCropper({ cropAtPort: false, extraCropLength: 0 })
  )
  graph.decorator.labels.positionHandler.addFactory((label) => {
    const positionHandler = new LabelPositionHandler(label)
    positionHandler.visualization = Visualization.LIVE
    return positionHandler
  })

  // add some highlighting for the nodes/edges/labels involved in an intersection
  const highlightNodeStyle = new NodeStyleIndicatorRenderer({
    nodeStyle: new ShapeNodeStyle({
      shape: 'rectangle',
      stroke: '2px #f0c808',
      fill: 'transparent'
    }),
    zoomPolicy: 'world-coordinates'
  })

  const highlightLabelStyle = new LabelStyleIndicatorRenderer({
    labelStyle: new LabelStyle({
      shape: 'rectangle',
      backgroundStroke: '2px #56926e',
      backgroundFill: 'transparent',
      textFill: 'transparent'
    }),
    zoomPolicy: 'world-coordinates'
  })

  const highlightEdgeStyle = new EdgeStyleIndicatorRenderer({
    edgeStyle: new PolylineEdgeStyle({ stroke: '2px #ff6c00' }),
    zoomPolicy: 'world-coordinates'
  })

  graph.decorator.nodes.highlightRenderer.addConstant(highlightNodeStyle)
  graph.decorator.edges.highlightRenderer.addConstant(highlightEdgeStyle)
  graph.decorator.labels.highlightRenderer.addConstant(highlightLabelStyle)

  graphComponent.selection.addEventListener('item-added', () => {
    if (considerSelectionBox.checked) {
      runIntersectionAlgorithm()
    }
  })

  graphComponent.selection.addEventListener('item-removed', () => {
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
    snapContext: new GraphSnapContext()
  })

  // register listeners so that the intersections are re-calculated when changing the graph
  inputMode.addEventListener('deleted-selection', runIntersectionAlgorithm)
  inputMode.createEdgeInputMode.addEventListener('edge-created', runIntersectionAlgorithm)
  inputMode.addEventListener('node-created', runIntersectionAlgorithm)
  inputMode.addEventListener('label-edited', runIntersectionAlgorithm)
  inputMode.moveSelectedItemsInputMode.addEventListener('dragged', runIntersectionAlgorithm)
  inputMode.moveUnselectedItemsInputMode.addEventListener('dragged', runIntersectionAlgorithm)
  inputMode.handleInputMode.addEventListener('dragged', runIntersectionAlgorithm)

  inputMode.itemHoverInputMode.hoverItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    const item = evt.item
    const highlights = graphComponent.highlights
    highlights.clear()

    for (const intersection of intersectionInfoArray) {
      const item1 = intersection.item1
      const item2 = intersection.item2
      if (item === item1 || item === item2) {
        highlights.add(item1)
        highlights.add(item2)
      }
    }
  })
  configureToolTips(inputMode)

  graphComponent.inputMode = inputMode
}

/**
 * Wires the GUI elements with the corresponding functionality.
 */
function initializeUI() {
  document
    .querySelector('#consider-source-target-node-intersections')
    .addEventListener('change', runIntersectionAlgorithm)
  document
    .querySelector('#consider-group-content-intersections')
    .addEventListener('change', runIntersectionAlgorithm)
  document
    .querySelector('#consider-label-owner-intersections')
    .addEventListener('change', runIntersectionAlgorithm)
  document
    .querySelector('#consider-item-geometry')
    .addEventListener('change', runIntersectionAlgorithm)
  document
    .querySelector('#consider-only-selection')
    .addEventListener('change', runIntersectionAlgorithm)
  consideredItemsSelect.addEventListener('change', runIntersectionAlgorithm)

  document.querySelector('#snapping-button').addEventListener('click', () => {
    const snappingEnabled = document.querySelector('#snapping-button').checked
    const geim = graphComponent.inputMode
    geim.snapContext.enabled = snappingEnabled
  })
}

/**
 * Configures the given input mode to show tool tips for labels.
 * The tool tips show a description of the corresponding label's configuration.
 */
function configureToolTips(inputMode) {
  // Customize the tool tip's behavior to our liking.
  const toolTipInputMode = inputMode.toolTipInputMode
  toolTipInputMode.toolTipLocationOffset = new Point(15, 15)
  toolTipInputMode.delay = TimeSpan.fromMilliseconds(50)
  toolTipInputMode.duration = TimeSpan.fromSeconds(10)

  // Register a listener for when a tool tip should be shown.
  inputMode.addEventListener('query-item-tool-tip', (evt) => {
    if (evt.handled) {
      // Tool tip content has already been assigned -> nothing to do.
      return
    }

    // Use a rich HTML element as tool tip content. Alternatively, a plain string would do as well.
    evt.toolTip = createToolTipContent(evt.item, intersectionInfoArray)
    // Indicate that the tool tip content has been set.
    evt.handled = true
  })
}

run().then(finishLoading)
