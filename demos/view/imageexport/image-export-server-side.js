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
import { Insets, SvgExport } from 'yfiles'
import { exportSvg, requestServerExport } from './server-side-export.js'

/**
 * Server URL for server-side export.
 */
export const NODE_SERVER_URL = 'http://localhost:3000'

/**
 * Exports the image on the server. This will open a file dialog to download the image as PNG.
 * @param {!GraphComponent} graphComponent
 * @param {number} scale
 * @param {number} margin
 * @param {!Rect} [exportRectangle]
 * @returns {!Promise}
 */
export async function exportImageServerSide(graphComponent, scale, margin, exportRectangle) {
  // export the SVG and show a dialog to download the image
  const svg = await exportSvg(graphComponent, scale, Insets.from(margin), exportRectangle)
  const svgString = SvgExport.exportSvgString(svg.element)
  const svgData = SvgExport.encodeSvgDataUrl(svgString)
  requestServerExport(svgData, 'png', svg.size, NODE_SERVER_URL)
}
