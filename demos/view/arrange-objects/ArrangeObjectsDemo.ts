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
import {
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  License
} from 'yfiles'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app'
import {
  alignBottom,
  alignHorizontally,
  alignLeft,
  alignRight,
  alignTop,
  alignVertically,
  distributeHorizontally,
  distributeVertically
} from './AlignmentUtils'
import SampleData from './resources/SampleData'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

/**
 * Bootstraps this demo.
 * @param licenseData The yFiles license information.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // create the demo's graph component
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  // enable interactive editing
  graphComponent.inputMode = new GraphEditorInputMode()

  // configure default styles for the demo's graph
  initDemoStyles(graphComponent.graph, { theme: 'demo-palette-31' })
  // create the demo's sample graph
  createSampleGraph(graphComponent.graph)

  // center the demo's graph in the demo's visible area
  graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true

  // bind the demo's new node alignment and node distribution operations to the demo's UI controls
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Creates the sample graph for this demo.
 */
function createSampleGraph(graph: IGraph): void {
  const data = SampleData
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    layout: 'bounds'
  })
  builder.buildGraph()
}

/**
 * Binds actions and commands to the demo's UI controls.
 */
function registerCommands(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  // bind the demo's new node alignment operations to toolbar controls
  bindAction("button[data-command='AlignBottom']", () =>
    alignBottom(graphComponent.graph, graphComponent.selection.selectedNodes)
  )
  bindAction("button[data-command='AlignHorizontally']", () =>
    alignHorizontally(graphComponent.graph, graphComponent.selection.selectedNodes)
  )
  bindAction("button[data-command='AlignLeft']", () =>
    alignLeft(graphComponent.graph, graphComponent.selection.selectedNodes)
  )
  bindAction("button[data-command='AlignRight']", () =>
    alignRight(graphComponent.graph, graphComponent.selection.selectedNodes)
  )
  bindAction("button[data-command='AlignTop']", () =>
    alignTop(graphComponent.graph, graphComponent.selection.selectedNodes)
  )
  bindAction("button[data-command='AlignVertically']", () =>
    alignVertically(graphComponent.graph, graphComponent.selection.selectedNodes)
  )

  // bind the demo's new node distribution operations to toolbar controls
  bindAction("button[data-command='DistributeHorizontally']", () =>
    distributeHorizontally(graphComponent.graph, graphComponent.selection.selectedNodes)
  )
  bindAction("button[data-command='DistributeVertically']", () =>
    distributeVertically(graphComponent.graph, graphComponent.selection.selectedNodes)
  )
}

// noinspection JSIgnoredPromiseFromCall
run()
