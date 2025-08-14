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
import { EdgeStyleBase, GeneralPath, HtmlCanvasVisual } from '@yfiles/yfiles'
import { getNodeData } from '../data-types'

/**
 * An edge style that draws a smooth Bézier curve with color and thickness interpolation
 * between the source and the target nodes.
 */
export class MindMapEdgeStyle extends EdgeStyleBase {
  thicknessStart
  thicknessEnd
  /**
   * Creates the edge style as a Bézier curve using the given thicknesses.
   * @param thicknessStart The thickness of the edge at its start.
   * @param thicknessEnd The thickness of the edge at its end.
   */
  constructor(thicknessStart, thicknessEnd) {
    super()
    this.thicknessStart = thicknessStart
    this.thicknessEnd = thicknessEnd
  }

  /**
   * Creates the visual for the edge using an HTML canvas visual.
   */
  createVisual(context, edge) {
    return new MindMapCanvasVisual(edge, this.thicknessStart, this.thicknessEnd)
  }

  /**
   * Updates the visual for the edge.
   * If the edge thickness has changed, the edge visual has to be re-created.
   * Otherwise, the old visual will be used instead.
   */
  updateVisual(context, oldVisual, edge) {
    // old state of edge
    const thicknessStart = oldVisual.cachedThicknessStart
    const thicknessEnd = oldVisual.cachedThicknessEnd
    if (thicknessStart !== this.thicknessStart || thicknessEnd !== this.thicknessEnd) {
      // if something changed, re-create the visual from scratch
      oldVisual = this.createVisual(context, edge)
    }
    return oldVisual
  }

  /**
   * Hit-test of the edge style.
   * Mind map edges should not be clicked, selected or hovered.
   * Thus, the hit-test should always return false.
   */
  isHit(canvasContext, p, edge) {
    return false
  }
}

/**
 * Contains the actual rendering logic of the edge.
 * This class uses HTML canvas rendering to visualize the edge.
 */
class MindMapCanvasVisual extends HtmlCanvasVisual {
  edge
  thicknessStart
  thicknessEnd
  // The cached path to use during updates
  cachedPath = null
  // The cached start thickness to use during updates
  cachedThicknessStart = 0
  // The cached end thickness to use during updates
  cachedThicknessEnd = 0

  /**
   * The array of points after flattening the path.
   */
  points = []

  /**
   * Creates the canvas visual.
   * @param edge The given edge.
   * @param thicknessStart The thickness of the edge at its start.
   * @param thicknessEnd The thickness of the edge at its end.
   */
  constructor(edge, thicknessStart, thicknessEnd) {
    super()
    this.edge = edge
    this.thicknessStart = thicknessStart
    this.thicknessEnd = thicknessEnd
    this.edge = edge
    this.thicknessStart = thicknessStart
    this.thicknessEnd = thicknessEnd
  }

  /**
   * Renders the edge as a flattened Bézier path.
   */
  render(renderContext, ctx) {
    ctx.save()
    ctx.beginPath()
    // create the new path for the edge
    const p = this.createCurvedPath()
    // if path segments have not changed, the old points along the path can be reused
    if (!p.hasSameValue(this.cachedPath)) {
      // if path segments have changed,
      // compute new points along the path by flattening the Bézier path
      const flattenedPath = p.flatten(0.01)
      this.points = this.getPoints(flattenedPath)
    }

    // draw the edge path based on the color of the source/target node
    const startColor = MindMapCanvasVisual.hexToRgb(getNodeData(this.edge.sourceNode).color)
    const endColor = MindMapCanvasVisual.hexToRgb(getNodeData(this.edge.targetNode).color)
    this.drawEdgePath(startColor, endColor, ctx)

    ctx.restore()

    // save the data used to create the visualization
    this.cachedPath = p
    this.cachedThicknessStart = this.thicknessStart
    this.cachedThicknessEnd = this.thicknessEnd
  }

  /**
   * Returns equidistant points on the edge path.
   * The quality of the curve rendering may be adjusted by setting MAX_SEGMENTS.
   * For larger thicknesses, we use more points, for smaller thicknesses less.
   */
  getPoints(path) {
    const MAX_SEGMENTS = this.thicknessStart > 8 ? 100 : 15
    const points = []

    const lInc = 1.0 / MAX_SEGMENTS
    for (let i = 0; i <= MAX_SEGMENTS; i++) {
      points[i] = path.getPoint(lInc * i)
    }
    return points
  }

  /**
   * Draws the edge consisting of concatenated line segments of varying thickness and color.
   * Intermediate values of color components (r,g,b) and thickness (w) are computed using linear interpolation.
   * @param startColor The color of the edge at its start.
   * @param endColor The color of the edge at its end.
   * @param ctx The HTML Canvas context.
   */
  drawEdgePath(startColor, endColor, ctx) {
    const rS = startColor.r
    const rE = endColor.r
    const gS = startColor.g
    const gE = endColor.g
    const bS = startColor.b
    const bE = endColor.b

    const linc = 1.0 / this.points.length
    // compute the increments for thickness and color components for each step
    const wDelta = (this.thicknessEnd - this.thicknessStart) * linc
    const rDelta = (rE - rS) * linc
    const gDelta = (gE - gS) * linc
    const bDelta = (bE - bS) * linc
    // initialize the start values for thickness and color components
    let w = this.thicknessStart
    let r = rS
    let g = gS
    let b = bS

    ctx.lineCap = 'round'

    let x0
    let x1
    for (let i = 0; i < this.points.length - 1; i++) {
      x0 = this.points[i]
      x1 = this.points[i + 1]

      // compute the thickness and color values for the current line segment by adding increment
      w += wDelta
      r += rDelta
      g += gDelta
      b += bDelta

      ctx.strokeStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`
      ctx.lineWidth = w

      // create the line segment
      ctx.beginPath()
      ctx.moveTo(x0.x, x0.y)
      ctx.lineTo(x1.x, x1.y)
      ctx.stroke()
    }
  }

  /**
   * Creates a curved path segment using edge bends as control points.
   * If no bends are available, a straight line is created.
   */
  createCurvedPath() {
    const edge = this.edge
    const p = new GeneralPath()
    if (edge.bends.size >= 2) {
      p.moveTo(edge.sourcePort.location.toPoint())
      p.cubicTo(
        edge.bends.get(0).location.toPoint(),
        edge.bends.get(1).location.toPoint(),
        edge.targetPort.location.toPoint()
      )
    } else {
      p.moveTo(edge.sourcePort.location.toPoint())
      p.lineTo(edge.targetPort.location.toPoint())
    }
    return p
  }

  /**
   * Converts a hex to rgb color.
   * @param hex The hex to be converted.
   * @returns The color in rgb format.
   */
  static hexToRgb(hex) {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return rgb
      ? { r: parseInt(rgb[1], 16), g: parseInt(rgb[2], 16), b: parseInt(rgb[3], 16) }
      : { r: 255, g: 255, b: 255 }
  }
}
