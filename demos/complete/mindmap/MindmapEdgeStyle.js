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
  EdgeStyleBase,
  GeneralPath,
  HtmlCanvasVisual,
  IEdge,
  IInputModeContext,
  INode,
  IRenderContext,
  Point,
  Visual
} from 'yfiles'

/**
 * An edge style that draws a smooth bezier curve with color- and thickness-interpolation between start- and endpoint.
 */
export default class MindmapEdgeStyle extends EdgeStyleBase {
  /**
   * Creates the edge style.
   * @param {number} thicknessStart The thickness of the edge at its start.
   * @param {number} thicknessEnd The thickness of the edge at its end.
   */
  constructor(thicknessStart, thicknessEnd) {
    super()
    this.$thicknessStart = thicknessStart
    this.$thicknessEnd = thicknessEnd
  }

  /**
   * Gets the thickness of the edge at its start.
   * @return {number}
   */
  get thicknessStart() {
    return this.$thicknessStart
  }

  /**
   * Sets the thickness of the edge at its start.
   * @param {number} value The thickness to be set.
   */
  set thicknessStart(value) {
    this.$thicknessStart = value
  }

  /**
   * Gets the thickness of the edge at its end.
   * @return {number}
   */
  get thicknessEnd() {
    return this.$thicknessEnd
  }

  /**
   * Sets the thickness of the edge at its end.
   * @param {number} value The thickness to be set.
   */
  set thicknessEnd(value) {
    this.$thicknessEnd = value
  }

  /**
   * Creates the visual.
   * @param {IRenderContext} context The render context.
   * @param {IEdge} edge The edge to which this style instance is assigned.
   * @see Overrides {@link EdgeStyleBase#createVisual}
   * @return {Visual}
   */
  createVisual(context, edge) {
    return new MindmapCanvasVisual(edge, this.thicknessStart, this.thicknessEnd)
  }

  /**
   * Updates the visual.
   * @param {IRenderContext} context The render context.
   * @param {Visual} oldVisual The old visual.
   * @param {IEdge} edge The edge to which this style instance is assigned.
   * @see Overrides {@link EdgeStyleBase#updateVisual}
   * @return {Visual}
   */
  updateVisual(context, oldVisual, edge) {
    // old state of edge
    const thicknessStart = oldVisual['data-thicknessStart']
    const thicknessEnd = oldVisual['data-thicknessEnd']

    if (thicknessStart !== this.thicknessStart || thicknessEnd !== this.thicknessEnd) {
      // if something changed, re-create the visual from scratch
      oldVisual = this.createVisual(context, edge)
    }
    return oldVisual
  }

  /**
   * Hit-test of the edge style.
   * Mindmap edges should not be clicked, selected or hovered. Thus, the hit-test returns false.
   * @param {IInputModeContext} canvasContext The canvas context.
   * @param {Point} p The point to test.
   * @param {INode} edge The given edge.
   * @see Overrides {@link EdgeStyleBase#isHit}
   * @return {boolean}
   */
  isHit(canvasContext, p, edge) {
    return false
  }
}

/**
 * Contains the actual rendering logic of the edge.
 * This class uses canvas rendering to visualize the edge.
 */
class MindmapCanvasVisual extends HtmlCanvasVisual {
  /**
   * Creates the canvas visual.
   * @param {IEdge} edge The given edge.
   * @param {number} thicknessStart The thickness of the edge at its start.
   * @param {number} thicknessEnd The thickness of the edge at its end.
   */
  constructor(edge, thicknessStart, thicknessEnd) {
    super()
    this.edge = edge
    this.thicknessStart = thicknessStart
    this.thicknessEnd = thicknessEnd
    this.$points = null

    // initialize the path data to null
    this['data-path'] = null
  }

  /**
   * Gets the array of points after flattening the path.
   * @return {Point[]} The edge path.
   */
  get points() {
    return this.$points
  }

