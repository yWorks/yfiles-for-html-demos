/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ChainSubstructureStyle,
  Class,
  CycleSubstructureStyle,
  DefaultGraph,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  ICommand,
  IGraph,
  ImageNodeStyle,
  INode,
  INodeInsetsProvider,
  Insets,
  License,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutGroupSubstructureScope,
  OrganicLayoutTreeSubstructureStyle,
  ParallelSubstructureStyle,
  RadialLayout,
  ShapeNodeStyle,
  Size,
  StarSubstructureStyle,
  TreeLayout
} from 'yfiles'
import NodeTypePanel from '../../utils/NodeTypePanel.js'
import {
  addNavigationButtons,
  addOptions,
  bindAction,
  bindCommand,
  showApp
} from '../../resources/demo-app.js'
import {
  applyDemoTheme,
  createDemoEdgeStyle,
  createDemoNodeStyle,
  createDemoShapeNodeStyle,
  initDemoStyles
} from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

// We need to load the 'styles-other' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for loading all library styles.
Class.ensure(ImageNodeStyle)
// For the tree substructures we also need modules 'layout-tree' and 'layout-radial'
Class.ensure(TreeLayout)
Class.ensure(RadialLayout)

/**
 * The color sets for the eight different node types.
 */
const nodeTypeColors = [
  'demo-palette-21',
  'demo-palette-22',
  'demo-palette-23',
  'demo-palette-15',
  'demo-palette-25',
  'demo-palette-11',
  'demo-palette-12',
  'demo-palette-14'
]

/** @type {GraphComponent} */
let graphComponent

/** @type {boolean} */
let layoutRunning = false

/** @type {boolean} */
let allowNodeTypeChange = true

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // enable interactive editing
  graphComponent.inputMode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    // disable interactive label creation - labels are simply not in the focus of this demo
    allowAddLabel: false,
    // disable interactive label editing - labels are simply not in the focus of this demo
    allowEditLabel: false
  })

  // enable undo/redo
  graphComponent.graph.undoEngineEnabled = true

  // initializes the context menu for changing a node's type
  initializeTypePanel(graphComponent)

  // bind the buttons to their commands
  initializeUI()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Calculates a new graph layout and optionally applies the new layout in an animated fashion.
 * This method also takes care of disabling the UI during layout calculations.
 * @param {boolean} animate
 * @returns {!Promise}
 */
async function runLayout(animate) {
  if (layoutRunning) {
    return
  }

  layoutRunning = true
  disableUI(true)

  try {
    // the actual layout calculation
    await runLayoutCore(animate)
  } catch (error) {
    const reporter = window.reportError
    if (typeof reporter === 'function') {
      reporter(error)
    } else {
      throw error
    }
  } finally {
    layoutRunning = false
    disableUI(false)
  }
}

/**
 * Calculates a new graph layout and optionally applies the new layout in an animated fashion.
 * This method creates and configures a new organic layout algorithm for this purpose.
 * @param {boolean} animate
 * @returns {!Promise}
 */
async function runLayoutCore(animate) {
  // configure the organic layout algorithm
  const algorithm = new OrganicLayout()

  const currentSample = getElementById('sample-combo-box').value

  //configure some basic settings
  algorithm.deterministic = true
  algorithm.minimumNodeDistance = currentSample === 'groups' ? 0 : 20
  algorithm.preferredEdgeLength = 60

  // configure substructure styles (cycles, chains, parallel structures, star, tree)
  algorithm.cycleSubstructureStyle = getCycleStyle()
  algorithm.chainSubstructureStyle = getChainStyle()
  algorithm.parallelSubstructureStyle = getParallelStyle()
  algorithm.starSubstructureStyle = getStarStyle()
  algorithm.treeSubstructureStyle = getTreeStyle()
  algorithm.groupSubstructureScope = getGroupSubstructureScope()

  //configure type separation for parallel and star substructures
  const separateParallel = getElementById('separate-parallel')
  algorithm.parallelSubstructureTypeSeparation = separateParallel.checked
  const separateStar = getElementById('separate-star')
  algorithm.starSubstructureTypeSeparation = separateStar.checked

  // configure data-driven features for the organic layout algorithm by using OrganicLayoutData
  const layoutData = new OrganicLayoutData()

  if (getElementById('use-edge-grouping').checked) {
    // if desired, define edge grouping on the organic layout data
    layoutData.sourceGroupIds.constant = 'groupAll'
    layoutData.targetGroupIds.constant = 'groupAll'
  }

  if (getElementById('consider-node-types').checked) {
    // if types should be considered define a delegate on the respective layout data property
    // that queries the type from the node's tag
    layoutData.nodeTypes.delegate = getNodeType
  }

  // runs the layout algorithm and applies the result...
  if (animate) {
    //... with a morph animation
    await graphComponent.morphLayout(algorithm, null, layoutData)
  } else {
    //... without an animation
    graphComponent.graph.applyLayout(algorithm, layoutData)
    graphComponent.fitGraphBounds()
  }
}

