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
  ExteriorNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  INode,
  License,
  NinePositionsEdgeLabelModel,
  Point,
  Size
} from '@yfiles/yfiles'

import { svg } from 'lit-html'

import { createNodeBusinessData, getCommonName } from './BusinessDataHandling'
import { TaggedNodeClipboardHelper } from './ClipboardHelper'
import { createDemoEdgeStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { bindYFilesCommand, finishLoading } from '@yfiles/demo-app/demo-page'
import { LitNodeStyle } from '@yfiles/demo-utils/LitNodeStyle'

let graphComponent
let graphComponent2

async function run() {
  License.value = licenseData

  // initialize the GraphComponents
  graphComponent = new GraphComponent('graphComponent')
  graphComponent2 = new GraphComponent('clipboard-graph-component')
  // both components share the clipboard
  graphComponent2.clipboard = graphComponent.clipboard

  // initializes the graph
  initializeGraphStyling()

  // Create nodes and an edge.
  createSampleGraph(graphComponent.graph)
  void graphComponent.fitGraphBounds()
  graphComponent2.zoomTo(graphComponent.zoom, graphComponent.center)

  // Enable the Undo functionality.
  graphComponent.graph.undoEngineEnabled = true
  graphComponent2.graph.undoEngineEnabled = true

  // creates the input modes
  graphComponent.inputMode = createInputMode()
  graphComponent2.inputMode = createInputMode()

  // wires up the UI
  initializeUI()

  // sets the focus to the left GraphComponent
  graphComponent.focus()
}

/**
 * Initializes the two graphs.
 */
function initializeGraphStyling() {
  // Initialize the left graph
  const graph = graphComponent.graph

  // Create a function that converts the node width
  // into a "translate" expression that horizontally centers the transformed element
  function centerTransform(width, verticalOffset) {
    // place in horizontal center
    return `translate(${width * 0.5} ${verticalOffset ?? 0})`
  }

  // Set the default style for new nodes and edges
  graph.nodeDefaults.style = new LitNodeStyle(
    ({ layout, tag }) => svg`<g>
      <rect stroke-width="1.5" stroke="#617984" fill="#C1E1F1" rx="4" ry="4"
          width=${layout.width} height=${layout.height}/>
      <text transform=${centerTransform(layout.width, 15)}
          text-anchor="middle" style="font-size:120%; fill:#000" dy="0.5em">${tag.name}</text>
    </g>
  `
  )
  graph.nodeDefaults.size = new Size(120, 60)

  graph.edgeDefaults.style = createDemoEdgeStyle({ colorSetName: 'demo-palette-31' })

  // Set the default locations for new labels
  graph.nodeDefaults.labels.layoutParameter = ExteriorNodeLabelModel.TOP
  graph.edgeDefaults.labels.layoutParameter = NinePositionsEdgeLabelModel.CENTER_ABOVE

  graph.decorator.nodes.clipboardHelper.addConstant(new TaggedNodeClipboardHelper())

  // Initialize the right graph
  const graph2 = graphComponent2.graph
  graph2.nodeDefaults = graph.nodeDefaults
  graph2.edgeDefaults = graph.edgeDefaults

  graph.decorator.nodes.focusRenderer.hide()
  graph2.decorator.nodes.focusRenderer.hide()

  graph2.decorator.nodes.clipboardHelper.addConstant(new TaggedNodeClipboardHelper())
}

/**
 * Creates the GraphEditorInputMode for this demo.
 */
function createInputMode() {
  const inputMode = new GraphEditorInputMode({
    // For each new node, create a node label and a business object automatically
    nodeCreator: (_context, graph, location) => {
      const node = graph.createNodeAt(location)
      node.tag = createNodeBusinessData()
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
function initializeUI() {
  function enablePasteSpecialButton() {
    document.querySelector('#paste-special').disabled = false
    document.querySelector('#paste-special2').disabled = false
  }

  function registerEditNameEnabledListeners(inputMode, buttonSelector) {
    inputMode.addEventListener('multi-selection-finished', (evt) => {
      document.querySelector(buttonSelector).disabled = evt.selection.size === 0
    })

    inputMode.addEventListener('deleted-selection', () => {
      document.querySelector(buttonSelector).disabled = true
    })
  }

  // Left GraphComponent
  document
    .getElementById('paste-special')
    .addEventListener('click', () => onPasteSpecialCommand(graphComponent))
  document
    .getElementById('edit-name')
    .addEventListener('click', () => onEditNameCommand(graphComponent, 'left'))

  graphComponent.clipboard.addEventListener('items-copied', enablePasteSpecialButton)
  graphComponent.clipboard.addEventListener('items-cut', enablePasteSpecialButton)
  registerEditNameEnabledListeners(graphComponent.inputMode, '#edit-name')

  // Right GraphComponent
  bindYFilesCommand(
    "button[data-command='ZoomIn2']",
    Command.INCREASE_ZOOM,
    graphComponent2,
    null,
    'Increase zoom'
  )
  bindYFilesCommand(
    "button[data-command='ZoomOut2']",
    Command.DECREASE_ZOOM,
    graphComponent2,
    null,
    'Decrease zoom'
  )

  document
    .querySelector("button[data-command='FitContent2']")
    .addEventListener('click', () => graphComponent.fitGraphBounds())

  bindYFilesCommand(
    "button[data-command='ZoomOriginal2']",
    Command.ZOOM,
    graphComponent2,
    1.0,
    'Zoom to original size'
  )

  const undoEngine = graphComponent2.graph.undoEngine
  const undo2Button = document.querySelector("button[data-command='Undo2']")
  undo2Button.addEventListener('click', () => {
    if (undoEngine.canUndo()) {
      undoEngine.undo()
    }
  })

  const redo2Button = document.querySelector("button[data-command='Redo2']")
  redo2Button.addEventListener('click', () => {
    if (undoEngine.canRedo()) {
      undoEngine.redo()
    }
  })

  // add a listener to the undoEngine to enable/disable the buttons
  undoEngine.addEventListener('property-changed', () => {
    undo2Button.disabled = !undoEngine.canUndo()
    redo2Button.disabled = !undoEngine.canRedo()
  })

  const inputMode = graphComponent2.inputMode
  document
    .querySelector("button[data-command='Cut2']")
    .addEventListener('click', () => inputMode.cut())
  document
    .querySelector("button[data-command='Copy2']")
    .addEventListener('click', () => inputMode.copy())
  document
    .querySelector("button[data-command='Paste2']")
    .addEventListener('click', () => inputMode.paste())
  document
    .querySelector("button[data-command='Delete2']")
    .addEventListener('click', () => inputMode.deleteSelection())
  document
    .querySelector('#paste-special2')
    .addEventListener('click', () => onPasteSpecialCommand(graphComponent2))
  document
    .querySelector('#edit-name2')
    .addEventListener('click', () => onEditNameCommand(graphComponent2, 'right'))

  registerEditNameEnabledListeners(graphComponent2.inputMode, '#edit-name2')
}

/**
 * Executes paste special command.
 * @param component The graphComponent to apply the command to.
 */
function onPasteSpecialCommand(component) {
  const clipboard = component.clipboard
  component.selection.clear()

  // This is the filter for the Paste call.
  const clipboardGraph = clipboard.clipboardGraph
  const itemsToPaste = [...clipboardGraph.nodes, ...clipboardGraph.labels]
  // This callback is executed for every pasted element. We use it to select the pasted nodes.
  const pasted = (_originalItem, pastedItem) => {
    if (pastedItem instanceof INode) {
      component.selection.add(pastedItem)
    }
  }
  clipboard.paste(component.graph, itemsToPaste, pasted)

  // Set the different paste delta.
  clipboard.pasteOffset = new Point(clipboard.pasteOffset.x + 30, clipboard.pasteOffset.y + 30)
}

/**
 * Shows a dialog for editing the node name.
 * @param component The graphComponent to apply the command to.
 * @param elementID The id of the element that shows the dialog.
 */
function onEditNameCommand(component, elementID) {
  const nameDialog = document.querySelector('#name-dialog')
  const nodeNameInput = nameDialog.querySelector('#node-name-input')
  nodeNameInput.value = getCommonName(component.selection.nodes)

  const applyListener = (evt) => {
    evt.preventDefault()
    nameDialog.style.display = 'none'
    const name = nodeNameInput.value
    component.selection.nodes.forEach((node) => {
      node.tag = { ...node.tag, name }
    })
    component.focus()
    document.querySelector('#apply-button').removeEventListener('click', applyListener)
  }

  document.querySelector('#apply-button').addEventListener('click', applyListener)

  document.querySelector('#cancel-button').addEventListener('click', () => {
    nameDialog.style.display = 'none'
    document.querySelector('#apply-button').removeEventListener('click', applyListener)
  })

  nameDialog.style.display = 'block'
  document.querySelector('#' + elementID)?.appendChild(nameDialog)
  nodeNameInput.focus()
}

/**
 * Creates the sample graph.
 */
function createSampleGraph(graph) {
  const sharedBusinessObject = createNodeBusinessData()

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
  graph.createNodeAt({ location: new Point(100, 200), tag: createNodeBusinessData() })
  graph.addLabel(graph.createEdge(node1, node2), 'Shared Object')
}

run().then(finishLoading)
