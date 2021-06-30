/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  Color,
  Cursor,
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
  HandleTypes,
  IAnimation,
  ICommand,
  IEdge,
  IEdgeStyle,
  IGraph,
  IHandle,
  IInputMode,
  IInputModeContext,
  ILabel,
  ILabelStyle,
  IModelItem,
  INode,
  INodeStyle,
  IPoint,
  License,
  Point,
  Rect,
  RenderModes,
  ScrollBarVisibility,
  Size,
  TimeSpan,
  WebGL2DefaultLabelStyle,
  WebGL2GraphModelManager,
  WebGL2IconNodeStyle,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeStyle,
  WebGL2Stroke,
  WebGLPolylineEdgeStyle,
  WebGLShapeNodeStyle,
  WebGLTaperedEdgeStyle
} from 'yfiles'

import ComplexCanvasNodeStyle from './ComplexCanvasNodeStyle'
import CanvasLabelStyle from './CanvasLabelStyle'
import CanvasEdgeStyle from './CanvasEdgeStyle'
import SimpleCanvasNodeStyle from './SimpleCanvasNodeStyle'
import ComplexSvgNodeStyle from './ComplexSvgNodeStyle'
import SvgLabelStyle from './SvgLabelStyle'
import { CircleNodeAnimation, CirclePanAnimation, ZoomInAndBackAnimation } from './Animations'
import SvgEdgeStyle from './SvgEdgeStyle'
import SimpleSvgNodeStyle from './SimpleSvgNodeStyle'
import { FastGraphModelManager, OptimizationMode } from './FastGraphModelManager'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app'
import PreConfigurator from './resources/PreConfigurator'
import samples from './resources/samples'
import loadJson from '../../resources/load-json'
import { webGl2Supported, webGlSupported } from '../../utils/Workarounds'
import { createUrlIcon } from '../../utils/IconCreation'
import { FPSMeter } from './FPSMeter'

let graphComponent: GraphComponent

/**
 * The time to wait after an edit event until a redraw should be performed.
 */
const AUTO_REDRAW_DELAY = 1000

/**
 * Whether to use static label positions.
 */
let fixLabelPositionsEnabled = false

/**
 * Auto update setting.
 */
let autoRedrawEnabled = true

/**
 * Timer to control the schedule and cancel an auto redraw.
 */
let redrawTimerId = 0

/**
 * Holds the custom graphModelManager
 */
let fastGraphModelManager: FastGraphModelManager

/**
 * Controls for the benchmarking ui
 */
let mainFrameRate: FPSMeter

/**
 * The pre-configurations for different sized graphs
 */
let preConfigurator: PreConfigurator

/**
 * Timer for setting the z-index after fade-out finished
 */
let tooltipTimer = 0

const webGLImageData: ImageData[] = []
/**
 * The default edge color
 */
const edgeColor = new Color(100, 100, 100)

/**
 * The default edge thickness
 */
const edgeThickness = 5

