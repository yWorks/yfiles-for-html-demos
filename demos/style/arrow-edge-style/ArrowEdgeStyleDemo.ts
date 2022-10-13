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
import type { ArrowStyleShapeStringValues } from 'yfiles'
import {
  ArrowEdgeStyle,
  ArrowStyleShape,
  Enum,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IEdge,
  IGraph,
  License
} from 'yfiles'
import {
  bindChangeListener,
  bindCommand,
  bindInputListener,
  showApp
} from '../../resources/demo-app'
import type { ColorSetName } from '../../resources/demo-styles'
import { applyDemoTheme, colorSets, initDemoStyles } from '../../resources/demo-styles'
import { SampleGraph } from './resources/SampleGraph'
import { fetchLicense } from '../../resources/fetch-license'

async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)
  const graph = graphComponent.graph

  const graphEditorInputMode = new GraphEditorInputMode({
    marqueeSelectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })
  // Creating new edges with bends is disabled in this demo since ArrowEdgeStyle always draws
  // straight-line shafts and ignores bends. Note that ArrowEdgeStyle prevents the creation of
  // bends for existing edges that use it, so we just need to disable it for edge creation.
  graphEditorInputMode.createEdgeInputMode.allowCreateBend = false
  graphComponent.inputMode = graphEditorInputMode

  // Initialize style defaults
  initDemoStyles(graph, {
    theme: { node: 'demo-palette-58' },
    extraCropLength: 0.0
  })
  graph.edgeDefaults.style = getStyleForOptionsPanel()
  graph.edgeDefaults.shareStyleInstance = false

  // Create the sample graph
  createSampleGraph(graph)

  // Initialize the toolbar and style properties user interface
  initializeUI(graphComponent)

  graphComponent.fitGraphBounds()

  showApp(graphComponent)
}

/**
 * Creates a sample graph with different style settings.
 */
function createSampleGraph(graph: IGraph): void {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleGraph.nodeList,
    id: 'id',
    layout: 'layout'
  })
  builder.createEdgesSource({
    data: SampleGraph.edgeList,
    sourceId: 'source',
    targetId: 'target',
    style: dataItem =>
      dataItem.style ? getStyleForOptionsPanel(dataItem.style) : getStyleForOptionsPanel()
  })
  builder.buildGraph()
}

/**
 * Creates an {@link ArrowEdgeStyle} for the current settings of the options panel.
 */
function getStyleForOptionsPanel(options?: {
  shape: 'arrow' | 'double-arrow' | 'notched-arrow' | 'trapezoid' | 'parallelogram'
  thickness: number
  angle: number
  shaftRatio: number
  color: ColorSetName
}): ArrowEdgeStyle {
  // Get the settings for the style from the options panel
  const color = options?.color ?? 'demo-lightblue'
  const shape =
    options?.shape ??
    (document.querySelector<HTMLSelectElement>('#basic-shape')!.value as
      | 'arrow'
      | 'double-arrow'
      | 'notched-arrow'
      | 'trapezoid'
      | 'parallelogram')
  const thickness =
    options?.thickness ??
    parseFloat(document.querySelector<HTMLInputElement>('#thickness-range')!.value)
  const angle =
    options?.angle ?? parseFloat(document.querySelector<HTMLInputElement>('#angle-range')!.value)
  const shaftRatio =
    options?.shaftRatio ??
    parseFloat(document.querySelector<HTMLInputElement>('#shaft-ratio')!.value)
  const cropping = parseFloat(document.querySelector<HTMLInputElement>('#cropping-range')!.value)

  // Create the ArrowEdgeStyle with the specified settings
  return new ArrowEdgeStyle({
    fill: colorSets[color].fill,
    stroke: colorSets[color].stroke,
    shape,
    thickness,
    angle: toRadians(angle),
    shaftRatio,
    sourceCropping: cropping,
    targetCropping: cropping
  })
}

/**
 * Binds actions to the toolbar and style property editor.
 */
