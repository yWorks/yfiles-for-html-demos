/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphComponent, IGraph, Insets, Rect, Size, SvgExport } from 'yfiles'
import { detectSafariVersion } from '../../utils/Workarounds.js'

/**
 * A class that provides PDF-image export. The image is exported to svg and converted to PDF.
 */
export default class ClientSidePdfExport {
  /**
   * Creates a new instance.
   */
  constructor() {
    this.$scale = 1
    this.$margins = new Insets(5)
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
   * @return {Insets}
   */
  get margins() {
    return this.$margins
  }

  /**
   * Specifies the margins for the exported image.
   * @param {Insets} value
   */
  set margins(value) {
    this.$margins = value
  }

  /**
   * Exports the graph to a PDF.
   * @param {IGraph} graph
   * @param {Rect} exportRect
   * @return {Promise.<{raw: string, uri: string}>}
   */
  async exportPdf(graph, exportRect) {
    // Create a new graph component for exporting the original SVG content
    const exportComponent = new GraphComponent()
    // ... and assign it the same graph.
    exportComponent.graph = graph
    exportComponent.updateContentRect()

    // Determine the bounds of the exported area
    const targetRect = exportRect || exportComponent.contentRect

    exportComponent.zoomTo(targetRect)

    // Create the exporter class
    const exporter = new SvgExport(targetRect, this.scale)
    exporter.margins = this.margins

    if (window.btoa != null) {
      // Don't use base 64 encoding if btoa is not available and don't inline images as-well.
      // Otherwise canvg will throw an exception.
      exporter.encodeImagesBase64 = true
      exporter.inlineSvgImages = true
    }

    // export the component to svg
    const svgElement = await exporter.exportSvgAsync(exportComponent)

    return convertSvgToPdf(
      svgElement,
      new Size(exporter.viewWidth, exporter.viewHeight),
      this.margins
    )
  }
}

/**
 * Converts the given SVG element to PDF.
 * @param {SVGElement} svgElement
 * @param {Size} size
 * @param {Insets} margins
 * @return {{raw: string, uri: string}}
 * @yjs:keep=compress,orientation
 */
function convertSvgToPdf(svgElement, size, margins) {
  svgElement = svgElement.cloneNode(true)

  const margin = margins ? Math.max(margins.left, margins.right, margins.top, margins.bottom) : 5
  const sizeArray = new Array(2)
  sizeArray[0] = size.width + 2 * margin
  sizeArray[1] = size.height + 2 * margin
  // eslint-disable-next-line no-undef,new-cap
  const jsPdf = new jsPDF({
    orientation: sizeArray[0] > sizeArray[1] ? 'l' : 'p',
    unit: 'pt',
    format: sizeArray,
    // when compressed, the custom font is garbled up in the resulting PDF when viewed in Safari's
    // PDF viewer
    compress: detectSafariVersion() === -1,
    floatPrecision: 'smart'
  })

  const offsets = {}
  offsets.xOffset = margin
  offsets.yOffset = margin

  // eslint-disable-next-line no-undef
  svg2pdf(svgElement, jsPdf, offsets)

  return { raw: jsPdf.output(), uri: jsPdf.output('datauristring') }
}
