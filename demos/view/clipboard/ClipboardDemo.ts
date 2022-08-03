/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  IInputMode,
  ILabel,
  IModelItem,
  INode,
  ISelectionModel,
  License,
  NinePositionsEdgeLabelModel,
  Point,
  Size,
  TemplateNodeStyle,
  YObject
} from 'yfiles'

import { ClipboardBusinessObject, createClipboardBusinessObject } from './ClipboardBusinessObject'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import { TagCopyItem, TaggedNodeClipboardHelper } from './ClipboardHelper'
import { applyDemoTheme, createDemoEdgeStyle } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

// This demo shows different ways of using the class GraphClipboard for Copy and Paste operations.

let graphComponent: GraphComponent

let graphComponent2: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize converters for the node style
  initConverters()

  // initialize the GraphComponents
  graphComponent = new GraphComponent('graphComponent')
  graphComponent2 = new GraphComponent('graphComponent2')
  applyDemoTheme(graphComponent)
  applyDemoTheme(graphComponent2)

  // initializes the graph
  initializeGraph()

  // creates the input modes
  graphComponent.inputMode = createEditorMode()
  graphComponent2.inputMode = createEditorMode()

  // wires up the UI
  registerCommands()

  // sets the focus to the left GraphComponent
  graphComponent.focus()

  showApp(graphComponent)
}

/**
 * Initializes the two graphs.
 */
function initializeGraph(): void {
  // Initialize the left graph
  const graph = graphComponent.graph
  // Enable the Undo functionality.
  graph.undoEngineEnabled = true
  graph.nodeDefaults.size = new Size(120, 60)

  // Set the default style for new nodes and edges
  graph.nodeDefaults.style = new TemplateNodeStyle('ClipboardStyle')
  graph.edgeDefaults.style = createDemoEdgeStyle({ colorSetName: 'demo-palette-31' })

  // Set the default locations for new labels
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.NORTH
  graph.edgeDefaults.labels.layoutParameter = NinePositionsEdgeLabelModel.CENTER_ABOVE

  // Create nodes and an edge.
  createSampleGraph(graph)
  graphComponent.fitGraphBounds()

  graph.decorator.nodeDecorator.clipboardHelperDecorator.setImplementation(
    new TaggedNodeClipboardHelper()
  )
  graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()

  // Register specialized copiers that can deal with our business objects
  graphComponent.clipboard.fromClipboardCopier.addNodeCopiedListener((sender, evt) => {
    evt.copy.tag = nodeCopiedOnPaste(evt.original)
  })
  graphComponent.clipboard.toClipboardCopier.addNodeCopiedListener((sender, evt) => {
    evt.copy.tag = nodeCopiedOnCopy(evt.original)
  })

  // Initialize the right graph
  const graph2 = graphComponent2.graph
  // Enable the Undo functionality.
  graph2.undoEngineEnabled = true
  graph2.nodeDefaults = graph.nodeDefaults
  graph2.edgeDefaults = graph.edgeDefaults

  graph2.decorator.nodeDecorator.clipboardHelperDecorator.setImplementation(
    new TaggedNodeClipboardHelper()
  )
  graph2.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()
  graphComponent2.clipboard = graphComponent.clipboard

  graphComponent2.zoomTo(graphComponent.center, graphComponent.zoom)
}

/**
 * Called when a node is pasted.
 * Either yields a previously cached copy for the given original or uses the copyDelegate to create
 * the copy of the original.
 * @param original The original item
 * @return A copy of the original, either cached, or newly created and then cached
 */
function nodeCopiedOnPaste(original: INode): TagCopyItem {
  return graphComponent.clipboard.fromClipboardCopier.getOrCreateCopy<any>(
    YObject.$class,
    original.tag,
    createBusinessObjectFromTagCopyItem
  )
}

/**
 * Called when a node is copied.
 * Either yields a previously cached copy for the given original or uses the copyDelegate to create
 * the copy of the original.
 * @param original The original item
 * @return A copy of the original, either cached, or newly created and then cached
 */