/**
 * Gets the type of the given node by querying it from the node's tag.
 * @param {!INode} node
 * @returns {number}
 */
function getNodeType(node) {
  return (node.tag && node.tag.type) || 0
}

/**
 * Determines the desired cycle substructure style for layout calculations from the settings UI.
 * @returns {!CycleSubstructureStyle}
 */
function getCycleStyle() {
  switch (getSelectedValue('cycleStyle')) {
    case 'CIRCULAR':
      return CycleSubstructureStyle.CIRCULAR
    default:
      return CycleSubstructureStyle.NONE
  }
}

/**
 * Determines the desired chain substructure style for layout calculations from the settings UI.
 * @returns {!ChainSubstructureStyle}
 */
function getChainStyle() {
  switch (getSelectedValue('chainStyle')) {
    case 'RECTANGULAR':
      return ChainSubstructureStyle.RECTANGULAR
    case 'STRAIGHT_LINE':
      return ChainSubstructureStyle.STRAIGHT_LINE
    case 'DISK':
      return ChainSubstructureStyle.DISK
    default:
      return ChainSubstructureStyle.NONE
  }
}

/**
 * Determines the desired parallel substructure style for layout calculations from the settings UI.
 */
function getParallelStyle() {
  switch (getSelectedValue('parallelStyle')) {
    case 'RADIAL':
      return ParallelSubstructureStyle.RADIAL
    case 'RECTANGULAR':
      return ParallelSubstructureStyle.RECTANGULAR
    case 'STRAIGHT_LINE':
      return ParallelSubstructureStyle.STRAIGHT_LINE
    default:
      return ParallelSubstructureStyle.NONE
  }
}

/**
 * Determines the desired star substructure style for layout calculations from the settings UI.
 * @returns {!StarSubstructureStyle}
 */
function getStarStyle() {
  switch (getSelectedValue('starStyle')) {
    case 'CIRCULAR':
      return StarSubstructureStyle.CIRCULAR
    case 'RADIAL':
      return StarSubstructureStyle.RADIAL
    case 'SEPARATED_RADIAL':
      return StarSubstructureStyle.SEPARATED_RADIAL
    default:
      return StarSubstructureStyle.NONE
  }
}

/**
 * Determines the desired tree substructure style for layout calculations from the settings UI.
 * @returns {!OrganicLayoutTreeSubstructureStyle}
 */
function getTreeStyle() {
  switch (getSelectedValue('treeStyle')) {
    case 'BALLOON':
      return OrganicLayoutTreeSubstructureStyle.BALLOON
    case 'RADIAL':
      return OrganicLayoutTreeSubstructureStyle.RADIAL
    case 'ORIENTED':
      return OrganicLayoutTreeSubstructureStyle.ORIENTED
    default:
      return OrganicLayoutTreeSubstructureStyle.NONE
  }
}

/**
 * Determines the desired group substructure scope for layout calculations from the settings UI.
 * @returns {!OrganicLayoutGroupSubstructureScope}
 */
function getGroupSubstructureScope() {
  switch (getSelectedValue('groupScope')) {
    case 'ALL':
      return OrganicLayoutGroupSubstructureScope.ALL_GROUPS
    case 'WITHOUT_EDGES':
      return OrganicLayoutGroupSubstructureScope.GROUPS_WITHOUT_EDGES
    case 'WITHOUT_INTER_EDGES':
      return OrganicLayoutGroupSubstructureScope.GROUPS_WITHOUT_INTER_EDGES
    default:
      return OrganicLayoutGroupSubstructureScope.NO_GROUPS
  }
}

/**
 * Configures default visualizations for the given graph.
 * @param {!IGraph} graph The demo's graph.
 */
function configureGraph(graph) {
  initDemoStyles(graph)

  // use first type color for all interactively created nodes
  graph.nodeDefaults.style = createDemoNodeStyle(nodeTypeColors[0])
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.size = new Size(40, 40)
  graph.decorator.nodeDecorator.insetsProviderDecorator.setImplementation(
    node => graph.isGroupNode(node),
    INodeInsetsProvider.create(() => new Insets(40))
  )

  graph.edgeDefaults.style = createDemoEdgeStyle({ showTargetArrow: false })
}

/**
 * Initializes the context menu for changing a node's type.
 * @param {!GraphComponent} graphComponent
 */
