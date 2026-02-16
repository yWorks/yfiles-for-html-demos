/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Graph, GraphComponent, type Rect, SvgExport, WebGLGraphModelManager } from '@yfiles/yfiles'
import { useWebGLRendering } from './webgl-support'
import { DelayedNodeStyle } from './node-styles/delayed-node-style'

/**
 * Exports a certain area of the graph to an SVG element.
 * @param graphComponent the demo's main graph view.
 * @param scale the scale factor for the export operation.
 * E.g. a scale factor of 2 will result in an exported graphic that is twice as large as the
 * original area.
 * @param background the color of the background for the exported SVG
 * otherwise it will have an opaque white background element
 * @param rectangle the area to export
 * @returns the exported SVG element
 */
export async function exportSvg(
  graphComponent: GraphComponent,
  scale = 1,
  background = 'transparent',
  rectangle: Rect | null = null
): Promise<Element> {
  // create a new graph component for exporting the original SVG content
  const exportComponent = new GraphComponent()
  // ... and assign it the same graph.
  exportComponent.graph = graphComponent.graph
  exportComponent.updateContentBounds()

  if (graphComponent.graphModelManager instanceof WebGLGraphModelManager) {
    useWebGLRendering(exportComponent)
  }

  // create the exporter class
  const exporter = new SvgExport({
    // determine the bounds of the exported area
    worldBounds: rectangle || exportComponent.contentBounds,
    scale,
    encodeImagesBase64: true,
    inlineSvgImages: true,
    background: background
  })

  // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
  exporter.cssStyleSheet = null
  const resultPromise = exporter.exportSvgAsync(exportComponent, () =>
    // wait for styles to finish rendering
    Promise.all(DelayedNodeStyle.pendingPromises)
  )
  // make sure to deallocate the resources after the export is done
  void resultPromise.then(() => {
    exportComponent.graph = new Graph()
    exportComponent.cleanUp()
  })
  return resultPromise
}
