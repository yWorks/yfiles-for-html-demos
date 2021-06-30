/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  EdgeStyleBase,
  HtmlCanvasVisual,
  IBend,
  IEdge,
  IInputModeContext,
  INode,
  IRectangle,
  IRenderContext,
  NodeStyleBase,
  Point,
  Visual,
  IListEnumerable,
  IPoint
} from 'yfiles'

/**
 * A very basic high-performance node style implementation that uses HTML5 Canvas rendering.
 */
export class InteractiveOrganicFastNodeStyle extends NodeStyleBase {
  /**
   * @param {!IRenderContext} renderContext
   * @param {!INode} node
   * @returns {!NodeRenderVisual}
   */
  createVisual(renderContext, node) {
    return new NodeRenderVisual(node.layout)
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!Visual} oldVisual
   * @param {!INode} node
   * @returns {!Visual}
   */
  updateVisual(renderContext, oldVisual, node) {
    return oldVisual
  }
}

/**
 * For HTML5 Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class NodeRenderVisual extends HtmlCanvasVisual {
  /**
   * Creates a new instance of NodeRenderVisual.
   * @param {!IRectangle} layout A live view of the layout of a node.
   */
  constructor(layout) {
    super()
    this.layout = layout
  }

  /**
   * Draw a rectangle with a solid orange fill.
   * @see Overrides {@link HtmlCanvasVisual#paint}
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   */
  paint(renderContext, ctx) {
    ctx.fillStyle = 'rgba(255,140,0,1)'
    const l = this.layout
    ctx.fillRect(l.x, l.y, l.width, l.height)
  }
}

/**
 * A very basic high-performance edge style that uses HTML 5 canvas rendering.
 * Arrows are not supported by this implementation.
 */
export class InteractiveOrganicFastEdgeStyle extends EdgeStyleBase {
  /**
   * @param {!IRenderContext} renderContext
   * @param {!IEdge} edge
   * @returns {!EdgeRenderVisual}
   */
  createVisual(renderContext, edge) {
    return new EdgeRenderVisual(
      edge.bends,
      edge.sourcePort.dynamicLocation,
      edge.targetPort.dynamicLocation
    )
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} location
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isHit(context, location, edge) {
    // we use a very simple hit logic here (the base implementation)
    if (!super.isHit(context, location, edge)) {
      return false
    }

    // but we exclude hits on the source and target node
    const s = edge.sourceNode
    const t = edge.targetNode
    return (
      !s.style.renderer.getHitTestable(s, s.style).isHit(context, location) &&
      !t.style.renderer.getHitTestable(t, t.style).isHit(context, location)
    )
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!Visual} oldVisual
   * @param {!IEdge} edge
   * @returns {!Visual}
   */
  updateVisual(renderContext, oldVisual, edge) {
    return oldVisual
  }
}

/**
 * For HTML5 Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class EdgeRenderVisual extends HtmlCanvasVisual {
  /**
   * @param {!IListEnumerable.<IBend>} bends
   * @param {!IPoint} sourcePortLocation
   * @param {!IPoint} targetPortLocation
   */
  constructor(bends, sourcePortLocation, targetPortLocation) {
    super()
    this.targetPortLocation = targetPortLocation
    this.sourcePortLocation = sourcePortLocation
    this.bends = bends
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   */
  paint(renderContext, ctx) {
    // simply draw a blue line from the source port location via all bends to the target port location
    ctx.strokeStyle = 'rgb(51,102,153)'

    ctx.beginPath()
    let location = this.sourcePortLocation
    ctx.moveTo(location.x, location.y)
    if (this.bends.size > 0) {
      this.bends.forEach(bend => {
        location = bend.location.toPoint()
        ctx.lineTo(location.x, location.y)
      })
    }
    location = this.targetPortLocation
    ctx.lineTo(location.x, location.y)
    ctx.stroke()
  }
}
