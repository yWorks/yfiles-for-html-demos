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
  Animator,
  Color,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  FoldingManager,
  FreeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphModelManager,
  GraphViewerInputMode,
  IAnimation,
  ICommand,
  IGraph,
  License,
  Point,
  Rect,
  RenderModes,
  ScrollBarVisibility,
  Size,
  TimeSpan,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeStyle,
  WebGLTaperedEdgeStyle
} from 'yfiles'

import ComplexCanvasNodeStyle from './ComplexCanvasNodeStyle.js'
import CanvasLabelStyle from './CanvasLabelStyle.js'
import CanvasEdgeStyle from './CanvasEdgeStyle.js'
import SimpleCanvasNodeStyle from './SimpleCanvasNodeStyle.js'
import ComplexSvgNodeStyle from './ComplexSvgNodeStyle.js'
import SvgLabelStyle from './SvgLabelStyle.js'
import { CircleNodeAnimation, CirclePanAnimation, ZoomInAndBackAnimation } from './Animations.js'
import SvgEdgeStyle from './SvgEdgeStyle.js'
import SimpleSvgNodeStyle from './SimpleSvgNodeStyle.js'
import { FastGraphModelManager, OptimizationMode } from './FastGraphModelManager.js'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import PreConfigurator from './resources/PreConfigurator.js'
import samples from './resources/samples.js'
import loadJson from '../../resources/load-json.js'
import { webGlSupported } from '../../utils/Workarounds.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * The time to wait after an edit event until a redraw should be performed.
 * @type {number}
 */
const AUTO_REDRAW_DELAY = 1000

/**
 * Whether to use static label positions.
 * @type {boolean}
 */
let fixLabelPositionsEnabled = false

/**
 * Auto update setting.
 * @type {boolean}
 */
let autoRedrawEnabled = true

/**
 * Timer to control the schedule and cancel an auto redraw.
 * @type {number}
 */
let redrawTimerId = -1

// the "graph loading" indicator element
const loadingIndicator = document.querySelector('#loadingIndicator')
const redrawGraphButton = document.querySelector('#redrawGraphButton')
// Control for the input mode.
const modeChooserBox = document.querySelector('#modeChooserBox')
// Controls for the sample graphs.
const graphChooserBox = document.querySelector('#graphChooserBox')
const nextButton = document.querySelector('#nextButton')
const previousButton = document.querySelector('#previousButton')
const nodeLabelsCheckbox = document.querySelector('#nodeLabelsCheckbox')
const edgeLabelsCheckbox = document.querySelector('#edgeLabelsCheckbox')
const detailLevelIndicator = document.querySelector('#detailLevelIndicator')
const detailLevelPopup = document.querySelector('#detailLevelPopup')
const simpleSvgStyle = document.querySelector('#simple-svg-radio')
const complexSvgStyle = document.querySelector('#complex-svg-radio')
const simpleCanvasStyle = document.querySelector('#simple-canvas-radio')
const simpleWebglStyle = document.querySelector('#simple-webgl-radio')
const complexCanvasStyle = document.querySelector('#complex-canvas-radio')
const defaultGmm = document.querySelector('#defaultGmm-radio')
const levelOfDetailGmm = document.querySelector('#levelOfDetailGmm-radio')
const staticGmm = document.querySelector('#staticGmm-radio')
const svgImageGmm = document.querySelector('#svgImageGmm-radio')
const CanvasImageWithDrawCallbackGmm = document.querySelector(
  '#CanvasImageWithDrawCallbackGmm-radio'
)
const CanvasImageWithItemStylesGmm = document.querySelector('#CanvasImageWithItemStylesGmm-radio')
const StaticCanvasImageGmm = document.querySelector('#StaticCanvasImageGmm-radio')
const StaticWebglImageGmm = document.querySelector('#StaticWebglImageGmm-radio')
const fixLabelPositionsCheckbox = document.querySelector('#fix-label-positions')
const autoRedrawCheckbox = document.querySelector('#autoRedrawCheckbox')
const fpsCheckbox = document.querySelector('#fpsCheckbox')
const zoomLevel = document.querySelector('#zoomlevel')
const selectionCount = document.querySelector('#selection')

/**
 * @type {FastGraphModelManager}
 */
let graphModelManager = null

/**
 * Controls for the benchmarking ui
 * @type {FPSMeter}
 */
let mainFrameRate = null

/**
 * @type {HTMLButtonElement[]}
 */
let disabledButtonsDuringAnimation = null

/**
 * The preconfigurations for different sized graphs
 * @type {PreConfigurator}
 */
let preConfigurator = null

// timer for setting the z-index after fade-out finished
let tooltipTimer = null

const edgeColor = new Color(100, 100, 100)
const edgeThickness = 5

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')

  graphComponent.minimumZoom = 0.005

  // assign the custom GraphModelManager
  installGraphModelManager()

  // initialize fps meter
  mainFrameRate = new FPSMeter()

  registerListeners()
  preConfigurator = new PreConfigurator(graphComponent)

  initializeGraphChooserBox()
  modeChooserBox.selectedIndex = 0
  onModeChanged()
  redrawGraphButton.disabled = true
  updateOptimizationMode()

  graphChooserBox.selectedIndex = 1

  // initialize information fields
  zoomLevel.textContent = Math.floor(graphComponent.zoom * 100).toString()
  selectionCount.textContent = graphComponent.selection.size.toString()

  // get the buttons that need to be disabled during animation
  disabledButtonsDuringAnimation = [
    document.querySelector('#panAnimationBtn'),
    document.querySelector('#zoomAnimationBtn'),
    document.querySelector('#spiralAnimationBtn'),
    document.querySelector('#moveNodeAnimationBtn')
  ]

  registerCommands()
  registerTooltips()

  showApp(graphComponent)

  onGraphChooserSelectionChanged()
}

