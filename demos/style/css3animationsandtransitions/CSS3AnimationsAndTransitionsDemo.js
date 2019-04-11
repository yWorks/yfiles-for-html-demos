/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  License,
  Point,
  Size
} from 'yfiles'

import CSS3NodeStyle from './CSS3NodeStyle.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import { bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  enableFolding()

  initializeGraph()

  graphComponent.inputMode = createEditorMode()

  graphComponent.fitGraphBounds()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Setup graph defaults.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  // hide regular highlight styling as we define custom ones with CSS
  graph.decorator.nodeDecorator.selectionDecorator.hideImplementation()
  graph.decorator.edgeDecorator.selectionDecorator.hideImplementation()
  graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()

  initDemoStyles(graph)
  // use our custom node style
  graph.nodeDefaults.style = new CSS3NodeStyle()

  graph.nodeDefaults.size = new Size(80, 80)

  // set the CSS class to use for group nodes
  graph.groupNodeDefaults.style.cssClass = 'group-node'

  // Create some graph elements with the above defined styles.
  createSampleGraph()
}

/**
 * Creates the default input mode for the graphComponent, a {@link GraphEditorInputMode}.
 * @return {IInputMode} a new GraphEditorInputMode instance
 */
function createEditorMode() {
  const mode = new GraphEditorInputMode({
    hideLabelDuringEditing: false,
    allowGroupingOperations: true
  })

  // whenever a node is created by the user, we set a created flag on its tag data object, which will then be used
  // by the custom node style to set the appropriate CSS classes
  mode.addNodeCreatedListener((sender, args) => {
    const node = args.item
    node.tag = {}
    node.tag.created = true
  })

  return mode
}

/**
 * Creates the initial sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph

  const n0 = graph.createNodeAt(new Point(291, 433))
  const n1 = graph.createNodeAt(new Point(396, 398))
  const n2 = graph.createNodeAt(new Point(462, 308))
  const n3 = graph.createNodeAt(new Point(462, 197))
  const n4 = graph.createNodeAt(new Point(396, 107))
  const n5 = graph.createNodeAt(new Point(291, 73))
  const n6 = graph.createNodeAt(new Point(185, 107))
  const n7 = graph.createNodeAt(new Point(119, 197))
  const n8 = graph.createNodeAt(new Point(119, 308))
  const n9 = graph.createNodeAt(new Point(185, 398))

  graph.createEdge(n0, n4)
  graph.createEdge(n6, n0)
  graph.createEdge(n6, n5)
  graph.createEdge(n5, n2)
  graph.createEdge(n3, n7)
  graph.createEdge(n9, n4)
  graph.createEdge(n1, n8)

  // put all nodes into a group
  graph.groupNodes(graph.nodes)
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

/**
 * @type {FoldingManager}
 */
let foldingManager = null

/**
 * Enables folding - changes the graphComponent's graph to a managed view
 * that provides the actual collapse/expand state.
 */
function enableFolding() {
  foldingManager = new FoldingManager(graphComponent.graph)
  graphComponent.graph = foldingManager.createFoldingView().graph
}

// start demo
loadJson().then(run)
