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
  Color,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphOverviewComponent,
  GraphSnapContext,
  GridSnapTypes,
  HierarchicLayout,
  IArrow,
  ICommand,
  IEdge,
  IGraph,
  IModelItem,
  INode,
  LabelSnapContext,
  License,
  List,
  MinimumNodeSizeStage,
  OrthogonalEdgeEditingContext,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  RenderModes,
  SmartEdgeLabelModel,
  StorageLocation,
  Stroke
} from 'yfiles'

import { OptionEditor } from '../../resources/demo-option-editor.js'
import HierarchicLayoutConfig from './HierarchicLayoutConfig.js'
import OrganicLayoutConfig from './OrganicLayoutConfig.js'
import OrthogonalLayoutConfig from './OrthogonalLayoutConfig.js'
import CircularLayoutConfig from './CircularLayoutConfig.js'
import TreeLayoutConfig from './TreeLayoutConfig.js'
import BalloonLayoutConfig from './BalloonLayoutConfig.js'
import RadialLayoutConfig from './RadialLayoutConfig.js'
import SeriesParallelLayoutConfig from './SeriesParallelLayoutConfig.js'
import PolylineEdgeRouterConfig from './PolylineEdgeRouterConfig.js'
import ChannelEdgeRouterConfig from './ChannelEdgeRouterConfig.js'
import BusEdgeRouterConfig from './BusEdgeRouterConfig.js'
import OrganicEdgeRouterConfig from './OrganicEdgeRouterConfig.js'
import ParallelEdgeRouterConfig from './ParallelEdgeRouterConfig.js'
import LabelingConfig from './LabelingConfig.js'
import ComponentLayoutConfig from './ComponentLayoutConfig.js'
import TabularLayoutConfig from './TabularLayoutConfig.js'
import PartialLayoutConfig from './PartialLayoutConfig.js'
import GraphTransformerConfig from './GraphTransformerConfig.js'
import ContextMenu from '../../utils/ContextMenu.js'
import DemoStyles, {
  DemoArrow,
  DemoEdgeStyle,
  DemoSerializationListener,
  DemoStyleOverviewPaintable,
  initDemoStyles
} from '../../resources/demo-styles.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { webGlSupported } from '../../utils/Workarounds.js'
import { FaultTolerantGraphMLIOHandler } from './FaultTolerantGraphMLIOHandler.js'

/**
 * The GraphComponent
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The overview component
 * @type {GraphOverviewComponent}
 */
let overviewComponent = null

/**
 * Stores all available layout algorithms and maps each name to the corresponding configuration.
 * @type {Map.<string,LayoutConfiguration>}
 */
const availableLayouts = new Map()

/**
 * The option editor that stores the currently selected layout configuration.
 * @type {OptionEditor}
 */
let optionEditor = null

let configOptionsValid = false
let inLayout = false
let inLoadSample = false

const comboBoxSeparatorItem = '-----------'

// get hold of some UI elements

const layoutComboBox = /** @type {HTMLSelectElement} */ document.getElementById('layout-select-box')
const sampleComboBox = /** @type {HTMLSelectElement} */ document.getElementById('sample-combo-box')
const nextButton = document.getElementById('next-sample-button')
const previousButton = document.getElementById('previous-sample-button')
const layoutButton = document.getElementById('apply-layout-button')
const resetButton = document.getElementById('reset-layout-button')
const generateEdgeThicknessButton = document.getElementById('generate-edge-thickness-button')
const resetEdgeThicknessButton = document.getElementById('reset-edge-thickness-button')
const generateEdgeDirectionButton = document.getElementById('generate-edge-direction-button')
const resetEdgeDirectionButton = document.getElementById('reset-edge-direction-button')

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')

  // initialize the GraphOverviewComponent
  overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  // wire up the UI
  registerCommands()

  configOptionsValid = true

  // we start loading the input mode
  graphComponent.inputMode = createEditorMode()

  setUIDisabled(true)
  // use the file system for built-in I/O
  enableGraphML()
  // initialize the property editor
  const editorElement = window.document.getElementById('data-editor')
  optionEditor = new OptionEditor(editorElement)
  editorElement.addEventListener(
    'keypress',
    evt => {
      if (evt.key === 13) {
        applyLayout(false)
      }
    },
    false
  )

  initializeSamples()

  // initialize the graph and the defaults
  initializeGraph()

  // configure overview panel
  overviewComponent.graphVisualCreator = new DemoStyleOverviewPaintable(graphComponent.graph)

  // after the initial graph is loaded, we continue loading with the algorithms
  initializeLayoutAlgorithms()

  // initialize the demo
  showApp(graphComponent, overviewComponent)

  loadSampleFromLocationHash(true)
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML() {
  const gs = new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM,
    graphMLIOHandler: new FaultTolerantGraphMLIOHandler()
  })

  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  gs.graphMLIOHandler.addHandleSerializationListener(DemoSerializationListener)
}

function initializeSamples() {
  initializeComboBox(sampleComboBox, [
    'Hierarchic',
    'Grouping',
    'Organic',
    'Orthogonal',
    'Circular',
    'Tree',
    'Balloon',
    'Radial',
    'Series-Parallel',
    'Edge Router',
    'Bus Router',
    'Components',
    'Tabular',
    comboBoxSeparatorItem,
    'Organic with Substructures',
    'Hierarchic with Subcomponents',
    'Orthogonal with Substructures',
    comboBoxSeparatorItem,
    'Hierarchic with Buses',
    'Edge Router with Buses',
    'Hierarchic with Curves',
    'Edge Router with Curves'
  ])
}

