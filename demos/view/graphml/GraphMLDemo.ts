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
  Class,
  Enum,
  FoldingManager,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  GraphMLSupport,
  ICommand,
  IFoldingView,
  IGraph,
  IInputMode,
  ImageNodeStyle,
  IModelItem,
  KeyScope,
  KeyType,
  License,
  QueryInputHandlersEventArgs,
  QueryOutputHandlersEventArgs,
  SmartEdgeLabelModel,
  StorageLocation,
  Table,
  TableEditorInputMode
} from 'yfiles'

import { SimpleOutputHandler } from './SimpleOutputHandler'
import { SimpleInputHandler } from './SimpleInputHandler'
import { bindAction, bindCommand, readGraph, showApp } from '../../resources/demo-app'
import { PropertiesPanel } from './PropertiesPanel'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { EditorSync } from './EditorSync'
import type { GraphMLProperty } from './GraphMLProperty'
import { fetchLicense } from '../../resources/fetch-license'
import { createConfiguredGraphMLIOHandler } from '../../utils/FaultTolerantGraphMLIOHandler'

let graphComponent: GraphComponent

/**
 * The properties panel shows the custom data properties of the currently selected graph item.
 * Custom data properties can be added and modified.
 */
let propertiesPanel: PropertiesPanel

/**
 * The folding view that manages the folding of the graph.
 */
let foldingView: IFoldingView

/**
 * The EditorSync synchronizes the graph with the GraphML editor.
 */
let editorSync: EditorSync

/**
 * The GraphMLSupport instance that takes care of saving/loading the graph and keeping the editor in sync.
 */
let graphmlSupport: GraphMLSupport

/**
 * The listener function that is called when the graph is modified.
 */
let graphModifiedListener: (args: { graphml: string; selectedItem: IModelItem | null }) => void

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  editorSync = new EditorSync()

  registerCommands()

  // Initialize IO
  graphmlSupport = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // Enable folding
  const manager = new FoldingManager()
  const view = manager.createFoldingView()
  const graph = view.graph
  graphComponent.graph = graph
  foldingView = view

  // enable undo/redo support
  manager.masterGraph.undoEngineEnabled = true

  // register graph interaction
  graphComponent.inputMode = createEditorMode()

  // also enable undo/redo for the tables in the sample graph
  Table.installStaticUndoSupport(manager.masterGraph)

  // Assign the default demo styles
  initDemoStyles(graph, { theme: 'demo-lightblue' })

  // Set the default node label position to centered below the node with the FreeNodeLabelModel that supports
  // label snapping
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.INSTANCE.createParameter(
    [0.5, 1.0],
    [0, 10],
    [0.5, 0.0],
    [0, 0],
    0
  )

  // Set the default edge label position with the SmartEdgeLabelModel that supports label snapping
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(
    0,
    0,
    0.5
  )

  propertiesPanel = new PropertiesPanel(document.getElementById('propertiesContent') as HTMLElement)
  propertiesPanel.addSomethingChangedListener(onGraphModified)

  graphComponent.fitGraphBounds()
  graphComponent.addCurrentItemChangedListener(
    (sender, args) => (propertiesPanel.currentItem = getMasterItem(graphComponent.currentItem))
  )

  createGraphMLIOHandler()
  initializeEditorSynchronization()
  graphModifiedListener = editorSync.onGraphModified.bind(editorSync)
  initGraphModificationEvents()
  await loadSampleGraph(graphComponent.graph)

  // clear the undo engine to prevent undoing of the graph creation.
  graphComponent.graph.undoEngine?.clear()

  showApp(graphComponent)
}

/**
 * Creates the editor input mode for the graph component with support for table nodes.
 * @returns A new {@link GraphEditorInputMode} instance
 */
