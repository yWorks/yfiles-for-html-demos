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
import {
  Color,
  HtmlCanvasVisual,
  IInputModeContext,
  INode,
  IRectangle,
  IRenderContext,
  IVisualCreator,
  NodeStyleBase,
  Point,
  Rect,
  Visual
} from 'yfiles'

/**
 * A simple HTML5 Canvas node style that draws a rectangle with a solid fill.
 */
export default class SimpleCanvasNodeStyle extends NodeStyleBase {
  constructor(private readonly color: Color) {
    super()
  }

  /**
   * Creates the visual representation for the given node.
   * @param renderContext The render context.
   * @param node The node to which this style instance is assigned.
   * @returns The visual as required by the {@link IVisualCreator.createVisual} interface.
   * @see {@link SimpleCanvasNodeStyle.updateVisual}
   */
  createVisual(renderContext: IRenderContext, node: INode): Visual {
    return new NodeRenderVisual(node.layout, this.color)
  }

  /**
   * Updates the visual representation for the given node.
   * @param renderContext The render context.
   * @param oldVisual The visual that has been created in the call to
   * {@link SimpleCanvasNodeStyle.createVisual}.
   * @param node The node to which this style instance is assigned.
   * @returns The visual as required by the {@link IVisualCreator.createVisual} interface.
   * @see {@link SimpleCanvasNodeStyle.createVisual}
   */
  updateVisual(renderContext: IRenderContext, oldVisual: Visual, node: INode): Visual {
    return oldVisual
  }

  /**
   * Determines whether the visual representation of the node has been hit at the given location.
   * Optimized implementation for a rectangular shape.
   * @see Overrides {@link NodeStyleBase.isHit}
   * @param context The input mode context.
   * @param p The location to be checked.
   * @param node The node that may be hit.
   */
  isHit(context: IInputModeContext, p: Point, node: INode): boolean {
    return node.layout.toRect().containsWithEps(p, context.hitTestRadius)
  }

  /**
   * Gets the intersection of a line with the visual representation of the node.
   * Optimized implementation for a rectangular shape.
   * @see Overrides {@link NodeStyleBase.getIntersection}
   * @param node The node.
   * @param inner The inner point of the line.
   * @param outer The outer point of the line.
   */
  getIntersection(node: INode, inner: Point, outer: Point): Point | null {
    return node.layout.toRect().findLineIntersection(inner, outer)
  }

  /**
   * Determines whether the provided point is geometrically inside the visual bounds of the node.
   * Optimized implementation for a rectangular shape.
   * @see Overrides {@link NodeStyleBase.isInside}
   * @param node The node.
   * @param point The point to be checked.
   */
  isInside(node: INode, point: Point): boolean {
    return node.layout.toRect().contains(point)
  }

  /**
   * Determines whether the visualization for the specified node is included in the marquee selection.
   * Optimized implementation for a rectangular shape.
   * @see Overrides {@link NodeStyleBase.isInBox}
   * @param context The input mode context.
   * @param box the rectangle to be checked.
   * @param node The node that may be in the rectangle.
   */
  isInBox(context: IInputModeContext, box: Rect, node: INode): boolean {
    return box.contains(node.layout)
  }
}

/**
 * For HTML5 Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class NodeRenderVisual extends HtmlCanvasVisual {
  private readonly color: string

  /**
   * Creates an instance of the render visual.
   * @param layout A live view of the layout of a node.
   * @param color The color for the node.
   */
  constructor(
    private readonly layout: IRectangle,
    color: Color
  ) {
    super()
    this.color = `rgba(${color.r},${color.g},${color.b},${color.a})`
  }

  /**
   * Draw a simple rectangle with a solid orange fill.
   * @param context The render context.
   * @param htmlCanvasContext The html canvas context.
   * @see Overrides {@link HtmlCanvasVisual.paint}
   */
  paint(context: IRenderContext, htmlCanvasContext: CanvasRenderingContext2D): void {
    htmlCanvasContext.fillStyle = this.color
    htmlCanvasContext.fillRect(this.layout.x, this.layout.y, this.layout.width, this.layout.height)
  }
}
