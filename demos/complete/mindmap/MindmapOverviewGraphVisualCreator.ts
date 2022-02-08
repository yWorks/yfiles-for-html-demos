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
import { GraphOverviewCanvasVisualCreator, IEdge, INode, IRenderContext } from 'yfiles'
import { isRoot } from './MindmapUtil'

/**
 * The class provides functionality for custom style of overview control.
 */
export default class MindmapOverviewGraphVisualCreator extends GraphOverviewCanvasVisualCreator {
  /**
   * Custom node painting code.
   * @param renderContext The render context.
   * @param ctx The HTML canvas rendering context.
   * @param node The node to which this style instance is assigned.
   * @see Overrides {@link GraphOverviewCanvasVisualCreator#paintNode}
   */
  paintNode(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, node: INode): void {
    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.strokeStyle = 'rgb(0,0,0)'
    const layout = node.layout
    if (isRoot(node)) {
      ctx.save()
      ctx.translate(layout.center.x, layout.center.y)
      ctx.scale(1, layout.height / layout.width)
      ctx.beginPath()
      ctx.arc(0, 0, layout.width / 2, 0, 2 * Math.PI, false)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    } else {
      ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
      ctx.beginPath()
      ctx.moveTo(layout.bottomLeft.x, layout.bottomLeft.y)
      ctx.lineTo(layout.bottomRight.x, layout.bottomRight.y)
      ctx.stroke()
    }
  }

  /**
   * Custom edge painting code.
   * @param renderContext The render context.
   * @param ctx The HTML canvas rendering context.
   * @param edge The edge to which this style instance is assigned.
   * @see Overrides {@link GraphOverviewCanvasVisualCreator#paintEdge}
   */
  paintEdge(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, edge: IEdge): void {
    ctx.beginPath()
    ctx.moveTo(edge.sourcePort!.location.x, edge.sourcePort!.location.y)
    ctx.lineTo(edge.targetPort!.location.x, edge.targetPort!.location.y)
    ctx.stroke()
  }
}
