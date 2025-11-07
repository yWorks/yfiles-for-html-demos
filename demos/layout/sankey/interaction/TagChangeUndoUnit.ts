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
import { BaseClass, type IModelItem, IUndoUnit } from '@yfiles/yfiles'

/**
 * This class provides undo/redo for an operation for changing tag data.
 * Since information about node/edge color and edge thickness is stored in the item's tag, it is
 * important to undo these changes along with the changes in style and layout.
 */
export class TagChangeUndoUnit extends BaseClass(IUndoUnit) {
    private readonly undoRedoCallback?: () => void | null;
    private readonly item: IModelItem;
    private readonly newTag: object;
    private readonly oldTag: object;
  private readonly _undoName: string
  private readonly _redoName: string

  /**
   * Creates a new instance of TagChangeUndoUnit.
   * @param undoName Name of the undo operation.
   * @param redoName Name of the redo operation.
   * @param oldTag The data needed to restore the previous state.
   * @param newTag The data needed to restore the next state.
   * @param item The owner of the tag.
   * @param undoRedoCallback Callback that is executed after undo and redo.
   */
  constructor(
    undoName: string,
    redoName: string,
    oldTag: object,
    newTag: object,
    item: IModelItem,
    undoRedoCallback?: () => void | null
  ) {
    super()
      this.oldTag = oldTag;
      this.newTag = newTag;
      this.item = item;
      this.undoRedoCallback = undoRedoCallback;
    this._undoName = undoName
    this._redoName = redoName
  }

  get undoName(): string {
    return this._undoName
  }

  get redoName(): string {
    return this._redoName
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo(): void {
    this.item.tag = this.oldTag
    this.undoRedoCallback?.()
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo(): void {
    this.item.tag = this.newTag
    this.undoRedoCallback?.()
  }

  dispose(): void {}

  tryMergeUnit(_unit: IUndoUnit): boolean {
    return false
  }

  tryReplaceUnit(_unit: IUndoUnit): boolean {
    return false
  }
}
