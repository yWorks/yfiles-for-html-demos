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
  Animator,
  Color,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  FoldingManager,
  FreeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphModelManager,
  GraphViewerInputMode,
  HandlesRenderer,
  IAnimation,
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
  RenderMode,
  Size,
  TimeSpan,
  WebGLGraphModelManager,
  WebGLGroupNodeStyle,
  WebGLImageNodeStyle,
  WebGLLabelStyle,
  WebGLPolylineEdgeStyle,
  WebGLSelectionIndicatorManager,
  WebGLShapeNodeStyle,
  WebGLStroke
} from '@yfiles/yfiles'

import { ComplexCanvasNodeStyle } from './ComplexCanvasNodeStyle'
import { CanvasLabelStyle } from './CanvasLabelStyle'
import { CanvasEdgeStyle } from './CanvasEdgeStyle'
import { SimpleCanvasNodeStyle } from './SimpleCanvasNodeStyle'
import { ComplexSvgNodeStyle } from './ComplexSvgNodeStyle'
import { SvgLabelStyle } from './SvgLabelStyle'
import { CircleNodeAnimation, CirclePanAnimation, ZoomInAndBackAnimation } from './Animations'
import { SvgEdgeStyle } from './SvgEdgeStyle'
import { SimpleSvgNodeStyle } from './SimpleSvgNodeStyle'
import { FastGraphModelManager, OptimizationMode } from './FastGraphModelManager'
import { PreConfigurator } from './resources/PreConfigurator'
import samples from './resources/samples'
import { createCanvasContext, createUrlIcon } from '@yfiles/demo-utils/IconCreation'
import { FPSMeter } from './FPSMeter'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import {
  addNavigationButtons,
  BrowserDetection,
  finishLoading,
  showLoadingIndicator
} from '@yfiles/demo-resources/demo-page'

let graphComponent: GraphComponent

/**
 * The time to wait after an edit event until a redrawing should be performed.
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
 * The default edge thickness
 */
const edgeThickness = 5

const redrawGraphButton = document.querySelector<HTMLButtonElement>('#redrawGraphButton')!
const modeChooserBox = document.querySelector<HTMLSelectElement>('#modeChooserBox')!
const graphChooserBox = document.querySelector<HTMLSelectElement>('#graphChooserBox')!
const nodeLabelsCheckbox = document.querySelector<HTMLInputElement>('#nodeLabelsCheckbox')!
const edgeLabelsCheckbox = document.querySelector<HTMLInputElement>('#edgeLabelsCheckbox')!
const detailLevelIndicator = document.querySelector<HTMLDivElement>('#detailLevelIndicator')!
const detailLevelPopup = document.querySelector<HTMLDivElement>('#detailLevelPopup')!
const simpleSvgStyle = document.querySelector<HTMLInputElement>('#simple-svg-radio')!
const complexSvgStyle = document.querySelector<HTMLInputElement>('#complex-svg-radio')!
const simpleCanvasStyle = document.querySelector<HTMLInputElement>('#simple-canvas-radio')!
const complexCanvasStyle = document.querySelector<HTMLInputElement>('#complex-canvas-radio')!
const defaultGmm = document.querySelector<HTMLInputElement>('#defaultGmm-radio')!
const levelOfDetailGmm = document.querySelector<HTMLInputElement>('#levelOfDetailGmm-radio')!
const staticGmm = document.querySelector<HTMLInputElement>('#staticGmm-radio')!
const svgImageGmm = document.querySelector<HTMLInputElement>('#svgImageGmm-radio')!
const CanvasImageWithDrawCallbackGmm = document.querySelector<HTMLInputElement>(
  '#CanvasImageWithDrawCallbackGmm-radio'
)!
const CanvasImageWithItemStylesGmm = document.querySelector<HTMLInputElement>(
  '#CanvasImageWithItemStylesGmm-radio'
)!
const StaticCanvasImageGmm = document.querySelector<HTMLInputElement>(
  '#StaticCanvasImageGmm-radio'
)!
const fixLabelPositionsCheckbox = document.querySelector<HTMLInputElement>('#fix-label-positions')!
const autoRedrawCheckbox = document.querySelector<HTMLInputElement>('#autoRedrawCheckbox')!
const fpsCheckbox = document.querySelector<HTMLInputElement>('#fpsCheckbox')!
const zoomLevel = document.querySelector<HTMLSpanElement>('#zoomLevel')!
const selectionCount = document.querySelector<HTMLSpanElement>('#selection')!

