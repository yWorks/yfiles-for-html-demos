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
} from '../../resources/demo-app.js'
import { applyDemoTheme, colorSets, initDemoStyles } from '../../resources/demo-styles.js'
import { SampleGraph } from './resources/SampleGraph.js'
import { fetchLicense } from '../../resources/fetch-license.js'

const basicShape = document.querySelector('#basic-shape')
const thicknessRange = document.querySelector('#thickness-range')
const thicknessRangeLabel = document.querySelector('#thickness-label')
const angleRange = document.querySelector('#angle-range')
const angleLabel = document.querySelector('#angle-label')
const shaftRatioRange = document.querySelector('#shaft-ratio')
const shaftRatioLabel = document.querySelector('#shaft-ratio-label')
const croppingRange = document.querySelector('#cropping-range')
const croppingLabel = document.querySelector('#cropping-label')
const propertiesPanel = document.querySelector('.demo-properties')
const infoMessage = document.querySelector('.info-message')

/**
 * @returns {!Promise}
 */
async function run() {
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
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
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
 * @param {!object} [options]
 * @returns {!ArrowEdgeStyle}
 */
function getStyleForOptionsPanel(options) {
  // Get the settings for the style from the options panel
  const color = options?.color ?? 'demo-lightblue'
  const shape = options?.shape ?? basicShape.value
  const thickness = options?.thickness ?? parseFloat(thicknessRange.value)
  const angle = options?.angle ?? parseFloat(angleRange.value)
  const shaftRatio = options?.shaftRatio ?? parseFloat(shaftRatioRange.value)
  const cropping = parseFloat(croppingRange.value)

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
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener('#basic-shape', value => {
    const shape = ArrowStyleShape.from(value)
    applyStyleSetting(graphComponent, style => (style.shape = shape))
    shaftRatioRange.disabled = value === 'PARALLELOGRAM' || value === 'TRAPEZOID'
  })

  bindInputListener('#thickness-range', value => {
    const thickness = parseFloat(value)
    applyStyleSetting(graphComponent, style => (style.thickness = thickness))
    thicknessRangeLabel.innerText = thickness.toFixed(0)
  })

  bindInputListener(angleRange, value => {
    const angle = toRadians(parseFloat(value))
    applyStyleSetting(graphComponent, style => (style.angle = angle))
    angleLabel.innerText = value
  })

  bindInputListener('#shaft-ratio', value => {
    const shaftRatio = parseFloat(value)
    applyStyleSetting(graphComponent, style => (style.shaftRatio = shaftRatio))
    shaftRatioLabel.innerText = value
  })

  bindInputListener('#cropping-range', value => {
    const cropping = parseFloat(value)
    applyStyleSetting(graphComponent, style => (style.sourceCropping = cropping))
    applyStyleSetting(graphComponent, style => (style.targetCropping = cropping))
    croppingLabel.innerText = value
  })

  // adjust option panel when the selection has been changed
  graphComponent.selection.addItemSelectionChangedListener((sender, evt) => {
    if (evt.item instanceof IEdge && evt.item.style instanceof ArrowEdgeStyle) {
      adjustOptionPanel(graphComponent, evt.item)
      graphComponent.graph.edgeDefaults.style = getStyleForOptionsPanel()
    }
  })
}

/**
 * Applies changes in the option panel to the selected edges and the default style.
 * @param {!GraphComponent} graphComponent The component that displays the graph.
 * @param {!function} adjustStyle A callback that gets each style to change.
 */
function applyStyleSetting(graphComponent, adjustStyle) {
  const graph = graphComponent.graph

  graphComponent.selection.selectedEdges.forEach(edge => {
    const style = edge.style
    if (style instanceof ArrowEdgeStyle) {
      adjustStyle(style)
    }
  })

  // adjust also the default style applied to newly created nodes
  adjustStyle(graph.edgeDefaults.style)
  graphComponent.invalidate()
}

/**
 * Adjusts the option panel to show the style settings of a newly selected edge.
 * @param {!GraphComponent} graphComponent The graphComponent where the node lives.
 * @param {!IEdge} edge The edge whose setting should be shown.
 */
function adjustOptionPanel(graphComponent, edge) {
  const style = edge.style
  const shape = Enum.getName(ArrowStyleShape.$class, style.shape)
  const thickness = style.thickness.toFixed(0)
  const angle = String(toDegrees(style.angle).toFixed(0))
  const shaftRatio = String(style.shaftRatio)
  const cropping = String(style.sourceCropping)
  // if no element is selected, disable the options panel
  const disabled = !graphComponent.selection.isSelected(edge)
  updatePanelState(style, shape, thickness, angle, shaftRatio, cropping, disabled)
}

/**
 * Updates the current state of the options panel with the given values
 * @param {!ArrowEdgeStyle} style The style to abe applied.
 * @param {!string} shape The shape to be applied.
 * @param {!string} thickness The thickness to be applied.
 * @param {!string} angle The angle to be applied.
 * @param {!string} shaftRatio The shaft ration to be applied.
 * @param {!string} cropping The cropping length of the edge
 * @param {boolean} disabled True if the panel should be disabled, false otherwise
 */
function updatePanelState(style, shape, thickness, angle, shaftRatio, cropping, disabled) {
  basicShape.value = shape
  basicShape.disabled = disabled
  thicknessRange.value = thickness
  thicknessRange.disabled = disabled
  thicknessRangeLabel.innerText = thickness
  angleRange.value = angle
  angleRange.disabled = disabled

  angleRange.min =
    style.shaftRatio === 1 ||
    style.shape === ArrowStyleShape.PARALLELOGRAM ||
    style.shape === ArrowStyleShape.TRAPEZOID
      ? '-90'
      : '0'
  angleLabel.innerText = angle
  shaftRatioRange.value = shaftRatio
  shaftRatioRange.disabled =
    disabled ??
    (style.shape === ArrowStyleShape.PARALLELOGRAM || style.shape === ArrowStyleShape.TRAPEZOID)
  shaftRatioLabel.innerText = shaftRatio

  croppingRange.value = cropping
  croppingRange.disabled = disabled
  croppingLabel.innerText = cropping
  propertiesPanel.style.display = disabled ? 'none' : 'inline-block'
  infoMessage.style.display = disabled ? 'inline-block' : 'none'
}

/**
 * Returns the given angle in degrees.
 * @param {number} radians
 * @returns {number}
 */
function toDegrees(radians) {
  return (radians * 180) / Math.PI
}

/**
 * Returns the given angle in radians.
 * @param {number} degrees
 * @returns {number}
 */
function toRadians(degrees) {
  return (degrees / 180) * Math.PI
}

// noinspection JSIgnoredPromiseFromCall
run()