function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent, null)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent, null)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent, null)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent, null)

  bindChangeListener('#graphChooserBox', onGraphChooserSelectionChanged)
  bindAction("button[data-command='PreviousGraph']", onPreviousButtonClicked)
  bindAction("button[data-command='NextGraph']", onNextButtonClicked)

  bindAction("button[data-command='PanAnimation']", onPanAnimationClicked)
  bindAction("button[data-command='ZoomAnimation']", onZoomAnimationClicked)
  bindAction("button[data-command='SpiralAnimation']", onSpiralZoomAnimationClicked)
  bindAction("button[data-command='MoveNodeAnimation']", onNodeAnimationClicked)

  bindAction("button[data-command='SelectNothing']", onSelectNothingClicked)
  bindAction("button[data-command='SelectEverything']", onSelectEverythingClicked)
  bindAction("button[data-command='SelectAllNodes']", onSelectAllNodesClicked)
  bindAction("button[data-command='SelectAllEdges']", onSelectAllEdgesClicked)
  bindAction("button[data-command='SelectAllLabels']", onSelectAllLabelsClicked)
  bindAction("button[data-command='Select1000Nodes']", onSelect1000NodesClicked)
  bindAction("button[data-command='Select1000Edges']", onSelect1000EdgesClicked)
  bindAction("button[data-command='Select1000Labels']", onSelect1000LabelsClicked)

  bindAction("input[data-command='FpsCheckboxChanged']", onFpsCheckboxChanged)

  bindChangeListener("input[data-command='NodeLabelsCheckboxChanged']", onNodeLabelsChanged)
  bindChangeListener("input[data-command='EdgeLabelsCheckboxChanged']", onEdgeLabelsChanged)
  bindAction("button[data-command='RedrawGraph']", redrawGraph)

  bindChangeListener('#modeChooserBox', onModeChanged)

  // register radio buttons
  bindChangeListener('#simple-svg-radio', updateItemStyles)
  bindChangeListener('#complex-svg-radio', updateItemStyles)
  bindChangeListener('#simple-canvas-radio', updateItemStyles)
  bindChangeListener('#complex-canvas-radio', updateItemStyles)
  bindChangeListener('#simple-webgl-radio', updateItemStyles)

  bindChangeListener('#defaultGmm-radio', updateOptimizationMode)
  bindChangeListener('#levelOfDetailGmm-radio', updateOptimizationMode)
  bindChangeListener('#staticGmm-radio', updateOptimizationMode)
  bindChangeListener('#svgImageGmm-radio', updateOptimizationMode)
  bindChangeListener('#CanvasImageWithDrawCallbackGmm-radio', updateOptimizationMode)
  bindChangeListener('#CanvasImageWithItemStylesGmm-radio', updateOptimizationMode)
  bindChangeListener('#StaticCanvasImageGmm-radio', updateOptimizationMode)
  bindChangeListener('#StaticWebglImageGmm-radio', updateOptimizationMode)

  bindChangeListener(
    "input[data-command='FixLabelPositionsCheckboxChanged']",
    onFixLabelPositionsChanged
  )

  bindChangeListener("input[data-command='AutoRedrawCheckboxChanged']", onAutoRedrawChanged)
}

/**
 * Registers tooltips for the different performance settings.
 */
function registerTooltips() {
  // register tooltips
  const elements = document.querySelectorAll('.hasTooltip')
  for (let i = 0; i < elements.length; i++) {
    // label listeners
    const labelElement = elements[i].nextElementSibling
    if (labelElement.nodeName === 'LABEL') {
      labelElement.addEventListener('mouseover', evt => {
        showTooltip(evt.target.getAttribute('for'))
      })
      labelElement.addEventListener('mouseout', () => {
        hideTooltip()
      })
    }

    // input element listeners
    elements[i].addEventListener('mouseover', evt => {
      // the hasTooltip class may be directly on the label element
      showTooltip(evt.target.id !== '' ? evt.target.id : evt.target.getAttribute('for'))
    })
    elements[i].addEventListener('mouseout', () => {
      hideTooltip()
    })
  }
}

/**
 * Helper method to show a tooltip
 * @param {string} id
 */
