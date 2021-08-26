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
  Class,
  Color,
  DefaultGraph,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  GraphInputMode,
  GraphMLSupport,
  GraphOverviewComponent,
  GraphSnapContext,
  GridSnapTypes,
  IArrow,
  ICommand,
  IEdge,
  IEnumerable,
  IGraph,
  IInputMode,
  ILabelOwner,
  ILabel,
  ImageNodeStyle,
  IModelItem,
  INode,
  LabelSnapContext,
  License,
  List,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  Rect,
  RenderModes,
  SmartEdgeLabelModel,
  StorageLocation,
  Stroke,
  TableNodeStyle
} from 'yfiles'

// We need to load the 'styles-other' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for loading all library styles.
Class.ensure(ImageNodeStyle)

import { OptionEditor } from '../../resources/demo-option-editor'
import HierarchicLayoutConfig from './HierarchicLayoutConfig'
import OrganicLayoutConfig from './OrganicLayoutConfig'
import OrthogonalLayoutConfig from './OrthogonalLayoutConfig'
import CircularLayoutConfig from './CircularLayoutConfig'
import TreeLayoutConfig from './TreeLayoutConfig'
import ClassicTreeLayoutConfig from './ClassicTreeLayoutConfig'
import BalloonLayoutConfig from './BalloonLayoutConfig'
import RadialLayoutConfig from './RadialLayoutConfig'
import SeriesParallelLayoutConfig from './SeriesParallelLayoutConfig'
import PolylineEdgeRouterConfig from './PolylineEdgeRouterConfig'
import ChannelEdgeRouterConfig from './ChannelEdgeRouterConfig'
import BusEdgeRouterConfig from './BusEdgeRouterConfig'
import OrganicEdgeRouterConfig from './OrganicEdgeRouterConfig'
import ParallelEdgeRouterConfig from './ParallelEdgeRouterConfig'
import LabelingConfig from './LabelingConfig'
import ComponentLayoutConfig from './ComponentLayoutConfig'
import TabularLayoutConfig from './TabularLayoutConfig'
import PartialLayoutConfig from './PartialLayoutConfig'
import GraphTransformerConfig from './GraphTransformerConfig'
import { PresetsUiBuilder } from './PresetsUiBuilder'
import ContextMenu from '../../utils/ContextMenu'
import {
  DemoArrow,
  DemoEdgeStyle,
  DemoGroupStyle,
  DemoNodeStyle,
  DemoStyleOverviewPaintable,
  initDemoStyles
} from '../../resources/demo-styles'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  removeClass,
  showApp
} from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { webGlSupported } from '../../utils/Workarounds'
import { createConfiguredGraphMLIOHandler } from './FaultTolerantGraphMLIOHandler'
import { isSeparator, LayoutStyles, Presets } from './resources/LayoutSamples'
import { LoremIpsum } from './resources/LoremIpsum'
import type { LayoutSample } from './resources/LayoutSamples'
import type { LayoutConfigurationType } from './LayoutConfiguration'

/**
 * The GraphComponent
 */
let graphComponent: GraphComponent

/**
 * The overview component
 */
let overviewComponent: GraphOverviewComponent

/**
 * The option editor that stores the currently selected layout configuration.
 */
let optionEditor: OptionEditor
let presetsUiBuilder: PresetsUiBuilder

let configOptionsValid = false
let inLayout = false
let inLoadSample = false

const comboBoxSeparatorItem = '-----------'

// get hold of some UI elements
const layoutComboBox = getElementById<HTMLSelectElement>('layout-select-box')
const sampleComboBox = getElementById<HTMLSelectElement>('sample-select-box')
const nextButton = getElementById<HTMLButtonElement>('next-sample-button')
const previousButton = getElementById<HTMLButtonElement>('previous-sample-button')
const layoutButton = getElementById<HTMLButtonElement>('apply-layout-button')

// keep track of user interactions with the graph
let customGraphSelected = false
let customGraph: IGraph | null = null

