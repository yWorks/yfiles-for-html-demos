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
import {
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  License,
  OrganicLayout
} from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import graphData from './graph-data.json'
import { InteractiveOrganicFastEdgeStyle, InteractiveOrganicFastNodeStyle } from './DemoStyles'
import { initializeWorkerLayout } from './initializeWorkerLayout'

/**
 * The GraphComponent.
 */
let graphComponent

/**
 * Runs the demo.
 */
async function run() {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')

  const graphEditorInputMode = createEditorMode()
  graphComponent.inputMode = graphEditorInputMode

  // initialize the interactive organic layout running in a web worker
  const moveInputMode = graphEditorInputMode.moveSelectedItemsInputMode
  const layout = await initializeWorkerLayout(graphComponent, moveInputMode)

  const graph = graphComponent.graph

  initializeDefaultStyles(graph)

  // build the graph from the given data set
  buildGraph(graph, graphData)

  // We start with a simple run of OrganicLayout to get a good starting result
  // the algorithm is optimized to "unfold" graphs quicker than
  // interactive organic, so we use this result as a starting solution. For
  // simplicity of this demo, we run the initial layout in the UI thread,
  // but the initial layout can also be run in the worker thread.
  const initialLayout = new OrganicLayout({ defaultMinimumNodeDistance: 50 })
  graph.applyLayout(initialLayout)

  // center the graph
  await graphComponent.fitGraphBounds()

  layout.startLayout()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graph.undoEngineEnabled = true
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({ data: graphData.nodeList, id: (item) => item.id })

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Initializes default styles for the given graph.
 */
function initializeDefaultStyles(graph) {
  // set some defaults
  graph.nodeDefaults.style = new InteractiveOrganicFastNodeStyle()
  graph.nodeDefaults.shareStyleInstance = true
  graph.edgeDefaults.style = new InteractiveOrganicFastEdgeStyle()
  graph.edgeDefaults.shareStyleInstance = true
}

/**
 * Creates the input mode for the graphComponent.
 * @returns a new GraphEditorInputMode instance
 */
function createEditorMode() {
  // create default interaction with a number of disabled input modes.
  return new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    marqueeSelectableItems: GraphItemTypes.NODE,
    // make only the selected elements movable
    moveUnselectedItemsInputMode: { enabled: false },
    clickSelectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    showHandleItems: GraphItemTypes.NONE,
    allowAddLabel: false,
    createEdgeInputMode: { allowCreateBend: false, allowSelfLoops: false },
    createBendInputMode: { enabled: false }
  })
}

run().then(finishLoading)
