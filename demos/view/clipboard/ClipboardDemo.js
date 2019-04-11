/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ILabel,
  INode,
  ISelectionModel,
  ItemCopiedEventArgs,
  License,
  NinePositionsEdgeLabelModel,
  Point,
  Size,
  TemplateNodeStyle,
  YObject
} from 'yfiles'

import ClipboardBusinessObject from './ClipboardBusinessObject.js'
import { TagCopyItem, TaggedNodeClipboardHelper } from './ClipboardHelper.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

// This demo shows different ways of using the class GraphClipboard for Copy and Paste operations.

/** @type {GraphComponent} */
let graphComponent = null

/** @type {GraphComponent} */
let graphComponent2 = null

function run(licenseData) {
  License.value = licenseData
  // initialize converters for the node style
  initConverters()

  // initialize the GraphComponents
  graphComponent = new GraphComponent('graphComponent')
  graphComponent2 = new GraphComponent('graphComponent2')

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
function initializeGraph() {
  // Initialize the left graph
  const graph = graphComponent.graph
  // Enable the Undo functionality.
  graph.undoEngineEnabled = true
  graph.nodeDefaults.size = new Size(120, 60)

  // Set the default style for new nodes
  graph.nodeDefaults.style = new TemplateNodeStyle('ClipboardStyle')

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
  graphComponent.enabled = true

  // Register specialized copiers that can deal with our business objects
  graphComponent.clipboard.fromClipboardCopier.addNodeCopiedListener(nodeCopiedOnPaste)
  graphComponent.clipboard.toClipboardCopier.addNodeCopiedListener(nodeCopiedOnCopy)

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
 * @param {object} sender The source of the even
 * @param {ItemCopiedEventArgs<INode>} e An object that contains the event data
 */
function nodeCopiedOnPaste(sender, e) {
  e.copy.tag = graphComponent.clipboard.fromClipboardCopier.getOrCreateCopy(
    YObject.$class,
    e.original.tag,
    createBusinessObjectFromTagCopyItem
  )
}

/**
 * Called when a node is copied.
 * @param {object} sender The source of the even
 * @param {ItemCopiedEventArgs<INode>} e An object that contains the event data
 */
function nodeCopiedOnCopy(sender, e) {
  e.copy.tag = graphComponent.clipboard.toClipboardCopier.getOrCreateCopy(
    YObject.$class,
    e.original.tag,
    value => new TagCopyItem(value)
  )
}

/**
 * Creates a business object from the given tag.
 * @param {object} tag
 * @return {Object}
 */
function createBusinessObjectFromTagCopyItem(tag) {
  const copyItem = tag
  copyItem.increasePasteCount()
  const origObject = copyItem.tag
  const name =
    copyItem.pasteCount < 2
      ? `Copy of ${origObject.name}`
      : `Copy (${copyItem.pasteCount}) of ${origObject.name}`

  const newClipboardBusinessObject = new ClipboardBusinessObject()
  newClipboardBusinessObject.name = name
  newClipboardBusinessObject.value = origObject.value
  return newClipboardBusinessObject
}

/**
 * Creates the GraphEditorInputMode for this demo.
 * @return {IInputMode}
 */
function createEditorMode() {
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    // For each new node, create a node label and a business object automatically
    nodeCreator: (context, graph, location) => {
      const node = graph.createNodeAt(location)
      node.tag = ClipboardBusinessObject.create()
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

  bindAction("button[data-command='PasteSpecial']", () => onPasteSpecialCommand(graphComponent))
  bindAction("button[data-command='EditName']", () => onEditNameCommand(graphComponent, 'left'))

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
}

/**
 * Executes paste special command.
 * @param {GraphComponent} component The graphComponent to apply the command to.
 */
function onPasteSpecialCommand(component) {
  const clipboard = component.clipboard
  component.selection.clear()

  // This is the filter for the Paste call.
  const filter = item => INode.isInstance(item) || ILabel.isInstance(item)
  // This callback is executed for every pasted element. We use it to select the pasted nodes.
  const pasted = (originalItem, pastedItem) => {
    if (INode.isInstance(pastedItem)) {
      component.selection.setSelected(pastedItem, true)
    }
  }
  clipboard.paste(component.graph, filter, pasted)

  // Set the different paste delta.
  clipboard.pasteDelta = new Point(clipboard.pasteDelta.x + 30, clipboard.pasteDelta.y + 30)
}

/**
 * Shows a dialog for editing the node name.
 * @param {GraphComponent} component The graphComponent to apply the command to.
 * @param {string} elementID The id of the element that shows the dialog.
 */
function onEditNameCommand(component, elementID) {
  const nameDialog = window.document.getElementById('nameDialog')
  const nodeNameInput = nameDialog.querySelector('#nodeNameInput')
  nodeNameInput.value = getCommonName(component.selection.selectedNodes)

  nameDialog.querySelector('#applyButton').onclick = evt => {
    evt.preventDefault()
    nameDialog.style.display = 'none'
    const name = nodeNameInput.value
    component.selection.selectedNodes.forEach(node => {
      node.tag.name = name
    })
    component.focus()
  }

  nameDialog.querySelector('#cancelButton').onclick = evt => {
    nameDialog.style.display = 'none'
  }

  nameDialog.style.display = 'block'
  document.getElementById(elementID).appendChild(nameDialog)
  nodeNameInput.focus()
}

/**
 * Returns the common name of the selected nodes if such a common name
 * exists, or the empty string otherwise.
 * @param {ISelectionModel<INode>} selectedNodes
 * @return {string}
 */
function getCommonName(selectedNodes) {
  if (selectedNodes.size === 0) {
    return ''
  }
  const name = selectedNodes.first().tag.name
  return selectedNodes.some(node => name !== node.tag.name) ? '' : name
}

/**
 * Creates the sample graph.
 * @param {IGraph} graph
 */
function createSampleGraph(graph) {
  const sharedBusinessObject = ClipboardBusinessObject.create()

  const node1 = graph.createNodeAt({
    location: new Point(100, 100),
    tag: sharedBusinessObject,
    labels: 'Label 1'
  })
  const node2 = graph.createNodeAt({
    location: new Point(350, 100),
    tag: sharedBusinessObject,
    labels: 'Label 2'
  })
  graph.createNodeAt({
    location: new Point(100, 200),
    tag: ClipboardBusinessObject.create()
  })
  graph.addLabel(graph.createEdge(node1, node2), 'Shared Object')

  graph.undoEngine.clear()
}

/**
 * Initializes the converters for the node style.
 */
function initConverters() {
  // Create a converter function that converts the node width into a translate
  // expression that horizontally centers the transformed element
  TemplateNodeStyle.CONVERTERS.centertransformconverter = (o, p) => {
    const verticalOffset = p || 0
    // place in horizontal center
    return `translate(${o * 0.5} ${verticalOffset})`
  }
}

loadJson().then(run)