function showTooltip(id) {
  clearTimeout(tooltipTimer)

  const tooltipDiv = document.getElementById('tooltip')
  const srcElement = document.getElementById(id)
  const infoElement = document.getElementById(`${id}-info`)

  tooltipDiv.innerHTML = ''

  tooltipDiv.setAttribute('class', 'info-visible arrow')
  const tooltipContent = infoElement.cloneNode(true)
  tooltipDiv.appendChild(tooltipContent)

  const labelElement = srcElement.type === 'label' ? srcElement : srcElement.nextElementSibling
  if (labelElement.nodeName === 'LABEL') {
    const warning = labelElement.className.indexOf('warning') >= 0
    if (warning) {
      tooltipDiv.appendChild(document.getElementById('warningToolTip').cloneNode(true))
    }
    const unrecommended = labelElement.className.indexOf('unrecommended') >= 0
    if (unrecommended) {
      tooltipDiv.appendChild(document.getElementById('unrecommendedToolTip').cloneNode(true))
    }
  }

  const top =
    srcElement.getBoundingClientRect().top - tooltipDiv.getBoundingClientRect().height * 0.5
  tooltipDiv.setAttribute('style', `top:${top}px; right: 20px;`)
}

// helper method to hide the tooltip
function hideTooltip() {
  const tooltip = document.getElementById('tooltip')
  tooltip.setAttribute('class', 'info-hidden arrow')
  tooltipTimer = setTimeout(() => {
    tooltip.style.zIndex = 0
  }, 350)
}

/**
 * Sets the custom {@link FastGraphModelManager} as the graphComponent's
 * {@link GraphComponent#graphModelManager}.
 */
function installGraphModelManager() {
  graphModelManager = new FastGraphModelManager(graphComponent, graphComponent.contentGroup)
  graphModelManager.intermediateNodeStyle = new SimpleSvgNodeStyle(Color.DARK_ORANGE)
  graphModelManager.intermediateEdgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
  if (webGlSupported) {
    graphModelManager.overviewEdgeStyle = new WebGLTaperedEdgeStyle({
      thickness: 30,
      color: edgeColor
    })
  } else {
    simpleWebglStyle.disabled = true
    StaticWebglImageGmm.disabled = true
    document.getElementById('no-webgl-support').style.display = 'block'
  }
  graphComponent.graphModelManager = graphModelManager
}

/**
 * Initialize the auto updates.
 */
function initializeAutoUpdates() {
  // re-draw the graph if a node has been moved
  graphComponent.graph.addNodeLayoutChangedListener((sender, args) => scheduleRedraw())
  // re-draw if an item was created or deleted
  graphComponent.graph.addNodeCreatedListener((sender, args) => scheduleRedraw())
  graphComponent.graph.addNodeRemovedListener((sender, args) => scheduleRedraw())
  graphComponent.graph.addEdgeRemovedListener((sender, args) => scheduleRedraw())
}

/**
 * Starts the auto update timer, if not already running.
 */
function scheduleRedraw() {
  if (redrawTimerId > 0) {
    window.clearTimeout(redrawTimerId)
  }

  const mode = graphModelManager.graphOptimizationMode
  // check if auto-update is needed
  if (
    autoRedrawEnabled &&
    mode !== OptimizationMode.DEFAULT &&
    mode !== OptimizationMode.LEVEL_OF_DETAIL
  ) {
    // schedule another update
    redrawTimerId = window.setTimeout(redrawGraph, AUTO_REDRAW_DELAY)
  }
}

/**
 * Loads a graph from JSON data and places it in the {@link graphComponent}.
 * The loading indicator is shown prior to loading and hidden afterwards
 * @param {string} fileName The file name of the file with the sample graph
 */
async function loadGraph(fileName) {
  graphChooserBox.disabled = true
  nextButton.disabled = true
  previousButton.disabled = true

  // display the loading indicator
  setLoadingIndicatorVisibility(true)

  const fm = new FoldingManager()
  const fv = fm.createFoldingView()
  const graph = fv.graph
  updateDefaultStyles(graph)

  const graphData = await loadJSONData(`resources/${fileName}.json`)
  // load the graph from the data
  loadGraphCore(graph, graphData)

  graphChooserBox.disabled = false
  updateButtons()

  graphModelManager.dirty = true

  // hide the loading indicator after the graphComponent has finished rendering
  graphComponent.addUpdatedVisualListener(onGraphComponentRendered)

  graphComponent.graph = graph

  // check for labels
  onEdgeLabelsChanged()
  onNodeLabelsChanged()

  initializeAutoUpdates()

  preConfigurator.updatePreConfiguration()

  graphComponent.fitGraphBounds()
}

/**
 * Parses the sample data and creates the graph elements.
 * @param {IGraph} graph The graph to populate with the items.
 * @param {string} graphData The JSON data
 * @yjs:keep=nodeList,edgeList
 */
function loadGraphCore(graph, graphData) {
  graph.clear()
  // get the list of nodes and edges
  const nodes = graphData.nodeList
  const edges = graphData.edgeList

  // create a map to store the nodes for edge creation
  const nodeMap = {}
  // create the nodes
  let i
  for (i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    const l = n.l
    const layout = new Rect(l.x, l.y, l.w, l.h)
    const id = n.id
    const node = graph.createNode({ layout, tag: id })
    node.tag = getRandomInt(9)
    nodeMap[id] = node
  }

  // create the edges
  let i1
  for (i1 = 0; i1 < edges.length; i1++) {
    const e = edges[i1]
    // get the source and target node from the mapping
    const sourceNode = nodeMap[e.s]
    const targetNode = nodeMap[e.t]
    // create the source and target port
    const sp = typeof e.sp !== 'undefined' ? e.sp : {}
    const tp = typeof e.tp !== 'undefined' ? e.tp : {}

    const sx = typeof sp.x !== 'undefined' ? sp.x : sourceNode.layout.center.x
    const sy = typeof sp.y !== 'undefined' ? sp.y : sourceNode.layout.center.y
    const tx = typeof tp.x !== 'undefined' ? tp.x : targetNode.layout.center.x
    const ty = typeof tp.y !== 'undefined' ? tp.y : targetNode.layout.center.y
    const sourcePort = graph.addPortAt(sourceNode, new Point(sx, sy))
    const targetPort = graph.addPortAt(targetNode, new Point(tx, ty))
    // create the edge
    const edge = graph.createEdge(sourcePort, targetPort)
    // add the bends
    const bends = e.b
    if (bends) {
      bends.forEach(bend => {
        graph.addBend(edge, Point.from(bend))
      })
    }
  }

  // adjust default node size to have new nodes matching the graph
  graph.nodeDefaults.size =
    graph.nodes.size > 0 ? graph.nodes.first().layout.toSize() : new Size(30, 30)
}