async function run(licenseData: object) {
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

  // use the file system for built-in I/O
  enableGraphML()
  // initialize the property editor
  const editorElement = getElementById<HTMLDivElement>('data-editor')
  optionEditor = new OptionEditor(editorElement)

  // initialize the presets UI builder
  presetsUiBuilder = new PresetsUiBuilder({
    rootElement: getElementById<HTMLDivElement>('data-presets'),
    optionEditor: optionEditor,
    presetDefs: Presets,
    onPresetApplied: (): void => applyLayout(false)
  })

  // disable UI during initialization
  setUIDisabled(true)

  // initialize the graph and the defaults
  initializeGraph()

  // configure overview panel
  overviewComponent.graphVisualCreator = new DemoStyleOverviewPaintable(graphComponent.graph)

  // after the initial graph is loaded, we continue loading with the algorithms
  initializeLayoutAlgorithms()

  // initialize the demo
  showApp(graphComponent, overviewComponent)

  await initializeApplicationFromUrl()

  updateStyleDefaults()
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML(): void {
  const graphMLIOHandler = createConfiguredGraphMLIOHandler()
  graphMLIOHandler.addParsedListener((sender, args) => {
    updateModifiedGraphSample()
  })
  new GraphMLSupport({
    graphComponent,
    // configure to load and save to the file system
    storageLocation: StorageLocation.FILE_SYSTEM,
    graphMLIOHandler: graphMLIOHandler
  })
}

/**
 * Populates the sample combobox depending on the chosen layout algorithm.
 */
function initializeSamples(layoutName: string): void {
  const selectedLayout = LayoutStyles.find(
    entry => !isSeparator(entry) && getNormalizedName(entry.layout) === layoutName
  ) as LayoutSample
  if (selectedLayout) {
    const files = [...selectedLayout.samples]
    if (customGraph !== null) {
      files.push({ label: 'Modified Graph', sample: 'modified-graph' })
    }
    initializeComboBox(sampleComboBox, files)
    if (customGraphSelected) {
      sampleComboBox.selectedIndex = sampleComboBox.options.length - 1
    }
  }
}

/**
 * Loads all layout modules and populates the layout combo box.
 */
function initializeLayoutAlgorithms(): void {
  const layoutNames = LayoutStyles.map(entry =>
    isSeparator(entry) ? comboBoxSeparatorItem : entry.layout
  )
  initializeComboBox(layoutComboBox, layoutNames)
}

/**
 * Creates a new instance of the configuration for the layout algorithm with the given name.
 * @param normalizedName The name of the layout algorithm for which a configuration is created.
 */
function createLayoutConfig(normalizedName: string): LayoutConfigurationType {
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
    case 'classic-tree':
      return new ClassicTreeLayoutConfig()
    default:
      return new HierarchicLayoutConfig()
  }
}

/**
 * Returns the index of the first option with the given value.
 * @param combobox The combobox to search.
 * @param value The value to match.
 * @return The index of the first option with the given text (ignoring case), or -1 if no
 *   such option exists.
 */
function getIndexInComboBox(combobox: HTMLSelectElement, value: string): number {
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
 * Populates the given HTMLSelectElement with the items in the given string array.
 */
function initializeComboBox(
  combobox: HTMLSelectElement,
  names: string[] | { label: string; sample: string }[]
): void {
  while (combobox.firstChild) {
    combobox.removeChild(combobox.firstChild)
  }

  for (const entry of names) {
    let label = ''
    let value = ''
    if (typeof entry === 'string') {
      label = entry
      value = getNormalizedName(entry)
    } else {
      label = entry.label
      value = entry.sample
    }
    const option = document.createElement('option')
    combobox.add(option)
    option.textContent = label
    if (entry === comboBoxSeparatorItem) {
      option.disabled = true
    } else {
      option.value = value
    }
  }
}

/**
 * Actually applies the layout.
 * @param clearUndo Specifies whether the undo queue should be cleared after the layout
 * calculation. This is set to <code>true</code> if this method is called directly after
 * loading a new sample graph.
 */
function applyLayout(clearUndo: boolean): void {
  const config = optionEditor.config as LayoutConfigurationType

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
      graphComponent.graph.undoEngine!.clear()
    }
  })
}

