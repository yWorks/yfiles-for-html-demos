/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  IGraph,
  License,
  Point,
  StorageLocation
} from 'yfiles'

import OpenFromFileOperation from './OpenFromFileOperation.js'
import OpenFromWebStorageOperation from './OpenFromWebStorageOperation.js'
import SaveToFileOperation from './SaveToFileOperation.js'
import SaveToNewWindowOperation from './SaveToNewWindowOperation.js'
import SaveToWebStorageOperation from './SaveToWebStorageOperation.js'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

const STORAGE_LOCATION = StorageLocation.LOCAL_STORAGE
const STORAGE_URI = 'www.yworks.com/yFilesHTML/GraphML/'

/** @type {OpenFromFileOperation} */
let openFileReaderOperation
/** @type {OpenFromWebStorageOperation} */
let openFromStorageOperation

/** @type {SaveToFileOperation} */
let saveToFileOperation
/** @type {SaveToNewWindowOperation} */
let saveToWindowOperation
/** @type {SaveToWebStorageOperation} */
let saveToStorageOperation

/** @type {GraphMLIOHandler} */
let ioh

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.graph = createConfiguredGraph()

  // configure user interaction
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // create an io handler for reading and writing graphs
  ioh = new GraphMLIOHandler()

  // initialize open and save operations
  initializeOperations()

  // create a sample graph
  createSampleGraph(graphComponent.graph)

  // center the graph in the visible area
  graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.foldingView.manager.masterGraph.undoEngineEnabled = true

  // wire up the UI
  initializeUI(graphComponent)
}

/**
 * Initializes the graph instance and set default styles.
 * @returns {!IGraph}
 */
function createConfiguredGraph() {
  // enable folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  const graph = foldingView.graph

  // initialize default style for nodes and edges
  initDemoStyles(graph, { foldingEnabled: true })

  return graph
}

/**
 * Initializes the open and save operations.
 * @returns {!Promise}
 */
async function initializeOperations() {
  // Initialize OpenFromFileOperation
  openFileReaderOperation = new OpenFromFileOperation()
  if (!openFileReaderOperation.isAvailable()) {
    querySelector('#open-from-file-button').disabled = false
  }

  // Initialize OpenFromWebStorageOperation
  openFromStorageOperation = new OpenFromWebStorageOperation(STORAGE_LOCATION, STORAGE_URI)

  // Initialize SaveToNewWindowOperation
  saveToWindowOperation = new SaveToNewWindowOperation()

  // Initialize SaveToWebStorageOperation
  saveToStorageOperation = new SaveToWebStorageOperation(STORAGE_LOCATION, STORAGE_URI)
  updateLocalStorageButtons()

  // Initialize SaveToFileOperation
  saveToFileOperation = new SaveToFileOperation()
  if (!saveToFileOperation.isAvailable()) {
    querySelector('#save-to-file-button').disabled = true
  }
}

/**
 * Updates the Local storage buttons.
 */
function updateLocalStorageButtons() {
  querySelector('#save-to-storage-button').disabled = !saveToStorageOperation.isAvailable()
  querySelector('#open-from-storage-button').disabled = !openFromStorageOperation.isAvailable()
}

/**
 * Parses the graphml file.
 * @param {!GraphComponent} graphComponent
 * @param {!string} text
 * @returns {!Promise}
 */
async function parseGraphMLText(graphComponent, text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  if (!doc.documentElement || doc.documentElement.nodeName === 'parsererror') {
    alert('Error parsing XML.')
    return
  }
  try {
    // read the graph
    await ioh.readFromDocument(graphComponent.graph, doc)
    graphComponent.fitGraphBounds()
  } catch (err) {
    alert(`Error parsing GraphML: ${err.message}`)
  }
}

/**
 * Creates the sample graph.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  const node1 = graph.createNodeAt(new Point(0, 100))
  const node2 = graph.createNodeAt(new Point(100, 40))
  const node3 = graph.createNodeAt(new Point(100, 100))
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
  graph.createEdge(node1, graph.createNodeAt(new Point(100, 160)))
  graph.createEdge(node2, graph.createNodeAt(new Point(200, 40)))
  graph.createEdge(node3, graph.createNodeAt(new Point(200, 100)))
}

/**
 * Binds actions to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  document.querySelector('#open-from-file-button').addEventListener('click', async () => {
    try {
      const graphMLText = await openFileReaderOperation.open()
      await parseGraphMLText(graphComponent, graphMLText)
    } catch (err) {
      alert(err)
    }
  })
  document.querySelector('#open-from-storage-button').addEventListener('click', async () => {
    try {
      const graphMLText = await openFromStorageOperation.open()
      await parseGraphMLText(graphComponent, graphMLText)
    } catch (err) {
      alert(err)
    }
  })
  document.querySelector('#save-to-file-button').addEventListener('click', async () => {
    try {
      const result = await ioh.write(graphComponent.graph)
      await saveToFileOperation.save(result, 'unnamed.graphml')
    } catch (err) {
      alert(err)
    }
  })
  document.querySelector('#save-to-window-button').addEventListener('click', async () => {
    const result = await ioh.write(graphComponent.graph)
    await saveToWindowOperation.save(result)
  })
  document.querySelector('#save-to-storage-button').addEventListener('click', async () => {
    try {
      const result = await ioh.write(graphComponent.graph)
      await saveToStorageOperation.save(result)
    } catch (err) {
      alert(err)
    }
    updateLocalStorageButtons()
  })
}

/**
 * @template {HTMLElement} T
 * @param {!string} selector
 * @returns {!T}
 */
function querySelector(selector) {
  return document.querySelector(selector)
}

run().then(finishLoading)
