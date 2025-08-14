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
import { PaperSize } from './PaperSize'
import {
  Graph,
  GraphComponent,
  Insets,
  type Rect,
  Size,
  SvgExport,
  WebGLGraphModelManager
} from '@yfiles/yfiles'
import { useWebGLRendering } from './webgl-support'
import { hideExportDialog } from './export-dialog/export-dialog'

/**
 * Enables the server-side export checkbox in a non-blocking way, if that export mode is available.
 */
export function initializeServerSideExport(url: string): void {
  initializeForm()

  // if a server is available, enable the server export button
  isServerAlive(url)
    .then((response) => {
      document.querySelector<HTMLInputElement>('#server-export')!.disabled = false
    })
    .catch(() => {
      // don't enable the button in case of errors
    })
}

/**
 * Checks if the server at the given URL is alive.
 * @param url The URL of the service to check.
 * @param timeout The timeout of the check request.
 */
async function isServerAlive(url: string, timeout = 5000): Promise<Response> {
  const initObject: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: 'isAlive',
    mode: 'no-cors'
  }

  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, { ...initObject, signal: controller.signal })
    clearTimeout(id)
    return Promise.resolve(response)
  } catch {
    return Promise.reject(new Error(`Fetch timed out after ${timeout}ms`))
  }
}

/**
 * Requests a server-side export.
 * @param svgData a string representation of the SVG document to be exported.
 * @param format the export format, either 'png' or 'pdf'
 * @param size the size of the exported image.
 * @param url the URL of the service that will convert the given SVG document to a raster image.
 */
export function requestServerExport(
  svgData: string,
  format: 'png' | 'pdf',
  size: Size,
  url: string
): void {
  requestFile(url, format, svgData, size)
  hideExportDialog()
}

/**
 * Send the request to the server which initiates a file download.
 */
function requestFile(
  url: string,
  format: string,
  svgString: string,
  size: Size,
  margins = Insets.from(5),
  paperSize = PaperSize.AUTO
): void {
  const svgStringInput = document.querySelector<HTMLInputElement>('#postSvgString')!
  svgStringInput.setAttribute('value', `${svgString}`)
  const formatInput = document.querySelector<HTMLInputElement>('#postFormat')!
  formatInput.setAttribute('value', `${format}`)
  const width = document.querySelector<HTMLInputElement>('#postWidth')!
  width.setAttribute('value', `${size.width}`)
  const height = document.querySelector<HTMLInputElement>('#postHeight')!
  height.setAttribute('value', `${size.height}`)
  const margin = document.querySelector<HTMLInputElement>('#postMargin')!
  margin.setAttribute('value', `${margins.left}`)
  const pSize = document.querySelector<HTMLInputElement>('#postPaperSize')!
  pSize.setAttribute('value', paperSize === PaperSize.AUTO ? '' : paperSize)

  const form = document.querySelector<HTMLFormElement>('#postForm')!
  form.setAttribute('action', url)
  form.submit()
}

/**
 * Adds a form to the document body that is used to request the image from the server.
 */
function initializeForm(): void {
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

/**
 * Exports an SVG element of the passed {@link IGraph} on the server-side.
 * The {@link SvgExport} exports an SVG element of a {@link GraphComponent} into an
 * SVG document which is sent to the server that converts it to a PNG image or PDF document.
 */
export async function exportSvg(
  graphComponent: GraphComponent,
  scale = 1,
  margins = Insets.from(5),
  exportRect?: Rect,
  renderCompletionCallback?: () => Promise<void | void[]>
): Promise<{ element: SVGElement; size: Size }> {
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

  const svgElement = await exporter.exportSvgAsync(
    exportComponent,
    renderCompletionCallback ? renderCompletionCallback : () => Promise.resolve()
  )

  // Dispose of the component and remove its references to the graph
  exportComponent.graph = new Graph()
  exportComponent.cleanUp()

  return {
    element: svgElement as SVGElement,
    size: new Size(exporter.viewWidth, exporter.viewHeight)
  }
}
