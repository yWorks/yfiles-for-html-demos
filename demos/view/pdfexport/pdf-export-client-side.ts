/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Graph,
  GraphComponent,
  type IGraph,
  Insets,
  type Rect,
  Size,
  SvgExport,
  WebGLGraphModelManager
} from '@yfiles/yfiles'
import { PaperSize } from './PaperSize'
import { useWebGLRendering } from './webgl-support'

// The demo uses the open-source library for PDF export https://github.com/MrRio/jsPDF alongside with
// https://github.com/yWorks/svg2pdf.js/ to convert a given SVG element to PDF
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'

/**
 * Holds information about a custom font.
 * See the file `./load-custom-fonts.ts` for more details on loading custom font data.
 */
export type CustomFontDescriptor = { filename: string; id: string; style: string; data: string }

export type ClientExportResult = { iFrame: HTMLIFrameElement }

/**
 * Exports the image on the client. This will open a dialog with a preview and the option to save the image as PDF.
 */
export async function exportPdfClientSide(
  graphComponent: GraphComponent,
  scale: number,
  margin: number,
  paperSize: PaperSize,
  exportRectangle?: Rect,
  customFonts: CustomFontDescriptor[] = [],
  renderCompletionCallback?: () => Promise<void | void[]>
): Promise<{ pdfData: string; previewElement: HTMLIFrameElement }> {
  // configure export, export the PDF and show a dialog to save the PDF file
  const { raw, uri } = await exportPdf(
    graphComponent,
    scale,
    Insets.from(margin),
    paperSize,
    exportRectangle,
    customFonts,
    renderCompletionCallback ? renderCompletionCallback : () => Promise.resolve()
  )

  const pdfIFrame = createPdfIFrame(raw, uri)

  return { pdfData: raw, previewElement: pdfIFrame }
}

/**
 * Exports the {@link IGraph} to PDF with the help of {@link SvgExport} and jsPDF in the client's browser.
 * yFiles {@link SvgExport} is used to export the contents of a {@link GraphComponent} into an
 * SVG document which is subsequently converted into a PDF document by jsPDF.
 */
export async function exportPdf(
  graphComponent: GraphComponent,
  scale = 1,
  margins = Insets.from(5),
  paperSize = PaperSize.AUTO,
  exportRect?: Rect,
  customFonts: CustomFontDescriptor[] = [],
  renderCompletionCallback?: () => Promise<void | void[]>
): Promise<{ raw: string; uri: string }> {
  // Create a new graph component for exporting the original SVG content
  const exportComponent = new GraphComponent()
  // ... and assign it the same graph.
  exportComponent.graph = graphComponent.graph
  exportComponent.updateContentBounds()

  if (graphComponent.graphModelManager instanceof WebGLGraphModelManager) {
    useWebGLRendering(exportComponent)
  }

  // Determine the bounds of the exported area
  const targetRect = exportRect || exportComponent.contentBounds

  // Create the exporter class
  const exporter = new SvgExport({
    worldBounds: targetRect,
    scale: scale,
    margins: margins,
    encodeImagesBase64: true,
    inlineSvgImages: true
  })

  // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
  exporter.cssStyleSheet = null

  // export the component to svg
  const svgElement = await exporter.exportSvgAsync(
    exportComponent,
    renderCompletionCallback ? renderCompletionCallback : () => Promise.resolve()
  )

  // Dispose of the component and remove its references to the graph
  exportComponent.graph = new Graph()
  exportComponent.cleanUp()

  const size = getExportSize(paperSize, exporter)
  return convertSvgToPdf(svgElement as SVGElement, size, customFonts)
}

/**
 * Converts the given SVG element to PDF.
 * @yjs:keep = compress,orientation
 */
async function convertSvgToPdf(
  svgElement: SVGElement,
  size: Size,
  customFonts: CustomFontDescriptor[] = []
): Promise<{ raw: string; uri: string }> {
  svgElement = svgElement.cloneNode(true) as SVGElement

  const jsPdf = new jsPDF({
    orientation: size.width > size.height ? 'l' : 'p',
    unit: 'pt',
    format: [size.width, size.height],
    compress: true
  })

  for (const font of customFonts) {
    jsPdf.addFileToVFS(font.filename, font.data)
    jsPdf.addFont(font.filename, font.id, font.style)
  }

  await jsPdf.svg(svgElement, size)
  return { raw: jsPdf.output(), uri: jsPdf.output('datauristring') }
}

/**
 * Creates an IFrame containing a preview of the given pdf.
 */
function createPdfIFrame(raw: string, pdfUrl: string): HTMLIFrameElement {
  const pdfIframe = document.createElement('iframe')
  pdfIframe.setAttribute('style', 'width: 99%; height: 99%')
  pdfIframe.src = pdfUrl
  return pdfIframe
}

/**
 * Returns the size of the exported PDF. Paper sizes are converted to pixel sizes based on 72 PPI.
 */
function getExportSize(paperSize: PaperSize, exporter: SvgExport): Size {
  switch (paperSize) {
    case PaperSize.A3:
      return new Size(842, 1191)
    case PaperSize.A4:
      return new Size(595, 842)
    case PaperSize.A5:
      return new Size(420, 595)
    case PaperSize.A6:
      return new Size(298, 420)
    case PaperSize.LETTER:
      return new Size(612, 792)
    case PaperSize.AUTO:
      return new Size(exporter.viewWidth, exporter.viewHeight)
  }
}
