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
import {
  Class,
  EdgeStyleBase,
  ICanvasContext,
  IInputModeContext,
  ILabel,
  ILabelStyle,
  IOrientedRectangle,
  IRenderContext,
  LabelStyleBase,
  Point,
  Rect,
  Size,
  SvgVisual,
  SvgVisualGroup,
  Visual
} from 'yfiles'

const SVG_NS = 'http://www.w3.org/2000/svg'

/**
 * This label style decorator shows how to decorate another label style.
 */
export default class LabelStyleDecorator extends LabelStyleBase {
  /**
   * Initializes a new instance of this class.
   * @param baseStyle The base style.
   */
  constructor(private readonly baseStyle: ILabelStyle) {
    super()
  }

  /**
   * Creates a new visual as combination of the base label visualization and the decoration.
   * @param context The render context.
   * @param label The label to which this style instance is assigned.
   * @return The created visual.
   * @see LabelStyleBase#createVisual
   */
  createVisual(context: IRenderContext, label: ILabel): Visual {
    const group = new SvgVisualGroup()

    // create the base visualization
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(label, this.baseStyle)
      .createVisual(context) as SvgVisual
    group.add(baseVisual)

    // create the decoration
    group.add(LabelStyleDecorator.createDecoration(context, label.layout))

    return group
  }

  /**
   * Updates the provided visual.
   * @param context The render context.
   * @param oldVisual The visual that has been created in the call to
   *        {@link LabelStyleBase#createVisual}.
   * @param label The label to which this style instance is assigned.
   * @return The updated visual.
   * @see LabelStyleBase#updateVisual
   */
  updateVisual(context: IRenderContext, oldVisual: Visual, label: ILabel): Visual {
    // check whether the elements are as expected
    if (!(oldVisual instanceof SvgVisualGroup) || oldVisual.children.size !== 2) {
      return this.createVisual(context, label)
    }

    // update the base visual
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(label, this.baseStyle)
      .updateVisual(context, oldVisual.children.get(0)) as SvgVisual
    // check whether the updateVisual method created a new element and replace the old one if needed
    if (baseVisual !== oldVisual.children.get(0)) {
      oldVisual.children.set(0, baseVisual)
    }

    // update the decoration visual
    LabelStyleDecorator.updateDecoration(
      context,
      label.layout,
      oldVisual.children.get(1) as SvgVisualGroup
    )

    return oldVisual
  }

  /**
   * Creates the visualization of the decoration.
   * @param context The render context.
   * @param layout The label layout.
   * @return The visual that provides the decoration.
   */
  private static createDecoration(context: IRenderContext, layout: IOrientedRectangle): SvgVisual {
    const xPadding = 3
    const yPadding = 5
    const line1 = document.createElementNS(SVG_NS, 'line')
    line1.x1.baseVal.value = -xPadding
    line1.x2.baseVal.value = layout.width + xPadding
    line1.y1.baseVal.value = -yPadding + 2
    line1.y2.baseVal.value = -yPadding + 2
    line1.setAttribute('stroke', '#224556')
    line1.setAttribute('stroke-width', '2')

    const line2 = document.createElementNS(SVG_NS, 'line')
    line2.x1.baseVal.value = -xPadding
    line2.x2.baseVal.value = layout.width + xPadding
    line2.y1.baseVal.value = layout.height + yPadding
    line2.y2.baseVal.value = layout.height + yPadding
    line2.setAttribute('stroke', '#224556')
    line2.setAttribute('stroke-width', '2')

    const group = document.createElementNS(SVG_NS, 'g')
    group.appendChild(line1)
    group.appendChild(line2)

    // move the group to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, layout, true)
    transform.applyTo(group)

    return new SvgVisual(group)
  }

  /**
   * Updates the visualization of the decoration.
   * @param context The render context.
   * @param layout The label layout.
   * @param visualGroup The visual that that provides the decoration.
   */
  private static updateDecoration(
    context: IRenderContext,
    layout: IOrientedRectangle,
    visualGroup: SvgVisualGroup
  ): void {
    const group = visualGroup.svgElement

    const padding = 3
    const line1 = group.childNodes[0] as SVGLineElement
    const line2 = group.childNodes[1] as SVGLineElement
    line1.x2.baseVal.value = layout.width + padding
    line2.y1.baseVal.value = layout.height + padding
    line2.x2.baseVal.value = layout.width + padding
    line2.y2.baseVal.value = layout.height + padding

    // move the group to correct location
    const transform = LabelStyleBase.createLayoutTransform(context, layout, true)
    transform.applyTo(group)
  }

  /**
   * Returns the preferred {@link Size size} of the base style for the provided label.
   * @param label The label to which this style instance is assigned.
   * @return The preferred size.
   * @see LabelStyleBase#getPreferredSize
   */
  getPreferredSize(label: ILabel): Size {
    return this.baseStyle.renderer.getPreferredSize(label, this.baseStyle)
  }

  /**
   * Returns the bounds provided by the base style for the label.
   *
   * @param context The canvas context.
   * @param label The label to which this style instance is assigned.
   * @return The visual bounds.
   * @override
   * @see LabelStyleBase#getBounds
   */
  getBounds(context: ICanvasContext, label: ILabel): Rect {
    return this.baseStyle.renderer.getBoundsProvider(label, this.baseStyle).getBounds(context)
  }

  /**
   * Returns whether the base visualization is visible.
   * @param context The canvas context.
   * @param rectangle The clipping rectangle.
   * @param label The label to which this style instance is assigned.
   * @return <code>true</code> if either the base visualization or the decoration is
   *   visible.
   * @see LabelStyleBase#isVisible
   */
  isVisible(context: ICanvasContext, rectangle: Rect, label: ILabel): boolean {
    return this.baseStyle.renderer
      .getVisibilityTestable(label, this.baseStyle)
      .isVisible(context, rectangle)
  }

  /**
   * Returns whether the base visualization is hit, we don't want the decoration to be hit testable.
   *
   * @param context The context.
   * @param location The point to test.
   * @param label The label to which this style instance is assigned.
   * @return <code>true</code> if the base visualization is hit.
   * @override
   * @see LabelStyleBase#isHit
   */
  isHit(context: IInputModeContext, location: Point, label: ILabel): boolean {
    return this.baseStyle.renderer.getHitTestable(label, this.baseStyle).isHit(context, location)
  }

  /**
   * Returns whether the base visualization is in the box, we don't want the decoration to be
   * marquee selectable.
   * @param context The input mode context.
   * @param rectangle The marquee selection box.
   * @param label The label to which this style instance is assigned.
   * @return <code>true</code> if the base visualization is hit.
   * @override
   * @see LabelStyleBase#isInBox
   */
  isInBox(context: IInputModeContext, rectangle: Rect, label: ILabel): boolean {
    // return only box containment test of baseStyle - we don't want the decoration to be marquee selectable
    return this.baseStyle.renderer
      .getMarqueeTestable(label, this.baseStyle)
      .isInBox(context, rectangle)
  }

  /**
   * Delegates the lookup to the base style.
   *
   * @param label The label to use for the context lookup.
   * @param type The type to query.
   * @return An implementation of the <code>type</code> or <code>null</code>.
   * @see EdgeStyleBase#lookup
   */
  lookup(label: ILabel, type: Class<any>): object | null {
    return this.baseStyle.renderer.getContext(label, this.baseStyle).lookup(type)
  }
}