function initializeTypePanel(graphComponent) {
  const typePanel = new NodeTypePanel(graphComponent, nodeTypeColors)
  typePanel.nodeTypeChanged = (item, newType) => setNodeType(item, newType)

  typePanel.typeChanged = () => runLayout(true)

  // update the nodes whose types will be changed on selection change events
  graphComponent.selection.addItemSelectionChangedListener(
    () =>
      (typePanel.currentItems = allowNodeTypeChange
        ? graphComponent.selection.selectedNodes
            .filter(n => !graphComponent.graph.isGroupNode(n))
            .toArray()
        : null)
  )
}

/**
 * Sets the type for the given node by updating the node's tag and the according style.
 * This function is invoked when the type of a node is changed via the type panel.
 * @param {!INode} node
 * @param {number} type
 */
function setNodeType(node, type) {
  // set a new tag and style so that this change is easily undo-able
  node.tag = { type: type }
  const graph = graphComponent.graph
  if (node.style instanceof ShapeNodeStyle) {
    graph.setStyle(node, createDemoShapeNodeStyle(node.style.shape, nodeTypeColors[type]))
  } else {
    graph.setStyle(node, createDemoNodeStyle(nodeTypeColors[type]))
  }
}

/**
 * Loads a sample graph for testing the substructure and node types support of the organic layout
 * algorithm.
 * @param {!string} sample
 * @returns {!Promise}
 */
async function loadSample(sample) {
  disableUI(true)
  try {
    const newGraph = new DefaultGraph()
    // configures default styles for newly created graph elements
    configureGraph(newGraph)

    // load sample data
    await new GraphMLIOHandler().readFromURL(newGraph, `resources/${sample}.graphml`)

    // update the settings UI to match the sample's default layout settings
    const data = await loadSampleData(`resources/${sample}.json`)
    updateLayoutSettings(data)

    const { overrideStyles, allowItemCreation, allowItemModification, allowTypeChanges } =
      data.settings

    // enable/disable node type changes depending on the sample
    allowNodeTypeChange = allowTypeChanges

    // if required for the sample, override and set the node styles
    if (overrideStyles) {
      updateNodeStyles(newGraph)
    }

    // update input mode setting depending on whether we are allowed to change the graph structure
    const inputMode = graphComponent.inputMode
    inputMode.allowCreateNode = allowItemCreation
    inputMode.allowCreateEdge = allowItemCreation
    inputMode.allowDuplicate = allowItemCreation
    inputMode.allowClipboardOperations = allowItemCreation
    inputMode.moveInputMode.enabled = allowItemModification
    inputMode.deletableItems = allowItemCreation ? GraphItemTypes.ALL : GraphItemTypes.NONE
    inputMode.showHandleItems = allowItemModification ? GraphItemTypes.ALL : GraphItemTypes.NONE

    if (allowItemCreation) {
      // update the default node style depending on the style of the first node
      const refStyle = newGraph.nodes.first().style
      if (refStyle instanceof ShapeNodeStyle) {
        newGraph.nodeDefaults.style = createDemoShapeNodeStyle(refStyle.shape, nodeTypeColors[0])
      }
    }

    // replace the old graph with the new sample
    graphComponent.graph = newGraph

    // calculate an initial arrangement for the new sample
    await runLayout(false)

    // enable undo/redo
    newGraph.undoEngineEnabled = true

    // tell the demo's commands to update their state, i.e.
    // this ensures that the undo/redo toolbar controls get the correct enabled/disabled state
    ICommand.invalidateRequerySuggested()
  } finally {
    disableUI(false)
  }
}

/**
 * Updates the node styles in the given graph depending on the type of each node.
 * @param {!IGraph} graph the graph to update.
 */
function updateNodeStyles(graph) {
  for (const node of graph.nodes) {
    if (node.tag && node.tag.type > -1) {
      graph.setStyle(node, createDemoNodeStyle(nodeTypeColors[node.tag.type]))
    }
  }
}

/**
 * Loads sample data from the file identified by the given sample path.
 * @param {!string} samplePath the path to the sample data file.
 * @returns {!Promise}
 */
async function loadSampleData(samplePath) {
  const response = await fetch(samplePath)
  return await response.json()
}

/**
 * Updates the settings UI to match the given sample's default layout settings
 * @yjs:keep=cycleSubstructureStyle,chainSubstructureStyle,starSubstructureStyle,parallelSubstructureStyle,parallelSubstructureTypeSeparation,starSubstructureTypeSeparation
 * @param {*} data the sample data representing the desired graph structure.
 */
