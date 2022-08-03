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
/* global canvg */

import { GraphComponent, IGraph, Insets, Rect, Size, SvgExport } from 'yfiles'
import { detectInternetExplorerVersion } from '../../utils/Workarounds'

/**
 * The detected IE version for x-browser compatibility.
 */
const ieVersion = detectInternetExplorerVersion()

/**
 * A class that provides PNG image export in the client's browser. The {@link SvgExport} exports an
 * SVG element of a {@link GraphComponent} which is subsequently converted to PNG.
 */
export default class ClientSideImageExport {
  /**
   * The scaling of the exported image.
   */
  scale = 1

  /**
   * The margins for the exported image.
   */
  margins = new Insets(5)

  /**
   * Exports the {@link IGraph} to a PNG image with the help of {@link SvgExport}.
   */
  async exportImage(graph: IGraph, exportRect: Rect | null): Promise<HTMLImageElement> {
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

    if (window.btoa != null) {
      // Do not use base 64 encoding if btoa is not available and do not inline images either.
      // Otherwise canvg will throw an exception.
      exporter.encodeImagesBase64 = true
      exporter.inlineSvgImages = true
    }

    // Export the component to svg
    const svgElement = await exporter.exportSvgAsync(exportComponent)

    return renderSvgToPng(
      svgElement as SVGElement,
      new Size(exporter.viewWidth, exporter.viewHeight),
      this.margins
    )
  }
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

  if (window.btoa === undefined) {
    targetContext.fillText('This browser does not support SVG previews', 10, 50)
    // Use the canvg fall-back if the function btoa is not available
    return exportImageWithCanvg(svgElement)
  }

  return new Promise(resolve => {
    // The SVG image is now used as the source of an HTML image element,
    // which is then rendered onto a Canvas element.

    // An image that gets the export SVG in the Data URL format
    const svgImage = new Image()
    svgImage.onload = () => {
      targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height)
      targetCanvas.width = size.width + (margins.left + margins.right)
      targetCanvas.height = size.height + (margins.top + margins.bottom)

      // IE 11 on Windows 7 needs a timeout here
      setTimeout(
        () => {
          try {
            targetContext.drawImage(svgImage, margins.left, margins.top)
            // When the svg image has been rendered to the Canvas,
            // the raster image can be exported from the Canvas.
            const pngImage = new Image()
            // The following 'toDataURL' function throws a security error in IE
            pngImage.src = targetCanvas.toDataURL('image/png')
            pngImage.onload = () => resolve(pngImage)
          } catch (error) {
            // Use the canvg fall-back when the above solution doesn't work
            resolve(exportImageWithCanvg(svgElement))
          }
        },
        ieVersion > -1 ? 100 : 0
      )
    }
    svgImage.src = svgUrl
  })
}

/**
 * Use canvg as fallback if the default approach is not available.
 */
async function exportImageWithCanvg(svgElement: SVGElement): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const serializedSvg = new XMLSerializer().serializeToString(svgElement)
  // @ts-ignore
  const canvgRenderer = await canvg.Canvg.from(ctx, serializedSvg)
  await canvgRenderer.render()

  return new Promise(resolve => {
    const image = new Image()
    image.src = canvas.toDataURL()
    image.onload = () => resolve(image)
  })
}
