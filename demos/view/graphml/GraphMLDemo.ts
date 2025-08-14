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
  Command,
  FoldingManager,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphMLIOHandler,
  IEdge,
  IFoldingView,
  IGraph,
  IInputMode,
  IModelItem,
  INode,
  KeyScope,
  KeyType,
  License,
  MoveInputMode,
  QueryInputHandlersEventArgs,
  QueryOutputHandlersEventArgs,
  SerializationProperties,
  SmartEdgeLabelModel,
  Table,
  TableEditorInputMode
} from '@yfiles/yfiles'

import { SimpleOutputHandler } from './SimpleOutputHandler'
import { SimpleInputHandler } from './SimpleInputHandler'
import { PropertiesPanel } from './PropertiesPanel'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { EditorSync } from './EditorSync'
import type { GraphMLProperty } from './GraphMLProperty'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { createConfiguredGraphMLIOHandler } from '@yfiles/demo-utils/FaultTolerantGraphMLIOHandler'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { openGraphML, saveGraphML } from '@yfiles/demo-utils/graphml-support'

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
 * The GraphMLIOHandler instance that takes care of saving/loading the graph and keeping the editor in sync.
 */
let graphMLIOHandler: GraphMLIOHandler

/**
 * The listener function that is called when the graph is modified.
 */
let graphModifiedListener: (args: { graphml: string; selectedItem: IModelItem | null }) => void

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  editorSync = new EditorSync()

  initializeUI()

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

  propertiesPanel = new PropertiesPanel(document.querySelector<HTMLElement>('#propertiesContent')!)
  propertiesPanel.setSomethingChangedListener(onGraphModified)

  void graphComponent.fitGraphBounds()
  graphComponent.addEventListener(
    'current-item-changed',
    () => (propertiesPanel.currentItem = getMasterItem(graphComponent.currentItem))
  )

  // Initialize IO
  graphMLIOHandler = createGraphMLIOHandler()
  initializeEditorSynchronization()
  graphModifiedListener = editorSync.onGraphModified.bind(editorSync)
  initGraphModificationEvents()
  await loadSampleGraph(graphComponent.graph)

  // clear the undo engine to prevent undoing of the graph creation.
  graphComponent.graph.undoEngine?.clear()
}

/**
 * Creates the editor input mode for the graph component with support for table nodes.
 * @returns A new {@link GraphEditorInputMode} instance
 */
function createEditorMode(): IInputMode {
  const inputMode = new GraphEditorInputMode({
    allowUndoOperations: true,
    focusableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.PORT,
    // items can be selected only if the graphML editor text is valid
    selectablePredicate: () => editorSync.hasValidText()
  })

  // Add TableEditorMode to GEIM. We set the priority higher than for the handle input mode so that handles win if
  // both gestures are possible
  const tableInputMode = new TableEditorInputMode({
    priority: inputMode.handleInputMode.priority + 1
  })
  inputMode.add(tableInputMode)

  tableInputMode.addEventListener('deleting-selection', () => onGraphModified())
  inputMode.editLabelInputMode.addEventListener('label-added', () => onGraphModified())
  inputMode.editLabelInputMode.addEventListener('label-edited', () => onGraphModified())
  tableInputMode.resizeStripeInputMode.addEventListener('drag-finished', () => onGraphModified())

  inputMode.availableCommands.remove(Command.UNDO)
  inputMode.availableCommands.remove(Command.REDO)
  inputMode.availableCommands.remove(Command.CUT)
  inputMode.availableCommands.remove(Command.PASTE)

  inputMode.keyboardInputMode.addCommandBinding(
    Command.UNDO,
    (evt) => {
      inputMode.undo()
      onGraphModified()
      evt.handled = true
    },
    (evt) => {
      evt.canExecute = graphComponent.graph.undoEngine?.canUndo() ?? false
    }
  )

  inputMode.keyboardInputMode.addCommandBinding(
    Command.REDO,
    (evt) => {
      inputMode.redo()
      onGraphModified()
      evt.handled = true
    },
    (evt) => {
      evt.canExecute = graphComponent.graph.undoEngine?.canRedo() ?? false
    }
  )

  inputMode.keyboardInputMode.addCommandBinding(
    Command.CUT,
    (evt) => {
      inputMode.cut()
      onGraphModified()
      evt.handled = true
    },
    (evt) => {
      const clipboard = graphComponent.clipboard
      evt.canExecute =
        clipboard !== null &&
        clipboard.copyItems !== GraphItemTypes.NONE &&
        inputMode.allowClipboardOperations &&
        graphComponent.selection.size > 0 &&
        (GraphItemTypes.getItemTypes(graphComponent.selection) & inputMode.deletableItems) !== 0
    }
  )
  inputMode.keyboardInputMode.addCommandBinding(
    Command.PASTE,
    (evt) => {
      inputMode.paste()
      onGraphModified()
      evt.handled = true
    },
    (evt) => {
      const clipboard = graphComponent.clipboard
      evt.canExecute =
        clipboard !== null && inputMode.allowClipboardOperations && !clipboard.isEmpty
    }
  )

  return inputMode
}