/**
 * Loads all layout modules and populates the layout combo box.
 */
function initializeLayoutAlgorithms() {
  if (layoutComboBox === null) {
    return
  }

  const layoutNames = [
    'Hierarchic',
    'Organic',
    'Orthogonal',
    'Circular',
    'Tree',
    'Balloon',
    'Radial',
    'Series-Parallel',
    comboBoxSeparatorItem,
    'Edge Router',
    'Channel Router',
    'Bus Router',
    'Organic Router',
    'Parallel Router',
    comboBoxSeparatorItem,
    'Labeling',
    'Components',
    'Tabular',
    'Partial',
    'Graph Transform'
  ]

  initializeComboBox(layoutComboBox, layoutNames)

  layoutNames.forEach(name => {
    if (name === comboBoxSeparatorItem) {
      return
    }
    const normalizedName = getNormalizedName(name)
    availableLayouts.set(normalizedName, createLayoutConfig(normalizedName))
  })
}

/**
 * @param normalizedName
 * @return {*}
 */
function createLayoutConfig(normalizedName) {
  switch (normalizedName) {
    case 'balloon':
      return new BalloonLayoutConfig()
    case 'bus-router':
      return new BusEdgeRouterConfig()
    case 'channel-router':
      return new ChannelEdgeRouterConfig()
    case 'circular':
      return new CircularLayoutConfig()
    case 'components':
      return new ComponentLayoutConfig()
    case 'edge-router':
      return new PolylineEdgeRouterConfig()
    case 'graph-transform':
      return new GraphTransformerConfig()
    case 'hierarchic':
      return new HierarchicLayoutConfig()
    case 'labeling':
      return new LabelingConfig()
    case 'organic':
      return new OrganicLayoutConfig()
    case 'organic-router':
      return new OrganicEdgeRouterConfig()
    case 'orthogonal':
      return new OrthogonalLayoutConfig()
    case 'series-parallel':
      return new SeriesParallelLayoutConfig()
    case 'partial':
      return new PartialLayoutConfig()
    case 'radial':
      return new RadialLayoutConfig()
    case 'parallel-router':
      return new ParallelEdgeRouterConfig()
    case 'tabular':
      return new TabularLayoutConfig()
    case 'tree':
      return new TreeLayoutConfig()
    default:
      return new HierarchicLayoutConfig()
  }
}

/**
 * Reset the configuration.
 */
function resetConfig() {
  const selectedIndex = layoutComboBox.selectedIndex
  if (selectedIndex < 0) {
    return
  }
  const key = layoutComboBox[selectedIndex].value
  if (key !== null && availableLayouts !== null && availableLayouts.has(key)) {
    availableLayouts.set(key, createLayoutConfig(key))
    onLayoutChanged()
  }
}

/**
 * Applies the layout algorithm of the given key.
 * @param {string|null} sampleName
 */
function applyLayoutForSample(sampleName = null) {
  if (sampleName == null) {
    sampleName = getSelectedSample()
  }

  // center the initial position of the animation
  ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)

  let forceUpdateConfigPanel = false
  if (sampleName.indexOf('organic') === 0) {
    sampleName = 'organic'
    forceUpdateConfigPanel = true
  }
  if (sampleName.indexOf('hierarchic') === 0) {
    sampleName = 'hierarchic'
    forceUpdateConfigPanel = true
  }
  if (sampleName.indexOf('orthogonal') === 0) {
    sampleName = 'orthogonal'
    forceUpdateConfigPanel = true
  }
  if (sampleName.indexOf('edge-router') === 0) {
    sampleName = 'edge-router'
    forceUpdateConfigPanel = true
  }
  // get the layout and use 'Hierarchic' if the key is unknown (shouldn't happen in this demo)
  const layoutName =
    availableLayouts !== null && availableLayouts.has(sampleName) ? sampleName : 'hierarchic'
  const actualIndex = getIndexInComboBox(layoutComboBox, layoutName)
  // run the layout if the layout combo box is already correct
  if (layoutComboBox.selectedIndex !== actualIndex || forceUpdateConfigPanel) {
    // otherwise, change the selection and indirectly trigger the layout
    layoutComboBox.selectedIndex = actualIndex
    onLayoutChanged()
  }
  applyLayout(true)
}

/**
 * Returns the index of the first option with the given value.
 * @param {HTMLSelectElement} combobox The combobox to search.
 * @param {string} value The value to match.
 * @return {number} The index of the first option with the given text (ignoring case), or -1 if no
 *   such option exists.
 */
function getIndexInComboBox(combobox, value) {
  const normalizedText = getNormalizedName(value)
  const options = combobox.options
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === normalizedText) {
      return i
    }
  }
  return -1
}

/**
 *
 * @param {HTMLSelectElement} combobox
 * @param {string[]} names
 */
function initializeComboBox(combobox, names) {
  names.forEach(name => {
    const option = document.createElement('option')
    combobox.add(option)
    option.label = name
    if (name === comboBoxSeparatorItem) {
      option.disabled = true
    } else {
      option.value = getNormalizedName(name)
    }
  })
}

