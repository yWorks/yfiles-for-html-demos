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
   * A simple SVG node style consisting of one filled rect element.
   * @extends yfiles.styles.NodeStyleBase
   */
  class SimpleSvgNodeStyle extends yfiles.styles.NodeStyleBase {
    /**
     * Constructs a node style with the given color or an orange node style if no color is defined.
     * @param {yfiles.view.Color} color The fill color for the node.
     */
    constructor(color) {
      super()
      this.color = typeof color !== 'undefined' ? color : new yfiles.view.Color(255, 140, 0)
    }

    /**
     * Callback that creates the visual.
     * This method is called in response to a {@link yfiles.view.IVisualCreator#createVisual}
     * call to the instance that has been queried from the {@link yfiles.styles.NodeStyleBase#renderer}.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {yfiles.view.Visual} The visual as required by the {@link yfiles.view.IVisualCreator#createVisual} interface.
     * @see {@link yfiles.styles.NodeStyleBase#updateVisual}
     */
    createVisual(context, node) {
      const { x, y, width, height } = node.layout

      // create a rect element
      const rect = window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('width', width.toString())
      rect.setAttribute('height', height.toString())
      rect.setAttribute(
        'fill',
        `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a / 255})`
      )

      // set the translation using a utility method for improved performance
      yfiles.view.SvgVisual.setTranslate(rect, x, y)

      // store the data with which we created the rect so we can efficiently update it later
      rect['data-cache'] = { x, y, width, height }

      return new yfiles.view.SvgVisual(rect)
    }

    /**
     * Callback that updates the visual previously created by {@link yfiles.styles.NodeStyleBase#createVisual}.
     * This method is called in response to a {@link yfiles.view.IVisualCreator#updateVisual}
     * call to the instance that has been queried from the {@link yfiles.styles.NodeStyleBase#renderer}.
     * This implementation simply delegates to {@link yfiles.styles.NodeStyleBase#createVisual} so subclasses
     * should override to improve rendering performance.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {yfiles.view.Visual} oldVisual The visual that has been created in the call to {@link yfiles.styles.NodeStyleBase#createVisual}.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {yfiles.view.Visual} The visual as required by the {@link yfiles.view.IVisualCreator#createVisual} interface.
     * @see {@link yfiles.styles.NodeStyleBase#createVisual}
     */
    updateVisual(context, oldVisual, node) {
      const { x, y, width, height } = node.layout
      // get the rect element
      const rect = oldVisual.svgElement

      // get the cache we stored in CreateVisual
      const cache = rect['data-cache']

      // update width and height only if necessary
      if (cache.width !== width || cache.height !== height) {
        rect.setAttribute('width', width.toString())
        rect.setAttribute('height', height.toString())
        cache.width = width
        cache.height = height
      }

      // update the location only if necessary
      if (cache.x !== x || cache.y !== y) {
        yfiles.view.SvgVisual.setTranslate(rect, x, y)
        cache.x = x
        cache.y = y
      }

      return oldVisual
    }

    /**
     * Determines whether the visual representation of the node has been hit at the given location.
     * Optimized implementation for a rectangular shape.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isHit}
     * @param {yfiles.input.IInputModeContext} context The input mode context.
     * @param {yfiles.geometry.Point} p The location to be checked.
     * @param {yfiles.graph.INode} node The node that may be hit.
     * @return {boolean}
     */
    isHit(context, p, node) {
      return node.layout.toRect().containsWithEps(p, context.hitTestRadius)
    }

    /**
     * Gets the intersection of a line with the visual representation of the node.
     * Optimized implementation for a rectangular shape.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#getIntersection}
     * @param {yfiles.graph.INode} node The node.
     * @param {yfiles.geometry.Point} inner The inner point of the line.
     * @param {yfiles.geometry.Point} outer The outer point of the line.
     * @return {yfiles.geometry.Point}
     */
    getIntersection(node, inner, outer) {
      return node.layout.toRect().findLineIntersection(inner, outer)
    }

    /**
     * Determines whether the provided point is geometrically inside the visual bounds of the node.
     * Optimized implementation for a rectangular shape.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isInside}
     * @param {yfiles.graph.INode} node The node.
     * @param {yfiles.geometry.Point} point The point to be checked.
     * @return {boolean}
     */
    isInside(node, point) {
      return node.layout.toRect().contains(point)
    }

    /**
     * Determines whether the visualization for the specified node is included in the marquee selection.
     * Optimized implementation for a rectangular shape.
     * @see Overrides {@link yfiles.styles.NodeStyleBase#isInBox}
     * @param {yfiles.input.IInputModeContext} context The input mode context.
     * @param {yfiles.geometry.Rect} rectangle the rectangle to be checked.
     * @param {yfiles.graph.INode} node The node that may be in the rectangle.
     * @return {boolean}
     */
    isInBox(context, rectangle, node) {
      return rectangle.contains(node.layout)
    }
  }

  return SimpleSvgNodeStyle
})