/**
 * Creates a GraphMLIOHandler with event handlers for dynamic parsing of custom data and for connecting the GraphML
 * editor to write and parse events.
 */
function createGraphMLIOHandler(): GraphMLIOHandler {
  // Register a preconfigured GraphMLIOHandler that supports different styles created by our basic demos
  const ioHandler = createConfiguredGraphMLIOHandler()

  // Enable parsing/writing of arbitrary custom data
  ioHandler.addEventListener('query-input-handlers', (evt) => {
    queryInputHandlers(evt)
  })
  ioHandler.addEventListener('query-output-handlers', (evt) => {
    queryOutputHandlers(evt)
  })

  ioHandler.serializationPropertyOverrides.set(
    SerializationProperties.GRAPH_ELEMENT_IDS,
    editorSync.itemToIdMap
  )
  ioHandler.deserializationPropertyOverrides.set(
    SerializationProperties.GRAPH_ELEMENT_IDS,
    editorSync.itemToIdMap
  )
  // Hook the EditorSync instance to the GraphML parsing and writing events
  ioHandler.addEventListener('parsed', (evt) => {
    editorSync.onParsed(evt)
  })

  ioHandler.addEventListener('parsing', () => {
    propertiesPanel.clear()
  })
  ioHandler.addEventListener('parsed', () => {
    propertiesPanel.showGraphProperties()
  })

  return ioHandler
}

/**
 * Connects editor events to the view, and view events to the editor.
 */
function initializeEditorSynchronization(): void {
  editorSync.initialize(foldingView.manager.masterGraph)
  // Update the view when the editor's selection or content changes
  editorSync.setItemSelectedListener((evt) => {
    onEditorItemSelected(evt.item)
  })
  editorSync.addEditorContentChangedListener(async (evt) => {
    await onEditorContentChanged(evt.value)
  })

  // update the editor selection when the view's selection state changes
  const selection = graphComponent.selection
  selection.addEventListener('item-added', (evt) => {
    const masterItem = getMasterItem(evt.item)
    if (masterItem) {
      editorSync.onItemSelected(masterItem)
    }
  })

  selection.addEventListener('item-removed', (evt) => {
    const masterItem = getMasterItem(evt.item)
    if (masterItem) {
      editorSync.onItemDeselected(masterItem)
    }
  })
}

/**
 * The GraphML editor's content has been modified: try to parse the new GraphML data and update the view if
 * successful.
 * @param value The new editor content.
 */