  /**
   * Sets the array of points after flattening the path.
   * @param {Point[]} value The path to be set.
   */
  set points(value) {
    this.$points = value
  }

  /**
   * Renders the edge.
   * @param {IRenderContext} renderContext The render context.
   * @param {CanvasRenderingContext2D} ctx The HTML5 Canvas context.
   * @see Overrides {@link HtmlCanvasVisual#paint}
   */
  paint(renderContext, ctx) {
    ctx.save()
    ctx.beginPath()
    const p = MindmapCanvasVisual.createCurvedPath(this.edge)
    // if path segments have not changed, the old points along the path can be reused
    const oldPath = this['data-path']
    if (!p.hasSameValue(oldPath)) {
      // if path segments have changed, compute new points along path
      const flattenedPath = p.flatten(0.01)
      this.points = MindmapCanvasVisual.getPoints(flattenedPath)
    }

    // draw edge path
    const startColor = MindmapCanvasVisual.hexToRgb(this.edge.sourceNode.tag.color)
    const endColor = MindmapCanvasVisual.hexToRgb(this.edge.targetNode.tag.color)
    MindmapCanvasVisual.drawEdgePath(
      this.thicknessStart,
      this.thicknessEnd,
      startColor,
      endColor,
      this.points,
      ctx
    )

    ctx.restore()

    // save the data used to create the visualization
    this['data-path'] = p
    this['data-thicknessStart'] = this.thicknessStart
    this['data-thicknessEnd'] = this.thicknessEnd
  }

  /**
   * Return equidistant points on path.
   * Quality of curve rendering may be adjusted by setting MAX_SEGMENTS.
   * @return {Point[]}
   */
  static getPoints(path) {
    const MAX_SEGMENTS = 50
    const points = []

    const lInc = 1.0 / MAX_SEGMENTS
    for (let i = 0; i <= MAX_SEGMENTS; i++) {
      points[i] = path.getPoint(lInc * i)
    }
    return points
  }

  /**
   * Draw the edge consisting of concatenated line segments of varying thickness and color.
   * Intermediate values of color components (r,g,b) and thickness (w) are computed using linear interpolation.
   * @param {number} startThickness The thickness start.
   * @param {number} endThickness The thickness end.
   * @param {object} startColor The color of the edge at its start.
   * @param {object} endColor The color of the edge at its end.
   * @param {Point[]} points The thickness start
   * @param {CanvasRenderingContext2D} ctx The HTML5 Canvas context.
   */
  static drawEdgePath(startThickness, endThickness, startColor, endColor, points, ctx) {
    let /** @type {Point} */ x0
    let /** @type {Point} */ x1

    const rS = startColor.r
    const rE = endColor.r
    const gS = startColor.g
    const gE = endColor.g
    const bS = startColor.b
    const bE = endColor.b

    const linc = 1.0 / points.length
    // compute the increments for thickness and color components for each step
    const wDelta = (endThickness - startThickness) * linc
    const rDelta = (rE - rS) * linc
    const gDelta = (gE - gS) * linc
    const bDelta = (bE - bS) * linc
    // initialize the start values for thickness and color components
    let w = startThickness
    let r = rS
    let g = gS
    let b = bS

    ctx.lineCap = 'round'

    for (let i = 0; i < points.length - 1; i++) {
      x0 = points[i]
      x1 = points[i + 1]

      // compute the thickness and color values for current line segment by adding increment
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
   * Creates curved path segment using edge bends as control points.
   * If no bends are available, create a straight line.
   * @param {IEdge} edge The given edge.
   * @return {GeneralPath}
   */
  static createCurvedPath(edge) {
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
   * @param {string} hex The hex to be converted.
   * @return {Object} The color in rgb format.
   */
  static hexToRgb(hex) {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return rgb
      ? {
          r: parseInt(rgb[1], 16),
          g: parseInt(rgb[2], 16),
          b: parseInt(rgb[3], 16)
        }
      : null
  }
}