function createEditorMode(): IInputMode {
  const inputMode = new GraphEditorInputMode({
    allowUndoOperations: true,
    allowGroupingOperations: true,
    focusableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.PORT
  })

  // Add TableEditorMode to GEIM. We set the priority higher than for the handle input mode so that handles win if
  // both gestures are possible
  const tableInputMode = new TableEditorInputMode({
    priority: inputMode.handleInputMode.priority + 1
  })
  inputMode.add(tableInputMode)

  tableInputMode.addDeletedSelectionListener((sender, args) => onGraphModified())
  tableInputMode.addLabelAddedListener((sender, args) => onGraphModified())
  tableInputMode.addLabelTextChangedListener((sender, args) => onGraphModified())
  tableInputMode.resizeStripeInputMode.addDragFinishedListener((sender, args) => onGraphModified())

  inputMode.availableCommands.remove(ICommand.UNDO)
  inputMode.availableCommands.remove(ICommand.REDO)
  inputMode.availableCommands.remove(ICommand.CUT)
  inputMode.availableCommands.remove(ICommand.PASTE)

  inputMode.keyboardInputMode.addCommandBinding(
    ICommand.UNDO,
    () => {
      inputMode.undo()
      onGraphModified()
      return true
    },
    (command, parameter, source) => {
      const undoEngine = (source as GraphComponent).graph.undoEngine
      return undoEngine !== null && undoEngine.canUndo()
    }
  )

  inputMode.keyboardInputMode.addCommandBinding(
    ICommand.REDO,
    () => {
      inputMode.redo()
      onGraphModified()
      return true
    },
    (command, parameter, source) => {
      const undoEngine = (source as GraphComponent).graph.undoEngine
      return undoEngine !== null && undoEngine.canRedo()
    }
  )

  inputMode.keyboardInputMode.addCommandBinding(
    ICommand.CUT,
    () => {
      inputMode.cut()
      onGraphModified()
      return true
    },
    (command, parameter, source) => {
      const component = source as GraphComponent
      const clipboard = component.clipboard
      return (
        clipboard !== null &&
        clipboard.copyItems !== GraphItemTypes.NONE &&
        inputMode.allowClipboardOperations &&
        component.selection.size > 0 &&
        (GraphItemTypes.getItemTypes(component.selection) & inputMode.deletableItems) !== 0
      )
    }
  )
  inputMode.keyboardInputMode.addCommandBinding(
    ICommand.PASTE,
    () => {
      inputMode.paste()
      onGraphModified()
      return true
    },
    (command, parameter, source) => {
      const clipboard = (source as GraphComponent).clipboard
      return clipboard !== null && inputMode.allowClipboardOperations && !clipboard.empty
    }
  )

  return inputMode
}

// We need to load the 'styles-other' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for loading all library styles.
Class.ensure(ImageNodeStyle)

/**
 * Creates a GraphMLIOHandler with event handlers for dynamic parsing of custom data, and for connecting the GraphML
 * editor to write and parse events.
 */
function createGraphMLIOHandler(): GraphMLIOHandler {
  // Register a preconfigured GraphMLIOHandler that supports different styles created by our basic demos
  const ioHandler = createConfiguredGraphMLIOHandler()

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

  graphmlSupport.graphMLIOHandler = ioHandler

  return ioHandler
}

/**
 * Connects editor events to the view, and view events to the editor.
 */
function initializeEditorSynchronization(): void {
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
    const masterItem = getMasterItem(args.item)
    if (masterItem) {
      if (args.itemSelected) {
        editorSync.onItemSelected(masterItem)
      } else {
        editorSync.onItemDeselected(masterItem)
      }
    }
  })
}

/**
 * The GraphML editor's content has been modified: try to parse the new GraphML data, and update the view if
 * successful.
 * @param value The new editor content.
 */
async function onEditorContentChanged(value: string) {
  graphComponent.selection.clear()
  try {
    await graphmlSupport.graphMLIOHandler.readFromGraphMLText(graphComponent.graph, value)
    editorSync.onGraphMLParsed()
  } catch (err) {
    editorSync.onGraphMLError(err as Error)
  }
}

/**
 * An item's GraphML representation has been selected in the GraphML editor: select the corresponding view item.
 * @param masterItem The item that has changed.
 */
