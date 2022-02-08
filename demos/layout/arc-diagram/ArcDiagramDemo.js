/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  BezierEdgeStyle,
  Class,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IGraph,
  LayoutExecutor,
  License,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  Stroke
} from 'yfiles'
import loadJson from '../../resources/load-json.js'
import {
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app.js'
import { ArcDiagramLayout, NodeOrder } from './ArcDiagramLayout.js'
import SampleData from './resources/SampleData.js'

const chooser = document.getElementById('nodeorder')

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * Bootstraps this demo.
 * @param {!object} licenseData The yFiles license information.
 * @returns {!Promise}
 */
async function run(licenseData) {
  License.value = licenseData

  // create the demo's graph component
  const graphComponent = new GraphComponent('#graphComponent')

  // initially disable interactive editing
  configureUserInteraction(graphComponent)

  // configure default styles for the demo's graph
  configureGraph(graphComponent.graph)

  // create the demo's sample graph
  createSampleGraph(graphComponent.graph)

  // center the demo's graph in the demo's visible area
  graphComponent.fitGraphBounds()

  // bind the demo's new node alignment and node distribution operations to the demo's UI controls
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)

  // calculate and animate an initial layout for the demo's sample graph
  await graphComponent.morphLayout(new ArcDiagramLayout())

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Configures default styles for the given graph.
 * @param {!IGraph} graph the graph whose default styles are set.
 */
function configureGraph(graph) {
  graph.nodeDefaults.size = new Size(20, 20)
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: '#FF6C00',
    shape: ShapeNodeShape.ELLIPSE,
    stroke: '1.5px #662b00'
  })

  graph.edgeDefaults.style = new BezierEdgeStyle({
    stroke: Stroke.from('4px #662b00')
  })
}

/**
 * Creates the sample graph for this demo.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
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
 * @param {!GraphComponent} graphComponent the demo's main graph view.
 */
function configureUserInteraction(graphComponent) {
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
 * @param {!GraphComponent} graphComponent the demo's main graph view.
 * @returns {!Promise}
 */
async function arrange(graphComponent) {
  const algorithm = new ArcDiagramLayout()
  algorithm.nodeOrder = getNodeOrder()
  await graphComponent.morphLayout(algorithm)
}

/**
 * Determines the currently chosen node order policy.
 * @returns {!NodeOrder}
 */
function getNodeOrder() {
  const nodeOrder = chooser.options[chooser.selectedIndex].value
  return NodeOrder[nodeOrder]
}

/**
 * Binds actions and commands to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindChangeListener('#nodeorder', async () => {
    chooser.disabled = true
    await arrange(graphComponent)
    chooser.disabled = false
  })
  addNavigationButtons(chooser)
  bindAction('#arrange', () => arrange(graphComponent))
}

loadJson().then(checkLicense).then(run)