/**
 * Actually applies the layout.
 * @param {boolean} clearUndo Specifies whether the undo queue should be cleared after the layout
 * calculation. This is set to <code>true</code> if this method is called directly after
 * loading a new sample graph.
 */
function applyLayout(clearUndo) {
  const config = optionEditor.config

  if (!config || !configOptionsValid || inLayout) {
    return
  }

  // prevent starting another layout calculation
  inLayout = true
  setUIDisabled(true)

  config.apply(graphComponent, () => {
    releaseLocks()
    setUIDisabled(false)
    updateUIState()
    if (clearUndo) {
      graphComponent.graph.undoEngine.clear()
    }
  })
}

/**
 * Handles a selection change in the layout combo box.
 */
function onLayoutChanged() {
  if (layoutComboBox === null) {
    return
  }
  const sampleName = getSelectedSample()
  const layoutName = layoutComboBox.options[layoutComboBox.selectedIndex]
    ? layoutComboBox.options[layoutComboBox.selectedIndex].value
    : null
  if (layoutName != null && availableLayouts !== null && availableLayouts.has(layoutName)) {
    graphComponent.graph.edgeDefaults.style.showTargetArrows = isLayoutDirected(layoutName)
    const config = availableLayouts.get(layoutName)
    if (layoutName === 'hierarchic' || layoutName === 'hierarchic-with-subcomponents') {
      // enable edge-thickness buttons only for Hierarchic Layout
      generateEdgeThicknessButton.disabled = false
      resetEdgeThicknessButton.disabled = false
      generateEdgeDirectionButton.disabled = false
      resetEdgeDirectionButton.disabled = false
    } else {
      // disable edge-thickness buttons only for all other layouts
      generateEdgeThicknessButton.disabled = true
      resetEdgeThicknessButton.disabled = true
      generateEdgeDirectionButton.disabled = true
      resetEdgeDirectionButton.disabled = true
      onResetEdgeThicknesses(graphComponent.graph)
      onResetEdgeDirections(graphComponent.graph)
    }

    if (sampleName === 'organic-with-substructures' && layoutName === 'organic') {
      config.enableSubstructures()
    }
    if (sampleName === 'hierarchic-with-subcomponents' && layoutName === 'hierarchic') {
      config.enableSubstructures()
    }
    if (sampleName === 'orthogonal-with-substructures' && layoutName === 'orthogonal') {
      config.enableSubstructures()
    }
    if (sampleName === 'hierarchic-with-buses' && layoutName === 'hierarchic') {
      config.enableAutomaticBusRouting()
    }
    if (sampleName === 'edge-router-with-buses' && layoutName === 'edge-router') {
      onResetEdgeDirections(graphComponent.graph, false)
      graphComponent.graph.edges.forEach(edge => {
        if (edge.style instanceof PolylineEdgeStyle) {
          const color = edge.style.stroke.fill.color
          edge.tag = `rgb(${color.r},${color.g},${color.b})`
        }
      })
      config.enableBusRouting()
    }
    if (sampleName === 'hierarchic-with-curves' && layoutName === 'hierarchic') {
      config.enableCurvedRouting()
    }
    if (sampleName === 'edge-router-with-curves' && layoutName === 'edge-router') {
      config.enableCurvedRouting()
    }

    optionEditor.config = config
    optionEditor.validateConfigCallback = b => {
      configOptionsValid = b
      layoutButton.disabled = !(configOptionsValid && !inLayout)
    }
  }
}

/**
 * Returns the value of the currently selected sample.
 * @return {string}
 */
function getSelectedSample() {
  return sampleComboBox.options[sampleComboBox.selectedIndex].value
}

/**
 * Returns the normalized version of the given name, i.e., in lowercase and '-' instead of space.
 * @param {string} name
 * @return {string}
 */
function getNormalizedName(name) {
  return name.toLowerCase().replace(/[\s]/g, '-')
}

/**
 * Checks whether the location hash specifies a valid sample, and loads that.
 * @param {boolean} useFallback
 */