/**
 * Reads the JSON data form a file.
 * @param {string} url The URL of the file
 * @returns {Promise} A promise that resolves when the data is loaded correctly
 */
async function loadJSONData(url) {
  const response = await fetch(url)
  return response.json()
}

/**
 * Forces repainting of the graph.
 */
function redrawGraph() {
  // force re-creation of the pre-rendered image
  graphModelManager.dirty = true
  graphComponent.invalidate()
}

/**
 * Helper method to initialize an {@link GraphEditorInputMode} for the graphComponent.
 * @param {boolean} isMoveMode Whether the input mode should be configured for "move only".
 * @return {IInputMode}
 */
function createEditorInputMode(isMoveMode) {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowCreateBend: false
  })

  // disable anything besides moving of nodes
  if (isMoveMode) {
    graphEditorInputMode.showHandleItems = GraphItemTypes.NONE
    graphEditorInputMode.clipboardOperationsAllowed = false
    graphEditorInputMode.allowEditLabelOnDoubleClick = false
    graphEditorInputMode.allowDuplicate = false
    graphEditorInputMode.allowAddLabel = false
    graphEditorInputMode.allowEditLabel = false
    graphEditorInputMode.allowCreateNode = false
    graphEditorInputMode.createEdgeInputMode.enabled = false
  }

  // use WebGL rendering for handles if possible, otherwise the handles are rendered using SVG
  if (webGlSupported) {
    graphEditorInputMode.handleInputMode.renderMode = RenderModes.WEB_GL
  }

  // assign a random number to each newly created node to determine its random svg image in the detail node style
  graphEditorInputMode.nodeCreator = (context, graph, location) =>
    graph.createNodeAt(location, null, getRandomInt(9))

  return graphEditorInputMode
}

/**
 * Returns the currently selected optimization mode of the {@link GraphModelManager}.
 * @return {OptimizationMode}
 */
function getGraphOptimizationMode() {
  if (defaultGmm.checked) {
    return OptimizationMode.DEFAULT
  }
  if (staticGmm.checked) {
    return OptimizationMode.STATIC
  }
  if (levelOfDetailGmm.checked) {
    return OptimizationMode.LEVEL_OF_DETAIL
  }
  if (svgImageGmm.checked) {
    return OptimizationMode.SVG_IMAGE
  }
  if (CanvasImageWithDrawCallbackGmm.checked) {
    return OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK
  }
  if (CanvasImageWithItemStylesGmm.checked) {
    return OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES
  }
  if (StaticCanvasImageGmm.checked) {
    return OptimizationMode.STATIC_CANVAS
  }
  if (StaticWebglImageGmm.checked) {
    return OptimizationMode.WEBGL
  }
  return OptimizationMode.DEFAULT
}

/**
 * Registers listeners, that are needed by the UI, on the graph.
 */
function registerListeners() {
  let zoomLevelChangedTimer = -1
  graphComponent.addZoomChangedListener(() => {
    // update the zom level display every 200ms
    if (zoomLevelChangedTimer >= 0) {
      return
    }
    zoomLevelChangedTimer = setTimeout(() => {
      zoomLevel.textContent = Math.floor(graphComponent.zoom * 100).toString()
      updateDetailLevelIndicator()
      zoomLevelChangedTimer = -1
    }, 200)
  })
  graphComponent.selection.addItemSelectionChangedListener(() => {
    selectionCount.textContent = graphComponent.selection.size.toString()
  })

  let updated = false
  // continuously reset the frame array every second, except when there were updateVisual calls
  const startFramerateTimer = () => {
    setTimeout(() => {
      if (!updated) {
        mainFrameRate.resetFrameArray()
      }
      updated = false
      startFramerateTimer()
    }, 1000)
  }
  startFramerateTimer()
  graphComponent.addUpdatedVisualListener(() => {
    mainFrameRate.showFps()
    updated = true
  })
}

/**
 * Updates the indicator that displays which rendering mode is currently active in {@link graphModelManager}.
 */