// the "graph loading" indicator element
const loadingIndicator = querySelector<HTMLDivElement>('#loadingIndicator')
const redrawGraphButton = querySelector<HTMLButtonElement>('#redrawGraphButton')
// Control for the input mode.
const modeChooserBox = querySelector<HTMLSelectElement>('#modeChooserBox')
// Controls for the sample graphs.
const graphChooserBox = querySelector<HTMLSelectElement>('#graphChooserBox')
const nextButton = querySelector<HTMLButtonElement>('#nextButton')
const previousButton = querySelector<HTMLButtonElement>('#previousButton')
const nodeLabelsCheckbox = querySelector<HTMLInputElement>('#nodeLabelsCheckbox')
const edgeLabelsCheckbox = querySelector<HTMLInputElement>('#edgeLabelsCheckbox')
const detailLevelIndicator = querySelector<HTMLDivElement>('#detailLevelIndicator')
const detailLevelPopup = querySelector<HTMLDivElement>('#detailLevelPopup')
const simpleSvgStyle = querySelector<HTMLInputElement>('#simple-svg-radio')
const complexSvgStyle = querySelector<HTMLInputElement>('#complex-svg-radio')
const simpleCanvasStyle = querySelector<HTMLInputElement>('#simple-canvas-radio')
const simpleWebglStyle = querySelector<HTMLInputElement>('#simple-webgl-radio')
const complexCanvasStyle = querySelector<HTMLInputElement>('#complex-canvas-radio')
const defaultGmm = querySelector<HTMLInputElement>('#defaultGmm-radio')
const levelOfDetailGmm = querySelector<HTMLInputElement>('#levelOfDetailGmm-radio')
const staticGmm = querySelector<HTMLInputElement>('#staticGmm-radio')
const svgImageGmm = querySelector<HTMLInputElement>('#svgImageGmm-radio')
const CanvasImageWithDrawCallbackGmm = querySelector<HTMLInputElement>(
  '#CanvasImageWithDrawCallbackGmm-radio'
)
const CanvasImageWithItemStylesGmm = querySelector<HTMLInputElement>(
  '#CanvasImageWithItemStylesGmm-radio'
)
const StaticCanvasImageGmm = querySelector<HTMLInputElement>('#StaticCanvasImageGmm-radio')
const StaticWebglImageGmm = querySelector<HTMLInputElement>('#StaticWebglImageGmm-radio')
const fixLabelPositionsCheckbox = querySelector<HTMLInputElement>('#fix-label-positions')
const autoRedrawCheckbox = querySelector<HTMLInputElement>('#autoRedrawCheckbox')
const fpsCheckbox = querySelector<HTMLInputElement>('#fpsCheckbox')
const zoomLevel = querySelector<HTMLSpanElement>('#zoomLevel')
const selectionCount = querySelector<HTMLSpanElement>('#selection')

/**
 * Holds the buttons that need to be disabled during animation
 */
const disabledButtonsDuringAnimation: HTMLButtonElement[] = [
  querySelector<HTMLButtonElement>('#panAnimationBtn'),
  querySelector<HTMLButtonElement>('#zoomAnimationBtn'),
  querySelector<HTMLButtonElement>('#spiralAnimationBtn'),
  querySelector<HTMLButtonElement>('#moveNodeAnimationBtn')
]

/**
 * Runs the demo.
 */
async function run(licenseData: object): Promise<void> {
  License.value = licenseData

  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')

  graphComponent.minimumZoom = 0.005

  // assign the custom GraphModelManager
  fastGraphModelManager = createFastGraphModelManager(graphComponent)
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager(graphComponent)

  await prepareWebGL2Rendering()

  // initialize fps meter
  mainFrameRate = new FPSMeter()

  registerListeners(graphComponent)

  preConfigurator = new PreConfigurator(graphComponent)

  initializeUI()

  registerCommands(graphComponent)

  registerTooltips()

  showApp(graphComponent)

  onGraphChooserSelectionChanged()
}

/**
 * Initializes the UI elements.
 */
function initializeUI() {
  initializeGraphChooserBox()

  modeChooserBox.selectedIndex = 0
  onModeChanged()

  redrawGraphButton.disabled = true
  updateOptimizationMode()

  // initialize information fields
  zoomLevel.textContent = Math.floor(graphComponent.zoom * 100).toString()
  selectionCount.textContent = graphComponent.selection.size.toString()
}

/**
 * Checks whether WebGl2 is supported and updates the corresponding UI buttons.
 */
async function prepareWebGL2Rendering(): Promise<void> {
  if (webGl2Supported) {
    await createWebGLImageData(webGLImageData)
  } else {
    // if the browser does not support WebGL2, disable this option
    getElementById<HTMLInputElement>('WebglGmm-radio').disabled = true
    getElementById('WebglGmm-label').classList.add('no-webgl-support')
    levelOfDetailGmm.checked = true
  }
}

/**
 * Registers tooltips for the different performance settings.
 */