function updateLayoutSettings(data) {
  const settings = data.settings
  if (settings) {
    updateSelectedIndex('cycleStyle', settings.cycleSubstructureStyle)
    updateSelectedIndex('chainStyle', settings.chainSubstructureStyle)
    updateSelectedIndex('starStyle', settings.starSubstructureStyle)
    updateSelectedIndex('parallelStyle', settings.parallelSubstructureStyle)
    updateSelectedIndex('treeStyle', settings.treeSubstructureStyle)
    updateSelectedIndex('groupScope', settings.groupSubstructures)
    updateState('use-edge-grouping', settings.useEdgeGrouping, false)
    updateState('consider-node-types', settings.considerNodeTypes, true)
    updateState('separate-parallel', settings.parallelSubstructureTypeSeparation, false)
    updateState('separate-star', settings.starSubstructureTypeSeparation, false)
  } else {
    getElementById('cycleStyle').selectedIndex = 0
    getElementById('chainStyle').selectedIndex = 0
    getElementById('starStyle').selectedIndex = 0
    getElementById('parallelStyle').selectedIndex = 0
    getElementById('treeStyle').selectedIndex = 0
    getElementById('groupScope').selectedIndex = 0
    getElementById('use-edge-grouping').checked = false
    getElementById('consider-node-types').checked = true
    getElementById('separate-parallel').checked = false
    getElementById('separate-star').checked = false
  }
}

/**
 * Sets the checked state for the HTMLInputElement identified by the given ID.
 * @param {!string} id the ID for the HTMLInputElement whose checked state will be set.
 * @param value the new checked state.
 * @param {boolean} defaultValue the fallback checked state to be used if the given value is undefined.
 * @param {boolean} [value]
 */
function updateState(id, value, defaultValue) {
  getElementById(id).checked = 'undefined' === typeof value ? defaultValue : value
}

/**
 * Sets the selected index for HTMLSelectElement identified by the given ID to the index of the
 * given value. If the given value is undefined or not a value of the HTMLSelectElement's options,
 * selectedIndex will be set to 0.
 * @param {!string} id the ID for the HTMLSelectElement whose selectedIndex will be set.
 * @param value the value whose index will be the new selectedIndex.
 * @param {!string} [value]
 */
function updateSelectedIndex(id, value) {
  const select = getElementById(id)
  const idx = indexOf(select, value)
  select.selectedIndex = idx > -1 ? idx : 0
}

/**
 * Determines the index of the given value in the given HTMLSelectElement's options.
 * @param {!HTMLSelectElement} select the HTMLSelectElement whose options are searched for the given value.
 * @param value the value to search for.
 * @returns {number} the index of the given value or -1 if the given value is undefined or not a value
 * of the given HTMLSelectElement's options.
 * @param {!string} [value]
 */
function indexOf(select, value) {
  if (value) {
    let idx = 0
    for (const option of select.options) {
      if (option.value === value) {
        return idx
      }
      ++idx
    }
  }
  return -1
}

/**
 * Sets the disabled state for certain UI controls to the given state.
 * @param {boolean} disabled the disabled state to set.
 */
function disableUI(disabled) {
  for (const element of document.querySelectorAll('.toolbar-component')) {
    element.disabled = disabled
  }

  for (const element of document.querySelectorAll('.settings-editor')) {
    element.disabled = disabled
  }
}

/**
 * Binds actions and commands to the demo's UI controls.
 */
function initializeUI() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  const sampleSelect = document.querySelector('#sample-combo-box')
  sampleSelect.addEventListener('change', async () => {
    await loadSample(sampleSelect.options[sampleSelect.selectedIndex].value)
  })
  // as a final step, addOptions will fire a change event
  // due to the change listener registered above, this will load the initial sample graph
  addOptions(
    sampleSelect,
    { text: 'Simple Mixed, Large', value: 'mixed_large' },
    { text: 'Simple Mixed, Small', value: 'mixed_small' },
    { text: 'Simple Parallel', value: 'parallel' },
    { text: 'Simple Star', value: 'star' },
    { text: 'Simple Groups', value: 'groups' },
    { text: 'Computer Network', value: 'computer_network' }
  )
  addNavigationButtons(sampleSelect, true, 'sidebar-button')

  // changing a value automatically runs a layout
  for (const editor of document.querySelectorAll('.settings-editor')) {
    editor.addEventListener('change', async () => await runLayout(true))
  }

  bindAction('#apply-layout-button', async () => await runLayout(true))
}

/**
 * Determines the currently selected value of the HTMLSelectElement identified by the given ID.
 * @param {!string} id the ID for the HTMLSelectElement whose selected value is returned.
 * @returns {!string} the selected value of the HTMLSelectElement identified by the given ID.
 */
function getSelectedValue(id) {
  const select = getElementById(id)
  return select.options[select.selectedIndex].value
}

/**
 * Returns a reference to the first element with the specified ID in the current document.
 * @returns {!T} A reference to the first element with the specified ID in the current document.
 * @template {HTMLElement} T
 * @param {!string} id
 */
function getElementById(id) {
  return document.getElementById(id)
}

// noinspection JSIgnoredPromiseFromCall
run()
