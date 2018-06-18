/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
   * A simple HTML5 Canvas node style that draws a rectangle with a solid fill.
   * @extends yfiles.styles.NodeStyleBase
   */
  class SimpleCanvasNodeStyle extends yfiles.styles.NodeStyleBase {
    /**
     * @param {yfiles.view.Color} color
     */
    constructor(color) {
      super()
      this.color = typeof color !== 'undefined' ? color : new yfiles.view.Color(0, 172, 255, 1)
    }

    /**
     * Callback that creates the visual.
     * This method is called in response to a {@link yfiles.view.IVisualCreator#createVisual}
     * call to the instance that has been queried from the {@link yfiles.styles.NodeStyleBase#renderer}.
     * @param {yfiles.view.IRenderContext} renderContext The render context.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {yfiles.view.Visual} The visual as required by the {@link yfiles.view.IVisualCreator#createVisual}
     *   interface.
     * @see {@link yfiles.styles.NodeStyleBase#updateVisual}
     */
    createVisual(renderContext, node) {
      return new NodeRenderVisual(node.layout, this.color)
    }

    /**
     * Callback that updates the visual previously created by {@link yfiles.styles.NodeStyleBase#createVisual}.
     * This method is called in response to a {@link yfiles.view.IVisualCreator#updateVisual}
     * call to the instance that has been queried from the {@link yfiles.styles.NodeStyleBase#renderer}.
     * This implementation simply delegates to {@link yfiles.styles.NodeStyleBase#createVisual} so subclasses
     * should override to improve rendering performance.
     * @param {yfiles.view.IRenderContext} renderContext The render context.
     * @param {yfiles.view.Visual} oldVisual The visual that has been created in the call to
     *   {@link yfiles.styles.NodeStyleBase#createVisual}.
     * @param {yfiles.graph.INode} node The node to which this style instance is assigned.
     * @return {yfiles.view.Visual} The visual as required by the {@link yfiles.view.IVisualCreator#createVisual}
     *   interface.
     * @see {@link yfiles.styles.NodeStyleBase#createVisual}
     */
    updateVisual(renderContext, oldVisual, node) {
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
     * @param {yfiles.geometry.Point} p The point to be checked.
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
    isInBox(canvasContext, box, node) {
      return box.contains(node.layout)
    }
  }

  /**
   * For HTML5 Canvas based rendering we need to extend from {@link yfiles.view.HtmlCanvasVisual}.
   * @extends yfiles.view.HtmlCanvasVisual
   */
  class NodeRenderVisual extends yfiles.view.HtmlCanvasVisual {
    /**
     * Creates an instance of the render visual.
     * @param {yfiles.geometry.Rect} layout The layout of the node.
     * @param {yfiles.view.Color} color The color for the node.
     */
    constructor(layout, color) {
      super()
      this.layout = layout
      this.color = `rgba(${color.r},${color.g},${color.b},${color.a})`
    }

    /**
     * Draw a simple rectangle with a solid orange fill.
     * @param {yfiles.view.IRenderContext} context The render context.
     * @param {CanvasRenderingContext2D} htmlCanvasContext The html canvas context.
     * @see Overrides {@link yfiles.view.HtmlCanvasVisual#paint}
     */
    paint(context, htmlCanvasContext) {
      htmlCanvasContext.fillStyle = this.color
      const layout = this.layout
      htmlCanvasContext.fillRect(layout.x, layout.y, layout.width, layout.height)
    }
  }

  return SimpleCanvasNodeStyle
})