function registerTooltips(): void {
  // register tooltips
  const elements = document.querySelectorAll('.hasTooltip')
  for (let i = 0; i < elements.length; i++) {
    // label listeners
    const labelElement = elements[i].nextElementSibling as HTMLElement
    if (labelElement.nodeName === 'LABEL') {
      labelElement.addEventListener('mouseover', evt => {
        showTooltip((evt.target! as HTMLElement).getAttribute('for')!)
      })
      labelElement.addEventListener('mouseout', () => {
        hideTooltip()
      })
    }

    // input element listeners
    elements[i].addEventListener('mouseover', evt => {
      // the hasTooltip class may be directly on the label element
      const target = evt.target as HTMLElement
      showTooltip(target.id !== '' ? target.id : target.getAttribute('for')!)
    })
    elements[i].addEventListener('mouseout', () => {
      hideTooltip()
    })
  }
}

/**
 * Helper method to show a tooltip
 */
function showTooltip(id: string): void {
  clearTimeout(tooltipTimer)

  const tooltipDiv = getElementById<HTMLDivElement>('tooltip')
  const srcElement = getElementById<any>(id)
  const infoElement = getElementById<HTMLDivElement>(`${id}-info`)

  tooltipDiv.innerHTML = ''

  tooltipDiv.setAttribute('class', 'info-visible arrow')
  if (infoElement == null) {
    return
  }
  const tooltipContent = infoElement.cloneNode(true)
  tooltipDiv.appendChild(tooltipContent)

  const labelElement = srcElement.type === 'label' ? srcElement : srcElement.nextElementSibling!
  if (labelElement.nodeName === 'LABEL') {
    const warning = labelElement.className.indexOf('warning') >= 0
    if (warning) {
      tooltipDiv.appendChild(getElementById('warningToolTip').cloneNode(true))
    }
    const webglWarning = labelElement.className.indexOf('no-webgl-support') >= 0
    if (webglWarning) {
      tooltipDiv.appendChild(getElementById('webglWarningToolTip').cloneNode(true))
    }
    const unrecommended = labelElement.className.indexOf('unrecommended') >= 0
    if (unrecommended) {
      tooltipDiv.appendChild(getElementById('unrecommendedToolTip').cloneNode(true))
    }
  }

  const top =
    srcElement.getBoundingClientRect().top - tooltipDiv.getBoundingClientRect().height * 0.5
  tooltipDiv.setAttribute('style', `top:${top}px; right: 20px;`)
}

/**
 * Helper method that hides the tooltip.
 */
function hideTooltip(): void {
  const tooltip = getElementById('tooltip')
  tooltip.setAttribute('class', 'info-hidden arrow')
  tooltipTimer = window.setTimeout(() => {
    tooltip.style.zIndex = '0'
  }, 350)
}

/**
 * Sets the custom {@link FastGraphModelManager} as the graphComponent's
 * {@link GraphComponent#graphModelManager}.
 */
function createFastGraphModelManager(graphComponent: GraphComponent): FastGraphModelManager {
  const fastGraphModelManager = new FastGraphModelManager(
    graphComponent,
    graphComponent.contentGroup
  )
  fastGraphModelManager.intermediateNodeStyle = new SimpleSvgNodeStyle(Color.DARK_ORANGE)
  fastGraphModelManager.intermediateEdgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
  if (webGlSupported) {
    fastGraphModelManager.overviewEdgeStyle = new WebGLTaperedEdgeStyle({
      thickness: 30,
      color: edgeColor
    })
  } else {
    simpleWebglStyle.disabled = true
    StaticWebglImageGmm.disabled = true
    getElementById('no-webgl-support').style.display = 'block'
  }
  return fastGraphModelManager
}

/**
 * Initialize the auto updates.
 */
