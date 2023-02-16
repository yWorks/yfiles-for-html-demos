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
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeStyleDecorationInstaller,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  LabelStyleDecorationInstaller,
  License,
  NodeStyleDecorationInstaller,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  Size,
  StyleDecorationZoomPolicy
} from 'yfiles'

import { bindChangeListener, bindCommand, showApp } from '../../resources/demo-app'
import {
  applyDemoTheme,
  createDemoEdgeStyle,
  createDemoNodeStyle
} from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

let graphComponent: GraphComponent

let nodeDecorationInstaller: NodeStyleDecorationInstaller

let edgeDecorationInstaller: EdgeStyleDecorationInstaller

let labelDecorationInstaller: LabelStyleDecorationInstaller

let zoomModeComboBox: HTMLSelectElement

let nodesSelected = true

let edgesSelected = true

let labelsSelected = true

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
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
function init(): void {
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  zoomModeComboBox = document.getElementById('zoomModeComboBox') as HTMLSelectElement

  // initialize the helper UI
  const items = ['Mixed', 'Zoom with Graph', 'Always the same size']

  items.forEach(name => {
    const option = document.createElement('option')
    option.text = name
    zoomModeComboBox.add(option)
  })
  zoomModeComboBox.selectedIndex = 0
}

/**
 * Initializes the styles for the graph nodes, edges, labels.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = createDemoNodeStyle()
  graph.nodeDefaults.size = new Size(50, 30)

  // defaults for labels
  const simpleLabelStyle = new DefaultLabelStyle({
    backgroundFill: '#FFC398',
    textFill: '#662b00',
    insets: [3, 5, 3, 5]
  })

  // nodes...
  graph.nodeDefaults.labels.style = simpleLabelStyle
  const exteriorLabelModel = new ExteriorLabelModel({ insets: 15 })
  graph.nodeDefaults.labels.layoutParameter = exteriorLabelModel.createParameter('north')

  graph.edgeDefaults.style = createDemoEdgeStyle()
  graph.edgeDefaults.labels.style = simpleLabelStyle

  // labels
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel().createDefaultParameter()

  // create a simple sample graph
  const n1 = graph.createNode({ layout: new Rect(0, 0, 50, 30), labels: ['Node 1'] })
  const n2 = graph.createNode({ layout: new Rect(250, 20, 50, 30), labels: ['Node 2'] })

  graph.createEdge({
    source: n1,
    target: n2,
    bends: [new Point(100, 35)],
    labels: ['Edge Label']
  })

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
function initializeDecoration(): void {
  // for nodes...
  nodeDecorationInstaller = new NodeStyleDecorationInstaller({
    // we choose a shape node style
    nodeStyle: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: '#01BAFF',
      fill: 'transparent'
    }),
    // with a margin for the decoration
    margins: 8
  })

  // for edges..
  // just a thick polyline edge style
  edgeDecorationInstaller = new EdgeStyleDecorationInstaller({
    edgeStyle: new PolylineEdgeStyle({
      stroke: '3px #01BAFF'
    })
  })

  // ... and for labels
  labelDecorationInstaller = new LabelStyleDecorationInstaller({
    // we use a node style with a rounded rectangle adapted as a label style, and we declare a margin for the
    // decoration
    labelStyle: new DefaultLabelStyle({
      shape: 'rectangle',
      backgroundStroke: '#01BAFF',
      textFill: 'transparent'
    }),
    margins: 5
  })

  // now register our implementations
  // but make it conditional depending on the state of the buttons
  const decorator = graphComponent.graph.decorator

  const nodeSelection = decorator.nodeDecorator.selectionDecorator
  nodeSelection.setImplementation(() => nodesSelected, nodeDecorationInstaller)

  const edgeSelection = decorator.edgeDecorator.selectionDecorator
  edgeSelection.setImplementation(() => edgesSelected, edgeDecorationInstaller)

  const labelSelection = decorator.labelDecorator.selectionDecorator
  labelSelection.setImplementation(() => labelsSelected, labelDecorationInstaller)

  // hide focus indication
  decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()
}

/**
 * Sets, removes and updates the custom selection decoration for nodes,
 * edges, and labels according to the current settings.
 */
function updateZoomModeDecoration(): void {
  const zoomModes = [
    StyleDecorationZoomPolicy.MIXED,
    StyleDecorationZoomPolicy.WORLD_COORDINATES,
    StyleDecorationZoomPolicy.VIEW_COORDINATES
  ]
  const selectedZoomMode = zoomModes[zoomModeComboBox.selectedIndex]

  nodeDecorationInstaller.zoomPolicy = selectedZoomMode
  edgeDecorationInstaller.zoomPolicy = selectedZoomMode
  labelDecorationInstaller.zoomPolicy = selectedZoomMode
}

function selectAllNodes(): void {
  const nodeSelection = graphComponent.selection.selectedNodes
  graphComponent.graph.nodes.forEach(node => {
    nodeSelection.setSelected(node, true)
  })
}

function selectAllEdges(): void {
  const edgeSelection = graphComponent.selection.selectedEdges
  graphComponent.graph.edges.forEach(edge => {
    edgeSelection.setSelected(edge, true)
  })
}

function selectAllLabels(): void {
  const labelSelection = graphComponent.selection.selectedLabels
  graphComponent.graph.labels.forEach(label => {
    labelSelection.setSelected(label, true)
  })
}

/**
 * Wires up the UI.
 */
function registerCommands(): void {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1)

  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)

  bindChangeListener("input[data-command='UpdateNodeDecorationCommand']", checked =>
    customNodeDecorationChanged(checked as boolean)
  )
  bindChangeListener("input[data-command='UpdateEdgeDecorationCommand']", checked =>
    customEdgeDecorationChanged(checked as boolean)
  )
  bindChangeListener("input[data-command='UpdateLabelDecorationCommand']", checked =>
    customLabelDecorationChanged(checked as boolean)
  )

  bindChangeListener("select[data-command='ZoomMode']", zoomModeChanged)
}

function customNodeDecorationChanged(value: boolean) {
  nodesSelected = value
  // de-select and re-select all nodes to refresh the selection visualization
  graphComponent.selection.selectedNodes.clear()
  selectAllNodes()
}

function customEdgeDecorationChanged(value: boolean) {
  edgesSelected = value
  // de-select and re-select all edges to refresh the selection visualization
  graphComponent.selection.selectedEdges.clear()
  selectAllEdges()
}

function customLabelDecorationChanged(value: boolean) {
  labelsSelected = value
  // de-select and re-select all labels to refresh the selection visualization
  graphComponent.selection.selectedLabels.clear()
  selectAllLabels()
}

function zoomModeChanged() {
  updateZoomModeDecoration()
  graphComponent.invalidate()
}

// noinspection JSIgnoredPromiseFromCall
run()
