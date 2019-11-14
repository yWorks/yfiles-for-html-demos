/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * This label style decorator shows how to decorate another label style.
   */
  class LabelStyleDecorator extends yfiles.styles.LabelStyleBase {
    /**
     * Initializes a new instance of this class.
     * @param {yfiles.styles.ILabelStyle} baseStyle The optional base style.
     */
    constructor(baseStyle) {
      super()
      this.baseStyle = baseStyle || new yfiles.styles.DefaultLabelStyle()
    }

    /**
     * Creates a new visual as combination of the base label visualization and the decoration.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @returns {yfiles.view.Visual} The created visual.
     * @see yfiles.styles.LabelStyleBase#createVisual
     */
    createVisual(context, label) {
      const group = new yfiles.view.SvgVisualGroup()

      // create the base visualization
      const baseVisual = this.baseStyle.renderer
        .getVisualCreator(label, this.baseStyle)
        .createVisual(context)
      group.add(baseVisual)

      // create the decoration
      group.add(LabelStyleDecorator.createDecoration(label.layout))

      return group
    }

    /**
     * Updates the provided visual.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.view.Visual|yfiles.view.SvgVisualGroup} oldVisual The visual that has been created in the call to
     *        {@link yfiles.styles.LabelStyleBase#createVisual}.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @returns {yfiles.view.Visual} The updated visual.
     * @see yfiles.styles.LabelStyleBase#updateVisual
     */
    updateVisual(context, oldVisual, label) {
      // check whether the elements are as expected
      if (oldVisual.children.size !== 2) {
        return this.createVisual(context, label)
      }

      // update the base visual
      const baseVisual = this.baseStyle.renderer
        .getVisualCreator(label, this.baseStyle)
        .updateVisual(context, oldVisual.children.get(0))
      // check whether the updateVisual method created a new element and replace the old one if needed
      if (baseVisual !== oldVisual.children.get(0)) {
        oldVisual.children.set(0, baseVisual)
      }

      // update the decoration visual
      LabelStyleDecorator.updateDecoration(label.layout, oldVisual.children.get(1))

      return oldVisual
    }

    /**
     * Creates the visualization of the decoration.
     * @param {yfiles.geometry.IOrientedRectangle} layout The label layout.
     * @return {yfiles.view.SvgVisual} The visual that provides the decoration.
     */
    static createDecoration(layout) {
      const padding = 3
      const line1 = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line1.x1.baseVal.value = -padding
      line1.x2.baseVal.value = layout.width + padding
      line1.y1.baseVal.value = -padding + 2
      line1.y2.baseVal.value = -padding + 2
      line1.setAttribute('stroke', '#336699')
      line1.setAttribute('stroke-width', '2')

      const line2 = window.document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line2.x1.baseVal.value = -padding
      line2.x2.baseVal.value = layout.width + padding
      line2.y1.baseVal.value = layout.height + padding
      line2.y2.baseVal.value = layout.height + padding
      line2.setAttribute('stroke', '#336699')
      line2.setAttribute('stroke-width', '2')

      const group = window.document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.appendChild(line1)
      group.appendChild(line2)

      // move the group to correct location
      const transform = yfiles.styles.LabelStyleBase.createLayoutTransform(layout, true)
      transform.applyTo(group)

      return new yfiles.view.SvgVisual(group)
    }

    /**
     * Updates the visualization of the decoration.
     * @param {yfiles.geometry.IOrientedRectangle} layout The label layout.
     * @param {yfiles.view.SvgVisualGroup} visualGroup The visual that that provides the decoration.
     */
    static updateDecoration(layout, visualGroup) {
      const group = visualGroup.svgElement

      const padding = 3
      const line1 = group.childNodes[0]
      const line2 = group.childNodes[1]
      line1.x2.baseVal.value = layout.width + padding
      line2.y1.baseVal.value = layout.height + padding
      line2.x2.baseVal.value = layout.width + padding
      line2.y2.baseVal.value = layout.height + padding

      // move the group to correct location
      const transform = yfiles.styles.LabelStyleBase.createLayoutTransform(layout, true)
      transform.applyTo(group)
    }

    /**
     * Returns the preferred {@link yfiles.geometry.Size size} of the base style for the provided label.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @returns {yfiles.geometry.Size} The preferred size.
     * @see yfiles.styles.LabelStyleBase#getPreferredSize
     */
    getPreferredSize(label) {
      return this.baseStyle.renderer.getPreferredSize(label, this.baseStyle)
    }

    /**
     * Returns the bounds provided by the base style for the label.
     *
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @returns {yfiles.geometry.Rect} The visual bounds.
     * @override
     * @see yfiles.styles.LabelStyleBase#getBounds
     */
    getBounds(context, label) {
      return this.baseStyle.renderer.getBoundsProvider(label, this.baseStyle).getBounds(context)
    }

    /**
     * Returns whether the base visualization is visible.
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @param {yfiles.geometry.Rect} rectangle The clipping rectangle.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @return {boolean} <code>true</code> if either the base visualization or the decoration is visible.
     * @see yfiles.styles.LabelStyleBase#isVisible
     */
    isVisible(context, rectangle, label) {
      return this.baseStyle.renderer
        .getVisibilityTestable(label, this.baseStyle)
        .isVisible(context, rectangle)
    }

    /**
     * Returns whether the base visualization is hit, we don't want the decoration to be hit testable.
     *
     * @param {yfiles.input.IInputModeContext} context The context.
     * @param {yfiles.geometry.Point} location The point to test.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @return {boolean} <code>true</code> if the base visualization is hit.
     * @override
     * @see yfiles.styles.LabelStyleBase#isHit
     */
    isHit(context, location, label) {
      return this.baseStyle.renderer.getHitTestable(label, this.baseStyle).isHit(context, location)
    }

    /**
     * Returns whether the base visualization is in the box, we don't want the decoration to be marquee selectable.
     * @param {yfiles.input.IInputModeContext} context The input mode context.
     * @param {yfiles.geometry.Rect} rectangle The marquee selection box.
     * @param {yfiles.graph.ILabel} label The label to which this style instance is assigned.
     * @return {boolean} <code>true</code> if the base visualization is hit.
     * @override
     * @see yfiles.styles.LabelStyleBase#isInBox
     */
    isInBox(context, rectangle, label) {
      // return only box containment test of baseStyle - we don't want the decoration to be marquee selectable
      return this.baseStyle.renderer
        .getMarqueeTestable(label, this.baseStyle)
        .isInBox(context, rectangle)
    }

    /**
     * Delegates the lookup to the base style.
     *
     * @param {yfiles.graph.ILabel} label The label to use for the context lookup.
     * @param {yfiles.lang.Class} type The type to query.
     * @returns {Object} An implementation of the <code>type</code> or <code>null</code>.
     * @see yfiles.styles.EdgeStyleBase#lookup
     */
    lookup(label, type) {
      return this.baseStyle.renderer.getContext(label, this.baseStyle).lookup(type)
    }
  }

  return LabelStyleDecorator
})
