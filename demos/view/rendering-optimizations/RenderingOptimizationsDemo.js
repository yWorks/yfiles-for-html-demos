/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
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
  IEdge,
  IEdgeStyle,
  IGraph,
  IInputMode,
  IInputModeContext,
  ILabel,
  ILabelStyle,
  IModelItem,
  INode,
  INodeStyle,
  License,
  Point,
  Rect,
  RenderModes,
  ScrollBarVisibility,
  Size,
  TimeSpan,
  WebGL2DefaultLabelStyle,
  WebGL2GraphModelManager,
  WebGL2GroupNodeStyle,
  WebGL2IconNodeStyle,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle,
  WebGL2Stroke,
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
import PreConfigurator from './resources/PreConfigurator.js'
import samples from './resources/samples.js'
import { createCanvasContext, createUrlIcon } from 'demo-utils/IconCreation'
import { FPSMeter } from './FPSMeter.js'
import { fetchLicense } from 'demo-resources/fetch-license'
import { BrowserDetection } from 'demo-utils/BrowserDetection'
import { addNavigationButtons, finishLoading, showLoadingIndicator } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/** @type {GraphComponent} */
let graphComponent

/**
 * The time to wait after an edit event until a redrawing should be performed.
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
let redrawTimerId = 0

/**
 * Holds the custom graphModelManager
 * @type {FastGraphModelManager}
 */
let fastGraphModelManager

/**
 * Controls for the benchmarking ui
 * @type {FPSMeter}
 */
let mainFrameRate

/**
 * The pre-configurations for different sized graphs
 * @type {PreConfigurator}
 */
let preConfigurator

/**
 * Timer for setting the z-index after fade-out finished
 * @type {number}
 */
let tooltipTimer = 0

const webGLImageData = []

/**
 * The default edge thickness
 */
const edgeThickness = 5

const redrawGraphButton = document.querySelector('#redrawGraphButton')
const modeChooserBox = document.querySelector('#modeChooserBox')
const graphChooserBox = document.querySelector('#graphChooserBox')
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
const zoomLevel = document.querySelector('#zoomLevel')
const selectionCount = document.querySelector('#selection')

/**
 * Holds the buttons that need to be disabled during animation
 */
const disabledButtonsDuringAnimation = [
  document.querySelector('#panAnimationBtn'),
  document.querySelector('#zoomAnimationBtn'),
  document.querySelector('#spiralAnimationBtn'),
  document.querySelector('#moveNodeAnimationBtn')
]

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent, { scale: 1 })

  graphComponent.minimumZoom = 0.005

  // assign the custom GraphModelManager
  fastGraphModelManager = createFastGraphModelManager(graphComponent)

  if (BrowserDetection.webGL2) {
    graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
  }

  await prepareWebGL2Rendering()

  // initialize fps meter
  mainFrameRate = new FPSMeter()

  registerListeners(graphComponent)

  preConfigurator = new PreConfigurator(graphComponent)

  initializeUI(graphComponent)

  registerTooltips()

  onGraphChooserSelectionChanged()
}

/**
 * Checks whether WebGl2 is supported and updates the corresponding UI buttons.
 * @returns {!Promise}
 */
async function prepareWebGL2Rendering() {
  if (BrowserDetection.webGL2) {
    await createWebGLImageData(webGLImageData)
  } else {
    // if the browser does not support WebGL2, disable this option
    document.querySelector('#WebglGmm-radio').disabled = true
    document.querySelector('#WebglGmm-label').setAttribute('data-no-webgl-support', '')
    levelOfDetailGmm.checked = true
  }
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
      labelElement.addEventListener('mouseover', () => {
        showTooltip(labelElement.getAttribute('for'))
      })
      labelElement.addEventListener('mouseout', () => {
        hideTooltip()
      })
    }

    // input element listeners
    const inputElement = elements[i]
    inputElement.addEventListener('mouseover', () => {
      // the hasTooltip class may be directly on the label element
      showTooltip(inputElement.id !== '' ? inputElement.id : inputElement.getAttribute('for'))
    })
    inputElement.addEventListener('mouseout', () => {
      hideTooltip()
    })
  }
}

/**
 * Helper method to show a tooltip
 * @param {!string} id
 */
