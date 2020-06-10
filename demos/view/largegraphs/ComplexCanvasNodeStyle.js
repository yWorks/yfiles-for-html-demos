/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GeneralPath,
  GeomUtilities,
  HtmlCanvasVisual,
  ICanvasContext,
  IInputModeContext,
  INode,
  IRectangle,
  IRenderContext,
  NodeStyleBase,
  Point,
  Rect,
  Visual
} from 'yfiles'

/**
 * A node style for HTML5 Canvas rendering with a complex visualization. Its visual
 * complexity is similar to the complex SVG node style such that their performance
 * is comparable.
 */
export default class ComplexCanvasNodeStyle extends NodeStyleBase {
  /**
   * Callback that creates the visual.
   * This method is called in response to a {@link IVisualCreator#createVisual}
   * call to the instance that has been queried from the {@link NodeStyleBase#renderer}.
   * @param {IRenderContext} context The render context.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {Visual} The visual as required by the {@link IVisualCreator#createVisual}
   *   interface.
   * @see Overrides {@link NodeStyleBase#updateVisual}
   */
  createVisual(context, node) {
    return new NodeRenderVisual(node.layout)
  }

  /**
   * Callback that updates the visual previously created by {@link NodeStyleBase#createVisual}.
   * This method is called in response to a {@link IVisualCreator#updateVisual}
   * call to the instance that has been queried from the {@link NodeStyleBase#renderer}.
   * This implementation simply delegates to {@link NodeStyleBase#createVisual} so subclasses
   * should override to improve rendering performance.
   * @param {IRenderContext} context The render context.
   * @param {Visual} oldVisual The visual that has been created in the call to
   *   {@link NodeStyleBase#createVisual}.
   * @param {INode} node The node to which this style instance is assigned.
   * @return {Visual} The visual as required by the {@link IVisualCreator#createVisual}
   *   interface.
   * @see Overrides {@link NodeStyleBase#createVisual}
   */
  updateVisual(context, oldVisual, node) {
    return oldVisual
  }

  /**
   * Gets the outline of the node, an ellipse in this case.
   * This allows correct edge path intersection calculation, among others.
   * @see Overrides {@link NodeStyleBase#getOutline}
   * @return {GeneralPath}
   */
  getOutline(node) {
    const rect = this.getEllipseBounds(node.layout)
    const outline = new GeneralPath()
    outline.appendEllipse(rect, false)
    return outline
  }

  /**
   * Get the bounding box of the node.
   * @param {ICanvasContext} context The canvas context.
   * @param {INode} node The node whose bounds are returned.
   * @return {Rect}
   * @see Overrides {@link NodeStyleBase#getBounds}
   */
  getBounds(context, node) {
    return node.layout.toRect()
  }

  /**
   * Hit test which considers the HitTestRadius specified in CanvasContext.
   * @param {IInputModeContext} context The input mode context.
   * @param {Point} p The location to be checked.
   * @param {INode} node The node that may be hit.
   * @return {boolean} True if p is inside node.
   * @see Overrides {@link NodeStyleBase#isHit}
   */
  isHit(context, p, node) {
    if (!super.isHit(context, p, node)) {
      return false
    }
    const bounds = this.getEllipseBounds(node.layout)
    return GeomUtilities.ellipseContains(bounds, p, context.hitTestRadius)
  }

  /**
   * Checks if a node is inside a certain box. Considers HitTestRadius.
   * @param {IInputModeContext} context The input mode context.
   * @param {Rect} rectangle the rectangle to be checked.
   * @param {INode} node The node that may be in the rectangle.
   * @return {boolean} True if the box intersects the elliptical shape of the node. Also true if box lies completely
   *   inside node.
   * @see Overrides {@link NodeStyleBase#isInBox}
   */
  isInBox(context, rectangle, node) {
    // early exit if not even the bounds are contained in the box
    if (!super.isInBox(context, rectangle, node)) {
      return false
    }

    const eps = context.hitTestRadius

    const outline = this.getOutline(node)
    if (outline === null) {
      return false
    }

    if (outline.intersects(rectangle, eps)) {
      return true
    }
    if (
      outline.pathContains(rectangle.topLeft, eps) &&
      outline.pathContains(rectangle.bottomRight, eps)
    ) {
      return true
    }
    return (
      rectangle.contains(node.layout.toRect().topLeft) &&
      rectangle.contains(node.layout.toRect().bottomRight)
    )
  }