function initializeUI(graphComponent: GraphComponent): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener('#basic-shape', value => {
    const shaftRatioElement = document.querySelector<HTMLInputElement>('#shaft-ratio')!
    shaftRatioElement.disabled = value === 'PARALLELOGRAM' || value === 'TRAPEZOID'

    const shape = ArrowStyleShape.from(value as ArrowStyleShapeStringValues)
    graphComponent.selection.selectedEdges
      .filter(item => item.style instanceof ArrowEdgeStyle)
      .forEach(item => ((item.style as ArrowEdgeStyle).shape = shape))
    graphComponent.invalidate()
    graphComponent.graph.edgeDefaults.style = getStyleForOptionsPanel()
  })

  bindInputListener('#thickness-range', value => {
    const thickness = parseFloat(value)
    graphComponent.selection.selectedEdges
      .filter(item => item.style instanceof ArrowEdgeStyle)
      .forEach(item => ((item.style as ArrowEdgeStyle).thickness = thickness))
    graphComponent.invalidate()
    graphComponent.graph.edgeDefaults.style = getStyleForOptionsPanel()
    document.querySelector<HTMLLabelElement>('#thickness-label')!.innerText = thickness.toFixed(0)
  })
  bindValueLabel('#thickness-label', '#thickness-range')

  bindInputListener('#angle-range', value => {
    const angle = toRadians(parseFloat(value))
    graphComponent.selection.selectedEdges
      .filter(item => item.style instanceof ArrowEdgeStyle)
      .forEach(item => ((item.style as ArrowEdgeStyle).angle = angle))
    graphComponent.invalidate()
    graphComponent.graph.edgeDefaults.style = getStyleForOptionsPanel()
    document.querySelector<HTMLLabelElement>('#angle-label')!.innerText = value
  })
  bindValueLabel('#angle-label', '#angle-range')

  bindInputListener('#shaft-ratio', value => {
    const shaftRatio = parseFloat(value)
    graphComponent.selection.selectedEdges
      .filter(item => item.style instanceof ArrowEdgeStyle)
      .forEach(item => ((item.style as ArrowEdgeStyle).shaftRatio = shaftRatio))
    graphComponent.invalidate()
    graphComponent.graph.edgeDefaults.style = getStyleForOptionsPanel()
    document.querySelector<HTMLLabelElement>('#shaft-ratio-label')!.innerText = value
  })
  bindValueLabel('#shaft-ratio-label', '#shaft-ratio')

  bindInputListener('#cropping-range', value => {
    const cropping = parseFloat(value)
    graphComponent.selection.selectedEdges
      .filter(item => item.style instanceof ArrowEdgeStyle)
      .forEach(item => {
        const style = item.style as ArrowEdgeStyle
        style.sourceCropping = cropping
        style.targetCropping = cropping
      })
    graphComponent.invalidate()
    graphComponent.graph.edgeDefaults.style = getStyleForOptionsPanel()
    document.querySelector<HTMLLabelElement>('#cropping-label')!.innerText = value
  })
  bindValueLabel('#cropping-label', '#cropping-range')

  // adjust option panel when the selection has been changed
  graphComponent.selection.addItemSelectionChangedListener((sender, evt) => {
    if (evt.item instanceof IEdge && evt.item.style instanceof ArrowEdgeStyle) {
      adjustOptionPanel(graphComponent.graph, evt.item.style)
      graphComponent.graph.edgeDefaults.style = getStyleForOptionsPanel()
    }
  })
}

/**
 * Adjusts the option panel to show the style settings of a newly selected edge.
 * @param graph The graph where the node lives.
 * @param style The style whose setting should be shown.
 */
function adjustOptionPanel(graph: IGraph, style: ArrowEdgeStyle): void {
  document.querySelector<HTMLSelectElement>('#basic-shape')!.value = Enum.getName(
    ArrowStyleShape.$class,
    style.shape
  )

  document.querySelector<HTMLInputElement>('#thickness-range')!.value = style.thickness.toFixed(0)
  document.querySelector<HTMLLabelElement>('#thickness-label')!.innerText =
    style.thickness.toFixed(0)

  const angleRangeElement = document.querySelector<HTMLInputElement>('#angle-range')!
  angleRangeElement.min =
    style.shaftRatio === 1 ||
    style.shape === ArrowStyleShape.PARALLELOGRAM ||
    style.shape === ArrowStyleShape.TRAPEZOID
      ? '-90'
      : '0'

  const angle = String(toDegrees(style.angle).toFixed(0))
  angleRangeElement.value = angle
  document.querySelector<HTMLLabelElement>('#angle-label')!.innerText = angle

  const shaftRatio = String(style.shaftRatio)
  const shaftRatioElement = document.querySelector<HTMLInputElement>('#shaft-ratio')!
  shaftRatioElement.value = shaftRatio
  shaftRatioElement.disabled =
    style.shape === ArrowStyleShape.PARALLELOGRAM || style.shape === ArrowStyleShape.TRAPEZOID

  document.querySelector<HTMLLabelElement>('#shaft-ratio-label')!.innerText = shaftRatio

  const cropping = String(style.sourceCropping)
  document.querySelector<HTMLInputElement>('#cropping-range')!.value = cropping
  document.querySelector<HTMLLabelElement>('#cropping-label')!.innerText = cropping
}

/**
 * Adds an 'input' event listener to the input element that updates the text of the label text
 * continuously during user input.
 * @param labelElementSelector Specifies the label element.
 * @param inputElementSelector Specifies the input element.
 * @param valueConverter An optional conversion of the input value into text.
 */
function bindValueLabel(
  labelElementSelector: string,
  inputElementSelector: string,
  valueConverter: ((value: any) => string) | null = null
) {
  const inputElement = document.querySelector<HTMLInputElement>(inputElementSelector)!
  const labelElement = document.querySelector<HTMLInputElement>(labelElementSelector)!
  labelElement.innerText = String(inputElement.value)
  inputElement.addEventListener('input', () => {
    labelElement.innerText =
      valueConverter != null ? valueConverter(inputElement.value) : String(inputElement.value)
  })
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
