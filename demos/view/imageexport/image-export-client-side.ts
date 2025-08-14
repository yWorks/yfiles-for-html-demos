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
import { useWebGLRendering } from './webgl-support'

/**
 * Exports the image on the client. This will open a dialog with a preview and the option to save the image as PNG.
 */
export async function exportImageClientSide(
  graphComponent: GraphComponent,
  scale: number,
  margin: number,
  exportRectangle?: Rect,
  renderCompletionCallback?: () => Promise<void | void[]>
): Promise<HTMLImageElement> {
  // export the image and show a dialog to save the image
  return await exportImage(
    graphComponent,
    scale,
    Insets.from(margin),
    exportRectangle,
    renderCompletionCallback ? renderCompletionCallback : () => Promise.resolve()
  )
}

/**
 * Exports the {@link IGraph} to a PNG image with the help of {@link SvgExport}.
 * The {@link SvgExport} exports an SVG element of a {@link GraphComponent}
 * which is subsequently converted to PNG.
 */
export async function exportImage(
  graphComponent: GraphComponent,
  scale = 1,
  margins = Insets.from(5),
  exportRect?: Rect,
  renderCompletionCallback?: () => Promise<void | void[]>
): Promise<HTMLImageElement> {
  // Create a new graph component for exporting the original SVG content
  const exportComponent = new GraphComponent()
  // ... and assign it the same graph.
  exportComponent.graph = graphComponent.graph
  exportComponent.updateContentBounds()

  if (graphComponent.graphModelManager instanceof WebGLGraphModelManager) {
    useWebGLRendering(exportComponent)
  }

  // Determine the bounds of the exported area
  const targetRect = exportRect ?? exportComponent.contentBounds

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

  // Export the component to svg
  const svgElement = await exporter.exportSvgAsync(
    exportComponent,
    renderCompletionCallback ? renderCompletionCallback : () => Promise.resolve()
  )

  // Dispose of the component and remove its references to the graph
  exportComponent.graph = new Graph()
  exportComponent.cleanUp()

  return renderSvgToPng(
    svgElement as SVGElement,
    new Size(exporter.viewWidth, exporter.viewHeight),
    margins
  )
}

/**
 * Converts the given SVG element to a PNG image.
 */
function renderSvgToPng(
  svgElement: SVGElement,
  size: Size,
  margins: Insets
): Promise<HTMLImageElement> {
  const targetCanvas = document.createElement('canvas')
  const targetContext = targetCanvas.getContext('2d')!

  const svgString = SvgExport.exportSvgString(svgElement)
  const svgUrl = SvgExport.encodeSvgDataUrl(svgString)

  return new Promise((resolve) => {
    // The SVG image is now used as the source of an HTML image element,
    // which is then rendered onto a Canvas element.

    // An image that gets the export SVG in the Data URL format
    const svgImage = new Image()
    svgImage.onload = (): void => {
      targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height)
      targetCanvas.width = size.width + (margins.left + margins.right)
      targetCanvas.height = size.height + (margins.top + margins.bottom)

      targetContext.drawImage(svgImage, margins.left, margins.top)
      // When the svg image has been rendered to the Canvas,
      // the raster image can be exported from the Canvas.
      const pngImage = new Image()
      // The following 'toDataURL' function throws a security error in IE
      pngImage.src = targetCanvas.toDataURL('image/png')
      pngImage.onload = (): void => resolve(pngImage)
    }
    svgImage.src = svgUrl
  })
}
