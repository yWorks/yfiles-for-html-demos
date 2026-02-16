/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { demoApp, graphComponent } from '@yfiles/demo-app/init'
import {
  Cursor,
  EventRecognizers,
  GraphEditorInputMode,
  HierarchicalLayout,
  IEdge,
  IHitTestable
} from '@yfiles/yfiles'
import graphData from './graph-data.json'
import { EdgeHitTestable } from './EdgeHitTestable'
import { CustomCursorIcons } from './CustomCursorIcons'

// Initialize the editor input mode
const editorInputMode = new GraphEditorInputMode()

// --- Lasso Selection Configuration ---
// Enable lasso selection and configure it to start when the 'Alt' key is pressed
editorInputMode.lassoSelectionInputMode.enabled = true
editorInputMode.lassoSelectionInputMode.validBeginRecognizer = EventRecognizers.ALT_IS_DOWN
// Configures custom cursors for different lasso selection states
editorInputMode.lassoSelectionInputMode.validBeginCursor = CustomCursorIcons.lasso
editorInputMode.lassoSelectionInputMode.lassoCursor = CustomCursorIcons.lasso
editorInputMode.lassoSelectionInputMode.extendSelectionCursor = CustomCursorIcons.lasso_plus
editorInputMode.lassoSelectionInputMode.subtractSelectionCursor = CustomCursorIcons.lasso_minus
// Set the cursor and radius to indicate where the lasso gesture can be completed
editorInputMode.lassoSelectionInputMode.validEndCursor = Cursor.CROSSHAIR
editorInputMode.lassoSelectionInputMode.finishRadius = 10

// --- Marquee Selection Configuration ---
// Configure cursors for different marquee selection states
editorInputMode.marqueeSelectionInputMode.validBeginCursor = Cursor.CROSSHAIR
editorInputMode.marqueeSelectionInputMode.marqueeCursor = Cursor.CROSSHAIR
editorInputMode.marqueeSelectionInputMode.extendSelectionCursor = CustomCursorIcons.crosshair_plus
editorInputMode.marqueeSelectionInputMode.subtractSelectionCursor =
  CustomCursorIcons.crosshair_minus

// --- Viewport Movement Configuration ---
// Configure viewport panning to start with the 'Ctrl' key and use grab/grabbing cursors
editorInputMode.moveViewportInputMode.validBeginRecognizer = EventRecognizers.CTRL_IS_DOWN
editorInputMode.moveViewportInputMode.validBeginCursor = Cursor.GRAB
editorInputMode.moveViewportInputMode.dragCursor = Cursor.GRABBING

// --- Tooltip Configuration ---
// Configure tooltips to appear when hovering over an edge, indicated by a help cursor
editorInputMode.toolTipInputMode.validHoverLocationHitTestable = new EdgeHitTestable()
editorInputMode.toolTipInputMode.validHoverLocationCursor = Cursor.HELP
// Assign a higher priority to the tooltip mode to ensure its cursor is displayed when hovering over an edge
editorInputMode.toolTipInputMode.priority = editorInputMode.createEdgeInputMode.priority - 3
// Display a simple tooltip containing information about the source and target node
editorInputMode.addEventListener('query-item-tool-tip', (evt) => {
  if (evt.item instanceof IEdge && !evt.handled) {
    evt.toolTip = `${evt.item.sourceNode} -> ${evt.item.targetNode}`
    evt.handled = true
  }
})

// --- Edge Creation Configuration ---
// Modifies edge creation to require both the 'Ctrl' key to be pressed and hovering over a node to begin.
// This is achieved by combining the default beginHintTestable (node hover check) with a Ctrl key down check.
const defaultBeginHitTestable = editorInputMode.createEdgeInputMode.beginHitTestable
editorInputMode.createEdgeInputMode.beginHitTestable = IHitTestable.create(
  (context, location) =>
    defaultBeginHitTestable.isHit(context, location) && graphComponent.lastInputEvent.ctrlKey
)
// Set custom cursors to indicate when edge creation is valid to begin and during port dragging.
editorInputMode.createEdgeInputMode.validBeginCursor = CustomCursorIcons.create_edge
editorInputMode.createEdgeInputMode.startPortOwnerDraggingCursor = CustomCursorIcons.create_edge
// Disable enforced bend creation, allowing edge creation to be completed even with 'Ctrl' held down
editorInputMode.createEdgeInputMode.enforceBendCreationRecognizer = EventRecognizers.NEVER
// Assign a higher priority to the edge creation mode to resolve conflicts with MoveViewportInputMode,
// as both modes use the 'Ctrl' modifier.
editorInputMode.createEdgeInputMode.priority = editorInputMode.moveViewportInputMode.priority - 2

graphComponent.inputMode = editorInputMode

// Build and lay out the graph
demoApp.buildGraphFromJson(graphData)
graphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
void graphComponent.fitGraphBounds()
graphComponent.graph.undoEngineEnabled = true
