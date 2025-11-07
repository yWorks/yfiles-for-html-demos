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
  Arrow,
  ArrowType,
  Graph,
  GraphComponent,
  GraphCopier,
  GraphEditorInputMode,
  type GraphInputMode,
  type GraphMLIOHandler,
  GraphOverviewComponent,
  GraphSnapContext,
  GridSnapTypes,
  HandlesRenderer,
  IArrow,
  IEdge,
  type IEnumerable,
  type IGraph,
  type IInputMode,
  type ILabel,
  type ILabelOwner,
  type IModelItem,
  INode,
  License,
  List,
  OrthogonalEdgeEditingContext,
  Point,
  PolylineEdgeStyle,
  type PopulateItemContextMenuEventArgs,
  Rect,
  RenderMode,
  SmartEdgeLabelModel,
  Stroke,
  TableNodeStyle
} from '@yfiles/yfiles'
import { OptionEditor } from '@yfiles/demo-app/demo-option-editor'
import { HierarchicalLayoutConfig } from './HierarchicalLayoutConfig'
import { OrganicLayoutConfig } from './OrganicLayoutConfig'
import { OrthogonalLayoutConfig } from './OrthogonalLayoutConfig'
import { CircularLayoutConfig } from './CircularLayoutConfig'
import { TreeLayoutConfig } from './TreeLayoutConfig'
import { RadialTreeLayoutConfig } from './RadialTreeLayoutConfig'
import { RadialLayoutConfig } from './RadialLayoutConfig'
import { SeriesParallelLayoutConfig } from './SeriesParallelLayoutConfig'
import { PolylineEdgeRouterConfig } from './PolylineEdgeRouterConfig'
import { OrganicEdgeRouterConfig } from './OrganicEdgeRouterConfig'
import { ParallelEdgeRouterConfig } from './ParallelEdgeRouterConfig'
import { LabelingConfig } from './LabelingConfig'
import { ComponentLayoutConfig } from './ComponentLayoutConfig'
import { TabularLayoutConfig } from './TabularLayoutConfig'
import { PartialLayoutConfig } from './PartialLayoutConfig'
import { LayoutTransformationsConfig } from './LayoutTransformationsConfig'
import { CompactDiskLayoutConfig } from './CompactDiskLayoutConfig'
import { PresetsUiBuilder } from './PresetsUiBuilder'
import { createConfiguredGraphMLIOHandler } from '@yfiles/demo-utils/FaultTolerantGraphMLIOHandler'
import type { LayoutSample } from './resources/LayoutSamples'
import { isSeparator, LayoutStyles, Presets } from './resources/LayoutSamples'
import { LoremIpsum } from './resources/LoremIpsum'
import type { LayoutConfigurationType } from './LayoutConfiguration'
import {
  createDemoEdgeStyle,
  createDemoGroupStyle,
  createDemoNodeStyle,
  DemoStyleOverviewRenderer,
  initDemoStyles
} from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { addNavigationButtons, BrowserDetection, finishLoading } from '@yfiles/demo-app/demo-page'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'

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
const layoutComboBox = document.querySelector<HTMLSelectElement>(`#layout-select-box`)!
addNavigationButtons(layoutComboBox, true, false, 'sidebar-button')
const sampleComboBox = document.querySelector<HTMLSelectElement>(`#sample-select-box`)!
const layoutButton = document.querySelector<HTMLButtonElement>(`#apply-layout-button`)!

// keep track of user interactions with the graph
let customGraphSelected = false
let customGraph: IGraph | null = null

async function run(): Promise<void> {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  // initialize the GraphOverviewComponent
  overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  configOptionsValid = true

  // we start loading the input mode
  graphComponent.inputMode = createEditorMode()

  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)

  // wire up the UI
  initializeUI()

  // initialize the property editor
  const editorElement = document.querySelector<HTMLDivElement>(`#data-editor`)!
  optionEditor = new OptionEditor(editorElement)

  // initialize the presets UI builder
  presetsUiBuilder = new PresetsUiBuilder({
    rootElement: document.querySelector<HTMLDivElement>(`#data-presets`)!,
    optionEditor: optionEditor,
    presetDefs: Presets,
    onPresetApplied: () => applyLayout(false)
  })

  // disable UI during initialization
  setUIDisabled(true)

  // initialize the graph and the defaults
  initializeGraph()

  // configure overview panel
  overviewComponent.graphOverviewRenderer = new DemoStyleOverviewRenderer()

  // after the initial graph is loaded, we continue loading with the algorithms
  initializeLayoutAlgorithms()

  await initializeApplicationFromUrl()

  updateStyleDefaults(graphComponent.graph)
}

