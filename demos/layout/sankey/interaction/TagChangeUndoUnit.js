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
import { UndoUnitBase } from 'yfiles'

/**
 * This class provides undo/redo for an operation for changing tag data.
 * Since information about node/edge color and edge thickness is stored in the item's tag, it is
 * important to undo these changes along with the changes in style and layout.
 */
export class TagChangeUndoUnit extends UndoUnitBase {
  /**
   * Creates a new instance of TagChangeUndoUnit.
   * @param {!string} undoName Name of the undo operation.
   * @param {!string} redoName Name of the redo operation.
   * @param {!object} oldTag The data needed to restore the previous state.
   * @param {!object} newTag The data needed to restore the next state.
   * @param {!IModelItem} item The owner of the tag.
   * @param undoRedoCallback Callback that is executed after undo and redo.
   * @param {!function} [undoRedoCallback]
   */
  constructor(undoName, redoName, oldTag, newTag, item, undoRedoCallback) {
    super(undoName, redoName)
    this.undoRedoCallback = undoRedoCallback
    this.item = item
    this.newTag = newTag
    this.oldTag = oldTag
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo() {
    this.item.tag = this.oldTag
    this.undoRedoCallback?.()
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo() {
    this.item.tag = this.newTag
    this.undoRedoCallback?.()
  }
}