function updateDetailLevelIndicator() {
  let zoomState
  if (graphComponent.zoom < graphModelManager.$overviewZoomThreshold) {
    zoomState = 'Overview Level'
  } else if (graphComponent.zoom < graphModelManager.intermediateZoomThreshold) {
    zoomState = 'Intermediate Level'
  } else {
    zoomState = 'Detail Level'
  }
  const oldZoomState = detailLevelIndicator.zoomState
  if (oldZoomState !== zoomState) {
    detailLevelIndicator.zoomState = detailLevelIndicator.textContent = detailLevelPopup.textContent = zoomState
    detailLevelIndicator.className = 'background-highlight'
    setTimeout(() => {
      detailLevelIndicator.className = ''
    }, 2000)
    if (graphModelManager.graphOptimizationMode === OptimizationMode.LEVEL_OF_DETAIL) {
      detailLevelPopup.className = 'visible'
      setTimeout(() => {
        detailLevelPopup.className = ''
      }, 1000)
    }
  }
}

/**
 * Initializes the graph chooser.
 */
function initializeGraphChooserBox() {
  for (let i = 0; i < samples.length; i++) {
    const displayName = samples[i].displayName
    const option = document.createElement('option')
    option.text = displayName
    graphChooserBox.options.add(option)
  }
}

/**
 * Called when the input mode is changed by the user.
 */
function onModeChanged() {
  graphComponent.selection.clear()
  switch (modeChooserBox.selectedIndex) {
    default:
    case 0: {
      const graphViewerInputMode = new GraphViewerInputMode({
        allowClipboardOperations: false
      })
      graphComponent.inputMode = graphViewerInputMode
      preConfigurator.removeWarningCssClass()
      break
    }
    case 1: {
      graphComponent.inputMode = createEditorInputMode(true)
      preConfigurator.addWarningCssClass()
      break
    }
    case 2: {
      graphComponent.inputMode = createEditorInputMode(false)
      preConfigurator.addWarningCssClass()
      break
    }
  }
  updateRedrawGraphButton()
  ICommand.invalidateRequerySuggested()
  preConfigurator.updatePreConfiguration()
}

/**
 * Called when the optimization mode of the {@link GraphModelManager} is changed by the user.
 */
function updateOptimizationMode() {
  graphModelManager.graphOptimizationMode = getGraphOptimizationMode()
  graphComponent.invalidate()
  updateRedrawGraphButton()
}

function onFixLabelPositionsChanged() {
  const fixLabelPositions = fixLabelPositionsCheckbox.checked
  const graph = graphComponent.graph

  if (fixLabelPositions) {
    const freeLabelModel = new FreeLabelModel()
    graph.edgeLabels.forEach(label => {
      graph.setLabelLayoutParameter(label, freeLabelModel.createDynamic(label.layout))
    })
    graph.nodeLabels.forEach(label => {
      graph.setLabelLayoutParameter(label, freeLabelModel.createDynamic(label.layout))
    })
  } else {
    graph.edgeLabels.forEach(label => {
      graph.setLabelLayoutParameter(label, graph.edgeDefaults.labels.layoutParameter)
    })
    graph.nodeLabels.forEach(label => {
      graph.setLabelLayoutParameter(label, graph.nodeDefaults.labels.layoutParameter)
    })
  }

  fixLabelPositionsEnabled = fixLabelPositions
}

/**
 * Called when the auto redraw is changed by the user.
 */
function onAutoRedrawChanged() {
  const redrawEnabled = autoRedrawCheckbox.checked
  if (redrawEnabled) {
    redrawGraph()
  }
  autoRedrawEnabled = redrawEnabled
}

/**
 * Called when the 'previous graph' button was clicked.
 */
function onPreviousButtonClicked() {
  graphChooserBox.selectedIndex--
  onGraphChooserSelectionChanged()
}

/**
 * Called when the 'next graph' button was clicked.
 */
function onNextButtonClicked() {
  graphChooserBox.selectedIndex++
  onGraphChooserSelectionChanged()
}

/**
 * Called when the selected item in the graph chooser combo box has changed.
 */
function onGraphChooserSelectionChanged() {
  const sampleObject = samples[graphChooserBox.selectedIndex]
  if (!sampleObject) {
    return
  }
  // Load the graph from source file
  loadGraph(sampleObject.fileName)
}

/**
 * Called when the fps checkbox is enabled/disabled.
 */
function onFpsCheckboxChanged() {
  mainFrameRate.isEnabled = fpsCheckbox.checked
}

/**
 * Called when The 'Zoom animation' button was clicked.
 */
async function onZoomAnimationClicked() {
  startAnimation()
  const node = getRandomNode()
  graphComponent.center = node.layout.center

  const animation = new ZoomInAndBackAnimation(graphComponent, 10, TimeSpan.fromSeconds(5))
  const animator = new Animator(graphComponent)
  const result = await animator.animate(animation)
  endAnimation(result)
}

/**
 * Called when the 'Pan animation' button was clicked.
 */
async function onPanAnimationClicked() {
  startAnimation()
  const animation = new CirclePanAnimation(graphComponent, 2, TimeSpan.fromSeconds(2))
  const animator = new Animator(graphComponent)
  const result = await animator.animate(animation)
  endAnimation(result)
}

/**
 * Called when the 'Spiral zoom animation' button was clicked.
 */
async function onSpiralZoomAnimationClicked() {
  startAnimation()
  const node = getRandomNode()
  graphComponent.center = node.layout.center.add(new Point(graphComponent.viewport.width / 4, 0))

  const zoom = new ZoomInAndBackAnimation(graphComponent, 10, TimeSpan.fromSeconds(10))
  const pan = new CirclePanAnimation(graphComponent, 14, TimeSpan.fromSeconds(10))
  const animation = IAnimation.createParallelAnimation([zoom, pan])
  const animator = new Animator(graphComponent)
  const result = await animator.animate(animation)
  endAnimation(result)
}

