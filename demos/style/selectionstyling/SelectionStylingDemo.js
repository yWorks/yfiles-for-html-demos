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
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeStyleDecorationInstaller,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  LabelStyleDecorationInstaller,
  License,
  List,
  NodeStyleDecorationInstaller,
  NodeStyleLabelStyleAdapter,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  StyleDecorationZoomPolicy,
  VoidLabelStyle
} from 'yfiles'

import { DemoEdgeStyle, DemoNodeStyle } from '../../resources/demo-styles.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/** @type {NodeStyleDecorationInstaller} */
let nodeDecorationInstaller = null

/** @type {EdgeStyleDecorationInstaller} */
let edgeDecorationInstaller = null

/** @type {LabelStyleDecorationInstaller} */
let labelDecorationInstaller = null

let zoomModeComboBox = null

let nodesSelected = true

let edgesSelected = true

let labelsSelected = true

/**
 * Runs the demo.
 */
function run(licenseData) {
  License.value = licenseData
  // initialize UI's elements
  init()

  // initialize the style decoration
  initializeDecoration()

  // initialize default graph styles, the graph and input modes
  initializeGraph()

  // initializes the zoom mode decoration
  updateZoomModeDecoration()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes the UI's elements.
 */
function init() {
  graphComponent = new GraphComponent('graphComponent')
  zoomModeComboBox = document.getElementById('zoomModeComboBox')

  // initialize the helper UI
  zoomModeComboBox.items = List.fromArray(['Mixed', 'WorldCoordinates', 'ViewCoordinates'])

  zoomModeComboBox.items.forEach(name => {
    const option = document.createElement('option')
    option.text = name
    zoomModeComboBox.add(option)
  })
  zoomModeComboBox.selectedIndex = 0
}

/**
 * Initializes the styles for the graph nodes, edges, labels.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.nodeDefaults.size = new Size(50, 30)

  // defaults for labels
  const simpleLabelStyle = new DefaultLabelStyle({
    backgroundFill: 'rgb(104, 176, 227)',
    textFill: 'white',
    insets: [3, 5, 3, 5]
  })

  // nodes...
  graph.nodeDefaults.labels.style = simpleLabelStyle
  const exteriorLabelModel = new ExteriorLabelModel({ insets: 15 })
  graph.nodeDefaults.labels.layoutParameter = exteriorLabelModel.createParameter(
    ExteriorLabelModelPosition.NORTH
  )

  graph.edgeDefaults.style = new DemoEdgeStyle()
  graph.edgeDefaults.labels.style = simpleLabelStyle

  // labels
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel().createDefaultParameter()

  // create a simple sample graph
  const n1 = graph.createNode(new Rect(0, 0, 50, 30))
  const n2 = graph.createNode(new Rect(250, 20, 50, 30))

  graph.addLabel(n1, 'Node 1')
  graph.addLabel(n2, 'Node 2')

  const edge = graph.createEdge(n1, n2)
  graph.addBend(edge, new Point(100, 35))
  graph.addLabel(edge, 'Edge Label')

  // center the graph on the screen
  graphComponent.fitGraphBounds()

  // select all elements to show the effect
  selectAllNodes()
  selectAllEdges()
  selectAllLabels()

  // initialize the input mode to enable editing
  graphComponent.inputMode = new GraphEditorInputMode({
    // and selecting nodes, edges, and labels at once with the marquee
    marqueeSelectableItems: GraphItemTypes.LABEL_OWNER | GraphItemTypes.LABEL
  })
}

/**
 * Initializes the selection decorations.
 */
function initializeDecoration() {
  // for nodes...
  nodeDecorationInstaller = new NodeStyleDecorationInstaller({
    // we choose a shape node style
    nodeStyle: new ShapeNodeStyle({
      shape: 'rectangle',
      stroke: 'rgb(104, 176, 227)',
      fill: 'transparent'
    }),
    // with a margin for the decoration
    margins: 10
  })

  // for edges..
  // just a thick polyline edge style
  edgeDecorationInstaller = new EdgeStyleDecorationInstaller({
    edgeStyle: new PolylineEdgeStyle({
      stroke: '3px rgb(104, 176, 227)'
    })
  })

  // ... and for labels
  labelDecorationInstaller = new LabelStyleDecorationInstaller({
    // we use a node style with a rounded rectangle adapted as a label style and we declare a margin for the
    // decoration
    labelStyle: new NodeStyleLabelStyleAdapter(
      new ShapeNodeStyle({
        shape: ShapeNodeShape.ROUND_RECTANGLE,
        stroke: 'rgb(104, 176, 227)',
        fill: 'transparent'
      }),
      VoidLabelStyle.INSTANCE
    ),
    margins: 5
  })

  // now register our implementations
  // but make it conditional depending on the state of the buttons
  const decorator = graphComponent.graph.decorator

  const nodeSelection = decorator.nodeDecorator.selectionDecorator
  nodeSelection.setImplementation(node => nodesSelected, nodeDecorationInstaller)

  const edgeSelection = decorator.edgeDecorator.selectionDecorator
  edgeSelection.setImplementation(edge => edgesSelected, edgeDecorationInstaller)

  const labelSelection = decorator.labelDecorator.selectionDecorator
  labelSelection.setImplementation(label => labelsSelected, labelDecorationInstaller)
}

/**
 * Sets, removes and updates the custom selection decoration for nodes,
 * edges, and labels according to the current settings.
 */
function updateZoomModeDecoration() {
  let selectedZoomMode

  if (zoomModeComboBox.selectedIndex === 1) {
    selectedZoomMode = StyleDecorationZoomPolicy.WORLD_COORDINATES
  } else if (zoomModeComboBox.selectedIndex === 2) {
    selectedZoomMode = StyleDecorationZoomPolicy.VIEW_COORDINATES
  } else {
    selectedZoomMode = StyleDecorationZoomPolicy.MIXED
  }

  nodeDecorationInstaller.zoomPolicy = selectedZoomMode
  edgeDecorationInstaller.zoomPolicy = selectedZoomMode
  labelDecorationInstaller.zoomPolicy = selectedZoomMode
}

function selectAllNodes() {
  const nodeSelection = graphComponent.selection.selectedNodes
  graphComponent.graph.nodes.forEach(node => {
    nodeSelection.setSelected(node, true)
  })
}

function selectAllEdges() {
  const edgeSelection = graphComponent.selection.selectedEdges
  graphComponent.graph.edges.forEach(edge => {
    edgeSelection.setSelected(edge, true)
  })
}

function selectAllLabels() {
  const labelSelection = graphComponent.selection.selectedLabels
  graphComponent.graph.edgeLabels.forEach(label => {
    labelSelection.setSelected(label, true)
  })
  graphComponent.graph.nodeLabels.forEach(label => {
    labelSelection.setSelected(label, true)
  })
}

/**
 * Wires up the UI.
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand(
    "button[data-command='GroupSelection']",
    ICommand.GROUP_SELECTION,
    graphComponent,
    null
  )
  bindCommand(
    "button[data-command='UngroupSelection']",
    ICommand.UNGROUP_SELECTION,
    graphComponent,
    null
  )

  bindAction("input[data-command='UpdateNodeDecorationCommand']", customNodeDecorationChanged)
  bindAction("input[data-command='UpdateEdgeDecorationCommand']", customEdgeDecorationChanged)
  bindAction("input[data-command='UpdateLabelDecorationCommand']", customLabelDecorationChanged)

  bindChangeListener("select[data-command='ZoomMode']", zoomModeChanged)
}

function customNodeDecorationChanged() {
  nodesSelected = document.querySelector("input[data-command='UpdateNodeDecorationCommand']")
    .checked
  graphComponent.selection.selectedNodes.clear()
  selectAllNodes()
}

function customEdgeDecorationChanged() {
  edgesSelected = document.querySelector("input[data-command='UpdateEdgeDecorationCommand']")
    .checked
  graphComponent.selection.selectedEdges.clear()
  selectAllEdges()
}

function customLabelDecorationChanged() {
  labelsSelected = document.querySelector("input[data-command='UpdateLabelDecorationCommand']")
    .checked
  graphComponent.selection.selectedLabels.clear()
  selectAllLabels()
}

function zoomModeChanged() {
  updateZoomModeDecoration()
  graphComponent.invalidate()
}

// start demo
loadJson().then(run)
