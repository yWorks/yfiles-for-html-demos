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
  Arrow,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  EdgeStyleDecorationInstaller,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  ICommand,
  IGraph,
  License,
  NodeStyleDecorationInstaller,
  Point,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import { applyDemoTheme, initDemoStyles } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // create graph component
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  // enable mouse hover effects for nodes
  configureHoverHighlight(graphComponent.graph, graphComponent.inputMode)

  // create an initial sample graph
  createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // Finally, enable the undo engine. This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // bind the buttons to their commands
  registerCommands(graphComponent)

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Registers highlight styles for the nodes and edges of the given graph.
 *
 * @param {!IGraph} graph The graph for which highlight styles are specified.
 * @param {!GraphInputMode} inputMode The input mode of the graph component
 */
function configureHoverHighlight(graph, inputMode) {
  // enable hover effects for nodes and edges
  inputMode.itemHoverInputMode.enabled = true
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  inputMode.itemHoverInputMode.discardInvalidItems = false

  // specify the hover effect: highlight a node or an edge whenever the mouse hovers over the
  // respective node or edge
  inputMode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
    const highlightManager = sender.inputModeContext.canvasComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    const item = args.item
    if (item) {
      highlightManager.addHighlight(item)
    }
  })

  const nodeHighlightingStyle = new NodeStyleDecorationInstaller({
    nodeStyle: new ShapeNodeStyle({
      shape: 'rectangle',
      stroke: '3px #621B00',
      fill: 'transparent'
    }),
    // the margin from the actual node to its highlight visualization
    margins: 4
  })
  graph.decorator.nodeDecorator.highlightDecorator.setImplementation(nodeHighlightingStyle)

  const edgeHighlightStyle = new EdgeStyleDecorationInstaller({
    edgeStyle: new PolylineEdgeStyle({
      targetArrow: new Arrow({
        type: 'triangle',
        stroke: '2px rgb(104, 176, 227)',
        fill: 'rgb(104, 176, 227)'
      }),
      stroke: '3px rgb(104, 176, 227)'
    })
  })
  graph.decorator.edgeDecorator.highlightDecorator.setImplementation(edgeHighlightStyle)
}

/**
 * Initializes the defaults for the styles in this tutorial.
 *
 * @param {!IGraph} graph The graph.
 */
function initTutorialDefaults(graph) {
  // set styles that are the same for all tutorials
  initDemoStyles(graph)

  // set the style, label and label parameter for group nodes
  // set the style, label and label parameter for group nodes
  graph.groupNodeDefaults.style = new GroupNodeStyle({
    tabFill: '#46a8d5',
    stroke: '2px solid #b5dcee',
    contentAreaFill: '#b5dcee'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: '#eee'
  })

  // set sizes and locations specific for this tutorial
  graph.nodeDefaults.size = new Size(40, 40)

  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

/**
 * Creates an initial sample graph.
 *
 * @param {!IGraph} graph The graph.
 */
function createGraph(graph) {
  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([145, 95])
  const node3 = graph.createNodeAt([75, 95])
  const node4 = graph.createNodeAt([30, 175])
  const node5 = graph.createNodeAt([100, 175])

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.setPortLocation(edge1.sourcePort, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort, new Point(145, 75))
  graph.setPortLocation(edge2.sourcePort, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort, new Point(75, 75))
  graph.setPortLocation(edge3.sourcePort, new Point(65, 115))
  graph.setPortLocation(edge3.targetPort, new Point(30, 155))
  graph.setPortLocation(edge4.sourcePort, new Point(85, 115))
  graph.setPortLocation(edge4.targetPort, new Point(90, 155))
  graph.setPortLocation(edge5.sourcePort, new Point(110, 40))
  graph.setPortLocation(edge5.targetPort, new Point(110, 155))
  graph.addBends(edge1, [new Point(123.33, 55), new Point(145, 55)])
  graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
  graph.addBends(edge3, [new Point(65, 130), new Point(30, 130)])
  graph.addBends(edge4, [new Point(85, 130), new Point(90, 130)])
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
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
}

// noinspection JSIgnoredPromiseFromCall
run()
