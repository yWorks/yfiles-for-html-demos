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
  Class,
  Color,
  GeneralPath,
  GraphComponent,
  IGroupBoundsCalculator,
  IInputModeContext,
  INode,
  INodeInsetsProvider,
  INodeSizeConstraintProvider,
  Insets,
  IRenderContext,
  ITagOwner,
  Matrix,
  NodeStyleBase,
  Point,
  Rect,
  Size,
  SvgVisual
} from 'yfiles'
import { SVGNS } from './Namespaces'

/** bounds of the "tab" */
const TAB_H = 16
const TAB_W = 48
const SMALL_TAB_W = 18
const OUTER_RADIUS = 5
const INNER_RADIUS = 3
const INSET = 2
const CORNER_SIZE = 16
const BUTTON_SIZE = 14

/**
 * This group node style creates a visualization that is mainly a round
 * rectangle. Additionally, it displays a textual description in a tab-like
 * fashion on the top left and the toggle button in the lower right corner.
 * This implementation uses the convenience class
 * {@link NodeStyleBase} as the base class since
 * this makes customizations easy. Additionally, it uses a couple of inner
 * classes to customize certain aspects of the user interaction behavior, for
 * example a {@link IGroupBoundsCalculator} that takes the node labels
 * into account.
 */
export default class CustomGroupNodeStyle extends NodeStyleBase {
  public nodeColor = 'rgba(0, 130, 180, 1)'

  createVisual(renderContext: IRenderContext, node: INode): SvgVisual {
    const g = document.createElementNS(SVGNS, 'g')
    CustomGroupNodeStyle.render(g, this.createRenderDataCache(renderContext, node))
    SvgVisual.setTranslate(g, node.layout.x, node.layout.y)
    return new SvgVisual(g)
  }

  updateVisual(renderContext: IRenderContext, oldVisual: SvgVisual, node: INode): SvgVisual {
    const container = oldVisual.svgElement as SVGElement & {
      'data-renderDataCache'?: NodeRenderDataCache
    }
    // get the data with which the oldvisual was created
    const oldCache = container['data-renderDataCache']
    // get the data for the new visual
    const newCache = this.createRenderDataCache(renderContext, node)

    // check if something changed except for the location of the node
    if (!newCache.equals(oldCache)) {
      // something changed - re-render the visual
      while (container.lastChild) {
        // remove all children
        container.removeChild(container.lastChild)
      }
      CustomGroupNodeStyle.render(container, newCache)
    }
    // make sure that the location is up to date
    SvgVisual.setTranslate(container, node.layout.x, node.layout.y)
    return oldVisual
  }

  /**
   * Creates the actual visualization of this style and adds it to the given container.
   */
  private static render(
    container: SVGElement & { 'data-renderDataCache'?: NodeRenderDataCache },
    cache: NodeRenderDataCache
  ): void {
    container['data-renderDataCache'] = cache

    const width = cache.width
    const height = cache.height

    if (!cache.isCollapsed) {
      // create outer path
      const outerPath = createOuterPath(width, height)
      const outerPathElement = outerPath.createSvgPath()
      outerPathElement.setAttribute('fill', cache.color)
      outerPathElement.setAttribute('fill-opacity', '0.1')
      container.appendChild(outerPathElement)

      // create border path
      const borderPath = outerPath
      borderPath.append(createInnerPath(width, height), false)
      const borderPathElement = borderPath.createSvgPath()
      borderPathElement.setAttribute('fill', cache.color)
      borderPathElement.setAttribute('fill-rule', 'evenodd')
      container.appendChild(borderPathElement)
    } else {
      // create outer path
      const outerPath = createOuterPath(width, height)
      const outerPathElement = outerPath.createSvgPath()
      outerPathElement.setAttribute('fill', cache.color)
      container.appendChild(outerPathElement)
    }

    if (!displayTextInTab(width)) {
      return
    }
    // optionally create text element for the tab
    const text = document.createElementNS(SVGNS, 'text')
    text.textContent = cache.isCollapsed ? 'Folder' : 'Group'
    text.setAttribute('transform', 'translate(4 14)')
    text.setAttribute('font-size', '14px')
    text.setAttribute('font-family', 'Arial')
    text.setAttribute('fill', '#333333')
    container.appendChild(text)
  }

