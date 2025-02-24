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
import {
  Color,
  IInputModeContext,
  INode,
  IRenderContext,
  IVisualCreator,
  NodeStyleBase,
  Point,
  Rect,
  SvgVisual,
  type TaggedSvgVisual
} from '@yfiles/yfiles'

/**
 * Augment the SvgVisual type with the data used to cache the rendering information
 */
type Cache = {
  x: number
  y: number
  width: number
  height: number
}
type SimpleSvgNodeStyleVisual = TaggedSvgVisual<SVGRectElement, Cache>

/**
 * A simple SVG node style consisting of one filled rect element.
 */
export default class SimpleSvgNodeStyle extends NodeStyleBase<SimpleSvgNodeStyleVisual> {
  /**
   * Constructs a node style with the given color or a magenta node style if no color is defined.
   * @param color The fill color for the node.
   */
  constructor(private readonly color?: Color) {
    super()
    this.color = color || Color.from('#AB2346')
  }

  /**
   * Creates the visual representation for the given node.
   * @param context The render context.
   * @param node The node to which this style instance is assigned.
   * @returns The visual as required by the {@link IVisualCreator.createVisual} interface.
   * @see {@link SimpleSvgNodeStyle.updateVisual}
   */
  createVisual(context: IRenderContext, node: INode): SimpleSvgNodeStyleVisual {
    const { x, y, width, height } = node.layout
    const color = this.color!

    // create a rect element
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', `${width}`)
    rect.setAttribute('height', `${height}`)
    rect.setAttribute('fill', `rgba(${color.r},${color.g},${color.b},${color.a / 255})`)

    // set the translation using a utility method for improved performance
    SvgVisual.setTranslate(rect, x, y)

    // store the data with which we created the rect so we can efficiently update it later
    return SvgVisual.from(rect, { x, y, width, height })
  }

  /**
   * Updates the visual representation for the given node.
   * @param context The render context.
   * @param oldVisual The visual that has been created in the call to
   * {@link SimpleSvgNodeStyle.createVisual}.
   * @param node The node to which this style instance is assigned.
   * @returns The visual as required by the {@link IVisualCreator.createVisual} interface.
   * @see {@link SimpleSvgNodeStyle.createVisual}
   */
  updateVisual(
    context: IRenderContext,
    oldVisual: SimpleSvgNodeStyleVisual,
    node: INode
  ): SimpleSvgNodeStyleVisual {
    const { x, y, width, height } = node.layout
    // get the rect element
    const rect = oldVisual.svgElement

    // get the cache we stored in CreateVisual
    const cache = oldVisual.tag

    // update width and height only if necessary
    if (cache.width !== width || cache.height !== height) {
      rect.setAttribute('width', `${width}`)
      rect.setAttribute('height', `${height}`)
      cache.width = width
      cache.height = height
    }

    // update the location only if necessary
    if (cache.x !== x || cache.y !== y) {
      SvgVisual.setTranslate(rect, x, y)
      cache.x = x
      cache.y = y
    }

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
    return node.layout.toRect().contains(p, context.hitTestRadius)
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
   * @param rectangle the rectangle to be checked.
   * @param node The node that may be in the rectangle.
   */
  isInBox(context: IInputModeContext, rectangle: Rect, node: INode): boolean {
    return rectangle.containsRectangle(node.layout)
  }
}