function showTooltip(id) {
  clearTimeout(tooltipTimer)

  const tooltipDiv = document.querySelector('#tooltip')
  const srcElement = document.getElementById(id)
  const infoElement = document.querySelector(`#${id}-info`)

  tooltipDiv.innerHTML = ''

  tooltipDiv.setAttribute('class', 'info-visible arrow')
  if (infoElement == null) {
    return
  }
  const tooltipContent = infoElement.cloneNode(true)
  tooltipDiv.appendChild(tooltipContent)

  const labelElement = srcElement.type === 'label' ? srcElement : srcElement.nextElementSibling
  if (labelElement.nodeName === 'LABEL') {
    const warning = labelElement.className.indexOf('warning') >= 0
    if (warning) {
      tooltipDiv.appendChild(document.querySelector('#warningToolTip').cloneNode(true))
    }
    const webglWarning = labelElement.hasAttribute('data-no-webgl-support')
    if (webglWarning) {
      tooltipDiv.appendChild(document.querySelector('#webglWarningToolTip').cloneNode(true))
    }
    const unrecommended = labelElement.className.indexOf('unrecommended') >= 0
    if (unrecommended) {
      tooltipDiv.appendChild(document.querySelector('#unrecommendedToolTip').cloneNode(true))
    }
  }

  const top =
    srcElement.getBoundingClientRect().top - tooltipDiv.getBoundingClientRect().height * 0.5
  tooltipDiv.setAttribute('style', `top:${top}px; right: 390px; overflow-wrap: break-word;`)
}

/**
 * Helper method that hides the tooltip.
 */
function hideTooltip() {
  const tooltip = document.querySelector('#tooltip')
  tooltip.setAttribute('class', 'info-hidden arrow')
  tooltipTimer = window.setTimeout(() => {
    tooltip.style.zIndex = '0'
  }, 350)
}

/**
 * Sets the custom {@link FastGraphModelManager} as the graphComponent's
 * {@link GraphComponent.graphModelManager}.
 * @param {!GraphComponent} graphComponent
 * @returns {!FastGraphModelManager}
 */
function createFastGraphModelManager(graphComponent) {
  const fastGraphModelManager = new FastGraphModelManager(
    graphComponent,
    graphComponent.contentGroup
  )
  fastGraphModelManager.intermediateNodeStyle = new SimpleSvgNodeStyle(Color.from('#FF6C00'))
  const edgeColor = Color.from('#662b00')
  fastGraphModelManager.intermediateEdgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
  if (BrowserDetection.webGL) {
    fastGraphModelManager.overviewEdgeStyle = new WebGLTaperedEdgeStyle({
      thickness: 30,
      color: edgeColor
    })
  } else {
    simpleWebglStyle.disabled = true
    StaticWebglImageGmm.disabled = true
    document.querySelector('.no-webgl-support').style.display = 'block'
  }
  return fastGraphModelManager
}

/**
 * Initialize the auto updates.
 * @param {!IGraph} graph
 */
function initializeAutoUpdates(graph) {
  // re-draw the graph if a node has been moved
  graph.addNodeLayoutChangedListener(() => scheduleRedraw())
  // re-draw if an item was created or deleted
  graph.addNodeCreatedListener(() => scheduleRedraw())
  graph.addNodeRemovedListener(() => scheduleRedraw())
  graph.addEdgeRemovedListener(() => scheduleRedraw())
}

/**
 * Starts the auto update timer, if not already running.
 */
