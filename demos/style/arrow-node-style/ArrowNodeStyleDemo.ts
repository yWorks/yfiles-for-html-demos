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
  ArrowNodeDirection,
  ArrowNodeStyle,
  ArrowStyleShape,
  DefaultLabelStyle,
  Enum,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  FreeNodeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HorizontalTextAlignment,
  ICommand,
  IGraph,
  INode,
  Insets,
  License,
  Point,
  Rect,
  Size
} from 'yfiles'
import { bindCommand, bindInputListener, showApp } from '../../resources/demo-app'
import { applyDemoTheme, colorSets, createDemoNodeLabelStyle } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'

const basicShape = document.querySelector<HTMLSelectElement>('#basic-shape')!
const shapeDirection = document.querySelector<HTMLSelectElement>('#shape-direction')!
const angleRange = document.querySelector<HTMLInputElement>('#angle-range')!
const angleLabel = document.querySelector<HTMLLabelElement>('#angle-label')!
const shaftRatioRange = document.querySelector<HTMLInputElement>('#shaft-ratio')!
const shaftRatioLabel = document.querySelector<HTMLLabelElement>('#shaft-ratio-label')!

async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  initializeGraph(graphComponent.graph)

  initializeInteraction(graphComponent)

  initializeUI(graphComponent)

  graphComponent.fitGraphBounds()

  showApp(graphComponent)
}

/**
 * Initializes defaults for the given graph and creates a small sample with different node style
 * settings.
 * @param graph The graph to set the defaults and in which to create the sample.
 */
function initializeGraph(graph: IGraph): void {
  // initialize the graph defaults
  const defaultLabelParameter = new FreeNodeLabelModel().createParameter({
    layoutRatio: new Point(0.5, 0),
    layoutOffset: new Point(0, -10),
    labelRatio: new Point(0.5, 1),
    labelOffset: new Point(0, 0)
  })

  const colorSet = colorSets['demo-orange']
  graph.nodeDefaults.style = new ArrowNodeStyle({ fill: colorSet.fill, stroke: colorSet.stroke })
  graph.nodeDefaults.size = new Size(200, 100)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.style = createLabelStyle('demo-orange')
  graph.nodeDefaults.labels.layoutParameter = defaultLabelParameter

  // create nodes with different shapes, angles and shaft ratios
  createNodes(graph, 0, ArrowStyleShape.ARROW, 'demo-orange')
  createNodes(graph, 300, ArrowStyleShape.DOUBLE_ARROW, 'demo-blue')
  createNodes(graph, 600, ArrowStyleShape.NOTCHED_ARROW, 'demo-red')
  createNodes(graph, 900, ArrowStyleShape.PARALLELOGRAM, 'demo-green')
  createNodes(graph, 1200, ArrowStyleShape.TRAPEZOID, 'demo-purple')
}

/**
 * Creates a new node label style with colors from the given color set.
 * @param colorSetName The name of the color set to use for background and text color.
 */
function createLabelStyle(
  colorSetName: 'demo-orange' | 'demo-blue' | 'demo-red' | 'demo-green' | 'demo-purple'
): DefaultLabelStyle {
  const style = createDemoNodeLabelStyle(colorSetName)
  style.horizontalTextAlignment = HorizontalTextAlignment.LEFT
  style.insets = new Insets(8, 4, 8, 4)
  style.textSize = 14
  // style.backgroundFill = null
  return style
}
/**
 * Creates several nodes with the given shape and different angles as well as shaft ratios.
 * @param graph The graph in which to create nodes.
 * @param xOffset The x-location where to place the nodes.
 * @param shape The shape to use for the arrow.
 * @param colorSetName The name of the color set to use for nodes and labels.
 */
function createNodes(
  graph: IGraph,
  xOffset: number,
  shape: ArrowStyleShape,
  colorSetName: 'demo-orange' | 'demo-blue' | 'demo-red' | 'demo-green' | 'demo-purple'
): void {
  const angleFactor =
    shape === ArrowStyleShape.PARALLELOGRAM || shape === ArrowStyleShape.TRAPEZOID ? 0.5 : 1

  const colorSet = colorSets[colorSetName]

  // create a couple of ArrowNodeStyle instances that demonstrate various configuration options
  const styles: ArrowNodeStyle[] = []

  // small angle and shaft ratio pointing left
  styles.push(
    new ArrowNodeStyle({
      shape,
      direction: ArrowNodeDirection.LEFT,
      angle: (angleFactor * Math.PI) / 8,
      shaftRatio: 0.25,
      fill: colorSet.fill,
      stroke: colorSet.stroke
    })
  )

  // default angle and shaft ratio pointing up
  styles.push(
    new ArrowNodeStyle({
      shape,
      direction: ArrowNodeDirection.UP,
      angle: (angleFactor * Math.PI) / 4,
      shaftRatio: 1.0 / 3,
      fill: colorSet.fill,
      stroke: colorSet.stroke
    })
  )

  // bigger angle and shaft ratio pointing right
  styles.push(
    new ArrowNodeStyle({
      shape,
      direction: ArrowNodeDirection.RIGHT,
      angle: (angleFactor * Math.PI * 3) / 8,
      shaftRatio: 0.75,
      fill: colorSet.fill,
      stroke: colorSet.stroke
    })
  )

  // negative angle and max shaft ratio pointing right
  styles.push(
    new ArrowNodeStyle({
      shape,
      direction: ArrowNodeDirection.RIGHT,
      angle: (angleFactor * -Math.PI) / 8,
      shaftRatio: 1,
      fill: colorSet.fill,
      stroke: colorSet.stroke
    })
  )

  // create a sample node for each sample style instance
  let y = 0
  for (let i = 0; i < styles.length; ++i) {
    const x = xOffset + (i == 1 ? 50 : 0)
    const width = i == 1 ? 100 : 200
    const height = i == 1 ? 200 : 100
    const style = styles[i]
    graph.addLabel(
      graph.createNode(new Rect(x, y, width, height), style),
      styleToText(style),
      new ExteriorLabelModel({ insets: 30 }).createParameter(ExteriorLabelModelPosition.SOUTH),
      createLabelStyle(colorSetName)
    )

    y += height + 250
  }
}

