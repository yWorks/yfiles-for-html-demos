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
import type { ColorSet as CS, ColorSetName as CSN } from './demo-colors'
import { colorSets as cs } from './demo-colors'

export type ColorSetName = CSN
export type ColorSet = CS
export const colorSets = cs

export type CssClassNames = {
  node?: ColorSetName
  nodeLabel?: ColorSetName
  edge?: ColorSetName
  edgeLabel?: ColorSetName
  group?: ColorSetName
  groupLabel?: ColorSetName
}

export function isColorSetName(arg: string): arg is ColorSetName {
  return arg in colorSets
}

/**
 * Initializes graph defaults with nicely configured built-in yFiles styles.
 *
 * @param graph The graph on which the default styles and style-related setting are set.
 * @param theme Optional color set names for all of the demo styles. The default is 'demo-orange'.
 */
export function initBasicDemoStyles(graph: IGraph, theme: CssClassNames | ColorSetName = {}): void {
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
 */
export function createBasicNodeStyle(colorSetName: ColorSetName = 'demo-orange'): ShapeNodeStyle {
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: 'round-rectangle',
    fill: colorSets[colorSetName].fill,
    stroke: `1.5px ${colorSets[colorSetName].stroke}`
  })
  ;(shapeNodeStyle.renderer as ShapeNodeStyleRenderer).roundRectArcRadius = 3.5
  return shapeNodeStyle
}

/**
 * Creates a new polyline edge style whose colors match the given well-known CSS style.
 */
export function createBasicEdgeStyle(
  colorSetName: ColorSetName = 'demo-orange'
): PolylineEdgeStyle {
  const edgeColor = colorSets[colorSetName].stroke
  return new PolylineEdgeStyle({
    stroke: `1.5px ${edgeColor}`,
    targetArrow: `${edgeColor} small triangle`
  })
}

/**
 * Creates a new node label style whose colors match the given well-known CSS style.
 */
export function createBasicNodeLabelStyle(
  colorSetName: ColorSetName = 'demo-orange'
): DefaultLabelStyle {
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
 */
export function createBasicEdgeLabelStyle(
  colorSetName: ColorSetName = 'demo-orange'
): DefaultLabelStyle {
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
 */
export function createBasicGroupLabelStyle(
  colorSetName: ColorSetName = 'demo-palette-12'
): ILabelStyle {
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
 */
export function createBasicGroupStyle(
  colorSetName: ColorSetName = 'demo-palette-12'
): PanelNodeStyle {
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
  constructor(public readonly rounding: number) {
    super()
  }

  createVisual(context: IRenderContext): Visual | null {
    const visual = super.createVisual(context)
    this.addRounding(visual)
    return visual
  }

  updateVisual(context: IRenderContext, oldVisual: Visual | null): Visual | null {
    const visual = super.updateVisual(context, oldVisual)
    this.addRounding(visual)
    return visual
  }

  /**
   * If the visual has a <rect> element as its first child, set rounded corners for it.
   */
  private addRounding(visual: Visual | null) {
    if (
      visual != null &&
      (this.style.backgroundFill != null || this.style.backgroundStroke != null)
    ) {
      const rectVisual = (visual as SvgVisualGroup).children.get(0)
      const rectElement = rectVisual.svgElement as SVGRectElement
      rectElement.rx.baseVal.value = this.rounding
      rectElement.ry.baseVal.value = this.rounding
    }
  }
}
