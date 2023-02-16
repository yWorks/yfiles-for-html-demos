/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AdjacencyTypes,
  Arrow,
  ComponentArrangementStyles,
  ComponentLayout,
  DefaultLabelStyle,
  FreeEdgeLabelModel,
  GenericLabeling,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphStructureAnalyzer,
  IArrow,
  ICommand,
  IEdge,
  IGraph,
  ILabel,
  ILayoutAlgorithm,
  IModelItem,
  INode,
  LabelingData,
  LabelPlacements,
  License,
  Mapper,
  NodeStyleDecorationInstaller,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutScope,
  OrganicRemoveOverlapsStage,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs,
  PreferredPlacementDescriptor,
  Rect,
  ShapeNodeStyle,
  YNumber
} from 'yfiles'

import { ContextMenu } from '../../utils/ContextMenu'
import { HighlightHoverInputMode } from './HighlightHoverInputMode'
import { CentralityConfig } from './CentralityConfig'
import { CyclesConfig } from './CyclesConfig'
import { PathsConfig } from './PathsConfig'
import { ConnectivityConfig } from './ConnectivityConfig'
import { MinimumSpanningTreeConfig } from './MinimumSpanningTreeConfig'
import { SubstructuresConfig } from './SubstructuresConfig'
import {
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  reportDemoError,
  showApp
} from '../../resources/demo-app'
import type { AlgorithmConfiguration } from './AlgorithmConfiguration'

import { applyDemoTheme } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

// This demo showcases a selection of algorithms to analyse the structure of a graph.

/**
 * Stores all available graph algorithms and maps each name to the corresponding configuration.
 */
const availableAlgorithms = new Map<string, AlgorithmConfiguration>()

/**
 * Stores all available samples graphs and maps each name to the corresponding file name.
 */
const availableSamples = new Map<string, string>()

let currentConfig: AlgorithmConfiguration

/**
 * Specifies whether or not the current selected configuration is valid.
 */
let configOptionsValid = false

/**
 * Specifies whether or not a layout is running.
 */
let inLayout = false

/**
 * Specifies whether or not a sample is being loaded.
 */
let inLoadSample = false

/**
 * Specifies whether or not the edges should be considered as directed.
 */
let directed = false

/**
 * Specifies whether or not the edges have uniform weights.
 */
let useUniformWeights = true

/**
 * Marks the elements that are changed from user actions... like add/remove node, add/remove edge.
 */
let incrementalNodesMapper: Mapper<INode, boolean>

let incrementalElements: Mapper<INode, boolean>

/**
 * Specifies whether or not a new layout should be prevented.
 */
let preventLayout = false

/**
 * The graph component
 */
let graphComponent: GraphComponent

let algorithmComboBox: HTMLSelectElement

let sampleComboBox: HTMLSelectElement

let directionComboBox: HTMLSelectElement

let uniformEdgeWeightsComboBox: HTMLSelectElement

/**
 * Precompiled Regex matcher used to allow only weight labels with positive numbers as text.
 */
const validationPattern = new RegExp('^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$')

/**
 * Main function for running the Graph Analysis demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  init()

  graphComponent.inputMode = createEditorMode()

  configOptionsValid = true
  setUIDisabled(false)

  incrementalNodesMapper = new Mapper<INode, boolean>()
  incrementalNodesMapper.defaultValue = false

  // in order to load the sample graphs we require the styles and graphml
  // we populate the combo box
  if (sampleComboBox !== null) {
    const samples = [
      'Sample: Minimum Spanning Tree',
      'Sample: Connected Components',
      'Sample: Biconnected Components',
      'Sample: Strongly Connected Components',
      'Sample: Reachability',
      'Sample: k-Core Components',
      'Sample: Shortest Paths',
      'Sample: All Paths',
      'Sample: All Chains',
      'Sample: Single Source',
      'Sample: Cycles',
      'Sample: Degree Centrality',
      'Sample: Weight Centrality',
      'Sample: Graph Centrality',
      'Sample: Node Edge Betweeness Centrality',
      'Sample: Closeness Centrality',
      'Sample: Eigenvector Centrality',
      'Sample: PageRank',
      'Sample: Substructures Chains',
      'Sample: Substructures Cycles',
      'Sample: Substructures Stars',
      'Sample: Substructures Trees',
      'Sample: Substructures Cliques'
    ]

    fillComboBox(sampleComboBox, samples)

    availableSamples.set('Sample: Minimum Spanning Tree', 'minimumspanningtree')
    availableSamples.set('Sample: Connected Components', 'connectivity')
    availableSamples.set('Sample: Biconnected Components', 'connectivity')
    availableSamples.set('Sample: Strongly Connected Components', 'connectivity')
    availableSamples.set('Sample: Reachability', 'connectivity')
    availableSamples.set('Sample: k-Core Components', 'kcore')
    availableSamples.set('Sample: Shortest Paths', 'paths')
    availableSamples.set('Sample: All Paths', 'paths')
    availableSamples.set('Sample: All Chains', 'paths')
    availableSamples.set('Sample: Single Source', 'paths')
    availableSamples.set('Sample: Cycles', 'cycles')
    availableSamples.set('Sample: Degree Centrality', 'centrality')
    availableSamples.set('Sample: Weight Centrality', 'centrality')
    availableSamples.set('Sample: Graph Centrality', 'centrality')
    availableSamples.set('Sample: Node Edge Betweeness Centrality', 'centrality')
    availableSamples.set('Sample: Closeness Centrality', 'centrality')
    availableSamples.set('Sample: Eigenvector Centrality', 'centrality')
    availableSamples.set('Sample: PageRank', 'centrality')
    availableSamples.set('Sample: Substructures Chains', 'substructures')
    availableSamples.set('Sample: Substructures Cycles', 'substructures')
    availableSamples.set('Sample: Substructures Stars', 'substructures')
    availableSamples.set('Sample: Substructures Trees', 'substructures')
    availableSamples.set('Sample: Substructures Cliques', 'subcliques')
  }

  if (directionComboBox !== null) {
    fillComboBox(directionComboBox, ['Undirected', 'Directed'])
    directionComboBox.disabled = true
  }

  if (uniformEdgeWeightsComboBox !== null) {
    fillComboBox(uniformEdgeWeightsComboBox, ['Uniform Edge Weights', 'Non-uniform Edge Weights'])
    uniformEdgeWeightsComboBox.disabled = true
  }

  // initialize the graph and the defaults
  initializeGraph()

  updateGraphInformation()

  preventLayout = true
  await initializeAlgorithms()

  registerCommands()

  await onSampleChanged()

  await runLayout(false, true, true)

  showApp(graphComponent)
}

/**
 * Initializes the HTML GUI elements using the corresponding div value.
 */
