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
import { fetchLicense } from 'demo-resources/fetch-license'
import {
  ArcEdgeStyle,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  LayoutExecutor,
  License,
  PortAdjustmentPolicy,
  VoidEdgeStyle
} from 'yfiles'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'
import { pentosePhosphateData } from './resources/pentose-phosphate-data.js'
import { configurePentosePhosphateLayout } from './configure-pentose-layout.js'
import { nodeTypesMap } from './data-types.js'
import { getArcEdgeStyle, initializeDefaultStyles, updateStyles } from './styles.js'
import { krebsCycleData } from './resources/krebs-cycle-data.js'
import { configureKrebsCycleLayout } from './configure-krebs-cycle-layout.js'
import { applyDemoTheme } from 'demo-resources/demo-styles'

/** @type {GraphComponent} */
let graphComponent

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the interaction
  graphComponent.inputMode = new GraphViewerInputMode()

  // set some default styles for nodes and edges
  initializeDefaultStyles(graphComponent.graph)

  // load the data-set and create the graph
  loadSample()

  // configure and run the organic layout algorithm
  void runLayout()

  // wire-up the UI
  initializeUI()
}

/**
 * Loads the new graph sample and updates the style and the graph structure.
 */
function loadSample() {
  // read the input data and create the graph
  createGraph()
  // update the nodes/edge styles based on the node types
  updateStyles(graphComponent.graph)
  // remove the parallel edge since we use a bidirectional edge style
  removeParallelEdges()
}

/**
 * Runs the appropriate layout configuration based on the selected sample.
 * @returns {!Promise}
 */
async function runLayout() {
  const sample = document.querySelector('#select-sample').value
  const config =
    sample === 'pentose'
      ? configurePentosePhosphateLayout(graphComponent)
      : configureKrebsCycleLayout()

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: config.layout,
    layoutData: config.layoutData,
    duration: '0s',
    animateViewport: true,
    portAdjustmentPolicy: PortAdjustmentPolicy.LENGTHEN
  })
  await layoutExecutor.start()

  // update arc edges based on the source/target positions
  const graph = graphComponent.graph
  graph.edges
    .filter(edge => edge.style instanceof ArcEdgeStyle)
    .forEach(edge => graph.setStyle(edge, getArcEdgeStyle(graph, edge)))
}

/**
 * Loads the input data and builds the graph.
 */
function createGraph() {
  const sample = document.querySelector('#select-sample').value
  const sampleData = sample === 'pentose' ? pentosePhosphateData : krebsCycleData

  const builder = new GraphBuilder(graphComponent.graph)
  // create the nodes and update the nodes' tag based on the type mapping
  builder.createNodesSource({
    data: sampleData.nodes,
    id: 'id',
    tag: data => {
      return { ...data.tag, type: nodeTypesMap.get(data.tag.type) }
    },
    labels: [data => data.label ?? '']
  })

  // create the edges
  builder.createEdgesSource({
    data: sampleData.edges,
    sourceId: 'source',
    targetId: 'target'
  })

  // create the graph
  builder.buildGraph()
}

/**
 * Removes the parallel edges that have already been assigned a VoidEdgeStyle.
 */
function removeParallelEdges() {
  const graph = graphComponent.graph
  for (const edge of graph.edges.toArray()) {
    if (edge.style instanceof VoidEdgeStyle) {
      graph.remove(edge)
    }
  }
}

/**
 * Binds actions to the elements of the toolbar.
 */
function initializeUI() {
  const sampleComboBox = document.querySelector('#select-sample')
  addNavigationButtons(sampleComboBox)
  sampleComboBox.addEventListener('change', async () => {
    graphComponent.graph.clear()
    loadSample()
    await runLayout()
  })
}

void run().then(finishLoading)
