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
   * A visual creator for orthogonal snap lines.
   * @implements {yfiles.view.IVisualCreator}
   */
  class AdditionalSnapLineVisualCreator extends yfiles.lang.Class(yfiles.view.IVisualCreator) {
    /**
     * Creates a new instance of <code>AdditionalSnapLineVisualCreator</code>.
     * @param {yfiles.geometry.Point} from The start point
     * @param {yfiles.geometry.Point} to The end point
     */
    constructor(from, to) {
      super()
      this.from = from
      this.to = to
    }

    /**
     * Creates the {@link yfiles.input.OrthogonalSnapLine}s that are displayed by this visual creator.
     * Since items should be able to snap from both sides to this line, two snap lines with the same location and
     * different {@link yfiles.input.SnapLineSnapTypes}s are created.
     * @return {yfiles.collections.IEnumerable.<yfiles.input.OrthogonalSnapLine>}
     */
    createSnapLines() {
      const lines = new yfiles.collections.List()
      if (this.from.x === this.to.x) {
        // it's vertical
        lines.add(
          new yfiles.input.OrthogonalSnapLine(
            yfiles.input.SnapLineOrientation.VERTICAL,
            yfiles.input.SnapLineSnapTypes.LEFT,
            yfiles.input.SnapLine.SNAP_LINE_FIXED_LINE_KEY,
            this.from.add(this.to).multiply(0.5),
            this.from.y,
            this.to.y,
            this,
            50
          )
        )
        lines.add(
          new yfiles.input.OrthogonalSnapLine(
            yfiles.input.SnapLineOrientation.VERTICAL,
            yfiles.input.SnapLineSnapTypes.RIGHT,
            yfiles.input.SnapLine.SNAP_LINE_FIXED_LINE_KEY,
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
          new yfiles.input.OrthogonalSnapLine(
            yfiles.input.SnapLineOrientation.HORIZONTAL,
            yfiles.input.SnapLineSnapTypes.TOP,
            yfiles.input.SnapLine.SNAP_LINE_FIXED_LINE_KEY,
            this.from.add(this.to).multiply(0.5),
            this.from.x,
            this.to.x,
            this,
            50
          )
        )
        lines.add(
          new yfiles.input.OrthogonalSnapLine(
            yfiles.input.SnapLineOrientation.HORIZONTAL,
            yfiles.input.SnapLineSnapTypes.BOTTOM,
            yfiles.input.SnapLine.SNAP_LINE_FIXED_LINE_KEY,
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
     * @param {yfiles.view.IRenderContext} ctx
     * @return {yfiles.view.Visual}
     */
    createVisual(ctx) {
      const line = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', this.from.x)
      line.setAttribute('y1', this.from.y)
      line.setAttribute('x2', this.to.x)
      line.setAttribute('y2', this.to.y)
      line.setAttribute('stroke-width', 2)
      line.setAttribute('stroke', 'firebrick')
      return new yfiles.view.SvgVisual(line)
    }

    /**
     * Updates a previously created visual.
     * @param {yfiles.view.IRenderContext} ctx
     * @param {yfiles.view.Visual} oldVisual
     * @return {yfiles.view.Visual}
     */
    updateVisual(ctx, oldVisual) {
      const visual = oldVisual instanceof yfiles.view.SvgVisual ? oldVisual : null
      if (visual === null || visual.svgElement === null || visual.svgElement.tagName !== 'line') {
        return this.createVisual(ctx)
      }
      const line = visual.svgElement
      line.setAttribute('x1', this.from.x)
      line.setAttribute('y1', this.from.y)
      line.setAttribute('x2', this.to.x)
      line.setAttribute('y2', this.to.y)
      return oldVisual
    }
  }

  return AdditionalSnapLineVisualCreator
})
