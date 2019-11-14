/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-component', 'MindmapUtil.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  MindmapUtil
) => {
  /**
   * This class disables interactions on certain items.
   * @extends yfiles.input.GraphEditorInputMode
   */
  class MindmapEditorInputMode extends yfiles.input.GraphEditorInputMode {
    /**
     * Enables selection only for cross reference edges.
     * @param {yfiles.graph.IModelItem} item The item to check.
     * @see Overrides {@link yfiles.input.GraphEditorInputMode#shouldClickSelect}
     * @return {boolean}
     */
    shouldClickSelect(item) {
      if (yfiles.graph.IEdge.isInstance(item)) {
        return MindmapUtil.Structure.isCrossReference(item)
      }
      return super.shouldClickSelect(item)
    }

    /**
     * Disables moving root node.
     * @param {yfiles.graph.IModelItem} item The item to check.
     * @see Overrides {@link yfiles.input.GraphEditorInputMode#shouldMove}
     * @return {boolean}
     */
    shouldMove(item) {
      if (yfiles.graph.INode.isInstance(item)) {
        return !MindmapUtil.Structure.isRoot(item)
      }
      return super.shouldMove(item)
    }
  }

  return MindmapEditorInputMode
})
