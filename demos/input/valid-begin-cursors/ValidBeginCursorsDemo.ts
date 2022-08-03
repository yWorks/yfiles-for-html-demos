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
  BaseClass,
  Cursor,
  EventRecognizers,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IEdge,
  IGraph,
  IHitTestable,
  IInputModeContext,
  KeyEventRecognizers,
  License,
  ModifierKeys,
  Point,
  Rect
} from 'yfiles'

import { bindCommand, showApp } from '../../resources/demo-app'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

let graphComponent: GraphComponent
const lassoCursor: Cursor = new Cursor('resources/lasso.cur', Cursor.CROSSHAIR)
const createEdgeCursor: Cursor = new Cursor('resources/createedge.cur', Cursor.DEFAULT)

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // Initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // Assign the default demo styles
  initDemoStyles(graphComponent.graph)

  // Specify an input mode configured to use customized cursors and interaction gestures
  graphComponent.inputMode = createEditorMode()

  // Create a sample graph
  createSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // Register commands for the buttons in this demo
  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Creates and configures the editor input mode for this demo.
 */
function createEditorMode(): GraphEditorInputMode {
  const mode = new GraphEditorInputMode()

  // Lasso selection is disabled per default and has to be enabled first.
  mode.lassoSelectionInputMode.enabled = true
  // 'Shift' has to be pressed to start lasso selection which is indicated by a lasso cursor.
  mode.lassoSelectionInputMode.validBeginRecognizer = KeyEventRecognizers.SHIFT_IS_DOWN
  mode.lassoSelectionInputMode.validBeginCursor = lassoCursor
  mode.lassoSelectionInputMode.lassoCursor = lassoCursor
  // A finish radius is set and the cross-hair cursor is used to indicate that the gesture may end there.
  mode.lassoSelectionInputMode.validEndCursor = Cursor.CROSSHAIR
  mode.lassoSelectionInputMode.finishRadius = 10

  // Marquee selection should not start when 'Shift' is pressed.
  // Due to its relatively higher priority it also won't start when 'Ctrl' is pressed as in this
  // case the MoveViewportInputMode kicks in.
  mode.marqueeSelectionInputMode.validBeginRecognizer = EventRecognizers.inverse(
    KeyEventRecognizers.SHIFT_IS_DOWN
  )
  mode.marqueeSelectionInputMode.validBeginCursor = Cursor.CROSSHAIR
  mode.marqueeSelectionInputMode.marqueeCursor = Cursor.CROSSHAIR

  // 'Ctrl' has to be pressed to start moving the viewport which is indicated by a grab cursor
  mode.moveViewportInputMode.validBeginRecognizer = KeyEventRecognizers.CTRL_IS_DOWN
  mode.moveViewportInputMode.validBeginCursor = Cursor.GRAB
  mode.moveViewportInputMode.dragCursor = Cursor.GRABBING

  // Only hovering over an edge is a valid tool tip location and is indicated by the help cursor
  mode.mouseHoverInputMode.validHoverLocationHitTestable = new EdgeHitTestable()
  mode.mouseHoverInputMode.validHoverLocationCursor = Cursor.HELP
  // The hover input mode should have a lower priority then the MoveViewportInputMode so its cursor
  // is displayed when hovering over an edge.
  mode.mouseHoverInputMode.priority = mode.moveViewportInputMode.priority - 3
  // For edges a simple tooltip containing information about the source and target node is used.
  mode.addQueryItemToolTipListener((sender, evt) => {
    if (evt.item instanceof IEdge && !evt.handled) {
      evt.toolTip = `${evt.item.sourceNode} -> ${evt.item.targetNode}`
      evt.handled = true
    }
  })

  // Edge creation shall only start when 'Ctrl' is pressed and the mouse is hovering over an unselected node.
  // The check for hovering  over an unselected node is already done by the default beginHitTestable,
  // so we only have to combine this with a check, whether the 'Ctrl' key was pressed in the last input event.
  const defaultBeginHitTestable = mode.createEdgeInputMode.beginHitTestable
  mode.createEdgeInputMode.beginHitTestable = IHitTestable.create(
    (context, location) =>
      defaultBeginHitTestable.isHit(context, location) &&
      (graphComponent.lastInputEvent.modifiers & ModifierKeys.CONTROL) === ModifierKeys.CONTROL
  )
  // Use a custom create-edge cursor to indicate that edge creation is valid to begin and while
  // still dragging over the source node.
  mode.createEdgeInputMode.validBeginCursor = createEdgeCursor
  mode.createEdgeInputMode.sourceNodeDraggingCursor = createEdgeCursor
  // disable enforced bend creation, so we can end edge creation with 'Ctrl' held down
  mode.createEdgeInputMode.enforceBendCreationRecognizer = EventRecognizers.NEVER
  // As both CreateEdgeInputMode and MoveViewportInputMode now use the 'Ctrl' modifier, we have
  // to assign the CreateEdgeInputMode a lower priority as otherwise MoveViewportInputMode would
  // always win.
  mode.createEdgeInputMode.priority = mode.moveViewportInputMode.priority - 2

  // Node should be movable whether selected or not, so we enabled the moveUnselectedInputMode
  mode.moveUnselectedInputMode.enabled = true
  mode.moveUnselectedInputMode.priority = mode.moveViewportInputMode.priority - 1
  return mode
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the demo's toolbar.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

/**
 * Creates the initial graph.
 */
function createSampleGraph(graph: IGraph): void {
  const n1 = graph.createNode(new Rect(126, 0, 30, 30))
  const n2 = graph.createNode(new Rect(126, 72, 30, 30))
  const n3 = graph.createNode(new Rect(75, 147, 30, 30))
  const n4 = graph.createNode(new Rect(177.5, 147, 30, 30))
  const n5 = graph.createNode(new Rect(110, 249, 30, 30))
  const n6 = graph.createNode(new Rect(177.5, 249, 30, 30))
  const n7 = graph.createNode(new Rect(110, 299, 30, 30))
  const n8 = graph.createNode(new Rect(177.5, 299, 30, 30))
  const n9 = graph.createNode(new Rect(110, 359, 30, 30))
  const n10 = graph.createNode(new Rect(47.5, 299, 30, 30))
  const n11 = graph.createNode(new Rect(20, 440, 30, 30))
  const n12 = graph.createNode(new Rect(110, 440, 30, 30))
  const n13 = graph.createNode(new Rect(20, 515, 30, 30))
  const n14 = graph.createNode(new Rect(80, 515, 30, 30))
  const n15 = graph.createNode(new Rect(140, 515, 30, 30))
  const n16 = graph.createNode(new Rect(20, 569, 30, 30))

  const group1 = graph.createGroupNode({
    layout: new Rect(98, 222, 119.5, 116),
    labels: ['Group 1']
  })
  graph.groupNodes(group1, [n5, n6, n7, n8])

  const group2 = graph.createGroupNode({
    layout: new Rect(10, 413, 170, 141),
    labels: ['Group 2']
  })
  graph.groupNodes(group2, [n11, n12, n13, n14, n15])

  graph.createEdge(n1, n2)
  graph.createEdge(n2, n3)
  graph.createEdge(n2, n4)
  graph.createEdge(n3, n5)
  graph.createEdge(n3, n10)
  graph.createEdge(n5, n7)
  graph.createEdge(n7, n9)
  graph.createEdge(n4, n6)
  graph.createEdge(n6, n8)
  graph.createEdge(n10, n11)
  graph.createEdge(n10, n12)
  graph.createEdge(n11, n13)
  graph.createEdge(n13, n16)
  graph.createEdge(n12, n14)
  graph.createEdge(n12, n15)
}

/**
 * This hit testable returns true when any edge is at the given location.
 */
class EdgeHitTestable extends BaseClass(IHitTestable) implements IHitTestable {
  public isHit(context: IInputModeContext, location: Point): boolean {
    return graphComponent.graphModelManager.typedHitElementsAt(IEdge.$class, location).some()
  }
}

// noinspection JSIgnoredPromiseFromCall
run()
