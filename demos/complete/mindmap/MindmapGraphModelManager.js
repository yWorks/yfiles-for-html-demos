/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphModelManager,
  HierarchicNestingPolicy,
  ICanvasObjectGroup,
  IEdge,
  ILabel,
  IModelItem,
  INode
} from 'yfiles'
import { Structure } from './MindmapUtil.js'

/**
 * Provides a special {@link ICanvasObjectGroup} for cross reference edges
 * or delegates to the wrapped implementation.
 */
export default class MindmapGraphModelManager extends GraphModelManager {
  /**
   * Constructs the GraphModelManager.
   * @param {GraphComponent} graphComponent The given graphComponent.
   * @param {ICanvasObjectGroup} contentGroup The content group.
   */
  constructor(graphComponent, contentGroup) {
    super(graphComponent, contentGroup)
    this.$crossReferenceEdgeGroup = this.createContentGroup()
    this.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES
  }

  /**
   * Gets the cross reference canvas group.
   * @return {ICanvasObjectGroup}
   */
  get crossReferenceEdgeGroup() {
    return this.$crossReferenceEdgeGroup
  }

  /**
   * Sets the cross reference canvas group.
   * @param {ICanvasObjectGroup} value The given canvas group.
   */
  set crossReferenceEdgeGroup(value) {
    this.$crossReferenceEdgeGroup = value
  }

  /**
   * Retrieves the Canvas Object group to use for the given item.
   * @param {IModelItem} modelItem The given item.
   * @return {ICanvasObjectGroup}
   */
  getCanvasObjectGroup(modelItem) {
    if (IEdge.isInstance(modelItem)) {
      if (Structure.isCrossReference(modelItem)) {
        return this.crossReferenceEdgeGroup
      }
      return this.edgeGroup
    } else if (INode.isInstance(modelItem)) {
      return this.nodeGroup
    } else if (ILabel.isInstance(modelItem) && INode.isInstance(modelItem.owner)) {
      return this.nodeLabelGroup
    } else if (ILabel.isInstance(modelItem) && IEdge.isInstance(modelItem.owner)) {
      return this.edgeLabelGroup
    }
    return this.contentGroup
  }
}