function scheduleRedraw() {
  if (redrawTimerId) {
    clearTimeout(redrawTimerId)
  }

  const graphModelManager = graphComponent.graphModelManager
  if (!(graphModelManager instanceof FastGraphModelManager)) {
    return
  }

  const mode = graphModelManager.graphOptimizationMode
  if (
    autoRedrawEnabled &&
    mode != null &&
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
 * @param {!string} fileName The file name of the file with the sample graph
 * @returns {!Promise}
 */
async function loadGraph(fileName) {
  graphChooserBox.disabled = true

  // display the loading indicator
  await showLoadingIndicator(true)

  const fm = new FoldingManager()
  const fv = fm.createFoldingView()
  const graph = fv.graph
  updateDefaultStyles(graph)

  const graphData = await loadJSONData(`resources/${fileName}.json`)
  // load the graph from the data
  loadGraphCore(graph, graphData)
  graphComponent.graph = graph

  //Disable moving of individual edge segments in WebGL2 mode
  graphComponent.graph.decorator.edgeDecorator.positionHandlerDecorator.hideImplementation(
    () => getGraphOptimizationMode() == null
  )

  setWebGLItemStyles()

  graphChooserBox.disabled = false

  fastGraphModelManager.dirty = true

  // hide the loading indicator after the graphComponent has finished rendering
  graphComponent.addUpdatedVisualListener(onGraphComponentRendered)

  // check for labels
  onEdgeLabelsChanged(graphComponent.graph)
  onNodeLabelsChanged(graphComponent.graph)
  redrawGraph()

  initializeAutoUpdates(graphComponent.graph)

  preConfigurator.updatePreConfiguration()

  graphComponent.fitGraphBounds()
}

/**
 * Parses the sample data and creates the graph elements.
 * @param {!IGraph} graph The graph to populate with the items.
 * @param {!object} graphData The JSON data.
 * @param graphData.nodeList The data items of the nodes.
 * @param graphData.edgeList The data items of the nodes.
 * @yjs:keep = nodeList,edgeList
 */
function loadGraphCore(graph, graphData) {
  graph.clear()

  // create a map to store the nodes for edge creation
  const nodeMap = {}
  // create the nodes
  for (const n of graphData.nodeList) {
    const l = n.l
    const layout = new Rect(l.x, l.y, l.w, l.h)
    const id = n.id
    const node = graph.createNode({ layout, tag: id })
    node.tag = getRandomInt(10)
    nodeMap[id] = node
  }

  // create the edges
  for (const e of graphData.edgeList) {
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
      bends.forEach((bend) => {
        graph.addBend(edge, bend)
      })
    }
  }

  // adjust default node size to have new nodes matching the graph
  graph.nodeDefaults.size =
    graph.nodes.size > 0 ? graph.nodes.first().layout.toSize() : new Size(30, 30)
}

/**
 * Reads the JSON data form a file.
 * @param {!string} url The URL of the file
 * @returns {!Promise} A promise that resolves when the data is loaded correctly
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
  fastGraphModelManager.dirty = true
  graphComponent.invalidate()
}

/**
 * Helper method to initialize an {@link GraphEditorInputMode} for the graphComponent.
 * @param {boolean} isMoveMode Whether the input mode should be configured for "move only".
 * @returns {!IInputMode}
 */
function createEditorInputMode(isMoveMode) {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowCreateBend: false
  })

  // disable anything besides moving of nodes
  if (isMoveMode) {
    graphEditorInputMode.showHandleItems = GraphItemTypes.NONE
    graphEditorInputMode.allowClipboardOperations = false
    graphEditorInputMode.allowEditLabelOnDoubleClick = false
    graphEditorInputMode.allowDuplicate = false
    graphEditorInputMode.allowAddLabel = false
    graphEditorInputMode.allowEditLabel = false
    graphEditorInputMode.allowCreateNode = false
    graphEditorInputMode.createEdgeInputMode.enabled = false
  }

  // use WebGL rendering for handles if possible, otherwise the handles are rendered using SVG
  if (BrowserDetection.webGL2) {
    Class.ensure(WebGL2GraphModelManager)
    graphEditorInputMode.handleInputMode.renderMode = RenderModes.WEB_GL2
  }

  // assign a random number to each newly created node to determine its random svg image in the detail node style
  graphEditorInputMode.nodeCreator = (context, graph, location) =>
    graph.createNodeAt(location, null, getRandomInt(10))

  updateGraphEditorInputMode(graphEditorInputMode)

  return graphEditorInputMode
}

/**
 * Returns the currently selected optimization mode of the {@link GraphModelManager}.
 * @returns {?number}
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
  return null
}

/**
 * Registers listeners, that are needed by the UI, on the graph.
 * @param {!GraphComponent} graphComponent
 */
