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
  License,
  OrganicLayout,
  OrganicLayoutData,
  ParallelSubstructureStyle,
  StarSubstructureStyle
} from 'yfiles'
import NodeTypePanel from '../../utils/NodeTypePanel.js'
import {
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app.js'
import DemoStyles, {
  DemoEdgeStyle,
  DemoNodeStyle,
  DemoSerializationListener,
  initDemoStyles
} from '../../resources/demo-styles.js'
import loadJson from '../../resources/load-json.js'

// We need to load the 'styles-other' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for loading all library styles.
Class.ensure(ImageNodeStyle)

/** @type {GraphComponent} */
let graphComponent

/** @type {number} */
let sampleIndex = 0

/** @type {boolean} */
let layoutRunning = false

/** @type {boolean} */
let alterTypeOrStructure = true

/**
 * Bootstraps the demo.
 * @param {!object} licenseData
 * @returns {!Promise}
 */
async function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

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

  // create an initial sample graph
  await loadSample()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Calculates a new graph layout and applies the new layout in an animated fashion.
 * @returns {!Promise}
 */
async function runLayoutAnimated() {
  await runLayout(true)
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

  //configure some basic settings
  algorithm.deterministic = true
  algorithm.minimumNodeDistance = 20
  algorithm.preferredEdgeLength = 60

  // configure substructure styles (cycles, chains, parallel structures, star)
  algorithm.cycleSubstructureStyle = getCycleStyle()
  algorithm.chainSubstructureStyle = getChainStyle()
  algorithm.parallelSubstructureStyle = getParallelStyle()
  algorithm.starSubstructureStyle = getStarStyle()

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
 * Configures default visualizations for the given graph.
 * @param {!IGraph} graph The demo's graph.
 */
function configureGraph(graph) {
  initDemoStyles(graph)

  const nodeStyle = new DemoNodeStyle()
  // use 'type 0' for all interactively created nodes
  nodeStyle.cssClass = 'type-0'
  graph.nodeDefaults.style = nodeStyle
  graph.nodeDefaults.shareStyleInstance = false

  const edgeStyle = new DemoEdgeStyle()
  edgeStyle.showTargetArrows = false
  graph.edgeDefaults.style = edgeStyle
}

/**
 * Initializes the context menu for changing a node's type.
 * @param {!GraphComponent} graphComponent
 */
function initializeTypePanel(graphComponent) {
  const typePanel = new NodeTypePanel(graphComponent)
  typePanel.nodeTypeChanged = (item, newType) => setNodeType(item, newType)

  typePanel.typeChanged = () => runLayoutAnimated()

  // update the nodes whose types will be changed on selection change events
  graphComponent.selection.addItemSelectionChangedListener(
    () =>
      (typePanel.currentItems = alterTypeOrStructure
        ? graphComponent.selection.selectedNodes.toArray()
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
  const newStyle = node.style.clone()
  newStyle.cssClass = `type-${type}`
  graphComponent.graph.setStyle(node, newStyle)
}

/**
 * Changes the currently displayed sample graph.
 * @param {number} index the index of the sample to show.
 * @returns {!Promise}
 */
async function changeSample(index) {
  sampleIndex = index
  getElementById('sample-combo-box').selectedIndex = sampleIndex
  getElementById('settings-sample-combo-box').selectedIndex = sampleIndex

  await loadSample()
}

/**
 * Loads a sample graph for testing the substructure and node types support of the organic layout
 * algorithm.
 * @returns {!Promise}
 */
async function loadSample() {
  // determine which sample to load
  const sampleComboBox = getElementById('sample-combo-box')
  const sample = sampleComboBox.options[sampleIndex]

  disableUI(true)
  try {
    // load sample data
    const newGraph = new DefaultGraph()
    await updateGraph(newGraph, `resources/${sample.value}.graphml`)

    // update the settings UI to match the sample's default layout settings
    const data = await loadSampleData(`resources/${sample.value}.json`)
    updateLayoutSettings(data)

    // update input mode setting depending on whether we are allowed to change the graph structure
    alterTypeOrStructure = data.settings ? data.settings.alterTypesAndStructure : true
    const inputMode = graphComponent.inputMode
    inputMode.allowCreateNode = alterTypeOrStructure
    inputMode.allowCreateEdge = alterTypeOrStructure
    inputMode.allowDuplicate = alterTypeOrStructure
    inputMode.deletableItems = alterTypeOrStructure ? GraphItemTypes.ALL : GraphItemTypes.NONE

    // enable undo/redo
    newGraph.undoEngineEnabled = true

    // center new sample graph in current view
    graphComponent.graph = newGraph

    // configures default styles for newly created graph elements
    configureGraph(graphComponent.graph)
    await runLayout(false)

    // tell the demo's commands to update their state, i.e.
    // this ensures that the undo/redo toolbar controls get the correct enabled/disabled state
    ICommand.invalidateRequerySuggested()
  } finally {
    disableUI(false)
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
 * Rebuilds the demo's graph from the given sample data.
 * @param {!IGraph} graph The demo's graph.
 * @param {!string} samplePath The path to the sample data representing the desired graph structure.
 * @returns {!Promise}
 */
async function updateGraph(graph, samplePath) {
  const reader = new GraphMLIOHandler()
  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  reader.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  reader.addHandleSerializationListener(DemoSerializationListener)
  await reader.readFromURL(graph, samplePath)
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
    updateState('use-edge-grouping', settings.useEdgeGrouping, false)
    updateState('consider-node-types', settings.considerNodeTypes, true)
    updateState('separate-parallel', settings.parallelSubstructureTypeSeparation, false)
    updateState('separate-star', settings.starSubstructureTypeSeparation, false)
  } else {
    getElementById('cycleStyle').selectedIndex = 0
    getElementById('chainStyle').selectedIndex = 0
    getElementById('starStyle').selectedIndex = 0
    getElementById('parallelStyle').selectedIndex = 0
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
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  const primary = getElementById('sample-combo-box')
  const secondary = getElementById('settings-sample-combo-box')

  const sampleCount = primary.options.length
  primary.addEventListener('change', e => changeSample(e.target.selectedIndex))
  secondary.addEventListener('change', e => changeSample(e.target.selectedIndex))

  bindAction('#previous-sample-button', () =>
    changeSample((sampleCount + sampleIndex - 1) % sampleCount)
  )
  bindAction('#next-sample-button', () =>
    changeSample((sampleCount + sampleIndex + 1) % sampleCount)
  )

  bindChangeListener('#cycleStyle', runLayoutAnimated)
  bindChangeListener('#chainStyle', runLayoutAnimated)
  bindChangeListener('#starStyle', runLayoutAnimated)
  bindChangeListener('#parallelStyle', runLayoutAnimated)
  bindChangeListener('#use-edge-grouping', runLayoutAnimated)
  bindChangeListener('#consider-node-types', runLayoutAnimated)
  bindChangeListener('#separate-parallel', runLayoutAnimated)
  bindChangeListener('#separate-star', runLayoutAnimated)

  bindAction('#layout', runLayoutAnimated)
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

// start tutorial
loadJson().then(checkLicense).then(run)