function loadSampleFromLocationHash(useFallback = false) {
  if (!window.location.hash) {
    if (useFallback) {
      onSampleChanged()
    }
    return
  }

  const match = window.location.hash.match(/#([\w_-]+)/)
  const requestedSample = match && match.length > 1 ? match[1].toLowerCase().replace(/_/g, '-') : ''
  const index = getIndexInComboBox(sampleComboBox, requestedSample)
  if (index < 0 || sampleComboBox.selectedIndex === index) {
    if (useFallback) {
      onSampleChanged()
    }
    // do nothing if we don't know the name or if the sample is already selected
    return
  }

  sampleComboBox.selectedIndex = index
  onSampleChanged()
}

/**
 * Handles a selection change in the sample combo box.
 */
async function onSampleChanged() {
  if (inLayout || inLoadSample) {
    return
  }
  const key = getSelectedSample()
  const graph = graphComponent.graph
  if (key == null || key === 'none') {
    // no specific item - just clear the graph
    graph.clear()
    // and fit the contents
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    return
  }
  inLoadSample = true
  setUIDisabled(true)
  graph.edgeDefaults.style.showTargetArrows = isLayoutDirected(key)
  if (key === 'hierarchic') {
    // enable edge-thickness and edge-direction buttons only for Hierarchic Layout
    generateEdgeThicknessButton.disabled = false
    resetEdgeThicknessButton.disabled = false
    generateEdgeDirectionButton.disabled = false
    resetEdgeDirectionButton.disabled = false
    // the hierarchic graph is the sample graph that does not require GraphML I/O
    createSampleGraph(graph)
    applyLayoutForSample()
  } else {
    if (key === 'grouping') {
      // enable edge-thickness and edge-direction buttons only for Hierarchic Layout
      generateEdgeThicknessButton.disabled = false
      resetEdgeThicknessButton.disabled = false
      generateEdgeDirectionButton.disabled = false
      resetEdgeDirectionButton.disabled = false
    } else {
      // disable edge-thickness and edge-direction buttons for all other layouts
      generateEdgeThicknessButton.disabled = true
      resetEdgeThicknessButton.disabled = true
      generateEdgeDirectionButton.disabled = true
      resetEdgeDirectionButton.disabled = true
    }

    const filePath = `resources/${key}.graphml`
    try {
      // load the sample graph and start the layout algorithm in the done handler
      const ioh = new GraphMLIOHandler()

      // enable serialization of the demo styles - without a namespace mapping, serialization will fail
      ioh.addXamlNamespaceMapping(
        'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
        DemoStyles
      )
      ioh.addHandleSerializationListener(DemoSerializationListener)
      await ioh.readFromURL(graph, filePath)
      applyLayoutForSample()
    } catch (error) {
      if (graph.nodes.size === 0 && window.location.protocol.toLowerCase().indexOf('file') >= 0) {
        alert(
          'Unable to open the sample graph. A default graph will be loaded instead. Perhaps your browser does not ' +
            'allow handling cross domain HTTP requests. Please see the demo readme for details.'
        )
        // the sample graph cannot be loaded, so we run the default graph
        createSampleGraph(graph)
        if (sampleComboBox.selectedIndex === 9 || sampleComboBox.selectedIndex === 10) {
          graph.applyLayout(new MinimumNodeSizeStage(new HierarchicLayout()))
        }
        applyLayoutForSample()
      }
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    }
  }
}

/**
 * Generate and add random labels for a collection of ModelItems.
 * Existing items will be deleted before adding the new items.
 * @param {IEnumerable.<IModelItem>} items the collection of items the labels are
 *   generated for
 */
function onGenerateItemLabels(items) {
  const wordCountMin = 1
  const wordCountMax = 3
  const labelPercMin = 0.2
  const labelPercMax = 0.7
  const labelCount = Math.floor(
    items.size * (Math.random() * (labelPercMax - labelPercMin) + labelPercMin)
  )
  const itemList = new List()
  items.forEach(item => {
    itemList.add(item)
  })
  // remove all existing item labels
  items.forEach(item => {
    const labels = new List()
    item.labels.forEach(label => {
      labels.add(label)
    })
    labels.forEach(label => {
      graphComponent.graph.remove(label)
    })
  })

  // add random item labels
  const loremList = getLoremIpsum()
  for (let i = 0; i < labelCount; i++) {
    let label = ''
    const wordCount = Math.floor(Math.random() * (wordCountMax + 1 - wordCountMin)) + wordCountMin
    for (let j = 0; j < wordCount; j++) {
      const k = Math.floor(Math.random() * loremList.length)
      label += j === 0 ? '' : ' '
      label += loremList[k]
    }
    const itemIdx = Math.floor(Math.random() * itemList.size)
    const item = itemList.get(itemIdx)
    itemList.removeAt(itemIdx)
    graphComponent.graph.addLabel(item, label)
  }
}

/**
 * @param {IGraph} graph
 */
function onRemoveItemLabels(graph) {
  const labels = new List()
  graph.edges.forEach(edge => edge.labels.forEach(label => labels.add(label)))
  graph.nodes.forEach(node => node.labels.forEach(label => labels.add(label)))
  labels.forEach(label => graph.remove(label))
}

/**
 * @param {IGraph} graph
 */
function onGenerateEdgeThicknesses(graph) {
  graph.edges.forEach(edge => {
    const oldStyle = edge.style
    const thickness = Math.random() * 4 + 1
    const style = new PolylineEdgeStyle({
      stroke: new Stroke({
        fill: 'rgb(51, 102, 153)',
        thickness
      })
    })
    if (oldStyle instanceof PolylineEdgeStyle) {
      style.targetArrow = oldStyle.targetArrow
    } else {
      style.targetArrow = oldStyle.showTargetArrows ? new DemoArrow() : IArrow.NONE
    }
    graph.setStyle(edge, style)
  })
}

/**
 * @param {IGraph} graph
 */
function onResetEdgeThicknesses(graph) {
  graph.edges.forEach(edge => {
    let showTargetArrow = false
    const oldStyle = edge.style
    if (oldStyle instanceof PolylineEdgeStyle) {
      const edgeStyle = new DemoEdgeStyle()
      edgeStyle.showTargetArrows = showTargetArrow
      graph.setStyle(edge, edgeStyle)
    } else if (oldStyle instanceof DemoEdgeStyle) {
      showTargetArrow = oldStyle.showTargetArrows
    }
    if (
      oldStyle instanceof PolylineEdgeStyle &&
      oldStyle.stroke.fill.color !== Color.fromRGBA(51, 102, 153)
    ) {
      graph.setStyle(
        edge,
        new PolylineEdgeStyle({
          stroke: new Stroke(oldStyle.stroke.fill),
          targetArrow: oldStyle.targetArrow
        })
      )
    } else {
      const edgeStyle = new DemoEdgeStyle()
      edgeStyle.showTargetArrows = showTargetArrow
      graph.setStyle(edge, edgeStyle)
    }
  })
  graph.invalidateDisplays()
}

/**
 * @param {IGraph} graph
 */
function onGenerateEdgeDirections(graph) {
  graph.edges.forEach(edge => {
    const directed = Math.random() >= 0.5
    const style = edge.style
    if (style instanceof PolylineEdgeStyle) {
      style.targetArrow = directed ? new DemoArrow() : IArrow.NONE
    } else {
      graph.setStyle(edge, new DemoEdgeStyle())
      edge.style.showTargetArrows = directed
    }
  })
  graph.invalidateDisplays()
}

/**
 * @param {IGraph} graph
 * @param {boolean} [directed]
 */
function onResetEdgeDirections(graph, directed) {
  graph.edges.forEach(edge => {
    const style = edge.style
    if (style instanceof PolylineEdgeStyle) {
      style.targetArrow =
        typeof directed === 'undefined' || !directed || style.targetArrow === null
          ? IArrow.NONE
          : new DemoArrow()
    } else {
      graph.setStyle(edge, new DemoEdgeStyle())
      edge.style.showTargetArrows =
        typeof directed !== 'undefined' ? directed : style.showTargetArrows
    }
  })
  graph.invalidateDisplays()
}

/**
 * Initializes the graph instance and set default styles.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  // Enable grouping and undo support.
  graph.undoEngineEnabled = true

  // set some nice defaults
  initDemoStyles(graph)

  // use a smart label model to support integrated labeling
  const model = new SmartEdgeLabelModel({ autoRotation: false })
  graph.edgeDefaults.labels.layoutParameter = model.createDefaultParameter()
}

/**
 * Creates the default input mode for the <code>GraphComponent</code>,
 * a {@link GraphEditorInputMode}.
 * @return {IInputMode} a new <code>GraphEditorInputMode</code> instance configured for snapping and
 *   orthogonal edge editing
 */
function createEditorMode() {
  const newGraphSnapContext = new GraphSnapContext({
    enabled: false,
    gridSnapType: GridSnapTypes.NONE
  })

  const newLabelSnapContext = new LabelSnapContext({
    enabled: false
  })

  // create default interaction with snapping and orthogonal edge editing
  const mode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    snapContext: newGraphSnapContext,
    labelSnapContext: newLabelSnapContext,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext({
      // initially disable the orthogonal edge editing
      enabled: false
    })
  })
  mode.navigationInputMode.collapsingGroupsAllowed = false
  mode.navigationInputMode.expandingGroupsAllowed = false

  // make bend creation more important than moving of selected edges
  // this has the effect that dragging a selected edge (not its bends)
  // will create a new bend instead of moving all bends
  // This is especially nicer in conjunction with orthogonal
  // edge editing because this creates additional bends every time
  // the edge is moved otherwise
  mode.createBendInputMode.priority = mode.moveInputMode.priority - 1

  // use WebGL rendering for handles if possible, otherwise the handles are rendered using SVG
  if (webGlSupported) {
    mode.handleInputMode.renderMode = RenderModes.WEB_GL
  }

  // also we add a context menu
  initializeContextMenu(mode)

  return mode
}

