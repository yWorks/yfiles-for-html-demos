/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
import { GraphClipboard, IGraph, IModelItem, INode, Point } from 'yfiles'

/**
 * A special clipboard implementation which doesn't cut elements immediately.
 * Instead, the elements are stored as "to be cut" and actually removed
 * when they are finally pasted.
 * Changes in clipboard before they are pasted removes them from the list.
 *
 * Note that this implementation supports copying from multiple graphs. *
 */
export class DeferredCutClipboard extends GraphClipboard {
  constructor() {
    super()

    // The collection of elements to cut.
    // To support multiple source graphs this is implemented
    // as a map which maps elements to their source graph.
    this._elementsToBeCut = new Map()
  }

  /**
   * Whether the given element is marked as "to be cut".
   * @param {!IModelItem} item
   * @returns {boolean}
   */
  isToBeCut(item) {
    return this._elementsToBeCut.has(item)
  }

  /**
   * Overrides the default cut implementation.
   * This override sets the pasteDelta of the clipboard to (15,15)
   * instead of the default which doesn't move the pasted elements.
   *
   * This is mainly for demonstration purposes, otherwise
   * a cut with a subsequent paste would not be visible.
   * @param {!IGraph} sourceGraph
   * @param {?function} filter
   */
  cut(sourceGraph, filter) {
    super.cut(sourceGraph, filter)
    this.pasteDelta = new Point(15, 15)
  }

  /**
   * This method is called by cut to remove the element from the source graph.
   * It is overridden to do nothing, since the actual removal will happen in
   * {@link onElementPasted}.
   * @param {!IGraph} sourceGraph
   * @param {!function} predicate
   */
  removeElements(sourceGraph, predicate) {
    // don't remove anything, instead remember the cut elements in onElementCut
  }

  /**
   * The method which actually copies elements from one graph to another.
   * Invoked by both cut and copy.
   * Overridden to clear the {@link _elementsToBeCut} before the actual copying.
   * @param {!IGraph} sourceGraph
   * @param {!function} filter
   * @param {!IGraph} targetGraph
   * @param {?INode} targetRootNode
   * @param {?function} elementCopiedCallback
   */
  onCopy(sourceGraph, filter, targetGraph, targetRootNode, elementCopiedCallback) {
    this._elementsToBeCut.clear()
    return super.onCopy(sourceGraph, filter, targetGraph, targetRootNode, elementCopiedCallback)
  }

  /**
   * Called for each element after being cut.
   * Adds the element to the {@link _elementsToBeCut}.
   * @param {!IModelItem} original
   * @param {!IModelItem} copy
   */
  onElementCut(original, copy) {
    this._elementsToBeCut.set(original, this.clipboardContext.sourceGraph)
  }

  /**
   * Called for each element after being pasted.
   * Removes the original if the original is in the {@link _elementsToBeCut} collection.
   * @param {!IModelItem} original
   * @param {!IModelItem} copy
   */
  onElementPasted(original, copy) {
    const sourceItem = this.idProvider.getItem(this.clipboardContext, this.getId(original))
    if (sourceItem && this._elementsToBeCut.has(sourceItem)) {
      const sourceGraph = this._elementsToBeCut.get(sourceItem)
      if (sourceGraph.contains(sourceItem)) {
        sourceGraph.remove(sourceItem)
      }
    }
  }
}
