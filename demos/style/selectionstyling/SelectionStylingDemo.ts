/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  EdgeStyleIndicatorRenderer,
  ExteriorNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  LabelStyle,
  LabelStyleIndicatorRenderer,
  License,
  NodeStyleIndicatorRenderer,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  Size,
  StyleIndicatorZoomPolicy
} from '@yfiles/yfiles'

import { createDemoEdgeStyle, createDemoNodeStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'

let graphComponent: GraphComponent

let selectionNodeStyle: NodeStyleIndicatorRenderer

let useCustomNodeSelectionIndicator = true

let selectionEdgeStyle: EdgeStyleIndicatorRenderer

let useCustomEdgeSelectionIndicator = true

let selectionLabelStyle: LabelStyleIndicatorRenderer

let useCustomLabelSelectionIndicator = true

let zoomModeComboBox: HTMLSelectElement

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = licenseData
  // initialize UI elements
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
 * Initializes the UI elements.
 */
function init(): void {
  graphComponent = new GraphComponent('graphComponent')
  zoomModeComboBox = document.querySelector<HTMLSelectElement>('#zoom-mode')!

  // initialize the helper UI
  const items = ['Mixed', 'Zoom with Graph', 'Always the Same Size', 'No Downscaling']

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
function initializeGraph(): void {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = createDemoNodeStyle()
  graph.nodeDefaults.size = new Size(50, 30)

  // defaults for labels
  const simpleLabelStyle = new LabelStyle({
    backgroundFill: '#FFC398',
    textFill: '#662b00',
    padding: [3, 5, 3, 5]
  })

  // nodes...
  graph.nodeDefaults.labels.style = simpleLabelStyle
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 15
  }).createParameter('top')

  graph.edgeDefaults.style = createDemoEdgeStyle()
  graph.edgeDefaults.labels.style = simpleLabelStyle

  // labels
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel().createRatioParameter()

  // create a simple sample graph
  const n1 = graph.createNode({ layout: new Rect(0, 0, 50, 30), labels: ['Node 1'] })
  const n2 = graph.createNode({ layout: new Rect(250, 20, 50, 30), labels: ['Node 2'] })

  graph.createEdge({ source: n1, target: n2, bends: [new Point(100, 35)], labels: ['Edge Label'] })

  // center the graph on the screen
  void graphComponent.fitGraphBounds()

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
  selectionNodeStyle = new NodeStyleIndicatorRenderer({
    // we choose a shape node style
    nodeStyle: new ShapeNodeStyle({
      shape: 'round-rectangle',
      stroke: '#01BAFF',
      fill: 'transparent'
    }),
    // with a margin for the decoration
    margins: 8
  })

  // for edges...
  // just a thick polyline edge style
  selectionEdgeStyle = new EdgeStyleIndicatorRenderer({
    edgeStyle: new PolylineEdgeStyle({ stroke: '3px #01BAFF' })
  })

  // ... and for labels
  selectionLabelStyle = new LabelStyleIndicatorRenderer({
    // we use a node style with a rounded rectangle adapted as a label style, and we declare a margin for the
    // decoration
    labelStyle: new LabelStyle({
      shape: 'rectangle',
      backgroundStroke: '#01BAFF',
      textFill: 'transparent'
    }),
    margins: 5
  })

  graphComponent.graph.decorator.nodes.selectionRenderer.addWrapperFactory((_, original) =>
    useCustomNodeSelectionIndicator ? selectionNodeStyle : original
  )
  graphComponent.graph.decorator.edges.selectionRenderer.addWrapperFactory((_, original) =>
    useCustomEdgeSelectionIndicator ? selectionEdgeStyle : original
  )
  graphComponent.graph.decorator.labels.selectionRenderer.addWrapperFactory((_, original) =>
    useCustomLabelSelectionIndicator ? selectionLabelStyle : original
  )

  // hide focus indication
  graphComponent.graph.decorator.nodes.focusRenderer.hide()
}

/**
 * Sets, removes and updates the custom selection decoration for nodes,
 * edges, and labels according to the current settings.
 */
function updateZoomModeDecoration(): void {
  const zoomModes = [
    StyleIndicatorZoomPolicy.MIXED,
    StyleIndicatorZoomPolicy.WORLD_COORDINATES,
    StyleIndicatorZoomPolicy.VIEW_COORDINATES,
    StyleIndicatorZoomPolicy.NO_DOWNSCALING
  ]
  const selectedZoomMode = zoomModes[zoomModeComboBox.selectedIndex]

  selectionNodeStyle.zoomPolicy = selectedZoomMode
  selectionEdgeStyle.zoomPolicy = selectedZoomMode
  selectionLabelStyle.zoomPolicy = selectedZoomMode
}

function selectAllNodes(): void {
  const nodeSelection = graphComponent.selection.nodes
  nodeSelection.clear()
  graphComponent.graph.nodes.forEach((node) => {
    nodeSelection.add(node)
  })
}

function selectAllEdges(): void {
  const edgeSelection = graphComponent.selection.edges
  edgeSelection.clear()
  graphComponent.graph.edges.forEach((edge) => {
    edgeSelection.add(edge)
  })
}

function selectAllLabels(): void {
  const labelSelection = graphComponent.selection.labels
  labelSelection.clear()
  graphComponent.graph.labels.forEach((label) => {
    labelSelection.add(label)
  })
}

/**
 * Wires up the UI.
 */
function initializeUI(): void {
  document
    .querySelector<HTMLInputElement>('#node-button')!
    .addEventListener('change', (evt) =>
      customNodeDecorationChanged((evt.target as HTMLInputElement).checked)
    )
  document
    .querySelector<HTMLInputElement>('#edge-button')!
    .addEventListener('change', (evt) =>
      customEdgeDecorationChanged((evt.target as HTMLInputElement).checked)
    )
  document
    .querySelector<HTMLInputElement>('#label-button')!
    .addEventListener('change', (evt) =>
      customLabelDecorationChanged((evt.target as HTMLInputElement).checked)
    )

  document
    .querySelector<HTMLSelectElement>('#zoom-mode')!
    .addEventListener('change', zoomModeChanged)
}

function customNodeDecorationChanged(value: boolean) {
  useCustomNodeSelectionIndicator = value

  // de-select and re-select all nodes to refresh the selection visualization
  selectAllNodes()
}

function customEdgeDecorationChanged(value: boolean) {
  useCustomEdgeSelectionIndicator = value

  // de-select and re-select all edges to refresh the selection visualization
  selectAllEdges()
}

function customLabelDecorationChanged(value: boolean) {
  useCustomLabelSelectionIndicator = value

  // deselect and re-select all labels to refresh the selection visualization
  selectAllLabels()
}

function zoomModeChanged() {
  updateZoomModeDecoration()
  graphComponent.invalidate()
}

run().then(finishLoading)