function nodeCopiedOnCopy(original: INode): TagCopyItem {
  return graphComponent.clipboard.toClipboardCopier.getOrCreateCopy<any>(
    YObject.$class,
    original.tag,
    value => new TagCopyItem(value)
  )
}

/**
 * Creates a business object from the given tag.
 */
function createBusinessObjectFromTagCopyItem(tag: TagCopyItem): ClipboardBusinessObject {
  const copyItem = tag
  copyItem.increasePasteCount()
  const origObject = copyItem.tag
  const name =
    copyItem.pasteCount < 2
      ? `Copy of ${origObject.name}`
      : `Copy (${copyItem.pasteCount}) of ${origObject.name}`

  const newClipboardBusinessObject = new ClipboardBusinessObject(name)
  newClipboardBusinessObject.name = name
  return newClipboardBusinessObject
}

/**
 * Creates the GraphEditorInputMode for this demo.
 */
function createEditorMode(): IInputMode {
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    // For each new node, create a node label and a business object automatically
    nodeCreator: (context, graph, location) => {
      const node = graph.createNodeAt(location)
      node.tag = createClipboardBusinessObject()
      graph.addLabel(node, `Label ${graph.nodes.size.toString()}`)
      return node
    },
    // Enable clipboard operations (basically the key bindings/commands)
    allowClipboardOperations: true
  })

  // Discard the first click after getting the focus
  // to prevent node creation when switching between the GraphComponents
  inputMode.clickInputMode.swallowFocusClick = true
  return inputMode
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  function enablePasteSpecialButton(): void {
    ;(document.querySelector("button[data-command='PasteSpecial']") as HTMLButtonElement).disabled =
      false
    ;(
      document.querySelector("button[data-command='PasteSpecial2']") as HTMLButtonElement
    ).disabled = false
  }

  function registerEditNameEnabledListeners(
    inputMode: GraphEditorInputMode,
    buttonCommand: string
  ) {
    inputMode.addMultiSelectionFinishedListener((sender, evt) => {
      const button = document.querySelector(
        `button[data-command='${buttonCommand}']`
      ) as HTMLButtonElement
      button.disabled = evt.selection.size === 0
    })

    inputMode.addDeletedSelectionListener(() => {
      const button = document.querySelector(
        `button[data-command='${buttonCommand}']`
      ) as HTMLButtonElement
      button.disabled = true
    })
  }

  // Left GraphComponent
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

  bindAction("button[data-command='PasteSpecial']", (): void =>
    onPasteSpecialCommand(graphComponent)
  )
  bindAction("button[data-command='EditName']", (): void =>
    onEditNameCommand(graphComponent, 'left')
  )

  graphComponent.clipboard.addElementsCopiedListener(enablePasteSpecialButton)
  graphComponent.clipboard.addElementsCutListener(enablePasteSpecialButton)
  registerEditNameEnabledListeners(graphComponent.inputMode as GraphEditorInputMode, 'EditName')

  // Right GraphComponent
  bindCommand("button[data-command='ZoomIn2']", ICommand.INCREASE_ZOOM, graphComponent2)
  bindCommand("button[data-command='ZoomOut2']", ICommand.DECREASE_ZOOM, graphComponent2)
  bindCommand("button[data-command='FitContent2']", ICommand.FIT_GRAPH_BOUNDS, graphComponent2)
  bindCommand("button[data-command='ZoomOriginal2']", ICommand.ZOOM, graphComponent2, 1.0)

  bindCommand("button[data-command='Undo2']", ICommand.UNDO, graphComponent2)
  bindCommand("button[data-command='Redo2']", ICommand.REDO, graphComponent2)

  bindCommand("button[data-command='Cut2']", ICommand.CUT, graphComponent2)
  bindCommand("button[data-command='Copy2']", ICommand.COPY, graphComponent2)
  bindCommand("button[data-command='Paste2']", ICommand.PASTE, graphComponent2)
  bindCommand("button[data-command='Delete2']", ICommand.DELETE, graphComponent2)

  bindAction("button[data-command='PasteSpecial2']", () => onPasteSpecialCommand(graphComponent2))
  bindAction("button[data-command='EditName2']", () => onEditNameCommand(graphComponent2, 'right'))

  graphComponent2.clipboard.addElementsCopiedListener(enablePasteSpecialButton)
  graphComponent2.clipboard.addElementsCutListener(enablePasteSpecialButton)
  registerEditNameEnabledListeners(graphComponent2.inputMode as GraphEditorInputMode, 'EditName2')
}

