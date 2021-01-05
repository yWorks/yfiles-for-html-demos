/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IGraph,
  IModelItem,
  License,
  Rect
} from 'yfiles'

import { bindAction, showApp } from '../../resources/demo-app.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import loadJson from '../../resources/load-json.js'
let commandBindings = []

/**
 * The previously set multiselection recognizer
 */
let oldMultiSelectionRecognizer = null

let singleSelectionEnabled = false

/**
 * Changes the selection mode.
 * @param {GraphComponent} graphComponent
 */
function toggleSingleSelection(graphComponent) {
  const toggleSelection = document.querySelector('#toggleSingleSelection')
  singleSelectionEnabled = toggleSelection.checked

  const mode = graphComponent.inputMode
  if (singleSelectionEnabled) {
    // remember old recognizer so we can restore it later
    oldMultiSelectionRecognizer = mode.multiSelectionRecognizer

    // disable marquee selection
    mode.marqueeSelectionInputMode.enabled = false
    // disable multi selection with Ctrl-Click
    mode.multiSelectionRecognizer = EventRecognizers.NEVER

    // deactivate commands that can lead to multi selection
    mode.availableCommands.remove(ICommand.TOGGLE_ITEM_SELECTION)
    mode.availableCommands.remove(ICommand.SELECT_ALL)

    mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_LEFT)
    mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_UP)
    mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_DOWN)
    mode.navigationInputMode.availableCommands.remove(ICommand.EXTEND_SELECTION_RIGHT)

    // add dummy command bindings that do nothing in order to prevent default behavior
    commandBindings.push(mode.keyboardInputMode.addCommandBinding(ICommand.EXTEND_SELECTION_LEFT))
    commandBindings.push(mode.keyboardInputMode.addCommandBinding(ICommand.EXTEND_SELECTION_UP))
    commandBindings.push(mode.keyboardInputMode.addCommandBinding(ICommand.EXTEND_SELECTION_DOWN))
    commandBindings.push(mode.keyboardInputMode.addCommandBinding(ICommand.EXTEND_SELECTION_RIGHT))

    // add custom binding for toggle item selection
    commandBindings.push(
      mode.keyboardInputMode.addCommandBinding(
        ICommand.TOGGLE_ITEM_SELECTION,
        (command, parameter, source) => toggleItemSelectionExecuted(graphComponent, parameter),
        (command, parameter, source) => toggleItemSelectionCanExecute(graphComponent, parameter)
      )
    )
    // Also clear the selection - even though the setup works when more than one item is selected, it looks a bit
    // strange
    graphComponent.selection.clear()
  } else {
    // restore old settings
    mode.marqueeSelectionInputMode.enabled = true
    mode.multiSelectionRecognizer = oldMultiSelectionRecognizer

    // re-activate commands
    mode.availableCommands.add(ICommand.TOGGLE_ITEM_SELECTION)
    mode.availableCommands.add(ICommand.SELECT_ALL)

    mode.navigationInputMode.availableCommands.add(ICommand.EXTEND_SELECTION_LEFT)
    mode.navigationInputMode.availableCommands.add(ICommand.EXTEND_SELECTION_UP)
    mode.navigationInputMode.availableCommands.add(ICommand.EXTEND_SELECTION_DOWN)
    mode.navigationInputMode.availableCommands.add(ICommand.EXTEND_SELECTION_RIGHT)

    // remove the previously registered command bindings
    for (let i = 0; i < commandBindings.length; i++) {
      commandBindings[i].remove()
    }
    commandBindings = []
  }
}

/**
 * Checks if toggling the selection state of an item respecting the single selection policy is allowed
 * @param {GraphComponent} graphComponent The given graphComponent
 * @param {Object} parameter The given parameter
 */
function toggleItemSelectionCanExecute(graphComponent, parameter) {
  // if we have an item, the command can be executed
  const modelItem = IModelItem.isInstance(parameter) ? parameter : graphComponent.currentItem
  return modelItem !== null
}

/**
 * Custom command handler that allows toggling the selection state of an item
 * respecting the single selection policy.
 * @param {GraphComponent} graphComponent The given graphComponent
 * @param {Object} parameter The given parameter
 */
function toggleItemSelectionExecuted(graphComponent, parameter) {
  // get the item
  const modelItem = IModelItem.isInstance(parameter) ? parameter : graphComponent.currentItem
  const inputMode = graphComponent.inputMode

  // check if it allowed to be selected
  if (
    modelItem === null ||
    !graphComponent.graph.contains(modelItem) ||
    !GraphItemTypes.itemIsOfTypes(inputMode.selectableItems, modelItem)
  ) {
    return
  }

  const isSelected = inputMode.graphSelection.isSelected(modelItem)
  if (isSelected) {
    // the item is selected and needs to be unselected - just clear the selection
    inputMode.graphSelection.clear()
  } else {
    // the items is unselected - unselect all other items and select the currentItem
    inputMode.graphSelection.clear()
    inputMode.setSelected(modelItem, true)
  }
}

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  graphComponent.inputMode = new GraphEditorInputMode()

  // enable the undo feature
  graph.undoEngineEnabled = true
  // Initialize the default style of the nodes and edges
  initDemoStyles(graph)

  createSampleGraph(graph)
  graphComponent.fitGraphBounds()

  // wire up the UI
  bindAction("input[data-command='ToggleSingleSelection']", () =>
    toggleSingleSelection(graphComponent)
  )

  toggleSingleSelection(graphComponent)

  showApp(graphComponent)
}

/**
 * @type {number[]}
 */
const sampleX = [317, 291, 220, 246, 221, 150, 142, 213, 232, 71, 0]

/**
 * @type {number[]}
 */
const sampleY = [87, 2, 0, 73, 144, 180, 251, 286, 215, 285, 320]

/**
 * Creates the sample graph.
 * @param {IGraph} graph
 */
function createSampleGraph(graph) {
  graph.clear()
  const nodes = new Array(sampleX.length)
  for (let i = 0; i < nodes.length; i++) {
    nodes[i] = graph.createNode(new Rect(sampleX[i], sampleY[i], 30, 30))
  }

  graph.createEdge(nodes[2], nodes[1])
  graph.createEdge(nodes[1], nodes[0])
  graph.createEdge(nodes[0], nodes[3])
  graph.createEdge(nodes[3], nodes[2])
  graph.createEdge(nodes[3], nodes[1])
  graph.createEdge(nodes[4], nodes[3])
  graph.createEdge(nodes[4], nodes[5])
  graph.createEdge(nodes[8], nodes[4])
  graph.createEdge(nodes[7], nodes[8])
  graph.createEdge(nodes[7], nodes[6])
  graph.createEdge(nodes[6], nodes[5])
  graph.createEdge(nodes[6], nodes[9])
  graph.createEdge(nodes[9], nodes[10])

  // reset undo after initial graph loading
  graph.undoEngine.clear()
}

loadJson().then(run)
