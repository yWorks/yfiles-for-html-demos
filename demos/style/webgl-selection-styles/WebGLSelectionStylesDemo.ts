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
import type {
  StyleDecorationZoomPolicyStringValues,
  WebGL2AnimationEasingStringValues,
  WebGL2IndicatorTypeStringValues
} from 'yfiles'
import {
  Color,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  License,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  Size,
  TimeSpan,
  WebGL2AnimationDirection,
  WebGL2AnimationTiming,
  WebGL2ArcEdgeStyle,
  WebGL2ArrowType,
  WebGL2BridgeEdgeStyle,
  WebGL2DefaultLabelStyle,
  WebGL2EdgeIndicatorStyle,
  WebGL2GraphModelManager,
  WebGL2LabelIndicatorStyle,
  WebGL2LabelShape,
  WebGL2NodeIndicatorStyle,
  WebGL2PolylineEdgeStyle,
  WebGL2SelectionIndicatorManager,
  WebGL2ShapeNodeShape,
  WebGL2ShapeNodeStyle,
  WebGL2Transition
} from 'yfiles'

import {
  bindAction,
  bindChangeListener,
  bindCommand,
  checkWebGL2Support,
  showApp
} from '../../resources/demo-app'
import { fetchLicense } from '../../resources/fetch-license'

let graphComponent: GraphComponent = null!

let primaryColor = '#fc0335'
let primaryTransparency = 0
let secondaryColor = '#e3f207'
let secondaryTransparency = 0
let thickness = 3
let margins = 3
let type: WebGL2IndicatorTypeStringValues = 'solid'
let zoomPolicy: StyleDecorationZoomPolicyStringValues = 'mixed'
let easing: WebGL2AnimationEasingStringValues = 'linear'
let transition: WebGL2Transition | null = getTransition(easing)
let dashStrokeAnimation: WebGL2AnimationTiming | null = null

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  if (!checkWebGL2Support()) {
    showApp()
    return
  }

  License.value = await fetchLicense()

  graphComponent = new GraphComponent('#graphComponent')

  graphComponent.focusIndicatorManager.enabled = false
  graphComponent.inputMode = new GraphEditorInputMode()

  graphComponent.graphModelManager = new WebGL2GraphModelManager()
  graphComponent.selectionIndicatorManager = new WebGL2SelectionIndicatorManager()
  updateSelectionStyles()

  // configures default styles for newly created graph elements
  initStyleDefaults(graphComponent.graph)

  // create an initial sample graph
  createGraph(graphComponent)
  graphComponent.fitGraphBounds()
  selectNodes(graphComponent)

  // bind the buttons to their commands
  initUI()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Reconfigures the selection styles according to the settings chosen in the UI.
 */
function updateSelectionStyles() {
  const primaryColorWithTransparency = getColor(primaryColor, primaryTransparency)
  const secondaryColorWithTransparency = getColor(secondaryColor, secondaryTransparency)

  const selectionIndicatorManager =
    graphComponent.selectionIndicatorManager as WebGL2SelectionIndicatorManager
  selectionIndicatorManager.nodeStyle = new WebGL2NodeIndicatorStyle({
    type,
    primaryColor: primaryColorWithTransparency,
    secondaryColor: secondaryColorWithTransparency,
    zoomPolicy,
    enterTransition: transition,
    leaveTransition: transition,
    dashStrokeAnimation,
    margins,
    thickness,
    shape: 'node-shape'
  })

  selectionIndicatorManager.edgeStyle = new WebGL2EdgeIndicatorStyle({
    type,
    primaryColor: primaryColorWithTransparency,
    secondaryColor: secondaryColorWithTransparency,
    zoomPolicy,
    enterTransition: transition,
    leaveTransition: transition,
    dashStrokeAnimation,
    thickness
  })

  selectionIndicatorManager.nodeLabelStyle = new WebGL2LabelIndicatorStyle({
    type,
    primaryColor: primaryColorWithTransparency,
    secondaryColor: secondaryColorWithTransparency,
    zoomPolicy,
    enterTransition: transition,
    leaveTransition: transition,
    dashStrokeAnimation,
    margins,
    thickness,
    shape: 'label-shape'
  })

  selectionIndicatorManager.edgeLabelStyle = new WebGL2LabelIndicatorStyle({
    type,
    primaryColor: primaryColorWithTransparency,
    secondaryColor: secondaryColorWithTransparency,
    margins,
    zoomPolicy,
    enterTransition: transition,
    leaveTransition: transition,
    dashStrokeAnimation,
    thickness: thickness,
    shape: 'label-shape'
  })

  reselectSelected(graphComponent)
}

/**
 * "Re"-selects all already selected graph element to apply newly configured selection styles
 */
function reselectSelected(graphComponent: GraphComponent) {
  const selectedItems = graphComponent.selection.toArray()
  for (const item of selectedItems) {
    graphComponent.selection.setSelected(item, false)
    graphComponent.selection.setSelected(item, true)
  }
}

