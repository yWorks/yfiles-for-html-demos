/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Holds the tag of the item that has been copied.
   */
  class TagCopyItem {
    /**
     * Creates a new instance of <code>TagCopyItem</code>.
     * @param {object} tag
     */
    constructor(tag) {
      this.$tag = tag
      this.$pasteCount = 0
    }

    /**
     * Gets the number of item that have been pasted.
     * @return {number}
     */
    get pasteCount() {
      return this.$pasteCount
    }

    /**
     * Sets the number of item that have been pasted.
     * @param {number} value
     */
    set pasteCount(value) {
      this.$pasteCount = value
    }

    /**
     * Gets the tag of the copied item.
     * @return {Object}
     */
    get tag() {
      return this.$tag
    }

    /**
     * Sets the tag of the copied item.
     * @param {Object} value
     */
    set tag(value) {
      this.$tag = value
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
   * {@link yfiles.graph.IClipboardHelper} implementations can be used to associate custom actions
   * with graph elements when the element is cut/copied/pasted. Moreover, a clipboard helper
   * allows to add user state to clipboard operations. This implementation uses these possibilities
   * to retrieve the label of the original node for a Paste operation and the number of copies
   * so far in order to set a customized label for the pasted node.
   */
  class TaggedNodeClipboardHelper extends yfiles.lang.Class(yfiles.graph.IClipboardHelper) {
    /**
     * Nodes can be copied unconditionally.
     * @param {yfiles.graph.IGraphClipboardContext} context The context in which this interface is used, can be null
     * @param {yfiles.graph.IModelItem} item The item to be copied
     * @see Specified by {@link yfiles.graph.IClipboardHelper#shouldCopy}.
     * @return {boolean}
     */
    shouldCopy(context, item) {
      return true
    }

    /**
     * Nodes can be cut unconditionally.
     * @param {yfiles.graph.IGraphClipboardContext} context The context in which this interface is used, can be null
     * @param {yfiles.graph.IModelItem} item The item to be cut
     * @see Specified by {@link yfiles.graph.IClipboardHelper#shouldCut}.
     * @return {boolean}
     */
    shouldCut(context, item) {
      return true
    }

    /**
     * Nodes can be pasted unconditionally.
     * @param {yfiles.graph.IGraphClipboardContext} context The context in which this interface is used, can be null
     * @param {yfiles.graph.IModelItem} item The item to be pasted
     * @param {object} userData The state memento that had been created during cut or copy
     * @see Specified by {@link yfiles.graph.IClipboardHelper#shouldPaste}.
     * @return {boolean}
     */
    shouldPaste(context, item, userData) {
      return true
    }

    /**
     * If the copied node has at least one label, we store a variant of the label text
     * (see {@link CopyItem} implementation).
     * @param {yfiles.graph.IGraphClipboardContext} context The context in which this interface is used, can be null
     * @param {yfiles.graph.IModelItem} item The item to be copied
     * @see Specified by {@link yfiles.graph.IClipboardHelper#copy}.
     * @return {Object}
     */
    copy(context, item) {
      const node = item
      return node.labels.size > 0 ? new CopyItem(node.labels.get(0).text) : null
    }

    /**
     * If the cut node has at least one label, we store a variant of the label text
     * (see {@link CopyItem} implementation).
     * @param {yfiles.graph.IGraphClipboardContext} context The context in which this interface is used, can be null
     * @param {yfiles.graph.IModelItem} item The item to be cut
     * @see Specified by {@link yfiles.graph.IClipboardHelper#cut}.
     * @return {Object}
     */
    cut(context, item) {
      const node = item
      return node.labels.size > 0 ? new CopyItem(node.labels.get(0).text) : null
    }

    /**
     * If the pasted node has at least one label, we change the text using the one that is provided
     * by <code>userData</code>.
     * @param {yfiles.graph.IGraphClipboardContext} context The context in which this interface is used, can be null
     * @param {Object} item The copied item The item to be pasted
     * @param {object} userData The state memento that had been created during cut or copy
     * @see Specified by {@link yfiles.graph.IClipboardHelper#paste}.
     */
    paste(context, item, userData) {
      const node = item
      if (node.labels.size > 0 && userData instanceof CopyItem && context !== null) {
        context.targetGraph.setLabelText(node.labels.get(0), userData.toString())
      }
    }
  }

  /**
   * Instances of this class are used to store information about the clipboard operations as label text and number
   * of pasted elements.
   */
  class CopyItem {
    /**
     * Creates a new instance of <code>CopyItem</code>.
     * @param {string} text
     */
    constructor(text) {
      this.$text = text
      this.$pasteCount = 0
    }

    /**
     * Gets the number of pasted elements.
     * @return {number}
     */
    get pasteCount() {
      return this.$pasteCount
    }

    /**
     * Sets the number of pasted elements.
     * @param {number} value
     */
    set pasteCount(value) {
      this.$pasteCount = value
    }

    /**
     * Gets the text of the copied elements.
     * @return {string}
     */
    get text() {
      return this.$text
    }

    /**
     * Sets the text of the copied elements.
     * @param {string} value
     */
    set text(value) {
      this.$text = value
    }

    /**
     * Returns the label text of the copied item and the number of pasted elements as string.
     * @return {string}
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

  return {
    TagCopyItem,
    TaggedNodeClipboardHelper
  }
})