/**
 * Called when 'Move nodes' button was clicked.
 */
async function onNodeAnimationClicked() {
  startAnimation()
  const selection = graphComponent.selection
  // If there is nothing selected, just use a random node
  if (selection.selectedNodes.size === 0) {
    selection.setSelected(getRandomNode(), true)
  }

  const animation = new CircleNodeAnimation(
    graphComponent.graph,
    selection.selectedNodes,
    graphComponent.viewport.width / 10,
    2,
    TimeSpan.fromSeconds(2)
  )
  const animator = new Animator(graphComponent)
  const result = await animator.animate(animation)
  endAnimation(result)
  redrawGraph()
}

/**
 * Called when the 'Select nothing' button was clicked..
 */
function onSelectNothingClicked() {
  graphComponent.selection.clear()
}

/**
 * Called when the 'Select 1000 random nodes' button was clicked.
 */
function onSelect1000NodesClicked() {
  const shuffledNodes = shuffle(graphComponent.graph.nodes.toArray())
  const selectNodes = shuffledNodes.slice(0, 1000)
  selectNodes.forEach(node => {
    graphComponent.selection.setSelected(node, true)
  })
}

/**
 * Called when the 'Select 1000 random edges' button was clicked.
 */
function onSelect1000EdgesClicked() {
  const shuffledEdges = shuffle(graphComponent.graph.edges.toArray())
  const selectEdges = shuffledEdges.slice(0, 1000)
  selectEdges.forEach(edge => {
    graphComponent.selection.setSelected(edge, true)
  })
}

/**
 * Called when the 'Select 1000 random labels' button was clicked.
 */
function onSelect1000LabelsClicked() {
  const labels = graphComponent.graph.nodeLabels.toArray()
  labels.concat(graphComponent.graph.edgeLabels.toArray())
  const shuffledLabels = shuffle(labels)
  const selectLabels = shuffledLabels.slice(0, 1000)
  selectLabels.forEach(label => {
    graphComponent.selection.setSelected(label, true)
  })
}

/**
 * Called when the 'Select all nodes' button was clicked.
 */
function onSelectAllNodesClicked() {
  const nodes = graphComponent.graph.nodes
  nodes.forEach(node => {
    graphComponent.selection.setSelected(node, true)
  })
}

/**
 * Called when the 'Select all edges' button was clicked.
 */
function onSelectAllEdgesClicked() {
  const edges = graphComponent.graph.edges
  edges.forEach(edge => {
    graphComponent.selection.setSelected(edge, true)
  })
}

/**
 * Called when the 'Select all labels' button was clicked.
 */
function onSelectAllLabelsClicked() {
  const labels = graphComponent.graph.nodeLabels.toArray()
  labels.concat(graphComponent.graph.edgeLabels.toArray())
  labels.forEach(label => {
    graphComponent.selection.setSelected(label, true)
  })
}

/**
 * Called when the 'Select everything' button was clicked.
 */
function onSelectEverythingClicked() {
  onSelectAllNodesClicked()
  onSelectAllEdgesClicked()
  onSelectAllLabelsClicked()
}

/**
 * Disables the 'Previous/Next graph' buttons in the UI according to whether there is a previous/next graph to switch.
 */
function updateButtons() {
  nextButton.disabled = graphChooserBox.selectedIndex === graphChooserBox.options.length - 1
  previousButton.disabled = graphChooserBox.selectedIndex === 0
}

/**
 * Disables/enables the redraw graph button.
 */
function updateRedrawGraphButton() {
  const mode = graphModelManager.graphOptimizationMode
  const redrawEnabled =
    !(graphComponent.inputMode instanceof GraphViewerInputMode) &&
    mode !== OptimizationMode.DEFAULT &&
    mode !== OptimizationMode.LEVEL_OF_DETAIL &&
    !(
      mode === OptimizationMode.STATIC &&
      (simpleCanvasStyle.checked || complexCanvasStyle.checked || simpleWebglStyle.checked)
    )

  redrawGraphButton.disabled = !redrawEnabled
  if (redrawEnabled) {
    autoRedrawCheckbox.setAttribute('checked', '')
    autoRedrawCheckbox.removeAttribute('disabled')
  } else {
    autoRedrawCheckbox.removeAttribute('checked')
    autoRedrawCheckbox.setAttribute('disabled', '')
  }
}

/**
 * Helper method to hide the loading indicator after the {@link graphComponent} has finished
 * the initial rendering.
 */
function onGraphComponentRendered() {
  // de-register the event handler after it has been executed
  graphComponent.removeUpdatedVisualListener(onGraphComponentRendered)
  // hide the loading indicator
  setLoadingIndicatorVisibility(false)
}

/**
 * Helper method that disables the animation buttons and hides the scrollbars when starting an animation.
 */
function startAnimation() {
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.NEVER
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.NEVER
  disableButtons()
}

/**
 * Helper method to reset the animation buttons and the scrollbars when an animation has finished.
 */
function endAnimation() {
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED
  mainFrameRate.resetFrameArray()
  enableButtons()
}