/**
 * Sets up an input mode for the GraphComponent.
 */
function initializeInteraction(graphComponent: GraphComponent): void {
  const inputMode = new GraphEditorInputMode({ selectableItems: GraphItemTypes.NODE })

  // add a label to newly created node that shows the current style settings
  inputMode.addNodeCreatedListener((sender, evt) => {
    const node = evt.item
    graphComponent.graph.addLabel(node, styleToText(node.style as ArrowNodeStyle))
  })

  graphComponent.inputMode = inputMode
}

/**
 * Binds actions to the toolbar and style property editor.
 */
function initializeUI(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  basicShape.addEventListener('change', () => {
    const shape = Enum.parse(ArrowStyleShape.$class, basicShape.value, true)
    applyStyleSetting(graphComponent, style => (style.shape = shape))
  })

  shapeDirection.addEventListener('change', () => {
    const direction = Enum.parse(ArrowNodeDirection.$class, shapeDirection.value, true)
    applyStyleSetting(graphComponent, style => (style.direction = direction))
  })

  bindInputListener(angleRange, value => {
    const angle = parseFloat(value)
    applyStyleSetting(graphComponent, style => (style.angle = toRadians(angle)))
    angleLabel.innerText = value
  })

  bindInputListener(shaftRatioRange, value => {
    const shaftRatio = parseFloat(shaftRatioRange.value)
    applyStyleSetting(graphComponent, style => (style.shaftRatio = shaftRatio))
    shaftRatioLabel.innerText = value
  })

  // adjust option panel when the selection has been changed
  graphComponent.selection.addItemSelectionChangedListener((sender, evt) =>
    adjustOptionPanel(graphComponent.graph, evt.item as INode)
  )
}

/**
 * Applies changes in the option panel to the selected nodes and the default style.
 * @param graphComponent The component that displays the graph.
 * @param adjustStyle A callback that gets each style to change.
 */
function applyStyleSetting(
  graphComponent: GraphComponent,
  adjustStyle: (style: ArrowNodeStyle) => void
): void {
  const graph = graphComponent.graph

  graphComponent.selection.selectedNodes.forEach(node => {
    const style = node.style
    if (style instanceof ArrowNodeStyle) {
      adjustStyle(style)
      if (node.labels.size === 0) {
        graph.addLabel(node, styleToText(style))
      } else {
        graph.setLabelText(node.labels.first(), styleToText(style))
      }
    }
  })

  // adjust also the default style applied to newly created nodes
  adjustStyle(graph.nodeDefaults.style as ArrowNodeStyle)

  graphComponent.invalidate()
}

/**
 * Returns a text description of the style configuration.
 */
function styleToText(style: ArrowNodeStyle): string {
  const { shape, direction, angle, shaftRatio } = getStyleValues(style)

  const shapeName = basicShape.querySelector<HTMLOptionElement>(`option[value=${shape}]`)!.text
  const directionName = shapeDirection.querySelector<HTMLOptionElement>(
    `option[value=${direction}]`
  )!.text

  return (
    `Shape: ${shapeName}\n` +
    `Direction: ${directionName}\n` +
    `Angle: ${angle}\n` +
    `Shaft Ratio: ${shaftRatio}`
  )
}

/**
 * Adjusts the option panel to show the style settings of a newly selected node.
 * @param graph The graph where the node lives.
 * @param node The node whose style setting should be shown.
 */
function adjustOptionPanel(graph: IGraph, node: INode): void {
  const style = node.style
  if (style instanceof ArrowNodeStyle) {
    const { shape, direction, angle, shaftRatio } = getStyleValues(style)

    basicShape.value = shape
    shapeDirection.value = direction
    angleRange.value = angle
    angleLabel.innerText = angle
    shaftRatioRange.value = shaftRatio
    shaftRatioLabel.innerText = shaftRatio

    // update defaultArrowNodeStyle to correspond to the option panel
    const defaultArrowNodeStyle = graph.nodeDefaults.style as ArrowNodeStyle
    defaultArrowNodeStyle.shape = style.shape
    defaultArrowNodeStyle.direction = style.direction
    defaultArrowNodeStyle.angle = style.angle
    defaultArrowNodeStyle.shaftRatio = style.shaftRatio
    graph.nodeDefaults.size = node.layout.toSize()
  }
}

/**
 * Returns the style values.
 */
function getStyleValues(style: ArrowNodeStyle): {
  shape: string
  direction: string
  angle: string
  shaftRatio: string
} {
  return {
    shape: Enum.getName(ArrowStyleShape.$class, style.shape),
    direction: Enum.getName(ArrowNodeDirection.$class, style.direction),
    angle: String(toDegrees(style.angle).toFixed(0)),
    shaftRatio: String(style.shaftRatio.toFixed(1))
  }
}

/**
 * Returns the given angle in degrees.
 */
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Returns the given angle in radians.
 */
function toRadians(degrees: number): number {
  return (degrees / 180) * Math.PI
}

// noinspection JSIgnoredPromiseFromCall
run()
