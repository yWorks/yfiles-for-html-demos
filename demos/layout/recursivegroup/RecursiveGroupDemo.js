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
  DefaultFolderNodeConverter,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  ICommand,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  License,
  NodeAlignmentPolicy,
  Size
} from 'yfiles'

import { initDemoStyles } from '../../resources/demo-styles.js'
import { createThreeTierLayout, createThreeTierLayoutData } from './ThreeTierLayout.js'
import { createTableLayout, createTableLayoutData } from './TableLayout.js'
import {
  bindAction,
  bindChangeListener,
  bindCommand,
  readGraph,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * The GraphComponent.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * Runs the demo.
 * @param {object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  initializeGraph()
  initializeInputModes()
  registerCommands()

  loadSample()

  showApp(graphComponent)
}

/**
 * Runs a table layout or a three tier layout depending on the selected sample.
 * @returns {Promise}
 */
async function runLayout() {
  setUIDisabled(true)

  const selectedLayout = document.getElementById('select-sample').value.substring(8)
  const fromSketch = document.getElementById('from-sketch').checked

  let layout
  let layoutData
  switch (selectedLayout) {
    case 'Table':
      layout = createTableLayout(fromSketch)
      layoutData = createTableLayoutData()
      break
    case 'Three-Tier':
      layout = createThreeTierLayout(fromSketch)
      layoutData = createThreeTierLayoutData(graphComponent.graph, fromSketch)
      break
    default:
      setUIDisabled(false)
      return
  }
  try {
    graphComponent.fitGraphBounds()
    await graphComponent.morphLayout(layout, '0.5s', layoutData)
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  }
  setUIDisabled(false)
}

/**
 * Initializes folding and default styles for the current graph.
 */
function initializeGraph() {
  const manager = new FoldingManager()
  graphComponent.graph = manager.createFoldingView().graph
  const folderNodeConverter = manager.folderNodeConverter
  folderNodeConverter.copyFirstLabel = true
  folderNodeConverter.folderNodeSize = new Size(80, 60)

  graphComponent.navigationCommandsEnabled = true

  initDemoStyles(graphComponent.graph)
}

/**
 * Initializes the interactive behavior.
 */
function initializeInputModes() {
  const inputMode = new GraphEditorInputMode({
    showHandleItems: GraphItemTypes.NONE
  })
  inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy = NodeAlignmentPolicy.TOP_LEFT
  inputMode.navigationInputMode.addGroupCollapsedListener(runLayout)
  inputMode.navigationInputMode.addGroupExpandedListener(runLayout)
  graphComponent.inputMode = inputMode
}

/**
 * Wires up the GUI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener("select[data-command='SelectSample']", loadSample)

  bindAction("button[data-command='Reset']", loadSample)
  bindAction("button[data-command='Layout']", runLayout)
}

/**
 * Loads the table or three-tire.
 * @returns {Promise}
 */
async function loadSample() {
  const filename = document.getElementById('select-sample').value.substring(8)
  const path = `resources/${filename}.graphml`

  const ioHandler = new GraphMLIOHandler()
  await readGraph(ioHandler, graphComponent.graph, path)
  // adjust default size and style to match the first leaf in the loaded graph to have new nodes match the graph's style
  const graph = graphComponent.graph
  const firstLeaf = graph.groupingSupport
    .getDescendants(null)
    .find(node => !graph.isGroupNode(node))
  if (firstLeaf) {
    graphComponent.graph.nodeDefaults.size = firstLeaf.layout.toSize()
    graphComponent.graph.nodeDefaults.style = firstLeaf.style
  }
  runLayout()
}

/**
 * Enables/disables the buttons in the toolbar and the input mode. This is used for managing the toolbar during
 * layout calculation.
 * @param {boolean} disabled
 */
function setUIDisabled(disabled) {
  document.getElementById('select-sample').disabled = disabled
  document.getElementById('reset').disabled = disabled
  document.getElementById('from-sketch').disabled = disabled
  document.getElementById('layout').disabled = disabled
}

// start the demo
loadJson().then(run)