function init(): void {
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  algorithmComboBox = document.getElementById('algorithm-select-box') as HTMLSelectElement
  addNavigationButtons(algorithmComboBox)
  sampleComboBox = document.getElementById('sampleComboBox') as HTMLSelectElement
  addNavigationButtons(sampleComboBox)
  directionComboBox = document.getElementById('directionComboBox') as HTMLSelectElement
  uniformEdgeWeightsComboBox = document.getElementById(
    'uniformEdgeWeightsComboBox'
  ) as HTMLSelectElement
}

/**
 * Initializes the graph instance and set default styles.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph

  // Enable undo support.
  graph.undoEngineEnabled = true

  // set some nice defaults
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'lightgray',
    stroke: '3px darkgray'
  })

  const selectionNodeStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    stroke: '5px gray',
    fill: null
  })

  const selectionInstaller = new NodeStyleDecorationInstaller({
    nodeStyle: selectionNodeStyle
  })

  const focusIndicatorNodeStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    stroke: '3px dashed lightgray',
    fill: null
  })

  const focusIndicatorInstaller = new NodeStyleDecorationInstaller({
    nodeStyle: focusIndicatorNodeStyle
  })

  const decorator = graphComponent.graph.decorator
  decorator.nodeDecorator.selectionDecorator.setImplementation(selectionInstaller)
  decorator.nodeDecorator.focusIndicatorDecorator.setImplementation(focusIndicatorInstaller)

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '3px darkgray'
  })

  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    font: '10px Tahoma',
    textFill: 'gray'
  })
}

/**
 * Loads all layout modules and populates the layout combo box.
 */
