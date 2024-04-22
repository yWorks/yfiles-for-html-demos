/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphEditorInputMode,
  License,
  WebGL2GraphModelManager,
  WebGL2SelectionIndicatorManager
} from 'yfiles'

import { fetchLicense } from 'demo-resources/fetch-license'
import { checkWebGL2Support, finishLoading } from 'demo-resources/demo-page'
import { initStyleDefaults, updateSelectionStyles } from './graph-styles.js'
import { createGraph } from './load-sample-graph.js'
import { createTransition, selectNodes, wireUpUI } from './ui-interaction.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/** @type {GraphComponent} */
let graphComponent = null

const style = {
  primaryColor: '#fc0335',
  primaryTransparency: 0,
  secondaryColor: '#e3f207',
  secondaryTransparency: 0,
  thickness: 3,
  margins: 3,
  stylePattern: 'solid',
  zoomPolicy: 'mixed',
  easing: 'linear',
  transition: createTransition('linear'),
  animationTiming: null
}

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  if (!checkWebGL2Support()) {
    return
  }

  License.value = await fetchLicense()

  graphComponent = new GraphComponent('#graphComponent')

  applyDemoTheme(graphComponent)

  graphComponent.focusIndicatorManager.enabled = false
  graphComponent.inputMode = new GraphEditorInputMode()

  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
  updateSelectionStyles(style, graphComponent)

  // configures default styles for newly created graph elements
  initStyleDefaults(graphComponent.graph)

  // create an initial sample graph
  createGraph(graphComponent)
  graphComponent.fitGraphBounds()
  selectNodes(graphComponent)

  // bind the buttons to their commands
  wireUpUI(style, graphComponent)
}

void run().then(finishLoading)
