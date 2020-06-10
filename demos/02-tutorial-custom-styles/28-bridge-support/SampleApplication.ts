/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BridgeManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphObstacleProvider,
  ICommand,
  License,
  Rect,
  Size
} from 'yfiles'

import MySimpleEdgeStyle from './MySimpleEdgeStyle'
import MySimpleNodeStyle from './MySimpleNodeStyle'
import { bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

// @ts-ignore
let graphComponent: GraphComponent = null

function run(licenseData: object): void {
  License.value = licenseData
  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')

  // initialize the graph
  initializeGraph()

  // initialize the input mode
  graphComponent.inputMode = createEditorMode()

  graphComponent.fitGraphBounds()

  // ////////////// New in this sample ////////////////
  // Configure the BridgeManager
  configureBridges()
  // //////////////////////////////////////////////////

  // bind the demo buttons to their commands
  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Helper method that binds the various commands available in yFiles for HTML to the buttons
 * in the demo's toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

// //////////////////////////////////////////////////
// ////////////// New in this sample ////////////////
// //////////////////////////////////////////////////
/**
 * Adds and configures the {@link BridgeManager}.
 */
function configureBridges(): void {
  // create a new BridgeManager
  // The graph item styles are responsible for both
  // providing obstacles and drawing bridges,
  // the bridge manager collects the obstacles and
  // updates given edge paths to add bridges.
  // see MySimpleEdgeStyle
  const bridgeManager = new BridgeManager({ canvasComponent: graphComponent })

  // Convenience class that just queries all model item
  const provider = new GraphObstacleProvider()

  // Register an IObstacleProvider, bridgeManager will query all registered obstacle providers
  // to determine if a bridge must be created
  bridgeManager.addObstacleProvider(provider)
}

/**
 * Sets a custom NodeStyle instance as a template for newly created
 * nodes in the graph.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph
  // Create a new style and use it as default node style
  graph.nodeDefaults.style = new MySimpleNodeStyle()
  // Create a new style and use it as default edge style
  graph.edgeDefaults.style = new MySimpleEdgeStyle()
  // Create a new style and use it as default label style

  graph.nodeDefaults.size = new Size(50, 50)

  // Create some graph elements with the above defined styles.
  createSampleGraph()
}

/**
 * Creates the default input mode for the graphComponent,
 * a {@link GraphEditorInputMode}.
 * @return a new GraphEditorInputMode instance
 */
function createEditorMode(): GraphEditorInputMode {
  return new GraphEditorInputMode({
    allowEditLabel: true
  })
}

/**
 * Creates the initial sample graph.
 */
function createSampleGraph(): void {
  const graph = graphComponent.graph
  const node0 = graph.createNode(new Rect(-100, -50, 30, 30))
  const node1 = graph.createNode(new Rect(100, -50, 30, 30))
  graph.createEdge(node0, node1)
  const node2 = graph.createNode(new Rect(-100, 50, 30, 30))
  const node3 = graph.createNode(new Rect(100, 50, 30, 30))
  graph.createEdge(node2, node3)
  const node4 = graph.createNode(new Rect(-50, -100, 30, 30))
  const node5 = graph.createNode(new Rect(-50, 100, 30, 30))
  graph.createEdge(node4, node5)
  const node6 = graph.createNode(new Rect(50, -100, 30, 30))
  const node7 = graph.createNode(new Rect(50, 100, 30, 30))
  graph.createEdge(node6, node7)
}

// Start demo
loadJson().then(run)
