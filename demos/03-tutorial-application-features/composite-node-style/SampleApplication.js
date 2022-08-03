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
  ExteriorLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IGraph,
  ImageNodeStyle,
  INodeStyle,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import { bindCommand, showApp } from '../../resources/demo-app.js'
import { CompositeNodeStyle } from './CompositeNodeStyle.js'
import SampleData from './resources/SampleData.js'

import { applyDemoTheme } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'

/**
 * Stores the style definitions to be used with {@link CompositeNodeStyle}.
 * @typedef {Object} StyleDefinitions
 * @property {StyleDefinition} background
 * @property {StyleDefinition} border
 * @property {StyleDefinition} printer
 * @property {StyleDefinition} router
 * @property {StyleDefinition} scanner
 * @property {StyleDefinition} server
 * @property {StyleDefinition} switch
 * @property {StyleDefinition} workstation
 */

/**
 * Bootstraps the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize graph component
  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // configure user interaction
  configureUserInteraction(graphComponent)

  // create the style definitions from which to compose this demo's node visualizations
  const stylesDefinitions = createStyleDefinitions()

  // configures default styles for newly created graph elements
  configureGraph(graphComponent.graph, stylesDefinitions)

  // add a sample graph
  createGraph(graphComponent.graph, stylesDefinitions)

  // center the sample graph in the visible area
  graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true

  // bind commands to the demo's UI controls
  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Enables interactive editing, but prevents interactive resizing of nodes.
 * @param {!GraphComponent} graphComponent the graph view for which interactive editing is enabled.
 */
function configureUserInteraction(graphComponent) {
  graphComponent.inputMode = new GraphEditorInputMode({
    // removing nodes from showHandleItems effectively turns off resizing for nodes
    // resizing is turned off, because the node visualization used in this demo combine
    // circular background visualizations with rectangular foreground icons and due to
    // CompositeNodeStyle's approach of using absolute insets, increasing the size of a node
    // might lead to a rectangular icon no longer fitting inside its circular border
    showHandleItems:
      GraphItemTypes.BEND |
      GraphItemTypes.EDGE |
      GraphItemTypes.EDGE_LABEL |
      GraphItemTypes.NODE_LABEL |
      GraphItemTypes.PORT |
      GraphItemTypes.PORT_LABEL
  })
}

/**
 * Sets defaults styles for the given graph.
 * @param {!IGraph} graph
 * @param {!StyleDefinitions} styleDefinitions
 */
function configureGraph(graph, styleDefinitions) {
  // specify a default node size that works well with the insets used in the given style definitions
  graph.nodeDefaults.size = new Size(96, 96)

  graph.nodeDefaults.style = createCompositeStyle(styleDefinitions, 'workstation')

  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px #617984'
  })
}

/**
 * Creates a sample graph.
 * @param {!IGraph} graph
 * @param {!StyleDefinitions} stylesDefinitions
 */
function createGraph(graph, stylesDefinitions) {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    labels: ['label'],
    layout: 'bounds',
    style: data => createCompositeStyle(stylesDefinitions, data.type)
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
 * Creates a new {@link CompositeNodeStyle} instance with the default background and border from
 * the given style definitions as well as the requested icon from the given style definitions.
 * @param {!StyleDefinitions} styleDefinitions the style definitions used to compose a new node style.
 * @param {!StyleDefinitions} icon the icon to show in the create composite node style instance.
 * @returns {!INodeStyle}
 */
function createCompositeStyle(styleDefinitions, icon) {
  return new CompositeNodeStyle([
    styleDefinitions.background,
    styleDefinitions.border,
    styleDefinitions[icon]
  ])
}

/**
 * Creates several style definitions to use with {@link CompositeNodeStyle}.
 * @returns {!StyleDefinitions}
 */
function createStyleDefinitions() {
  return {
    // the main style for the nodes in this demo
    // aside from background visualization, this style is used for all style related operations
    // such as hit testing and visibility testing
    background: {
      style: new ShapeNodeStyle({ stroke: null, fill: '#eee', shape: 'ellipse' })
    },
    // the border visualization for the nodes in this demo
    // the insets used here ensure the the border is drawn completely inside the node bounds
    border: {
      style: new ShapeNodeStyle({ stroke: '3px #617984', fill: 'none', shape: 'ellipse' }),
      insets: 2 // half the stroke width to ensure the border is drawn completely inside the node bounds
    },
    // a printer icon for nodes
    printer: {
      style: new ImageNodeStyle('./resources/printer.svg'),
      // ensure the icon is completely inside the circular border visualization used for nodes
      // these values assume a node size of 96 x 96 pixels (at zoom 1)
      insets: [20, 16.5, 20, 16.5]
    },
    // a router icon for nodes, uses the same techniques as printer above
    router: {
      style: new ImageNodeStyle('./resources/router.svg'),
      insets: 17
    },
    // a scanner icon for nodes, uses the same techniques as printer above
    scanner: {
      style: new ImageNodeStyle('./resources/scanner.svg'),
      insets: [27, 12, 27, 12]
    },
    // a server icon for nodes, uses the same techniques as printer above
    server: {
      style: new ImageNodeStyle('./resources/server.svg'),
      insets: [16, 25, 16, 25]
    },
    // a switch icon for nodes, uses the same techniques as printer above
    switch: {
      style: new ImageNodeStyle('./resources/switch.svg'),
      insets: [30, 10, 30, 10]
    },
    // a workstation icon for nodes, uses the same techniques as printer above
    workstation: {
      style: new ImageNodeStyle('./resources/workstation.svg'),
      insets: [20, 17.5, 20, 17.5]
    }
  }
}

/**
 * Binds commands to the demo's UI controls.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
}

// noinspection JSIgnoredPromiseFromCall
run()
