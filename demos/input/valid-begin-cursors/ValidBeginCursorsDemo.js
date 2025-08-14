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
  Cursor,
  EventRecognizers,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  IEdge,
  IGraph,
  IHitTestable,
  IInputModeContext,
  LayoutExecutor,
  License,
  Point
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'

let graphComponent
const lassoCursor = new Cursor('resources/lasso.svg', 17, 15, Cursor.CROSSHAIR)
const lassoCursorPlus = new Cursor('resources/lasso_plus.svg', 17, 15, Cursor.CROSSHAIR)
const lassoCursorMinus = new Cursor('resources/lasso_minus.svg', 17, 15, Cursor.CROSSHAIR)
const createEdgeCursor = new Cursor('resources/createedge.svg', 16, 16, Cursor.DEFAULT)
const crosshairCursorPlus = new Cursor('resources/crosshair_plus.svg', 16, 16, Cursor.DEFAULT)
const crosshairCursorMinus = new Cursor('resources/crosshair_minus.svg', 16, 16, Cursor.DEFAULT)

/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()

  // Initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  // Assign the default demo styles
  initDemoStyles(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(new HierarchicalLayout({ minimumLayerDistance: 35 }))
  void graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true

  // specify an input mode configured to use customized cursors and interaction gestures
  graphComponent.inputMode = createEditorMode()
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Creates and configures the editor input mode for this demo.
 */
function createEditorMode() {
  const mode = new GraphEditorInputMode()

  // Lasso selection is disabled per default and has to be enabled first.
  mode.lassoSelectionInputMode.enabled = true

  // 'Alt' has to be pressed to start lasso selection which is indicated by a lasso cursor.
  mode.lassoSelectionInputMode.validBeginRecognizer = EventRecognizers.ALT_IS_DOWN
  mode.lassoSelectionInputMode.validBeginCursor = lassoCursor
  mode.lassoSelectionInputMode.lassoCursor = lassoCursor
  mode.lassoSelectionInputMode.extendSelectionCursor = lassoCursorPlus
  mode.lassoSelectionInputMode.subtractSelectionCursor = lassoCursorMinus

  // A finish radius is set and the cross-hair cursor is used to indicate that the gesture may end there.
  mode.lassoSelectionInputMode.validEndCursor = Cursor.CROSSHAIR
  mode.lassoSelectionInputMode.finishRadius = 10

  mode.marqueeSelectionInputMode.validBeginCursor = Cursor.CROSSHAIR
  mode.marqueeSelectionInputMode.marqueeCursor = Cursor.CROSSHAIR
  mode.marqueeSelectionInputMode.extendSelectionCursor = crosshairCursorPlus
  mode.marqueeSelectionInputMode.subtractSelectionCursor = crosshairCursorMinus

  // 'Ctrl' has to be pressed to start moving the viewport which is indicated by a grab cursor
  mode.moveViewportInputMode.validBeginRecognizer = EventRecognizers.CTRL_IS_DOWN
  mode.moveViewportInputMode.validBeginCursor = Cursor.GRAB
  mode.moveViewportInputMode.dragCursor = Cursor.GRABBING

  // Only hovering over an edge is a valid tool tip location and is indicated by the help cursor
  mode.toolTipInputMode.validHoverLocationHitTestable = new EdgeHitTestable()
  mode.toolTipInputMode.validHoverLocationCursor = Cursor.HELP
  // The hover input mode should have a lower priority then the createEdgeInputMode so its cursor
  // is displayed when hovering over an edge.
  mode.toolTipInputMode.priority = mode.createEdgeInputMode.priority - 3
  // For edges a simple tooltip containing information about the source and target node is used.
  mode.addEventListener('query-item-tool-tip', (evt) => {
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
      defaultBeginHitTestable.isHit(context, location) && graphComponent.lastInputEvent.ctrlKey
  )
  // Use a custom create-edge cursor to indicate that edge creation is valid to begin and while
  // still dragging over the source node.
  mode.createEdgeInputMode.validBeginCursor = createEdgeCursor
  mode.createEdgeInputMode.startPortOwnerDraggingCursor = createEdgeCursor
  // disable enforced bend creation, so we can end edge creation with 'Ctrl' held down
  mode.createEdgeInputMode.enforceBendCreationRecognizer = EventRecognizers.NEVER
  // As both CreateEdgeInputMode and MoveViewportInputMode now use the 'Ctrl' modifier, we have
  // to assign the CreateEdgeInputMode a lower priority as otherwise MoveViewportInputMode would
  // always win.
  mode.createEdgeInputMode.priority = mode.moveViewportInputMode.priority - 2

  // Node should be movable whether selected or not, so we enabled the moveUnselectedItemsInputMode
  mode.moveUnselectedItemsInputMode.enabled = true
  mode.moveUnselectedItemsInputMode.priority = mode.moveViewportInputMode.priority - 1
  return mode
}

/**
 * This hit testable returns true when any edge is at the given location.
 */
class EdgeHitTestable extends BaseClass(IHitTestable) {
  isHit(_context, location) {
    return graphComponent.graphModelManager
      .hitElementsAt(location)
      .filter((e) => e instanceof IEdge)
      .some()
  }
}

run().then(finishLoading)
