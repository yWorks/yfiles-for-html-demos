/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphComponent, GraphEditorInputMode } from 'yfiles'

/**
 * Enables undo functionality.
 * @param {!IGraph} graph
 */
export function enableUndo(graph) {
  graph.undoEngineEnabled = true
}

/**
 * Performs an undo operation
 * @param {!IGraph} graph
 */
export function undo(graph) {
  if (graph.undoEngineEnabled && graph.undoEngine && graph.undoEngine.canUndo()) {
    graph.undoEngine.undo()
  }
}

/**
 * Performs a redo operation
 * @param {!IGraph} graph
 */
export function redo(graph) {
  if (graph.undoEngineEnabled && graph.undoEngine && graph.undoEngine.canRedo()) {
    graph.undoEngine.redo()
  }
}

/**
 * Clears the undo entries.
 * @param {!IGraph} graph
 */
export function clearUndoQueue(graph) {
  if (graph.undoEngineEnabled && graph.undoEngine) {
    graph.undoEngine.clear()
  }
}

/**
 * Demonstrates clipboard low-level functionality.
 * @param {!GraphComponent} graphComponent
 */
function enableClipboard(graphComponent) {
  const graphEditorInputMode = graphComponent.inputMode
  graphEditorInputMode.allowClipboardOperations = true // this is the default, already

  // programmatically copy the selected graph items
  if (graphComponent.selection.selectedNodes.size > 0) {
    graphEditorInputMode.copy()
  }
  // programmatically paste and clear the clipboard content
  if (!graphComponent.clipboard.empty) {
    graphEditorInputMode.paste()
    graphComponent.clipboard.clear()
  }
}
