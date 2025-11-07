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
  BaseClass,
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  IGroupPaddingProvider,
  IHitTestable,
  IHitTester,
  Insets,
  InteriorNodeLabelModel,
  LabelStyle,
  License,
  Rect,
  ShowPortCandidates,
  Size
} from '@yfiles/yfiles'

import { colorSets, createDemoEdgeStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

let graphComponent

let moveUnselectedItemsInputMode

const moveModeSelect = document.querySelector('#move-modes')
const moveEnabledButton = document.querySelector('#toggle-move-enabled')
const moveEnabledLabel = document.querySelector('label[for="toggle-move-enabled"]')
const edgeCreationModeSelect = document.querySelector('#edge-creation-modes')
const classicModeButton = document.querySelector('#toggle-classic-mode')

async function run() {
  License.value = licenseData
  // initialize the GraphComponent
  initializeGraph()

  initializeInputModes()

  initializeUI()

  // pre-select the 'Drag at Top' mode
  moveModeSelect.value = 'Drag at Top'
  onMoveModeChanged()
}

/**
 * Initializes the graph instance setting default styles and creating a small sample graph.
 */
function initializeGraph() {
  graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // set the default node style
  graph.nodeDefaults.style = new GroupNodeStyle({
    tabFill: colorSets['demo-orange'].fill,
    contentAreaPadding: Insets.EMPTY
  })
  graph.nodeDefaults.size = new Size(60, 80)
  graph.nodeDefaults.labels.layoutParameter = InteriorNodeLabelModel.TOP
  graph.nodeDefaults.labels.style = new LabelStyle({ textFill: 'white' })

  graph.edgeDefaults.style = createDemoEdgeStyle()

  // Create a sample node
  graph.addLabel(graph.createNode(), 'Node')

  void graphComponent.fitGraphBounds()
}

/**
 * Creates and registers the input modes.
 */
function initializeInputModes() {
  const graphEditorInputMode = new GraphEditorInputMode()

  // Always add a label to the newly created nodes
  graphEditorInputMode.nodeCreator = (_context, graph, location) => {
    const node = graph.createNodeAt(location)
    graph.addLabel(node, 'Node')
    return node
  }

  // Enable the MoveUnselectedInputMode
  moveUnselectedItemsInputMode = graphEditorInputMode.moveUnselectedItemsInputMode
  moveUnselectedItemsInputMode.enabled = true
  // The recognizers should behave differently, depending on what mode is selected in the demo
  const originalBeginRecognizer = moveUnselectedItemsInputMode.beginRecognizer
  moveUnselectedItemsInputMode.beginRecognizer = (evt, eventSource) =>
    originalBeginRecognizer(evt, eventSource) && isRecognized(evt, eventSource)
  const originalHoverRecognizer = moveUnselectedItemsInputMode.hoverRecognizer
  moveUnselectedItemsInputMode.hoverRecognizer = (evt, eventSource) =>
    originalHoverRecognizer(evt, eventSource) && isRecognized(evt, eventSource)

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Called when the mode combo box has changed:
 * if necessary, it changes the hit testable for the move input mode
 */
function onMoveModeChanged() {
  const selectedIndex = moveModeSelect.selectedIndex
  const geim = graphComponent.inputMode
  if (selectedIndex === 2) {
    // mode 2 (only top region): set a custom hit-testable which detects hits only at the top of
    // the nodes
    moveUnselectedItemsInputMode.hitTestable = new TopPaddingHitTestable(
      moveUnselectedItemsInputMode.hitTestable
    )
  } else if (moveUnselectedItemsInputMode.hitTestable instanceof TopPaddingHitTestable) {
    // all other modes: if a TopPaddingHitTestable is the current hit-testable, restore the original
    // hit testable
    moveUnselectedItemsInputMode.hitTestable = moveUnselectedItemsInputMode.hitTestable.original
  }
  // mode 1 (Shift Not Pressed): disable directional constraints (which is bound to Shift too)
  if (selectedIndex === 1) {
    geim.createEdgeInputMode.directionalConstraintRecognizer = EventRecognizers.NEVER
  } else {
    geim.createEdgeInputMode.directionalConstraintRecognizer = EventRecognizers.SHIFT_IS_DOWN
  }
  const showMoveEnabledButton = selectedIndex === 3
  moveEnabledButton.style.display = showMoveEnabledButton ? 'inline-block' : 'none'
  moveEnabledLabel.style.display = showMoveEnabledButton ? 'inline-block' : 'none'
  onEdgeCreationModeChanged()
}

/**
 * Called when the edge creation mode combo box has changed:
 * Adjusts the edge creation behavior.
 */
function onEdgeCreationModeChanged() {
  const selectedIndex = edgeCreationModeSelect.selectedIndex
  const geim = graphComponent.inputMode
  if (selectedIndex === 0) {
    geim.moveUnselectedItemsInputMode.priority = 41
    geim.moveSelectedItemsInputMode.priority = 40
    geim.createEdgeInputMode.startOverCandidateOnly = false
  } else if (selectedIndex === 1) {
    geim.moveUnselectedItemsInputMode.priority = 47
    geim.moveSelectedItemsInputMode.priority = 46
    geim.createEdgeInputMode.startOverCandidateOnly = true
  }
  if (selectedIndex === 0 || moveModeSelect.selectedIndex === 0) {
    geim.createEdgeInputMode.showPortCandidates = ShowPortCandidates.END
  } else {
    geim.createEdgeInputMode.showPortCandidates = ShowPortCandidates.ALL
  }
}

/**
 * A custom EventRecognizer to be used as modifier recognizer.
 *
 * Has to return true if the move input mode is allowed to move a node.
 */
function isRecognized(evt, source) {
  // return the value according to the Mode combo box
  switch (moveModeSelect.selectedIndex) {
    case 0: // always
    case 2: // on top (this is handled by custom IHitTestable)
      // the same as only enabling the MoveUnselectedInputMode without changing the recognizers
      return true
    case 1: // shift is not pressed
      return !EventRecognizers.SHIFT_IS_DOWN(evt, source)
    case 3: // if enabled
      return moveEnabledButton.checked
    default:
      return false
  }
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  moveModeSelect.addEventListener('change', onMoveModeChanged)
  edgeCreationModeSelect.addEventListener('change', onEdgeCreationModeChanged)

  classicModeButton.addEventListener('click', () => {
    const mode = graphComponent.inputMode.moveSelectedItemsInputMode
    mode.enabled = !mode.enabled
  })
}

/**
 * An IHitTestable implementation which detects hits only on top padding of a node.
 *
 * This instance keeps a reference to the original hit testable,
 * so the original behavior can be restored conveniently.
 */
class TopPaddingHitTestable extends BaseClass(IHitTestable) {
  /**
   * Creates a new instance of {@link TopPaddingHitTestable}.
   */
  constructor(original) {
    super()
    this.original = original
  }

  /**
   * Gets the original hit testable.
   */
  original

  /**
   * Test whether the given location is a valid hit.
   *
   * The hit is considered as valid if the location lies inside a node's top padding.
   * @param context - The current input mode context.
   * @param location - The location to test.
   */
  isHit(context, location) {
    // get an enumerator over all elements at the given location
    const enumerator = context.lookup(IHitTester)
    if (enumerator != null) {
      const hits = enumerator.enumerateHits(context, location, GraphItemTypes.NODE)
      return hits.some((node) => {
        // determine whether the given location lies inside the top padding
        const padding = node.lookup(IGroupPaddingProvider)?.getPadding()
        return (
          padding != null &&
          new Rect(node.layout.x, node.layout.y, node.layout.width, padding.top).contains(location)
        )
      })
    }
    // no hits found: return false
    return false
  }
}

run().then(finishLoading)
