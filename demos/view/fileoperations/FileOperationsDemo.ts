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
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  IGraph,
  License,
  Point,
  StorageLocation
} from 'yfiles'

import OpenFromFileOperation from './OpenFromFileOperation'
import OpenFromWebStorageOperation from './OpenFromWebStorageOperation'
import OpenViaServerOperation from './OpenViaServerOperation'
import SaveToFileOperation from './SaveToFileOperation'
import SaveToNewWindowOperation from './SaveToNewWindowOperation'
import SaveToWebStorageOperation from './SaveToWebStorageOperation'
import SaveViaServerOperation from './SaveViaServerOperation'
import { bindAction, checkLicense, showApp } from '../../resources/demo-app'
import DemoStyles, { DemoSerializationListener, initDemoStyles } from '../../resources/demo-styles'
import loadJson from '../../resources/load-json'

const STORAGE_LOCATION = StorageLocation.LOCAL_STORAGE
const STORAGE_URI = 'www.yworks.com/yFilesHTML/GraphML/'

const DEMO_IO_ORIGIN = 'http://localhost:4242'
const DEMO_IO_ENDPOINT = DEMO_IO_ORIGIN + '/file/'

let openFileReaderOperation: OpenFromFileOperation
let openFromStorageOperation: OpenFromWebStorageOperation
let openViaServerOperation: OpenViaServerOperation

let saveToFileOperation: SaveToFileOperation
let saveToWindowOperation: SaveToNewWindowOperation
let saveToStorageOperation: SaveToWebStorageOperation
let saveViaServerOperation: SaveViaServerOperation

let ioh: GraphMLIOHandler

function run(licenseData: object): void {
  License.value = licenseData

  const graphComponent = new GraphComponent('graphComponent')
  graphComponent.graph = createConfiguredGraph()

  // configure user interaction
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  ioh = createIoHandler()

  // initialize open and save operations
  initializeOperations()

  // create a sample graph
  createSampleGraph(graphComponent.graph)

  // center the graph in the visible area
  graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.foldingView!.manager.masterGraph.undoEngineEnabled = true

  // wire up the UI
  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Initializes the graph instance and set default styles.
 */
function createConfiguredGraph(): IGraph {
  // enable folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  const graph = foldingView.graph

  // initialize default style for nodes and edges
  initDemoStyles(graph)

  return graph
}

/**
 * Creates a new GraphMLIOHandler instance that supports readng and writing demo styles.
 */
function createIoHandler(): GraphMLIOHandler {
  const handler = new GraphMLIOHandler()

  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  handler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  handler.addHandleSerializationListener(DemoSerializationListener)
  return handler
}

/**
 * Initializes the open and save operations.
 */
async function initializeOperations(): Promise<void> {
  // Initialize OpenFromFileOperation
  openFileReaderOperation = new OpenFromFileOperation()
  if (!openFileReaderOperation.isAvailable()) {
    querySelector<HTMLButtonElement>('#openFromFileButton').disabled = false
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
    querySelector<HTMLButtonElement>('#saveToFileButton').disabled = true
  }

  // Initialize OpenViaServerOperation
  openViaServerOperation = new OpenViaServerOperation(DEMO_IO_ENDPOINT, DEMO_IO_ORIGIN)

  // Initialize SaveViaServerOperation
  saveViaServerOperation = new SaveViaServerOperation(DEMO_IO_ENDPOINT)
  try {
    // check server availability (default: disabled)
    const executable = await openViaServerOperation.checkServer()
    querySelector<HTMLButtonElement>('#openViaServerButton').disabled = !executable
    querySelector<HTMLButtonElement>('#saveViaServerButton').disabled = !executable
  } catch (err) {
    alert(err)
  }
}

/**
 * Updates the Local storage buttons.
 */
function updateLocalStorageButtons(): void {
  querySelector<HTMLButtonElement>('#saveToStorageButton').disabled =
    !saveToStorageOperation.isAvailable()
  querySelector<HTMLButtonElement>('#openFromStorageButton').disabled =
    !openFromStorageOperation.isAvailable()
}

/**
 * Parses the graphml file.
 */
async function parseGraphMLText(graphComponent: GraphComponent, text: string): Promise<void> {
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
    alert(`Error parsing GraphML: ${(err as Error).message}`)
  }
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(graph: IGraph): void {
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
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
  })
  bindAction("button[data-command='OpenFromFile']", async () => {
    try {
      const graphMLText = await openFileReaderOperation.open()
      await parseGraphMLText(graphComponent, graphMLText)
    } catch (err) {
      alert(err)
    }
  })
  bindAction("button[data-command='OpenViaServer']", async () => {
    try {
      const graphMLText = await openViaServerOperation.open()
      await parseGraphMLText(graphComponent, graphMLText)
    } catch (err) {
      alert(err)
    }
  })
  bindAction("button[data-command='OpenFromStorage']", async () => {
    try {
      const graphMLText = await openFromStorageOperation.open()
      await parseGraphMLText(graphComponent, graphMLText)
    } catch (err) {
      alert(err)
    }
  })
  bindAction("button[data-command='SaveToFile']", async () => {
    try {
      const result = await ioh.write(graphComponent.graph)
      await saveToFileOperation.save(result, 'unnamed.graphml')
    } catch (err) {
      alert(err)
    }
  })
  bindAction("button[data-command='SaveToWindow']", async () => {
    const result = await ioh.write(graphComponent.graph)
    await saveToWindowOperation.save(result)
  })

  bindAction("button[data-command='SaveViaServer']", async () => {
    try {
      const result = await ioh.write(graphComponent.graph)
      await saveViaServerOperation.save(result)
    } catch (err) {
      alert(err)
    }
  })
  bindAction("button[data-command='SaveToStorage']", async () => {
    try {
      const result = await ioh.write(graphComponent.graph)
      await saveToStorageOperation.save(result)
    } catch (err) {
      alert(err)
    }
    updateLocalStorageButtons()
  })
}

function querySelector<T extends HTMLElement>(selector: string): T {
  return document.querySelector(selector) as T
}

// Runs the demo.
loadJson().then(checkLicense).then(run)
