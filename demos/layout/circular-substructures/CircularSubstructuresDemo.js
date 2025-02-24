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
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  License,
  Size
} from '@yfiles/yfiles'
import { createDemoEdgeStyle, createDemoNodeStyle } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, addOptions, finishLoading } from '@yfiles/demo-resources/demo-page'
import { runLayoutCore } from './configure-layout'
import { initializeTypePanel, nodeTypeColors } from './types-popup'
import { multipleStars, singleStar } from './resources/SampleData'
let graphComponent
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  // enable interactive editing
  graphComponent.inputMode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    // disable interactive label creation - labels are simply not in the focus of this demo
    allowAddLabel: false,
    // disable interactive label editing - labels are simply not in the focus of this demo
    allowEditLabel: false
  })
  // set some default styles for the nodes/edges
  initializeStyles(graphComponent.graph)
  // enable undo/redo
  graphComponent.graph.undoEngineEnabled = true
  // initialize the context menu for changing a node's type
  const typePanel = initializeTypePanel(graphComponent)
  typePanel.typeChanged = () => runLayout(true)
  // bind the buttons to their commands
  initializeUI()
}
/**
 * Calculates a new graph layout and optionally applies the new layout in an animated fashion.
 * This method also takes care of disabling the UI during layout calculations.
 */
async function runLayout(animate) {
  const waitInputMode = graphComponent.inputMode.waitInputMode
  if (waitInputMode.waiting) {
    return
  }
  waitInputMode.waiting = true
  disableUI(true)
  try {
    const settings = {
      starSubstructureStyle: getSelectedValue('starStyle'),
      considerNodeTypes: document.querySelector(`#consider-node-types`).checked,
      starSubstructureTypeSeparation: document.querySelector(`#separate-star`).checked
    }
    // the actual layout calculation
    await runLayoutCore(graphComponent, settings, animate)
  } finally {
    waitInputMode.waiting = false
    disableUI(false)
  }
}
/**
 * Configures default visualizations for the given graph.
 */
function initializeStyles(graph) {
  // use first type color for all interactively created nodes
  graph.nodeDefaults.style = createDemoNodeStyle(nodeTypeColors[0])
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.size = new Size(40, 40)
  graph.edgeDefaults.style = createDemoEdgeStyle({ showTargetArrow: false })
}
/**
 * Loads a sample graph for testing the star substructure and node types support of the circular
 * layout algorithm.
 */
async function loadSample(sample) {
  disableUI(true)
  graphComponent.graph.clear()
  // load sample data
  const sampleData = 'singleStar' === sample ? singleStar : multipleStars
  const builder = new GraphBuilder({
    graph: graphComponent.graph,
    nodes: [
      {
        data: sampleData.nodes,
        id: 'id',
        tag: 'tag',
        style: (data) => createDemoNodeStyle(nodeTypeColors[data.tag.type])
      }
    ],
    edges: [{ data: sampleData.edges, sourceId: 'source', targetId: 'target' }]
  })
  builder.buildGraph()
  // update the settings UI to match the sample's default layout settings
  const settings = await loadSampleSettings(`resources/${sample}-settings.json`)
  updateLayoutSettings(settings)
  // calculate an initial arrangement for the new sample
  await runLayout(false)
  // clear the undo engine when a new sample is loaded
  graphComponent.graph.undoEngine.clear()
  disableUI(false)
}
/**
 * Loads sample settings from the file identified by the given sample path.
 * @param samplePath the path to the sample data file.
 */
async function loadSampleSettings(samplePath) {
  const response = await fetch(samplePath)
  return await response.json()
}
/**
 * Updates the settings UI to match the given sample's default layout settings
 * @yjs:keep = starSubstructureStyle,starSubstructureTypeSeparation
 * @param settings the sample settings representing the desired graph structure.
 */
function updateLayoutSettings(settings) {
  updateSelectedIndex('starStyle', settings.starSubstructureStyle)
  updateState('consider-node-types', settings.considerNodeTypes, true)
  updateState('separate-star', settings.starSubstructureTypeSeparation, false)
}
/**
 * Sets the checked state for the HTMLInputElement identified by the given ID.
 * @param id the ID for the HTMLInputElement whose checked state will be set.
 * @param value the new checked state.
 * @param defaultValue the fallback checked state to be used if the given value is undefined.
 */
function updateState(id, value, defaultValue) {
  document.querySelector(`#${id}`).checked = 'undefined' === typeof value ? defaultValue : value
}
/**
 * Sets the selected index for HTMLSelectElement identified by the given ID to the index of the
 * given value. If the given value is undefined or not a value of the HTMLSelectElement's options,
 * selectedIndex will be set to 0.
 * @param id the ID for the HTMLSelectElement whose selectedIndex will be set.
 * @param value the value whose index will be the new selectedIndex.
 */
function updateSelectedIndex(id, value) {
  const select = document.querySelector(`#${id}`)
  const idx = indexOf(select, value)
  select.selectedIndex = idx > -1 ? idx : 0
}
/**
 * Determines the index of the given value in the given HTMLSelectElement's options.
 * @param select the HTMLSelectElement whose options are searched for the given value.
 * @param value the value to search for.
 * @returns the index of the given value or -1 if the given value is undefined or not a value
 * of the given HTMLSelectElement's options.
 */
function indexOf(select, value) {
  if (value != null) {
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
 * @param disabled the disabled state to set.
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
  const sampleSelect = document.querySelector('#sample-combo-box')
  sampleSelect.addEventListener('change', async () => {
    await loadSample(sampleSelect.options[sampleSelect.selectedIndex].value)
  })
  // as a final step, addOptions will fire a change event
  // due to the change listener registered above, this will load the initial sample graph
  addOptions(
    sampleSelect,
    { text: 'Single Star', value: 'singleStar' },
    { text: 'Multiple Stars', value: 'multipleStars' }
  )
  addNavigationButtons(sampleSelect, true, false, 'sidebar-button')
  // changing a value automatically runs a layout
  for (const editor of document.querySelectorAll('.settings-editor')) {
    editor.addEventListener('change', async () => await runLayout(true))
  }
  document
    .querySelector('#apply-layout-button')
    .addEventListener('click', async () => await runLayout(true))
}
/**
 * Determines the currently selected value of the HTMLSelectElement identified by the given ID.
 * @param id the ID for the HTMLSelectElement whose selected value is returned.
 * @returns the selected value of the HTMLSelectElement identified by the given ID.
 */
function getSelectedValue(id) {
  const select = document.querySelector(`#${id}`)
  return select.options[select.selectedIndex].value
}
void run().then(finishLoading)