/**
 * @param {GraphInputMode} inputMode
 */
function initializeContextMenu(inputMode) {
  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, args) =>
    populateContextMenu(contextMenu, args)
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Populates the context menu based on the item the mouse hovers over
 * @param {ContextMenu} contextMenu
 * @param {PopulateItemContextMenuEventArgs<IModelItem>} args
 */
function populateContextMenu(contextMenu, args) {
  contextMenu.clearItems()

  // get the item which is located at the mouse position
  const hits = graphComponent.graphModelManager.hitTester.enumerateHits(
    args.context,
    args.queryLocation
  )

  // check whether a node was it. If it was, we prefer it over edges
  const hit = hits.find(item => INode.isInstance(item)) || hits.firstOrDefault()

  if (hit === null) {
    // empty canvas hit: provide 'select all'
    contextMenu.addMenuItem('Select All', () => {
      ICommand.SELECT_ALL.execute(null, graphComponent)
    })
  }

  const graphSelection = graphComponent.selection

  // if a node or an edge is hit: provide 'Select All Nodes' or 'Select All Edges', respectively
  // also: select the hit item
  if (INode.isInstance(hit)) {
    contextMenu.addMenuItem('Select All Nodes', () => {
      graphComponent.selection.clear()
      graphComponent.graph.nodes.forEach(node => {
        graphComponent.selection.setSelected(node, true)
      })
    })
    if (!graphSelection.isSelected(hit)) {
      graphSelection.clear()
    }
    graphSelection.setSelected(hit, true)
  } else if (IEdge.isInstance(hit)) {
    contextMenu.addMenuItem('Select All Edges', () => {
      graphComponent.selection.clear()
      graphComponent.graph.edges.forEach(edge => {
        graphComponent.selection.setSelected(edge, true)
      })
    })
    if (!graphSelection.isSelected(hit)) {
      graphSelection.clear()
    }
    graphSelection.setSelected(hit, true)
  }
  // if one or more nodes are selected: add options to cut and copy
  if (graphSelection.selectedNodes.size > 0) {
    contextMenu.addMenuItem('Cut', () => {
      ICommand.CUT.execute(null, graphComponent)
    })
    contextMenu.addMenuItem('Copy', () => {
      ICommand.COPY.execute(null, graphComponent)
    })
  }
  if (!graphComponent.clipboard.empty) {
    // clipboard is not empty: add option to paste
    contextMenu.addMenuItem('Paste', () => {
      ICommand.PASTE.execute(args.queryLocation, graphComponent)
    })
  }

  // finally, if the context menu has at least one entry, set the showMenu flag
  if (contextMenu.element.childNodes.length > 0) {
    args.showMenu = true
  }
}

