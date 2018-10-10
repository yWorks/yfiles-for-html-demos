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
 * This demo visualizes the GraphML representation of the graph in the graph component.
 */

/* eslint-disable global-require */

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  },
  waitSeconds: 400,
  packages: [
    {
      name: 'codemirror',
      location: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.33.0/',
      main: 'codemirror.min'
    }
  ],
  map: {
    codemirror: {
      'codemirror/lib/codemirror': 'codemirror'
    }
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'EditorSync.js',
  'PropertiesPanel.js',
  'SimpleInputHandler.js',
  'SimpleOutputHandler.js',
  'yfiles/view-graphml',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  EditorSync,
  panel,
  SimpleInputHandler,
  SimpleOutputHandler
) => {
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    editorSync = new EditorSync()

    registerCommands()

    // load the folding and style modules and initialize the GraphComponent
    require(['yfiles/view-folding'], () => {
      // load the remaining viewer modules required for GraphML loading, style support, and input modes
      require(['yfiles/view'], () => {
        graphComponent.inputMode = createEditorMode()

        createGraphMLIOHandler()
        initializeEditorSynchronization()
        graphModifiedListener = editorSync.onGraphModified.bind(editorSync)
        initGraphModificationEvents()
        loadSampleGraph(graphComponent.graph)
      })

      // Enable folding
      const manager = new yfiles.graph.FoldingManager()
      const view = manager.createFoldingView()
      const graph = view.graph
      graphComponent.graph = graph
      foldingView = view

      // Get graph instance and enable undoability support
      manager.masterGraph.undoEngineEnabled = true

      // Initialize IO
      graphmlSupport = new yfiles.graphml.GraphMLSupport({
        graphComponent, // configure to load and save to the file system
        storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM
      })

      // Assign the default demo styles
      DemoStyles.initDemoStyles(graph)

      // Set the default node label position to centered below the node with the FreeNodeLabelModel that supports
      // label snapping
      graph.nodeDefaults.labels.layoutParameter = yfiles.graph.FreeNodeLabelModel.INSTANCE.createParameter(
        [0.5, 1.0],
        [0, 10],
        [0.5, 0.0],
        [0, 0],
        0
      )

      // Set the default edge label position with the SmartEdgeLabelModel that supports label snapping
      graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.SmartEdgeLabelModel().createParameterFromSource(
        0,
        0,
        0.5
      )

      propertiesPanel = new panel.PropertiesPanel(document.getElementById('propertiesContent'))
      propertiesPanel.addSomethingChangedListener(onGraphModified.bind(this))

      graphComponent.fitGraphBounds()
      graphComponent.addCurrentItemChangedListener((sender, args) =>
        propertiesPanel.setCurrentItem(getMasterItem(graphComponent.currentItem))
      )
    })

    app.show(graphComponent)
  }

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * The properties panel shows the custom data properties of the currently selected graph item.
   * Custom data properties can be added and modified.
   * @type {PropertiesPanel}
   */
  let propertiesPanel = null

  /**
   * The folding view that manages the folding of the graph.
   * @type {yfiles.graph.IFoldingView}
   */
  let foldingView = null

  /**
   * The EditorSync synchronizes the graph with the GraphML editor.
   * @type {EditorSync}
   */
  let editorSync = null

  /**
   * The GraphMLSupport instance that takes care of saving/loading the graph and keeping the editor in sync.
   * @type {yfiles.graphml.GraphMLSupport}
   */
  let graphmlSupport = null

  /**
   * The listener function that is called when the graph is modified.
   * @type {function({graphml: string, selectedItem: yfiles.graph.IModelItem})}
   */
  let graphModifiedListener = null

  /**
   * Registers commands for the toolbar buttons.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    app.bindAction("button[data-command='New']", clearGraph)
    app.bindAction("button[data-command='Open']", onOpenCommandExecuted)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent)

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent)

    app.bindCommand(
      "button[data-command='GroupSelection']",
      iCommand.GROUP_SELECTION,
      graphComponent
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      iCommand.UNGROUP_SELECTION,
      graphComponent
    )
  }

  /**
   * Creates the editor input mode for the graph component with support for table nodes.
   * @return {yfiles.input.IInputMode} A new <code>GraphEditorInputMode</code> instance
   */
  function createEditorMode() {
    const inputMode = new yfiles.input.GraphEditorInputMode({
      allowUndoOperations: true,
      allowGroupingOperations: true,
      focusableItems:
        yfiles.graph.GraphItemTypes.NODE |
        yfiles.graph.GraphItemTypes.EDGE |
        yfiles.graph.GraphItemTypes.PORT
    })

    // Add TableEditorMode to GEIM. We set the priority higher than for the handle input mode so that handles win if
    // both gestures are possible
    const tableInputMode = new yfiles.input.TableEditorInputMode({
      priority: inputMode.handleInputMode.priority + 1
    })
    inputMode.add(tableInputMode)

    tableInputMode.addDeletedSelectionListener((sender, args) => onGraphModified())
    tableInputMode.addLabelAddedListener((sender, args) => onGraphModified())
    tableInputMode.addLabelTextChangedListener((sender, args) => onGraphModified())
    tableInputMode.resizeStripeInputMode.addDragFinishedListener((sender, args) =>
      onGraphModified()
    )

    inputMode.availableCommands.remove(yfiles.input.ICommand.UNDO)
    inputMode.availableCommands.remove(yfiles.input.ICommand.REDO)
    inputMode.availableCommands.remove(yfiles.input.ICommand.CUT)
    inputMode.availableCommands.remove(yfiles.input.ICommand.PASTE)

    inputMode.keyboardInputMode.addCommandBinding(
      yfiles.input.ICommand.UNDO,
      () => {
        graphComponent.inputMode.undo()
        onGraphModified()
      },
      () => graphComponent.graph.undoEngine !== null && graphComponent.graph.undoEngine.canUndo()
    )

    inputMode.keyboardInputMode.addCommandBinding(
      yfiles.input.ICommand.REDO,
      () => {
        graphComponent.inputMode.redo()
        onGraphModified()
      },
      () => graphComponent.graph.undoEngine !== null && graphComponent.graph.undoEngine.canUndo()
    )

    inputMode.keyboardInputMode.addCommandBinding(
      yfiles.input.ICommand.CUT,
      () => {
        graphComponent.inputMode.cut()
        onGraphModified()
      },
      () => {
        const clipboard = graphComponent.clipboard
        return (
          clipboard !== null &&
          clipboard.copyItems !== yfiles.graph.GraphItemTypes.NONE &&
          graphComponent.inputMode.allowClipboardOperations &&
          graphComponent.selection.size > 0 &&
          (yfiles.graph.GraphItemTypes.getItemTypes(graphComponent.selection) &
            graphComponent.inputMode.deletableItems) !==
            0
        )
      }
    )
    inputMode.keyboardInputMode.addCommandBinding(
      yfiles.input.ICommand.PASTE,
      () => {
        graphComponent.inputMode.paste()
        onGraphModified()
      },
      () => {
        const clipboard = graphComponent.clipboard
        return (
          clipboard !== null &&
          graphComponent.inputMode.allowClipboardOperations &&
          !clipboard.empty
        )
      }
    )

    return inputMode
  }

  /**
   * Creates a GraphMLIOHandler with event handlers for dynamic parsing of custom data, and for connecting the GraphML
   * editor to write and parse events.
   * @return {yfiles.graphml.GraphMLIOHandler}
   */
  function createGraphMLIOHandler() {
    const ioHandler = new yfiles.graphml.GraphMLIOHandler()

    // Enable parsing/writing of arbitrary custom data
    ioHandler.addQueryInputHandlersListener((sender, args) => {
      queryInputHandlers(args)
    })
    ioHandler.addQueryOutputHandlersListener((sender, args) => {
      queryOutputHandlers(args)
    })

    // Hook the EditorSync instance to the GraphML parsing and writing events
    ioHandler.addWritingListener((sender, args) => {
      editorSync.onWriting(args)
    })
    ioHandler.addParsingListener((sender, args) => {
      editorSync.onParsing(args)
    })
    ioHandler.addParsedListener((sender, args) => {
      editorSync.onParsed(args)
    })

    ioHandler.addParsingListener((sender, args) => {
      propertiesPanel.clear()
    })
    ioHandler.addParsedListener((sender, args) => {
      propertiesPanel.showGraphProperties()
    })

    ioHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )

    graphmlSupport.graphMLIOHandler = ioHandler

    return ioHandler
  }

  /**
   * Connects editor events to the view, and view events to the editor.
   */
  function initializeEditorSynchronization() {
    editorSync.initialize(foldingView.manager.masterGraph)
    // Update the view when the editor's selection or content changes
    editorSync.addItemSelectedListener(args => {
      onEditorItemSelected(args.item)
    })
    editorSync.addEditorContentChangedListener(args => {
      onEditorContentChanged(args.value)
    })

    // update the editor selection when the view's selection state changes
    const selection = graphComponent.selection
    selection.addItemSelectionChangedListener((sender, args) => {
      if (args.itemSelected) {
        editorSync.onItemSelected(getMasterItem(args.item))
      } else {
        editorSync.onItemDeselected(getMasterItem(args.item))
      }
    })
  }

  /**
   * The GraphML editor's content has been modified: try to parse the new GraphML data, and update the view if
   * successful.
   * @param {string} value The new editor content.
   */
  function onEditorContentChanged(value) {
    graphComponent.selection.clear()
    try {
      graphmlSupport.graphMLIOHandler
        .readFromGraphMLText(graphComponent.graph, value)
        .then(() => {
          editorSync.onGraphMLParsed()
        })
        .catch(error => {
          editorSync.onGraphMLError(error)
        })
    } catch (error) {
      editorSync.onGraphMLError(error)
    }
  }

  /**
   * An item's GraphML representation has been selected in the GraphML editor: select the corresponding view item.
   * @param {yfiles.graph.IModelItem} masterItem The item that has changed.
   */
  function onEditorItemSelected(masterItem) {
    const selection = graphComponent.selection
    const viewItem = foldingView.getViewItem(masterItem)
    if (viewItem !== null && !selection.isSelected(viewItem)) {
      selection.clear()
      selection.setSelected(viewItem, true)
    }
  }

  /**
   * When the user interactively modifies the graph structure, the GraphML editor should be updated to show the new
   * serialization.
   */
  function initGraphModificationEvents() {
    const mode = graphComponent.inputMode
    mode.addNodeCreatedListener((sender, args) => {
      onGraphModified()
    })
    mode.addDeletedItemListener((sender, args) => {
      onGraphModified()
    })
    mode.addEdgePortsChangedListener((sender, args) => {
      onGraphModified()
    })
    mode.addLabelAddedListener((sender, args) => {
      onGraphModified()
    })
    mode.addLabelTextChangedListener((sender, args) => {
      onGraphModified()
    })
    mode.createBendInputMode.addBendCreatedListener((sender, args) => {
      onGraphModified()
    })
    mode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
      onGraphModified()
    })
    mode.moveInputMode.addDragFinishedListener((sender, args) => {
      onGraphModified()
    })
    mode.handleInputMode.addDragFinishedListener((sender, args) => {
      onGraphModified()
    })
    mode.moveLabelInputMode.addDragFinishedListener((sender, args) => {
      onGraphModified()
    })
    mode.addNodeReparentedListener((sender, args) => {
      onGraphModified()
    })
    mode.navigationInputMode.addGroupCollapsedListener((sender, args) => {
      onGraphModified()
    })
    mode.navigationInputMode.addGroupExpandedListener((sender, args) => {
      onGraphModified()
    })
  }

  /**
   * The graph has been modified by the user: trigger synchronization of the GraphML editor.
   */
  function onGraphModified() {
    let graphChanged = true

    // Use a timeout, so we don't synchronize too often (e.g. for each node move event)
    setTimeout(() => {
      if (graphChanged) {
        graphChanged = false

        graphmlSupport.graphMLIOHandler.write(graphComponent.graph).then(str => {
          let selectedMasterItem = null
          if (graphComponent.selection.size > 0) {
            selectedMasterItem = getMasterItem(graphComponent.selection.first())
          }
          if (graphModifiedListener !== null) {
            graphModifiedListener({
              graphml: str,
              selectedItem: selectedMasterItem
            })
          }
        })
      }
    }, 100)
  }

  /**
   * Called for each key definition in the loaded GraphML file.
   * This method is called if the GraphML parse code reaches a key element. If the key has not been handled yet,
   * a new input handler is added that handles value definitions for this key in the GraphML file.
   * @param {yfiles.graphml.QueryInputHandlersEventArgs} args
   */
  function queryInputHandlers(args) {
    const keyDefinition = args.keyDefinition
    // check if the key has already been handled
    if (!args.handled) {
      // get the name, scope and type of the key definition
      const name = keyDefinition.getAttribute('attr.name')
      const keyScopeString = keyDefinition.getAttribute('for')
      const typeString = keyDefinition.getAttribute('attr.type')

      // early exit if attribute has no name or scope
      if (name === null || keyScopeString === null) {
        return
      }

      // parse the key scope attribute
      const keyScope = yfiles.lang.Enum.parse(yfiles.graphml.KeyScope.$class, keyScopeString, true)
      // parse the type attribute
      const type =
        typeString !== null
          ? yfiles.lang.Enum.parse(yfiles.graphml.KeyType.$class, typeString, true)
          : yfiles.graphml.KeyType.COMPLEX

      /** @type {GraphMLProperty} */
      let property
      // check if the key describes an item or a graph property
      if (
        keyScope === yfiles.graphml.KeyScope.EDGE ||
        keyScope === yfiles.graphml.KeyScope.NODE ||
        keyScope === yfiles.graphml.KeyScope.PORT
      ) {
        // add the new item property to the properties panel
        property = propertiesPanel.addItemProperty(name, type, keyScope)
      } else if (keyScope === yfiles.graphml.KeyScope.GRAPH) {
        // add the new graph property to the properties panel
        property = propertiesPanel.addGraphProperty(name, type)
      } else {
        property = null
      }

      if (property !== null) {
        // register an input handler that gets the attribute values
        const inputHandler = new SimpleInputHandler(property, propertiesPanel)
        args.addInputHandler(inputHandler)
        // mark the key definition as handled
        args.handled = true
        // parse the default value, it it exists
        inputHandler.initializeFromKeyDefinition(args.context, args.keyDefinition)
      }
    }
  }

  /**
   * Called before serializing the graph.
   * This method takes care that the item and graph properties in the properties panel are
   * written back to GraphML. For this purpose, it adds an output handler for each property.
   * @param {yfiles.graphml.QueryOutputHandlersEventArgs} args
   */
  function queryOutputHandlers(args) {
    propertiesPanel.properties.forEach(property => {
      if (property.type !== yfiles.graphml.KeyType.COMPLEX && property.keyScope === args.scope) {
        args.addOutputHandler(new SimpleOutputHandler(property, propertiesPanel))
      }
    })
  }

  /**
   * Clears the graph of the graphComponent.
   */
  function clearGraph() {
    graphComponent.graph.clear()
    graphComponent.fitGraphBounds()
    onGraphModified()
  }

  /**
   * Reads the default sample graph.
   * @param {yfiles.graph.IGraph} graph The graph instance that will be populated with the parsed graph.
   */
  function loadSampleGraph(graph) {
    // Temporarily disconnect editor synchronization, so the graph isn't
    // serialized repeatedly while loading.
    graphModifiedListener = null

    app
      .readGraph(graphmlSupport.graphMLIOHandler, graph, 'resources/sample-graph.graphml')
      .then(() => {
        // when done - fit the bounds
        graphComponent.fitGraphBounds()
        graphComponent.graph.undoEngine.clear()
        // Trigger synchronization of the GraphML editor
        onGraphModified()
        // reconnect editor synchronization
        graphModifiedListener = editorSync.onGraphModified.bind(editorSync)
        graphComponent.graph.undoEngine.clear()
      })
  }

  /**
   * Called when the open command executed is executed and applies a layout after loading the graph.
   */
  function onOpenCommandExecuted() {
    // Temporarily disconnect editor synchronization, so the graph isn't
    // serialized repeatedly while loading.
    graphModifiedListener = null
    graphmlSupport.openFile(graphComponent.graph).then(() => {
      onGraphModified()
      graphModifiedListener = editorSync.onGraphModified.bind(editorSync)
    })
  }

  /**
   * Returns the corresponding master graph item for a provided view graph item.
   * @param {yfiles.graph.IModelItem} item A view item
   * @return {yfiles.graph.IModelItem} A master graph item
   */
  function getMasterItem(item) {
    if (foldingView.manager.masterGraph.contains(item)) {
      return item
    }
    return graphComponent.graph.contains(item) ? foldingView.getMasterItem(item) : null
  }

  run()
})