  /**
   * Exact geometric check whether a point p lies inside the node. This is important for intersection calculation,
   * among others.
   * @see Overrides {@link NodeStyleBase#isInside}
   * @param {INode} node The node.
   * @param {Point} p The point to be checked.
   * @return {boolean}
   */
  isInside(node, p) {
    if (!super.isInside(node, p)) {
      return false
    }
    const bounds = this.getEllipseBounds(node.layout)
    return GeomUtilities.ellipseContains(bounds, p, 0)
  }

  /**
   * Calculates the intersection point of the node's outline with a line between
   * an inner and an outer point.
   * @see Overrides {@link NodeStyleBase#getIntersection}
   * @param {INode} node The node.
   * @param {Point} inner The inner point of the line.
   * @param {Point} outer The outer point of the line.
   * @return {Point}
   */
  getIntersection(node, inner, outer) {
    return GeomUtilities.findEllipseLineIntersection(
      this.getEllipseBounds(node.layout),
      inner,
      outer
    )
  }

  /**
   * Calculates the bounds of the icon inside the node.
   * @param {IRectangle} layout
   * @return {Rect}
   */
  getEllipseBounds(layout) {
    const d = Math.min(layout.width, layout.height)
    const x = layout.x + (layout.width - d) * 0.5
    const y = layout.y + (layout.height - d) * 0.5
    return new Rect(x, y, d, d)
  }
}

/**
 * For HTML5 Canvas based rendering we need to extend from {@link HtmlCanvasVisual}.
 */
class NodeRenderVisual extends HtmlCanvasVisual {
  /**
   * The canvas draw commands origins from a converted SVG. To scale it correctly, the original SVG size is needed.
   * @type {number}
   */
  static get ORIGINAL_SIZE() {
    return 75
  }

  /**
   * Creates an instance of the complex canvas node style renderer.
   * @param {IRectangle} layout A live view of the layout of a node.
   */
  constructor(layout) {
    super()
    this.layout = layout
  }