function registerListeners(graphComponent) {
  let zoomLevelChangedTimer = -1
  graphComponent.addZoomChangedListener(() => {
    // update the zom level display every 200ms
    if (zoomLevelChangedTimer >= 0) {
      return
    }
    zoomLevelChangedTimer = window.setTimeout(() => {
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
 * Updates the indicator that displays which rendering mode is currently active in
 * {@link fastGraphModelManager}.
 */
function updateDetailLevelIndicator() {
  const indicator = detailLevelIndicator
  const zoomState = getDetailLevel(graphComponent.graphModelManager)
  const oldZoomState = indicator.zoomState
  if (oldZoomState !== zoomState) {
    indicator.textContent = zoomState
    indicator.zoomState = zoomState
    // emphasize new level of detail message
    indicator.className = 'background-highlight'
    // after 2 seconds, remove emphasis again
    setTimeout(() => {
      indicator.className = ''
    }, 2000)

    if (showDetailLevelPopup(graphComponent.graphModelManager)) {
      detailLevelPopup.textContent = zoomState
      // show new level of detail popup
      detailLevelPopup.className = 'visible'
      // after 2 seconds, hide popup again
      setTimeout(() => {
        detailLevelPopup.className = ''
      }, 1000)
    }
  }
}

/**
 * Determines if users should get a level of detail popup notification in addition to
 * the regular level of detail indicator update.
 * @param {!GraphModelManager} manager
 * @returns {boolean}
 */
function showDetailLevelPopup(manager) {
  return (
    manager instanceof FastGraphModelManager &&
    manager.graphOptimizationMode === OptimizationMode.LEVEL_OF_DETAIL
  )
}

/**
 * Determines the detail level of the given graph model manager.
 * If the given manager is not a {@link FastGraphModelManager}, zoom factor independent
 * WebGL2 rendering is used.
 * @param {!GraphModelManager} graphModelManager
 * @returns {!string}
 */
function getDetailLevel(graphModelManager) {
  if (graphModelManager instanceof FastGraphModelManager) {
    if (graphComponent.zoom < graphModelManager.overviewZoomThreshold) {
      return 'Overview Level'
    } else if (graphComponent.zoom < graphModelManager.intermediateZoomThreshold) {
      return 'Intermediate Level'
    } else {
      return 'Detail Level'
    }
  } else {
    return 'WebGL2 Rendering'
  }
}

/**
 * Initializes the graph chooser.
 */
function initializeGraphChooserBox() {
  samples.forEach((sample) => {
    const displayName = sample.displayName
    const option = document.createElement('option')
    option.text = displayName
    graphChooserBox.options.add(option)
  })

  graphChooserBox.selectedIndex = 1
}

/**
 * Called when the input mode is changed by the user.
 */
function onModeChanged() {
  graphComponent.selection.clear()

  switch (modeChooserBox.selectedIndex) {
    default:
    case 0: {
      graphComponent.inputMode = new GraphViewerInputMode({
        allowClipboardOperations: false
      })
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
  const optimizationMode = getGraphOptimizationMode()
  const shouldUseWebGL2 = optimizationMode == null
  const wasUsingWebGL2 = graphComponent.graphModelManager instanceof WebGL2GraphModelManager
  if (shouldUseWebGL2) {
    graphComponent.graphModelManager = new StyledWebGL2GraphModelManager()
    graphComponent.focusIndicatorManager.enabled = false
  } else {
    graphComponent.focusIndicatorManager.enabled = true
    fastGraphModelManager.graphOptimizationMode = optimizationMode
    graphComponent.graphModelManager = fastGraphModelManager
  }
  // if the GMM changes, the styles might need an update, to reflect the current UI settings
  if (shouldUseWebGL2 !== wasUsingWebGL2) {
    updateItemStyles()
  }
  if (graphComponent.inputMode instanceof GraphEditorInputMode) {
    updateGraphEditorInputMode(graphComponent.inputMode)
  }
  graphComponent.invalidate()

  updateRedrawGraphButton()
  updateDetailLevelIndicator()
}

function onFixLabelPositionsChanged() {
  const fixLabelPositions = fixLabelPositionsCheckbox.checked
  const graph = graphComponent.graph

  if (fixLabelPositions) {
    const freeLabelModel = new FreeLabelModel()
    graph.edgeLabels.forEach((label) => {
      graph.setLabelLayoutParameter(label, freeLabelModel.createDynamic(label.layout))
    })
    graph.nodeLabels.forEach((label) => {
      graph.setLabelLayoutParameter(label, freeLabelModel.createDynamic(label.layout))
    })
  } else {
    graph.edgeLabels.forEach((label) => {
      graph.setLabelLayoutParameter(label, graph.edgeDefaults.labels.layoutParameter)
    })
    graph.nodeLabels.forEach((label) => {
      graph.setLabelLayoutParameter(label, graph.nodeDefaults.labels.layoutParameter)
    })
  }

  fixLabelPositionsEnabled = fixLabelPositions
}

/**
 * @param {!GraphEditorInputMode} geim
 */
function updateGraphEditorInputMode(geim) {
  if (getGraphOptimizationMode() == null) {
    //additional optimizations for WebGL
    //Completely disable handles for ports and edges
    geim.showHandleItems = GraphItemTypes.ALL & ~GraphItemTypes.PORT & ~GraphItemTypes.EDGE
  } else {
    //restore the defaults
    geim.showHandleItems = GraphItemTypes.ALL
  }
  geim.requeryHandles()
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
 * Called when the selected item in the graph chooser combo box has changed.
 */
function onGraphChooserSelectionChanged() {
  const sampleObject = samples[graphChooserBox.selectedIndex]
  if (sampleObject) {
    // Load the graph from source file
    void loadGraph(sampleObject.fileName)
  }
}

/**
 * Called when the fps checkbox is enabled/disabled.
 */
function onFpsCheckboxChanged() {
  mainFrameRate.enabled = fpsCheckbox.checked
}

/**
 * Called when The 'Zoom animation' button was clicked.
 * @returns {!Promise}
 */
async function onZoomAnimationClicked() {
  startAnimation()
  const node = getRandomNode()
  graphComponent.center = node.layout.center

  const animation = new ZoomInAndBackAnimation(graphComponent, 10, TimeSpan.fromSeconds(5))
  const animator = new Animator(graphComponent)
  await animator.animate(animation)
  endAnimation()
}

/**
 * Called when the 'Pan animation' button was clicked.
 * @returns {!Promise}
 */
async function onPanAnimationClicked() {
  startAnimation()
  const animation = new CirclePanAnimation(graphComponent, 2, TimeSpan.fromSeconds(2))
  const animator = new Animator(graphComponent)
  await animator.animate(animation)
  endAnimation()
}

/**
 * Called when the 'Spiral zoom animation' button was clicked.
 * @returns {!Promise}
 */
async function onSpiralZoomAnimationClicked() {
  startAnimation()
  const node = getRandomNode()
  graphComponent.center = node.layout.center.add(new Point(graphComponent.viewport.width / 4, 0))

  const zoom = new ZoomInAndBackAnimation(graphComponent, 10, TimeSpan.fromSeconds(10))
  const pan = new CirclePanAnimation(graphComponent, 14, TimeSpan.fromSeconds(10))
  const animation = IAnimation.createParallelAnimation([zoom, pan])
  const animator = new Animator(graphComponent)
  await animator.animate(animation)
  endAnimation()
}

/**
 * Called when 'Move nodes' button was clicked.
 * @returns {!Promise}
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
  await animator.animate(animation)
  endAnimation()
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
  selectNodes.forEach((node) => {
    graphComponent.selection.setSelected(node, true)
  })
}

/**
 * Called when the 'Select 1000 random edges' button was clicked.
 */
function onSelect1000EdgesClicked() {
  const shuffledEdges = shuffle(graphComponent.graph.edges.toArray())
  const selectEdges = shuffledEdges.slice(0, 1000)
  selectEdges.forEach((edge) => {
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
  selectLabels.forEach((label) => {
    graphComponent.selection.setSelected(label, true)
  })
}

/**
 * Called when the 'Select all nodes' button was clicked.
 */
function onSelectAllNodesClicked() {
  const nodes = graphComponent.graph.nodes
  nodes.forEach((node) => {
    graphComponent.selection.setSelected(node, true)
  })
}

/**
 * Called when the 'Select all edges' button was clicked.
 */
function onSelectAllEdgesClicked() {
  const edges = graphComponent.graph.edges
  edges.forEach((edge) => {
    graphComponent.selection.setSelected(edge, true)
  })
}

/**
 * Called when the 'Select all labels' button was clicked.
 */
function onSelectAllLabelsClicked() {
  const labels = graphComponent.graph.nodeLabels.toArray()
  labels.concat(graphComponent.graph.edgeLabels.toArray())
  labels.forEach((label) => {
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
 * Disables/enables the redrawing graph button.
 */
function updateRedrawGraphButton() {
  const mode = fastGraphModelManager.graphOptimizationMode
  const redrawEnabled =
    !(graphComponent.inputMode instanceof GraphViewerInputMode) &&
    mode != null &&
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
 * @returns {!Promise}
 */
async function onGraphComponentRendered() {
  // de-register the event handler after it has been executed
  graphComponent.removeUpdatedVisualListener(onGraphComponentRendered)
  // hide the loading indicator
  await showLoadingIndicator(false)
}

/**
 * Helper method that disables the animation buttons and hides the scrollbars when starting an
 * animation.
 */
function startAnimation() {
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.NEVER
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.NEVER
  updateButtonStateAtAnimation(true)
}

/**
 * Helper method to reset the animation buttons and the scrollbars when an animation has finished.
 */
function endAnimation() {
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED
  mainFrameRate.resetFrameArray()
  updateButtonStateAtAnimation(false)
}

/**
 * Updates the buttons after animation is done.
 * @param {boolean} disabled
 */
function updateButtonStateAtAnimation(disabled) {
  disabledButtonsDuringAnimation.forEach((button) => {
    button.disabled = disabled
    disabled ? button.classList.add('disabled-button') : button.classList.remove('disabled-button')
  })
}

function setWebGLItemStyles() {
  if (!(graphComponent.graphModelManager instanceof StyledWebGL2GraphModelManager)) {
    return
  }

  const graph = graphComponent.graph
  const webGLgmm = graphComponent.graphModelManager
  const webGLStyles = updateDefaultStyles(graph)
  webGLgmm.defaultStyles = webGLStyles

  graph.nodes.forEach((node) => {
    const nodeStyle = webGLgmm.getDefaultNodeStyle(node)
    if (nodeStyle != null) {
      webGLgmm.setStyle(node, nodeStyle)
    }
  })
  graph.edges.forEach((edge) => {
    webGLgmm.setStyle(edge, webGLStyles.edgeStyle)
  })
  graph.nodeLabels.forEach((label) => {
    webGLgmm.setStyle(label, webGLStyles.labelStyle)
  })
  graph.edgeLabels.forEach((label) => {
    webGLgmm.setStyle(label, webGLStyles.labelStyle)
  })
}

/**
 * Updates the styles according to the currently chosen graph item style.
 */
function updateItemStyles() {
  const graph = graphComponent.graph
  updateDefaultStyles(graph)
  updateRedrawGraphButton()

  if (graphComponent.graphModelManager instanceof WebGL2GraphModelManager) {
    setWebGLItemStyles()
  } else {
    graph.nodes.forEach((node) => {
      graph.setStyle(node, graph.nodeDefaults.style)
    })
    graph.edges.forEach((edge) => {
      graph.setStyle(edge, graph.edgeDefaults.style)
    })
    graph.nodeLabels.forEach((label) => {
      graph.setStyle(label, graph.nodeDefaults.labels.style)
    })
    graph.edgeLabels.forEach((label) => {
      graph.setStyle(label, graph.edgeDefaults.labels.style)
    })

    // update the rendering
    fastGraphModelManager.dirty = true
  }

  graphComponent.invalidate()
}

/**
 * Creates the ImageData icons for the WebGL2 rendering from the original SVG files.
 * @param {!Array.<ImageData>} webGLImageData
 * @returns {!Promise}
 */
async function createWebGLImageData(webGLImageData) {
  const imageNames = [
    'usericon_female1',
    'usericon_female2',
    'usericon_female3',
    'usericon_female4',
    'usericon_female5',
    'usericon_male1',
    'usericon_male2',
    'usericon_male3',
    'usericon_male4',
    'usericon_male5'
  ]

  // The size of the SVG graphic
  const imageSize = new Size(75, 75)
  // The size of the created ImageData
  // canvas used to pre-render the icons
  const ctx = createCanvasContext(128, 128)

  for (const image of await Promise.all(
    imageNames.map((name) => createUrlIcon(ctx, `resources/${name}.svg`, imageSize))
  )) {
    webGLImageData.push(image)
  }
}

/**
 * @param {!IGraph} graph
 * @returns {!object}
 */
function updateDefaultStyles(graph) {
  let nodeStyle
  let edgeStyle
  let labelStyle
  let webGL2NodeStyle

  // level of detail colors
  let overviewColor
  let intermediateColor
  let edgeColor

  // handle the graph item style
  if (simpleSvgStyle.checked) {
    const color = Color.from('#AB2346')
    edgeColor = color
    intermediateColor = generateColorShade(color, 1.2)
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new SimpleSvgNodeStyle(color)
    edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new SvgLabelStyle()
    webGL2NodeStyle = new WebGL2ShapeNodeStyle({
      fill: color,
      stroke: WebGL2Stroke.NONE,
      shape: 'rectangle'
    })
  } else if (complexSvgStyle.checked) {
    intermediateColor = Color.from('#621B00')
    edgeColor = intermediateColor
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new ComplexSvgNodeStyle()
    edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new SvgLabelStyle()
    webGL2NodeStyle = new WebGL2IconNodeStyle({
      icon: webGLImageData[0] ?? new ImageData(1, 1),
      fill: 'Color.TRANSPARENT',
      stroke: WebGL2Stroke.NONE,
      shape: 'ellipse'
    })
  } else if (simpleCanvasStyle.checked) {
    const color = Color.from('#0B7189')
    edgeColor = color
    intermediateColor = generateColorShade(color, 1.2)
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new SimpleCanvasNodeStyle(color)
    edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new CanvasLabelStyle()
    webGL2NodeStyle = new WebGL2ShapeNodeStyle({
      fill: color,
      stroke: WebGL2Stroke.NONE,
      shape: 'rectangle'
    })
  } else if (complexCanvasStyle.checked) {
    intermediateColor = Color.from('#111D4A')
    edgeColor = intermediateColor
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new ComplexCanvasNodeStyle()
    edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new CanvasLabelStyle()
    webGL2NodeStyle = new WebGL2IconNodeStyle({
      icon: webGLImageData[0] ?? new ImageData(1, 1),
      fill: Color.TRANSPARENT,
      stroke: WebGL2Stroke.NONE,
      shape: 'ellipse'
    })
  } else {
    const color = Color.from('#FF6C00')
    edgeColor = Color.from('#662b00')
    // simpleWebglStyle is checked
    intermediateColor = generateColorShade(color, 1.2)
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new WebGLShapeNodeStyle({
      color: color
    })
    edgeStyle = new WebGLPolylineEdgeStyle({
      thickness: edgeThickness,
      color: edgeColor
    })
    labelStyle = new CanvasLabelStyle()
    webGL2NodeStyle = new WebGL2ShapeNodeStyle({
      fill: color,
      stroke: WebGL2Stroke.NONE,
      shape: 'rectangle'
    })
  }

  fastGraphModelManager.overviewNodeStyle = BrowserDetection.webGL
    ? new WebGLShapeNodeStyle({ color: overviewColor })
    : new SimpleSvgNodeStyle(overviewColor)
  fastGraphModelManager.intermediateNodeStyle = new SimpleSvgNodeStyle(intermediateColor)

  graph.nodeDefaults.style = nodeStyle
  graph.edgeDefaults.style = edgeStyle
  graph.nodeDefaults.labels.style = labelStyle
  graph.edgeDefaults.labels.style = labelStyle

  return {
    nodeStyle: webGL2NodeStyle,
    edgeStyle: new WebGL2PolylineEdgeStyle(new WebGL2Stroke(edgeColor, edgeThickness)),
    labelStyle: new WebGL2DefaultLabelStyle({
      backgroundColor: Color.TRANSPARENT,
      backgroundStroke: WebGL2Stroke.NONE
    })
  }
}

/**
 * Adds a label to each node.
 * @param {!IGraph} graph
 */
function onNodeLabelsChanged(graph) {
  if (nodeLabelsCheckbox.checked) {
    // add labels
    graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
      insets: [0, 0, 5, 0]
    }).createParameter(ExteriorLabelModelPosition.SOUTH)
    const freeLabelModel = new FreeLabelModel()
    graph.nodes.forEach((node, index) => {
      const label = graph.addLabel(node, `No.${index}`)
      if (fixLabelPositionsEnabled) {
        graph.setLabelLayoutParameter(label, freeLabelModel.createDynamic(label.layout))
      }
    })
  } else {
    // remove all node labels
    graph.nodes.forEach((node) => {
      node.labels.toArray().forEach((label) => {
        graph.remove(label)
      })
    })
  }
}

/**
 * Adds a label to each edge.
 * @param {!IGraph} graph
 */
function onEdgeLabelsChanged(graph) {
  if (edgeLabelsCheckbox.checked) {
    // add label on each edge
    const edgeLabelModel = new EdgePathLabelModel({
      distance: 5,
      sideOfEdge: EdgeSides.ABOVE_EDGE
    })
    const freeLabelModel = new FreeLabelModel()
    graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()
    graph.edges.forEach((edge) => {
      const label = graph.addLabel(edge, 'Edge')
      if (fixLabelPositionsEnabled) {
        graph.setLabelLayoutParameter(label, freeLabelModel.createDynamic(label.layout))
      }
    })
  } else {
    // remove all edge labels
    graph.edges.forEach((edge) => {
      edge.labels.toArray().forEach((label) => {
        graph.remove(label)
      })
    })
  }
}

/**
 * Returns a random node from the graph.
 * @returns {!INode} A random node from the graph.
 */
function getRandomNode() {
  const nodes = graphComponent.graph.nodes.toList()
  return nodes.get(getRandomInt(nodes.size))
}

/**
 * @param {number} upper
 * @returns {number}
 */
function getRandomInt(upper) {
  return Math.floor(Math.random() * upper)
}

/**
 * Fisher Yates Shuffle for arrays.
 * @returns {!Array.<IModelItem>} Shuffled Array.
 * @param {!Array.<IModelItem>} array
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
/**
 * Generates a different color shade
 * @param {!Color} color The base color
 * @param {number} factor how much lighter or darker the color should be, i.e. 0.8 => 20% darker, 1.2 => 20% lighter
 * @returns {!Color} a lighter color
 */
function generateColorShade(color, factor) {
  if (factor < 1) {
    // darker shade
    return new Color(
      Math.max(Math.round(color.r * factor), 0),
      Math.max(Math.round(color.g * factor), 0),
      Math.max(Math.round(color.b * factor), 0)
    )
  } else if (factor > 1) {
    // lighter shade
    return new Color(
      Math.min(Math.round(color.r * factor), 255),
      Math.min(Math.round(color.g * factor), 255),
      Math.min(Math.round(color.b * factor), 255)
    )
  } else {
    return color
  }
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  initializeGraphChooserBox()

  modeChooserBox.selectedIndex = 0
  onModeChanged()

  redrawGraphButton.disabled = true
  updateOptimizationMode()

  // initialize information fields
  zoomLevel.textContent = Math.floor(graphComponent.zoom * 100).toString()
  selectionCount.textContent = graphComponent.selection.size.toString()

  addNavigationButtons(graphChooserBox, true, true, 'select-button').addEventListener(
    'change',
    onGraphChooserSelectionChanged
  )

  document.querySelector('#panAnimationBtn').addEventListener('click', onPanAnimationClicked)
  document.querySelector('#zoomAnimationBtn').addEventListener('click', onZoomAnimationClicked)
  document
    .querySelector('#spiralAnimationBtn')
    .addEventListener('click', onSpiralZoomAnimationClicked)
  document.querySelector('#moveNodeAnimationBtn').addEventListener('click', onNodeAnimationClicked)

  document.querySelector('#selectNothingBtn').addEventListener('click', onSelectNothingClicked)
  document
    .querySelector('#selectEverythingBtn')
    .addEventListener('click', onSelectEverythingClicked)
  document.querySelector('#selectAllNodesBtn').addEventListener('click', onSelectAllNodesClicked)
  document.querySelector('#selectAllEdgesBtn').addEventListener('click', onSelectAllEdgesClicked)
  document.querySelector('#selectAllLabelsBtn').addEventListener('click', onSelectAllLabelsClicked)
  document.querySelector('#select1000NodesBtn').addEventListener('click', onSelect1000NodesClicked)
  document.querySelector('#select1000EdgesBtn').addEventListener('click', onSelect1000EdgesClicked)
  document
    .querySelector('#select1000LabelsBtn')
    .addEventListener('click', onSelect1000LabelsClicked)

  fpsCheckbox.addEventListener('change', onFpsCheckboxChanged)

  nodeLabelsCheckbox.addEventListener('change', () => {
    onNodeLabelsChanged(graphComponent.graph)
    redrawGraph()
  })

  edgeLabelsCheckbox.addEventListener('change', () => {
    onEdgeLabelsChanged(graphComponent.graph)
    redrawGraph()
  })

  redrawGraphButton.addEventListener('click', redrawGraph)

  modeChooserBox.addEventListener('change', onModeChanged)

  // register radio buttons
  simpleSvgStyle.addEventListener('change', updateItemStyles)
  complexSvgStyle.addEventListener('change', updateItemStyles)
  simpleCanvasStyle.addEventListener('change', updateItemStyles)
  complexCanvasStyle.addEventListener('change', updateItemStyles)
  simpleWebglStyle.addEventListener('change', updateItemStyles)

  defaultGmm.addEventListener('change', updateOptimizationMode)
  document.querySelector('#WebglGmm-radio').addEventListener('change', updateOptimizationMode)
  levelOfDetailGmm.addEventListener('change', updateOptimizationMode)
  staticGmm.addEventListener('change', updateOptimizationMode)
  svgImageGmm.addEventListener('change', updateOptimizationMode)
  CanvasImageWithDrawCallbackGmm.addEventListener('change', updateOptimizationMode)
  CanvasImageWithItemStylesGmm.addEventListener('change', updateOptimizationMode)
  StaticCanvasImageGmm.addEventListener('change', updateOptimizationMode)
  StaticWebglImageGmm.addEventListener('change', updateOptimizationMode)

  fixLabelPositionsCheckbox.addEventListener('change', onFixLabelPositionsChanged)

  autoRedrawCheckbox.addEventListener('change', onAutoRedrawChanged)
}

run().then(finishLoading)

class StyledWebGL2GraphModelManager extends WebGL2GraphModelManager {
  _defaultStyles = null

  /**
   * @type {?WebGLStyles}
   */
  set defaultStyles(value) {
    this._defaultStyles = value
  }

  /**
   * @type {?WebGLStyles}
   */
  get defaultStyles() {
    return this._defaultStyles
  }

  /**
   * @param {!IEdge} edge
   */
  getWebGL2EdgeStyle(edge) {
    let style = super.getWebGL2EdgeStyle(edge)
    if (!style && this.defaultStyles && this.defaultStyles.edgeStyle) {
      style = this.defaultStyles.edgeStyle
    }
    return style
  }

  /**
   * @param {!ILabel} label
   */
  getWebGL2LabelStyle(label) {
    let style = super.getWebGL2LabelStyle(label)
    if (!style && this.defaultStyles && this.defaultStyles.labelStyle) {
      style = this.defaultStyles.labelStyle
    }
    return style
  }

  /**
   * @param {!INode} node
   * @returns {?WebGL2NodeStyle}
   */
  getWebGL2NodeStyle(node) {
    let style = super.getWebGL2NodeStyle(node)
    if (!style) {
      style = this.getDefaultNodeStyle(node)
    }
    return style
  }

  /**
   * @param {!INode} node
   * @returns {!WebGL2NodeStyle}
   */
  getDefaultNodeStyle(node) {
    if (!this.defaultStyles || !this.defaultStyles.nodeStyle) {
      return new WebGL2ShapeNodeStyle()
    }
    const webGLStyles = this.defaultStyles
    if (webGLStyles.nodeStyle instanceof WebGL2IconNodeStyle && webGLStyles.nodeStyle.icon) {
      // for icon styles, we must explicitly set the correct icon for each node according to the info in its tag
      const index = Number(node.tag)
      return new WebGL2IconNodeStyle({
        shape: webGLStyles.nodeStyle.shape,
        fill: webGLStyles.nodeStyle.fill,
        stroke: webGLStyles.nodeStyle.stroke,
        icon: webGLImageData[Number.isNaN(index) ? 0 : index] ?? new ImageData(1, 1)
      })
    } else {
      return webGLStyles.nodeStyle
    }
  }
}

/**
 * @typedef {(WebGL2ShapeNodeStyle|WebGL2IconNodeStyle|WebGL2GroupNodeStyle)} WebGL2NodeStyle
 */

/**
 * @typedef {Object} WebGLStyles
 * @property {WebGL2NodeStyle} nodeStyle
 * @property {WebGL2PolylineEdgeStyle} edgeStyle
 * @property {WebGL2DefaultLabelStyle} labelStyle
 */

/**
 * @typedef {Object} JsonNode
 * @property {number} id
 * @property {object} l
 */

/**
 * @typedef {Object} JsonEdge
 * @property {number} s
 * @property {number} t
 * @property {object} [sp]
 * @property {object} [tp]
 * @property {Array.<object>} [b]
 */
