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
  SimpleNode,
  SvgVisual,
  SvgVisualGroup,
  Visual
} from '@yfiles/yfiles'
/**
 * This node style decorator adds an image in the upper right corner of a given node style.
 *
 * The {@link ImageNodeStyle} class is used to render the decoration image.
 *
 * This style overrides {@link IVisibilityTestable.isVisible} with a custom implementation that also
 * checks the visibility of the decoration image in addition to calling the implementation of the decorated style.
 *
 * Other checks like {@link IHitTestable.isHit} and {@link IMarqueeTestable.isInBox} are
 * simply delegated to the base style to prevent the node from being selected by clicking or marquee selecting the
 * decoration image part of the visualization. If desired, this feature can be implemented as demonstrated in
 * {@link NodeStyleDecorator.isVisible}.
 */
export class NodeStyleDecorator extends NodeStyleBase {
  baseStyle
  imageUrl
  imageStyle = new ImageNodeStyle()
  // This dummy node is passed to the image node style to render the decoration image.
  // Its size is the size of the decoration. Its location is adjusted during each createVisual
  // and updateVisual.
  dummyDecorationNode = new SimpleNode()
  /**
   * Initializes a new instance of this class.
   * @param baseStyle The base style.
   * @param imageUrl The URL of the image to use for the decoration.
   */
  constructor(baseStyle, imageUrl) {
    super()
    this.baseStyle = baseStyle
    this.imageUrl = imageUrl
    this.dummyDecorationNode.layout = new Rect(0, 0, 32, 32)
  }
  /**
   * Creates a new visual as combination of the base node visualization and the decoration.
   * @param context The render context.
   * @param node The node to which this style instance is assigned.
   * @returns The created visual.
   * @see {@link NodeStyleBase.createVisual}
   */
  createVisual(context, node) {
    if (!this.imageUrl) {
      return this.baseStyle.renderer.getVisualCreator(node, this.baseStyle).createVisual(context)
    }
    const layout = node.layout.toRect()
    // create the base visualization
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(node, this.baseStyle)
      .createVisual(context)
    // create the decoration
    this.imageStyle.href = this.imageUrl
    this.dummyDecorationNode.layout = this.getDecorationLayout(layout)
    const decorationRenderer = this.imageStyle.renderer.getVisualCreator(
      this.dummyDecorationNode,
      this.imageStyle
    )
    const decorationVisual = decorationRenderer.createVisual(context)
    // add both to a group
    const group = new SvgVisualGroup()
    group.add(baseVisual)
    group.add(decorationVisual)
    group['data-renderDataCache'] = {
      imageUrl: this.imageUrl
    }
    return group
  }
  /**
   * Updates the provided visual.
   * @param context The render context.
   * @param oldVisual The visual that has been created in the call to
   *        {@link NodeStyleBase.createVisual}.
   * @param node The node to which this style instance is assigned.
   * @returns The updated visual.
   * @see {@link NodeStyleBase.updateVisual}
   */
  updateVisual(context, oldVisual, node) {
    if (!this.imageUrl) {
      return this.baseStyle.renderer
        .getVisualCreator(node, this.baseStyle)
        .updateVisual(context, oldVisual)
    }
    const layout = node.layout.toRect()
    // check whether the elements are as expected
    if (!(oldVisual instanceof SvgVisualGroup) || oldVisual.children.size !== 2) {
      return this.createVisual(context, node)
    }
    // update the base visual
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(node, this.baseStyle)
      .updateVisual(context, oldVisual.children.get(0))
    // check whether the updateVisual method created a new element and replace the old one if needed
    if (baseVisual !== oldVisual.children.get(0)) {
      oldVisual.children.set(0, baseVisual)
    }
    // update the decoration visual
    const oldRenderData = oldVisual['data-renderDataCache']
    // first, check whether the image URL changed
    if (this.imageUrl !== oldRenderData.imageUrl) {
      this.imageStyle.href = this.imageUrl
    }
    this.dummyDecorationNode.layout = this.getDecorationLayout(layout)
    const decorationRenderer = this.imageStyle.renderer.getVisualCreator(
      this.dummyDecorationNode,
      this.imageStyle
    )
    const decorationVisual = decorationRenderer.updateVisual(context, oldVisual.children.get(1))
    if (decorationVisual !== oldVisual.children.get(1)) {
      // check whether the updateVisual method created a new element and replace the old one if needed
      oldVisual.children.set(1, decorationVisual)
    }
    // update the stored image URL for the next update visual call
    oldVisual['data-renderDataCache'] = {
      imageUrl: this.imageUrl
    }
    return oldVisual
  }
  /**
   * Returns the layout of the decoration for the given node layout.
   * @param nodeLayout The layout of the node.
   * @returns The layout of the decoration for the given node layout.
   */
  getDecorationLayout(nodeLayout) {
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
   * @returns `true` if either the base visualization or the decoration is visible.
   * @see {@link NodeStyleBase.isVisible}
   */
  isVisible(context, rectangle, node) {
    return (
      this.baseStyle.renderer
        .getVisibilityTestable(node, this.baseStyle)
        .isVisible(context, rectangle) ||
      rectangle.intersects(this.getDecorationLayout(node.layout))
    )
  }
  /**
   * Returns whether the base visualization is hit, we don't want the decoration to be hit testable.
   * @param context The context.
   * @param location The point to test.
   * @param node The node to which this style instance is assigned.
   * @returns `true` if the base visualization is hit.
   * @see {@link NodeStyleBase.isHit}
   */
  isHit(context, location, node) {
    return this.baseStyle.renderer.getHitTestable(node, this.baseStyle).isHit(context, location)
  }
  /**
   * Returns whether the base visualization is in the box, we don't want the decoration to be marquee selectable.
   * @param context The input mode context.
   * @param rectangle The marquee selection box.
   * @param node The node to which this style instance is assigned.
   * @returns `true` if the base visualization is hit.
   * @see {@link NodeStyleBase.isInBox}
   */
  isInBox(context, rectangle, node) {
    // return only box containment test of baseStyle - we don't want the decoration to be marquee selectable
    return this.baseStyle.renderer
      .getMarqueeTestable(node, this.baseStyle)
      .isInBox(context, rectangle)
  }
  /**
   * Gets the intersection of a line with the visual representation of the node.
   * @param node The node to which this style instance is assigned.
   * @param inner The coordinates of a point lying
   *   {@link NodeStyleBase.isInside inside} the shape.
   * @param outer The coordinates of a point lying outside the shape.
   * @returns The intersection point if one has been found or `null`, otherwise.
   * @see {@link NodeStyleBase.getIntersection}
   */
  getIntersection(node, inner, outer) {
    return this.baseStyle.renderer
      .getShapeGeometry(node, this.baseStyle)
      .getIntersection(inner, outer)
  }
  /**
   * Returns whether the provided point is inside of the base visualization.
   * @param node The node to which this style instance is assigned.
   * @param location The point to test.
   * @returns `true` if the provided location is inside of the base visualization.
   * @see {@link NodeStyleBase.isInside}
   */
  isInside(node, location) {
    // return only inside test of baseStyle
    return this.baseStyle.renderer.getShapeGeometry(node, this.baseStyle).isInside(location)
  }
}