  /**
   * Draws a complex node style. The visual complexity is comparable to the complex SVG node style, since
   * it is a converted SVG but with a rectangular shape.
   * @see Overrides {@link HtmlCanvasVisual#paint}
   * @param {IRenderContext} context
   * @param {CanvasRenderingContext2D} htmlCanvasContext
   */
  paint(context, htmlCanvasContext) {
    const l = this.layout

    // get the min of width and height to be able to draw the icon in a square
    const length = Math.min(l.width, l.height)
    htmlCanvasContext.save()
    // calculate the top left location of the square icon
    const x = l.x + (l.width - length) * 0.5
    const y = l.y + (l.height - length) * 0.5
    // translate and scale to draw the icon in the actual layout size
    htmlCanvasContext.translate(x, y)
    htmlCanvasContext.scale(
      length / NodeRenderVisual.ORIGINAL_SIZE,
      length / NodeRenderVisual.ORIGINAL_SIZE
    )

    // draw the icon
    htmlCanvasContext.save()
    htmlCanvasContext.beginPath()
    htmlCanvasContext.arc(37.5, 37.5, 37, 0, 2 * Math.PI, false)
    htmlCanvasContext.fillStyle = '#CAEACA'
    htmlCanvasContext.strokeStyle = '#C6E5C6'
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.strokeStyle = 'rgba(0,0,0,0)'
    htmlCanvasContext.lineCap = 'butt'
    htmlCanvasContext.lineJoin = 'miter'
    htmlCanvasContext.miterLimit = 4
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#a87e5a'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(18.37, 29.42)
    htmlCanvasContext.lineTo(56.03, 29.42)
    htmlCanvasContext.quadraticCurveTo(56.03, 29.42, 56.03, 29.42)
    htmlCanvasContext.lineTo(56.03, 54.43000000000001)
    htmlCanvasContext.quadraticCurveTo(56.03, 54.43000000000001, 56.03, 54.43000000000001)
    htmlCanvasContext.lineTo(18.37, 54.43000000000001)
    htmlCanvasContext.quadraticCurveTo(18.37, 54.43000000000001, 18.37, 54.43000000000001)
    htmlCanvasContext.lineTo(18.37, 29.42)
    htmlCanvasContext.quadraticCurveTo(18.37, 29.42, 18.37, 29.42)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#ead6be'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(47.08, 52.05)
    htmlCanvasContext.lineTo(41.39, 52.05)
    htmlCanvasContext.lineTo(41.39, 46.379999999999995)
    htmlCanvasContext.lineTo(33, 46.379999999999995)
    htmlCanvasContext.lineTo(33, 52.05)
    htmlCanvasContext.lineTo(26.48, 52.05)
    htmlCanvasContext.bezierCurveTo(19.16, 52.05, 13.13, 57.53, 12.24, 64.6)
    htmlCanvasContext.bezierCurveTo(18.84, 70.74, 27.689999999999998, 74.5, 37.42, 74.5)
    htmlCanvasContext.bezierCurveTo(46.58, 74.5, 54.95, 71.17, 61.41, 65.66)
    htmlCanvasContext.bezierCurveTo(61.01, 58.08, 54.76, 52.05, 47.08, 52.05)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#e2ccb7'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(47.08, 52.05)
    htmlCanvasContext.lineTo(41.39, 52.05)
    htmlCanvasContext.lineTo(41.39, 46.379999999999995)
    htmlCanvasContext.lineTo(37.42, 46.379999999999995)
    htmlCanvasContext.lineTo(37.42, 74.5)
    htmlCanvasContext.bezierCurveTo(37.45, 74.5, 37.480000000000004, 74.5, 37.510000000000005, 74.5)
    htmlCanvasContext.bezierCurveTo(46.63, 74.5, 54.970000000000006, 71.2, 61.42, 65.73)
    htmlCanvasContext.bezierCurveTo(61.05, 58.12, 54.78, 52.05, 47.08, 52.05)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.globalAlpha = 0.05000000074505806
    htmlCanvasContext.beginPath()
    htmlCanvasContext.arc(37.19, 33.39, 15.62, 0, 6.283185307179586, true)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#ead6be'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.arc(36.78, 32.05, 15.62, 0, 6.283185307179586, true)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#e2ccb7'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(37.19, 16.45)
    htmlCanvasContext.lineTo(37.19, 47.65)
    htmlCanvasContext.bezierCurveTo(45.62, 47.43, 52.4, 40.54, 52.4, 32.05)
    htmlCanvasContext.bezierCurveTo(52.4, 23.559999999999995, 45.63, 16.67, 37.19, 16.45)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#56513a'
    htmlCanvasContext.globalAlpha = 0.10000000149011612
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(56.71, 42.07)
    htmlCanvasContext.lineTo(56.480000000000004, 26.950000000000003)
    htmlCanvasContext.bezierCurveTo(
      55.25000000000001,
      17.14,
      46.89,
      10.880000000000003,
      36.74000000000001,
      10.880000000000003
    )
    htmlCanvasContext.bezierCurveTo(
      26.84000000000001,
      10.880000000000003,
      18.65000000000001,
      17.480000000000004,
      17.120000000000008,
      26.950000000000003
    )
    htmlCanvasContext.lineTo(16.65000000000001, 42.050000000000004)
    htmlCanvasContext.bezierCurveTo(
      13.280000000000008,
      42.550000000000004,
      10.70000000000001,
      45.45,
      10.70000000000001,
      48.95
    )
    htmlCanvasContext.bezierCurveTo(
      10.70000000000001,
      52.81,
      13.830000000000009,
      55.940000000000005,
      17.690000000000012,
      55.940000000000005
    )
    htmlCanvasContext.bezierCurveTo(
      21.040000000000013,
      55.940000000000005,
      24.57000000000001,
      53.59,
      25.25000000000001,
      50.45
    )
    htmlCanvasContext.lineTo(25.25000000000001, 50.45)
    htmlCanvasContext.bezierCurveTo(
      25.32000000000001,
      50.03,
      25.41000000000001,
      49.59,
      25.41000000000001,
      49.150000000000006
    )
    htmlCanvasContext.bezierCurveTo(
      25.41000000000001,
      49.150000000000006,
      25.37000000000001,
      34.34,
      25.41000000000001,
      29.730000000000004
    )
    htmlCanvasContext.bezierCurveTo(
      26.93000000000001,
      30.270000000000003,
      27.92000000000001,
      30.570000000000004,
      29.63000000000001,
      30.570000000000004
    )
    htmlCanvasContext.bezierCurveTo(
      35.74000000000001,
      30.570000000000004,
      41.18000000000001,
      28.910000000000004,
      43.34000000000001,
      23.570000000000004
    )
    htmlCanvasContext.bezierCurveTo(
      44.50000000000001,
      25.020000000000003,
      46.000000000000014,
      26.320000000000004,
      48.03000000000001,
      26.320000000000004
    )
    htmlCanvasContext.bezierCurveTo(
      48.14000000000001,
      26.320000000000004,
      48.03000000000001,
      55.82000000000001,
      48.03000000000001,
      55.82000000000001
    )
    htmlCanvasContext.lineTo(56.92000000000001, 55.82000000000001)
    htmlCanvasContext.bezierCurveTo(
      60.150000000000006,
      55.20000000000001,
      62.59000000000001,
      52.370000000000005,
      62.59000000000001,
      48.96000000000001
    )
    htmlCanvasContext.bezierCurveTo(62.58, 45.48, 60.03, 42.6, 56.71, 42.07)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#c49a6c'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(56.71, 40.82)
    htmlCanvasContext.lineTo(56.48, 25.7)
    htmlCanvasContext.bezierCurveTo(
      55.25,
      15.889999999999999,
      46.89,
      9.629999999999999,
      36.739999999999995,
      9.629999999999999
    )
    htmlCanvasContext.bezierCurveTo(
      26.839999999999996,
      9.629999999999999,
      18.649999999999995,
      16.229999999999997,
      17.119999999999994,
      25.7
    )
    htmlCanvasContext.lineTo(16.649999999999995, 40.8)
    htmlCanvasContext.bezierCurveTo(
      13.279999999999994,
      41.3,
      10.699999999999996,
      44.199999999999996,
      10.699999999999996,
      47.699999999999996
    )
    htmlCanvasContext.bezierCurveTo(
      10.699999999999996,
      51.559999999999995,
      13.829999999999995,
      54.69,
      17.689999999999998,
      54.69
    )
    htmlCanvasContext.bezierCurveTo(
      21.04,
      54.69,
      23.99,
      52.339999999999996,
      24.669999999999998,
      49.199999999999996
    )
    htmlCanvasContext.lineTo(24.639999999999997, 49.199999999999996)
    htmlCanvasContext.bezierCurveTo(
      24.709999999999997,
      48.779999999999994,
      24.749999999999996,
      48.339999999999996,
      24.749999999999996,
      47.9
    )
    htmlCanvasContext.bezierCurveTo(
      24.749999999999996,
      47.9,
      24.739999999999995,
      33.089999999999996,
      24.779999999999998,
      28.479999999999997
    )
    htmlCanvasContext.bezierCurveTo(
      26.299999999999997,
      29.019999999999996,
      27.919999999999998,
      29.319999999999997,
      29.629999999999995,
      29.319999999999997
    )
    htmlCanvasContext.bezierCurveTo(
      35.739999999999995,
      29.319999999999997,
      40.97,
      27.189999999999998,
      43.129999999999995,
      21.849999999999998
    )
    htmlCanvasContext.bezierCurveTo(
      44.28999999999999,
      23.299999999999997,
      46.41,
      25.06,
      48.44,
      25.06
    )
    htmlCanvasContext.bezierCurveTo(48.55, 25.06, 48.44, 54.56, 48.44, 54.56)
    htmlCanvasContext.lineTo(56.92, 54.56)
    htmlCanvasContext.bezierCurveTo(60.15, 53.940000000000005, 62.59, 51.11, 62.59, 47.7)
    htmlCanvasContext.bezierCurveTo(62.58, 44.23, 60.03, 41.35, 56.71, 40.82)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#b78d63'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(21.41, 27.98)
    htmlCanvasContext.lineTo(21.41, 46.2)
    htmlCanvasContext.lineTo(21.38, 46.2)
    htmlCanvasContext.bezierCurveTo(
      21.13,
      48.86,
      18.89,
      50.940000000000005,
      16.16,
      50.940000000000005
    )
    htmlCanvasContext.bezierCurveTo(
      13.33,
      50.940000000000005,
      11.030000000000001,
      48.7,
      10.93,
      45.900000000000006
    )
    htmlCanvasContext.bezierCurveTo(
      10.77,
      46.480000000000004,
      10.69,
      47.09,
      10.69,
      47.71000000000001
    )
    htmlCanvasContext.bezierCurveTo(
      10.69,
      51.57000000000001,
      13.82,
      54.70000000000001,
      17.68,
      54.70000000000001
    )
    htmlCanvasContext.bezierCurveTo(
      21.03,
      54.70000000000001,
      23.98,
      52.35000000000001,
      24.66,
      49.21000000000001
    )
    htmlCanvasContext.lineTo(24.63, 49.21000000000001)
    htmlCanvasContext.bezierCurveTo(
      24.7,
      48.790000000000006,
      24.74,
      48.35000000000001,
      24.74,
      47.91000000000001
    )
    htmlCanvasContext.bezierCurveTo(
      24.74,
      47.91000000000001,
      24.729999999999997,
      33.43000000000001,
      24.77,
      28.66000000000001
    )
    htmlCanvasContext.bezierCurveTo(23.62, 28.55, 22.49, 28.32, 21.41, 27.98)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#ad7e53'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(56.71, 40.85)
    htmlCanvasContext.lineTo(56.480000000000004, 25.730000000000004)
    htmlCanvasContext.bezierCurveTo(
      55.45,
      17.480000000000004,
      49.370000000000005,
      11.760000000000003,
      41.43000000000001,
      10.140000000000004
    )
    htmlCanvasContext.bezierCurveTo(
      41.620000000000005,
      11.110000000000005,
      41.720000000000006,
      12.100000000000005,
      41.720000000000006,
      13.120000000000005
    )
    htmlCanvasContext.bezierCurveTo(
      41.720000000000006,
      21.750000000000007,
      34.730000000000004,
      28.740000000000002,
      26.10000000000001,
      28.740000000000002
    )
    htmlCanvasContext.bezierCurveTo(
      25.870000000000008,
      28.740000000000002,
      25.640000000000008,
      28.720000000000002,
      25.40000000000001,
      28.700000000000003
    )
    htmlCanvasContext.bezierCurveTo(
      26.74000000000001,
      29.110000000000003,
      28.15000000000001,
      29.35,
      29.620000000000008,
      29.35
    )
    htmlCanvasContext.bezierCurveTo(
      35.73000000000001,
      29.35,
      40.96000000000001,
      27.220000000000002,
      43.120000000000005,
      21.880000000000003
    )
    htmlCanvasContext.bezierCurveTo(
      44.28,
      23.330000000000002,
      46.400000000000006,
      25.090000000000003,
      48.43000000000001,
      25.090000000000003
    )
    htmlCanvasContext.bezierCurveTo(
      48.540000000000006,
      25.090000000000003,
      48.43000000000001,
      54.59,
      48.43000000000001,
      54.59
    )
    htmlCanvasContext.lineTo(56.91000000000001, 54.59)
    htmlCanvasContext.bezierCurveTo(
      60.14000000000001,
      53.970000000000006,
      62.58000000000001,
      51.14,
      62.58000000000001,
      47.730000000000004
    )
    htmlCanvasContext.bezierCurveTo(62.58, 44.26, 60.03, 41.38, 56.71, 40.85)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#2d77aa'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(47.08, 52.05)
    htmlCanvasContext.lineTo(37.55, 65.21)
    htmlCanvasContext.lineTo(26.48, 52.05)
    htmlCanvasContext.bezierCurveTo(19.19, 52.05, 13.18, 57.489999999999995, 12.25, 64.53)
    htmlCanvasContext.bezierCurveTo(18.86, 70.71000000000001, 27.740000000000002, 74.5, 37.5, 74.5)
    htmlCanvasContext.bezierCurveTo(46.62, 74.5, 54.96, 71.2, 61.41, 65.73)
    htmlCanvasContext.bezierCurveTo(61.05, 58.12, 54.78, 52.05, 47.08, 52.05)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.save()
    htmlCanvasContext.fillStyle = '#1f639b'
    htmlCanvasContext.beginPath()
    htmlCanvasContext.moveTo(47.08, 52.05)
    htmlCanvasContext.lineTo(37.5, 65.21)
    htmlCanvasContext.lineTo(37.5, 74.5)
    htmlCanvasContext.lineTo(37.5, 74.5)
    htmlCanvasContext.bezierCurveTo(46.62, 74.5, 54.96, 71.19, 61.41, 65.73)
    htmlCanvasContext.bezierCurveTo(61.05, 58.12, 54.78, 52.05, 47.08, 52.05)
    htmlCanvasContext.closePath()
    htmlCanvasContext.fill()
    htmlCanvasContext.stroke()
    htmlCanvasContext.restore()
    htmlCanvasContext.restore()
  }
}
