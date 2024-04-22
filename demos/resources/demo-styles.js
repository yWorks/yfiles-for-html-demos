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
/* eslint-disable jsdoc/check-param-names */
import {
  DefaultEdgePathCropper,
  DefaultLabelStyle,
  EdgeSelectionIndicatorInstaller,
  GraphComponent,
  GraphOverviewCanvasVisualCreator,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HorizontalTextAlignment,
  IGraph,
  ILabelStyle,
  INode,
  Insets,
  IRenderContext,
  LabelShape,
  OrientedRectangleIndicatorInstaller,
  PolylineEdgeStyle,
  RectangleIndicatorInstaller,
  RectangleNodeStyle,
  ScrollBarVisibility,
  ShapeNodeShape,
  ShapeNodeStyle,
  Theme,
  ThemeVariant,
  VerticalTextAlignment
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
 * @param theme Optional color set names for all the demo styles. The default is 'demo-orange'.
 * @param foldingEnabled whether to use collapsable group node style
 * @param extraCropLength the extra crop length for the DefaultEdgePathCropper.
 * @param shape the optional shape of the node style, if undefined a RectangularNodeStyle is used.
 * @param {!object} undefined
 */
export function initDemoStyles(
  graph,
  { theme = {}, foldingEnabled = false, extraCropLength = 2.0, shape = undefined } = {}
) {
  if (typeof theme === 'string') {
    theme = { node: theme, edge: theme, group: theme }
  }

  theme.node = theme.node || 'demo-orange'
  theme.nodeLabel = theme.nodeLabel || theme.node
  theme.edge = theme.edge || theme.node || 'demo-orange'
  theme.edgeLabel = theme.edgeLabel || theme.edge
  theme.group = theme.group || 'demo-palette-12'
  theme.groupLabel = theme.groupLabel || theme.group

  graph.nodeDefaults.style = shape
    ? createDemoShapeNodeStyle(shape, theme.node)
    : createDemoNodeStyle(theme.node)
  graph.nodeDefaults.labels.style = createDemoNodeLabelStyle(theme.nodeLabel)

  graph.groupNodeDefaults.style = createDemoGroupStyle({
    colorSetName: theme.group,
    foldingEnabled
  })
  graph.groupNodeDefaults.labels.style = createDemoGroupLabelStyle(theme.groupLabel)
  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()

  graph.edgeDefaults.style = createDemoEdgeStyle({ colorSetName: theme.edge })
  graph.decorator.portDecorator.edgePathCropperDecorator.setImplementation(
    new DefaultEdgePathCropper({ cropAtPort: false, extraCropLength })
  )
  graph.edgeDefaults.labels.style = createDemoEdgeLabelStyle(theme.edgeLabel)
}

/**
 * Creates a new rectangular node style whose colors match the given well-known CSS style.
 * @param {!ColorSetName} [colorSetName=demo-orange]
 * @returns {!RectangleNodeStyle}
 */
export function createDemoNodeStyle(colorSetName = 'demo-orange') {
  return new RectangleNodeStyle({
    fill: colorSets[colorSetName].fill,
    stroke: `1.5px ${colorSets[colorSetName].stroke}`,
    cornerStyle: 'round',
    cornerSize: 3.5
  })
}

/**
 * Creates a new node style with the given shape whose colors match the given well-known CSS style.
 * @param {!(ShapeNodeShape|ShapeNodeShapeStringValues)} shape
 * @param {!ColorSetName} [colorSetName=demo-orange]
 * @returns {!ShapeNodeStyle}
 */
export function createDemoShapeNodeStyle(shape, colorSetName = 'demo-orange') {
  return new ShapeNodeStyle({
    shape,
    fill: colorSets[colorSetName].fill,
    stroke: `1.5px ${colorSets[colorSetName].stroke}`
  })
}

/**
 * Creates a new polyline edge style whose colors match the given well-known CSS style.
 * @param {!object} undefined
 * @returns {!PolylineEdgeStyle}
 */
export function createDemoEdgeStyle({ colorSetName = 'demo-orange', showTargetArrow = true } = {}) {
  const edgeColor = colorSets[colorSetName].stroke
  return new PolylineEdgeStyle({
    stroke: `1.5px ${edgeColor}`,
    targetArrow: showTargetArrow ? `${edgeColor} small triangle` : 'none'
  })
}

/**
 * Creates a new node label style whose colors match the given well-known CSS style.
 * @param {!ColorSetName} [colorSetName=demo-orange]
 * @returns {!DefaultLabelStyle}
 */
export function createDemoNodeLabelStyle(colorSetName = 'demo-orange') {
  const labelStyle = new DefaultLabelStyle()
  labelStyle.shape = LabelShape.ROUND_RECTANGLE
  labelStyle.backgroundFill = colorSets[colorSetName].nodeLabelFill
  labelStyle.textFill = colorSets[colorSetName].text
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
export function createDemoEdgeLabelStyle(colorSetName = 'demo-orange') {
  const labelStyle = new DefaultLabelStyle()
  labelStyle.shape = LabelShape.ROUND_RECTANGLE
  labelStyle.backgroundFill = colorSets[colorSetName].edgeLabelFill
  labelStyle.textFill = colorSets[colorSetName].text
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
export function createDemoGroupLabelStyle(colorSetName = 'demo-palette-12') {
  return new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'left',
    clipText: false,
    wrapping: 'character-ellipsis',
    textFill: colorSets[colorSetName].nodeLabelFill
  })
}

/**
 * Creates a new group node style whose colors match the given well-known CSS style.
 * @param {!object} undefined
 * @returns {!GroupNodeStyle}
 */
export function createDemoGroupStyle({ colorSetName = 'demo-palette-12', foldingEnabled = false }) {
  return new GroupNodeStyle({
    cssClass: 'demo-group-style',
    groupIcon: foldingEnabled ? 'minus' : 'none',
    folderIcon: 'plus',
    tabFill: foldingEnabled ? colorSets[colorSetName].nodeLabelFill : colorSets[colorSetName].fill,
    stroke: `2px solid ${colorSets[colorSetName].fill}`,
    tabBackgroundFill: foldingEnabled ? colorSets[colorSetName].fill : null,
    tabPosition: foldingEnabled ? 'top-trailing' : 'top',
    tabWidth: 30,
    tabHeight: 20,
    tabInset: 3,
    iconOffset: 2,
    iconSize: 14,
    iconForegroundFill: colorSets[colorSetName].fill,
    hitTransparentContentArea: true
  })
}

/**
 * The class provides functionality for custom style of overview control.
 */
export class DemoStyleOverviewPaintable extends GraphOverviewCanvasVisualCreator {
  /**
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!INode} node
   */
  paintNode(renderContext, ctx, node) {
    ctx.fillStyle = 'rgb(128, 128, 128)'
    const layout = node.layout
    ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
  }

  /**
   * @param {!IRenderContext} renderContext
   * @param {!CanvasRenderingContext2D} ctx
   * @param {!INode} node
   */
  paintGroupNode(renderContext, ctx, node) {
    ctx.fillStyle = 'rgb(211, 211, 211)'
    ctx.strokeStyle = 'rgb(211, 211, 211)'
    ctx.lineWidth = 4
    const { x, y, width, height } = node.layout
    ctx.strokeRect(x, y, width, height)
    ctx.fillRect(x, y, width, 22)
    ctx.lineWidth = 1
  }
}

/**
 * Applies the default demo theme to the {@link GraphComponent}.
 * @param {!GraphComponent} graphComponent
 * @param {!object} themeOptions
 */
export function applyDemoTheme(graphComponent, themeOptions = {}) {
  const theme = new Theme({
    variant: 'simple-round',
    scale: 1.4,
    primaryColor: '#38434f',
    backgroundColor: '#FFF',
    ...themeOptions
  })
  graphComponent.theme = theme
  // use hatch selection for better compatibility with arbitrary item colors
  graphComponent.resources.set(
    RectangleIndicatorInstaller.SELECTION_TEMPLATE_KEY,
    theme.hatchRectangle
  )
  graphComponent.resources.set(
    OrientedRectangleIndicatorInstaller.SELECTION_TEMPLATE_KEY,
    theme.hatchRectangle
  )
  graphComponent.resources.set(EdgeSelectionIndicatorInstaller.STROKE_KEY, theme.hatchStroke)

  graphComponent.horizontalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED_DYNAMIC
  graphComponent.verticalScrollBarPolicy = ScrollBarVisibility.AS_NEEDED_DYNAMIC
}