function initializeAutoUpdates(graph: IGraph): void {
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
function scheduleRedraw(): void {
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
 * @param fileName The file name of the file with the sample graph
 */
async function loadGraph(fileName: string): Promise<void> {
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
  graphComponent.graph = graph

  //Make bend handles invisible in WebGL2 mode
  graphComponent.graph.decorator.bendDecorator.handleDecorator.setImplementationWrapper(
    () => getGraphOptimizationMode() == null,
    (bend, coreHandle) => (coreHandle ? new InvisibleHandleWrapper(coreHandle) : null)
  )
  //Disable moving of individual edge segments in WebGL2 mode
  graphComponent.graph.decorator.edgeDecorator.positionHandlerDecorator.hideImplementation(
    () => getGraphOptimizationMode() == null
  )

  setWebGLItemStyles()

  graphChooserBox.disabled = false
  updateButtons()

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
 * @param graph The graph to populate with the items.
 * @param graphData The JSON data
 * @yjs:keep=nodeList,edgeList
 */
function loadGraphCore(
  graph: IGraph,
  graphData: {
    nodeList: JsonNode[]
    edgeList: JsonEdge[]
  }
): void {
  graph.clear()

  // create a map to store the nodes for edge creation
  const nodeMap: any = {}
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
    const sp = (typeof e.sp !== 'undefined' ? e.sp : {}) as any
    const tp = (typeof e.tp !== 'undefined' ? e.tp : {}) as any

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
 * @param url The URL of the file
 * @return A promise that resolves when the data is loaded correctly
 */
async function loadJSONData(url: string): Promise<any> {
  const response = await fetch(url)
  return response.json()
}

/**
 * Forces repainting of the graph.
 */
function redrawGraph(): void {
  // force re-creation of the pre-rendered image
  fastGraphModelManager.dirty = true
  graphComponent.invalidate()
}

/**
 * Helper method to initialize an {@link GraphEditorInputMode} for the graphComponent.
 * @param isMoveMode Whether the input mode should be configured for "move only".
 */
function createEditorInputMode(isMoveMode: boolean): IInputMode {
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
  if (webGlSupported) {
    graphEditorInputMode.handleInputMode.renderMode = RenderModes.WEB_GL
  }

  // assign a random number to each newly created node to determine its random svg image in the detail node style
  graphEditorInputMode.nodeCreator = (context: IInputModeContext, graph: IGraph, location: Point) =>
    graph.createNodeAt(location, null, getRandomInt(10))

  updateGraphEditorInputMode(graphEditorInputMode)

  return graphEditorInputMode
}

/**
 * Returns the currently selected optimization mode of the {@link GraphModelManager}.
 */
function getGraphOptimizationMode(): number | null {
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
 */
function registerListeners(graphComponent: GraphComponent): void {
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
function updateDetailLevelIndicator(): void {
  const indicator = detailLevelIndicator as HTMLDivElement & { zoomState?: string }
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
 */
function showDetailLevelPopup(manager: GraphModelManager): boolean {
  return (
    manager instanceof FastGraphModelManager &&
    manager.graphOptimizationMode === OptimizationMode.LEVEL_OF_DETAIL
  )
}

/**
 * Determines the detail level of the given graph model manager.
 * If the given manager is not a {@link FastGraphModelManager}, zoom factor independent
 * WebGL2 rendering is used.
 */
function getDetailLevel(graphModelManager: GraphModelManager): string {
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
function initializeGraphChooserBox(): void {
  samples.forEach(sample => {
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
function onModeChanged(): void {
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
function updateOptimizationMode(): void {
  const optimizationMode = getGraphOptimizationMode()

  // if the GMM changes, the styles might need an update, to reflect the current UI settings
  const styleUpdateNeeded =
    (optimizationMode != null) ===
    graphComponent.graphModelManager instanceof WebGL2GraphModelManager

  if (graphComponent.inputMode instanceof GraphEditorInputMode) {
    updateGraphEditorInputMode(graphComponent.inputMode)
  }

  if (optimizationMode == null) {
    graphComponent.graphModelManager = new StyledWebGL2GraphModelManager()
    graphComponent.focusIndicatorManager.enabled = false

    if (styleUpdateNeeded) {
      updateItemStyles()
    }
    graphComponent.invalidate()
  } else {
    graphComponent.focusIndicatorManager.enabled = true
    fastGraphModelManager.graphOptimizationMode = optimizationMode
    graphComponent.graphModelManager = fastGraphModelManager
    if (styleUpdateNeeded) {
      updateItemStyles()
    }
    graphComponent.invalidate()
  }

  updateRedrawGraphButton()
  updateDetailLevelIndicator()
}

function onFixLabelPositionsChanged(): void {
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

function updateGraphEditorInputMode(geim: GraphEditorInputMode): void {
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
function onAutoRedrawChanged(): void {
  const redrawEnabled = autoRedrawCheckbox.checked
  if (redrawEnabled) {
    redrawGraph()
  }
  autoRedrawEnabled = redrawEnabled
}

/**
 * Called when the 'previous graph' button was clicked.
 */
function onPreviousButtonClicked(): void {
  graphChooserBox.selectedIndex--
  onGraphChooserSelectionChanged()
}

/**
 * Called when the 'next graph' button was clicked.
 */
function onNextButtonClicked(): void {
  graphChooserBox.selectedIndex++
  onGraphChooserSelectionChanged()
}

/**
 * Called when the selected item in the graph chooser combo box has changed.
 */
function onGraphChooserSelectionChanged(): void {
  const sampleObject = samples[graphChooserBox.selectedIndex]
  if (sampleObject) {
    // Load the graph from source file
    loadGraph(sampleObject.fileName)
  }
}

/**
 * Called when the fps checkbox is enabled/disabled.
 */
function onFpsCheckboxChanged(): void {
  mainFrameRate.enabled = fpsCheckbox.checked
}

/**
 * Called when The 'Zoom animation' button was clicked.
 */
async function onZoomAnimationClicked(): Promise<void> {
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
 */
async function onPanAnimationClicked(): Promise<void> {
  startAnimation()
  const animation = new CirclePanAnimation(graphComponent, 2, TimeSpan.fromSeconds(2))
  const animator = new Animator(graphComponent)
  await animator.animate(animation)
  endAnimation()
}

/**
 * Called when the 'Spiral zoom animation' button was clicked.
 */
async function onSpiralZoomAnimationClicked(): Promise<void> {
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
 */
async function onNodeAnimationClicked(): Promise<void> {
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
function onSelectNothingClicked(): void {
  graphComponent.selection.clear()
}

/**
 * Called when the 'Select 1000 random nodes' button was clicked.
 */
function onSelect1000NodesClicked(): void {
  const shuffledNodes = shuffle(graphComponent.graph.nodes.toArray())
  const selectNodes = shuffledNodes.slice(0, 1000)
  selectNodes.forEach(node => {
    graphComponent.selection.setSelected(node, true)
  })
}

/**
 * Called when the 'Select 1000 random edges' button was clicked.
 */
function onSelect1000EdgesClicked(): void {
  const shuffledEdges = shuffle(graphComponent.graph.edges.toArray())
  const selectEdges = shuffledEdges.slice(0, 1000)
  selectEdges.forEach(edge => {
    graphComponent.selection.setSelected(edge, true)
  })
}

/**
 * Called when the 'Select 1000 random labels' button was clicked.
 */
function onSelect1000LabelsClicked(): void {
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
function onSelectAllNodesClicked(): void {
  const nodes = graphComponent.graph.nodes
  nodes.forEach(node => {
    graphComponent.selection.setSelected(node, true)
  })
}

/**
 * Called when the 'Select all edges' button was clicked.
 */
function onSelectAllEdgesClicked(): void {
  const edges = graphComponent.graph.edges
  edges.forEach(edge => {
    graphComponent.selection.setSelected(edge, true)
  })
}

/**
 * Called when the 'Select all labels' button was clicked.
 */
function onSelectAllLabelsClicked(): void {
  const labels = graphComponent.graph.nodeLabels.toArray()
  labels.concat(graphComponent.graph.edgeLabels.toArray())
  labels.forEach(label => {
    graphComponent.selection.setSelected(label, true)
  })
}

/**
 * Called when the 'Select everything' button was clicked.
 */
function onSelectEverythingClicked(): void {
  onSelectAllNodesClicked()
  onSelectAllEdgesClicked()
  onSelectAllLabelsClicked()
}

/**
 * Disables the 'Previous/Next graph' buttons in the UI according to whether there is a
 * previous/next graph to switch.
 */
function updateButtons(): void {
  nextButton.disabled = graphChooserBox.selectedIndex === graphChooserBox.options.length - 1
  previousButton.disabled = graphChooserBox.selectedIndex === 0
}

/**
 * Disables/enables the redraw graph button.
 */
function updateRedrawGraphButton(): void {
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
 */
function onGraphComponentRendered(): void {
  // de-register the event handler after it has been executed
  graphComponent.removeUpdatedVisualListener(onGraphComponentRendered)
  // hide the loading indicator
  setLoadingIndicatorVisibility(false)
}

/**
 * Helper method that disables the animation buttons and hides the scrollbars when starting an
 * animation.
 */
function startAnimation(): void {
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.NEVER
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.NEVER
  updateButtonStateAtAnimation(true)
}

/**
 * Helper method to reset the animation buttons and the scrollbars when an animation has finished.
 */
function endAnimation(): void {
  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED
  mainFrameRate.resetFrameArray()
  updateButtonStateAtAnimation(false)
}

/**
 * Updates the buttons after animation is done.
 */
function updateButtonStateAtAnimation(disabled: boolean): void {
  disabledButtonsDuringAnimation.forEach(button => {
    button.disabled = disabled
    disabled ? addClass(button, 'disabled-button') : removeClass(button, 'disabled-button')
  })
}

/**
 * Displays or hides the loading indicator.
 */
function setLoadingIndicatorVisibility(visible: boolean): void {
  loadingIndicator.style.display = visible ? 'block' : 'none'
}

function setWebGLItemStyles(): void {
  if (!(graphComponent.graphModelManager instanceof StyledWebGL2GraphModelManager)) {
    return
  }

  const graph = graphComponent.graph
  const webGLgmm = graphComponent.graphModelManager
  const webGLStyles = updateDefaultStyles(graph)
  webGLgmm.defaultStyles = webGLStyles

  graph.nodes.forEach(node => {
    const nodeStyle = webGLgmm.getDefaultNodeStyle(node)
    if (nodeStyle != null) {
      webGLgmm.setStyle(node, nodeStyle)
    }
  })
  graph.edges.forEach(edge => {
    webGLgmm.setStyle(edge, webGLStyles.edgeStyle)
  })
  graph.nodeLabels.forEach(label => {
    webGLgmm.setStyle(label, webGLStyles.labelStyle)
  })
  graph.edgeLabels.forEach(label => {
    webGLgmm.setStyle(label, webGLStyles.labelStyle)
  })
}

/**
 * Updates the styles according to the currently chosen graph item style.
 */
function updateItemStyles(): void {
  const graph = graphComponent.graph
  updateDefaultStyles(graph)
  updateRedrawGraphButton()

  if (graphComponent.graphModelManager instanceof WebGL2GraphModelManager) {
    setWebGLItemStyles()
  } else {
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
    fastGraphModelManager.dirty = true
  }

  graphComponent.invalidate()
}

/**
 * Creates the ImageData icons for the WebGL2 rendering from the original SVG files.
 */
async function createWebGLImageData(webGLImageData: ImageData[]): Promise<void> {
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
  const imageDataSize = new Size(128, 128)
  // canvas used to pre-render the icons
  const canvas = document.createElement('canvas')
  canvas.setAttribute('width', `${imageDataSize.width}`)
  canvas.setAttribute('height', `${imageDataSize.height}`)
  const ctx = canvas.getContext('2d')!

  for (const image of await Promise.all(
    imageNames.map(name => createUrlIcon(ctx, `resources/${name}.svg`, imageSize, imageDataSize))
  )) {
    webGLImageData.push(image)
  }
}

function updateDefaultStyles(graph: IGraph): {
  nodeStyle: WebGL2NodeStyle
  edgeStyle: WebGL2PolylineEdgeStyle
  labelStyle: WebGL2DefaultLabelStyle
} {
  let nodeStyle: INodeStyle
  let edgeStyle: IEdgeStyle
  let labelStyle: ILabelStyle
  let webGL2NodeStyle: WebGL2NodeStyle

  let overviewColor: Color
  let intermediateColor: Color

  // handle the graph item style
  if (simpleSvgStyle.checked) {
    overviewColor = new Color(250, 128, 114)
    intermediateColor = new Color(246, 33, 8)
    nodeStyle = new SimpleSvgNodeStyle(new Color(140, 18, 4))
    edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new SvgLabelStyle()
    webGL2NodeStyle = new WebGL2ShapeNodeStyle({
      fill: new Color(140, 18, 4),
      stroke: WebGL2Stroke.NONE,
      shape: 'rectangle'
    })
  } else if (complexSvgStyle.checked) {
    overviewColor = new Color(212, 184, 255)
    intermediateColor = new Color(132, 52, 255)
    nodeStyle = new ComplexSvgNodeStyle()
    edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new SvgLabelStyle()
    webGL2NodeStyle = new WebGL2IconNodeStyle({
      icon: webGLImageData[0],
      fill: 'Color.TRANSPARENT',
      stroke: WebGL2Stroke.NONE,
      shape: 'ellipse'
    })
  } else if (simpleCanvasStyle.checked) {
    overviewColor = new Color(135, 206, 250)
    intermediateColor = new Color(24, 160, 245)
    nodeStyle = new SimpleCanvasNodeStyle(new Color(6, 93, 147))
    edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new CanvasLabelStyle()
    webGL2NodeStyle = new WebGL2ShapeNodeStyle({
      fill: new Color(6, 93, 147),
      stroke: WebGL2Stroke.NONE,
      shape: 'rectangle'
    })
  } else if (complexCanvasStyle.checked) {
    overviewColor = new Color(192, 242, 192)
    intermediateColor = new Color(84, 219, 84)
    nodeStyle = new ComplexCanvasNodeStyle()
    edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new CanvasLabelStyle()
    webGL2NodeStyle = new WebGL2IconNodeStyle({
      icon: webGLImageData[0],
      fill: Color.TRANSPARENT,
      stroke: WebGL2Stroke.NONE,
      shape: 'ellipse'
    })
  } else {
    // simpleWebglStyle is checked
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
    webGL2NodeStyle = new WebGL2ShapeNodeStyle({
      fill: 'rgb(91, 81, 22)',
      stroke: WebGL2Stroke.NONE,
      shape: 'rectangle'
    })
  }

  fastGraphModelManager.overviewNodeStyle = webGlSupported
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
 */
function onNodeLabelsChanged(graph: IGraph): void {
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
    graph.nodes.forEach(node => {
      node.labels.toArray().forEach(label => {
        graph.remove(label)
      })
    })
  }
}

/**
 * Adds a label to each edge.
 */
function onEdgeLabelsChanged(graph: IGraph): void {
  if (edgeLabelsCheckbox.checked) {
    // add label on each edge
    const edgeLabelModel = new EdgePathLabelModel({
      distance: 5,
      sideOfEdge: EdgeSides.ABOVE_EDGE
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
    // remove all edge labels
    graph.edges.forEach(edge => {
      edge.labels.toArray().forEach(label => {
        graph.remove(label)
      })
    })
  }
}

/**
 * Returns a random node from the graph.
 * @return A random node from the graph.
 */
function getRandomNode(): INode {
  const nodes = graphComponent.graph.nodes.toList()
  return nodes.get(getRandomInt(nodes.size))
}

function getRandomInt(upper: number): number {
  return Math.floor(Math.random() * upper)
}

/**
 * Fisher Yates Shuffle for arrays.
 * @return Shuffled Array.
 */
function shuffle(array: Array<IModelItem>): IModelItem[] {
  let m: number = array.length
  let t: IModelItem
  let i: number
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
 * Binds actions and commands to the demo's UI controls.
 */
function registerCommands(graphComponent: GraphComponent): void {
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

  bindChangeListener("input[data-command='NodeLabelsCheckboxChanged']", () => {
    onNodeLabelsChanged(graphComponent.graph)
    redrawGraph()
  })
  bindChangeListener("input[data-command='EdgeLabelsCheckboxChanged']", () => {
    onEdgeLabelsChanged(graphComponent.graph)
    redrawGraph()
  })
  bindAction("button[data-command='RedrawGraph']", redrawGraph)

  bindChangeListener('#modeChooserBox', onModeChanged)

  // register radio buttons
  bindChangeListener('#simple-svg-radio', updateItemStyles)
  bindChangeListener('#complex-svg-radio', updateItemStyles)
  bindChangeListener('#simple-canvas-radio', updateItemStyles)
  bindChangeListener('#complex-canvas-radio', updateItemStyles)
  bindChangeListener('#simple-webgl-radio', updateItemStyles)

  bindChangeListener('#defaultGmm-radio', updateOptimizationMode)
  bindChangeListener('#WebglGmm-radio', updateOptimizationMode)
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

function getElementById<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

function querySelector<T extends HTMLElement>(selector: string): T {
  return document.querySelector(selector) as T
}

// run the demo
loadJson().then(run)

class StyledWebGL2GraphModelManager extends WebGL2GraphModelManager {
  private _defaultStyles: WebGLStyles | null = null

  set defaultStyles(value: WebGLStyles | null) {
    this._defaultStyles = value
  }

  get defaultStyles(): WebGLStyles | null {
    return this._defaultStyles
  }

  getWebGL2EdgeStyle(edge: IEdge) {
    let style = super.getWebGL2EdgeStyle(edge)
    if (!style && this.defaultStyles && this.defaultStyles.edgeStyle) {
      style = this.defaultStyles.edgeStyle
    }
    return style
  }

  getWebGL2LabelStyle(label: ILabel) {
    let style = super.getWebGL2LabelStyle(label)
    if (!style && this.defaultStyles && this.defaultStyles.labelStyle) {
      style = this.defaultStyles.labelStyle
    }
    return style
  }

  getWebGL2NodeStyle(node: INode): WebGL2NodeStyle | null {
    let style = super.getWebGL2NodeStyle(node)
    if (!style) {
      style = this.getDefaultNodeStyle(node)
    }
    return style
  }

  getDefaultNodeStyle(node: INode): WebGL2NodeStyle {
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
        icon: webGLImageData[Number.isNaN(index) ? 0 : index]
      })
    } else {
      return webGLStyles.nodeStyle
    }
  }
}

/**
 * Simple class that just hides the visualization of handles while keeping their functionality
 * intact.
 */
class InvisibleHandleWrapper extends BaseClass(IHandle) {
  _coreHandle: IHandle

  constructor(coreHandle: IHandle) {
    super()
    this._coreHandle = coreHandle
  }

  cancelDrag(context: IInputModeContext, originalLocation: Point) {
    this._coreHandle.cancelDrag(context, originalLocation)
  }

  get cursor(): Cursor {
    return this._coreHandle.cursor
  }

  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point) {
    this._coreHandle.dragFinished(context, originalLocation, newLocation)
  }

  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point) {
    this._coreHandle.handleMove(context, originalLocation, newLocation)
  }

  initializeDrag(context: IInputModeContext) {
    this._coreHandle.initializeDrag(context)
  }

  get location(): IPoint {
    return this._coreHandle.location
  }

  get type(): HandleTypes {
    return HandleTypes.INVISIBLE
  }
}

type WebGL2NodeStyle = WebGL2ShapeNodeStyle | WebGL2IconNodeStyle

type WebGLStyles = {
  nodeStyle: WebGL2NodeStyle
  edgeStyle: WebGL2PolylineEdgeStyle
  labelStyle: WebGL2DefaultLabelStyle
}

type JsonNode = {
  id: number
  l: { x: number; y: number; w: number; h: number }
}

type JsonEdge = {
  s: number
  t: number
  sp?: { x: number; y: number }
  tp?: { x: number; y: number }
  b?: [{ x: number; y: number }]
}
