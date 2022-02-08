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
  BaseClass,
  IEnumerable,
  IRenderContext,
  IVisualCreator,
  List,
  OrthogonalSnapLine,
  Point,
  SnapLineOrientation,
  SnapLineSnapTypes,
  SnapLineVisualizationType,
  SvgVisual,
  Visual
} from 'yfiles'

/**
 * A visual creator for orthogonal snap lines.
 */
export default class AdditionalSnapLineVisualCreator extends BaseClass(IVisualCreator) {
  /**
   * Creates a new instance of <code>AdditionalSnapLineVisualCreator</code>.
   * @param {!Point} from The start point
   * @param {!Point} to The end point
   */
  constructor(from, to) {
    super()
    this.to = to
    this.from = from
  }

  /**
   * Creates the {@link OrthogonalSnapLine}s that are displayed by this visual creator.
   * Since items should be able to snap from both sides to this line, two snap lines with the same location and
   * different {@link SnapLineSnapTypes}s are created.
   * @returns {!IEnumerable.<OrthogonalSnapLine>}
   */
  createSnapLines() {
    const lines = new List()
    if (this.from.x === this.to.x) {
      // it's vertical
      lines.add(
        new OrthogonalSnapLine(
          SnapLineOrientation.VERTICAL,
          SnapLineSnapTypes.LEFT,
          SnapLineVisualizationType.FIXED_LINE,
          this.from.add(this.to).multiply(0.5),
          this.from.y,
          this.to.y,
          this,
          50
        )
      )
      lines.add(
        new OrthogonalSnapLine(
          SnapLineOrientation.VERTICAL,
          SnapLineSnapTypes.RIGHT,
          SnapLineVisualizationType.FIXED_LINE,
          this.from.add(this.to).multiply(0.5),
          this.from.y,
          this.to.y,
          this,
          50
        )
      )
    } else if (this.from.y === this.to.y) {
      // it's horizontal
      lines.add(
        new OrthogonalSnapLine(
          SnapLineOrientation.HORIZONTAL,
          SnapLineSnapTypes.TOP,
          SnapLineVisualizationType.FIXED_LINE,
          this.from.add(this.to).multiply(0.5),
          this.from.x,
          this.to.x,
          this,
          50
        )
      )
      lines.add(
        new OrthogonalSnapLine(
          SnapLineOrientation.HORIZONTAL,
          SnapLineSnapTypes.BOTTOM,
          SnapLineVisualizationType.FIXED_LINE,
          this.from.add(this.to).multiply(0.5),
          this.from.x,
          this.to.x,
          this,
          50
        )
      )
    }
    return lines
  }

  /**
   * Creates the visual for the orthogonal snap lines.
   * @param {!IRenderContext} ctx
   * @returns {!Visual}
   */
  createVisual(ctx) {
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
   * @param {!IRenderContext} ctx
   * @param {!Visual} oldVisual
   * @returns {!Visual}
   */
  updateVisual(ctx, oldVisual) {
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