function getSelectedAlgorithm(): string {
  return layoutComboBox.options[layoutComboBox.selectedIndex].value
}

function updateThicknessButtonsState(layoutName: string): void {
  const generateEdgeThicknessButton = getElementById<HTMLButtonElement>(
    'generate-edge-thickness-button'
  )
  const resetEdgeThicknessButton = getElementById<HTMLButtonElement>('reset-edge-thickness-button')
  const generateEdgeDirectionButton = getElementById<HTMLButtonElement>(
    'generate-edge-direction-button'
  )
  const resetEdgeDirectionButton = getElementById<HTMLButtonElement>('reset-edge-direction-button')
  if (layoutName === 'hierarchic') {
    // enable edge-thickness buttons only for Hierarchic Layout
    generateEdgeThicknessButton.disabled = false
    resetEdgeThicknessButton.disabled = false
    generateEdgeDirectionButton.disabled = false
    resetEdgeDirectionButton.disabled = false
  } else {
    // disable edge-thickness buttons for all other layouts
    generateEdgeThicknessButton.disabled = true
    resetEdgeThicknessButton.disabled = true
    generateEdgeDirectionButton.disabled = true
    resetEdgeDirectionButton.disabled = true
    if (!customGraphSelected) {
      onResetEdgeThicknesses(graphComponent.graph)
      onResetEdgeDirections(graphComponent.graph)
    }
  }
}

/**
 * Handles a selection change in the layout combo box.
 */
async function onLayoutChanged(initSamples = true, appliedPresetId = ''): Promise<void> {
  const layoutName = getSelectedAlgorithm()
  if (layoutName != null) {
    if (initSamples) {
      initializeSamples(layoutName)
    }

    setDefaultArrows(graphComponent.graph, isLayoutDirected(layoutName))

    // maybe enable thickness buttons
    updateThicknessButtonsState(layoutName)

    // use a new instance to re-initialize the default values
    const config = createLayoutConfig(layoutName)

    // place description in left sidebar
    updateDescriptionText(config)

    // this demo starts with collapsed option settings by default
    config.collapsedInitialization = true

    optionEditor.config = config
    optionEditor.validateConfigCallback = (b: boolean) => {
      configOptionsValid = b
      layoutButton.disabled = !(configOptionsValid && !inLayout)
    }

    let presetsStruct: { presets: string[]; defaultPreset: string; invalidPresets: string[] }
    if (customGraphSelected) {
      presetsStruct = findPresets(layoutName)
      presetsStruct.defaultPreset = presetsStruct.presets[0]
    } else {
      const key = getSelectedSample()
      await onSampleChangedCore(key)
      presetsStruct = findPresets(layoutName, key)
    }

    presetsUiBuilder.buildUi(
      presetsStruct,
      appliedPresetId ? appliedPresetId : presetsStruct.defaultPreset
    )

    applyLayout(!customGraphSelected)
  }
}

function updateDescriptionText(config: LayoutConfigurationType): void {
  const layoutDescriptionContainer = getElementById<HTMLDivElement>('layout-description-container')
  const layoutDescription = getElementById<HTMLDivElement>('layout-description')
  const layoutTitle = getElementById<HTMLElement>('layout-title')

  removeClass(layoutDescriptionContainer, 'highlight-description')
  while (layoutDescription.firstChild) {
    layoutDescription.removeChild(layoutDescription.lastChild!)
  }
  layoutTitle.innerHTML = ''

  if (config.descriptionText) {
    layoutDescription.innerHTML = config.descriptionText
    layoutTitle.innerHTML = config.title

    // highlight the description once
    setTimeout(() => {
      addClass(layoutDescriptionContainer, 'highlight-description')
    }, 0)
  }
}

