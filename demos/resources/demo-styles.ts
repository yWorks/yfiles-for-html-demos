/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  EdgePathCropper,
  GraphComponent,
  GroupNodeLabelModel,
  GroupNodeStyle,
  HorizontalTextAlignment,
  HtmlCanvasVisual,
  IBoundsProvider,
  type IEdge,
  IGraph,
  IHitTestable,
  ILabelStyle,
  INode,
  IObjectRenderer,
  IRenderContext,
  IVisibilityTestable,
  IVisualCreator,
  LabelShape,
  LabelStyle,
  PolylineEdgeStyle,
  RectangleNodeStyle,
  ShapeNodeShape,
  type ShapeNodeShapeStringValues,
  ShapeNodeStyle,
  VerticalTextAlignment,
  Visual
} from '@yfiles/yfiles'
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
 * @param theme Optional color set names for all the demo styles. The default is 'demo-orange'.
 * @param foldingEnabled whether to use collapsable group node style
 * @param extraCropLength the extra crop length for the DefaultEdgePathCropper.
 * @param shape the optional shape of the node style, if undefined a RectangularNodeStyle is used.
 * @param orthogonalEditing whether to enable orthogonal edge editing on the default edge style.
 */
export function initDemoStyles(
  graph: IGraph,
  {
    theme = {},
    foldingEnabled = false,
    extraCropLength = 2.0,
    shape = undefined,
    orthogonalEditing = false
  }: {
    theme?: CssClassNames | ColorSetName
    foldingEnabled?: boolean
    extraCropLength?: number
    shape?: ShapeNodeShape
    orthogonalEditing?: boolean
  } = {}
): void {
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

  graph.edgeDefaults.style = createDemoEdgeStyle({ colorSetName: theme.edge, orthogonalEditing })
  graph.decorator.ports.edgePathCropper.addConstant(
    new EdgePathCropper({ cropAtPort: false, extraCropLength })
  )
  graph.edgeDefaults.labels.style = createDemoEdgeLabelStyle(theme.edgeLabel)
}

/**
 * Creates a new rectangular node style whose colors match the given well-known CSS style.
 */
export function createDemoNodeStyle(
  colorSetName: ColorSetName = 'demo-orange'
): RectangleNodeStyle {
  return new RectangleNodeStyle({
    fill: colorSets[colorSetName].fill,
    stroke: `1.5px ${colorSets[colorSetName].stroke}`,
    cornerStyle: 'round',
    cornerSize: 3.5
  })
}

/**
 * Creates a new node style with the given shape whose colors match the given well-known CSS style.
 */
export function createDemoShapeNodeStyle(
  shape: ShapeNodeShape | ShapeNodeShapeStringValues,
  colorSetName: ColorSetName = 'demo-orange'
): ShapeNodeStyle {
  return new ShapeNodeStyle({
    shape,
    fill: colorSets[colorSetName].fill,
    stroke: `1.5px ${colorSets[colorSetName].stroke}`
  })
}

/**
 * Creates a new polyline edge style whose colors match the given well-known CSS style.
 */
export function createDemoEdgeStyle({
  colorSetName = 'demo-orange',
  showTargetArrow = true,
  orthogonalEditing = false
}: {
  colorSetName?: ColorSetName
  showTargetArrow?: boolean
  orthogonalEditing?: boolean
} = {}): PolylineEdgeStyle {
  const edgeColor = colorSets[colorSetName].stroke
  return new PolylineEdgeStyle({
    stroke: `1.5px ${edgeColor}`,
    targetArrow: showTargetArrow ? `${edgeColor} small triangle` : 'none',
    orthogonalEditing
  })
}

/**
 * Creates a new node label style whose colors match the given well-known CSS style.
 */
export function createDemoNodeLabelStyle(colorSetName: ColorSetName = 'demo-orange'): LabelStyle {
  const labelStyle = new LabelStyle()
  labelStyle.shape = LabelShape.ROUND_RECTANGLE
  labelStyle.backgroundFill = colorSets[colorSetName].nodeLabelFill
  labelStyle.textFill = colorSets[colorSetName].text
  labelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  labelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  labelStyle.padding = [2, 4, 1, 4]
  return labelStyle
}