/**
 * Wire up the UI...
 */
function registerCommands() {
  // called by the demo framework initially so that the button commands can be bound to actual commands and actions
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.graph.undoEngine.clear()
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent, null)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent, null)

  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent, null)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent, null)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent, null)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent, null)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent, null)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent, null)

  bindCommand(
    "button[data-command='GroupSelection']",
    ICommand.GROUP_SELECTION,
    graphComponent,
    null
  )
  bindCommand(
    "button[data-command='UngroupSelection']",
    ICommand.UNGROUP_SELECTION,
    graphComponent,
    null
  )

  bindAction('#snapping-button', () => {
    const snappingEnabled = document.querySelector('#snapping-button').checked
    graphComponent.inputMode.snapContext.enabled = snappingEnabled
    graphComponent.inputMode.labelSnapContext.enabled = snappingEnabled
  })

  bindAction('#orthogonal-editing-button', () => {
    graphComponent.inputMode.orthogonalEdgeEditingContext.enabled = document.querySelector(
      '#orthogonal-editing-button'
    ).checked
  })

  bindAction("button[data-command='LayoutCommand']", () => {
    applyLayout(false)
  })
  bindAction("button[data-command='ResetConfigCommand']", resetConfig)
  bindChangeListener("select[data-command='LayoutSelectionChanged']", onLayoutChanged)
  bindChangeListener("select[data-command='SampleSelectionChanged']", onSampleChanged)

  bindAction("button[data-command='PreviousFile']", () => {
    sampleComboBox.selectedIndex--
    if (sampleComboBox.options[sampleComboBox.selectedIndex].disabled) {
      // skip the '-------'
      sampleComboBox.selectedIndex--
    }
    onSampleChanged()
  })
  bindAction("button[data-command='NextFile']", () => {
    sampleComboBox.selectedIndex++
    if (sampleComboBox.options[sampleComboBox.selectedIndex].disabled) {
      // skip the '-------'
      sampleComboBox.selectedIndex++
    }
    onSampleChanged()
  })

  bindAction("button[data-command='GenerateNodeLabels']", () => {
    onGenerateItemLabels(graphComponent.graph.nodes)
  })
  bindAction("button[data-command='GenerateEdgeLabels']", () => {
    onGenerateItemLabels(graphComponent.graph.edges)
  })
  bindAction("button[data-command='RemoveLabels']", () => {
    onRemoveItemLabels(graphComponent.graph)
  })
  bindAction("button[data-command='GenerateEdgeThicknesses']", () => {
    onGenerateEdgeThicknesses(graphComponent.graph)
  })
  bindAction("button[data-command='ResetEdgeThicknesses']", () => {
    onResetEdgeThicknesses(graphComponent.graph)
  })
  bindAction("button[data-command='GenerateEdgeDirections']", () => {
    onGenerateEdgeDirections(graphComponent.graph)
  })
  bindAction("button[data-command='ResetEdgeDirections']", () => {
    onResetEdgeDirections(graphComponent.graph, true)
  })

  window.addEventListener('hashchange', () => {
    loadSampleFromLocationHash()
  })
}

function releaseLocks() {
  inLoadSample = false
  inLayout = false
}

/**
 * Enables the HTML elements and the input mode.
 * @param {boolean} disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector("button[data-command='New']").disabled = disabled
  document.querySelector("button[data-command='Open']").disabled = disabled
  document.querySelector("button[data-command='Save']").disabled = disabled
  sampleComboBox.disabled = disabled
  nextButton.disabled = disabled
  previousButton.disabled = disabled
  layoutButton.disabled = disabled
  resetButton.disabled = disabled
  graphComponent.inputMode.waiting = disabled
}

function updateUIState() {
  sampleComboBox.disabled = false
  nextButton.disabled = sampleComboBox.selectedIndex >= sampleComboBox.length - 1
  previousButton.disabled = sampleComboBox.selectedIndex <= 0
  layoutButton.disabled = !(configOptionsValid && !inLayout)
}

/**
 * Returns whether or not the current layout algorithm considers edge directions.
 * @param {string} key The descriptor of the current layout.
 * @return {boolean}
 */
function isLayoutDirected(key) {
  return (
    key !== 'Organic' &&
    key !== 'Orthogonal' &&
    key !== 'Circular' &&
    key !== 'Edge Router with Buses'
  )
}

