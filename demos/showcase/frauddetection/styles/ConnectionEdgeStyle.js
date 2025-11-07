/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { EdgeStyleBase, HtmlCanvasVisual } from '@yfiles/yfiles'
import { getStroke } from './graph-styles'

/**
 * A very basic edge style that uses HTML canvas high-performance rendering.
 * Arrows are not supported by this implementation.
 */
export class ConnectionEdgeStyle extends EdgeStyleBase {
  /**
   * Creates the visual for an edge.
   */
  createVisual(context, edge) {
    return new EdgeRenderVisual(edge)
  }

  /**
   * Updates the visual for an edge.
   */
  updateVisual(context, oldVisual, edge) {
    return oldVisual
  }

  /**
   * Determines whether the visual representation of the edge has been hit at the given location.
   */
  isHit(canvasContext, p, edge) {
    // we use a basic hit logic here (the base implementation)
    if (!super.isHit(canvasContext, p, edge)) {
      return false
    }

    // but we exclude hits on the source and target node
    const s = edge.sourceNode
    const t = edge.targetNode
    return (
      !s.style.renderer.getHitTestable(s, s.style).isHit(canvasContext, p) &&
      !t.style.renderer.getHitTestable(t, t.style).isHit(canvasContext, p)
    )
  }
}

/**
 * For HTML Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class EdgeRenderVisual extends HtmlCanvasVisual {
  edge

  /**
   * Creates an EdgeRenderVisual for the given edge with the given thickness.
   */
  constructor(edge) {
    super()
    this.edge = edge
    this.edge = edge
  }

  /**
   * Paints onto the context using HTML Canvas operations.
   */
  render(context, ctx) {
    ctx.save()
    ctx.beginPath()
    let location = this.edge.sourcePort.location
    ctx.moveTo(location.x, location.y)
    this.edge.bends.forEach((bend) => {
      location = bend.location
      ctx.lineTo(location.x, location.y)
    })
    location = this.edge.targetPort.location
    ctx.lineTo(location.x, location.y)
    ctx.lineWidth = 5
    ctx.strokeStyle = getStroke(this.edge)
    ctx.stroke()
    ctx.restore()
  }
}
