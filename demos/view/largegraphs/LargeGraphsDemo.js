/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

/**
 * Demonstrates different optimization approaches for rendering large graphs.
 *
 * The default rendering code uses the style of each graph item to create an SVG
 * element that represents this item in the GraphComponent's main SVG image. For large
 * graphs, this can produce a lot of DOM elements, which can easily lead to performance
 * issues, e.g. slow framerates and lags. The more complex the item styles are, the
 * more likely it is that the application will have performance issues.
 *
 * The default code already uses an optimization called virtualization. This means
 * that items that are outside the viewport (the currently visible area), are not rendered
 * at all and thus don't affect the performance. This has the advantage that even large
 * graphs perform well for high zoom levels, i.e. if only a small part of the graph items
 * are visible. However, the default rendering code does not produce good results for
 * large graphs when zoomed out, so a large part of the graph is visible.
 *
 * The optimizations shown in this demo try to improve rendering performance for
 * different scenarios, where the full flexibility of the default rendering is not needed,
 * e.g. for viewer applications, or for applications with less dynamic scenarios that only
 * need an update of the graph visualization from time to time.
 *
 * Generally, this demo shows two types of optimizations:
 * {@link OptimizationMode#DEFAULT},
 * {@link OptimizationMode#STATIC} and
 * {@link OptimizationMode#LEVEL_OF_DETAIL} still use item styles
 * to render the graph into the usual GraphComponent SVG, while
 * {@link OptimizationMode#SVG_IMAGE},
 * {@link OptimizationMode#DYNAMIC_CANVAS_WITH_DRAW_CALLBACK},
 * {@link OptimizationMode#DYNAMIC_CANVAS_WITH_ITEM_STYLES},
 * {@link OptimizationMode#STATIC_CANVAS}, and
 * {@link OptimizationMode#WEBGL} create a single,
 * pre-rendered image of the graph that is shown instead of the usual SVG. However, this image
 * can be re-created if necessary to update the graph visualization.
 *
 * Use the demo's controls to switch between pure viewer mode, move mode, which allows
 * to move nodes, and the full edit mode. The auto redraw feature will update the graph
 * visualization with a configurable frequence, even if a static rendering approach is used.
 *
 * {@link FastGraphModelManager} can be used as-is to apply the optimizations
 * shown here to other applications.
 *
 * In addition to the rendering optimizations shown here, it usually makes sense to reduce the complexity
 * of the graph using features like {@link yfiles.graph.IFoldingView folding} and
 * {@link yfiles.graph.FilteredGraphWrapper filtering}.
 *
 * In order to speed up loading of sample graphs, this demo loads data from an array of nodes and
 * edges defined in JSON, rather than from a GraphML file.
 * @see {@link FastGraphModelManager}
 * @see {@link OptimizationMode}
 */

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'SimpleCanvasNodeStyle.js',
  'ComplexCanvasNodeStyle.js',
  'CanvasEdgeStyle.js',
  'CanvasLabelStyle.js',
  'SimpleSvgNodeStyle.js',
  'ComplexSvgNodeStyle.js',
  'SvgEdgeStyle.js',
  'SvgLabelStyle.js',
  'FastGraphModelManager.js',
  'Animations.js',
  'resources/PreConfigurator.js',
  'resources/license',
  'yfiles/view-folding',
  'yfiles/view-graphml',
  'resources/samples.js'
], (
  // @yjs:keep=nodeList,edgeList,graphBounds,isGrouped
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  SimpleCanvasNodeStyle,
  ComplexCanvasNodeStyle,
  CanvasEdgeStyle,
  CanvasLabelStyle,
  SimpleSvgNodeStyle,
  ComplexSvgNodeStyle,
  SvgEdgeStyle,
  SvgLabelStyle,
  FastGraphModelManager,
  Animations,
  PreConfigurator
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * The time to wait after an edit event until a redraw should be performed.
   * @type {number}
   */
  const AUTO_REDRAW_DELAY = 1000

  /**
   * Holds the sample graphs.
   * @type {Object[]}
   */
  let samples = null

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

  const edgeColor = new yfiles.view.Color(100, 100, 100)
  const edgeThickness = 5

  function run() {
    // initialize the GraphComponent and GraphOverviewComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    graphComponent.minimumZoom = 0.005

    // assign the custom GraphModelManager
    installGraphModelManager()

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

    // initialize fps meter
    mainFrameRate = new FPSMeter()

    // get the buttons that need to be disabled during animation
    disabledButtonsDuringAnimation = [
      document.querySelector('#panAnimationBtn'),
      document.querySelector('#zoomAnimationBtn'),
      document.querySelector('#spiralAnimationBtn'),
      document.querySelector('#moveNodeAnimationBtn')
    ]

    registerCommands()
    registerTooltips()

    app.show(graphComponent)

    onGraphChooserSelectionChanged()
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent, null)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent, null)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent, null)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent, null)

    app.bindChangeListener('#graphChooserBox', onGraphChooserSelectionChanged)
    app.bindAction("button[data-command='PreviousGraph']", onPreviousButtonClicked)
    app.bindAction("button[data-command='NextGraph']", onNextButtonClicked)

    app.bindAction("button[data-command='PanAnimation']", onPanAnimationClicked)
    app.bindAction("button[data-command='ZoomAnimation']", onZoomAnimationClicked)
    app.bindAction("button[data-command='SpiralAnimation']", onSpiralZoomAnimationClicked)
    app.bindAction("button[data-command='MoveNodeAnimation']", onNodeAnimationClicked)

    app.bindAction("button[data-command='SelectNothing']", onSelectNothingClicked)
    app.bindAction("button[data-command='SelectEverything']", onSelectEverythingClicked)
    app.bindAction("button[data-command='SelectAllNodes']", onSelectAllNodesClicked)
    app.bindAction("button[data-command='SelectAllEdges']", onSelectAllEdgesClicked)
    app.bindAction("button[data-command='SelectAllLabels']", onSelectAllLabelsClicked)
    app.bindAction("button[data-command='Select1000Nodes']", onSelect1000NodesClicked)
    app.bindAction("button[data-command='Select1000Edges']", onSelect1000EdgesClicked)
    app.bindAction("button[data-command='Select1000Labels']", onSelect1000LabelsClicked)

    app.bindAction("input[data-command='FpsCheckboxChanged']", onFpsCheckboxChanged)

    app.bindChangeListener("input[data-command='NodeLabelsCheckboxChanged']", onNodeLabelsChanged)
    app.bindChangeListener("input[data-command='EdgeLabelsCheckboxChanged']", onEdgeLabelsChanged)
    app.bindAction("button[data-command='RedrawGraph']", redrawGraph)

    app.bindChangeListener('#modeChooserBox', onModeChanged)

    // register radio buttons
    app.bindChangeListener('#simple-svg-radio', updateItemStyles)
    app.bindChangeListener('#complex-svg-radio', updateItemStyles)
    app.bindChangeListener('#simple-canvas-radio', updateItemStyles)
    app.bindChangeListener('#complex-canvas-radio', updateItemStyles)
    app.bindChangeListener('#simple-webgl-radio', updateItemStyles)

    app.bindChangeListener('#defaultGmm-radio', updateOptimizationMode)
    app.bindChangeListener('#levelOfDetailGmm-radio', updateOptimizationMode)
    app.bindChangeListener('#staticGmm-radio', updateOptimizationMode)
    app.bindChangeListener('#svgImageGmm-radio', updateOptimizationMode)
    app.bindChangeListener('#CanvasImageWithDrawCallbackGmm-radio', updateOptimizationMode)
    app.bindChangeListener('#CanvasImageWithItemStylesGmm-radio', updateOptimizationMode)
    app.bindChangeListener('#StaticCanvasImageGmm-radio', updateOptimizationMode)
    app.bindChangeListener('#StaticWebglImageGmm-radio', updateOptimizationMode)

    app.bindChangeListener(
      "input[data-command='FixLabelPositionsCheckboxChanged']",
      onFixLabelPositionsChanged
    )

    app.bindChangeListener("input[data-command='AutoRedrawCheckboxChanged']", onAutoRedrawChanged)
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
   * {@link yfiles.view.GraphComponent#graphModelManager}.
   */
  function installGraphModelManager() {
    graphModelManager = new FastGraphModelManager.FastGraphModelManager(
      graphComponent,
      graphComponent.contentGroup
    )
    graphModelManager.intermediateNodeStyle = new SimpleSvgNodeStyle(yfiles.view.Color.DARK_ORANGE)
    graphModelManager.intermediateEdgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
    if (FastGraphModelManager.FastGraphModelManager.hasWebGLSupport()) {
      graphModelManager.overviewEdgeStyle = new yfiles.styles.WebGLTaperedEdgeStyle({
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
      mode !== FastGraphModelManager.OptimizationMode.DEFAULT &&
      mode !== FastGraphModelManager.OptimizationMode.LEVEL_OF_DETAIL
    ) {
      // schedule another update
      redrawTimerId = window.setTimeout(redrawGraph, AUTO_REDRAW_DELAY)
    }
  }

  /**
   * Loads a graph from JSON data and places it in the {@link graphComponent}.
   * The loading indicator is shown prior to loading and hidden afterwards
   * @param {string} graphData The graph data in JSON format.
   */
  function loadGraph(graphData) {
    graphChooserBox.disabled = true
    nextButton.disabled = true
    previousButton.disabled = true

    // display the loading indicator
    setLoadingIndicatorVisibility(true)

    // execute the actual loading with a timeout to give the UI a chance to update
    setTimeout(() => {
      const fm = new yfiles.graph.FoldingManager()
      const fv = fm.createFoldingView()
      const graph = fv.graph
      updateDefaultStyles(graph)

      // load the graph from the JSON data
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
    }, 20)
  }

  /**
   * Parses the JSON and creates the graph elements.
   * @param {yfiles.graph.IGraph} graph The graph to populate with the items.
   * @param {string} graphData The JSON data
   */
  function loadGraphCore(graph, graphData) {
    graph.clear()
    // parse the JSON data
    const data = JSON.parse(graphData)
    // get the list of nodes and edges
    const nodes = data.nodeList
    const edges = data.edgeList

    // create a map to store the nodes for edge creation
    const nodeMap = {}
    // create the nodes
    let i
    for (i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const l = n.l
      const layout = new yfiles.geometry.Rect(l.x, l.y, l.w, l.h)
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
      const sourcePort = graph.addPortAt(sourceNode, new yfiles.geometry.Point(sx, sy))
      const targetPort = graph.addPortAt(targetNode, new yfiles.geometry.Point(tx, ty))
      // create the edge
      const edge = graph.createEdge(sourcePort, targetPort)
      // add the bends
      const bends = e.b
      if (bends) {
        bends.forEach(bend => {
          graph.addBend(edge, new yfiles.geometry.Point(bend.x, bend.y))
        })
      }
    }

    // adjust default node size to have new nodes matching the graph
    graph.nodeDefaults.size =
      graph.nodes.size > 0 ? graph.nodes.first().layout.toSize() : new yfiles.geometry.Size(30, 30)
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
   * Helper method to initialize an {@link yfiles.input.GraphEditorInputMode} for the graphComponent.
   * @param {boolean} isMoveMode Whether the input mode should be configured for "move only".
   * @return {yfiles.input.IInputMode}
   */
  function createEditorInputMode(isMoveMode) {
    const graphEditorInputMode = new yfiles.input.GraphEditorInputMode({
      allowCreateBend: false
    })

    // disable anything besides moving of nodes
    if (isMoveMode) {
      graphEditorInputMode.showHandleItems = yfiles.graph.GraphItemTypes.NONE
      graphEditorInputMode.clipboardOperationsAllowed = false
      graphEditorInputMode.allowEditLabelOnDoubleClick = false
      graphEditorInputMode.allowDuplicate = false
      graphEditorInputMode.allowAddLabel = false
      graphEditorInputMode.allowEditLabel = false
      graphEditorInputMode.allowCreateNode = false
    }

    // assign a random number to each newly created node to determine its random svg image in the detail node style
    graphEditorInputMode.nodeCreator = (context, graph, location) =>
      graph.createNodeAt(location, null, getRandomInt(9))

    return graphEditorInputMode
  }

  /**
   * Returns the currently selected optimization mode of the {@link yfiles.view.GraphModelManager}.
   * @return {OptimizationMode}
   */
  function getGraphOptimizationMode() {
    if (defaultGmm.checked) {
      return FastGraphModelManager.OptimizationMode.DEFAULT
    }
    if (staticGmm.checked) {
      return FastGraphModelManager.OptimizationMode.STATIC
    }
    if (levelOfDetailGmm.checked) {
      return FastGraphModelManager.OptimizationMode.LEVEL_OF_DETAIL
    }
    if (svgImageGmm.checked) {
      return FastGraphModelManager.OptimizationMode.SVG_IMAGE
    }
    if (CanvasImageWithDrawCallbackGmm.checked) {
      return FastGraphModelManager.OptimizationMode.DYNAMIC_CANVAS_WITH_DRAW_CALLBACK
    }
    if (CanvasImageWithItemStylesGmm.checked) {
      return FastGraphModelManager.OptimizationMode.DYNAMIC_CANVAS_WITH_ITEM_STYLES
    }
    if (StaticCanvasImageGmm.checked) {
      return FastGraphModelManager.OptimizationMode.STATIC_CANVAS
    }
    if (StaticWebglImageGmm.checked) {
      return FastGraphModelManager.OptimizationMode.WEBGL
    }
    return FastGraphModelManager.OptimizationMode.DEFAULT
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
      if (
        graphModelManager.graphOptimizationMode ===
        FastGraphModelManager.OptimizationMode.LEVEL_OF_DETAIL
      ) {
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
    samples = window['data-demo-samples']
    if (samples) {
      const displayNames = []
      for (let i = 0; i < samples.length; i++) {
        const displayName = samples[i].displayName
        displayNames.push(displayName)
        const option = document.createElement('option')
        option.text = displayName
        graphChooserBox.options.add(option)
      }
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
        const graphViewerInputMode = new yfiles.input.GraphViewerInputMode({
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
    yfiles.input.ICommand.invalidateRequerySuggested()
    preConfigurator.updatePreConfiguration()
  }

  /**
   * Called when the optimization mode of the {@link yfiles.view.GraphModelManager} is changed by the user.
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
      const freeLabelModel = new yfiles.graph.FreeLabelModel()
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
    // Require the source file and load the graph
    // eslint-disable-next-line global-require
    require([`resources/${sampleObject.fileName}.js`], () => {
      const sampleData = window['data-demo-samples'][`${sampleObject.fileName}`]
      if (sampleData) {
        loadGraph(sampleData)
      }
    })
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
  function onZoomAnimationClicked() {
    startAnimation()
    const node = getRandomNode()
    graphComponent.center = node.layout.center

    const animation = new Animations.ZoomInAndBackAnimation(
      graphComponent,
      10,
      yfiles.lang.TimeSpan.fromSeconds(5)
    )
    const animator = new yfiles.view.Animator(graphComponent)
    animator.animate(animation).then(endAnimation)
  }

  /**
   * Called when the 'Pan animation' button was clicked.
   */
  function onPanAnimationClicked() {
    startAnimation()
    const animation = new Animations.CirclePanAnimation(
      graphComponent,
      2,
      yfiles.lang.TimeSpan.fromSeconds(2)
    )
    const animator = new yfiles.view.Animator(graphComponent)
    animator.animate(animation).then(endAnimation)
  }

  /**
   * Called when the 'Spiral zoom animation' button was clicked.
   */
  function onSpiralZoomAnimationClicked() {
    startAnimation()
    const node = getRandomNode()
    graphComponent.center = node.layout.center.add(
      new yfiles.geometry.Point(graphComponent.viewport.width / 4, 0)
    )

    const zoom = new Animations.ZoomInAndBackAnimation(
      graphComponent,
      10,
      yfiles.lang.TimeSpan.fromSeconds(10)
    )
    const pan = new Animations.CirclePanAnimation(
      graphComponent,
      14,
      yfiles.lang.TimeSpan.fromSeconds(10)
    )
    const animation = yfiles.view.IAnimation.createParallelAnimation([zoom, pan])
    const animator = new yfiles.view.Animator(graphComponent)
    animator.animate(animation).then(endAnimation)
  }

  /**
   * Called when 'Move nodes' button was clicked.
   */
  function onNodeAnimationClicked() {
    startAnimation()
    const selection = graphComponent.selection
    // If there is nothing selected, just use a random node
    if (selection.selectedNodes.size === 0) {
      selection.setSelected(getRandomNode(), true)
    }

    const animation = new Animations.CircleNodeAnimation(
      graphComponent.graph,
      selection.selectedNodes,
      graphComponent.viewport.width / 10,
      2,
      yfiles.lang.TimeSpan.fromSeconds(2)
    )
    const animator = new yfiles.view.Animator(graphComponent)
    animator.animate(animation).then(() => {
      endAnimation()
      redrawGraph()
    })
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
      !(graphComponent.inputMode instanceof yfiles.input.GraphViewerInputMode) &&
      mode !== FastGraphModelManager.OptimizationMode.DEFAULT &&
      mode !== FastGraphModelManager.OptimizationMode.LEVEL_OF_DETAIL &&
      !(
        mode === FastGraphModelManager.OptimizationMode.STATIC &&
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
    graphComponent.horizontalScrollBarPolicy = yfiles.view.ScrollBarVisibility.NEVER
    graphComponent.verticalScrollBarPolicy = yfiles.view.ScrollBarVisibility.NEVER
    disableButtons()
  }

  /**
   * Helper method to reset the animation buttons and the scrollbars when an animation has finished.
   */
  function endAnimation() {
    graphComponent.horizontalScrollBarPolicy = yfiles.view.ScrollBarVisibility.AS_NEEDED
    graphComponent.verticalScrollBarPolicy = yfiles.view.ScrollBarVisibility.AS_NEEDED
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
      app.addClass(button, 'disabled-button')
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
      app.removeClass(button, 'disabled-button')
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
   * @param {yfiles.graph.IGraph} graph
   */
  function updateDefaultStyles(graph) {
    let nodeStyle = null
    let edgeStyle = null
    let labelStyle = null

    const hasWebGLSupport = FastGraphModelManager.FastGraphModelManager.hasWebGLSupport()
    let overviewColor
    let intermediateColor

    // handle the graph item style
    if (simpleSvgStyle.checked) {
      overviewColor = new yfiles.view.Color(250, 128, 114)
      intermediateColor = new yfiles.view.Color(246, 33, 8)
      nodeStyle = new SimpleSvgNodeStyle(new yfiles.view.Color(140, 18, 4))
      edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
      labelStyle = new SvgLabelStyle()
    } else if (complexSvgStyle.checked) {
      overviewColor = new yfiles.view.Color(212, 184, 255)
      intermediateColor = new yfiles.view.Color(132, 52, 255)
      nodeStyle = new ComplexSvgNodeStyle()
      edgeStyle = new SvgEdgeStyle(edgeColor, edgeThickness)
      labelStyle = new SvgLabelStyle()
    } else if (simpleCanvasStyle.checked) {
      overviewColor = new yfiles.view.Color(135, 206, 250)
      intermediateColor = new yfiles.view.Color(24, 160, 245)
      nodeStyle = new SimpleCanvasNodeStyle(new yfiles.view.Color(6, 93, 147))
      edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
      labelStyle = new CanvasLabelStyle()
    } else if (complexCanvasStyle.checked) {
      overviewColor = new yfiles.view.Color(192, 242, 192)
      intermediateColor = new yfiles.view.Color(84, 219, 84)
      nodeStyle = new ComplexCanvasNodeStyle()
      edgeStyle = new CanvasEdgeStyle(edgeColor, edgeThickness)
      labelStyle = new CanvasLabelStyle()
    } else if (simpleWebglStyle.checked) {
      overviewColor = new yfiles.view.Color(210, 190, 75)
      intermediateColor = new yfiles.view.Color(159, 141, 39)
      nodeStyle = new yfiles.styles.WebGLShapeNodeStyle({
        color: 'rgb(91, 81, 22)'
      })
      edgeStyle = new yfiles.styles.WebGLPolylineEdgeStyle({
        thickness: edgeThickness,
        color: edgeColor
      })
      labelStyle = new CanvasLabelStyle()
    }

    graphModelManager.overviewNodeStyle = hasWebGLSupport
      ? new yfiles.styles.WebGLShapeNodeStyle({ color: overviewColor })
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
      graph.nodeDefaults.labels.layoutParameter = new yfiles.graph.ExteriorLabelModel({
        insets: [0, 0, 5, 0]
      }).createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH)
      const freeLabelModel = new yfiles.graph.FreeLabelModel()
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
      const edgeLabelModel = new yfiles.graph.EdgePathLabelModel()
      const freeLabelModel = new yfiles.graph.FreeLabelModel()
      edgeLabelModel.distance = 5
      edgeLabelModel.sideOfEdge = yfiles.graph.EdgeSides.ABOVE_EDGE
      edgeLabelModel.edgeRelativeDistance = false
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
   * @return {yfiles.graph.INode} A random node from the graph.
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
    return Math.floor(Math.random() * (upper + 1))
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
  run()
})
