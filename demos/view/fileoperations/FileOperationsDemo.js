/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

/**
 * Shows various ways to load and save a graph to a GraphML file.
 *
 * The following ways to load a graph are shown: open a local file with a file chooser dialog, load from the local
 * storage, and load from a server.
 *
 * The following ways to save a graph are shown: save as file download, open in a new tab, print to the console,
 * send to a server, and save to the local storage.
 *
 * See the correspondingly named files of this demo for details on each approach.
 *
 * Note that you can load and save other data than GraphML text in the same way, too.
 *
 * A good reference for saving local files is FileSaver.js: https://github.com/eligrey/FileSaver.js/
 */

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

/*
  eslint-disable no-alert
 */

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  './OpenFromFileOperation.js',
  './OpenFromWebStorageOperation.js',
  './OpenViaServerOperation.js',
  './SaveToWebStorageOperation.js',
  './SaveToNewWindowOperation.js',
  './SaveToFileOperation.js',
  './SaveViaServerOperation.js',
  'yfiles/view-graphml',
  'yfiles/view-folding',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  OpenFromFileOperation,
  OpenFromWebStorageOperation,
  OpenViaServerOperation,
  SaveToWebStorageOperation,
  SaveToNewWindowOperation,
  SaveToFileOperation,
  SaveViaServerOperation
) => {
  /** @type yfiles.view.GraphComponent */
  let graphComponent = null

  let openFileReaderOperation = null
  let openFromStorageOperation = null
  let openViaServerOperation = null

  let saveToFileOperation = null
  let saveToWindowOperation = null
  let saveToStorageOperation = null
  let saveViaServerOperation = null

  /** @type yfiles.graphml.GraphMLIOHandler */
  let ioh = null

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // enable folding
    const foldingManager = new yfiles.graph.FoldingManager()
    foldingManager.masterGraph.undoEngineEnabled = true

    const foldingView = foldingManager.createFoldingView()
    foldingView.enqueueNavigationalUndoUnits = true
    graphComponent.graph = foldingView.graph

    // initialize the default style of the nodes and edges
    DemoStyles.initDemoStyles(foldingView.graph)

    // initialize the input mode
    const inputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true
    })
    graphComponent.inputMode = inputMode

    // create a GraphMLIOHandler and register the demo styles
    ioh = new yfiles.graphml.GraphMLIOHandler()
    ioh.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )

    // initialize the open and save operations
    initializeOperations()

    // create the sample graph
    createSampleGraph()

    // wire up the UI
    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Initializes the open and save operations.
   */
  function initializeOperations() {
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

    // check server availability (default: disabled)
    openViaServerOperation
      .checkServer()
      .then(executable => {
        document.querySelector('#openViaServerButton').disabled = !executable
        document.querySelector('#saveViaServerButton').disabled = !executable
      })
      .catch(e => {
        alert(e)
      })
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
  function parseGraphMLText(text) {
    const doc = new DOMParser().parseFromString(text, 'text/xml')
    if (doc.documentElement === null || doc.documentElement.nodeName === 'parsererror') {
      alert('Error parsing XML.')
      return
    }

    // read the graph
    ioh
      .readFromDocument(graphComponent.graph, doc)
      .then(() => graphComponent.fitGraphBounds())
      .catch(e => alert(`Error parsing GraphML: ${e.message}`))
  }

  /**
   * Sets the commands to the toolbar buttons.
   */
  function registerCommands() {
    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      graphComponent.fitGraphBounds()
    })
    app.bindAction("button[data-command='OpenFromFile']", () => {
      openFileReaderOperation
        .open()
        .then(graphMLText => parseGraphMLText(graphMLText))
        .catch(msg => alert(msg))
    })
    app.bindAction("button[data-command='OpenViaServer']", () => {
      openViaServerOperation
        .open()
        .then(graphMLText => parseGraphMLText(graphMLText))
        .catch(msg => alert(msg))
    })
    app.bindAction("button[data-command='OpenFromStorage']", () => {
      openFromStorageOperation
        .open()
        .then(graphMLText => parseGraphMLText(graphMLText))
        .catch(msg => alert(msg))
    })
    app.bindAction("button[data-command='SaveToFile']", () => {
      ioh
        .write(graphComponent.graph)
        .then(result =>
          saveToFileOperation.save(result, 'unnamed.graphml').catch(msg => alert(msg))
        )
    })
    app.bindAction("button[data-command='SaveToWindow']", () => {
      ioh.write(graphComponent.graph).then(result => saveToWindowOperation.save(result))
    })
    app.bindAction("button[data-command='SaveViaServer']", () => {
      ioh
        .write(graphComponent.graph)
        .then(result => saveViaServerOperation.save(result).catch(msg => alert(msg)))
    })
    app.bindAction("button[data-command='SaveToStorage']", () => {
      ioh.write(graphComponent.graph).then(result =>
        saveToStorageOperation
          .save(result)
          .then(() => updateLocalStorageButtons())
          .catch(msg => {
            updateLocalStorageButtons()
            alert(msg)
          })
      )
    })
  }

  /**
   * Creates the sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph
    const node1 = graph.createNodeAt(new yfiles.geometry.Point(0, 100))
    const node2 = graph.createNodeAt(new yfiles.geometry.Point(100, 40))
    const node3 = graph.createNodeAt(new yfiles.geometry.Point(100, 100))
    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)
    graph.createEdge(node1, graph.createNodeAt(new yfiles.geometry.Point(100, 160)))
    graph.createEdge(node2, graph.createNodeAt(new yfiles.geometry.Point(200, 40)))
    graph.createEdge(node3, graph.createNodeAt(new yfiles.geometry.Point(200, 100)))

    // fit the graph in the view
    graphComponent.fitGraphBounds()

    // clear the undo queue
    graph.foldingView.manager.masterGraph.undoEngine.clear()
  }

  // Runs the demo.
  run()
})