/**
 * Holds the buttons that need to be disabled during animation
 */
const disabledButtonsDuringAnimation: HTMLButtonElement[] = [
  document.querySelector<HTMLButtonElement>('#panAnimationBtn')!,
  document.querySelector<HTMLButtonElement>('#zoomAnimationBtn')!,
  document.querySelector<HTMLButtonElement>('#spiralAnimationBtn')!,
  document.querySelector<HTMLButtonElement>('#moveNodeAnimationBtn')!
]

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // initialize the GraphComponent and GraphOverviewComponent
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.minimumZoom = 0.005

  // assign the custom GraphModelManager
  fastGraphModelManager = createFastGraphModelManager()

  if (BrowserDetection.webGL2) {
    graphComponent.selectionIndicatorManager = new WebGLSelectionIndicatorManager()
  }

  await prepareWebGLRendering()

  // initialize fps meter
  mainFrameRate = new FPSMeter()

  registerListeners(graphComponent)

  preConfigurator = new PreConfigurator(graphComponent)

  initializeUI(graphComponent)

  registerTooltips()

  onGraphChooserSelectionChanged()
}

/**
 * Checks whether WebGL is supported and updates the corresponding UI buttons.
 */
async function prepareWebGLRendering(): Promise<void> {
  if (BrowserDetection.webGL2) {
    await createWebGLImageData(webGLImageData)
  } else {
    // if the browser does not support WebGL, disable this option
    document.querySelector<HTMLInputElement>('#WebglGmm-radio')!.disabled = true
    document
      .querySelector<HTMLLabelElement>('#WebglGmm-label')!
      .setAttribute('data-no-webgl-support', '')
    levelOfDetailGmm.checked = true
  }
}

/**
 * Registers tooltips for the different performance settings.
 */
function registerTooltips(): void {
  // register tooltips
  const elements = document.querySelectorAll<HTMLElement>('.hasTooltip')
  for (let i = 0; i < elements.length; i++) {
    // label listeners
    const labelElement = elements[i].nextElementSibling!
    if (labelElement.nodeName === 'LABEL') {
      labelElement.addEventListener('mouseover', () => {
        showTooltip(labelElement.getAttribute('for')!)
      })
      labelElement.addEventListener('mouseout', () => {
        hideTooltip()
      })
    }

    // input element listeners
    const inputElement = elements[i]
    inputElement.addEventListener('mouseover', () => {
      // the hasTooltip class may be directly on the label element
      showTooltip(inputElement.id !== '' ? inputElement.id : inputElement.getAttribute('for')!)
    })
    inputElement.addEventListener('mouseout', () => {
      hideTooltip()
    })
  }
}

/**
 * Helper method to show a tooltip
 */
