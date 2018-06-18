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

define([
  'yfiles/view-layout-bridge',
  'IsometricTransformationSupport.js',
  'IsometricTransformationStage.js'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  IsometricTransformationSupport,
  IsometricTransformationStage
) => {
  /**
   * When the user opens/closes a folder/group node by clicking its state icon, the layout algorithm calculates a new
   * layout. This {@link y.layout.ILayoutStage} moves the graph afterwards so, that the state icon of the group/folder
   * node remains under the mouse cursor.
   */
  class FixGroupStateIconStage extends yfiles.layout.FixNodeLayoutStage {
    /**
     * Overwritten to fix the lower left corner (where the state icon is placed) of the isometric painted folder/group
     * node.
     * @param {yfiles.layout.LayoutGraph} graph
     * @param {yfiles.algorithms.NodeList} fixedNodes
     * @return {yfiles.algorithms.YPoint}
     */
    calculateFixPoint(graph, fixedNodes) {
      const node = fixedNodes.firstNode()
      const provider = graph.getDataProvider(
        IsometricTransformationStage.TRANSFORMATION_DATA_DP_KEY
      )
      const geometry = provider.get(node)

      const corners = IsometricTransformationSupport.calculateCorners(geometry)
      const nodeLayout = graph.getLayout(node)
      IsometricTransformationSupport.moveTo(nodeLayout.x, nodeLayout.y, corners)
      return new yfiles.algorithms.YPoint(
        corners[IsometricTransformationSupport.C3_X],
        corners[IsometricTransformationSupport.C3_Y]
      )
    }
  }

  return FixGroupStateIconStage
})
