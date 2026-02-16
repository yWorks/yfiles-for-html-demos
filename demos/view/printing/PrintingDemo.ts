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
import { GraphComponent, GraphEditorInputMode, License } from '@yfiles/yfiles'

import { PrintingSupport } from '@yfiles/demo-utils/PrintingSupport'
import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { createSampleGraph } from './samples'
import { initializeExportRectangle } from './export-rectangle/export-rectangle'
import { initializeOptionPanel } from './option-panel/option-panel'
import { initializeToggleWebGlRenderingButton } from './webgl-support'
import { retainAspectRatio } from './aspect-ratio'
import { DelayedNodeStyle } from './node-styles/delayed-node-style'

async function run(): Promise<void> {
  License.value = licenseData

  // initialize the main graph component
  const graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()
  initDemoStyles(graphComponent.graph)
  retainAspectRatio(graphComponent.graph)

  const printRect = initializeExportRectangle(graphComponent)

  // the styles to be used in printing support
  const cssStyle = `
  .demo-palette-23-node{fill:#ff6c00;stroke:#662b00;}
  .demo-palette-25-node{fill:#76b041;stroke:#2f461a;}
  .demo-palette-21-node{fill:#17bebb;stroke:#094c4b;}`

  initializeOptionPanel(async (options) => {
    const rect = options.usePrintRectangle ? printRect.toRect() : undefined

    const printingSupport = new PrintingSupport()
    printingSupport.fitToTile = options.fitToTile
    printingSupport.scale = options.scale
    printingSupport.margin = options.margin
    printingSupport.tiledPrinting = options.useTilePrinting
    printingSupport.skipEmptyTiles = options.skipEmptyTiles
    printingSupport.tileWidth = options.tileWidth
    printingSupport.tileHeight = options.tileHeight
    printingSupport.cssStyleSheet = cssStyle

    // start the printing process
    // this will open a new document in a separate browser window/tab and use
    // the javascript "print()" method of the browser to print the document.
    await printingSupport.printGraph(graphComponent.graph, rect, () =>
      // wait for styles to finish rendering
      Promise.all(DelayedNodeStyle.pendingPromises)
    )
  })

  // wire up the export button
  initializeToggleWebGlRenderingButton(graphComponent)

  // create a sample graph
  await createSampleGraph(graphComponent)
  await graphComponent.fitGraphBounds()
}

void run().then(finishLoading)