  /**
   * Creates an object containing all necessary data to create a visual for the node.
   */
  private createRenderDataCache(context: IRenderContext, node: INode): NodeRenderDataCache {
    return new NodeRenderDataCache(
      this.getNodeColor(node),
      node.layout.width,
      node.layout.height,
      isCollapsed(context, node)
    )
  }

  /**
   * Overridden to customize the behavior of this style with respect to certain user interaction.
   * @see Overrides {@link NodeStyleBase#lookup}
   */
  lookup(node: INode, type: Class): object {
    // A group bounds calculator that calculates bounds that encompass the
    // children of a group and all the children's labels.
    if (type === IGroupBoundsCalculator.$class) {
      // use a custom group bounds calculator that takes labels into account
      return IGroupBoundsCalculator.create((graph, groupNode) => {
        let bounds: Rect = Rect.EMPTY
        const children = graph.getChildren(groupNode)
        children.forEach(child => {
          bounds = Rect.add(bounds, child.layout.toRect())
          child.labels.forEach(label => {
            bounds = Rect.add(bounds, label.layout.bounds)
          })
        })

        const insetsProvider = groupNode.lookup(INodeInsetsProvider.$class) as INodeInsetsProvider
        return insetsProvider === null
          ? bounds
          : bounds.getEnlarged(insetsProvider.getInsets(groupNode))
      })
    }

    // Determines the insets used for the group contents.
    if (type === INodeInsetsProvider.$class) {
      // use a custom insets provider that reserves space for the tab and the toggle button
      return INodeInsetsProvider.create(
        () => new Insets(6, TAB_H + 6, CORNER_SIZE - 1, CORNER_SIZE - 1)
      )
    }

    // Determines the minimum and maximum node size.
    if (type === INodeSizeConstraintProvider.$class) {
      // use a custom size constraint provider to make sure that the tab
      // and the toggle button are always visible
      return INodeSizeConstraintProvider.create({
        // Returns a reasonable minimum size to show the tab and the toggle button.
        getMinimumSize: () =>
          new Size(
            Math.max(SMALL_TAB_W + OUTER_RADIUS + OUTER_RADIUS, CORNER_SIZE + OUTER_RADIUS),
            TAB_H + OUTER_RADIUS + CORNER_SIZE
          ),
        // Returns infinity to don't limit the maximum size.
        getMaximumSize: () => Size.INFINITE,
        // Returns the empty rectangle to don't constrain the area.
        getMinimumEnclosedArea: () => Rect.EMPTY
      })
    }
    return super.lookup(node, type)
  }

  /**
   * Returns whether or not the given point hits the visualization of the
   * given node. This implementation is strict, it returns
   * <code>true</code> for the main rectangle and the tab area, but not
   * for the empty space to the left of the tab.
   * @see Overrides {@link NodeStyleBase#isHit}
   */
  isHit(context: IInputModeContext, location: Point, node: INode): boolean {
    const rect = new Rect(
      node.layout.x,
      node.layout.y + TAB_H,
      node.layout.width,
      node.layout.height - TAB_H
    )
    // check main node rect
    if (rect.containsWithEps(location, context.hitTestRadius)) {
      return true
    }
    // check tab
    const width = displayTextInTab(node.layout.width) ? TAB_W : SMALL_TAB_W
    return new Rect(node.layout.x, node.layout.y, width, TAB_H).containsWithEps(
      location,
      context.hitTestRadius
    )
  }

  /**
   * Returns the exact outline for the given node. This information is used
   * to clip the node's edges correctly.
   * @see Overrides {@link NodeStyleBase#getOutline}
   */
  getOutline(node: INode): GeneralPath {
    const path = createOuterPath(node.layout.width, node.layout.height)
    path.transform(new Matrix(1, 0, 0, 1, node.layout.x, node.layout.y))
    return path
  }