function findPresets(
  algorithmName: string,
  sampleKey = ''
): { presets: string[]; defaultPreset: string; invalidPresets: string[] } {
  const algorithm = findAlgorithmImpl(algorithmName)
  if (algorithm && algorithm.samples) {
    const presets = algorithm.presets ? algorithm.presets : []
    const invalidPresets: string[] = []
    const presetStruct = { presets, defaultPreset: '', invalidPresets }
    if (sampleKey !== '') {
      if (sampleKey !== 'modified-graph') {
        for (const entry of algorithm.samples) {
          if (entry.sample && getNormalizedName(entry.sample) === sampleKey) {
            if (entry.defaultPreset) {
              presetStruct.defaultPreset = entry.defaultPreset
            }
            if (entry.invalidPresets) {
              presetStruct.invalidPresets = [...entry.invalidPresets]
            }
          }
        }
      } else {
        //always select default preset for modified graph sample
        presetStruct.defaultPreset = presets[0]
      }
    }
    return presetStruct
  }
  return { presets: [], defaultPreset: '', invalidPresets: [] }
}

function findAlgorithmImpl(algorithmName: string): LayoutSample | null {
  for (const entry of LayoutStyles) {
    if (!isSeparator(entry) && getNormalizedName(entry.layout) === algorithmName) {
      return entry
    }
  }
  return null
}

/**
 * Returns the value of the currently selected sample.
 */
function getSelectedSample(): string {
  return sampleComboBox.options[sampleComboBox.selectedIndex].value
}

/**
 * Returns the normalized version of the given name, i.e., in lowercase and '-' instead of space.
 */
function getNormalizedName(name: string): string {
  return name.toLowerCase().replace(/[\s]/g, '-')
}

/**
 * Initializes the application configuration from the URL.
 */
async function initializeApplicationFromUrl(): Promise<void> {
  const hash = window.location.hash
  if (hash) {
    await loadConfigurationFromLocationHash(hash)
  } else {
    await loadConfigurationFromUrl()
  }
}

/**
 * Updates current layout algorithm and current sample graph when the window location hash changes.
 */
async function onHashChanged(): Promise<void> {
  const hash = window.location.hash
  if (hash) {
    await loadConfigurationFromLocationHash(hash)
  } else {
    await onLayoutChanged()
  }
}

/**
 * Checks whether the location hash specifies a valid sample, and loads that.
 */
async function loadConfigurationFromLocationHash(windowLocationHash: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  const match = windowLocationHash.match(/#([\w_-]+)/)
  const hash = match && match.length > 1 ? match[1].toLowerCase().replace(/_/g, '-') : ''

  let layout: string = hash
  let sample: string | null = null
  let preset: string | null = null

  // support some specific hashed URLs by parsing specific sample configurations
  if (hash === 'hierarchic-with-subcomponents') {
    layout = 'hierarchic'
    sample = 'hierarchic-with-subcomponents'
    preset = 'hierarchic-with-subcomponents'
  } else if (hash === 'hierarchic-with-buses') {
    layout = 'hierarchic'
    sample = 'hierarchic-with-buses'
    preset = 'hierarchic-with-buses'
  } else if (hash === 'hierarchic-with-curves') {
    layout = 'hierarchic'
    sample = 'hierarchic'
    preset = 'hierarchic-with-curves'
  } else if (hash === 'organic-with-substructures') {
    layout = 'organic'
    sample = 'organic-with-substructures'
    preset = 'organic-with-substructures'
  } else if (hash === 'orthogonal-with-substructures') {
    layout = 'orthogonal'
    sample = 'orthogonal-with-substructures'
    preset = 'orthogonal-with-substructures'
  } else if (hash === 'edge-router-with-buses') {
    layout = 'edge-router'
    sample = 'edge-router-with-buses'
    preset = 'edge-router-with-buses'
  } else if (hash === 'edge-router-with-curves') {
    layout = 'edge-router'
    sample = 'edge-router'
    preset = 'edge-router-with-curves'
  } else if (hash === 'grouping') {
    layout = 'hierarchic'
    sample = 'grouping'
  }

  await loadConfiguration(layout, sample, preset)
}

/**
 * Parses the URL parameters and loads the requested configuration.
 */
async function loadConfigurationFromUrl(): Promise<void> {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const requestedLayout = urlParams.get('layout')
    const requestedSample = urlParams.get('sample')
    const requestedPreset = urlParams.get('preset')
    await loadConfiguration(requestedLayout, requestedSample, requestedPreset)
  } catch (e) {
    /* URLSearchParams is not supported in IE, fallback to default algoritm and sample */
    onLayoutChanged()
  }
}