/**
 * Creates a new edge label style whose colors match the given well-known CSS style.
 */
export function createDemoEdgeLabelStyle(colorSetName: ColorSetName = 'demo-orange'): LabelStyle {
  const labelStyle = new LabelStyle()
  labelStyle.shape = LabelShape.ROUND_RECTANGLE
  labelStyle.backgroundFill = colorSets[colorSetName].edgeLabelFill
  labelStyle.textFill = colorSets[colorSetName].text
  labelStyle.verticalTextAlignment = VerticalTextAlignment.CENTER
  labelStyle.horizontalTextAlignment = HorizontalTextAlignment.CENTER
  labelStyle.padding = [2, 4, 1, 4]
  return labelStyle
}

/**
 * Creates a new group label style whose colors match the given well-known CSS style.
 */
export function createDemoGroupLabelStyle(
  colorSetName: ColorSetName = 'demo-palette-12'
): ILabelStyle {
  return new LabelStyle({
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'left',
    wrapping: 'wrap-character-ellipsis',
    textFill: colorSets[colorSetName].nodeLabelFill
  })
}

/**
 * Creates a new group node style whose colors match the given well-known CSS style.
 */
export function createDemoGroupStyle({
  colorSetName = 'demo-palette-12',
  foldingEnabled = false
}: {
  colorSetName?: ColorSetName
  foldingEnabled?: boolean
}): GroupNodeStyle {
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
    tabPadding: 3,
    iconOffset: 2,
    iconSize: 14,
    iconForegroundFill: colorSets[colorSetName].fill,
    hitTransparentContentArea: true
  })
}

/**
 * The class provides functionality for custom style of overview control.
 */
export class DemoStyleOverviewRenderer extends BaseClass(IObjectRenderer) {
  getBoundsProvider(renderTag: any): IBoundsProvider {
    return IBoundsProvider.UNBOUNDED
  }
  getHitTestable(renderTag: any): IHitTestable {
    return IHitTestable.NEVER
  }
  getVisibilityTestable(renderTag: any): IVisibilityTestable {
    return IVisibilityTestable.ALWAYS
  }
  getVisualCreator(renderTag: any): IVisualCreator {
    return IVisualCreator.create({
      createVisual(context: IRenderContext): Visual | null {
        return new CanvasVisual()
      },
      updateVisual(context: IRenderContext, oldVisual: Visual | null): Visual | null {
        return oldVisual instanceof CanvasVisual ? oldVisual : this.createVisual(context)
      }
    })
  }
}

class CanvasVisual extends HtmlCanvasVisual {
  render(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
    const graph = (renderContext.canvasComponent as GraphComponent).graph
    graph.nodes.forEach((node) => {
      if (graph.isGroupNode(node)) {
        this.paintGroupNode(renderContext, ctx, node)
      } else {
        this.paintNode(renderContext, ctx, node)
      }
    })
    graph.edges.forEach((edge) => {
      this.paintEdge(renderContext, ctx, edge)
    })
  }

  paintNode(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, node: INode): void {
    ctx.fillStyle = 'rgb(128, 128, 128)'
    const layout = node.layout
    ctx.fillRect(layout.x, layout.y, layout.width, layout.height)
  }

  paintGroupNode(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, node: INode): void {
    ctx.fillStyle = 'rgb(211, 211, 211)'
    ctx.strokeStyle = 'rgb(211, 211, 211)'
    ctx.lineWidth = 4
    const { x, y, width, height } = node.layout
    ctx.strokeRect(x, y, width, height)
    ctx.fillRect(x, y, width, 22)
    ctx.lineWidth = 1
  }

  paintEdge(renderContext: IRenderContext, ctx: CanvasRenderingContext2D, edge: IEdge): void {
    ctx.strokeStyle = 'rgb(0,0,0)'

    ctx.beginPath()
    let location = edge.sourcePort.location
    ctx.moveTo(location.x, location.y)
    edge.bends.forEach((bend) => {
      location = bend.location.toPoint()
      ctx.lineTo(location.x, location.y)
    })
    location = edge.targetPort.location
    ctx.lineTo(location.x, location.y)
    ctx.stroke()
  }
}