/**
 * Programmatically creates a sample graph so that we do not require GraphML I/O for this demo.
 */
function createSampleGraph(graph) {
  graph.clear()
  const nodes = []
  for (let i = 0; i < 27; i++) {
    nodes[i] = graph.createNode()
  }

  graph.createEdge(nodes[3], nodes[7])
  graph.createEdge(nodes[0], nodes[1])
  graph.createEdge(nodes[0], nodes[4])
  graph.createEdge(nodes[1], nodes[2])
  graph.createEdge(nodes[0], nodes[9])
  graph.createEdge(nodes[6], nodes[10])
  graph.createEdge(nodes[11], nodes[12])
  graph.createEdge(nodes[11], nodes[13])
  graph.createEdge(nodes[8], nodes[11])
  graph.createEdge(nodes[15], nodes[16])
  graph.createEdge(nodes[16], nodes[17])
  graph.createEdge(nodes[18], nodes[19])
  graph.createEdge(nodes[20], nodes[21])
  graph.createEdge(nodes[7], nodes[17])
  graph.createEdge(nodes[9], nodes[22])
  graph.createEdge(nodes[22], nodes[3])
  graph.createEdge(nodes[19], nodes[0])
  graph.createEdge(nodes[8], nodes[4])
  graph.createEdge(nodes[18], nodes[25])
  graph.createEdge(nodes[24], nodes[8])
  graph.createEdge(nodes[26], nodes[25])
  graph.createEdge(nodes[10], nodes[20])
  graph.createEdge(nodes[5], nodes[23])
  graph.createEdge(nodes[25], nodes[15])
  graph.createEdge(nodes[10], nodes[15])
  graph.createEdge(nodes[21], nodes[17])
  graph.createEdge(nodes[26], nodes[6])
  graph.createEdge(nodes[13], nodes[12])
  graph.createEdge(nodes[12], nodes[14])
  graph.createEdge(nodes[14], nodes[11])
  graph.createEdge(nodes[21], nodes[5])
  graph.createEdge(nodes[5], nodes[6])
  graph.createEdge(nodes[9], nodes[7])
  graph.createEdge(nodes[19], nodes[24])
}