/**
 * Loads the requested layout, sample, and preset.
 */
async function loadConfiguration(
  layout: string | null = null,
  sample: string | null = null,
  preset: string | null = null
): Promise<void> {
  if (layout !== null) {
    // load the requested layout algorithm
    const layoutIndex = getIndexInComboBox(layoutComboBox, layout)
    if (layoutIndex === -1) {
      // maybe typo in hash which where it should just fail silently
      await onLayoutChanged()
      return
    }

    if (layoutIndex !== -1 && layoutComboBox.selectedIndex !== layoutIndex) {
      layoutComboBox.selectedIndex = layoutIndex
    }

    // always initialize the samples if the layout is given
    const layoutName = layoutComboBox.options[layoutIndex].value
    initializeSamples(layoutName)

    // load the requested sample
    if (sample !== null) {
      const sampleIndex = getIndexInComboBox(sampleComboBox, sample)
      if (sampleIndex !== -1 && sampleComboBox.selectedIndex !== sampleIndex) {
        sampleComboBox.selectedIndex = sampleIndex
      }
    }
  }

  // loads the requested layout alongside the selected sample
  await onLayoutChanged(layout === null, preset === null ? '' : preset)
}

/**
 * Copies the current graph into a temporary {@link IGraph} instance for later use.
 */
function storeModifiedGraph(): void {
  customGraph = new DefaultGraph()
  const copier = new GraphCopier()
  copier.copy(graphComponent.graph, customGraph)
}

/**
 * Loads the temporary stored modified graph into the the main {@link GraphComponent}.
 */
function loadModifiedGraph(): void {
  if (customGraph !== null) {
    graphComponent.graph.clear()
    const copier = new GraphCopier()
    copier.copy(customGraph, graphComponent.graph)
  }
}

/**
 * Stores the current state as modified graph and adds a sample graph item for it.
 */
function updateModifiedGraphSample(): void {
  addCustomGraphEntry()
  storeModifiedGraph()
}

/**
 * Adjusts the style defaults to match the overall graph theme.
 */
function updateStyleDefaults(): void {
  const graph = graphComponent.graph
  const firstNode = graph.nodes.firstOrDefault(n => !graph.isGroupNode(n))
  const firstGroupNode = graph.nodes.firstOrDefault(
    n => graph.isGroupNode(n) && !(n.style instanceof TableNodeStyle)
  )
  const firstEdge = graph.edges.firstOrDefault()
  if (firstNode) {
    graph.nodeDefaults.style = firstNode.style.clone()
  } else {
    graph.nodeDefaults.style = new DemoNodeStyle()
  }
  if (firstGroupNode) {
    graph.groupNodeDefaults.style = firstGroupNode.style.clone()
  } else {
    const groupStyle = new DemoGroupStyle()
    groupStyle.isCollapsible = graph.foldingView !== null
    graph.groupNodeDefaults.style = groupStyle
  }
  if (firstEdge) {
    graph.edgeDefaults.style = firstEdge.style.clone()
  } else {
    graph.edgeDefaults.style = new DemoEdgeStyle()
  }
}

/**
 * Handles a selection change in the sample combo box.
 */
async function onSampleChanged(): Promise<void> {
  if (inLayout || inLoadSample) {
    return
  }

  const key = getSelectedSample()
  await onSampleChangedCore(key)

  updateStyleDefaults()

  const presetsStruct = findPresets(getSelectedAlgorithm(), key)
  presetsUiBuilder.buildUi(presetsStruct, presetsStruct.defaultPreset)

  applyLayout(true)
}