function onEditorItemSelected(masterItem: IModelItem): void {
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
function initGraphModificationEvents(): void {
  const mode = graphComponent.inputMode as GraphEditorInputMode
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
function onGraphModified(): void {
  let graphChanged = true

  // Use a timeout, so we don't synchronize too often (e.g. for each node move event)
  setTimeout(async () => {
    if (graphChanged) {
      graphChanged = false

      const str = await graphmlSupport.graphMLIOHandler.write(graphComponent.graph)
      let selectedMasterItem: IModelItem | null = null
      if (graphComponent.selection.size > 0) {
        selectedMasterItem = getMasterItem(graphComponent.selection.first())
      }
      if (graphModifiedListener) {
        graphModifiedListener({
          graphml: str,
          selectedItem: selectedMasterItem
        })
      }
    }
  }, 100)
}

/**
 * Called for each key definition in the loaded GraphML file.
 * This method is called if the GraphML parse code reaches a key element. If the key has not been handled yet,
 * a new input handler is added that handles value definitions for this key in the GraphML file.
 */
function queryInputHandlers(args: QueryInputHandlersEventArgs): void {
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
    const keyScope = parse<KeyScope>(KeyScope.$class, keyScopeString)
    // parse the type attribute
    const type = typeString !== null ? parse<KeyType>(KeyType.$class, typeString) : KeyType.COMPLEX

    let property: GraphMLProperty | null
    // check if the key describes an item or a graph property
    if (keyScope === KeyScope.EDGE || keyScope === KeyScope.NODE || keyScope === KeyScope.PORT) {
      // add the new item property to the properties panel
      property = propertiesPanel.addItemProperty(name, type, keyScope)
    } else if (keyScope === KeyScope.GRAPH) {
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

function parse<T>(type: Class<T>, value: string): T {
  return Enum.parse(type, value, true) as any as T
}

/**
 * Called before serializing the graph.
 * This method takes care that the item and graph properties in the properties panel are
 * written back to GraphML. For this purpose, it adds an output handler for each property.
 */
function queryOutputHandlers(args: QueryOutputHandlersEventArgs): void {
  propertiesPanel.properties.forEach(property => {
    if (property.type !== KeyType.COMPLEX && property.keyScope === args.scope) {
      args.addOutputHandler(new SimpleOutputHandler(property, propertiesPanel))
    }
  })
}

/**
 * Clears the graph of the graphComponent.
 */
function clearGraph(): void {
  graphComponent.graph.clear()
  graphComponent.fitGraphBounds()
  onGraphModified()
}

/**
 * Reads the default sample graph.
 * @param graph The graph instance that will be populated with the parsed graph.
 */
async function loadSampleGraph(graph: IGraph): Promise<void> {
  // Temporarily disconnect editor synchronization, so the graph isn't
  // serialized repeatedly while loading.
  graphModifiedListener = () => {}

  await readGraph(graphmlSupport.graphMLIOHandler, graph, 'resources/sample-graph.graphml')
  // when done - fit the bounds
  graphComponent.fitGraphBounds()
  // Trigger synchronization of the GraphML editor
  onGraphModified()
  // reconnect editor synchronization
  graphModifiedListener = editorSync.onGraphModified.bind(editorSync)
}

/**
 * Called when the open command executed is executed and applies a layout after loading the graph.
 */
async function onOpenCommandExecuted(): Promise<void> {
  // Temporarily disconnect editor synchronization, so the graph isn't
  // serialized repeatedly while loading.
  graphModifiedListener = () => {}
  await graphmlSupport.openFile(graphComponent.graph)
  graphComponent.fitGraphBounds()
  onGraphModified()
  graphModifiedListener = editorSync.onGraphModified.bind(editorSync)
  graphComponent.graph.undoEngine?.clear()
}

/**
 * Returns the corresponding master graph item for a provided view graph item.
 * @param item A view item
 * @returns A master graph item
 */
function getMasterItem(item: IModelItem | null): IModelItem | null {
  if (!item || foldingView.manager.masterGraph.contains(item)) {
    return item
  } else {
    return graphComponent.graph.contains(item) ? foldingView.getMasterItem(item) : null
  }
}

/**
 * Registers commands for the toolbar buttons.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", clearGraph)
  bindAction("button[data-command='Open']", onOpenCommandExecuted)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='Delete']", ICommand.DELETE, graphComponent)

  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
}

// noinspection JSIgnoredPromiseFromCall
run()