/** @return {string[]} */
function getLoremIpsum() {
  return [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'donec',
    'felis',
    'erat',
    'malesuada',
    'quis',
    'ipsum',
    'et',
    'condimentum',
    'ultrices',
    'orci',
    'nullam',
    'interdum',
    'vestibulum',
    'eros',
    'sed',
    'porta',
    'donec',
    'ac',
    'eleifend',
    'dolor',
    'at',
    'dictum',
    'ipsum',
    'pellentesque',
    'vel',
    'suscipit',
    'mi',
    'nullam',
    'aliquam',
    'turpis',
    'et',
    'dolor',
    'porttitor',
    'varius',
    'nullam',
    'vel',
    'arcu',
    'rutrum',
    'iaculis',
    'est',
    'sit',
    'amet',
    'rhoncus',
    'turpis',
    'vestibulum',
    'lacinia',
    'sollicitudin',
    'urna',
    'nec',
    'vestibulum',
    'nulla',
    'id',
    'lacinia',
    'metus',
    'etiam',
    'ac',
    'felis',
    'rutrum',
    'sollicitudin',
    'erat',
    'vitae',
    'egestas',
    'tortor',
    'curabitur',
    'quis',
    'libero',
    'aliquet',
    'mattis',
    'mauris',
    'nec',
    'tempus',
    'nibh',
    'in',
    'at',
    'lectus',
    'luctus',
    'mattis',
    'urna',
    'pretium',
    'eleifend',
    'lacus',
    'sed',
    'interdum',
    'sapien',
    'nec',
    'justo',
    'vestibulum',
    'non',
    'scelerisque',
    'nibh',
    'sollicitudin',
    'interdum',
    'et',
    'malesuada',
    'fames',
    'ac',
    'ante',
    'ipsum',
    'primis',
    'in',
    'faucibus',
    'vivamus',
    'congue',
    'tristique',
    'magna',
    'quis',
    'elementum',
    'phasellus',
    'sit',
    'amet',
    'tristique',
    'massa',
    'vestibulum',
    'eu',
    'leo',
    'vitae',
    'quam',
    'dictum',
    'venenatis',
    'eu',
    'id',
    'nibh',
    'donec',
    'eget',
    'eleifend',
    'felis',
    'nulla',
    'ac',
    'suscipit',
    'ante',
    'et',
    'sollicitudin',
    'dui',
    'mauris',
    'in',
    'pulvinar',
    'tortor',
    'vestibulum',
    'pulvinar',
    'arcu',
    'vel',
    'tellus',
    'maximus',
    'blandit',
    'morbi',
    'sed',
    'sem',
    'vehicula',
    'fermentum',
    'nisi',
    'eu',
    'fringilla',
    'metus',
    'duis',
    'ut',
    'quam',
    'eget',
    'odio',
    'hendrerit',
    'finibus',
    'ut',
    'a',
    'lectus',
    'cras',
    'ullamcorper',
    'turpis',
    'in',
    'purus',
    'facilisis',
    'vestibulum',
    'donec',
    'maximus',
    'ac',
    'tortor',
    'tempus',
    'egestas',
    'aenean',
    'est',
    'diam',
    'dictum',
    'et',
    'sodales',
    'vel',
    'efficitur',
    'ac',
    'libero',
    'vivamus',
    'vehicula',
    'ligula',
    'eu',
    'diam',
    'auctor',
    'at',
    'dapibus',
    'nulla',
    'pellentesque',
    'morbi',
    'et',
    'dapibus',
    'dolor',
    'quis',
    'auctor',
    'turpis',
    'nunc',
    'sed',
    'pretium',
    'diam',
    'quisque',
    'non',
    'massa',
    'consectetur',
    'tempor',
    'augue',
    'vel',
    'volutpat',
    'ex',
    'vivamus',
    'vestibulum',
    'dolor',
    'risus',
    'quis',
    'mollis',
    'urna',
    'fermentum',
    'sed',
    'sed',
    'porttitor',
    'venenatis',
    'volutpat',
    'nulla',
    'facilisi',
    'donec',
    'aliquam',
    'mi',
    'vitae',
    'ligula',
    'dictum',
    'ornare',
    'suspendisse',
    'finibus',
    'ligula',
    'vitae',
    'congue',
    'iaculis',
    'donec',
    'vestibulum',
    'erat',
    'vel',
    'tortor',
    'iaculis',
    'tempor',
    'vivamus',
    'et',
    'purus',
    'eu',
    'ipsum',
    'rhoncus',
    'pretium',
    'sit',
    'amet',
    'nec',
    'nisl',
    'nunc',
    'molestie',
    'consectetur',
    'rhoncus',
    'duis',
    'ex',
    'nunc',
    'interdum',
    'at',
    'molestie',
    'quis',
    'blandit',
    'quis',
    'diam',
    'nunc',
    'imperdiet',
    'lorem',
    'vel',
    'scelerisque',
    'facilisis',
    'eros',
    'massa',
    'auctor',
    'nisl',
    'vitae',
    'efficitur',
    'leo',
    'diam',
    'vel',
    'felis',
    'aliquam',
    'tincidunt',
    'dapibus',
    'arcu',
    'in',
    'pulvinar',
    'metus',
    'tincidunt',
    'et',
    'etiam',
    'turpis',
    'ligula',
    'sodales',
    'a',
    'eros',
    'vel',
    'fermentum',
    'imperdiet',
    'purus',
    'fusce',
    'mollis',
    'enim',
    'sed',
    'volutpat',
    'blandit',
    'arcu',
    'orci',
    'iaculis',
    'est',
    'non',
    'iaculis',
    'lorem',
    'sapien',
    'sit',
    'amet',
    'est',
    'morbi',
    'ut',
    'porttitor',
    'elit',
    'aenean',
    'ac',
    'sodales',
    'lectus',
    'morbi',
    'ut',
    'bibendum',
    'arcu',
    'maecenas',
    'tincidunt',
    'erat',
    'vel',
    'maximus',
    'pellentesque',
    'ut',
    'placerat',
    'quam',
    'sem',
    'a',
    'auctor',
    'ligula',
    'imperdiet',
    'quis',
    'pellentesque',
    'gravida',
    'consectetur',
    'urna',
    'suspendisse',
    'vitae',
    'nisl',
    'et',
    'ante',
    'ornare',
    'vulputate',
    'sed',
    'a',
    'est',
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'eu',
    'facilisis',
    'lectus',
    'nullam',
    'iaculis',
    'dignissim',
    'eros',
    'eget',
    'tincidunt',
    'metus',
    'viverra',
    'at',
    'donec',
    'nec',
    'justo',
    'vitae',
    'risus',
    'eleifend',
    'imperdiet',
    'eget',
    'ut',
    'ante',
    'ut',
    'arcu',
    'ex',
    'convallis',
    'in',
    'lobortis',
    'at',
    'mattis',
    'sed',
    'velit',
    'ut',
    'viverra',
    'ultricies',
    'lacus',
    'suscipit',
    'feugiat',
    'eros',
    'luctus',
    'et',
    'vestibulum',
    'et',
    'aliquet',
    'mauris',
    'quisque',
    'convallis',
    'purus',
    'posuere',
    'aliquam',
    'nulla',
    'sit',
    'amet',
    'posuere',
    'orci',
    'nullam',
    'sed',
    'iaculis',
    'mauris',
    'ut',
    'volutpat',
    'est',
    'suspendisse',
    'in',
    'vestibulum',
    'felis',
    'nullam',
    'gravida',
    'nulla',
    'at',
    'varius',
    'fringilla',
    'ipsum',
    'ipsum',
    'finibus',
    'lectus',
    'nec',
    'vestibulum',
    'lorem',
    'arcu',
    'ut',
    'magna',
    'aliquam',
    'aliquam',
    'erat',
    'erat',
    'ac',
    'euismod',
    'orci',
    'iaculis',
    'blandit',
    'morbi',
    'tincidunt',
    'posuere',
    'mi',
    'non',
    'eleifend',
    'vivamus',
    'accumsan',
    'dolor',
    'magna',
    'in',
    'cursus',
    'eros',
    'malesuada',
    'eu',
    'sed',
    'auctor',
    'consectetur',
    'tempus',
    'maecenas',
    'luctus',
    'turpis',
    'a'
  ]
}

// start demo
loadJson().then(run)