/**
 * Enables loading and saving the graph to GraphML.
 */
function enableGraphML(): GraphMLIOHandler {
  const graphMLIOHandler = createConfiguredGraphMLIOHandler()
  graphMLIOHandler.addEventListener('parsed', () => {
    updateModifiedGraphSample()
  })
  return graphMLIOHandler
}

/**
 * Populates the sample combobox depending on the chosen layout algorithm.
 */
function initializeSamples(layoutName: string): void {
  const selectedLayout = LayoutStyles.find(
    (entry) => !isSeparator(entry) && getNormalizedName(entry.layout) === layoutName
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
  const layoutNames = LayoutStyles.map((entry) =>
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
    case 'radial-tree':
      return new RadialTreeLayoutConfig()
    case 'circular':
      return new CircularLayoutConfig()
    case 'components':
      return new ComponentLayoutConfig()
    case 'edge-router':
      return new PolylineEdgeRouterConfig()
    case 'transformations':
      return new LayoutTransformationsConfig()
    case 'hierarchical':
      return new HierarchicalLayoutConfig()
    case 'labeling':
      return new LabelingConfig()
    case 'organic':
      return new OrganicLayoutConfig()
    case 'organic-edge-router':
      return new OrganicEdgeRouterConfig()
    case 'orthogonal':
      return new OrthogonalLayoutConfig()
    case 'series-parallel':
      return new SeriesParallelLayoutConfig()
    case 'partial':
      return new PartialLayoutConfig()
    case 'radial':
      return new RadialLayoutConfig()
    case 'compact-disk':
      return new CompactDiskLayoutConfig()
    case 'parallel-edge-router':
      return new ParallelEdgeRouterConfig()
    case 'tabular':
      return new TabularLayoutConfig()
    case 'tree':
      return new TreeLayoutConfig()
    default:
      return new HierarchicalLayoutConfig()
  }
}

/**
 * Returns the index of the first option with the given value.
 * @param combobox The combobox to search.
 * @param value The value to match.
 * @returns The index of the first option with the given text (ignoring case), or -1 if no
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
  while (combobox.lastChild) {
    combobox.removeChild(combobox.lastChild)
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
 * calculation. This is set to `true` if this method is called directly after
 * loading a new sample graph.
 */
async function applyLayout(clearUndo: boolean): Promise<void> {
  const config = optionEditor.config as LayoutConfigurationType

  if (!config || !configOptionsValid || inLayout) {
    return
  }

  // prevent starting another layout calculation
  inLayout = true
  setUIDisabled(true)

  await config.apply(graphComponent, () => {
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
  const generateEdgeThicknessButton = document.querySelector<HTMLButtonElement>(
    `#generate-edge-thickness-button`
  )!
  const resetEdgeThicknessButton = document.querySelector<HTMLButtonElement>(
    `#reset-edge-thickness-button`
  )!
  const generateEdgeDirectionButton = document.querySelector<HTMLButtonElement>(
    `#generate-edge-direction-button`
  )!
  const resetEdgeDirectionButton = document.querySelector<HTMLButtonElement>(
    `#reset-edge-direction-button`
  )!
  if (layoutName === 'hierarchical') {
    // enable edge-thickness buttons only for Hierarchical Layout
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

    await applyLayout(!customGraphSelected)
  }
}

function updateDescriptionText(config: LayoutConfigurationType): void {
  const layoutDescriptionContainer = document.querySelector<HTMLDivElement>(
    `#layout-description-container`
  )!
  const layoutDescription = document.querySelector<HTMLDivElement>(`#layout-description`)!
  const layoutTitle = document.querySelector<HTMLElement>(`#layout-title`)!

  layoutDescriptionContainer.classList.remove('highlight-description')
  while (layoutDescription.lastChild) {
    layoutDescription.removeChild(layoutDescription.lastChild)
  }
  layoutTitle.innerHTML = ''

  if (config.descriptionText) {
    layoutDescription.innerHTML = config.descriptionText
    layoutTitle.innerHTML = config.title

    // highlight the description once
    setTimeout(() => {
      layoutDescriptionContainer.classList.add('highlight-description')
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
  return name.toLowerCase().replace(/\s/g, '-')
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
  const match = windowLocationHash.match(/#([\w_-]+)/)
  const hash = match && match.length > 1 ? match[1].toLowerCase().replace(/_/g, '-') : ''

  let layout: string = hash
  let sample: string | null = null
  let preset: string | null = null

  // support some specific hashed URLs by parsing specific sample configurations
  if (hash === 'hierarchical-with-subcomponents') {
    layout = 'hierarchical'
    sample = 'hierarchical-with-subcomponents'
    preset = 'hierarchical-with-subcomponents'
  } else if (hash === 'hierarchical-with-buses') {
    layout = 'hierarchical'
    sample = 'hierarchical-with-buses'
    preset = 'hierarchical-with-buses'
  } else if (hash === 'hierarchical-with-curves') {
    layout = 'hierarchical'
    sample = 'hierarchical'
    preset = 'hierarchical-with-curves'
  } else if (hash === 'organic-with-substructures') {
    layout = 'organic'
    sample = 'organic-with-substructures'
    preset = 'organic-with-substructures'
  } else if (hash === 'circular-with-substructures') {
    layout = 'circular'
    sample = 'circular-with-substructures'
    preset = 'circular-with-substructures'
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
    layout = 'hierarchical'
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
    /* URLSearchParams is not supported in IE, fallback to default algorithm and sample */
    await onLayoutChanged()
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
  customGraph = new Graph()
  const copier = new GraphCopier()
  copier.copy(graphComponent.graph, customGraph)
}

/**
 * Loads the temporary stored modified graph into the main {@link GraphComponent}.
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
function updateStyleDefaults(graph: IGraph): void {
  const firstNode = graph.nodes.find((n) => !graph.isGroupNode(n))
  const firstGroupNode = graph.nodes.find(
    (n) => graph.isGroupNode(n) && !(n.style instanceof TableNodeStyle)
  )
  const firstEdge = graph.edges.at(0)
  if (firstNode) {
    graph.nodeDefaults.style = firstNode.style.clone()
  } else {
    graph.nodeDefaults.style = createDemoNodeStyle()
  }
  if (firstGroupNode) {
    graph.groupNodeDefaults.style = firstGroupNode.style.clone()
  } else {
    graph.groupNodeDefaults.style = createDemoGroupStyle({
      foldingEnabled: graph.foldingView !== null
    })
  }
  if (firstEdge) {
    graph.edgeDefaults.style = firstEdge.style.clone()
  } else {
    graph.edgeDefaults.style = createDemoEdgeStyle()
  }
}

/**
 * Handles a selection change in the sample combo box.
 */
async function onSampleChanged(): Promise<void> {
  if (inLayout || inLoadSample) {
    return
  }

  // load the sample
  const key = getSelectedSample()
  await onSampleChangedCore(key)

  const presetsStruct = findPresets(getSelectedAlgorithm(), key)
  presetsUiBuilder.buildUi(presetsStruct, presetsStruct.defaultPreset)

  await applyLayout(true)
}

async function onSampleChangedCore(key: string | null): Promise<void> {
  const graph = graphComponent.graph
  if (key == null || key === 'none') {
    // no specific item - just clear the graph
    graph.clear()
    // and fit the contents
    await graphComponent.fitGraphBounds()
    return
  }
  inLoadSample = true
  setUIDisabled(true)

  if (customGraphSelected) {
    storeModifiedGraph()
  } else if (key === 'modified-graph') {
    loadModifiedGraph()
    await applyLayout(true)
    customGraphSelected = true
    return
  }

  customGraphSelected = false

  const filePath = `resources/${key}.graphml`

  // load the sample graph and start the layout algorithm in the done handler
  const ioh = createConfiguredGraphMLIOHandler(graphComponent)
  await ioh.readFromURL(graph, filePath)

  // update style defaults based on the loaded sample
  updateStyleDefaults(graph)

  graphComponent.zoomTo(graphComponent.zoom, getCenter(graph))
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
  for (const edge of graph.edges) {
    const thickness = Math.random() * 4 + 1
    const style = createDemoEdgeStyle()
    const oldStyle = edge.style
    if (oldStyle instanceof PolylineEdgeStyle) {
      adoptFromOldStyle(oldStyle, style, thickness)
    } else {
      style.stroke = createStroke(style.stroke!, thickness)
    }
    graph.setStyle(edge, style)
  }
  graph.invalidateDisplays()
}

function onResetEdgeThicknesses(graph: IGraph): void {
  for (const edge of graph.edges) {
    const oldStyle = edge.style
    const style = createDemoEdgeStyle()
    if (oldStyle instanceof PolylineEdgeStyle) {
      adoptFromOldStyle(oldStyle, style, style.stroke!.thickness)
    }
    graph.setStyle(edge, style)
  }
  graph.invalidateDisplays()
}

function onGenerateEdgeDirections(graph: IGraph): void {
  for (const edge of graph.edges) {
    const directed = Math.random() >= 0.5
    const style = createDemoEdgeStyle()
    const oldStyle = edge.style
    if (oldStyle instanceof PolylineEdgeStyle) {
      adoptFromOldStyle(oldStyle, style)
    }
    style.targetArrow = directed ? getDefaultArrow(graph) : IArrow.NONE
    graph.setStyle(edge, style)
  }
  graph.invalidateDisplays()
}

function onResetEdgeDirections(graph: IGraph, directed = false): void {
  for (const edge of graph.edges) {
    const oldStyle = edge.style
    const style = createDemoEdgeStyle()
    if (oldStyle instanceof PolylineEdgeStyle) {
      adoptFromOldStyle(oldStyle, style)
    }
    style.targetArrow = directed ? getDefaultArrow(graph) : IArrow.NONE
    graph.setStyle(edge, style)
  }
  graph.invalidateDisplays()
}

function adoptFromOldStyle(
  oldStyle: PolylineEdgeStyle,
  style: PolylineEdgeStyle,
  thickness?: number
): void {
  const oldStroke = oldStyle.stroke
  if (oldStroke !== null) {
    style.stroke = createStroke(oldStroke, thickness ?? oldStroke.thickness)
  }
  style.sourceArrow = oldStyle.sourceArrow
  style.targetArrow = oldStyle.targetArrow
  style.smoothingLength = oldStyle.smoothingLength
}

function createStroke(prototype: Stroke, thickness: number): Stroke {
  return new Stroke({
    fill: prototype.fill ?? 'black',
    thickness: thickness,
    lineCap: prototype.lineCap,
    lineJoin: prototype.lineJoin,
    dashStyle: prototype.dashStyle
  }).freeze()
}

function getDefaultArrow(graph: IGraph): IArrow {
  const defaultStyleArrow = (graph.edgeDefaults.style as PolylineEdgeStyle).targetArrow
  return !(defaultStyleArrow instanceof Arrow && defaultStyleArrow.type === ArrowType.NONE)
    ? defaultStyleArrow
    : createDemoEdgeStyle().targetArrow
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
  graph.edgeDefaults.labels.layoutParameter = model.createParameterFromSource(0)

  registerGraphEditListeners()
}

/**
 * Store a custom graph entry in the samples, if users modify the graph interactively.
 * The demo only tracks structural changes to the graph.
 */
function registerGraphEditListeners(): void {
  const geim = graphComponent.inputMode as GraphEditorInputMode
  geim.addEventListener('node-created', onGraphEdited)
  geim.addEventListener('node-reparented', onGraphEdited)
  geim.addEventListener('deleted-item', onGraphEdited)
  geim.addEventListener('items-duplicated', onGraphEdited)
  geim.addEventListener('items-pasted', onGraphEdited)
  geim.addEventListener('label-added', onGraphEdited)
  geim.editLabelInputMode.addEventListener('label-edited', onGraphEdited)
  geim.createEdgeInputMode.addEventListener('edge-created', onGraphEdited)
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
  customGraph = customGraph || new Graph()
  let customGraphIdx: number = [...sampleComboBox.options].findIndex(
    (entry) => entry.value === 'modified-graph'
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
 * Creates the default input mode for the {@link GraphComponent},
 * a {@link GraphEditorInputMode}.
 * @returns A new {@link GraphEditorInputMode} instance configured for snapping and
 *   orthogonal edge editing
 */
function createEditorMode(): IInputMode {
  const newGraphSnapContext = new GraphSnapContext({
    enabled: false,
    gridSnapType: GridSnapTypes.NONE
  })

  // create default interaction with snapping and orthogonal edge editing
  const mode = new GraphEditorInputMode({
    snapContext: newGraphSnapContext,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext({
      // initially disable the orthogonal edge editing
      enabled: false
    }),
    navigationInputMode: { allowCollapseGroup: false, allowExpandGroup: false }
  })

  // make bend creation more important than moving of selected edges
  // this has the effect that dragging a selected edge (not its bends)
  // will create a new bend instead of moving all bends
  // This is especially nicer in conjunction with orthogonal
  // edge editing because this creates additional bends every time
  // the edge is moved otherwise
  mode.createBendInputMode.priority = mode.moveSelectedItemsInputMode.priority - 1

  // use WebGL rendering for handles if possible, otherwise the handles are rendered using SVG
  if (BrowserDetection.webGL2) {
    mode.handleInputMode.handlesRenderer = new HandlesRenderer(RenderMode.WEBGL)
  }

  // also we add a context menu
  initializeContextMenu(mode)

  return mode
}

function initializeContextMenu(inputMode: GraphInputMode): void {
  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  inputMode.addEventListener('populate-item-context-menu', (evt) => populateContextMenu(evt))
}

/**
 * Populates the context menu based on the item the mouse hovers over
 */
function populateContextMenu(args: PopulateItemContextMenuEventArgs<IModelItem>): void {
  if (args.handled) {
    return
  }

  const menuItems: { label: string; action: () => void }[] = []

  // get the item which is located at the mouse position
  const hits = graphComponent.graphModelManager.hitTester.enumerateHits(
    args.context,
    args.queryLocation
  )

  // check whether a node was it. If it was, we prefer it over edges
  const hit = hits.find((item) => item instanceof INode) || hits.at(0)

  if (!hit) {
    // empty canvas hit: provide 'select all'
    menuItems.push({
      label: 'Select All',
      action: () => {
        graphComponent.graph.nodes.forEach((node) => graphComponent.selection.nodes.add(node))
        graphComponent.graph.edges.forEach((edge) => graphComponent.selection.edges.add(edge))
      }
    })
  }

  const graphSelection = graphComponent.selection
  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  // if a node or an edge is hit: provide 'Select All Nodes' or 'Select All Edges', respectively
  // also: select the hit item
  if (hit instanceof INode) {
    menuItems.push({
      label: 'Select All Nodes',
      action: () => {
        graphComponent.selection.clear()
        graphComponent.graph.nodes.forEach((node) => {
          graphComponent.selection.add(node)
        })
      }
    })
    if (!graphSelection.includes(hit)) {
      graphSelection.clear()
    }
    graphSelection.add(hit)
  } else if (hit instanceof IEdge) {
    menuItems.push({
      label: 'Select All Edges',
      action: () => {
        graphComponent.selection.clear()
        graphComponent.graph.edges.forEach((edge) => {
          graphComponent.selection.add(edge)
        })
      }
    })
    if (!graphSelection.includes(hit)) {
      graphSelection.clear()
    }
    graphSelection.add(hit)
  }
  // if one or more nodes are selected: add options to cut and copy
  if (graphSelection.nodes.size > 0) {
    menuItems.push({
      label: 'Cut',
      action: () => {
        inputMode.cut()
      }
    })
    menuItems.push({
      label: 'Copy',
      action: () => {
        inputMode.copy()
      }
    })
  }
  if (!graphComponent.clipboard.isEmpty) {
    // clipboard is not empty: add option to paste
    menuItems.push({
      label: 'Paste',
      action: () => {
        inputMode.pasteAtLocation(args.queryLocation)
      }
    })
  }

  // finally, if the context menu has at least one entry, set the showMenu flag
  if (menuItems.length > 0) {
    args.contextMenu = menuItems
  }
}

/**
 * Wire up the UI...
 */
function initializeUI(): void {
  // enable graphMLIO I/O
  const graphMLIOHandler = enableGraphML()
  document
    .querySelector<HTMLButtonElement>("button[data-command='OpenInSidebar']")!
    .addEventListener('click', async () => {
      await openGraphML(graphComponent, graphMLIOHandler)
    })
  document
    .querySelector<HTMLInputElement>('#open-file-button')!
    .addEventListener('click', async () => {
      await openGraphML(graphComponent, graphMLIOHandler)
    })
  document.querySelector<HTMLInputElement>('#save-button')!.addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'LayoutStyles.graphml', graphMLIOHandler)
  })
  document.querySelector('#snapping-button')!.addEventListener('click', () => {
    const snappingEnabled = querySelector<HTMLInputElement>('#snapping-button').checked
    const geim = graphComponent.inputMode as GraphEditorInputMode
    geim.snapContext!.enabled = snappingEnabled
  })

  document.querySelector('#orthogonal-editing-button')!.addEventListener('click', () => {
    const geim = graphComponent.inputMode as GraphEditorInputMode
    geim.orthogonalEdgeEditingContext!.enabled = querySelector<HTMLInputElement>(
      '#orthogonal-editing-button'
    ).checked
  })

  document.querySelector('#apply-layout-button')!.addEventListener('click', async () => {
    await applyLayout(false)
  })

  document.querySelector('#layout-select-box')!.addEventListener('change', async () => {
    await onLayoutChanged()
    layoutComboBox.focus()
  })

  document.querySelector('#sample-select-box')!.addEventListener('change', async () => {
    await onSampleChanged()
    sampleComboBox.focus()
  })

  // document.querySelector(selector)!.addEventListener('click', action)

  document.querySelector('#generate-node-labels')!.addEventListener('click', () => {
    onGenerateItemLabels(graphComponent.graph.nodes)
    updateModifiedGraphSample()
  })

  document.querySelector('#generate-edge-labels')!.addEventListener('click', () => {
    onGenerateItemLabels(graphComponent.graph.edges)
    updateModifiedGraphSample()
  })

  document.querySelector('#remove-labels')!.addEventListener('click', () => {
    onRemoveItemLabels(graphComponent.graph)
    updateModifiedGraphSample()
  })

  document.querySelector('#generate-edge-thickness-button')!.addEventListener('click', () => {
    onGenerateEdgeThicknesses(graphComponent.graph)
  })

  document.querySelector('#reset-edge-thickness-button')!.addEventListener('click', () => {
    onResetEdgeThicknesses(graphComponent.graph)
  })

  document.querySelector('#generate-edge-direction-button')!.addEventListener('click', () => {
    onGenerateEdgeDirections(graphComponent.graph)
  })

  document.querySelector('#reset-edge-direction-button')!.addEventListener('click', () => {
    onResetEdgeDirections(graphComponent.graph, true)
  })

  window.addEventListener('hashchange', async () => {
    await onHashChanged()
  })

  // apply layout shortcut with CTRL+Enter
  window.addEventListener('keydown', async (e) => {
    const geim = graphComponent.inputMode as GraphEditorInputMode
    if (
      !geim.editLabelInputMode.textEditorInputMode.editing &&
      e.key === 'Enter' &&
      (e.ctrlKey || e.metaKey)
    ) {
      await applyLayout(false)
      e.preventDefault()
    }
  })
  // also allow 'enter' within the option-editor
  document.querySelector<HTMLDivElement>(`#data-editor`)!.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      await applyLayout(false)
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
  querySelector<HTMLButtonElement>("button[data-command='NEW']").disabled = disabled
  querySelector<HTMLButtonElement>('#open-file-button').disabled = disabled
  querySelector<HTMLButtonElement>('#save-button').disabled = disabled
  sampleComboBox.disabled = disabled
  layoutComboBox.disabled = disabled
  layoutButton.disabled = disabled
  ;(graphComponent.inputMode as GraphEditorInputMode).waiting = disabled
  presetsUiBuilder.setPresetButtonDisabled(disabled)
}

function updateUIState(): void {
  sampleComboBox.disabled = false
  layoutComboBox.disabled = false
  layoutButton.disabled = !(configOptionsValid && !inLayout)
  presetsUiBuilder.setPresetButtonDisabled(false)
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

/**
 * Calculates the center of the accumulated bounds of the given graph's nodes.
 */
function getCenter(graph: IGraph): Point {
  if (graph.nodes.size > 0) {
    let bounds = graph.nodes.first()!.layout.toRect()
    for (const node of graph.nodes) {
      bounds = Rect.add(bounds, node.layout.toRect())
    }
    return bounds.center
  } else {
    return Point.ORIGIN
  }
}

function querySelector<T extends HTMLElement>(selector: string): T {
  return document.querySelector(selector)!
}

run().then(finishLoading)
