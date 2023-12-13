/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
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
  BaseClass,
  DefaultLabelStyle,
  EventArgs,
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  GroupNodeStyle,
  IGraph,
  IHitTestable,
  IInputModeContext,
  INode,
  INodeHitTester,
  INodeInsetsProvider,
  Insets,
  InteriorLabelModel,
  KeyEventRecognizers,
  License,
  MoveInputMode,
  Point,
  Rect,
  ShowPortCandidates,
  Size
} from 'yfiles'

import { applyDemoTheme, colorSets, createDemoEdgeStyle } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent

let moveUnselectedInputMode: MoveInputMode

const moveModeSelect = document.querySelector<HTMLSelectElement>('#move-modes')!
const moveEnabledButton = document.querySelector<HTMLInputElement>('#toggle-move-enabled')!
const moveEnabledLabel = document.querySelector<HTMLElement>('label[for="toggle-move-enabled"]')!
const edgeCreationModeSelect = document.querySelector<HTMLSelectElement>('#edge-creation-modes')!
const classicModeButton = document.querySelector<HTMLInputElement>('#toggle-classic-mode')!

async function run(): Promise<void> {
  License.value = await fetchLicense()
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
function initializeGraph(): void {
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  const graph = graphComponent.graph

  // set the default node style
  graph.nodeDefaults.style = new GroupNodeStyle({
    tabFill: colorSets['demo-orange'].fill,
    contentAreaInsets: Insets.EMPTY
  })
  graph.nodeDefaults.size = new Size(60, 80)
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.NORTH
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({ textFill: 'white' })

  graph.edgeDefaults.style = createDemoEdgeStyle()

  // Create a sample node
  graph.addLabel(graph.createNode(), 'Node')

  graphComponent.fitGraphBounds()
}

/**
 * Creates and registers the input modes.
 */
function initializeInputModes(): void {
  const graphEditorInputMode = new GraphEditorInputMode()

  // Always add a label to the newly created nodes
  graphEditorInputMode.nodeCreator = (
    context: IInputModeContext,
    graph: IGraph,
    location: Point
  ): INode => {
    const node = graph.createNodeAt(location)
    graph.addLabel(node, 'Node')
    return node
  }

  // Enable the MoveUnselectedInputMode
  moveUnselectedInputMode = graphEditorInputMode.moveUnselectedInputMode
  moveUnselectedInputMode.enabled = true
  // The recognizers should behave differently, depending on what mode is selected in the demo
  moveUnselectedInputMode.pressedRecognizer = EventRecognizers.createAndRecognizer(
    moveUnselectedInputMode.pressedRecognizer,
    isRecognized
  )
  moveUnselectedInputMode.hoverRecognizer = EventRecognizers.createAndRecognizer(
    moveUnselectedInputMode.hoverRecognizer,
    isRecognized
  )

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Called when the mode combo box has changed:
 * if necessary, it changes the hit testable for the move input mode
 */
function onMoveModeChanged(): void {
  const selectedIndex = moveModeSelect.selectedIndex
  if (selectedIndex === 2) {
    // mode 2 (only top region): set a custom hit-testable which detects hits only at the top of
    // the nodes
    moveUnselectedInputMode.hitTestable = new TopInsetsHitTestable(
      moveUnselectedInputMode.hitTestable,
      graphComponent.inputMode as GraphEditorInputMode
    )
  } else if (moveUnselectedInputMode.hitTestable instanceof TopInsetsHitTestable) {
    // all other modes: if a TopInsetsHitTestable is the current hit-testable, restore the original
    // hit testable
    moveUnselectedInputMode.hitTestable = moveUnselectedInputMode.hitTestable.original
  }
  const showMoveEnabledButton = selectedIndex === 3
  moveEnabledButton.style.display = showMoveEnabledButton ? 'inline-block' : 'none'
  moveEnabledLabel.style.display = showMoveEnabledButton ? 'inline-block' : 'none'
}

/**
 * Called when the edge creation mode combo box has changed:
 * Adjusts the edge creation behavior.
 */
function onEdgeCreationModeChanged(): void {
  const selectedIndex = edgeCreationModeSelect.selectedIndex
  const geim = graphComponent.inputMode as GraphEditorInputMode
  if (selectedIndex === 0) {
    geim.moveUnselectedInputMode.priority = 41
    geim.moveInputMode.priority = 40
    geim.createEdgeInputMode.startOverCandidateOnly = false
    geim.createEdgeInputMode.showPortCandidates = ShowPortCandidates.TARGET
  } else if (selectedIndex === 1) {
    geim.moveUnselectedInputMode.priority = 47
    geim.moveInputMode.priority = 46
    geim.createEdgeInputMode.startOverCandidateOnly = true
    geim.createEdgeInputMode.showPortCandidates = ShowPortCandidates.ALL
  }
}

/**
 * A custom EventRecognizer to be used as modifier recognizer.
 *
 * Has to return true if the move input mode is allowed to move a node.
 */
function isRecognized(source: any, args: EventArgs): boolean {
  // return the value according to the Mode combo box
  switch (moveModeSelect.selectedIndex) {
    case 0: // always
    case 2: // on top (this is handled by custom IHitTestable)
      // the same as only enabling the MoveUnselectedInputMode without changing the recognizers
      return true
    case 1: // shift is not pressed
      return !KeyEventRecognizers.SHIFT_IS_DOWN(source, args)
    case 3: // if enabled
      return moveEnabledButton.checked
    default:
      return false
  }
}

/**
 * Wires up the UI.
 */
function initializeUI(): void {
  moveModeSelect.addEventListener('change', onMoveModeChanged)
  edgeCreationModeSelect.addEventListener('change', onEdgeCreationModeChanged)

  classicModeButton.addEventListener('click', () => {
    const mode = (graphComponent.inputMode as GraphEditorInputMode).moveInputMode
    mode.enabled = !mode.enabled
  })
}

/**
 * An IHitTestable implementation which detects hits only on top insets of a node.
 *
 * This instance keeps a reference to the original hit testable,
 * so the original behavior can be restored conveniently.
 */
class TopInsetsHitTestable extends BaseClass<IHitTestable>(IHitTestable) implements IHitTestable {
  /**
   * Creates a new instance of {@link TopInsetsHitTestable}.
   */
  constructor(
    original: IHitTestable,
    private inputMode: GraphEditorInputMode
  ) {
    super()
    this.original = original
  }

  /**
   * Gets the original hit testable.
   */
  readonly original: IHitTestable

  /**
   * Test whether the given location is a valid hit.
   *
   * The hit is considered as valid if the location lies inside a node's top insets.
   * @param context - The current input mode context.
   * @param location - The location to test.
   */
  isHit(context: IInputModeContext, location: Point): boolean {
    // get the current hit tester from the input mode context
    const inputModeContext = this.inputMode.inputModeContext!
    const hitTester = inputModeContext.lookup(INodeHitTester.$class)
    if (!hitTester) {
      return false
    }
    // get an enumerator over all elements at the given location
    const hits = hitTester.enumerateHits(inputModeContext, location)
    return hits.some((node) => {
      // determine whether the given location lies inside the top insets
      const insets = node.lookup(INodeInsetsProvider.$class)?.getInsets(node)
      const layout = node.layout
      return (
        insets != null && new Rect(layout.x, layout.y, layout.width, insets.top).contains(location)
      )
    })
  }
}

run().then(finishLoading)
