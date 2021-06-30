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
  Animator,
  GraphComponent,
  GraphEditorInputMode,
  IAnimation,
  ICommand,
  IMapper,
  INode,
  License,
  Rect,
  Size
} from 'yfiles'

import MySimpleNodeStyle from './MySimpleNodeStyle.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
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

  // initialize the graph
  initializeGraph()

  // initialize the input mode
  graphComponent.inputMode = createEditorMode()

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

  // /////////////// New in this Sample /////////////////
  bindAction("button[data-command='StartAnimation']", animationButtonClick)
  bindAction("input[data-command='TogglePerformance']", performanceButtonClick)
}

/**
 * Sets a custom NodeStyle instance as a template for newly created
 * nodes in the graph.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  // Create a new style and use it as default node style
  graph.nodeDefaults.style = new MySimpleNodeStyle()
  graph.nodeDefaults.size = new Size(50, 50)

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
  for (let i = 1; i <= 40; i++) {
    for (let j = 1; j <= 40; j++) {
      graphComponent.graph.createNode(new Rect(60 * i, 60 * j, 30, 30))
    }
  }
}

function performanceButtonClick() {
  // switch canvas painting on/off
  const graph = graphComponent.graph
  const style = graph.nodeDefaults.style
  if (style instanceof MySimpleNodeStyle) {
    // /////////////// New in this Sample /////////////////
    // this code is only included in this tutorial step. It is necessary to
    // make the toggle button work that can be used to switch between high-
    // and low-performance mode.
    style.highPerformanceRendering = window.document.getElementById('togglePerformance').checked
    graph.invalidateDisplays()
  }
}

/** @type {Animator} */
let animator = null

function animationButtonClick() {
  startAnimation()
}

function startAnimation() {
  // animates the nodes in random fashion
  if (animator === null) {
    animator = new Animator(graphComponent)
  }
  const graphAnimation = IAnimation.createGraphAnimation(
    graphComponent.graph,
    IMapper.fromDelegate(
      node =>
        new Rect(Math.random() * 2400, Math.random() * 2400, node.layout.width, node.layout.height)
    ),
    null,
    null,
    null,
    '5s'
  )
  animator.animate(graphAnimation)
}

// ////////////////////////////////////////////////////

// Start demo
loadJson().then(run)