function initializeAlgorithms() {
  if (algorithmComboBox === null) {
    return Promise.resolve()
  }

  const algorithmNames = [
    'Algorithm: Minimum Spanning Tree',
    'Algorithm: Connected Components',
    'Algorithm: Biconnected Components',
    'Algorithm: Strongly Connected Components',
    'Algorithm: Reachability',
    'Algorithm: k-Core Components',
    'Algorithm: Shortest Paths',
    'Algorithm: All Paths',
    'Algorithm: All Chains',
    'Algorithm: Single Source',
    'Algorithm: Cycles',
    'Algorithm: Degree Centrality',
    'Algorithm: Weight Centrality',
    'Algorithm: Graph Centrality',
    'Algorithm: Node Edge Betweeness Centrality',
    'Algorithm: Closeness Centrality',
    'Algorithm: Eigenvector Centrality',
    'Algorithm: PageRank',
    'Algorithm: Substructures Chains',
    'Algorithm: Substructures Cycles',
    'Algorithm: Substructures Stars',
    'Algorithm: Substructures Trees',
    'Algorithm: Substructures Cliques'
  ]

  fillComboBox(algorithmComboBox, algorithmNames)

  availableAlgorithms.set('Algorithm: Minimum Spanning Tree', new MinimumSpanningTreeConfig())
  availableAlgorithms.set(
    'Algorithm: Connected Components',
    new ConnectivityConfig(ConnectivityConfig.CONNECTED_COMPONENTS)
  )
  availableAlgorithms.set(
    'Algorithm: Biconnected Components',
    new ConnectivityConfig(ConnectivityConfig.BICONNECTED_COMPONENTS)
  )
  availableAlgorithms.set(
    'Algorithm: Strongly Connected Components',
    new ConnectivityConfig(ConnectivityConfig.STRONGLY_CONNECTED_COMPONENTS)
  )
  availableAlgorithms.set(
    'Algorithm: Reachability',
    new ConnectivityConfig(ConnectivityConfig.REACHABILITY)
  )
  availableAlgorithms.set(
    'Algorithm: k-Core Components',
    new ConnectivityConfig(ConnectivityConfig.K_CORE_COMPONENTS)
  )

  availableAlgorithms.set(
    'Algorithm: Shortest Paths',
    new PathsConfig(PathsConfig.ALGORITHM_TYPE_SHORTEST_PATHS)
  )
  availableAlgorithms.set(
    'Algorithm: All Paths',
    new PathsConfig(PathsConfig.ALGORITHM_TYPE_ALL_PATHS)
  )
  availableAlgorithms.set(
    'Algorithm: All Chains',
    new PathsConfig(PathsConfig.ALGORITHM_TYPE_ALL_CHAINS)
  )
  availableAlgorithms.set(
    'Algorithm: Single Source',
    new PathsConfig(PathsConfig.ALGORITHM_TYPE_SINGLE_SOURCE)
  )

  availableAlgorithms.set('Algorithm: Cycles', new CyclesConfig())
  availableAlgorithms.set(
    'Algorithm: Degree Centrality',
    new CentralityConfig(CentralityConfig.DEGREE_CENTRALITY)
  )
  availableAlgorithms.set(
    'Algorithm: Weight Centrality',
    new CentralityConfig(CentralityConfig.WEIGHT_CENTRALITY)
  )
  availableAlgorithms.set(
    'Algorithm: Graph Centrality',
    new CentralityConfig(CentralityConfig.GRAPH_CENTRALITY)
  )
  availableAlgorithms.set(
    'Algorithm: Node Edge Betweeness Centrality',
    new CentralityConfig(CentralityConfig.NODE_EDGE_BETWEENESS_CENTRALITY)
  )
  availableAlgorithms.set(
    'Algorithm: Closeness Centrality',
    new CentralityConfig(CentralityConfig.CLOSENESS_CENTRALITY)
  )
  availableAlgorithms.set(
    'Algorithm: Eigenvector Centrality',
    new CentralityConfig(CentralityConfig.EIGENVECTOR_CENTRALITY)
  )
  availableAlgorithms.set(
    'Algorithm: PageRank',
    new CentralityConfig(CentralityConfig.PAGERANK_CENTRALITY)
  )

  availableAlgorithms.set(
    'Algorithm: Substructures Chains',
    new SubstructuresConfig(SubstructuresConfig.CHAINS_SUBSTRUCTURES)
  )
  availableAlgorithms.set(
    'Algorithm: Substructures Cliques',
    new SubstructuresConfig(SubstructuresConfig.CLIQUES_SUBSTRUCTURES)
  )
  availableAlgorithms.set(
    'Algorithm: Substructures Cycles',
    new SubstructuresConfig(SubstructuresConfig.CYCLES_SUBSTRUCTURES)
  )
  availableAlgorithms.set(
    'Algorithm: Substructures Stars',
    new SubstructuresConfig(SubstructuresConfig.STARS_SUBSTRUCTURES)
  )
  availableAlgorithms.set(
    'Algorithm: Substructures Trees',
    new SubstructuresConfig(SubstructuresConfig.TREES_SUBSTRUCTURES)
  )

  currentConfig = new MinimumSpanningTreeConfig()
  preventLayout = true
  return onAlgorithmChanged()
}

/**
 * Creates the default input mode for the graph component, a {@link GraphEditorInputMode}.
 * @returns a new {@link GraphEditorInputMode} instance and configures snapping and orthogonal edge editing
 */
function createEditorMode(): GraphEditorInputMode {
  incrementalElements = new Mapper<INode, boolean>()
  incrementalElements.defaultValue = false

  // configure interaction
  const inputMode = new GraphEditorInputMode({
    showHandleItems:
      GraphItemTypes.BEND | GraphItemTypes.EDGE | GraphItemTypes.LABEL | GraphItemTypes.PORT,
    itemHoverInputMode: new HighlightHoverInputMode()
  })

  // deletion
  inputMode.addDeletingSelectionListener((sender, eventArgs) => {
    currentConfig.edgeRemoved = true
    const selection = eventArgs.selection
    selection.forEach(item => {
      if (item instanceof INode) {
        graphComponent.graph.edgesAt(item, AdjacencyTypes.ALL).forEach(edge => {
          const oppositeNode = edge.opposite(item) as INode
          if (!selection.isSelected(oppositeNode)) {
            incrementalNodesMapper.set(oppositeNode, true)
          }
        })
      } else if (item instanceof IEdge) {
        if (!selection.isSelected(item.sourceNode!)) {
          incrementalNodesMapper.set(item.sourceNode, true)
          incrementalElements.set(item.sourceNode, true)
        }
        if (!selection.isSelected(item.targetNode!)) {
          incrementalNodesMapper.set(item.targetNode, true)
          incrementalElements.set(item.targetNode, true)
        }
      }
    })

    currentConfig.incrementalElements = incrementalElements
  })

  inputMode.addDeletedSelectionListener(() => {
    updateGraphInformation()
    runLayout(true, false, true).catch(reportDemoError)
  })

  // edge creation
  inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
    updateGraphInformation()
    const edge = args.item
    incrementalNodesMapper.set(edge.sourceNode, true)
    incrementalNodesMapper.set(edge.targetNode, true)

    incrementalElements.set(edge.sourceNode, true)
    incrementalElements.set(edge.targetNode, true)

    currentConfig.incrementalElements = incrementalElements

    runLayout(true, false, true).catch(reportDemoError)
  })

  inputMode.addNodeCreatedListener((sender, args) => {
    updateGraphInformation()

    incrementalElements.set(args.item, true)

    currentConfig.incrementalElements = incrementalElements

    applyAlgorithm()
  })

  inputMode.moveInputMode.addDragFinishedListener((sender, _) => {
    const affectedNodes = sender.affectedItems.filter(item => item instanceof INode)
    if (affectedNodes.size < graphComponent.graph.nodes.size) {
      runLayout(true, false, true).catch(reportDemoError)
    }
  })

  inputMode.addLabelTextChangedListener(() => applyAlgorithm())

  inputMode.addValidateLabelTextListener((sender, args) => {
    // labels must contain only positive numbers
    args.cancel = !validationPattern.test(args.newText)
  })

  // also we add a context menu
  initializeContextMenu(inputMode)
  return inputMode
}

