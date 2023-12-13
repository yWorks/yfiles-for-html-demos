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
import { daysInMonth, ganttDayWidth, GanttTimestamp, getVisualRange } from '../gantt-utils.js'

const colors = ['#a7a7c1', '#242265']

/**
 * Manages the timeline rendering using the html canvas.
 */
export class TimelineComponent {
  timelineHeight = 70
  canvas
  renderingContext2D
  /**
   * @param {!string} parentElementId
   * @param {!GraphComponent} graphComponent
   */
  constructor(parentElementId, graphComponent) {
    const parent = document.getElementById(parentElementId)

    this.canvas = document.createElement('canvas')
    this.renderingContext2D = this.canvas.getContext('2d')
    parent.append(this.canvas)

    this.update(graphComponent)

    // synchronize with x-axis with the graph component
    graphComponent.addViewportChangedListener((src) => this.update(src))
  }

  /**
   * Repaints the timeline with respect to the graphComponent's viewport position.
   * @param {!GraphComponent} graphComponent
   */
  update(graphComponent) {
    requestAnimationFrame(() => {
      const { x, width } = graphComponent.viewport
      this.paint(x, width)
    })
  }

  /**
   * Paints a timeline of months and days.
   * @param {number} x
   * @param {number} width
   */
  paint(x, width) {
    this.renderingContext2D.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const ratio = window.devicePixelRatio
    this.canvas.width = width * ratio
    this.canvas.height = this.timelineHeight * ratio
    this.renderingContext2D.transform(ratio, 0, 0, ratio, -x * ratio, 0)

    const { startDate, startX, endX, oddStartDay, oddStartMonth } = getVisualRange(
      x - 100,
      x + width + 100
    )

    this.paintDays(startX, endX, startDate, oddStartDay)
    this.paintMonths(startX, endX, startDate, oddStartMonth)
  }

  /**
   * Paints the day cells.
   * @param {number} startX
   * @param {number} endX
   * @param {!GanttTimestamp} startDate
   * @param {boolean} startIsOdd
   */
  paintDays(startX, endX, startDate, startIsOdd) {
    this.renderingContext2D.strokeStyle = 'white'
    this.renderingContext2D.lineWidth = 3
    this.renderingContext2D.textAlign = 'center'
    this.renderingContext2D.textBaseline = 'middle'
    this.renderingContext2D.font = '14px sans-serif'

    const y = 35
    const height = 30
    const width = ganttDayWidth
    for (
      let x = startX, odd = startIsOdd, day = new GanttTimestamp(startDate.time);
      x < endX;
      x += ganttDayWidth, day.addDays(1), odd = !odd
    ) {
      this.renderingContext2D.fillStyle = colors[odd ? 0 : 1]
      this.renderingContext2D.fillRect(x, y, width, height)
      this.renderingContext2D.strokeRect(x, y, width, height)
      this.renderingContext2D.fillStyle = 'white'
      this.renderingContext2D.fillText(
        day.toLocalDate().getDate().toLocaleString('en-US', { minimumIntegerDigits: 2 }),
        x + width * 0.5,
        y + height * 0.5
      )
    }
  }

  /**
   * Paints the month cells.
   * @param {number} startX
   * @param {number} endX
   * @param {!GanttTimestamp} startDate
   * @param {boolean} startIsOdd
   */
  paintMonths(startX, endX, startDate, startIsOdd) {
    this.renderingContext2D.strokeStyle = 'white'
    this.renderingContext2D.lineWidth = 3
    this.renderingContext2D.textAlign = 'center'
    this.renderingContext2D.textBaseline = 'middle'
    this.renderingContext2D.font = '14px sans-serif'

    const y = 5
    const height = 30
    for (
      let x = startX,
        odd = startIsOdd,
        // set date to "1" to make sure we don't get a problem with short months
        month = startDate.firstOfMonth();
      x < endX;
      x += ganttDayWidth * daysInMonth(month),
        // works because the date is set to "1"
        month.addDays(daysInMonth(month)),
        odd = !odd
    ) {
      const width = ganttDayWidth * daysInMonth(month)
      this.renderingContext2D.fillStyle = colors[odd ? 0 : 1]
      this.renderingContext2D.fillRect(x + 0.5, y + 0.5, width, height)
      this.renderingContext2D.strokeRect(x + 0.5, y + 0.5, width, height)
      this.renderingContext2D.fillStyle = 'white'
      this.renderingContext2D.fillText(
        Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
          month.toLocalDate()
        ),
        x + width * 0.5,
        y + height * 0.5
      )
    }
  }
}