function showTooltip(id: string): void {
  clearTimeout(tooltipTimer)

  const tooltipDiv = document.querySelector<HTMLDivElement>('#tooltip')!
  const srcElement = document.getElementById(id)!
  const infoElement = document.querySelector<HTMLDivElement>(`#${id}-info`!)

  tooltipDiv.innerHTML = ''

  tooltipDiv.setAttribute('class', 'info-visible arrow')
  if (infoElement == null) {
    return
  }
  const tooltipContent = infoElement.cloneNode(true)
  tooltipDiv.appendChild(tooltipContent)

  const labelElement =
    (srcElement as any).type === 'label' ? srcElement : srcElement.nextElementSibling!
  if (labelElement.nodeName === 'LABEL') {
    const warning = labelElement.className.indexOf('warning') >= 0
    if (warning) {
      tooltipDiv.appendChild(document.querySelector('#warningToolTip')!.cloneNode(true))
    }
    const webglWarning = labelElement.hasAttribute('data-no-webgl-support')
    if (webglWarning) {
      tooltipDiv.appendChild(document.querySelector('#webglWarningToolTip')!.cloneNode(true))
    }
    const unrecommended = labelElement.className.indexOf('unrecommended') >= 0
    if (unrecommended) {
      tooltipDiv.appendChild(document.querySelector('#unrecommendedToolTip')!.cloneNode(true))
    }
  }

  const top =
    srcElement.getBoundingClientRect().top - tooltipDiv.getBoundingClientRect().height * 0.5
  tooltipDiv.setAttribute('style', `top:${top}px; right: 390px; overflow-wrap: break-word;`)
}

/**
 * Helper method that hides the tooltip.
 */
function hideTooltip(): void {
  const tooltip = document.querySelector<HTMLElement>('#tooltip')!
  tooltip.setAttribute('class', 'info-hidden arrow')
  tooltipTimer = window.setTimeout(() => {
    tooltip.style.zIndex = '0'
  }, 350)
}

/**
 * Sets the custom {@link FastGraphModelManager} as the graphComponent's
 * {@link GraphComponent.graphModelManager}.
 */
function createFastGraphModelManager(): FastGraphModelManager {
  const fastGraphModelManager = new FastGraphModelManager()
  fastGraphModelManager.intermediateNodeStyle = new SimpleSvgNodeStyle(Color.from('#FF6C00'))
  const edgeColor = Color.from('#662b00')
  fastGraphModelManager.intermediateEdgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
  fastGraphModelManager.overviewEdgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
  return fastGraphModelManager
}

/**
 * Initialize the auto updates.
 */
function initializeAutoUpdates(graph: IGraph): void {
  // re-draw the graph if a node has been moved
  graph.addEventListener('node-layout-changed', () => scheduleRedraw())
  // re-draw if an item was created or deleted
  graph.addEventListener('node-created', () => scheduleRedraw())
  graph.addEventListener('node-removed', () => scheduleRedraw())
  graph.addEventListener('edge-removed', () => scheduleRedraw())
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

  //Disable moving of individual edge segments in WebGL mode
  graphComponent.graph.decorator.edges.positionHandler.hide(
    () => getGraphOptimizationMode() == null
  )

  setWebGLItemStyles()

  graphChooserBox.disabled = false

  fastGraphModelManager.dirty = true

  // hide the loading indicator after the graphComponent has finished rendering
  graphComponent.addEventListener('updated-visual', onGraphComponentRendered)

  // check for labels
  onEdgeLabelsChanged(graphComponent.graph)
  onNodeLabelsChanged(graphComponent.graph)
  redrawGraph()

  initializeAutoUpdates(graphComponent.graph)

  preConfigurator.updatePreConfiguration()

  await graphComponent.fitGraphBounds()
}

/**
 * Parses the sample data and creates the graph elements.
 * @param graph The graph to populate with the items.
 * @param graphData The JSON data.
 * @param graphData.nodeList The data items of the nodes.
 * @param graphData.edgeList The data items of the nodes.
 * @yjs:keep = nodeList,edgeList
 */
function loadGraphCore(
  graph: IGraph,
  graphData: { nodeList: JsonNode[]; edgeList: JsonEdge[] }
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
      bends.forEach((bend) => {
        graph.addBend(edge, bend)
      })
    }
  }

  // adjust default node size to have new nodes matching the graph
  graph.nodeDefaults.size =
    graph.nodes.size > 0 ? graph.nodes.first()!.layout.toSize() : new Size(30, 30)
}