/**
 * Initializes the context menu.
 *
 * @param inputMode The input mode.
 */
function initializeContextMenu(inputMode: GraphEditorInputMode): void {
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
 * Populates the context menu based on the item the mouse hovers over.
 *
 * @param contextMenu the context menu object
 * @param args the mouse hovered item
 */
function populateContextMenu(
  contextMenu: ContextMenu,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  // get the item which is located at the mouse position
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation).toArray()

  // use the first hit node
  const item: IModelItem | undefined = hits.find(hit => hit instanceof INode)

  contextMenu.clearItems()

  const config = currentConfig
  if (!config || !configOptionsValid || inLayout) {
    return
  }

  if (item) {
    config.populateContextMenu(contextMenu, item as INode, graphComponent)
  }

  // finally, if the context menu has at least one entry, set the showMenu flag
  if (contextMenu.element.childElementCount > 0) {
    args.showMenu = true
  }
}

/**
 * Wires the GUI elements with the corresponding commands.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent, null)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent, null)

  bindAction("button[data-command='PreviousFile']", () => {
    if (sampleComboBox.selectedIndex > 0) {
      sampleComboBox.selectedIndex--
    }
    onSampleChanged().catch(reportDemoError)
  })

  bindAction("button[data-command='NextFile']", () => {
    if (sampleComboBox.selectedIndex < sampleComboBox.options.length - 1) {
      sampleComboBox.selectedIndex++
    }
    onSampleChanged().catch(reportDemoError)
  })

  bindChangeListener("select[data-command='AlgorithmSelectionChanged']", () => {
    onAlgorithmChanged().catch(reportDemoError)
  })

  bindChangeListener("select[data-command='SampleSelectionChanged']", () => {
    onSampleChanged().catch(reportDemoError)
  })

  bindAction("button[data-command='Layout']", () => {
    runLayout(false, false, false).catch(reportDemoError)
  })

  bindChangeListener("select[data-command='SetDirection']", () => {
    onDirectedComboBoxSelectedIndexChanged()
  })

  bindChangeListener("select[data-command='SetUniformEdgeWeights']", () => {
    onUniformEdgeWeightsComboBoxSelectedIndexChanged()
  })

  bindAction("button[data-command='GenerateEdgeLabels']", () => {
    onGenerateEdgeLabels()
  })

  bindAction("button[data-command='RemoveEdgeLabels']", () => {
    deleteEdgeLabels()
    runLayout(true, false, true).catch(reportDemoError)
  })
}

/**
 * Applies the algorithm.
 */
function applyAlgorithm(): void {
  if (!currentConfig || !configOptionsValid) {
    return
  }

  currentConfig.directed = directed
  currentConfig.useUniformWeights = useUniformWeights

  // apply the algorithm
  currentConfig.apply(graphComponent)
}

/**
 * Run the layout to the given graph.
 *
 * @param incremental true if the layout should run in incremental mode, false otherwise
 * @param clearUndo true if the undo engine should be cleared, false otherwise
 * @param runAlgorithm true if the algorithm should be applied, false otherwise
 */
