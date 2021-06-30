/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgePathLabelModel,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  License,
  Point,
  Rect,
  Size
} from 'yfiles'

import MySimpleEdgeStyle from './MySimpleEdgeStyle.js'
import MySimpleLabelStyle from './MySimpleLabelStyle.js'
import MySimpleNodeStyle from './MySimpleNodeStyle.js'
import { bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')

  // initialize the input mode
  graphComponent.inputMode = createEditorMode()

  // initialize the graph
  initializeGraph()

  graphComponent.fitGraphBounds()

  // bind the demo buttons to their commands
  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Helper method that binds the various commands available in yFiles for HTML to the buttons
 * in the demo's toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

/**
 * Sets a custom NodeStyle instance as a template for newly created
 * nodes in the graph.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  // Create a new style and use it as default node style
  graph.nodeDefaults.style = new MySimpleNodeStyle()

  // Create a new style and use it as default label style
  graph.nodeDefaults.labels.style = new MySimpleLabelStyle()

  // Place labels above nodes, with a small gap
  const labelModel = new ExteriorLabelModel({ insets: 5 })
  graph.nodeDefaults.labels.layoutParameter = labelModel.createParameter('north')

  graph.nodeDefaults.size = new Size(50, 50)

  // Create a new style and use it as default edge style
  const edgeStyle = new MySimpleEdgeStyle()
  edgeStyle.pathThickness = 7
  graph.edgeDefaults.style = edgeStyle
  graph.edgeDefaults.labels.style = new MySimpleLabelStyle()

  // For edge labels, the default is a label that is rotated to match the associated edge segment
  // We'll start by creating a model that is similar to the default:
  const edgeLabelModel = new EdgePathLabelModel({
    autoRotation: true
  })
  // Finally, we can set this label model as the default for edge labels
  graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()

  // Create some graph elements with the above defined styles.
  createSampleGraph()
}

/**
 * Creates the default input mode for the graphComponent,
 * a {@link GraphEditorInputMode}.
 * @returns {!GraphEditorInputMode} a new GraphEditorInputMode instance
 */
function createEditorMode() {
  return new GraphEditorInputMode({
    allowEditLabel: true
  })
}

/**
 * Creates the initial sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph
  const node0 = graph.createNode(new Rect(180, 40, 30, 30))
  const node1 = graph.createNode(new Rect(260, 50, 30, 30))
  const node2 = graph.createNode(new Rect(284, 200, 30, 30))
  const node3 = graph.createNode(new Rect(350, 40, 30, 30))
  const edge0 = graph.createEdge(node1, node2)
  // Add some bends
  graph.addBend(edge0, new Point(350, 130))
  graph.addBend(edge0, new Point(230, 170))
  graph.createEdge(node1, node0)
  graph.createEdge(node1, node3)
  graph.addLabel(node1, 'Node Label')
  graph.addLabel(edge0, 'Edge Label')
}

// Start demo
loadJson().then(run)
