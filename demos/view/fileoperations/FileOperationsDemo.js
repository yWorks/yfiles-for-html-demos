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
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  License,
  Point
} from 'yfiles'

import SaveViaServerOperation from './SaveViaServerOperation.js'
import OpenViaServerOperation from './OpenViaServerOperation.js'
import SaveToFileOperation from './SaveToFileOperation.js'
import SaveToWebStorageOperation from './SaveToWebStorageOperation.js'
import SaveToNewWindowOperation from './SaveToNewWindowOperation.js'
import OpenFromWebStorageOperation from './OpenFromWebStorageOperation.js'
import OpenFromFileOperation from './OpenFromFileOperation.js'
import { bindAction, showApp } from '../../resources/demo-app.js'
import DemoStyles, {
  DemoSerializationListener,
  initDemoStyles
} from '../../resources/demo-styles.js'
import loadJson from '../../resources/load-json.js'

/** @type GraphComponent */
let graphComponent = null

let openFileReaderOperation = null
let openFromStorageOperation = null
let openViaServerOperation = null

let saveToFileOperation = null
let saveToWindowOperation = null
let saveToStorageOperation = null
let saveViaServerOperation = null

/** @type GraphMLIOHandler */
let ioh = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  // enable folding
  const foldingManager = new FoldingManager()
  foldingManager.masterGraph.undoEngineEnabled = true

  const foldingView = foldingManager.createFoldingView()
  foldingView.enqueueNavigationalUndoUnits = true
  graphComponent.graph = foldingView.graph

  // initialize the default style of the nodes and edges
  initDemoStyles(foldingView.graph)

  // initialize the input mode
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.inputMode = inputMode

  // create a GraphMLIOHandler and register the demo styles
  ioh = new GraphMLIOHandler()
  ioh.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  ioh.addHandleSerializationListener(DemoSerializationListener)

  // initialize the open and save operations
  initializeOperations()

  // create the sample graph
  createSampleGraph()

  // wire up the UI
  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes the open and save operations.
 */
async function initializeOperations() {
  // Initialize OpenFromFileOperation
  openFileReaderOperation = new OpenFromFileOperation()
  if (!openFileReaderOperation.isAvailable()) {
    document.querySelector('#openFromFileButton').disabled = false
  }

  // Initialize OpenFromWebStorageOperation
  openFromStorageOperation = new OpenFromWebStorageOperation()

  // Initialize SaveToNewWindowOperation
  saveToWindowOperation = new SaveToNewWindowOperation()

  // Initialize SaveToWebStorageOperation
  saveToStorageOperation = new SaveToWebStorageOperation()
  updateLocalStorageButtons()

  // Initialize SaveToFileOperation
  saveToFileOperation = new SaveToFileOperation()
  if (!saveToFileOperation.isAvailable()) {
    document.querySelector('#saveToFileButton').disabled = true
  }

  // Initialize OpenViaServerOperation
  openViaServerOperation = new OpenViaServerOperation()

  // Initialize SaveViaServerOperation
  saveViaServerOperation = new SaveViaServerOperation()
  try {
    // check server availability (default: disabled)
    const executable = await openViaServerOperation.checkServer()
    document.querySelector('#openViaServerButton').disabled = !executable
    document.querySelector('#saveViaServerButton').disabled = !executable
  } catch (e) {
    alert(e)
  }
}

/**
 * Updates the Local storage buttons.
 */
function updateLocalStorageButtons() {
  document.querySelector('#saveToStorageButton').disabled = !saveToStorageOperation.isAvailable()
  document.querySelector(
    '#openFromStorageButton'
  ).disabled = !openFromStorageOperation.isAvailable()
}

/**
 * Parses the graphml file.
 * @param {string} text
 */
async function parseGraphMLText(text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  if (doc.documentElement === null || doc.documentElement.nodeName === 'parsererror') {
    alert('Error parsing XML.')
    return
  }
  try {
    // read the graph
    await ioh.readFromDocument(graphComponent.graph, doc)
    graphComponent.fitGraphBounds()
  } catch (e) {
    alert(`Error parsing GraphML: ${e.message}`)
  }
}

/**
 * Sets the commands to the toolbar buttons.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })
  bindAction("button[data-command='OpenFromFile']", async () => {
    try {
      const graphMLText = await openFileReaderOperation.open()
      parseGraphMLText(graphMLText)
    } catch (msg) {
      alert(msg)
    }
  })
  bindAction("button[data-command='OpenViaServer']", async () => {
    try {
      const graphMLText = await openViaServerOperation.open()
      parseGraphMLText(graphMLText)
    } catch (msg) {
      alert(msg)
    }
  })
  bindAction("button[data-command='OpenFromStorage']", async () => {
    try {
      const graphMLText = await openFromStorageOperation.open()
      parseGraphMLText(graphMLText)
    } catch (msg) {
      alert(msg)
    }
  })
  bindAction("button[data-command='SaveToFile']", async () => {
    try {
      const result = await ioh.write(graphComponent.graph)
      saveToFileOperation.save(result, 'unnamed.graphml')
    } catch (msg) {
      alert(msg)
    }
  })
  bindAction("button[data-command='SaveToWindow']", async () => {
    const result = await ioh.write(graphComponent.graph)
    saveToWindowOperation.save(result)
  })

  bindAction("button[data-command='SaveViaServer']", async () => {
    try {
      const result = await ioh.write(graphComponent.graph)
      saveViaServerOperation.save(result)
    } catch (msg) {
      alert(msg)
    }
  })
  bindAction("button[data-command='SaveToStorage']", async () => {
    try {
      const result = await ioh.write(graphComponent.graph)
      await saveToStorageOperation.save(result)
    } catch (msg) {
      alert(msg)
    }
    updateLocalStorageButtons()
  })
}

/**
 * Creates the sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph
  const node1 = graph.createNodeAt(new Point(0, 100))
  const node2 = graph.createNodeAt(new Point(100, 40))
  const node3 = graph.createNodeAt(new Point(100, 100))
  graph.createEdge(node1, node2)
  graph.createEdge(node1, node3)
  graph.createEdge(node1, graph.createNodeAt(new Point(100, 160)))
  graph.createEdge(node2, graph.createNodeAt(new Point(200, 40)))
  graph.createEdge(node3, graph.createNodeAt(new Point(200, 100)))

  // fit the graph in the view
  graphComponent.fitGraphBounds()

  // clear the undo queue
  graph.foldingView.manager.masterGraph.undoEngine.clear()
}

// Runs the demo.
loadJson().then(run)