async function runLayout(
  incremental: boolean,
  clearUndo: boolean,
  runAlgorithm: boolean
): Promise<void> {
  const organicLayout: OrganicLayout = new OrganicLayout()
  organicLayout.deterministic = true
  organicLayout.considerNodeSizes = true
  ;(organicLayout.componentLayout as ComponentLayout).style =
    ComponentArrangementStyles.NONE | ComponentArrangementStyles.MODIFIER_NO_OVERLAP
  organicLayout.scope = incremental ? OrganicLayoutScope.MAINLY_SUBSET : OrganicLayoutScope.ALL
  organicLayout.labelingEnabled = false
  let layout: ILayoutAlgorithm = organicLayout

  const organicLayoutData = new OrganicLayoutData({
    preferredEdgeLengths: 100,
    minimumNodeDistances: 10,
    affectedNodes: incrementalNodesMapper
  })

  if (
    algorithmComboBox.selectedIndex >= 0 &&
    (algorithmComboBox[algorithmComboBox.selectedIndex] as HTMLOptionElement).value.endsWith(
      'Centrality'
    )
  ) {
    // since centrality changes the node sizes, node overlaps need to be removed
    layout = (currentConfig as CentralityConfig).getCentralityStage(organicLayout, directed)
    // changes the node sizes before resolving node overlaps
    layout = new OrganicRemoveOverlapsStage(layout)
  }

  const graph = graphComponent.graph
  graph.mapperRegistry.createDelegateMapper(
    IEdge.$class,
    YNumber.$class,
    'EDGE_WEIGHTS',
    getEdgeWeight
  )

  inLayout = true
  setUIDisabled(true)
  try {
    await graphComponent.morphLayout(layout, '0.5s', organicLayoutData)

    graph.mapperRegistry.removeMapper('EDGE_WEIGHTS')

    // apply graph algorithms after layout
    if (runAlgorithm) {
      applyAlgorithm()
    }

    const genericLabeling = new GenericLabeling()
    genericLabeling.placeEdgeLabels = true
    genericLabeling.placeNodeLabels = false
    genericLabeling.deterministic = true

    const mapper = new Mapper<ILabel, PreferredPlacementDescriptor>()
    graph.labels.forEach(label => {
      const preferredPlacementDescriptor = new PreferredPlacementDescriptor()
      if (label.owner instanceof IEdge) {
        if (label.tag === 'centrality') {
          preferredPlacementDescriptor.sideOfEdge = LabelPlacements.ON_EDGE
        } else {
          preferredPlacementDescriptor.sideOfEdge =
            LabelPlacements.RIGHT_OF_EDGE | LabelPlacements.LEFT_OF_EDGE
          preferredPlacementDescriptor.distanceToEdge = 5
        }
        preferredPlacementDescriptor.freeze()
        mapper.set(label, preferredPlacementDescriptor)
      }
    })
    const labelingData = new LabelingData()
    labelingData.edgeLabelPreferredPlacement.mapper = mapper

    await graphComponent.morphLayout(genericLabeling, '0.2s', labelingData)

    if (clearUndo && graph.undoEngine) {
      graph.undoEngine.clear()
    }
    incrementalNodesMapper.clear()
  } catch (error) {
    reportDemoError(error)
  } finally {
    releaseLocks()
    setUIDisabled(false)
    updateUIState()
  }
}

/**
 * Handles a selection change in the sample combo box.
 */
async function onSampleChanged(): Promise<void> {
  if (inLayout || inLoadSample) {
    return
  }
  const sampleSelectedIndex = sampleComboBox.selectedIndex

  directed = algorithmSupportsDirectedEdges() && directionComboBox.selectedIndex === 1

  const key = sampleComboBox.options[sampleSelectedIndex].value
  const graph = graphComponent.graph
  if (!key || key === 'None') {
    // no specific item - just clear the graph
    graph.clear()
    // and fit the content
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    return
  }
  inLoadSample = true
  setUIDisabled(true)
  if (key === 'Sample: Minimum Spanning Tree') {
    createSampleGraph(graph)
    await applyAlgorithmForKey(0)
  } else {
    // derive the file name from the key
    let fileName = `resources/${
      availableSamples !== null && availableSamples.size > 0
        ? availableSamples.get(key)
        : 'minimumspanningtree'
    }`
    fileName = fileName.replace('-', '')
    fileName = `${fileName.replace(/\s+/g, '')}.graphml`
    try {
      // load the sample graph and start the layout algorithm in the done handler
      const graphMLIOHandler = new GraphMLIOHandler()
      await graphMLIOHandler.readFromURL(graph, fileName)

      await applyAlgorithmForKey(sampleSelectedIndex)
    } catch (error) {
      if (graph.nodes.size === 0 && window.location.protocol.toLowerCase().indexOf('file') >= 0) {
        alert(
          'Unable to open the sample graph. A default graph will be loaded instead. Perhaps your browser does not ' +
            'allow handling cross domain HTTP requests. Please see the demo readme for details.'
        )
        // the sample graph cannot be loaded, so we run the default graph
        createSampleGraph(graph)
        await applyAlgorithmForKey(sampleSelectedIndex)
        return
      }
      reportDemoError(error)
    } finally {
      setUIDisabled(false)
      updateUIState()
    }
  }
}

/**
 * Applies the algorithm to the selected file and runs the layout.
 */
async function applyAlgorithmForKey(sampleSelectedIndex: number): Promise<void> {
  resetStyles()

  if (
    currentConfig &&
    currentConfig.incrementalElements !== null &&
    currentConfig.incrementalElements.entries.size > 0
  ) {
    incrementalElements.clear()
    currentConfig.incrementalElements = incrementalElements
    currentConfig.edgeRemoved = false
  }

  // run the layout if the layout combo box is already correct
  const algorithmSelectedIndex = algorithmComboBox.selectedIndex
  if (algorithmSelectedIndex !== sampleSelectedIndex) {
    preventLayout = true
    // otherwise, change the selection and indirectly trigger the layout
    algorithmComboBox.selectedIndex = sampleSelectedIndex // changing the algorithm will trigger a layout run
    await onAlgorithmChanged()
  } else {
    updateGraphInformation()
  }

  preventLayout = false
  await runLayout(false, true, true)
}

/**
 * Handles a selection change in the algorithm combo box.
 */
async function onAlgorithmChanged(): Promise<void> {
  if (algorithmComboBox === null) {
    return
  }
  const selectedIndex = algorithmComboBox.selectedIndex
  if (selectedIndex >= 0 && selectedIndex < algorithmComboBox.options.length) {
    const key = algorithmComboBox.options[selectedIndex].value
    if (key !== null && availableAlgorithms.has(key)) {
      currentConfig = availableAlgorithms.get(key)!
    }
  }

  updateDirectionCombobox()

  directed = algorithmSupportsDirectedEdges() && directionComboBox.selectedIndex === 1

  resetStyles()
  updateGraphInformation()
  updateDescriptionText()

  if (!preventLayout) {
    await runLayout(false, false, true)
  }
  preventLayout = false
}

