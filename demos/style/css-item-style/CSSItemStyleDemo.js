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
import { GraphComponent, GraphViewerInputMode, License } from 'yfiles'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import {
  createStylesheetView,
  replaceStylesheet,
  addStylesheet,
  removeStylesheet
} from './stylesheet-view/stylesheet-view.js'
import { createSampleGraph } from './create-sample-graph.js'
import { configureSelectionHighlight } from './configure-selection-highlight.js'
import { configureHoverHighlight } from './configure-hover-highlight.js'

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // do not allow structural changes in this demo
  const inputMode = new GraphViewerInputMode()

  // show the graph-item-styles stylesheet in the demo
  await createStylesheetView('#data-view')

  // highlight graph items by hovering over them
  configureHoverHighlight(graphComponent, inputMode)

  // on click, highlight the node and its direct connections
  configureSelectionHighlight(graphComponent, inputMode)

  graphComponent.inputMode = inputMode
  createSampleGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  addStylesheet()

  initializeUI()
}

/**
 * Initializes the UI elements that are specific to this demo.
 */
function initializeUI() {
  document.querySelector('#apply-stylesheet-btn').addEventListener('click', () => {
    replaceStylesheet()
  })
  const disableStylesheetButton = document.querySelector('#disable-stylesheet')
  disableStylesheetButton.addEventListener('mousedown', () => {
    removeStylesheet()
    const upListener = () => {
      addStylesheet()
      document.removeEventListener('mouseup', upListener)
    }
    document.addEventListener('mouseup', upListener)
  })
}

void run().then(finishLoading)