/**
 * Disable buttons during animation.
 */
function disableButtons() {
  let arr
  let i
  for (i = 0, arr = disabledButtonsDuringAnimation; i < arr.length; i++) {
    const button = arr[i]
    button.disabled = true
    addClass(button, 'disabled-button')
  }
}

/**
 * Enable buttons after animation is done.
 */
function enableButtons() {
  let arr
  let i
  for (i = 0, arr = disabledButtonsDuringAnimation; i < arr.length; i++) {
    const button = arr[i]
    button.disabled = false
    removeClass(button, 'disabled-button')
  }
}

/**
 * Displays or hides the loading indicator.
 * @param {boolean} visible
 */
function setLoadingIndicatorVisibility(visible) {
  loadingIndicator.style.display = visible ? 'block' : 'none'
}

/**
 * Updates the styles according to the currently chosen graph item style.
 */
function updateItemStyles() {
  const graph = graphComponent.graph
  updateDefaultStyles(graph)
  updateRedrawGraphButton()

  graph.nodes.forEach(node => {
    graph.setStyle(node, graph.nodeDefaults.style)
  })
  graph.edges.forEach(edge => {
    graph.setStyle(edge, graph.edgeDefaults.style)
  })
  graph.nodeLabels.forEach(label => {
    graph.setStyle(label, graph.nodeDefaults.labels.style)
  })
  graph.edgeLabels.forEach(label => {
    graph.setStyle(label, graph.edgeDefaults.labels.style)
  })

  // update the rendering
  graphModelManager.dirty = true
  graphComponent.invalidate()
}

/**
 * @param {IGraph} graph
 */
function updateDefaultStyles(graph) {
  let nodeStyle = null
  let edgeStyle = null
  let labelStyle = null

  let overviewColor
  let intermediateColor

  // handle the graph item style
  if (simpleSvgStyle.checked) {
    overviewColor = new Color(250, 128, 114)
    intermediateColor = new Color(246, 33, 8)
    nodeStyle = new SimpleSvgNodeStyle(new Color(140, 18, 4))
    edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new SvgLabelStyle()
  } else if (complexSvgStyle.checked) {
    overviewColor = new Color(212, 184, 255)
    intermediateColor = new Color(132, 52, 255)
    nodeStyle = new ComplexSvgNodeStyle()
    edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new SvgLabelStyle()
  } else if (simpleCanvasStyle.checked) {
    overviewColor = new Color(135, 206, 250)
    intermediateColor = new Color(24, 160, 245)
    nodeStyle = new SimpleCanvasNodeStyle(new Color(6, 93, 147))
    edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new CanvasLabelStyle()
  } else if (complexCanvasStyle.checked) {
    overviewColor = new Color(192, 242, 192)
    intermediateColor = new Color(84, 219, 84)
    nodeStyle = new ComplexCanvasNodeStyle()
    edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new CanvasLabelStyle()
  } else if (simpleWebglStyle.checked) {
    overviewColor = new Color(210, 190, 75)
    intermediateColor = new Color(159, 141, 39)
    nodeStyle = new WebGLShapeNodeStyle({
      color: 'rgb(91, 81, 22)'
    })
    edgeStyle = new WebGLPolylineEdgeStyle({
      thickness: edgeThickness,
      color: edgeColor
    })
    labelStyle = new CanvasLabelStyle()
  }

  graphModelManager.overviewNodeStyle = webGlSupported
    ? new WebGLShapeNodeStyle({ color: overviewColor })
    : new SimpleSvgNodeStyle(overviewColor)
  graphModelManager.intermediateNodeStyle = new SimpleSvgNodeStyle(intermediateColor)

  graph.nodeDefaults.style = nodeStyle
  graph.edgeDefaults.style = edgeStyle
  graph.nodeDefaults.labels.style = labelStyle
  graph.edgeDefaults.labels.style = labelStyle
}

/**
 * Adds a label to each node.
 */
function onNodeLabelsChanged() {
  const graph = graphComponent.graph
  if (nodeLabelsCheckbox.checked) {
    // add labels
    graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
      insets: [0, 0, 5, 0]
    }).createParameter(ExteriorLabelModelPosition.SOUTH)
    const freeLabelModel = new FreeLabelModel()
    let i = 1
    graph.nodes.forEach(node => {
      const label = graph.addLabel(node, `No.${i}`)
      if (fixLabelPositionsEnabled) {
        graph.setLabelLayoutParameter(label, freeLabelModel.createDynamic(label.layout))
      }
      i++
    })
  } else {
    // remove labels
    graph.nodes.forEach(node => {
      const labels = node.labels.toArray()
      let i1
      for (i1 = 0; i1 < labels.length; i1++) {
        const label = labels[i1]
        graph.remove(label)
      }
    })
  }
  redrawGraph()
}

/**
 * Adds a label to each edge.
 */
