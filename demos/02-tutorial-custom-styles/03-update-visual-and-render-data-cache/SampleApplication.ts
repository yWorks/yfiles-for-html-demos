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
  Animator,
  DefaultLabelStyle,
  EdgePathLabelModel,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  GraphEditorInputMode,
  IAnimation,
  IArrow,
  ICommand,
  IMapper,
  INode,
  License,
  PolylineEdgeStyle,
  Rect,
  Size
} from 'yfiles'

import { MySimpleNodeStyle } from './MySimpleNodeStyle'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app'

import { applyDemoTheme } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

// @ts-ignore
let graphComponent: GraphComponent = null

async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize the graph component
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the graph
  initializeGraph()

  // initialize the input mode
  graphComponent.inputMode = createEditorMode()
  graphComponent.fitGraphBounds()

  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

function registerCommands(): void {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  // /////////////// New in this Sample /////////////////

  bindAction("input[data-command='TogglePerformance']", onTogglePerformance)
  bindAction("button[data-command='StartAnimation']", onStartAnimation)
  // ////////////////////////////////////////////////////
}

// /////////////// New in this Sample /////////////////
// this code is only included in this tutorial step. It is necessary to
// make the toggle button work that can be used to switch between high-
// and low-performance mode.

function onTogglePerformance(): void {
  // switch UpdateVisual() implementation on/off
  const style = graphComponent.graph.nodeDefaults.style
  if (style instanceof MySimpleNodeStyle) {
    // /////////////// New in this Sample /////////////////
    // this code is only included in this tutorial step. It is necessary to
    // make the toggle button work that can be used to switch between high-
    // and low-performance mode.
    style.highPerformanceRendering = (
      document.querySelector("input[data-command='TogglePerformance']") as HTMLInputElement
    ).checked
  }
}

function onStartAnimation(): void {
  startAnimation()
}

function startAnimation(): void {
  // animates the nodes in random fashion
  const animator = new Animator(graphComponent)
  const graphAnimation = IAnimation.createGraphAnimation({
    graph: graphComponent.graph,
    targetNodeLayouts: IMapper.fromDelegate(
      (node: INode): Rect =>
        new Rect(Math.random() * 800, Math.random() * 800, node.layout.width, node.layout.height)
    ),
    preferredDuration: '5s'
  })
  animator.animate(graphAnimation)
}

// ////////////////////////////////////////////////////

/**
 * Sets a custom NodeStyle instance as a template for newly created
 * nodes in the graph.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph

  // Create a new style and use it as default node style
  graph.nodeDefaults.style = new MySimpleNodeStyle()
  // Create a new style and use it as default label style
  const defaultLabelStyle = new DefaultLabelStyle({
    backgroundStroke: 'black',
    backgroundFill: 'white',
    insets: [3, 5, 3, 5]
  })
  graph.nodeDefaults.labels.style = defaultLabelStyle
  graph.edgeDefaults.labels.style = defaultLabelStyle
  // Place labels above nodes, with a small gap
  const labelModel = new ExteriorLabelModel({ insets: 5 })
  graph.nodeDefaults.labels.layoutParameter = labelModel.createParameter(
    ExteriorLabelModelPosition.NORTH
  )

  graph.nodeDefaults.size = new Size(50, 50)

  // Create a new style and use it as default edge style
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: IArrow.DEFAULT
  })

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
 * Creates the default input mode for the GraphComponent,
 * a {@link GraphEditorInputMode}.
 * @returns a new GraphEditorInputMode instance
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

  for (let i = 1; i <= 20; i++) {
    for (let j = 1; j <= 20; j++) {
      graph.createNode(new Rect(40 * i, 40 * j, 30, 30))
    }
  }
}

// noinspection JSIgnoredPromiseFromCall
run()
