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
import {
  BaseClass,
  IClipboardHelper,
  type IGraphClipboardContext,
  type IModelItem,
  INode
} from '@yfiles/yfiles'

/**
 * This class is used to assign custom labels to pasted nodes.
 * {@link IClipboardHelper} implementations can be used to associate custom actions
 * with graph elements when the element is cut/copied/pasted. Moreover, a clipboard helper
 * allows adding user state to clipboard operations. This implementation uses these possibilities
 * to retrieve the label of the original node for a Paste operation and the number of copies
 * so far to set a customized label for the pasted node.
 */
export class TaggedNodeClipboardHelper extends BaseClass(IClipboardHelper) {
  private userData: CopyItem | null = null

  /**
   * If the copied node has at least one label, we store a variant of the label text
   * (see {@link CopyItem} implementation).
   * @param _context The context in which this interface is used, can be null
   * @param item The item to be copied
   */
  onCopied(_context: IGraphClipboardContext | null, item: IModelItem): any | null {
    const node = item as INode
    // If we are a Node with at least one label, we
    // store a variant of the label text (see CopyItem
    // implementation)
    if (node.labels.size > 0) {
      this.userData = new CopyItem(node.labels.at(0)!.text)
    }
  }

  /**
   * If the cut node has at least one label, we store a variant of the label text
   * (see {@link CopyItem} implementation).
   * @param context The context in which this interface is used, can be null
   * @param item The item to be cut
   */
  onCut(context: IGraphClipboardContext | null, item: IModelItem): void {
    // do the same for Cut, since it's essentially just a Copy and Delete in succession.
    this.onCopied(context, item)
  }

  /**
   * If the pasted node has at least one label, we change the text using the one that is provided
   * by `userData`.
   * @param context The context in which this interface is used, can be null
   * @param item The copied item The item to be pasted
   */
  onPasted(context: IGraphClipboardContext | null, item: IModelItem): void {
    //Note: This is the _copied_ item
    const node = item as INode
    if (node.labels.size > 0) {
      if (this.userData != null && context != null) {
        // If we are a Node with at least one label, we
        // change our text to the one that is provided by userData.
        context.targetGraph.setLabelText(node.labels.at(0)!, this.userData.toString())
      }
    }
  }

  /**
   * If the original node has at least one label, we change the text of the duplicate node with
   * the one that is provided by the original node.
   * @param context The context in which this interface is used, can be null
   * @param original The original item to be duplicated
   * @param duplicate The duplicated item
   * @see Specified by {@link IClipboardHelper.paste}.
   */
  onDuplicated(context: IGraphClipboardContext, original: IModelItem, duplicate: IModelItem): void {
    if (
      original instanceof INode &&
      original.labels.size > 0 &&
      duplicate instanceof INode &&
      duplicate.labels.size > 0
    ) {
      const data = new CopyItem(original.labels.at(0)!.text)
      context.targetGraph.setLabelText(duplicate.labels.at(0)!, data.toString())
    }
  }

  shouldCopy(_context: IGraphClipboardContext | null, _item: IModelItem): boolean {
    return true
  }
  shouldCut(_context: IGraphClipboardContext | null, _item: IModelItem): boolean {
    return true
  }
  shouldPaste(_context: IGraphClipboardContext | null, _item: IModelItem): boolean {
    return true
  }
  shouldDuplicate(_context: IGraphClipboardContext, _item: IModelItem): boolean {
    return true
  }
}

/**
 * Instances of this class are used to store information about the clipboard operations as label text and number
 * of pasted elements.
 */
class CopyItem {
  text: string

  /**
   * Creates a new instance of {@link CopyItem}.
   */
  constructor(text: string) {
    this.text = text
  }

  public pasteCount = 0

  /**
   * Returns the label text of the copied item and the number of pasted elements as string.
   */
  toString(): string {
    // We count how often we have been pasted and change the string
    // accordingly.
    // If we start from a new copy, the counter is thus reset (try it!)
    this.pasteCount++
    if (this.pasteCount < 2) {
      return `Copy of ${this.text}`
    }
    return `Copy (${this.pasteCount}) of ${this.text}`
  }
}
