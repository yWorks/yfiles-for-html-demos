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
import { GraphComponent, Insets, Size, SvgExport, WebGL2GraphModelManager } from 'yfiles'
import { useWebGL2Rendering } from './webgl-support.js'

/**
 * Exports the image on the client. This will open a dialog with a preview and the option to save the image as PNG.
 * @param {!GraphComponent} graphComponent
 * @param {number} scale
 * @param {number} margin
 * @param {!Rect} [exportRectangle]
 * @returns {!Promise.<HTMLImageElement>}
 */
export async function exportImageClientSide(graphComponent, scale, margin, exportRectangle) {
  // export the image and show a dialog to save the image
  return await exportImage(graphComponent, scale, Insets.from(margin), exportRectangle)
}

/**
 * Exports the {@link IGraph} to a PNG image with the help of {@link SvgExport}.
 * The {@link SvgExport} exports an SVG element of a {@link GraphComponent}
 * which is subsequently converted to PNG.
 * @param {!GraphComponent} graphComponent
 * @param {number} [scale=1]
 * @param {*} margins
 * @param {!Rect} [exportRect]
 * @returns {!Promise.<HTMLImageElement>}
 */
export async function exportImage(graphComponent, scale = 1, margins = Insets.from(5), exportRect) {
  // Create a new graph component for exporting the original SVG content
  const exportComponent = new GraphComponent()
  // ... and assign it the same graph.
  exportComponent.graph = graphComponent.graph
  exportComponent.updateContentRect()

  if (graphComponent.graphModelManager instanceof WebGL2GraphModelManager) {
    useWebGL2Rendering(exportComponent)
  }

  // Determine the bounds of the exported area
  const targetRect = exportRect ?? exportComponent.contentRect

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
  const svgElement = await exporter.exportSvgAsync(exportComponent)

  return renderSvgToPng(svgElement, new Size(exporter.viewWidth, exporter.viewHeight), margins)
}

/**
 * Converts the given SVG element to a PNG image.
 * @param {!SVGElement} svgElement
 * @param {!Size} size
 * @param {!Insets} margins
 * @returns {!Promise.<HTMLImageElement>}
 */
function renderSvgToPng(svgElement, size, margins) {
  const targetCanvas = document.createElement('canvas')
  const targetContext = targetCanvas.getContext('2d')

  const svgString = SvgExport.exportSvgString(svgElement)
  const svgUrl = SvgExport.encodeSvgDataUrl(svgString)

  return new Promise((resolve) => {
    // The SVG image is now used as the source of an HTML image element,
    // which is then rendered onto a Canvas element.

    // An image that gets the export SVG in the Data URL format
    const svgImage = new Image()
    svgImage.onload = () => {
      targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height)
      targetCanvas.width = size.width + (margins.left + margins.right)
      targetCanvas.height = size.height + (margins.top + margins.bottom)

      targetContext.drawImage(svgImage, margins.left, margins.top)
      // When the svg image has been rendered to the Canvas,
      // the raster image can be exported from the Canvas.
      const pngImage = new Image()
      // The following 'toDataURL' function throws a security error in IE
      pngImage.src = targetCanvas.toDataURL('image/png')
      pngImage.onload = () => resolve(pngImage)
    }
    svgImage.src = svgUrl
  })
}