/**
 * Reads the JSON data form a file.
 * @param url The URL of the file
 * @returns A promise that resolves when the data is loaded correctly
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
  const graphEditorInputMode = new GraphEditorInputMode({ allowCreateBend: false })

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
    graphEditorInputMode.handleInputMode.handlesRenderer = new HandlesRenderer(RenderMode.WEBGL)
  }

  // assign a random number to each newly created node to determine its random svg image in the detail node style
  graphEditorInputMode.nodeCreator = (_: IInputModeContext, graph: IGraph, location: Point) =>
    graph.createNodeAt({ location, tag: getRandomInt(10) })

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
  return null
}

/**
 * Registers listeners, that are needed by the UI, on the graph.
 */
function registerListeners(graphComponent: GraphComponent): void {
  let zoomLevelChangedTimer = -1
  graphComponent.addEventListener('zoom-changed', () => {
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
  graphComponent.selection.addEventListener('item-added', () => {
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
  graphComponent.addEventListener('updated-visual', () => {
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
 * WebGL rendering is used.
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
    return 'WebGL Rendering'
  }
}

/**
 * Initializes the graph chooser.
 */
function initializeGraphChooserBox(): void {
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
function onModeChanged(): void {
  graphComponent.selection.clear()

  switch (modeChooserBox.selectedIndex) {
    default:
    case 0: {
      graphComponent.inputMode = new GraphViewerInputMode({ allowClipboardOperations: false })
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
  preConfigurator.updatePreConfiguration()
}

/**
 * Called when the optimization mode of the {@link GraphModelManager} is changed by the user.
 */
function updateOptimizationMode(): void {
  const optimizationMode = getGraphOptimizationMode()
  const shouldUseWebGL = optimizationMode == null
  const wasUsingWebGL = graphComponent.graphModelManager instanceof WebGLGraphModelManager
  if (shouldUseWebGL) {
    graphComponent.graphModelManager = new WebGLGraphModelManager()
    graphComponent.focusIndicatorManager.enabled = false
  } else {
    graphComponent.focusIndicatorManager.enabled = true
    fastGraphModelManager.graphOptimizationMode = optimizationMode!
    graphComponent.graphModelManager = fastGraphModelManager
  }
  // if the GMM changes, the styles might need an update, to reflect the current UI settings
  if (shouldUseWebGL !== wasUsingWebGL) {
    updateItemStyles()
  }
  if (graphComponent.inputMode instanceof GraphEditorInputMode) {
    updateGraphEditorInputMode(graphComponent.inputMode)
  }
  graphComponent.invalidate()

  updateRedrawGraphButton()
  updateDetailLevelIndicator()
}

function onFixLabelPositionsChanged(): void {
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
 * Called when the selected item in the graph chooser combo box has changed.
 */
function onGraphChooserSelectionChanged(): void {
  const sampleObject = samples[graphChooserBox.selectedIndex]
  if (sampleObject) {
    // Load the graph from source file
    void loadGraph(sampleObject.fileName)
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
  if (selection.nodes.size === 0) {
    selection.add(getRandomNode())
  }

  const animation = new CircleNodeAnimation(
    graphComponent.graph,
    selection.nodes,
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
  selectNodes.forEach((node) => {
    graphComponent.selection.add(node as INode)
  })
}

/**
 * Called when the 'Select 1000 random edges' button was clicked.
 */
function onSelect1000EdgesClicked(): void {
  const shuffledEdges = shuffle(graphComponent.graph.edges.toArray())
  const selectEdges = shuffledEdges.slice(0, 1000)
  selectEdges.forEach((edge) => {
    graphComponent.selection.add(edge as IEdge)
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
  selectLabels.forEach((label) => {
    graphComponent.selection.labels.add(label as ILabel)
  })
}

/**
 * Called when the 'Select all nodes' button was clicked.
 */
function onSelectAllNodesClicked(): void {
  const nodes = graphComponent.graph.nodes
  nodes.forEach((node) => {
    graphComponent.selection.add(node)
  })
}

/**
 * Called when the 'Select all edges' button was clicked.
 */
function onSelectAllEdgesClicked(): void {
  const edges = graphComponent.graph.edges
  edges.forEach((edge) => {
    graphComponent.selection.add(edge)
  })
}

/**
 * Called when the 'Select all labels' button was clicked.
 */
function onSelectAllLabelsClicked(): void {
  const labels = graphComponent.graph.nodeLabels.toArray()
  labels.concat(graphComponent.graph.edgeLabels.toArray())
  labels.forEach((label) => {
    graphComponent.selection.add(label)
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
 * Disables/enables the redrawing graph button.
 */
function updateRedrawGraphButton(): void {
  const mode = fastGraphModelManager.graphOptimizationMode
  const redrawEnabled =
    !(graphComponent.inputMode instanceof GraphViewerInputMode) &&
    mode != null &&
    mode !== OptimizationMode.DEFAULT &&
    mode !== OptimizationMode.LEVEL_OF_DETAIL &&
    !(mode === OptimizationMode.STATIC && (simpleCanvasStyle.checked || complexCanvasStyle.checked))

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
async function onGraphComponentRendered(): Promise<void> {
  // de-register the event handler after it has been executed
  graphComponent.removeEventListener('updated-visual', onGraphComponentRendered)
  // hide the loading indicator
  await showLoadingIndicator(false)
}

/**
 * Helper method that disables the animation buttons and hides the scrollbars when starting an
 * animation.
 */
function startAnimation(): void {
  updateButtonStateAtAnimation(true)
}

/**
 * Helper method to reset the animation buttons and the scrollbars when an animation has finished.
 */
function endAnimation(): void {
  mainFrameRate.resetFrameArray()
  updateButtonStateAtAnimation(false)
}

/**
 * Updates the buttons after animation is done.
 */
function updateButtonStateAtAnimation(disabled: boolean): void {
  disabledButtonsDuringAnimation.forEach((button) => {
    button.disabled = disabled
    disabled ? button.classList.add('disabled-button') : button.classList.remove('disabled-button')
  })
}

function setWebGLItemStyles(): void {
  const graph = graphComponent.graph
  const webGLStyleCache = new WebGLStyleCache()
  const webGLStyles = updateDefaultStyles(graph)
  webGLStyleCache.defaultStyles = webGLStyles

  graph.nodes.forEach((node) => {
    graph.setStyle(node, webGLStyleCache.getDefaultNodeStyle(node))
  })
  graph.edges.forEach((edge) => {
    graph.setStyle(edge, webGLStyles.edgeStyle)
  })
  graph.nodeLabels.forEach((label) => {
    graph.setStyle(label, webGLStyles.labelStyle)
  })
  graph.edgeLabels.forEach((label) => {
    graph.setStyle(label, webGLStyles.labelStyle)
  })
}

/**
 * Updates the styles according to the currently chosen graph item style.
 */
function updateItemStyles(): void {
  const graph = graphComponent.graph
  updateDefaultStyles(graph)
  updateRedrawGraphButton()

  if (graphComponent.graphModelManager instanceof WebGLGraphModelManager) {
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
 * Creates the ImageData icons for the WebGL rendering from the original SVG files.
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
  // canvas used to pre-render the icons
  const ctx = createCanvasContext(128, 128)

  for (const image of await Promise.all(
    imageNames.map((name) => createUrlIcon(ctx, `resources/${name}.svg`, imageSize))
  )) {
    webGLImageData.push(image)
  }
}

function updateDefaultStyles(graph: IGraph): {
  nodeStyle: WebGLNodeStyle
  edgeStyle: WebGLPolylineEdgeStyle
  labelStyle: WebGLLabelStyle
} {
  let nodeStyle: INodeStyle
  let edgeStyle: IEdgeStyle
  let labelStyle: ILabelStyle
  let webGLNodeStyle: WebGLNodeStyle

  // level of detail colors
  let overviewColor: Color
  let intermediateColor: Color
  let edgeColor: Color

  // handle the graph item style
  if (simpleSvgStyle.checked) {
    const color = Color.from('#AB2346')
    edgeColor = color
    intermediateColor = generateColorShade(color, 1.2)
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new SimpleSvgNodeStyle(color)
    edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new SvgLabelStyle()
    webGLNodeStyle = new WebGLShapeNodeStyle({
      fill: color,
      stroke: WebGLStroke.NONE,
      shape: 'rectangle'
    })
  } else if (complexSvgStyle.checked) {
    intermediateColor = Color.from('#621B00')
    edgeColor = intermediateColor
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new ComplexSvgNodeStyle()
    edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new SvgLabelStyle()
    webGLNodeStyle = new WebGLImageNodeStyle({
      image: webGLImageData[0] ?? new ImageData(1, 1),
      backgroundFill: 'Color.TRANSPARENT',
      backgroundStroke: WebGLStroke.NONE,
      backgroundShape: 'ellipse'
    })
  } else if (simpleCanvasStyle.checked) {
    const color = Color.from('#0B7189')
    edgeColor = color
    intermediateColor = generateColorShade(color, 1.2)
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new SimpleCanvasNodeStyle(color)
    edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new CanvasLabelStyle()
    webGLNodeStyle = new WebGLShapeNodeStyle({
      fill: color,
      stroke: WebGLStroke.NONE,
      shape: 'rectangle'
    })
  } else {
    // complexCanvasStyle is checked
    intermediateColor = Color.from('#111D4A')
    edgeColor = intermediateColor
    overviewColor = generateColorShade(intermediateColor, 1.2)
    nodeStyle = new ComplexCanvasNodeStyle()
    edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
    labelStyle = new CanvasLabelStyle()
    webGLNodeStyle = new WebGLImageNodeStyle({
      image: webGLImageData[0] ?? new ImageData(1, 1),
      backgroundFill: Color.TRANSPARENT,
      backgroundStroke: WebGLStroke.NONE,
      backgroundShape: 'ellipse'
    })
  }

  fastGraphModelManager.overviewNodeStyle = new SimpleSvgNodeStyle(overviewColor)
  fastGraphModelManager.intermediateNodeStyle = new SimpleSvgNodeStyle(intermediateColor)

  graph.nodeDefaults.style = nodeStyle
  graph.edgeDefaults.style = edgeStyle
  graph.nodeDefaults.labels.style = labelStyle
  graph.edgeDefaults.labels.style = labelStyle

  return {
    nodeStyle: webGLNodeStyle,
    edgeStyle: new WebGLPolylineEdgeStyle(new WebGLStroke(edgeColor, edgeThickness)),
    labelStyle: new WebGLLabelStyle({
      backgroundColor: Color.TRANSPARENT,
      backgroundStroke: WebGLStroke.NONE
    })
  }
}

/**
 * Adds a label to each node.
 */
function onNodeLabelsChanged(graph: IGraph): void {
  if (nodeLabelsCheckbox.checked) {
    // add labels
    graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
      margins: [0, 0, 5, 0]
    }).createParameter('bottom')
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
 */
function onEdgeLabelsChanged(graph: IGraph): void {
  if (edgeLabelsCheckbox.checked) {
    // add label on each edge
    const edgeLabelModel = new EdgePathLabelModel({ distance: 5, sideOfEdge: EdgeSides.ABOVE_EDGE })
    const freeLabelModel = new FreeLabelModel()
    graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createRatioParameter()
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
 * @returns A random node from the graph.
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
 * @returns Shuffled Array.
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
 * Generates a different color shade
 * @param color The base color
 * @param factor how much lighter or darker the color should be, i.e. 0.8 => 20% darker, 1.2 => 20% lighter
 * @returns a lighter color
 */
function generateColorShade(color: Color, factor: number): Color {
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
 */
function initializeUI(graphComponent: GraphComponent): void {
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

  document.querySelector('#panAnimationBtn')!.addEventListener('click', onPanAnimationClicked)
  document.querySelector('#zoomAnimationBtn')!.addEventListener('click', onZoomAnimationClicked)
  document
    .querySelector('#spiralAnimationBtn')!
    .addEventListener('click', onSpiralZoomAnimationClicked)
  document.querySelector('#moveNodeAnimationBtn')!.addEventListener('click', onNodeAnimationClicked)

  document.querySelector('#selectNothingBtn')!.addEventListener('click', onSelectNothingClicked)
  document
    .querySelector('#selectEverythingBtn')!
    .addEventListener('click', onSelectEverythingClicked)
  document.querySelector('#selectAllNodesBtn')!.addEventListener('click', onSelectAllNodesClicked)
  document.querySelector('#selectAllEdgesBtn')!.addEventListener('click', onSelectAllEdgesClicked)
  document.querySelector('#selectAllLabelsBtn')!.addEventListener('click', onSelectAllLabelsClicked)
  document.querySelector('#select1000NodesBtn')!.addEventListener('click', onSelect1000NodesClicked)
  document.querySelector('#select1000EdgesBtn')!.addEventListener('click', onSelect1000EdgesClicked)
  document
    .querySelector('#select1000LabelsBtn')!
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

  defaultGmm.addEventListener('change', updateOptimizationMode)
  document.querySelector('#WebglGmm-radio')!.addEventListener('change', updateOptimizationMode)
  levelOfDetailGmm.addEventListener('change', updateOptimizationMode)
  staticGmm.addEventListener('change', updateOptimizationMode)
  svgImageGmm.addEventListener('change', updateOptimizationMode)
  CanvasImageWithDrawCallbackGmm.addEventListener('change', updateOptimizationMode)
  CanvasImageWithItemStylesGmm.addEventListener('change', updateOptimizationMode)
  StaticCanvasImageGmm.addEventListener('change', updateOptimizationMode)

  fixLabelPositionsCheckbox.addEventListener('change', onFixLabelPositionsChanged)

  autoRedrawCheckbox.addEventListener('change', onAutoRedrawChanged)
}

run().then(finishLoading)

class WebGLStyleCache {
  private _defaultStyles: WebGLStyles | null = null

  private _webGLStyles: WebGLImageNodeStyle[] = []

  set defaultStyles(value: WebGLStyles | null) {
    this._defaultStyles = value
  }

  get defaultStyles(): WebGLStyles | null {
    return this._defaultStyles
  }

  getDefaultNodeStyle(node: INode): WebGLNodeStyle {
    if (!this.defaultStyles || !this.defaultStyles.nodeStyle) {
      return new WebGLShapeNodeStyle()
    }
    const webGLStyles = this.defaultStyles
    if (webGLStyles.nodeStyle instanceof WebGLImageNodeStyle && webGLStyles.nodeStyle.image) {
      // for icon styles, we must explicitly set the correct icon for each node according to the info in its tag
      let index = Number(node.tag)
      index = Number.isNaN(index) ? 0 : index
      if (!this._webGLStyles[index] || this._webGLStyles[index].image !== webGLImageData[index]) {
        this._webGLStyles[index] = new WebGLImageNodeStyle({
          backgroundShape: webGLStyles.nodeStyle.backgroundShape,
          backgroundFill: webGLStyles.nodeStyle.backgroundFill,
          backgroundStroke: webGLStyles.nodeStyle.backgroundStroke,
          image: webGLImageData[index] ?? new ImageData(1, 1)
        })
      }
      return this._webGLStyles[index]
    } else {
      return webGLStyles.nodeStyle
    }
  }
}

type WebGLNodeStyle = WebGLShapeNodeStyle | WebGLImageNodeStyle | WebGLGroupNodeStyle

type WebGLStyles = {
  nodeStyle: WebGLNodeStyle
  edgeStyle: WebGLPolylineEdgeStyle
  labelStyle: WebGLLabelStyle
}

type JsonNode = { id: number; l: { x: number; y: number; w: number; h: number } }

type JsonEdge = {
  s: number
  t: number
  sp?: { x: number; y: number }
  tp?: { x: number; y: number }
  b?: [{ x: number; y: number }]
}