/**
 * Sets the value of the direction combobox for algorithms,
 * that only use specific value
 */
function updateDirectionCombobox(): void {
  if (algorithmNeedsDirectedEdges()) {
    directionComboBox.selectedIndex = 1
  }

  if (!algorithmSupportsDirectedEdges()) {
    directionComboBox.selectedIndex = 0
  }
}

/**
 * Handles a change on the DirectedComboBox.
 */
function onDirectedComboBoxSelectedIndexChanged(): void {
  if (!directionComboBox.disabled) {
    directed = directionComboBox.selectedIndex === 1
    runLayout(true, false, true).catch(reportDemoError)
  }
}

/**
 * Handles a change on the UniformEdgeWeightsComboBox.
 */
function onUniformEdgeWeightsComboBoxSelectedIndexChanged(): void {
  if (!uniformEdgeWeightsComboBox.disabled) {
    useUniformWeights = uniformEdgeWeightsComboBox.selectedIndex === 0
    onGenerateEdgeLabels()
  }
}

/**
 * Updates the table that holds information about the graph.
 */
function updateGraphInformation(): void {
  // clear table
  const oldTable = window.document.getElementById('graph-information')!
  const rows = oldTable.getElementsByTagName('TR')
  const rowCount = rows.length
  for (let i: number = rowCount - 1; i >= 0; i--) {
    oldTable.removeChild(rows[i])
  }

  // fill table with updated information
  const table = window.document.getElementById('graph-information')!
  const graph = graphComponent.graph

  const captions = [
    'Number of Nodes',
    'Number of Edges',
    'Acyclic',
    'Bipartite',
    'Connected',
    'Biconnected',
    'Strongly Connected',
    'Planar',
    'Tree',
    'Self-Loops',
    'Multiple Edges'
  ]

  captions.forEach(caption => {
    const row = document.createElement('TR')
    row.setAttribute('class', 'tr')
    table.appendChild(row)

    const column1 = document.createElement('TD')
    column1.setAttribute('class', 'td')
    const graphInformation = getGraphInformation(graph, caption)
    if (graphInformation.booleanValue) {
      const a = document.createElement('a')
      // boolean information is presented green (true) or grey (false)
      a.setAttribute(
        'style',
        graphInformation.value
          ? 'color:green; font-weight:bold; font-size:12px'
          : 'color:grey; text-decoration:line-through; font-size:12px'
      )
      const image = document.createElement('img')
      image.setAttribute('src', 'resources/wiki-16.svg')
      image.setAttribute('alt', 'definition')
      image.setAttribute('style', 'width:10px; height:10px; border:0; text-decoration:none')
      a.appendChild(document.createTextNode(`${caption}\t`))
      a.appendChild(image)
      if (graphInformation.url) {
        a.href = graphInformation.url
      }
      a.target = '_blank'
      const sup = document.createElement('sup')
      sup.appendChild(a)
      column1.appendChild(sup)
    } else {
      column1.setAttribute('style', 'font-weight:bold')
      column1.appendChild(document.createTextNode(caption))
    }

    const column2 = document.createElement('TD')
    column2.setAttribute('style', 'font-weight:bold; text-align:right; width=100%')
    column2.setAttribute('class', 'td')
    if (!graphInformation.booleanValue) {
      // only number-values are shown in a second column
      column2.appendChild(document.createTextNode(graphInformation.value))
    }

    row.appendChild(column1)
    row.appendChild(column2)
  })
}

/**
 * Updates the description text based on the selected algorithm.
 */
function updateDescriptionText(): void {
  // clear table
  const oldText = window.document.getElementById('algorithm-description')!
  for (let i: number = oldText.childElementCount - 1; i >= 0; i--) {
    oldText.removeChild(oldText.lastElementChild!)
  }

  if (currentConfig) {
    oldText.innerHTML = currentConfig.descriptionText
  }
}

/**
 * Returns the graph information according to the given type.
 *
 * @param graph the given graph
 * @param type the algorithm type
 */
function getGraphInformation(
  graph: IGraph,
  type: string
): { booleanValue: boolean; value: any; url?: string } {
  const graphAnalyzer = new GraphStructureAnalyzer(graph)
  switch (type) {
    case 'Number of Nodes':
      return {
        booleanValue: false,
        value: graph.nodes.size
      }
    case 'Number of Edges':
      return {
        booleanValue: false,
        value: graph.edges.size
      }
    case 'Acyclic':
      return {
        booleanValue: true,
        value: graphAnalyzer.isAcyclic(false),
        url: 'https://en.wikipedia.org/wiki/Cycle_(graph_theory)'
      }
    case 'Bipartite':
      return {
        booleanValue: true,
        value: graphAnalyzer.isBipartite(),
        url: 'https://en.wikipedia.org/wiki/Bipartite_graph'
      }
    case 'Connected':
      return {
        booleanValue: true,
        value: graphAnalyzer.isConnected(),
        url: 'https://en.wikipedia.org/wiki/Connectivity_(graph_theory)'
      }
    case 'Biconnected':
      return {
        booleanValue: true,
        value: graphAnalyzer.isBiconnected(),
        url: 'https://en.wikipedia.org/wiki/Biconnected_graph'
      }
    case 'Strongly Connected':
      return {
        booleanValue: true,
        value: graphAnalyzer.isStronglyConnected(),
        url: 'https://en.wikipedia.org/wiki/Strongly_connected_component'
      }
    case 'Planar':
      return {
        booleanValue: true,
        value: graphAnalyzer.isPlanar(),
        url: 'https://en.wikipedia.org/wiki/Planar_graph'
      }
    case 'Tree':
      return {
        booleanValue: true,
        value: graphAnalyzer.isTree(false),
        url: 'https://en.wikipedia.org/wiki/Tree_(graph_theory)'
      }
    case 'Self-Loops':
      return {
        booleanValue: true,
        value: graphAnalyzer.hasSelfLoops(),
        url: 'https://en.wikipedia.org/wiki/Loop_(graph_theory)'
      }
    case 'Multiple Edges':
      return {
        booleanValue: true,
        value: graphAnalyzer.hasMultipleEdges(false),
        url: 'https://en.wikipedia.org/wiki/Multiple_edges'
      }
    default:
      return {
        booleanValue: false,
        value: graph.nodes.size
      }
  }
}