async function onSampleChangedCore(key: string | null): Promise<void> {
  const graph = graphComponent.graph
  if (key == null || key === 'none') {
    // no specific item - just clear the graph
    graph.clear()
    // and fit the contents
    graphComponent.fitGraphBounds()
    return
  }
  inLoadSample = true
  setUIDisabled(true)

  if (customGraphSelected) {
    storeModifiedGraph()
  } else if (key === 'modified-graph') {
    loadModifiedGraph()
    applyLayout(true)
    customGraphSelected = true
    return
  }

  customGraphSelected = false
  setDefaultArrows(graph, isLayoutDirected(key))

  const filePath = `resources/${key}.graphml`

  // load the sample graph and start the layout algorithm in the done handler
  const ioh = createConfiguredGraphMLIOHandler(graphComponent)
  await ioh.readFromURL(graph, filePath)

  graphComponent.zoomTo(getCenter(graph), graphComponent.zoom)
}

/**
 * Generate and add random labels for a collection of ModelItems.
 * Existing items will be deleted before adding the new items.
 * @param items the collection of items the labels are
 *   generated for
 */
function onGenerateItemLabels(items: IEnumerable<ILabelOwner>): void {
  const wordCountMin = 1
  const wordCountMax = 3
  const labelPercMin = 0.2
  const labelPercMax = 0.7
  const labelCount = Math.floor(
    items.size * (Math.random() * (labelPercMax - labelPercMin) + labelPercMin)
  )

  const graph = graphComponent.graph

  const itemList = new List<ILabelOwner>()
  for (const item of items) {
    itemList.add(item)
    removeLabels(graph, item)
  }

  // add random item labels
  const loremList = LoremIpsum
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
    graph.addLabel(item, label)
  }
}

function onRemoveItemLabels(graph: IGraph): void {
  for (const edge of graph.edges) {
    removeLabels(graph, edge)
  }
  for (const node of graph.nodes) {
    removeLabels(graph, node)
  }
}

function onGenerateEdgeThicknesses(graph: IGraph): void {
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
    } else if (oldStyle instanceof DemoEdgeStyle) {
      style.targetArrow = oldStyle.showTargetArrows ? new DemoArrow() : IArrow.NONE
    }
    graph.setStyle(edge, style)
  })
}

