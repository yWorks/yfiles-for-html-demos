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

define(['yfiles/view-component', './Mapper.js', 'moment/moment'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  Mapper,
  moment
) => {
  const colors = ['#6991ff', '#9bc3ff']

  /**
   * Manages and renders the timeline ruler
   * @class TimelineVisual
   * @implements {yfiles.view.IVisualCreator}
   */
  class TimelineVisual extends yfiles.lang.Class(yfiles.view.HtmlCanvasVisual) {
    constructor(mapper) {
      super()
      this.mapper = mapper
    }

    /**
     * @param {yfiles.view.IRenderContext} renderContext - The render context of the
     *   {@link yfiles.view.CanvasComponent}
     * @param {CanvasRenderingContext2D} canvasContext - The HTML5 Canvas context to use for rendering.
     */
    paint(renderContext, canvasContext) {
      const mapper = this.mapper

      const component = renderContext.canvasComponent
      const { x, width } = component.viewport

      // get start date
      const beginDate = mapper.getDate(x - 100).startOf('month')
      const beginX = mapper.getX(beginDate)

      const endDate = mapper.getDate(x + width + 100).endOf('month')
      const endX = mapper.getX(endDate)

      this.drawDays(renderContext, canvasContext, beginX, endX, beginDate)
      this.drawMonths(renderContext, canvasContext, beginX, endX, beginDate)
    }

    /**
     * Draws the day separators.
     */
    drawDays(renderContext, canvasContext, beginX, endX, beginDate) {
      const date = moment(beginDate)

      let odd = date.diff(this.mapper.originDate, 'days') % 2 === 0

      let x = beginX
      canvasContext.strokeStyle = 'white'
      canvasContext.lineWidth = 3
      const y = 35
      const width = Mapper.dayWidth
      const halfWidth = width * 0.5
      const height = 30
      const halfHeight = height * 0.5
      canvasContext.textAlign = 'center'
      canvasContext.textBaseline = 'middle'
      canvasContext.font = '14px sans-serif'
      while (x < endX) {
        canvasContext.fillStyle = odd ? colors[0] : colors[1]
        canvasContext.fillRect(x, y, width, height)
        canvasContext.strokeRect(x, y, width, height)
        canvasContext.fillStyle = 'white'
        canvasContext.fillText(date.format('DD'), x + halfWidth, y + halfHeight)
        x += Mapper.dayWidth
        date.add(1, 'days')
        odd = !odd
      }
    }

    drawMonths(renderContext, canvasContext, beginX, endX, beginDate) {
      const date = moment(beginDate)

      let odd = date.diff(this.mapper.originDate.startOf('month'), 'months') % 2 === 0

      let x = beginX
      canvasContext.strokeStyle = 'white'
      canvasContext.lineWidth = 3
      const y = 5
      const height = 30
      const halfHeight = height * 0.5
      canvasContext.textAlign = 'center'
      canvasContext.textBaseline = 'middle'
      canvasContext.font = '14px sans-serif'
      while (x < endX) {
        const monthDays = date.daysInMonth()
        const width = Mapper.dayWidth * monthDays
        const halfWidth = width * 0.5
        canvasContext.fillStyle = odd ? colors[0] : colors[1]
        canvasContext.fillRect(x, y, width, height)
        canvasContext.strokeRect(x, y, width, height)
        canvasContext.fillStyle = 'white'
        canvasContext.fillText(date.format('MMMM YYYY'), x + halfWidth, y + halfHeight)
        x += Mapper.dayWidth * monthDays
        date.add(1, 'months')
        odd = !odd
      }
    }
  }

  return TimelineVisual
})