function selectNodes(graphComponent: GraphComponent) {
  graphComponent.graph.nodes.forEach(item => graphComponent.selection.setSelected(item, true))
}

function selectEdges(graphComponent: GraphComponent) {
  graphComponent.graph.edges.forEach(item => graphComponent.selection.setSelected(item, true))
}

function selectLabels(graphComponent: GraphComponent) {
  graphComponent.graph.labels.forEach(item => graphComponent.selection.setSelected(item, true))
}

/**
 * Initializes the defaults for the styling in this demo.
 */
function initStyleDefaults(graph: IGraph): void {
  graph.nodeDefaults.size = new Size(100, 100)
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: 'lightgray',
    stroke: 'transparent'
  })
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({ insets: 10 })

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px gray',
    targetArrow: 'triangle'
  })
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({ insets: 10 })
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 0,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.ON_EDGE })
}

/**
 * Creates an initial sample graph.
 */
function createGraph(graphComponent: GraphComponent) {
  const graph = graphComponent.graph
  const gmm = graphComponent.graphModelManager as WebGL2GraphModelManager

  const polylineEdgeStyle = new WebGL2PolylineEdgeStyle({
    stroke: '2px gray',
    targetArrow: WebGL2ArrowType.TRIANGLE_LARGE
  })

  const n1 = graph.createNode([0, 0, 100, 100])
  gmm.setStyle(
    n1,
    new WebGL2ShapeNodeStyle({
      shape: WebGL2ShapeNodeShape.ROUND_RECTANGLE,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )

  const nl1 = graph.addLabel(
    n1,
    'node 1',
    new ExteriorLabelModel({ insets: 20 }).createParameter(ExteriorLabelModelPosition.SOUTH)
  )
  gmm.setStyle(
    nl1,
    new WebGL2DefaultLabelStyle({
      shape: WebGL2LabelShape.ROUND_RECTANGLE,
      backgroundColor: 'lightgray',
      insets: 10
    })
  )

  const n2 = graph.createNode([300, 0, 100, 100])
  gmm.setStyle(
    n2,
    new WebGL2ShapeNodeStyle({
      shape: WebGL2ShapeNodeShape.TRIANGLE,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )

  const e1 = graph.createEdge(n1, n2)
  gmm.setStyle(
    e1,
    new WebGL2ArcEdgeStyle({
      height: 60,
      stroke: '2px gray',
      targetArrow: WebGL2ArrowType.TRIANGLE_LARGE
    })
  )

  const n3 = graph.createNode([475, 300, 150, 100])
  gmm.setStyle(
    n3,
    new WebGL2ShapeNodeStyle({
      shape: WebGL2ShapeNodeShape.PILL,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )

  const nl2 = graph.addLabel(
    n3,
    'node 3',
    new ExteriorLabelModel({ insets: 20 }).createParameter(ExteriorLabelModelPosition.WEST)
  )
  gmm.setStyle(
    nl2,
    new WebGL2DefaultLabelStyle({
      shape: WebGL2LabelShape.PILL,
      backgroundColor: 'lightgray',
      insets: 10
    })
  )

  const e2 = graph.createEdge(n2, n3)
  gmm.setStyle(e2, polylineEdgeStyle)

  const el1 = graph.addLabel(e2, 'edge 2')
  gmm.setStyle(
    el1,
    new WebGL2DefaultLabelStyle({
      shape: WebGL2LabelShape.ROUND_RECTANGLE,
      backgroundColor: 'lightgray',
      insets: 10
    })
  )

  const n4 = graph.createNode([275, 600, 150, 100])
  gmm.setStyle(
    n4,
    new WebGL2ShapeNodeStyle({
      shape: WebGL2ShapeNodeShape.ELLIPSE,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )

  const e3 = graph.createEdge(n3, n4)
  gmm.setStyle(e3, polylineEdgeStyle)

  const el2 = graph.addLabel(e3, 'edge 3')
  gmm.setStyle(
    el2,
    new WebGL2DefaultLabelStyle({
      shape: WebGL2LabelShape.PILL,
      backgroundColor: 'lightgray',
      insets: 10
    })
  )

  const n5 = graph.createNode([0, 600, 100, 100])
  gmm.setStyle(
    n5,
    new WebGL2ShapeNodeStyle({
      shape: WebGL2ShapeNodeShape.OCTAGON,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )

  const e4 = graph.createEdge(n4, n5)
  gmm.setStyle(
    e4,
    new WebGL2BridgeEdgeStyle({
      height: -80,
      fanLength: 100,
      stroke: '2px gray',
      targetArrow: WebGL2ArrowType.TRIANGLE_LARGE
    })
  )

  const n6 = graph.createNode([-150, 300, 100, 100])
  gmm.setStyle(
    n6,
    new WebGL2ShapeNodeStyle({
      shape: WebGL2ShapeNodeShape.RECTANGLE,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )

  const e5 = graph.createEdge(n5, n6)
  gmm.setStyle(e5, polylineEdgeStyle)

  const el3 = graph.addLabel(e5, 'edge 5')
  gmm.setStyle(
    el3,
    new WebGL2DefaultLabelStyle({
      shape: WebGL2LabelShape.RECTANGLE,
      backgroundColor: 'lightgray',
      insets: 10
    })
  )

  const n7 = graph.createNode([150, 300, 100, 100])
  gmm.setStyle(
    n7,
    new WebGL2ShapeNodeStyle({
      shape: WebGL2ShapeNodeShape.HEXAGON,
      stroke: 'transparent',
      fill: 'lightgray'
    })
  )

  const nl3 = graph.addLabel(
    n7,
    'node 7',
    new ExteriorLabelModel({ insets: 20 }).createParameter(ExteriorLabelModelPosition.SOUTH)
  )
  gmm.setStyle(
    nl3,
    new WebGL2DefaultLabelStyle({
      shape: WebGL2LabelShape.RECTANGLE,
      backgroundColor: 'lightgray',
      insets: 10
    })
  )

  const e6 = graph.createEdge(n6, n7)
  graph.addBend(e6, [25, 300])
  graph.addBend(e6, [75, 400])
  gmm.setStyle(e6, polylineEdgeStyle)
}

/**
 * Creates a Color from a css color string and a provided transparency
 */
function getColor(color: string, transparency: number): Color {
  const r = parseInt(color.substr(1, 2), 16)
  const g = parseInt(color.substr(3, 2), 16)
  const b = parseInt(color.substr(5, 2), 16)
  return Color.fromRGBA(r, g, b, 1 - transparency)
}

/**
 * Creates a WebGL2Transition with the given easing and default values.
 */
function getTransition(easing: WebGL2AnimationEasingStringValues) {
  return new WebGL2Transition({
    properties: 'opacity',
    easing,
    duration: '0.5s'
  })
}

/**
 * Binds the various interaction elements (buttons, sliders) to functions and commands.
 */
function initUI(): void {
  bindAction("button[data-command='Reset']", (): void => {
    graphComponent.graph.clear()
    createGraph(graphComponent)
    selectNodes(graphComponent)
  })
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='SelectNodes']", () => {
    selectNodes(graphComponent)
  })
  bindAction("button[data-command='SelectEdges']", () => {
    selectEdges(graphComponent)
  })
  bindAction("button[data-command='SelectLabels']", () => {
    selectLabels(graphComponent)
  })
  bindAction("button[data-command='ClearSelection']", () => {
    graphComponent.selection.clear()
  })

  bindChangeListener("select[data-command='ChangeSelectionStyle']", value => {
    type = value as WebGL2IndicatorTypeStringValues
    const selectedIndex = (
      document.querySelector("select[data-command='ChangeSelectionStyle']") as HTMLSelectElement
    ).selectedIndex
    ;(document.getElementById('change--dash-animated') as HTMLInputElement).disabled =
      selectedIndex < 9
    updateSelectionStyles()
  })

  bindChangeListener("input[data-command='ChangePrimaryColor']", value => {
    primaryColor = value as string
    updateSelectionStyles()
  })

  bindChangeListener("input[data-command='ChangePrimaryColorTransparency']", value => {
    primaryTransparency = parseFloat(value as string) / 100
    updateSelectionStyles()
  })

  bindChangeListener("input[data-command='ChangeSecondaryColor']", value => {
    secondaryColor = value as string
    updateSelectionStyles()
  })

  bindChangeListener("input[data-command='ChangeSecondaryColorTransparency']", value => {
    secondaryTransparency = parseFloat(value as string) / 100
    updateSelectionStyles()
  })

  bindChangeListener("input[data-command='ChangeAnimated']", value => {
    transition = value ? getTransition(easing) : null
    updateSelectionStyles()
  })

  bindChangeListener("input[data-command='ChangeDashedAnimated']", value => {
    dashStrokeAnimation = value
      ? new WebGL2AnimationTiming(
          TimeSpan.fromSeconds(1),
          easing,
          255,
          WebGL2AnimationDirection.NORMAL
        )
      : null

    updateSelectionStyles()
  })

  bindChangeListener("select[data-command='ChangeEasing']", value => {
    easing = value as WebGL2AnimationEasingStringValues

    // also update transition and dash animation, if activated
    transition = transition ? getTransition(easing) : null

    dashStrokeAnimation = dashStrokeAnimation
      ? new WebGL2AnimationTiming(
          TimeSpan.fromSeconds(1),
          easing,
          255,
          WebGL2AnimationDirection.NORMAL
        )
      : null

    updateSelectionStyles()
  })

  bindChangeListener("select[data-command='ChangeZoomPolicy']", value => {
    zoomPolicy = value as StyleDecorationZoomPolicyStringValues
    updateSelectionStyles()
  })

  bindChangeListener("input[data-command='ChangeThickness']", value => {
    thickness = parseFloat(value as string)
    updateSelectionStyles()
  })

  bindChangeListener("input[data-command='ChangeMargins']", value => {
    margins = parseFloat(value as string)
    updateSelectionStyles()
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