/**
 * Callback that returns the edge weight for a given edge.
 * This implementation retrieves the weights from the labels or alternatively from the edge length.
 *
 * @param edge the edge.
 * @returns the weight of the edge
 */
function getEdgeWeight(edge: IEdge): number | null {
  if (useUniformWeights) {
    return 1
  }

  // if edge has at least one label...
  if (edge.labels.size > 0) {
    // ..try to return it's value
    const edgeWeight = parseFloat(edge.labels.first().text)
    if (!isNaN(edgeWeight)) {
      return edgeWeight > 0 ? edgeWeight : 0
    }
  }

  return null
}

/**
 * Resets the styles of the nodes and edges to the default style.
 */
function resetStyles(): void {
  const graph = graphComponent.graph
  const defaultNodeStyle = graph.nodeDefaults.style

  const defaultEdgeStyle = graph.edgeDefaults.style as PolylineEdgeStyle
  const arrow = new Arrow({
    fill: 'darkgray',
    stroke: 'darkgray',
    type: 'default'
  })
  // special treatment for the strongly connected components that are always
  // considered directed from the algorithm
  defaultEdgeStyle.targetArrow =
    directed || algorithmComboBox.selectedIndex === 3 ? arrow : IArrow.NONE

  graph.edges.forEach(edge => {
    graph.setStyle(edge, defaultEdgeStyle)
  })

  deleteEdgeLabels()

  deleteNodeLabels()

  graph.nodes.forEach(node => {
    if (graph.contains(node)) {
      // reset size
      const size = graph.nodeDefaults.size
      // reset style
      graph.setStyle(node, defaultNodeStyle)
      graph.setNodeLayout(node, new Rect(node.layout.x, node.layout.y, size.width, size.height))
    }
  })
}

/**
 * Deletes all edge labels.
 */
function deleteEdgeLabels(): void {
  const graph = graphComponent.graph

  graph.edges.forEach(edge => {
    const labels = edge.labels.toArray()
    for (let i = 0; i < labels.length; i++) {
      graph.remove(labels[i])
    }
  })
}

/**
 * Deletes all node labels.
 */
function deleteNodeLabels(): void {
  const graph = graphComponent.graph

  graph.nodes.forEach(node => {
    const labels = node.labels.toArray()
    for (let i = 0; i < labels.length; i++) {
      graph.remove(labels[i])
    }
  })
}

/**
 * Deletes all edge labels with centrality tags.
 */
function deleteCustomEdgeLabels(): void {
  const graph = graphComponent.graph

  graph.edges.forEach(edge => {
    const labels = edge.labels.toArray()
    for (let i = 0; i < labels.length; i++) {
      if (labels[i].tag === 'weight' || labels[i].tag === 'centrality') {
        graph.remove(labels[i])
      }
    }
  })
}

/**
 * Generates and adds random labels of the graph.
 * Existing items will be deleted before adding the new items.
 */
function onGenerateEdgeLabels(): void {
  const graph = graphComponent.graph

  deleteCustomEdgeLabels()

  // remove labels from edges
  graph.edges.forEach(edge => {
    // select a weight from 1 to 20
    const weight = useUniformWeights ? 1 : Math.floor(Math.random() * 20 + 1)
    graph.addLabel({
      owner: edge,
      text: `${weight}`,
      layoutParameter: FreeEdgeLabelModel.INSTANCE.createDefaultParameter(),
      tag: 'weight'
    })
  })

  runLayout(true, false, true).catch(reportDemoError)
}

/**
 * Fills in a combo box with the values of the given array.
 *
 */
function fillComboBox(combobox: HTMLSelectElement, content: string[]): void {
  for (let i = 0; i < content.length; i++) {
    const opt = content[i]
    const el = document.createElement('option')
    el.textContent = opt
    el.value = opt
    combobox.appendChild(el)
  }
}

/**
 * Returns true if the algorithm can take the edge direction into consideration, false otherwise.
 * @returns true if the algorithm can take the edge direction into consideration, false
 *   otherwise
 */
function algorithmSupportsDirectedEdges(): boolean {
  const selectedIndex = algorithmComboBox.selectedIndex
  return (
    selectedIndex > 3 &&
    selectedIndex !== 5 &&
    selectedIndex !== 11 &&
    selectedIndex !== 12 &&
    selectedIndex !== 16 &&
    selectedIndex !== 22
  )
}

