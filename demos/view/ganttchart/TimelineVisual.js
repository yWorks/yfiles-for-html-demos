/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import { CanvasComponent, HtmlCanvasVisual, IRenderContext } from 'yfiles'
import { GanttMapper } from './GanttMapper.js'

const colors = ['#6991ff', '#9bc3ff']

/**
 * Paints the timeline ruler.
 */
export default class TimelineVisual extends HtmlCanvasVisual {
  /**
   * Creates a new instance.
   * @param {!GanttMapper} mapper The mapper to help with converting from coordinate to date.
   */
  constructor(mapper) {
    super()
    this.mapper = mapper
  }

  /**
   * Paints a timeline of months and days.
   * @param {!IRenderContext} renderContext The render context of the {@link CanvasComponent}
   * @param {!CanvasRenderingContext2D} renderingContext2D The HTML5 Canvas context to use for rendering.
   */
  paint(renderContext, renderingContext2D) {
    const { x, width } = renderContext.canvasComponent.viewport

    const { startDate, endDate, startX, endX, oddStartDay, oddStartMonth } =
      this.mapper.getVisualRange(x - 100, x + width + 100)

    this.paintDays(renderContext, renderingContext2D, startX, endX, startDate, oddStartDay)
    this.paintMonths(renderContext, renderingContext2D, startX, endX, startDate, oddStartMonth)
  }

  /**
   * Paints the day cells.
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} renderingContext2D
   * @param {number} startX
   * @param {number} endX
   * @param {!Date} startDate
   * @param {boolean} startIsOdd
   */
  paintDays(renderContext, renderingContext2D, startX, endX, startDate, startIsOdd) {
    const y = 35
    const height = 30
    const width = GanttMapper.dayWidth

    renderingContext2D.strokeStyle = 'white'
    renderingContext2D.lineWidth = 3
    renderingContext2D.textAlign = 'center'
    renderingContext2D.textBaseline = 'middle'
    renderingContext2D.font = '14px sans-serif'

    for (
      let x = startX, odd = startIsOdd, day = new Date(startDate);
      x < endX;
      x += GanttMapper.dayWidth, day.setDate(day.getDate() + 1), odd = !odd
    ) {
      renderingContext2D.fillStyle = odd ? colors[0] : colors[1]
      renderingContext2D.fillRect(x, y, width, height)
      renderingContext2D.strokeRect(x, y, width, height)
      renderingContext2D.fillStyle = 'white'
      renderingContext2D.fillText(
        Intl.DateTimeFormat(navigator.language, { day: 'numeric' }).format(day),
        x + width * 0.5,
        y + height * 0.5
      )
    }
  }

  /**
   * Paints the month cells.
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} renderingContext2D
   * @param {number} startX
   * @param {number} endX
   * @param {!Date} startDate
   * @param {boolean} startIsOdd
   */
  paintMonths(renderContext, renderingContext2D, startX, endX, startDate, startIsOdd) {
    const y = 5
    const height = 30

    renderingContext2D.strokeStyle = 'white'
    renderingContext2D.lineWidth = 3
    renderingContext2D.textAlign = 'center'
    renderingContext2D.textBaseline = 'middle'
    renderingContext2D.font = '14px sans-serif'

    for (
      let x = startX,
        odd = startIsOdd,
        // set date to "1" to make sure we don't get a problem with short months
        month = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      x < endX;
      x += GanttMapper.dayWidth * GanttMapper.daysInMonth(month),
        // works because date is set to "1"
        month.setMonth(month.getMonth() + 1),
        odd = !odd
    ) {
      const width = GanttMapper.dayWidth * GanttMapper.daysInMonth(month)
      renderingContext2D.fillStyle = odd ? colors[0] : colors[1]
      renderingContext2D.fillRect(x, y, width, height)
      renderingContext2D.strokeRect(x, y, width, height)
      renderingContext2D.fillStyle = 'white'
      renderingContext2D.fillText(
        Intl.DateTimeFormat(navigator.language, { month: 'long', year: 'numeric' }).format(month),
        x + width * 0.5,
        y + height * 0.5
      )
    }
  }
}