function onResetEdgeThicknesses(graph: IGraph): void {
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
    if (oldStyle instanceof PolylineEdgeStyle && acceptFill(oldStyle)) {
      graph.setStyle(
        edge,
        new PolylineEdgeStyle({
          stroke: new Stroke(oldStyle.stroke!.fill),
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

function onGenerateEdgeDirections(graph: IGraph): void {
  graph.edges.forEach(edge => {
    const directed = Math.random() >= 0.5
    const style = edge.style
    if (style instanceof PolylineEdgeStyle) {
      style.targetArrow = directed ? new DemoArrow() : IArrow.NONE
    } else {
      const newStyle = new DemoEdgeStyle()
      newStyle.showTargetArrows = directed
      graph.setStyle(edge, newStyle)
    }
  })
  graph.invalidateDisplays()
}

function onResetEdgeDirections(graph: IGraph, directed = false): void {
  graph.edges.forEach(edge => {
    const style = edge.style
    if (style instanceof PolylineEdgeStyle) {
      style.targetArrow =
        typeof directed === 'undefined' || !directed || style.targetArrow === null
          ? IArrow.NONE
          : new DemoArrow()
    } else {
      const fallback = style instanceof DemoEdgeStyle ? style.showTargetArrows : false
      const newStyle = new DemoEdgeStyle()
      newStyle.showTargetArrows = typeof directed !== 'undefined' ? directed : fallback
      graph.setStyle(edge, newStyle)
    }
  })
  graph.invalidateDisplays()
}

/**
 * Initializes the graph instance and set default styles.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph

  // enable grouping and undo support
  graph.undoEngineEnabled = true

  // set some nice defaults
  initDemoStyles(graph)

  // use a smart label model to support integrated labeling
  const model = new SmartEdgeLabelModel({ autoRotation: false })
  graph.edgeDefaults.labels.layoutParameter = model.createDefaultParameter()

  registerGraphEditListeners()
}

/**
 * Store a custom graph entry in the samples, if users modify the graph interactively.
 * The demo only tracks structural changes to the graph.
 */
function registerGraphEditListeners(): void {
  const geim = graphComponent.inputMode as GraphEditorInputMode
  geim.addNodeCreatedListener(onGraphEdited)
  geim.addNodeReparentedListener(onGraphEdited)
  geim.addDeletedItemListener(onGraphEdited)
  geim.addLabelAddedListener(onGraphEdited)
  geim.addLabelTextChangedListener(onGraphEdited)
  geim.createEdgeInputMode.addEdgeCreatedListener(onGraphEdited)
}

/**
 * Listener called when graph is edited.
 */
function onGraphEdited(): void {
  addCustomGraphEntry()
  presetsUiBuilder.resetInvalidState()
}

/**
 * Adds a custom sample graph entry for a modified graph by the user.
 */
function addCustomGraphEntry(): void {
  customGraphSelected = true
  customGraph = customGraph || new DefaultGraph()
  let customGraphIdx: number = [...sampleComboBox.options].findIndex(
    entry => entry.value === 'modified-graph'
  )
  if (customGraphIdx === -1) {
    const option = document.createElement('option')
    sampleComboBox.add(option)
    option.textContent = 'Modified Graph'
    option.value = getNormalizedName(option.label)
    customGraphIdx = sampleComboBox.options.length - 1
  }
  sampleComboBox.selectedIndex = customGraphIdx
}

/**
 * Creates the default input mode for the <code>GraphComponent</code>,
 * a {@link GraphEditorInputMode}.
 * @return A new <code>GraphEditorInputMode</code> instance configured for snapping and
 *   orthogonal edge editing
 */
function createEditorMode(): IInputMode {
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
  mode.navigationInputMode.allowCollapseGroup = false
  mode.navigationInputMode.allowExpandGroup = false

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

function initializeContextMenu(inputMode: GraphInputMode): void {
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

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, args) =>
    populateContextMenu(contextMenu, args)
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = (): void => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Populates the context menu based on the item the mouse hovers over
 */
function populateContextMenu(
  contextMenu: ContextMenu,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
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
function registerCommands(): void {
  // called by the demo framework initially so that the button commands can be bound to actual commands and actions
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.graph.undoEngine!.clear()
  })
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent, null)
  bindCommand("button[data-command='OpenInSidebar']", ICommand.OPEN, graphComponent, null)
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
    const snappingEnabled = querySelector<HTMLInputElement>('#snapping-button').checked
    const geim = graphComponent.inputMode as GraphEditorInputMode
    geim.snapContext!.enabled = snappingEnabled
    geim.labelSnapContext!.enabled = snappingEnabled
  })

  bindAction('#orthogonal-editing-button', () => {
    const geim = graphComponent.inputMode as GraphEditorInputMode
    geim.orthogonalEdgeEditingContext!.enabled = querySelector<HTMLInputElement>(
      '#orthogonal-editing-button'
    ).checked
  })

  bindAction("button[data-command='LayoutCommand']", () => {
    applyLayout(false)
  })
  bindChangeListener("select[data-command='LayoutSelectionChanged']", onLayoutChanged)
  bindChangeListener("select[data-command='SampleSelectionChanged']", onSampleChanged)

  bindAction("button[data-command='PreviousStyle']", () => {
    layoutComboBox.selectedIndex--
    if (layoutComboBox.options[layoutComboBox.selectedIndex].disabled) {
      // skip the '-------'
      layoutComboBox.selectedIndex--
    }
    onLayoutChanged()
  })
  bindAction("button[data-command='NextStyle']", () => {
    layoutComboBox.selectedIndex++
    if (layoutComboBox.options[layoutComboBox.selectedIndex].disabled) {
      // skip the '-------'
      layoutComboBox.selectedIndex++
    }
    onLayoutChanged()
  })

  bindAction("button[data-command='GenerateNodeLabels']", () => {
    onGenerateItemLabels(graphComponent.graph.nodes)
    updateModifiedGraphSample()
  })
  bindAction("button[data-command='GenerateEdgeLabels']", () => {
    onGenerateItemLabels(graphComponent.graph.edges)
    updateModifiedGraphSample()
  })
  bindAction("button[data-command='RemoveLabels']", () => {
    onRemoveItemLabels(graphComponent.graph)
    updateModifiedGraphSample()
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
    onHashChanged()
  })

  // apply layout shortcut with CTRL+Enter
  window.addEventListener('keydown', e => {
    const geim = graphComponent.inputMode as GraphEditorInputMode
    if (!geim.textEditorInputMode.editing && e.which === 13 && (e.ctrlKey || e.metaKey)) {
      applyLayout(false)
      e.preventDefault()
    }
  })
  // also allow 'enter' within the option-editor
  getElementById<HTMLDivElement>('data-editor').addEventListener('keydown', e => {
    if (e.which === 13) {
      applyLayout(false)
      e.preventDefault()
    }
  })
}

function releaseLocks(): void {
  inLoadSample = false
  inLayout = false
}

/**
 * Enables the HTML elements and the input mode.
 * @param disabled true if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  querySelector<HTMLButtonElement>("button[data-command='New']").disabled = disabled
  querySelector<HTMLButtonElement>("button[data-command='Open']").disabled = disabled
  querySelector<HTMLButtonElement>("button[data-command='Save']").disabled = disabled
  sampleComboBox.disabled = disabled
  layoutComboBox.disabled = disabled
  nextButton.disabled = disabled
  previousButton.disabled = disabled
  layoutButton.disabled = disabled
  ;(graphComponent.inputMode as GraphEditorInputMode).waiting = disabled
  presetsUiBuilder.setPresetButtonDisabled(disabled)
}

function updateUIState(): void {
  sampleComboBox.disabled = false
  layoutComboBox.disabled = false
  nextButton.disabled = layoutComboBox.selectedIndex >= layoutComboBox.length - 1
  previousButton.disabled = layoutComboBox.selectedIndex <= 0
  layoutButton.disabled = !(configOptionsValid && !inLayout)
  presetsUiBuilder.setPresetButtonDisabled(false)
}

/**
 * Returns whether or not the current layout algorithm considers edge directions.
 * @param key The descriptor of the current layout.
 */
function isLayoutDirected(key: string): boolean {
  return (
    key !== 'Organic' &&
    key !== 'Orthogonal' &&
    key !== 'Circular' &&
    key !== 'Edge Router with Buses'
  )
}

function removeLabels(graph: IGraph, item: ILabelOwner): void {
  const labels = new List<ILabel>()
  for (const label of item.labels) {
    labels.add(label)
  }
  for (const label of labels) {
    graph.remove(label)
  }
}

function acceptFill(style: PolylineEdgeStyle): boolean {
  if (style.stroke && style.stroke.fill) {
    const color = (style.stroke.fill as any).color
    return color !== Color.fromRGBA(51, 102, 153)
  }
  return false
}

function setDefaultArrows(graph: IGraph, directed: boolean): void {
  ;(graph.edgeDefaults.style as DemoEdgeStyle).showTargetArrows = directed
}

/**
 * Calculates the center of the accumulated bounds of the given graph's nodes.
 */
function getCenter(graph: IGraph): Point {
  if (graph.nodes.size > 0) {
    let bounds = graph.nodes.first().layout.toRect()
    for (const node of graph.nodes) {
      bounds = Rect.add(bounds, node.layout.toRect())
    }
    return bounds.center
  } else {
    return Point.ORIGIN
  }
}

/**
 * Returns a reference to the first element with the specified ID in the current document.
 * @return A reference to the first element with the specified ID in the current document.
 */
function getElementById<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

function querySelector<T extends HTMLElement>(selector: string): T {
  return document.querySelector(selector) as T
}

// start demo
loadJson().then(checkLicense).then(run)
