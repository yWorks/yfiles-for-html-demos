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

define(['yfiles/view-editor'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Customizes the grid snapping behavior of NodeSnapResultProvider by providing SnapResults for each point of the
   * node's shape path instead of the node's center.
   * @extends yfiles.input.NodeSnapResultProvider
   */
  class ShapeBasedGridNodeSnapResultProvider extends yfiles.input.NodeSnapResultProvider {
    /**
     * Collects snap results that snap the node to a grid and adds them to the argument.
     * @param {yfiles.input.GraphSnapContext} context The context in which the snapping is performed
     * @param {yfiles.input.CollectSnapResultsEventArgs} args The arguments to add the results to
     * @param {yfiles.geometry.Rect} suggestedLayout The layout of the node if it would move without snapping
     * @param {yfiles.graph.INode} node The node that is currently being processed
     */
    collectGridSnapResults(context, args, suggestedLayout, node) {
      // node.Layout isn't updated, yet, so we have to calculate the delta between the the new suggested layout and the
      // current node.Layout
      const delta = new yfiles.geometry.Point(
        suggestedLayout.topLeft.x - node.layout.topLeft.x,
        suggestedLayout.topLeft.y - node.layout.topLeft.y
      )

      // get outline of the shape and iterate over it's path point
      const geometry = node.style.renderer.getShapeGeometry(node, node.style)
      const outline = geometry.getOutline()
      if (outline === null) {
        return
      }

      const cursor = outline.createCursor()
      while (cursor.moveNext()) {
        // ignore PathType.Close as we had the path point as first point
        // and cursor.CurrentEndPoint is always (0, 0) for PathType.Close
        if (cursor.pathType !== yfiles.geometry.PathType.CLOSE) {
          // adjust path point by the delta calculated above and add an according SnapResult
          const endPoint = cursor.currentEndPoint.add(delta)
          this.addGridSnapResultCore(
            context,
            args,
            endPoint,
            node,
            yfiles.input.GridSnapTypes.GRID_POINTS,
            yfiles.input.SnapPolicy.TO_NEAREST,
            yfiles.input.SnapPolicy.TO_NEAREST
          )
        }
      }
    }
  }

  return ShapeBasedGridNodeSnapResultProvider
})
