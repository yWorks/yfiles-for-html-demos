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
import {
  createDefaultLayoutConfiguration,
  createFeatureLayoutConfiguration
} from './OrganicConstraints.js'
import { finishLoading } from 'demo-resources/demo-page'
import { fetchLicense } from 'demo-resources/fetch-license'
import { applyDemoTheme } from 'demo-resources/demo-styles'
import { loadLayoutSampleGraph } from 'demo-utils/LoadLayoutFeaturesSampleGraph'

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // enable mouse drag panning and mouse wheel zooming
  graphComponent.inputMode = new GraphViewerInputMode()

  // load the graph
  await loadLayoutSampleGraph(graphComponent.graph, './sample.json')

  // create a configured instance of the organic layout algorithm
  const { layout, layoutData } = createFeatureLayoutConfiguration(graphComponent.graph)

  // run the layout algorithm
  await graphComponent.morphLayout(layout, '0s', layoutData)

  initializeUI(graphComponent)
}

/**
 * Registers a listener to the "use constraints" button in the demo toolbar that switches
 * between constraint layout calculation and unconstrained layout calculation.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  document.querySelector('#toggle-feature').addEventListener('click', async event => {
    const useFeature = event.target.checked
    const { layout, layoutData } = useFeature
      ? createFeatureLayoutConfiguration(graphComponent.graph)
      : createDefaultLayoutConfiguration(graphComponent.graph)
    await graphComponent.morphLayout(layout, '250ms', layoutData)
  })
}

void run().then(finishLoading)
