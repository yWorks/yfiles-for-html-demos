/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { PaperSize } from './PdfExportDemo'

/**
 * A class that provides PDF export on the server-side.
 * yFiles' {@link SvgExport} is used to export the contents of a {@link GraphComponent} into an
 * SVG document which is subsequently send to a server where it is converted into a PDF document.
 */
export default class ServerSidePdfExport {
  /**
   * The scaling of the exported image.
   */
  scale = 1

  /**
   * The margins for the exported image.
   */
  margins = new Insets(5)

  /**
   * The size of the exported PDF. If not set, the size is adjusted to the exported area.
   */
  paperSize = PaperSize.AUTO

  /**
   * Creates a new instance of the {@link ServerSidePdfExport}.
   */
  constructor() {
    ServerSidePdfExport.initializeForm()
  }

  /**
   * Exports an SVG element of the passed {@link IGraph}.
   */
  async exportSvg(
    graph: IGraph,
    exportRect: Rect | null
  ): Promise<{ element: SVGElement; size: Size }> {
    // Create a new graph component for exporting the original SVG content
    const exportComponent = new GraphComponent()
    // ... and assign it the same graph.
    exportComponent.graph = graph
    exportComponent.updateContentRect()

    // Determine the bounds of the exported area
    const targetRect = exportRect || exportComponent.contentRect

    // Create the exporter class
    const exporter = new SvgExport({
      worldBounds: targetRect,
      scale: this.scale,
      margins: this.margins
    })

    if (window.btoa !== undefined) {
      // Don't use base 64 encoding if btoa is not available and don't inline images as-well.
      exporter.encodeImagesBase64 = true
      exporter.inlineSvgImages = true
    }

    const svgElement = await exporter.exportSvgAsync(exportComponent)
    return {
      element: svgElement as SVGElement,
      size: new Size(exporter.viewWidth, exporter.viewHeight)
    }
  }

  /**
   * Send the request to the server which initiates a file download.
   */
  requestFile(url: string, format: string, svgString: string, size: Size): void {
    const svgStringInput = document.getElementById('postSvgString') as HTMLInputElement
    svgStringInput.setAttribute('value', `${svgString}`)
    const formatInput = document.getElementById('postFormat') as HTMLInputElement
    formatInput.setAttribute('value', `${format}`)
    const width = document.getElementById('postWidth') as HTMLInputElement
    width.setAttribute('value', `${size.width}`)
    const height = document.getElementById('postHeight') as HTMLInputElement
    height.setAttribute('value', `${size.height}`)
    const margin = document.getElementById('postMargin') as HTMLInputElement
    margin.setAttribute('value', `${this.margins ? this.margins.left : 5}`)
    const paperSize = document.getElementById('postPaperSize') as HTMLInputElement
    paperSize.setAttribute('value', this.paperSize === PaperSize.AUTO ? '' : this.paperSize)

    const form = document.getElementById('postForm') as HTMLFormElement
    form.setAttribute('action', url)
    form.submit()
  }

  /**
   * Adds a form to the document body that is used to request the PDF from the server.
   */
  private static initializeForm(): void {
    const form = document.createElement('form')
    form.style.display = 'none'
    form.id = 'postForm'
    form.method = 'post'
    const svgString = document.createElement('input')
    svgString.id = 'postSvgString'
    svgString.name = 'svgString'
    svgString.type = 'hidden'
    form.appendChild(svgString)
    const format = document.createElement('input')
    format.id = 'postFormat'
    format.name = 'format'
    format.type = 'hidden'
    form.appendChild(format)
    const width = document.createElement('input')
    width.id = 'postWidth'
    width.name = 'width'
    width.type = 'hidden'
    form.appendChild(width)
    const height = document.createElement('input')
    height.id = 'postHeight'
    height.name = 'height'
    height.type = 'hidden'
    form.appendChild(height)
    const margin = document.createElement('input')
    margin.id = 'postMargin'
    margin.name = 'margin'
    margin.type = 'hidden'
    form.appendChild(margin)
    const paperSize = document.createElement('input')
    paperSize.id = 'postPaperSize'
    paperSize.name = 'paperSize'
    paperSize.type = 'hidden'
    form.appendChild(paperSize)

    document.body.appendChild(form)
  }
}
