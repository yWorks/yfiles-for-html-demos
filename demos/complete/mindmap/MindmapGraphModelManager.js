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
   * Provides a special {@link yfiles.view.ICanvasObjectGroup} for cross reference edges
   * or delegates to the wrapped implementation.
   * @extends yfiles.view.GraphModelManager
   */
  class MindmapGraphModelManager extends yfiles.view.GraphModelManager {
    /**
     * Constructs the GraphModelManager.
     * @param {yfiles.view.GraphComponent} graphComponent The given graphComponent.
     * @param {yfiles.view.ICanvasObjectGroup} contentGroup The content group.
     */
    constructor(graphComponent, contentGroup) {
      super(graphComponent, contentGroup)
      this.$crossReferenceEdgeGroup = this.createContentGroup()
      this.hierarchicNestingPolicy = yfiles.view.HierarchicNestingPolicy.NODES
    }

    /**
     * Gets the cross reference canvas group.
     * @return {yfiles.view.ICanvasObjectGroup}
     */
    get crossReferenceEdgeGroup() {
      return this.$crossReferenceEdgeGroup
    }

    /**
     * Sets the cross reference canvas group.
     * @param {yfiles.view.ICanvasObjectGroup} value The given canvas group.
     */
    set crossReferenceEdgeGroup(value) {
      this.$crossReferenceEdgeGroup = value
    }

    /**
     * Retrieves the Canvas Object group to use for the given item.
     * @param {yfiles.graph.IModelItem} modelItem The given item.
     * @return {yfiles.view.ICanvasObjectGroup}
     */
    getCanvasObjectGroup(modelItem) {
      if (yfiles.graph.IEdge.isInstance(modelItem)) {
        if (MindmapUtil.Structure.isCrossReference(modelItem)) {
          return this.crossReferenceEdgeGroup
        }
        return this.edgeGroup
      } else if (yfiles.graph.INode.isInstance(modelItem)) {
        return this.nodeGroup
      } else if (
        yfiles.graph.ILabel.isInstance(modelItem) &&
        yfiles.graph.INode.isInstance(modelItem.owner)
      ) {
        return this.nodeLabelGroup
      } else if (
        yfiles.graph.ILabel.isInstance(modelItem) &&
        yfiles.graph.IEdge.isInstance(modelItem.owner)
      ) {
        return this.edgeLabelGroup
      }
      return this.contentGroup
    }
  }

  return MindmapGraphModelManager
})
