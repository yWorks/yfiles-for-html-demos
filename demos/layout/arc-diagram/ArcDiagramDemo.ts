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
import {
  BezierEdgeStyle,
  Class,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IGraph,
  LayoutExecutor,
  License,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size
} from 'yfiles'
import { ArcDiagramLayout, NodeOrder } from './ArcDiagramLayout'
import SampleData from './resources/SampleData'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

const chooser = document.querySelector<HTMLSelectElement>('#node-order')!

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * Bootstraps this demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  // create the demo's graph component
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // initially disable interactive editing
  configureUserInteraction(graphComponent)

  // configure default styles for the demo's graph
  configureGraph(graphComponent.graph)

  // create the demo's sample graph
  createSampleGraph(graphComponent.graph)

  // center the demo's graph in the demo's visible area
  graphComponent.fitGraphBounds()

  // bind the demo's new node alignment and node distribution operations to the demo's UI controls
  initializeUI(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  finishLoading()

  // calculate and animate an initial layout for the demo's sample graph
  await graphComponent.morphLayout(new ArcDiagramLayout())

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Configures default styles for the given graph.
 * @param graph the graph whose default styles are set.
 */
function configureGraph(graph: IGraph): void {
  graph.nodeDefaults.size = new Size(20, 20)
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: '#FF6C00',
    shape: ShapeNodeShape.ELLIPSE,
    stroke: '1.5px #662b00'
  })

  graph.edgeDefaults.style = new BezierEdgeStyle({
    stroke: '4px #662b00'
  })
}

/**
 * Creates the sample graph for this demo.
 */
function createSampleGraph(graph: IGraph): void {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id'
  })
  builder.createEdgesSource({
    data: SampleData.edges,
    id: 'id',
    sourceId: 'src',
    targetId: 'tgt'
  })
  builder.buildGraph()
}

/**
 * Enables interactive editing for the given graph view.
 * @param graphComponent the demo's main graph view.
 */
function configureUserInteraction(graphComponent: GraphComponent): void {
  const geim = new GraphEditorInputMode()
  // do not show handles for edge reconnection or port movement,
  // because e.g. active port handles make it difficult to move the small default nodes of this demo
  geim.showHandleItems =
    GraphItemTypes.BEND |
    GraphItemTypes.EDGE_LABEL |
    GraphItemTypes.NODE |
    GraphItemTypes.NODE_LABEL |
    GraphItemTypes.PORT_LABEL
  graphComponent.inputMode = geim
}

/**
 * Arranges the graph displayed in the given graph view.
 * @param graphComponent the demo's main graph view.
 */
async function arrange(graphComponent: GraphComponent): Promise<void> {
  const algorithm = new ArcDiagramLayout()
  algorithm.nodeOrder = getNodeOrder()
  await graphComponent.morphLayout(algorithm)
}

/**
 * Determines the currently chosen node order policy.
 */
function getNodeOrder(): NodeOrder {
  const nodeOrder = chooser.options[chooser.selectedIndex].value
  return NodeOrder[nodeOrder as keyof typeof NodeOrder]
}

/**
 * Binds actions and commands to the demo's UI controls.
 */
function initializeUI(graphComponent: GraphComponent): void {
  addNavigationButtons(chooser).addEventListener('change', async () => {
    chooser.disabled = true
    await arrange(graphComponent)
    chooser.disabled = false
  })
  document
    .querySelector<HTMLButtonElement>('#arrange')!
    .addEventListener('click', () => arrange(graphComponent))
}

// noinspection JSIgnoredPromiseFromCall
run()
