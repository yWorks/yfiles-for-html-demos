/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import {
  Class,
  GraphComponent,
  GraphViewerInputMode,
  ICommand,
  LayoutExecutor,
  License
} from 'yfiles'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import {
  createDefaultLayoutConfiguration,
  createFeatureLayoutConfiguration
} from './HierarchicCompactGroups.js'
import { loadLayoutSampleGraph } from '../../utils/LoadTutorialLayoutSampleGraph.js'

import { applyDemoTheme } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

// Ensure that the 'view-layout-bridge' module is used to prevent tree-shaking tools from stripping it
Class.ensure(LayoutExecutor)

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphViewerInputMode()

  // load the graph and run the layout
  await loadLayoutSampleGraph(graphComponent.graph, './sample.json')
  await graphComponent.morphLayout(createFeatureLayoutConfiguration(graphComponent.graph), '0s')
  registerCommands(graphComponent)
  showApp(graphComponent)
}

/**
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindAction("input[data-command='ToggleFeature']", async () => {
    if (document.getElementById('toggleFeature').checked) {
      await graphComponent.morphLayout(
        createFeatureLayoutConfiguration(graphComponent.graph),
        '250ms'
      )
    } else {
      await graphComponent.morphLayout(
        createDefaultLayoutConfiguration(graphComponent.graph),
        '250ms'
      )
    }
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
