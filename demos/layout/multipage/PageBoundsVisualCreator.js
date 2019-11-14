/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * This class renders a rectangle that represents the page.
   */
  class PageBoundsVisualCreator extends yfiles.lang.Class(yfiles.view.IVisualCreator) {
    constructor() {
      super()
      this.pageWidthField = 0
      this.pageHeightField = 0
      this.centerField = null
    }

    /**
     * Creates a visual for a rectangular page.
     * @see Overrides {@link yfiles.view.IVisualCreator#createVisual}.
     * @param {yfiles.view.IRenderContext} context
     * @return {yfiles.view.Visual}
     */
    createVisual(context) {
      return this.updateVisual(context, new yfiles.view.SvgVisual(null))
    }

    /**
     * Updates the size of the visual for a rectangular page.
     * @see Overrides {@link yfiles.view.IVisualCreator#updateVisual}.
     * @param {yfiles.view.IRenderContext} context
     * @param {yfiles.view.Visual} oldVisual
     * @return {yfiles.view.Visual}
     */
    updateVisual(context, oldVisual) {
      if (!this.center) {
        return null
      }

      let rectangle = oldVisual.svgElement
      if (rectangle === null) {
        // there is no svg element, yet => create a new rectangle
        rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        rectangle.setAttribute('stroke', 'darkgray')
        rectangle.setAttribute('stroke-width', '1')
        rectangle.setAttribute('stroke-dasharray', '5')
        rectangle.setAttribute('stroke-linecap', 'square')
        rectangle.setAttribute('fill', 'white')
        oldVisual.svgElement = rectangle
      }

      // update the size of the page
      const width = this.pageWidth + MARGIN
      const height = this.pageHeight + MARGIN

      rectangle.setAttribute('x', '0')
      rectangle.setAttribute('y', '0')
      rectangle.setAttribute('width', width)
      rectangle.setAttribute('height', height)

      // update the position of the page
      rectangle.setAttribute(
        'transform',
        `translate(${this.center.x - width * 0.5} ${this.center.y - height * 0.5})`
      )

      return oldVisual
    }

    /**
     * Returns the width of the page.
     * @return {number} The height of the page.
     */
    get pageWidth() {
      return this.pageWidthField
    }

    /**
     * Specifies the width of the page.
     * @param {number} width The new width for the page.
     */
    set pageWidth(width) {
      this.pageWidthField = width
    }

    /**
     * Returns the height of the page.
     * @return {number} The width of the page.
     */
    get pageHeight() {
      return this.pageHeightField
    }

    /**
     * Specifies the height of the page.
     * @param {number} height The new height for the page.
     */
    set pageHeight(height) {
      this.pageHeightField = height
    }

    /**
     * Returns the center of the page.
     * @return {yfiles.geometry.Point} The center of the page.
     */
    get center() {
      return this.centerField
    }

    /**
     * Specifies the center of the page.
     * @param {yfiles.geometry.Point} center The new height for the page.
     */
    set center(center) {
      this.centerField = center
    }
  }

  /**
   * A constant margin for the page so the graph does not touche the frame.
   * @type {number}
   */
  const MARGIN = 15

  return PageBoundsVisualCreator
})
