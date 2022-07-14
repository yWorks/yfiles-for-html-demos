/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  DefaultEdgePathCropper,
  DefaultLabelStyle,
  DefaultLabelStyleRenderer,
  Fill,
  HorizontalTextAlignment,
  IGraph,
  ILabelStyle,
  Insets,
  InteriorStretchLabelModel,
  IRenderContext,
  PanelNodeStyle,
  PolylineEdgeStyle,
  ShapeNodeStyle,
  ShapeNodeStyleRenderer,
  SvgVisual,
  SvgVisualGroup,
  VerticalTextAlignment,
  Visual
} from 'yfiles'
import { colorSets as cs } from './demo-colors.js'

/**
 * @typedef {CSN} ColorSetName
 */
/**
 * @typedef {CS} ColorSet
 */
export const colorSets = cs

/**
 * @typedef {Object} CssClassNames
 * @property {ColorSetName} [node]
 * @property {ColorSetName} [nodeLabel]
 * @property {ColorSetName} [edge]
 * @property {ColorSetName} [edgeLabel]
 * @property {ColorSetName} [group]
 * @property {ColorSetName} [groupLabel]
 */

/**
 * @param {!string} arg
 * @returns {!ColorSetName}
 */
export function isColorSetName(arg) {
  return arg in colorSets
}

/**
 * Initializes graph defaults with nicely configured built-in yFiles styles.
 *
 * @param {!IGraph} graph The graph on which the default styles and style-related setting are set.
 * @param {!(CssClassNames|ColorSetName)} theme Optional color set names for all of the demo styles. The default is 'demo-orange'.
 */
export function initBasicDemoStyles(graph, theme = {}) {
  if (typeof theme === 'string') {
    theme = { node: theme, edge: theme, group: theme }
  }

  theme.node = theme.node || 'demo-orange'
  theme.nodeLabel = theme.nodeLabel || theme.node
  theme.edge = theme.edge || theme.node || 'demo-orange'
  theme.edgeLabel = theme.edgeLabel || theme.edge
  theme.group = theme.group || 'demo-palette-12'
  theme.groupLabel = theme.groupLabel || theme.group

  graph.nodeDefaults.style = createBasicNodeStyle(theme.node)
  graph.nodeDefaults.labels.style = createBasicNodeLabelStyle(theme.nodeLabel)

  graph.groupNodeDefaults.style = createBasicGroupStyle(theme.group)
  graph.groupNodeDefaults.labels.style = createBasicGroupLabelStyle(theme.groupLabel)
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH

  graph.edgeDefaults.style = createBasicEdgeStyle(theme.edge)
  graph.decorator.portDecorator.edgePathCropperDecorator.setImplementation(
    new DefaultEdgePathCropper({ cropAtPort: false, extraCropLength: 1 })
  )
  graph.edgeDefaults.labels.style = createBasicEdgeLabelStyle(theme.edgeLabel)
}

/**
 * Creates a new rectangular shape node style whose colors match the given well-known CSS style.
 * @param {!ColorSetName} [colorSetName=demo-orange]
 * @returns {!ShapeNodeStyle}
 */
export function createBasicNodeStyle(colorSetName = 'demo-orange') {
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: colorSets[colorSetName].fill,
    stroke: `1.5px ${colorSets[colorSetName].stroke}`
  })
  shapeNodeStyle.renderer.roundRectArcRadius = 3.5
  return shapeNodeStyle
}

/**
 * Creates a new polyline edge style whose colors match the given well-known CSS style.
 * @param {!ColorSetName} [colorSetName=demo-orange]
 * @returns {!PolylineEdgeStyle}
 */
export function createBasicEdgeStyle(colorSetName = 'demo-orange') {
  const edgeColor = colorSets[colorSetName].stroke
  return new PolylineEdgeStyle({
    stroke: `1.5px ${edgeColor}`,
    targetArrow: `${edgeColor} small triangle`
  })
}

/**
 * Creates a new node label style whose colors match the given well-known CSS style.
 * @param {!ColorSetName} [colorSetName=demo-orange]
 * @returns {!DefaultLabelStyle}
 */
export function createBasicNodeLabelStyle(colorSetName = 'demo-orange') {
  const labelStyle = new DefaultLabelStyle(new DemoLabelStyleRenderer(2.5))
  labelStyle.backgroundFill = Fill.from(colorSets[colorSetName].nodeLabelFill)
  labelStyle.textFill = Fill.from(colorSets[colorSetName].text)
  labelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  labelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  labelStyle.insets = new Insets(4, 2, 4, 1)
  return labelStyle
}

/**
 * Creates a new edge label style whose colors match the given well-known CSS style.
 * @param {!ColorSetName} [colorSetName=demo-orange]
 * @returns {!DefaultLabelStyle}
 */
export function createBasicEdgeLabelStyle(colorSetName = 'demo-orange') {
  const labelStyle = new DefaultLabelStyle(new DemoLabelStyleRenderer(2))
  labelStyle.backgroundFill = Fill.from(colorSets[colorSetName].edgeLabelFill)
  labelStyle.textFill = Fill.from(colorSets[colorSetName].text)
  labelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  labelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  labelStyle.insets = new Insets(4, 2, 4, 1)
  return labelStyle
}

/**
 * Creates a new group label style whose colors match the given well-known CSS style.
 * @param {!ColorSetName} [colorSetName=demo-palette-12]
 * @returns {!ILabelStyle}
 */
export function createBasicGroupLabelStyle(colorSetName = 'demo-palette-12') {
  return new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'right',
    wrapping: 'character-ellipsis',
    textFill: colorSets[colorSetName].nodeLabelFill,
    insets: [4, 5, 2, 5]
  })
}

/**
 * Creates a new group node style whose colors match the given well-known CSS style.
 * @param {!ColorSetName} [colorSetName=demo-palette-12]
 * @returns {!PanelNodeStyle}
 */
export function createBasicGroupStyle(colorSetName = 'demo-palette-12') {
  return new PanelNodeStyle({
    color: '#ffffff',
    insets: [30, 5, 5, 5],
    labelInsetsColor: colorSets[colorSetName].fill
  })
}

/**
 * A demo label style renderer that draws the optional background with rounded corners.
 */
export class DemoLabelStyleRenderer extends DefaultLabelStyleRenderer {
  /**
   * @param {number} rounding
   */
  constructor(rounding) {
    super()
    this.rounding = rounding
  }

  /**
   * @param {!IRenderContext} context
   * @returns {?Visual}
   */
  createVisual(context) {
    const visual = super.createVisual(context)
    this.addRounding(visual)
    return visual
  }

  /**
   * @param {!IRenderContext} context
   * @param {?Visual} oldVisual
   * @returns {?Visual}
   */
  updateVisual(context, oldVisual) {
    const visual = super.updateVisual(context, oldVisual)
    this.addRounding(visual)
    return visual
  }

  /**
   * If the visual has a <rect> element as its first child, set rounded corners for it.
   * @param {?Visual} visual
   */
  addRounding(visual) {
    if (
      visual != null &&
      (this.style.backgroundFill != null || this.style.backgroundStroke != null)
    ) {
      const rectVisual = visual.children.get(0)
      const rectElement = rectVisual.svgElement
      rectElement.rx.baseVal.value = this.rounding
      rectElement.ry.baseVal.value = this.rounding
    }
  }
}
