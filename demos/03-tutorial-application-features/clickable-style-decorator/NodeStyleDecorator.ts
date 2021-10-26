/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ICanvasContext,
  IHitTestable,
  IInputModeContext,
  ImageNodeStyle,
  IMarqueeTestable,
  INode,
  INodeStyle,
  IRectangle,
  IRenderContext,
  IVisibilityTestable,
  NodeStyleBase,
  Point,
  Rect,
  ShapeNodeStyle,
  SimpleNode,
  SvgVisual,
  SvgVisualGroup,
  Visual
} from 'yfiles'

/**
 * This node style decorator adds an image in the upper right corner of a given node style.
 *
 * The {@link ImageNodeStyle} class is used to render the decoration image.
 *
 * This style overrides {@link IVisibilityTestable#isVisible} with a custom implementation that also
 * checks the visibility of the decoration image in addition to calling the implementation of the decorated style.
 *
 * Other checks like {@link IHitTestable#isHit} and {@link IMarqueeTestable#isInBox} are
 * simply delegated to the base style in order to not make the node selectable by clicking or marquee selecting the
 * decoration image part of the visualization. If desired, this feature can be implemented like demonstrated in
 * {@link NodeStyleDecorator#isVisible}.
 */
export default class NodeStyleDecorator extends NodeStyleBase {
  baseStyle: INodeStyle
  imageUrl: string | null
  imageStyle: ImageNodeStyle
  dummyDecorationNode: SimpleNode

  /**
   * Initializes a new instance of this class.
   * @param baseStyle The optional base style.
   * @param imageUrl The URL of the image to use for the decoration.
   */
  constructor(baseStyle: INodeStyle, imageUrl: string | null) {
    super()
    this.baseStyle = baseStyle || new ShapeNodeStyle()
    this.imageUrl = imageUrl || null
    this.imageStyle = new ImageNodeStyle()

    // This dummy node is passed to the image node style to render the decoration image.
    // Its size is the size of the decoration. Its location is adjusted during each createVisual
    // and updateVisual.
    this.dummyDecorationNode = new SimpleNode()
    this.dummyDecorationNode.layout = new Rect(0, 0, 32, 32)
  }

  /**
   * Creates a new visual as combination of the base node visualization and the decoration.
   * @param context The render context.
   * @param node The node to which this style instance is assigned.
   * @return The created visual.
   * @see NodeStyleBase#createVisual
   */
  createVisual(context: IRenderContext, node: INode): Visual {
    if (this.imageUrl === null) {
      return this.baseStyle.renderer
        .getVisualCreator(node, this.baseStyle)
        .createVisual(context) as SvgVisual
    }

    const layout = node.layout.toRect()

    // create the base visualization
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(node, this.baseStyle)
      .createVisual(context) as SvgVisual

    // create the decoration
    this.imageStyle.image = this.imageUrl
    this.dummyDecorationNode.layout = this.getDecorationLayout(layout)
    const decorationRenderer = this.imageStyle.renderer.getVisualCreator(
      this.dummyDecorationNode,
      this.imageStyle
    )
    const decorationVisual = decorationRenderer.createVisual(context) as SvgVisual

    // add both to a group
    const group = new SvgVisualGroup()
    group.add(baseVisual)
    group.add(decorationVisual)

    // save image URL with the visual for the update method
    ;(group as any)['data-renderDataCache'] = {
      imageUrl: this.imageUrl
    }

    return group
  }

