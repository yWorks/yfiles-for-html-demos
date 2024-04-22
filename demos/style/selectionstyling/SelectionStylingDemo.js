/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphFocusIndicatorManager,
  GraphItemTypes,
  GraphSelectionIndicatorManager,
  IndicatorEdgeStyleDecorator,
  IndicatorLabelStyleDecorator,
  IndicatorNodeStyleDecorator,
  License,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  Size,
  StyleDecorationZoomPolicy,
  VoidNodeStyle
} from 'yfiles'

import {
  applyDemoTheme,
  createDemoEdgeStyle,
  createDemoNodeStyle
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

/** @type {GraphComponent} */
let graphComponent

/** @type {IndicatorNodeStyleDecorator} */
let selectionNodeStyle

/** @type {IndicatorEdgeStyleDecorator} */
let selectionEdgeStyle

/** @type {IndicatorLabelStyleDecorator} */
let selectionLabelStyle

/** @type {HTMLSelectElement} */
let zoomModeComboBox

/** @type {boolean} */
let nodesSelected = true

/** @type {boolean} */
let edgesSelected = true

/** @type {boolean} */
let labelsSelected = true

/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  // initialize UI's elements
  init()

  // initialize the style decoration
  initializeDecoration()

  // initialize default graph styles, the graph and input modes
  initializeGraph()

  // initializes the zoom mode decoration
  updateZoomModeDecoration()

  initializeUI()
}

/**
 * Initializes the UI's elements.
 */
function init() {
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  zoomModeComboBox = document.querySelector('#zoom-mode')

  // initialize the helper UI
  const items = ['Mixed', 'Zoom with Graph', 'Always the same size']

  items.forEach((name) => {
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
function initializeDecoration() {
  // for nodes...
  selectionNodeStyle = new IndicatorNodeStyleDecorator({
    // we choose a shape node style
    wrapped: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: '#01BAFF',
      fill: 'transparent'
    }),
    // with a margin for the decoration
    padding: 8
  })

  // for edges..
  // just a thick polyline edge style
  selectionEdgeStyle = new IndicatorEdgeStyleDecorator({
    wrapped: new PolylineEdgeStyle({
      stroke: '3px #01BAFF'
    })
  })

  // ... and for labels
  selectionLabelStyle = new IndicatorLabelStyleDecorator({
    // we use a node style with a rounded rectangle adapted as a label style, and we declare a margin for the
    // decoration
    wrapped: new DefaultLabelStyle({
      shape: 'rectangle',
      backgroundStroke: '#01BAFF',
      textFill: 'transparent'
    }),
    padding: 5
  })

  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: selectionNodeStyle,
    edgeStyle: selectionEdgeStyle,
    labelStyle: selectionLabelStyle
  })

  // hide focus indication
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })
}

/**
 * Sets, removes and updates the custom selection decoration for nodes,
 * edges, and labels according to the current settings.
 */
function updateZoomModeDecoration() {
  const zoomModes = [
    StyleDecorationZoomPolicy.MIXED,
    StyleDecorationZoomPolicy.WORLD_COORDINATES,
    StyleDecorationZoomPolicy.VIEW_COORDINATES
  ]
  const selectedZoomMode = zoomModes[zoomModeComboBox.selectedIndex]

  selectionNodeStyle.zoomPolicy = selectedZoomMode
  selectionEdgeStyle.zoomPolicy = selectedZoomMode
  selectionLabelStyle.zoomPolicy = selectedZoomMode
}

function selectAllNodes() {
  const nodeSelection = graphComponent.selection.selectedNodes
  graphComponent.graph.nodes.forEach((node) => {
    nodeSelection.setSelected(node, true)
  })
}

function selectAllEdges() {
  const edgeSelection = graphComponent.selection.selectedEdges
  graphComponent.graph.edges.forEach((edge) => {
    edgeSelection.setSelected(edge, true)
  })
}

function selectAllLabels() {
  const labelSelection = graphComponent.selection.selectedLabels
  graphComponent.graph.labels.forEach((label) => {
    labelSelection.setSelected(label, true)
  })
}

/**
 * Wires up the UI.
 */
function initializeUI() {
  document
    .querySelector('#node-button')
    .addEventListener('change', (evt) => customNodeDecorationChanged(evt.target.checked))
  document
    .querySelector('#edge-button')
    .addEventListener('change', (evt) => customEdgeDecorationChanged(evt.target.checked))
  document
    .querySelector('#label-button')
    .addEventListener('change', (evt) => customLabelDecorationChanged(evt.target.checked))

  document.querySelector('#zoom-mode').addEventListener('change', zoomModeChanged)
}

/**
 * @param {boolean} value
 */
function customNodeDecorationChanged(value) {
  nodesSelected = value
  const selectionIndicatorManager = graphComponent.selectionIndicatorManager
  selectionIndicatorManager.nodeStyle = value ? selectionNodeStyle : null
  // de-select and re-select all nodes to refresh the selection visualization
  graphComponent.selection.selectedNodes.clear()
  selectAllNodes()
}

/**
 * @param {boolean} value
 */
function customEdgeDecorationChanged(value) {
  edgesSelected = value
  const selectionIndicatorManager = graphComponent.selectionIndicatorManager
  selectionIndicatorManager.edgeStyle = value ? selectionEdgeStyle : null
  // de-select and re-select all edges to refresh the selection visualization
  graphComponent.selection.selectedEdges.clear()
  selectAllEdges()
}

/**
 * @param {boolean} value
 */
function customLabelDecorationChanged(value) {
  labelsSelected = value
  const selectionIndicatorManager = graphComponent.selectionIndicatorManager
  selectionIndicatorManager.labelStyle = value ? selectionLabelStyle : null
  // de-select and re-select all labels to refresh the selection visualization
  graphComponent.selection.selectedLabels.clear()
  selectAllLabels()
}

function zoomModeChanged() {
  updateZoomModeDecoration()
  graphComponent.invalidate()
}

run().then(finishLoading)
