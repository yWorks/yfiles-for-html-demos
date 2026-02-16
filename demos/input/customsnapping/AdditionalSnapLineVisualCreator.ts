/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  type IEnumerable,
  type IRenderContext,
  IVisualCreator,
  List,
  OrthogonalSnapLine,
  type Point,
  SnapLineOrientation,
  SnapLineSnapTypes,
  SnapReferenceVisualizationType,
  SvgVisual,
  type Visual
} from '@yfiles/yfiles'

/**
 * A visual creator for orthogonal snap lines.
 */
export class AdditionalSnapLineVisualCreator extends BaseClass(IVisualCreator) {
  to: Point
  from: Point

  /**
   * Creates a new instance of {@link AdditionalSnapLineVisualCreator}.
   * @param from The start point
   * @param to The end point
   */
  constructor(from: Point, to: Point) {
    super()
    this.from = from
    this.to = to
  }

  /**
   * Creates the {@link OrthogonalSnapLine}s that are displayed by this visual creator.
   * Since items should be able to snap from both sides to this line, two snap lines with the same location and
   * different {@link SnapLineSnapTypes}s are created.
   */
  createSnapLines(): IEnumerable<OrthogonalSnapLine> {
    const lines = new List<OrthogonalSnapLine>()
    if (this.from.x === this.to.x) {
      // it's vertical
      lines.add(
        new OrthogonalSnapLine(
          SnapLineOrientation.VERTICAL,
          SnapLineSnapTypes.LEFT,
          SnapReferenceVisualizationType.FIXED_LINE,
          this.from.add(this.to).multiply(0.5),
          this.from.y,
          this.to.y,
          false,
          50
        )
      )
      lines.add(
        new OrthogonalSnapLine(
          SnapLineOrientation.VERTICAL,
          SnapLineSnapTypes.RIGHT,
          SnapReferenceVisualizationType.FIXED_LINE,
          this.from.add(this.to).multiply(0.5),
          this.from.y,
          this.to.y,
          false,
          50
        )
      )
    } else if (this.from.y === this.to.y) {
      // it's horizontal
      lines.add(
        new OrthogonalSnapLine(
          SnapLineOrientation.HORIZONTAL,
          SnapLineSnapTypes.TOP,
          SnapReferenceVisualizationType.FIXED_LINE,
          this.from.add(this.to).multiply(0.5),
          this.from.x,
          this.to.x,
          false,
          50
        )
      )
      lines.add(
        new OrthogonalSnapLine(
          SnapLineOrientation.HORIZONTAL,
          SnapLineSnapTypes.BOTTOM,
          SnapReferenceVisualizationType.FIXED_LINE,
          this.from.add(this.to).multiply(0.5),
          this.from.x,
          this.to.x,
          false,
          50
        )
      )
    }
    return lines
  }

  /**
   * Creates the visual for the orthogonal snap lines.
   */
  createVisual(context: IRenderContext): Visual {
    const line = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', this.from.x.toString())
    line.setAttribute('y1', this.from.y.toString())
    line.setAttribute('x2', this.to.x.toString())
    line.setAttribute('y2', this.to.y.toString())
    line.setAttribute('stroke-width', '2')
    line.setAttribute('stroke', '#CA0C3B')
    return new SvgVisual(line)
  }

  /**
   * Updates a previously created visual.
   */
  updateVisual(ctx: IRenderContext, oldVisual: Visual): Visual {
    const visual = oldVisual instanceof SvgVisual ? oldVisual : null
    if (visual === null || visual.svgElement === null || visual.svgElement.tagName !== 'line') {
      return this.createVisual(ctx)
    }
    const line = visual.svgElement
    line.setAttribute('x1', this.from.x.toString())
    line.setAttribute('y1', this.from.y.toString())
    line.setAttribute('x2', this.to.x.toString())
    line.setAttribute('y2', this.to.y.toString())
    return oldVisual
  }
}
