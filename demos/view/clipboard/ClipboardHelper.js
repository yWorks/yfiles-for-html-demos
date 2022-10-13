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
import { BaseClass, IClipboardHelper, IGraphClipboardContext, IModelItem, INode } from 'yfiles'

/**
 * Holds the tag of the item that has been copied.
 */
export class TagCopyItem {
  /**
   * Creates a new instance of {@link TagCopyItem}.
   * @param {!ClipboardBusinessObject} tag The tag of the copied item
   */
  constructor(tag) {
    this.tag = tag

    // The number of items that have been pasted.
    this.pasteCount = 0
  }

  /**
   * Increments the number of pasted elements.
   */
  increasePasteCount() {
    this.pasteCount++
  }
}

/**
 * This class is used to assign custom labels to pasted nodes.
 * {@link IClipboardHelper} implementations can be used to associate custom actions
 * with graph elements when the element is cut/copied/pasted. Moreover, a clipboard helper
 * allows to add user state to clipboard operations. This implementation uses these possibilities
 * to retrieve the label of the original node for a Paste operation and the number of copies
 * so far in order to set a customized label for the pasted node.
 */
export class TaggedNodeClipboardHelper extends BaseClass(IClipboardHelper) {
  /**
   * Nodes can be copied unconditionally.
   * @param {?IGraphClipboardContext} context The context in which this interface is used, can be null
   * @param {!IModelItem} item The item to be copied
   * @see Specified by {@link IClipboardHelper.shouldCopy}.
   * @returns {boolean}
   */
  shouldCopy(context, item) {
    return true
  }

  /**
   * Nodes can be cut unconditionally.
   * @param {?IGraphClipboardContext} context The context in which this interface is used, can be null
   * @param {!IModelItem} item The item to be cut
   * @see Specified by {@link IClipboardHelper.shouldCut}.
   * @returns {boolean}
   */
  shouldCut(context, item) {
    return true
  }

  /**
   * Nodes can be pasted unconditionally.
   * @param {?IGraphClipboardContext} context The context in which this interface is used, can be null
   * @param {!IModelItem} item The item to be pasted
   * @param {*} userData The state memento that had been created during cut or copy
   * @see Specified by {@link IClipboardHelper.shouldPaste}.
   * @returns {boolean}
   */
  shouldPaste(context, item, userData) {
    return true
  }

  /**
   * If the copied node has at least one label, we store a variant of the label text
   * (see {@link CopyItem} implementation).
   * @param {?IGraphClipboardContext} context The context in which this interface is used, can be null
   * @param {!IModelItem} item The item to be copied
   * @see Specified by {@link IClipboardHelper.copy}.
   * @returns {*}
   */
  copy(context, item) {
    return item instanceof INode && item.labels.size > 0
      ? new CopyItem(item.labels.get(0).text)
      : null
  }

  /**
   * If the cut node has at least one label, we store a variant of the label text
   * (see {@link CopyItem} implementation).
   * @param {?IGraphClipboardContext} context The context in which this interface is used, can be null
   * @param {!IModelItem} item The item to be cut
   * @see Specified by {@link IClipboardHelper.cut}.
   * @returns {*}
   */
  cut(context, item) {
    return item instanceof INode && item.labels.size > 0
      ? new CopyItem(item.labels.get(0).text)
      : null
  }

  /**
   * If the pasted node has at least one label, we change the text using the one that is provided
   * by `userData`.
   * @param {?IGraphClipboardContext} context The context in which this interface is used, can be null
   * @param {!IModelItem} item The copied item The item to be pasted
   * @param {*} userData The state memento that had been created during cut or copy
   * @see Specified by {@link IClipboardHelper.paste}.
   */
  paste(context, item, userData) {
    if (item instanceof INode && item.labels.size > 0 && userData instanceof CopyItem) {
      context?.targetGraph.setLabelText(item.labels.get(0), userData.toString())
    }
  }
}

/**
 * Instances of this class are used to store information about the clipboard operations as label text and number
 * of pasted elements.
 */
class CopyItem {
  /**
   * Creates a new instance of {@link CopyItem}.
   * @param {!string} text
   */
  constructor(text) {
    this.text = text
    this.pasteCount = 0
  }

  /**
   * Returns the label text of the copied item and the number of pasted elements as string.
   * @returns {!string}
   */
  toString() {
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