async function onEditorContentChanged(value: string) {
  graphComponent.selection.clear()
  try {
    await graphMLIOHandler.readFromGraphMLText(graphComponent.graph, value)
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
  if (viewItem !== null && !selection.includes(viewItem)) {
    selection.clear()
    selection.add(viewItem)
  }
}

/**
 * When the user interactively modifies the graph structure, the GraphML editor should be updated to show the new
 * serialization.
 */
function initGraphModificationEvents(): void {
  const mode = graphComponent.inputMode as GraphEditorInputMode
  mode.addEventListener('node-created', (args) => {
    setItemId(args.item, 'n')
    onGraphModified()
  })
  mode.addEventListener('deleted-item', () => onGraphModified())
  mode.addEventListener('edge-ports-changed', () => onGraphModified())
  mode.addEventListener('label-added', () => onGraphModified())
  mode.editLabelInputMode.addEventListener('label-edited', () => onGraphModified())
  mode.createBendInputMode.addEventListener('bend-created', () => onGraphModified())
  mode.createEdgeInputMode.addEventListener('edge-created', (args) => {
    setItemId(args.item, 'e')
    onGraphModified()
  })
  mode.moveSelectedItemsInputMode.addEventListener('drag-finished', (_evt, inputMode) =>
    onGraphModified(inputMode)
  )
  mode.moveUnselectedItemsInputMode.addEventListener('drag-finished', (_evt, inputMode) =>
    onGraphModified(inputMode)
  )
  mode.handleInputMode.addEventListener('drag-finished', () => onGraphModified())
  mode.addEventListener('node-reparented', () => onGraphModified())
  mode.navigationInputMode.addEventListener('group-collapsed', () => onGraphModified())
  mode.navigationInputMode.addEventListener('group-expanded', () => onGraphModified())
}

/**
 * Generates the GraphML ID for the given node or edge and stores the generated ID in
 * {@link EditorSync}'s {@link EditorSync#itemToIdMap}.
 */
function setItemId(viewItem: INode | IEdge, prefix: 'n' | 'e'): void {
  const masterItem = getMasterItem(viewItem)
  if (masterItem) {
    const id = `${prefix}_${(Math.random() * 0x7fffffff) | 0}`
    editorSync.itemToIdMap.set(masterItem, id)
  }
}

/**
 * The user has modified the graph: trigger synchronization of the GraphML editor.
 */
function onGraphModified(inputMode?: MoveInputMode): void {
  let graphChanged = true

  // Use a timeout, so we don't synchronize too often (e.g., for each node move event)
  setTimeout(async () => {
    if (graphChanged) {
      graphChanged = false

      const str = await graphMLIOHandler.write(graphComponent.graph)
      let selectedMasterItem: IModelItem | null = null
      if (graphComponent.selection.size > 0) {
        selectedMasterItem = getMasterItem(graphComponent.selection.first())
      } else if (inputMode && inputMode.affectedItems?.size > 0) {
        selectedMasterItem = getMasterItem(inputMode.affectedItems.first()!)
      }
      if (graphModifiedListener) {
        graphModifiedListener({ graphml: str, selectedItem: selectedMasterItem })
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
    const keyScope = parse<KeyScope>(KeyScope, keyScopeString)
    // parse the type attribute
    const type = typeString !== null ? parse<KeyType>(KeyType, typeString) : KeyType.COMPLEX

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

function parse<T>(type: any, value: string): T {
  return type.from(value) as T
}

/**
 * Called before serializing the graph.
 * This method takes care that the item and graph properties in the properties panel are
 * written back to GraphML. For this purpose, it adds an output handler for each property.
 */
function queryOutputHandlers(args: QueryOutputHandlersEventArgs): void {
  propertiesPanel.properties.forEach((property) => {
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
  void graphComponent.fitGraphBounds()
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

  await graphMLIOHandler.readFromURL(graph, 'resources/sample-graph.graphml')
  // when done - fit the bounds
  await graphComponent.fitGraphBounds()
  // reconnect editor synchronization
  graphModifiedListener = editorSync.onGraphModified.bind(editorSync)
  // Trigger synchronization of the GraphML editor
  const str = await graphMLIOHandler.write(graphComponent.graph)
  graphModifiedListener({ graphml: str, selectedItem: null })
}

/**
 * Called when the open command executed is executed and applies a layout after loading the graph.
 */
async function onOpenCommandExecuted(): Promise<void> {
  // Temporarily disconnect editor synchronization, so the graph isn't
  // serialized repeatedly while loading.
  graphModifiedListener = () => {}
  await openGraphML(graphComponent, graphMLIOHandler)
  await graphComponent.fitGraphBounds()
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
 * Registers JavaScript commands for various GUI elements.
 */
function initializeUI(): void {
  document
    .querySelector<HTMLButtonElement>('button[data-command="NEW"]')!
    .addEventListener('click', () => clearGraph())
  const openButton = document.querySelector<HTMLInputElement>('#open-file-button')!!
  openButton.addEventListener('click', () => onOpenCommandExecuted())
  // prevent auto-registering the OPEN command by finishLoading
  openButton.setAttribute('data-command-registered', 'true')
  const saveButton = document.querySelector<HTMLInputElement>('#save-button')!
  saveButton.addEventListener('click', async () => {
    await saveGraphML(graphComponent, 'unnamed.graphml', graphMLIOHandler)
  })
  // prevent auto-registering the SAVE command by finishLoading
  saveButton.setAttribute('data-command-registered', 'true')
}

run().then(finishLoading)