  /**
   * Updates the provided visual.
   * @param context The render context.
   * @param oldVisual The visual that has been created in the call to {@link NodeStyleBase#createVisual}.
   * @param node The node to which this style instance is assigned.
   * @return The updated visual.
   * @see NodeStyleBase#updateVisual
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisual, node: INode): SvgVisual {
    if (this.imageUrl === null) {
      return this.baseStyle.renderer
        .getVisualCreator(node, this.baseStyle)
        .updateVisual(context, oldVisual) as SvgVisual
    }

    const layout = node.layout.toRect()

    // check whether the elements are as expected
    const children = (oldVisual as SvgVisualGroup).children
    if (children.size !== 2) {
      return this.createVisual(context, node) as SvgVisual
    }

    // update the base visual
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(node, this.baseStyle)
      .updateVisual(context, children.get(0)) as SvgVisual
    // check whether the updateVisual method created a new element and replace the old one if needed
    if (baseVisual !== children.get(0)) {
      children.set(0, baseVisual)
    }

    // update the decoration visual
    const oldRenderData = (oldVisual as any)['data-renderDataCache']
    // first, check whether the image URL changed
    if (this.imageUrl !== oldRenderData.imageUrl) {
      this.imageStyle.image = this.imageUrl
    }

    this.dummyDecorationNode.layout = this.getDecorationLayout(layout)
    const decorationRenderer = this.imageStyle.renderer.getVisualCreator(
      this.dummyDecorationNode,
      this.imageStyle
    )
    const decorationVisual = decorationRenderer.updateVisual(context, children.get(1)) as SvgVisual
    if (decorationVisual !== children.get(1)) {
      // check whether the updateVisual method created a new element and replace the old one if needed
      children.set(1, decorationVisual)
    }

    // update the stored image URL for the next update visual call
    ;(oldVisual as any)['data-renderDataCache'] = {
      imageUrl: this.imageUrl
    }

    return oldVisual
  }

  /**
   * Returns the layout of the decoration for the given node layout.
   * @param nodeLayout The layout of the node.
   * @return The layout of the decoration for the given node layout.
   */
  getDecorationLayout(nodeLayout: IRectangle): Rect {
    const size = this.dummyDecorationNode.layout.toSize()
    return new Rect(
      nodeLayout.x + (nodeLayout.width - size.width * 0.5),
      nodeLayout.y - size.height * 0.5,
      size.width,
      size.height
    )
  }

  /**
   * Returns whether at least one of the base visualization and the decoration is visible.
   * @param context The canvas context.
   * @param rectangle The clipping rectangle.
   * @param node The node to which this style instance is assigned.
   * @return <code>true</code> if either the base visualization or the decoration is visible.
   * @see NodeStyleBase#isVisible
   */
  isVisible(context: ICanvasContext, rectangle: Rect, node: INode): boolean {
    return (
      this.baseStyle.renderer
        .getVisibilityTestable(node, this.baseStyle)
        .isVisible(context, rectangle) ||
      rectangle.intersects(this.getDecorationLayout(node.layout))
    )
  }

  /**
   * Returns whether the base visualization is hit.
   * @param context The context.
   * @param location The point to test.
   * @param node The node to which this style instance is assigned.
   * @return <code>true</code> if the base visualization is hit.
   * @see NodeStyleBase#isHit
   */
  isHit(context: IInputModeContext, location: Point, node: INode): boolean {
    // Because we want the decorator to be clickable we need to explicitly check if it was hit.
    const decoratorHit = this.getDecorationLayout(node.layout).contains(location)
    return (
      this.baseStyle.renderer.getHitTestable(node, this.baseStyle).isHit(context, location) ||
      decoratorHit
    )
  }

  /**
   * Returns whether the base visualization is in the box, we don't want the decoration to be marquee selectable.
   * @param context The input mode context.
   * @param rectangle The marquee selection box.
   * @param node The node to which this style instance is assigned.
   * @return <code>true</code> if the base visualization is hit.
   * @see NodeStyleBase#isInBox
   */
  isInBox(context: IInputModeContext, rectangle: Rect, node: INode): boolean {
    // return only box containment test of baseStyle - we don't want the decoration to be marquee selectable
    return this.baseStyle.renderer
      .getMarqueeTestable(node, this.baseStyle)
      .isInBox(context, rectangle)
  }

  /**
   * Gets the intersection of a line with the visual representation of the node.
   * @param node The node to which this style instance is assigned.
   * @param inner The coordinates of a point lying
   *   {@link NodeStyleBase#isInside inside} the shape.
   * @param outer The coordinates of a point lying outside the shape.
   * @return The intersection point if one has been found or <code>null</code>, otherwise.
   * @see NodeStyleBase#getIntersection
   */
  getIntersection(node: INode, inner: Point, outer: Point): Point | null {
    return this.baseStyle.renderer
      .getShapeGeometry(node, this.baseStyle)
      .getIntersection(inner, outer)
  }

  /**
   * Returns whether the provided point is inside of the base visualization.
   * @param node The node to which this style instance is assigned.
   * @param location The point to test.
   * @return <code>true</code> if the provided location is inside of the base visualization.
   * @see NodeStyleBase#isInside
   */
  isInside(node: INode, location: Point): boolean {
    // return only inside test of baseStyle
    return this.baseStyle.renderer.getShapeGeometry(node, this.baseStyle).isInside(location)
  }
}