  /**
   * Determines the color to use for filling the node.
   * This implementation uses the {@link CustomGroupNodeStyle#nodeColor} property unless
   * the {@link ITagOwner#tag} of the {@link INode} is of type {@link Color},
   * in which case that color overrides this style's setting.
   * @param node The node to determine the color for.
   * @return The color for filling the node.
   */
  getNodeColor(node: INode): string {
    return typeof node.tag === 'string' ? node.tag : this.nodeColor
  }
}

class NodeRenderDataCache {
  constructor(
    public readonly color: string,
    public readonly width: number,
    public readonly height: number,
    public readonly isCollapsed: boolean
  ) {}

  equals(other?: NodeRenderDataCache): boolean {
    return (
      !!other &&
      this.color === other.color &&
      this.width === other.width &&
      this.height === other.height &&
      this.isCollapsed === other.isCollapsed
    )
  }
}

/**
 * Returns whether or not the given group node is collapsed.
 */
function isCollapsed(context: IRenderContext, node: INode): boolean {
  const graphComponent = context.canvasComponent
  if (graphComponent instanceof GraphComponent) {
    const foldedGraph = graphComponent.graph.foldingView
    if (foldedGraph) {
      // check if the node is collapsed in the view graph
      return !foldedGraph.isExpanded(node)
    }
  }
  return false
}

/**
 * Creates the inner group path
 */
function createInnerPath(width: number, height: number): GeneralPath {
  const i = INSET
  const r = INNER_RADIUS

  // helper variables for curve coordinates
  const c = 0.551915024494
  const sx = width - i - r
  const sy = height - i - CORNER_SIZE
  const b = (BUTTON_SIZE / 2) | 0
  const ex = width - i - CORNER_SIZE
  const ey = height - i - b
  const dc = c * (CORNER_SIZE - r)
  const c1x = sx - dc
  const c1y = sy
  const c2x = ex
  const c2y = ey - dc

  const path = new GeneralPath()
  path.moveTo(i + r, i + TAB_H)
  path.lineTo(sx, i + TAB_H)
  path.quadTo(width - i, i + TAB_H, width - i, i + TAB_H + r)
  path.lineTo(width - i, sy - r)
  path.quadTo(width - i, sy, sx, sy)
  path.lineTo(width - i - b, height - i - CORNER_SIZE)
  path.cubicTo(c1x, c1y, c2x, c2y, ex, ey)
  path.lineTo(width - i - CORNER_SIZE, height - i - r)
  path.quadTo(ex, height - i, ex - r, height - i)
  path.lineTo(i + r, height - i)
  path.quadTo(i, height - i, i, ey)
  path.lineTo(i, i + TAB_H + r)
  path.quadTo(i, i + TAB_H, i + r, i + TAB_H)
  path.close()
  return path
}

/**
 * Creates the outer group path
 */
function createOuterPath(width: number, height: number): GeneralPath {
  const r = OUTER_RADIUS
  const tabWidth = displayTextInTab(width) ? TAB_W : SMALL_TAB_W
  const path = new GeneralPath()
  path.moveTo(tabWidth + r, TAB_H)
  path.lineTo(width - r, TAB_H)
  path.quadTo(width, TAB_H, width, TAB_H + r)
  path.lineTo(width, height - r)
  path.quadTo(width, height, width - r, height)
  path.lineTo(r, height)
  path.quadTo(0, height, 0, height - r)
  path.lineTo(0, r)
  path.quadTo(0, 0, r, 0)
  path.lineTo(-r + tabWidth, 0)
  path.quadTo(tabWidth, 0, tabWidth, r)
  path.lineTo(tabWidth, TAB_H - r)
  path.quadTo(tabWidth, TAB_H, tabWidth + r, TAB_H)
  path.close()

  return path
}

/**
 * Checks whether the node is wide enough to display the large tab.
 * @param w The node width.
 */
function displayTextInTab(w: number): boolean {
  return w >= TAB_W + OUTER_RADIUS + OUTER_RADIUS
}