/**
 * Returns true if the algorithm needs directed edges to work
 * @returns true if the algorithm needs directed edges
 */
function algorithmNeedsDirectedEdges(): boolean {
  const selectedIndex = algorithmComboBox.selectedIndex
  return selectedIndex === 17
}

/**
 * Returns true if the algorithm can take the edge weights into consideration, false otherwise.
 * @returns true if the algorithm can take the edge weights into consideration, false
 *   otherwise
 */
function algorithmSupportsWeights(): boolean {
  const selectedIndex = algorithmComboBox.selectedIndex
  return (
    selectedIndex !== 1 &&
    selectedIndex !== 2 &&
    selectedIndex !== 3 &&
    selectedIndex !== 4 &&
    selectedIndex !== 5 &&
    selectedIndex !== 7 &&
    selectedIndex !== 8 &&
    selectedIndex !== 10 &&
    selectedIndex !== 11 &&
    selectedIndex !== 16 &&
    selectedIndex < 18
  )
}

/**
 * Releases the locks of the demo.
 */
function releaseLocks(): void {
  inLoadSample = false
  inLayout = false
}

/**
 * Disables the HTML elements of the UI.
 *
 * @param disabled true if the element should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  sampleComboBox.disabled = disabled
  directionComboBox.disabled = disabled
  algorithmComboBox.disabled = disabled
  uniformEdgeWeightsComboBox.disabled = disabled
  ;(document.getElementById('new') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('generateEdgeLabels') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('removeEdgeLabels') as HTMLInputElement).disabled = disabled
  ;(document.getElementById('layoutButton') as HTMLButtonElement).disabled = disabled
  setTimeout(() => {
    // timeout to make sure the mutex can be acquired even if it was triggered by another input mode's event
    ;(graphComponent.inputMode as GraphEditorInputMode).waiting = disabled
  }, 0)
}

/**
 * Updates the UI's state.
 */
function updateUIState(): void {
  sampleComboBox.disabled = false
  algorithmComboBox.disabled = false

  directionComboBox.disabled =
    !configOptionsValid ||
    inLayout ||
    !algorithmSupportsDirectedEdges() ||
    // some algorithms always run with directed edges,
    // so there is no reason to enable a choice
    algorithmNeedsDirectedEdges()

  uniformEdgeWeightsComboBox.disabled =
    !configOptionsValid || inLayout || !algorithmSupportsWeights()
  ;(document.getElementById('new') as HTMLInputElement).disabled = false
  ;(document.getElementById('generateEdgeLabels') as HTMLInputElement).disabled =
    !configOptionsValid || inLayout || uniformEdgeWeightsComboBox.disabled
  ;(document.getElementById('removeEdgeLabels') as HTMLInputElement).disabled =
    !configOptionsValid || inLayout || uniformEdgeWeightsComboBox.disabled
  ;(document.getElementById('layoutButton') as HTMLButtonElement).disabled = false
}

/**
 * Programmatically creates a sample graph so that we do not require GraphML I/O for this demo.
 */
function createSampleGraph(graph: IGraph): void {
  graph.clear()
  const nodes = []
  for (let i = 0; i < 24; i++) {
    nodes[i] = graph.createNode()
  }

  graph.createEdge(nodes[2], nodes[1])
  graph.createEdge(nodes[8], nodes[1])
  graph.createEdge(nodes[2], nodes[8])
  graph.createEdge(nodes[3], nodes[2])
  graph.createEdge(nodes[9], nodes[3])
  graph.createEdge(nodes[9], nodes[4])
  graph.createEdge(nodes[3], nodes[4])
  graph.createEdge(nodes[4], nodes[5])
  graph.createEdge(nodes[10], nodes[4])
  graph.createEdge(nodes[10], nodes[5])
  graph.createEdge(nodes[5], nodes[6])
  graph.createEdge(nodes[6], nodes[7])
  graph.createEdge(nodes[6], nodes[11])
  graph.createEdge(nodes[11], nodes[7])
  graph.createEdge(nodes[8], nodes[12])
  graph.createEdge(nodes[12], nodes[13])
  graph.createEdge(nodes[12], nodes[16])
  graph.createEdge(nodes[16], nodes[13])
  graph.createEdge(nodes[13], nodes[9])
  graph.createEdge(nodes[14], nodes[10])
  graph.createEdge(nodes[11], nodes[15])
  graph.createEdge(nodes[15], nodes[14])
  graph.createEdge(nodes[19], nodes[14])
  graph.createEdge(nodes[19], nodes[15])
  graph.createEdge(nodes[20], nodes[16])
  graph.createEdge(nodes[17], nodes[16])
  graph.createEdge(nodes[20], nodes[17])
  graph.createEdge(nodes[17], nodes[18])
  graph.createEdge(nodes[18], nodes[19])
  graph.createEdge(nodes[18], nodes[21])
  graph.createEdge(nodes[21], nodes[19])
  graph.createEdge(nodes[22], nodes[20])
  graph.createEdge(nodes[21], nodes[23])
  graph.createEdge(nodes[23], nodes[22])
  graph.createEdge(nodes[22], nodes[0])
  graph.createEdge(nodes[23], nodes[0])
}

// noinspection JSIgnoredPromiseFromCall
run()
