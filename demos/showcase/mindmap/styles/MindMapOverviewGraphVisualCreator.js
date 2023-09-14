/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphOverviewCanvasVisualCreator } from 'yfiles'

/**
 * Provides functionality for customizing the style of overview component.
 */
export class MindMapOverviewGraphVisualCreator extends GraphOverviewCanvasVisualCreator {
  /**
   * Draws each node with a round rectangle.
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!INode} node
   */
  paintNode(renderContext, ctx, node) {
    ctx.fillStyle = 'rgb(200, 200, 200)'
    ctx.strokeStyle = 'rgb(0,0,0)'
    const { x, y, width, height } = node.layout
    ctx.save()
    ctx.beginPath()
    if ('roundRect' in ctx) {
      ctx.roundRect(x, y, width, height, [30])
    } else {
      ctx.rect(x, y, width, height)
    }

    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  /**
   * Draws each edge as a straight-line segment.
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!IEdge} edge
   */
  paintEdge(renderContext, ctx, edge) {
    ctx.beginPath()
    ctx.moveTo(edge.sourceNode.layout.center.x, edge.sourceNode.layout.center.y)
    ctx.lineTo(edge.targetNode.layout.center.x, edge.targetNode.layout.center.y)
    ctx.stroke()
  }
}