function onEdgeLabelsChanged() {
  const graph = graphComponent.graph
  if (edgeLabelsCheckbox.checked) {
    // add label on each edge
    const edgeLabelModel = new EdgePathLabelModel({
      distance: 5,
      sideOfEdge: EdgeSides.ABOVE_EDGE,
      edgeRelativeDistance: false
    })
    const freeLabelModel = new FreeLabelModel()
    graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()
    graph.edges.forEach(edge => {
      const label = graph.addLabel(edge, 'Edge')
      if (fixLabelPositionsEnabled) {
        graph.setLabelLayoutParameter(label, freeLabelModel.createDynamic(label.layout))
      }
    })
  } else {
    // remove label on each edge
    graph.edges.forEach(edge => {
      const labels = edge.labels.toArray()
      let i
      for (i = 0; i < labels.length; i++) {
        const label = labels[i]
        graph.remove(label)
      }
    })
  }
  redrawGraph()
}

/**
 * Returns a random node from the graph.
 * @return {INode} A random node from the graph.
 */
function getRandomNode() {
  const nodes = graphComponent.graph.nodes.toList()
  return nodes.get(getRandomInt(nodes.size))
}

/**
 * @param {number} upper
 * @return {number}
 */
function getRandomInt(upper) {
  return Math.floor(Math.random() * upper)
}

/**
 * Fisher Yates Shuffle for arrays.
 * @param {Array} array
 * @return {Array} Shuffled Array.
 */
function shuffle(array) {
  let m = array.length
  let t
  let i
  while (m > 0) {
    // pick a remaining element
    i = getRandomInt(m)
    m--
    // swap with current element
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }
  return array
}

class FPSMeter {
  /**
   * Creates a new fps counter and initializes the fields.
   */
  constructor() {
    this.scale = Math.floor(65.0 / 60.0)
    this.frameCache = []
    this.fpsHistory = []
    this.fpsSpan = document.getElementById('fps')
    this.canvasCtx = null

    this.$isEnabled = true

    // configure canvas
    const canvas = document.getElementById('fpsMeter')
    canvas.width = 200
    canvas.height = 75
    this.canvasCtx = canvas.getContext('2d')

    this.cacheSize = 20
    this.timerId = 0

    // draw empty background of the fps meter
    this.drawBackground()
  }

  /** @type {boolean} */
  get isEnabled() {
    return this.$isEnabled
  }

  /** @type {boolean} */
  set isEnabled(value) {
    this.$isEnabled = value
    if (!this.$isEnabled) {
      this.fpsSpan.textContent = '-'
      this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      this.canvasCtx.fillRect(0, 5, 200, 65)
      document.getElementById('gt40').setAttribute('style', 'color: #ADADAD')
      document.getElementById('lt20').setAttribute('style', 'color: #ADADAD')
    } else {
      this.fpsSpan.textContent = ''
      if (this.canvasCtx) {
        this.drawFps()
      }
      document.getElementById('gt40').setAttribute('style', 'color: #FFFFFF')
      document.getElementById('lt20').setAttribute('style', 'color: #FFFFFF')
    }
  }

  /**
   * Calculates and shows the frame rate. To be called once on each new frame.
   */
  showFps() {
    if (!this.isEnabled) {
      return
    }
    const time = new Date().getTime()
    const cache = this.frameCache
    cache.push(time)
    if (cache.length > this.cacheSize) {
      cache.shift()
    } else if (cache.size < 3) {
      // have at least 3 frames to calculate the framerate
      return
    }

    // update the UI periodically
    if (this.timerId === 0) {
      this.timerId = setTimeout(() => {
        const d = (cache[cache.length - 1] - cache[0]) * 0.001
        // Depending on the load, yFiles is capable of higher update rates than 60 fps.
        // However, most browsers can render at most 60 fps and to display the actual
        // re-drawing frequency, we limit the displayed fps to 60.
        const fps = Math.min(Math.floor(this.cacheSize / d), 60)
        this.timerId = 0
        this.fpsSpan.textContent = fps.toString()

        // visualize fps
        const fpsHist = this.fpsHistory
        fpsHist.push(fps)
        if (fpsHist.length > this.cacheSize) {
          fpsHist.shift()
        } else if (fpsHist.length < 2) {
          return
        }
        this.drawFps()
      }, 50)
    }
  }

  /**
   * Resets the internal cached frame times.
   */
  resetFrameArray() {
    this.frameCache = []
  }

  /**
   * Update the canvas.
   */
  drawFps() {
    this.canvasCtx.clearRect(0, 0, 200, 75)

    this.drawBackground()

    const slot = Math.floor(200.0 / this.cacheSize)
    this.canvasCtx.moveTo(0, 5)
    this.canvasCtx.beginPath()
    for (let i = 0; i < this.fpsHistory.length; i++) {
      this.canvasCtx.lineTo(i * slot, 70 - this.fpsHistory[i] * this.scale)
    }
    this.canvasCtx.stroke()
  }

  /**
   * Draws the striped background of the fps meter.
   */
  drawBackground() {
    // > 40 fps
    this.canvasCtx.fillStyle = 'rgba(0, 160, 0, 0.4)'
    this.canvasCtx.fillRect(0, 5, 200, this.scale * 25)
    // consider y-offset

    // 40 - 20 fps
    this.canvasCtx.fillStyle = 'rgba(255, 110, 0, 0.4)'
    this.canvasCtx.fillRect(0, this.scale * 30, 200, this.scale * 20)

    // < 20 fps
    this.canvasCtx.fillStyle = 'rgba(160, 0, 0, 0.4)'
    this.canvasCtx.fillRect(0, this.scale * 50, 200, this.scale * 20)
  }
}

// run the demo
loadJson().then(run)