/**
 * Executes paste special command.
 * @param component The graphComponent to apply the command to.
 */
function onPasteSpecialCommand(component: GraphComponent): void {
  const clipboard = component.clipboard
  component.selection.clear()

  // This is the filter for the Paste call.
  const filter = (item: IModelItem): boolean => item instanceof INode || item instanceof ILabel
  // This callback is executed for every pasted element. We use it to select the pasted nodes.
  const pasted = (originalItem: IModelItem, pastedItem: IModelItem) => {
    if (pastedItem instanceof INode) {
      component.selection.setSelected(pastedItem, true)
    }
  }
  clipboard.paste(component.graph, filter, pasted)

  // Set the different paste delta.
  clipboard.pasteDelta = new Point(clipboard.pasteDelta.x + 30, clipboard.pasteDelta.y + 30)
}

/**
 * Shows a dialog for editing the node name.
 * @param component The graphComponent to apply the command to.
 * @param elementID The id of the element that shows the dialog.
 */
function onEditNameCommand(component: GraphComponent, elementID: string): void {
  const nameDialog = window.document.getElementById('nameDialog')!
  const nodeNameInput = nameDialog.querySelector('#nodeNameInput') as HTMLInputElement
  nodeNameInput.value = getCommonName(component.selection.selectedNodes)

  bindAction('#applyButton', evt => {
    evt.preventDefault()
    nameDialog.style.display = 'none'
    const name = nodeNameInput.value
    component.selection.selectedNodes.forEach(node => {
      node.tag.name = name
    })
    component.focus()
  })

  bindAction('#cancelButton', () => {
    nameDialog.style.display = 'none'
  })

  nameDialog.style.display = 'block'
  const element = document.getElementById(elementID)
  element?.appendChild(nameDialog)
  nodeNameInput.focus()
}

/**
 * Returns the common name of the selected nodes if such a common name
 * exists, or the empty string otherwise.
 */
function getCommonName(selectedNodes: ISelectionModel<INode>): string {
  if (selectedNodes.size === 0) {
    return ''
  }
  const name = selectedNodes.first().tag.name
  return selectedNodes.some((node: INode): boolean => name !== node.tag.name) ? '' : name
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(graph: IGraph): void {
  const sharedBusinessObject = createClipboardBusinessObject()

  const node1 = graph.createNodeAt({
    location: new Point(100, 100),
    tag: sharedBusinessObject,
    labels: ['Label 1']
  })
  const node2 = graph.createNodeAt({
    location: new Point(350, 100),
    tag: sharedBusinessObject,
    labels: ['Label 2']
  })
  graph.createNodeAt({
    location: new Point(100, 200),
    tag: createClipboardBusinessObject()
  })
  graph.addLabel(graph.createEdge(node1, node2), 'Shared Object')

  graph.undoEngine!.clear()
}

/**
 * Initializes the converters for the node style.
 */
function initConverters(): void {
  // Create a converter function that converts the node width into a translate
  // expression that horizontally centers the transformed element
  TemplateNodeStyle.CONVERTERS.centertransformconverter = (o: number, p: number | null): string => {
    const verticalOffset = p || 0
    // place in horizontal center
    return `translate(${o * 0.5} ${verticalOffset})`
  }
}

// noinspection JSIgnoredPromiseFromCall
run()
