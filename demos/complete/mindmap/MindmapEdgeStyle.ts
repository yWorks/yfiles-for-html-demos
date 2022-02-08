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
import {
  EdgeStyleBase,
  GeneralPath,
  HtmlCanvasVisual,
  IEdge,
  IInputModeContext,
  IRenderContext,
  Point,
  Visual
} from 'yfiles'
import type { NodeData } from './MindmapUtil'

/**
 * An edge style that draws a smooth bezier curve with color- and thickness-interpolation between start- and endpoint.
 */
export default class MindmapEdgeStyle extends EdgeStyleBase {
  /**
   * Creates the edge style.
   * @param thicknessStart The thickness of the edge at its start.
   * @param thicknessEnd The thickness of the edge at its end.
   */
  constructor(public thicknessStart: number, public thicknessEnd: number) {
    super()
  }

  /**
   * Creates the visual.
   * @param context The render context.
   * @param edge The edge to which this style instance is assigned.
   * @see Overrides {@link EdgeStyleBase#createVisual}
   */
  createVisual(context: IRenderContext, edge: IEdge): Visual {
    return new MindmapCanvasVisual(edge, this.thicknessStart, this.thicknessEnd)
  }

  /**
   * Updates the visual.
   * @param context The render context.
   * @param oldVisual The old visual.
   * @param edge The edge to which this style instance is assigned.
   * @see Overrides {@link EdgeStyleBase#updateVisual}
   */
  updateVisual(context: IRenderContext, oldVisual: Visual, edge: IEdge): Visual {
    // old state of edge
    const thicknessStart = (oldVisual as MindmapCanvasVisual).cachedThicknessStart
    const thicknessEnd = (oldVisual as MindmapCanvasVisual).cachedThicknessEnd
    if (thicknessStart !== this.thicknessStart || thicknessEnd !== this.thicknessEnd) {
      // if something changed, re-create the visual from scratch
      oldVisual = this.createVisual(context, edge)
    }
    return oldVisual
  }

  /**
   * Hit-test of the edge style.
   * Mindmap edges should not be clicked, selected or hovered. Thus, the hit-test returns false.
   * @param canvasContext The canvas context.
   * @param p The point to test.
   * @param edge The given edge.
   * @see Overrides {@link EdgeStyleBase#isHit}
   */
  isHit(canvasContext: IInputModeContext, p: Point, edge: IEdge): boolean {
    return false
  }
}

/**
 * Contains the actual rendering logic of the edge.
 * This class uses canvas rendering to visualize the edge.
 */
class MindmapCanvasVisual extends HtmlCanvasVisual {
  edge: IEdge
  thicknessStart: number
  thicknessEnd: number
  private cachedPath: GeneralPath | null
  cachedThicknessStart = 0
  cachedThicknessEnd = 0

  /**
   * Creates the canvas visual.
   * @param edge The given edge.
   * @param thicknessStart The thickness of the edge at its start.
   * @param thicknessEnd The thickness of the edge at its end.
   */
  constructor(edge: IEdge, thicknessStart: number, thicknessEnd: number) {
    super()
    this.edge = edge
    this.thicknessStart = thicknessStart
    this.thicknessEnd = thicknessEnd

    // initialize the path data to null
    this.cachedPath = null
  }

  /**
   * Gets or sets the array of points after flattening the path.
   * @return The edge path.
   */
  public points: Point[] = null!

  /**
   * Renders the edge.
   * @param renderContext The render context.
   * @param ctx The HTML5 Canvas context.
   * @see Overrides {@link HtmlCanvasVisual#paint}
   */
  paint(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.beginPath()
    const p = MindmapCanvasVisual.createCurvedPath(this.edge)
    // if path segments have not changed, the old points along the path can be reused
    const oldPath = this.cachedPath
    if (!p.hasSameValue(oldPath)) {
      // if path segments have changed, compute new points along path
      const flattenedPath = p.flatten(0.01)
      this.points = MindmapCanvasVisual.getPoints(flattenedPath)
    }

    // draw edge path
    const startColor = MindmapCanvasVisual.hexToRgb(this.edge.sourceNode!.tag.color)
    const endColor = MindmapCanvasVisual.hexToRgb(this.edge.targetNode!.tag.color)
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
    this.cachedPath = p
    this.cachedThicknessStart = this.thicknessStart
    this.cachedThicknessEnd = this.thicknessEnd
  }

  /**
   * Return equidistant points on path.
   * Quality of curve rendering may be adjusted by setting MAX_SEGMENTS.
   */
  static getPoints(path: GeneralPath): Point[] {
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
   * @param startThickness The thickness start.
   * @param endThickness The thickness end.
   * @param startColor The color of the edge at its start.
   * @param endColor The color of the edge at its end.
   * @param points The thickness start
   * @param ctx The HTML5 Canvas context.
   */
  static drawEdgePath(
    startThickness: number,
    endThickness: number,
    startColor: RGB,
    endColor: RGB,
    points: Point[],
    ctx: CanvasRenderingContext2D
  ): void {
    let x0: Point
    let x1: Point

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
    let w: number = startThickness
    let r: number = rS
    let g: number = gS
    let b: number = bS

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
   * @param edge The given edge.
   */
  static createCurvedPath(edge: IEdge): GeneralPath {
    const p = new GeneralPath()
    if (edge.bends.size >= 2) {
      p.moveTo(edge.sourcePort!.location.toPoint())
      p.cubicTo(
        edge.bends.get(0).location.toPoint(),
        edge.bends.get(1).location.toPoint(),
        edge.targetPort!.location.toPoint()
      )
    } else {
      p.moveTo(edge.sourcePort!.location.toPoint())
      p.lineTo(edge.targetPort!.location.toPoint())
    }
    return p
  }

  /**
   * Converts a hex to rgb color.
   * @param hex The hex to be converted.
   * @return The color in rgb format.
   */
  static hexToRgb(hex: string): RGB {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return rgb
      ? {
          r: parseInt(rgb[1], 16),
          g: parseInt(rgb[2], 16),
          b: parseInt(rgb[3], 16)
        }
      : { r: 0, g: 0, b: 0 }
  }
}

type RGB = { r: number; g: number; b: number }
