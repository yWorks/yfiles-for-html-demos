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
   * This node style decorator adds a circle with a native click listener representing a button.
   *
   * Checks like {@link yfiles.input.IHitTestable#isHit} or {@link yfiles.input.IMarqueeTestable#isInBox} are
   * simply delegated to the base style because the button is placed inside the node layout.
   */
  class NodeStyleDecorator extends yfiles.styles.NodeStyleBase {
    /**
     * Initializes a new instance of this class.
     * @param {yfiles.styles.INodeStyle} baseStyle The optional base style.
     */
    constructor(baseStyle) {
      super()
      this.baseStyle = baseStyle || new yfiles.styles.ShapeNodeStyle()
    }

    /**
     * Creates a new visual as combination of the base node visualization and the decoration.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @returns {yfiles.view.Visual} The created visual.
     * @see yfiles.styles.NodeStyleBase#createVisual
     */
    createVisual(context, node) {
      const layout = node.layout.toRect()

      // create the base visualization
      const baseVisual = this.baseStyle.renderer
        .getVisualCreator(node, this.baseStyle)
        .createVisual(context)

      // create the decoration
      const button = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      button.setAttribute('cx', layout.center.x)
      button.setAttribute('cy', layout.center.y)
      button.setAttribute('rx', 7)
      button.setAttribute('ry', 7)
      button.setAttribute('class', 'button')

      // register a native click listener on the SVG element
      button.addEventListener('click', showToast)
      // the input mode should not handle any event on the the button where we registered a native click listener
      button.addEventListener('mousedown', e => e.preventDefault())

      const decorationVisual = new yfiles.view.SvgVisual(button)

      // add both to a group
      const group = new yfiles.view.SvgVisualGroup()
      group.add(baseVisual)
      group.add(decorationVisual)

      group['render-data-cache'] = {
        cx: layout.center.x,
        cy: layout.center.y
      }

      return group
    }

    /**
     * Updates the provided visual.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.view.Visual|yfiles.view.SvgVisual} oldVisual The visual that has been created in the call to
     *        {@link yfiles.styles.NodeStyleBase#createVisual}.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @returns {yfiles.view.Visual} The updated visual.
     * @see yfiles.styles.NodeStyleBase#updateVisual
     */
    updateVisual(context, oldVisual, node) {
      const layout = node.layout.toRect()

      // check whether the elements are as expected
      if (oldVisual.children.size !== 2) {
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
      const cache = oldVisual['render-data-cache']
      if (cache.cx !== layout.center.x || cache.cy !== layout.center.y) {
        const decorationVisual = oldVisual.children.get(1)
        const button = decorationVisual.svgElement
        button.setAttribute('cx', layout.center.x)
        button.setAttribute('cy', layout.center.y)

        // store the button location in the render data cache
        oldVisual['render-data-cache'] = {
          cx: layout.center.x,
          cy: layout.center.y
        }
      }

      return oldVisual
    }

    /**
     * Returns whether at least one of the base visualization and the decoration is visible.
     * @param {yfiles.view.ICanvasContext} context The canvas context.
     * @param {yfiles.geometry.Rect} rectangle The clipping rectangle.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {boolean} <code>true</code> if either the base visualization or the decoration is visible.
     * @see yfiles.styles.NodeStyleBase#isVisible
     */
    isVisible(context, rectangle, node) {
      return this.baseStyle.renderer
        .getVisibilityTestable(node, this.baseStyle)
        .isVisible(context, rectangle)
    }

    /**
     * Returns whether the base visualization is hit.
     * @param {yfiles.input.IInputModeContext} context The context.
     * @param {yfiles.geometry.Point} location The point to test.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {boolean} <code>true</code> if the base visualization is hit.
     * @see yfiles.styles.NodeStyleBase#isHit
     */
    isHit(context, location, node) {
      return this.baseStyle.renderer.getHitTestable(node, this.baseStyle).isHit(context, location)
    }

    /**
     * Returns whether the base visualization is in the box, we don't want the decoration to be marquee selectable.
     * @param {yfiles.input.IInputModeContext} context The input mode context.
     * @param {yfiles.geometry.Rect} rectangle The marquee selection box.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {boolean} <code>true</code> if the base visualization is hit.
     * @see yfiles.styles.NodeStyleBase#isInBox
     */
    isInBox(context, rectangle, node) {
      return this.baseStyle.renderer
        .getMarqueeTestable(node, this.baseStyle)
        .isInBox(context, rectangle)
    }

    /**
     * Gets the intersection of a line with the visual representation of the node.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @param {yfiles.geometry.Point} inner The coordinates of a point lying {@link yfiles.styles.NodeStyleBase#isInside inside} the shape.
     * @param {yfiles.geometry.Point} outer The coordinates of a point lying outside the shape.
     * @return {yfiles.geometry.Point} The intersection point if one has been found or <code>null</code>, otherwise.
     * @see yfiles.styles.NodeStyleBase#getIntersection
     */
    getIntersection(node, inner, outer) {
      return this.baseStyle.renderer
        .getShapeGeometry(node, this.baseStyle)
        .getIntersection(inner, outer)
    }

    /**
     * Returns whether the provided point is inside of the base visualization.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @param {yfiles.geometry.Point} location The point to test.
     * @return {boolean} <code>true</code> if the provided location is inside of the base visualization.
     * @see yfiles.styles.NodeStyleBase#isInside
     */
    isInside(node, location) {
      return this.baseStyle.renderer.getShapeGeometry(node, this.baseStyle).isInside(location)
    }
  }

  let hideTimer = null
  function showToast() {
    // Shows a toast to indicate the successful click, and hides it again.
    clearTimeout(hideTimer)
    const toast = document.getElementById('toast')
    toast.style.bottom = '40px'
    hideTimer = setTimeout(() => {
      toast.style.bottom = '-50px'
    }, 2000)
  }

  return NodeStyleDecorator
})
