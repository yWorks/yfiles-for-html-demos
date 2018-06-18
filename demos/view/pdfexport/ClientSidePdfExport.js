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

define(['yfiles/view-component'], yfiles => {
  /**
   * A class that provides PDF-image export. The image is exported to svg and converted to PDF.
   */
  class ClientSidePdfExport {
    /**
     * Creates a new instance.
     */
    constructor() {
      this.$scale = 1
      this.$margins = new yfiles.geometry.Insets(5)
    }

    /**
     * Returns the scaling of the exported image.
     * @return {number}
     */
    get scale() {
      return this.$scale
    }

    /**
     * Specifies the scaling of the exported image.
     * @param {number} value
     */
    set scale(value) {
      this.$scale = value
    }

    /**
     * Returns the margins for the exported image.
     * @return {yfiles.geometry.Insets}
     */
    get margins() {
      return this.$margins
    }

    /**
     * Specifies the margins for the exported image.
     * @param {yfiles.geometry.Insets} value
     */
    set margins(value) {
      this.$margins = value
    }

    /**
     * Exports the graph to a PDF.
     * @param {yfiles.graph.IGraph} graph
     * @param {yfiles.geometry.Rect} exportRect
     * @return {Promise.<string>}
     */
    exportPdf(graph, exportRect) {
      // Create a new graph component for exporting the original SVG content
      const exportComponent = new yfiles.view.GraphComponent()
      // ... and assign it the same graph.
      exportComponent.graph = graph
      exportComponent.updateContentRect()

      // Determine the bounds of the exported area
      const targetRect = exportRect || exportComponent.contentRect

      exportComponent.zoomTo(targetRect)

      // Create the exporter class
      const exporter = new yfiles.view.SvgExport(targetRect, this.scale)
      exporter.margins = this.margins

      if (window.btoa != null) {
        // Don't use base 64 encoding if btoa is not available and don't inline images as-well.
        // Otherwise canvg will throw an exception.
        exporter.encodeImagesBase64 = true
        exporter.inlineSvgImages = true
      }

      return exporter.exportSvgAsync(exportComponent).then(svgElement =>
        // convert svgElement to PDF
        convertSvgToPdf(
          svgElement,
          new yfiles.geometry.Size(exporter.viewWidth, exporter.viewHeight),
          this.margins
        )
      )
    }
  }

  /**
   * Converts an SvgElement to PDF.
   * @param {SVGElement} svgElement
   * @param {yfiles.geometry.Size} size
   * @param {yfiles.geometry.Insets} margins
   * @return {string}
   */
  function convertSvgToPdf(svgElement, size, margins) {
    svgElement = svgElement.cloneNode(true)

    const margin = margins ? Math.max(margins.left, margins.right, margins.top, margins.bottom) : 5
    const sizeArray = new Array(2)
    sizeArray[0] = size.width + 2 * margin
    sizeArray[1] = size.height + 2 * margin
    // eslint-disable-next-line no-undef,new-cap
    const jsPdf = new jsPDF(sizeArray[0] > sizeArray[1] ? 'l' : 'p', 'pt', sizeArray)

    // Register custom fonts that are provided in the custom-fonts.js file. Please see
    // the https://github.com/yWorks/jsPDF readme on how to create a JS file that can be included to provide
    // custom fonts.
    jsPdf.addFont('Prata-Regular.ttf', 'Prata', 'normal') // Cyrillic
    jsPdf.addFont('mplus-1c-regular.ttf', 'Rounded Mplus 1c', 'normal') // Hiragana

    const offsets = {}
    offsets.xOffset = margin
    offsets.yOffset = margin

    // eslint-disable-next-line no-undef
    svg2pdf(svgElement, jsPdf, offsets)

    return jsPdf.output('datauristring')
  }

  return ClientSidePdfExport
})
