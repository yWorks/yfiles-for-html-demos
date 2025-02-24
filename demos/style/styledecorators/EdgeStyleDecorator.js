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
  BendAnchoredPortLocationModel,
  Color,
  EdgeStyleBase,
  ICanvasContext,
  IEdge,
  IInputModeContext,
  IPortStyle,
  IRenderContext,
  ShapePortStyle,
  Point,
  PolylineEdgeStyle,
  Rect,
  SimplePort,
  Size,
  Stroke,
  SvgVisual,
  SvgVisualGroup,
  Visual
} from '@yfiles/yfiles'
/**
 * This edge style decorator shows how to decorate an edge style with bends that are rendered by a port style.
 *
 * This implementation wraps {@link PolylineEdgeStyle}.
 *
 * The {@link PolylineEdgeStyle.stroke} of the wrapped style is modified based on the value stored
 * in the edge's tag. An arbitrary {@link IPortStyle port style}, that can be set in the
 * constructor, is used to render the edge's bend, a
 */
export default class EdgeStyleDecorator extends EdgeStyleBase {
  bendStyle
  baseStyle
  /**
   * Initializes a new instance of this class.
   * @param bendStyle A port style that is used to draw the bends.
   */
  constructor(bendStyle) {
    super()
    this.bendStyle = bendStyle
    const baseStyle = new PolylineEdgeStyle()
    baseStyle.smoothingLength = 5.0
    this.baseStyle = baseStyle
  }
  /**
   * Creates a new visual as combination of the base edge visualization and the bend visualizations.
   * @param context The render context.
   * @param edge The edge to which this style instance is assigned.
   * @returns The created visual.
   * @see EdgeStyleBase#createVisual
   */
  createVisual(context, edge) {
    // create container
    const group = new SvgVisualGroup()
    // delegate rendering
    this.baseStyle.stroke = EdgeStyleDecorator.getStroke(edge.tag)
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(edge, this.baseStyle)
      .createVisual(context)
    group.add(baseVisual)
    const bendGroup = new SvgVisualGroup()
    group.add(bendGroup)
    this.renderBends(context, bendGroup, edge)
    return group
  }
  /**
   * Updates the provided visual.
   * @param context The render context.
   * @param oldVisual The visual that has been created in the call to {@link EdgeStyleBase.createVisual}.
   * @param edge The edge to which this style instance is assigned.
   * @returns The updated visual.
   * @see EdgeStyleBase#updateVisual
   */
  updateVisual(context, oldVisual, edge) {
    // check whether the elements are as expected
    if (!(oldVisual instanceof SvgVisualGroup) || oldVisual.children.size !== 2) {
      return this.createVisual(context, edge)
    }
    let baseVisual = oldVisual.children.get(0)
    // delegate update
    this.baseStyle.stroke = EdgeStyleDecorator.getStroke(edge.tag)
    baseVisual = this.baseStyle.renderer
      .getVisualCreator(edge, this.baseStyle)
      .updateVisual(context, baseVisual)
    if (oldVisual.children.get(0) !== baseVisual) {
      oldVisual.children.set(0, baseVisual)
    }
    const bendGroup = oldVisual.children.get(1)
    this.renderBends(context, bendGroup, edge)
    return oldVisual
  }
  /**
   * Renders the edge's bends, using {@link EdgeStyleDecorator.bendStyle} and dummy ports.
   * @param context The render context.
   * @param group The group element.
   * @param edge The edge.
   */
  renderBends(context, group, edge) {
    const bends = edge.bends
    // remove surplus visuals
    while (group.children.size > bends.size) {
      // remove last child
      group.remove(group.children.get(group.children.size - 1))
    }
    const bendStyle = this.bendStyle
    const stroke = this.baseStyle.stroke
    if (bendStyle instanceof ShapePortStyle) {
      const diameter = stroke.thickness * 2
      bendStyle.renderSize = new Size(diameter, diameter)
      bendStyle.fill = stroke.fill
    }
    // update existing bend visuals
    const dummyPort = new SimplePort(edge)
    const portLocationModel = BendAnchoredPortLocationModel.INSTANCE
    for (let i = 0; i < group.children.size; i++) {
      // place the dummy port at the bend's location
      dummyPort.locationParameter = portLocationModel.createParameterFromSource(i - 1)
      // update the dummy port visual
      const visual = bendStyle.renderer
        .getVisualCreator(dummyPort, bendStyle)
        .updateVisual(context, group.children.get(i))
      // switch instances if necessary
      if (group.children.get(i) !== visual) {
        group.children.set(i, visual)
      }
    }
    // add missing visuals
    for (let i = group.children.size; i < bends.size; i++) {
      // place the dummy port at the bend's location
      dummyPort.locationParameter = portLocationModel.createParameterFromSource(i - 1)
      // render the dummy port visual
      const bendVisual = bendStyle.renderer
        .getVisualCreator(dummyPort, bendStyle)
        .createVisual(context)
      group.children.add(bendVisual)
    }
  }
  /**
   * Returns a stroke for the provided data.
   * @param data A custom data object.
   * @returns The stroke for the provided data.
   */
  static getStroke(data) {
    switch (data) {
      case 'TRAFFIC_VERY_HIGH':
        return new Stroke('#db3a34', 3.5)
      case 'TRAFFIC_HIGH':
        return new Stroke('#ff6c00', 2.5)
      case 'TRAFFIC_LOW':
        return new Stroke('#c1c1c1', 1.5)
      case 'TRAFFIC_NORMAL':
      default:
        return new Stroke(Color.BLACK, 1.5)
    }
  }
  /**
   * Returns the bounds provided by the base style for the edge.
   * @param context The canvas context.
   * @param edge The edge to which this style instance is assigned.
   * @returns The visual bounds.
   * @override
   * @see EdgeStyleBase#getBounds
   */
  getBounds(context, edge) {
    return this.baseStyle.renderer.getBoundsProvider(edge, this.baseStyle).getBounds(context)
  }
  /**
   * Returns whether the base visualization for the specified edge is visible.
   * @param context The canvas context.
   * @param rectangle The clipping rectangle.
   * @param edge The edge to which this style instance is assigned.
   * @returns `true` if the specified edge is visible in the clipping rectangle;
   *   `false` otherwise.
   * @override
   * @see EdgeStyleBase#isInside
   */
  isVisible(context, rectangle, edge) {
    return this.baseStyle.renderer
      .getVisibilityTestable(edge, this.baseStyle)
      .isVisible(context, rectangle)
  }
  /**
   * Returns whether the base visualization is hit.
   * @param context The context.
   * @param location The point to test.
   * @param edge The edge to which this style instance is assigned.
   * @returns `true` if the base visualization is hit.
   * @see EdgeStyleBase#isHit
   */
  isHit(context, location, edge) {
    return this.baseStyle.renderer.getHitTestable(edge, this.baseStyle).isHit(context, location)
  }
  /**
   * Returns whether the base visualization is in the box.
   * @param context The input mode context.
   * @param rectangle The marquee selection box.
   * @param edge The edge to which this style instance is assigned.
   * @returns `true` if the base visualization is hit.
   * @see EdgeStyleBase#isInBox
   */
  isInBox(context, rectangle, edge) {
    // return only box containment test of baseStyle - we don't want the decoration to be marquee selectable
    return this.baseStyle.renderer
      .getMarqueeTestable(edge, this.baseStyle)
      .isInBox(context, rectangle)
  }
  /**
   * Delegates the lookup to the base style.
   * @param edge The edge to use for the context lookup.
   * @param type The type to query.
   * @returns An implementation of the `type` or `null`.
   * @see EdgeStyleBase#lookup
   */
  lookup(edge, type) {
    return this.baseStyle.renderer.getContext(edge, this.baseStyle).lookup(type)
  }
}
