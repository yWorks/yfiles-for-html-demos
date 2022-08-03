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
  Arrow,
  DefaultLabelStyle,
  ExteriorLabelModel,
  Fill,
  GraphComponent,
  GraphEditorInputMode,
  GraphOverviewComponent,
  GraphSnapContext,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HorizontalTextAlignment,
  ICommand,
  IGraph,
  Insets,
  LabelShape,
  LabelSnapContext,
  License,
  NinePositionsEdgeLabelModel,
  Point,
  PolylineEdgeStyle,
  RectangleNodeStyle,
  Size,
  Stroke,
  Theme,
  VerticalTextAlignment
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/** @type {GraphComponent} */
let graphComponent

/**
 * @typedef {('light'|'dark')} Mode
 */

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize graph component with a custom theme
  initializeGraphComponentWithTheme()

  // initialize a GraphOverviewComponent
  const overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)

  // configure input mode, snapping and undo-engine
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    snapContext: new GraphSnapContext(),
    labelSnapContext: new LabelSnapContext()
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // create a sample graph
  createGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent, overviewComponent)
}

/**
 * Initializes a new graph component with a custom theme.
 */
function initializeGraphComponentWithTheme() {
  // Define the theme, consisting of a general variant, a scale and the colors
  // (see the documentation for more details).
  // This theme and its colors remain the same for the light and the dark mode of this tutorial,
  // which could in practice be the case if theme colors are, e.g., based on corporate design colors.
  const theme = new Theme({
    variant: 'simple-round',
    scale: 2,
    primaryColor: '#FCFDFE',
    secondaryColor: '#F69454',
    backgroundColor: '#EE693F'
  })
  graphComponent = new GraphComponent({ selector: '#graphComponent', theme })
}

/**
 * Switches between the light and dark mode of this tutorial application.
 * @param {!Mode} mode
 */
function enableMode(mode) {
  const backgroundColor = mode === 'dark' ? '#3c4253' : '#fff'
  graphComponent.div.style.backgroundColor = backgroundColor

  // change the content area color of the group nodes
  const groupNodeStyle = graphComponent.graph.groupNodeDefaults.style
  groupNodeStyle.contentAreaFill = Fill.from(backgroundColor)

  // change the stroke and target arrow color of the edges to a color which is
  // offers good visibility on the background
  const stroke = mode === 'dark' ? '#FCFDFE' : '#605003'
  const edgeStyle = graphComponent.graph.edgeDefaults.style
  edgeStyle.stroke = Stroke.from(`1.5px ${stroke}`)
  edgeStyle.targetArrow = new Arrow({
    color: stroke,
    stroke: stroke,
    type: 'triangle'
  })

  // indicate that the component needs to be updated
  graphComponent.invalidate()
}

/**
 * Initializes the defaults for the styling in this tutorial.
 *
 * @param {!IGraph} graph The graph.
 */
function initTutorialDefaults(graph) {
  // define default styling for nodes, group nodes and edges
  const defaultStrokeColor = '#605003'
  const defaultNodeColor = '#f0c808'
  graph.nodeDefaults.style = new RectangleNodeStyle({
    fill: defaultNodeColor,
    stroke: `1.5px ${defaultStrokeColor}`,
    cornerStyle: 'round',
    cornerSize: 3.5
  })
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: `1.5px ${defaultStrokeColor}`,
    targetArrow: `${defaultStrokeColor} triangle`
  })
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: defaultNodeColor,
    stroke: `2px solid ${defaultNodeColor}`,
    contentAreaInsets: 15
  })

  // define default label styles for node, group nodes and edges
  const nodeLabelStyle = new DefaultLabelStyle()
  nodeLabelStyle.shape = LabelShape.ROUND_RECTANGLE
  nodeLabelStyle.backgroundFill = Fill.from('#f9e99c')
  nodeLabelStyle.textFill = Fill.from('#605003')
  nodeLabelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  nodeLabelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  nodeLabelStyle.insets = new Insets(4, 2, 4, 1)
  graph.nodeDefaults.labels.style = nodeLabelStyle

  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    textFill: 'white'
  })

  const edgeLabelStyle = nodeLabelStyle.clone()
  edgeLabelStyle.backgroundFill = Fill.from('#bfb99a')
  graph.edgeDefaults.labels.style = edgeLabelStyle

  // set sizes and label locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = NinePositionsEdgeLabelModel.TARGET_ABOVE
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()

  // initially, enable the light mode styling variant
  enableMode('light')
}

/**
 * Creates a simple sample graph.
 */
function createGraph() {
  const graph = graphComponent.graph

  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([145, 120])
  const node3 = graph.createNodeAt([75, 120])
  const node4 = graph.createNodeAt([30, 220])
  const node5 = graph.createNodeAt([100, 220])
  graph.addLabel(node5, 'Node Label')

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.addLabel(edge3, 'Edge Label')
  graph.setPortLocation(edge1.sourcePort, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort, new Point(145, 100))
  graph.setPortLocation(edge2.sourcePort, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort, new Point(75, 100))
  graph.setPortLocation(edge3.sourcePort, new Point(65, 140))
  graph.setPortLocation(edge3.targetPort, new Point(30, 200))
  graph.setPortLocation(edge4.sourcePort, new Point(85, 140))
  graph.setPortLocation(edge4.targetPort, new Point(90, 200))
  graph.setPortLocation(edge5.sourcePort, new Point(110, 40))
  graph.setPortLocation(edge5.targetPort, new Point(110, 200))
  graph.addBends(edge1, [new Point(123.33, 70), new Point(145, 70)])
  graph.addBends(edge2, [new Point(96.67, 70), new Point(75, 70)])
  graph.addBends(edge3, [new Point(65, 170), new Point(30, 170)])
  graph.addBends(edge4, [new Point(85, 170), new Point(90, 170)])

  graphComponent.fitGraphBounds()
  graph.undoEngine.clear()

  // initial selection of a single node to make the handles visible
  graphComponent.selection.selectedNodes.setSelected(node2, true)
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)

  const lightBtn = document.querySelector("button[data-command='Light']")
  const darkBtn = document.querySelector("button[data-command='Dark']")
  lightBtn.addEventListener('click', () => switchMode('light'))
  darkBtn.addEventListener('click', () => switchMode('dark'))

  function switchMode(mode) {
    enableMode(mode)
    lightBtn.disabled = mode === 'light'
    darkBtn.disabled = mode === 'dark'
  }
}

// noinspection JSIgnoredPromiseFromCall
run()
