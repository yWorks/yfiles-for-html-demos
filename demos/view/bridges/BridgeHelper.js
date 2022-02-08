/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  BridgeCrossingStyle,
  BridgeOrientationStyle,
  GeneralPath,
  IBridgeCreator,
  INode,
  Insets,
  IObstacleProvider,
  IRenderContext,
  Point
} from 'yfiles'
import { DemoGroupStyle } from '../../resources/demo-styles.js'

/**
 * A custom delegating callback that implements {@link CustomCallback#createCustomBridge} differently.
 */
export class CustomCallback extends BaseClass(IBridgeCreator) {
  /**
   * Creates a new instance of <code>CustomCallback</code>
   * @param {!IBridgeCreator} fallback
   */
  constructor(fallback) {
    super()
    this.fallback = fallback
  }

  /**
   * Returns the CrossingStyle to be used.
   * @param {!IRenderContext} context
   * @returns {!BridgeCrossingStyle}
   */
  getCrossingStyle(context) {
    return this.fallback.getCrossingStyle(context)
  }

  /**
   * Returns the BridgeOrientationStyle to be used.
   * @param {!IRenderContext} context
   * @returns {!BridgeOrientationStyle}
   */
  getOrientationStyle(context) {
    return this.fallback.getOrientationStyle(context)
  }

  /**
   * Returns the width of the bridge to be used.
   * @param {!IRenderContext} context
   * @returns {number}
   */
  getBridgeWidth(context) {
    return this.fallback.getBridgeWidth(context)
  }

  /**
   * Returns the height of the bridge to be used.
   * @param {!IRenderContext} context
   * @returns {number}
   */
  getBridgeHeight(context) {
    return this.fallback.getBridgeHeight(context)
  }

  /**
   * Called by the BridgeManager if the getCrossingStyle method returns BridgeCrossingStyle.CUSTOM to
   * insert a bridge into the given general path.
   * @param {!IRenderContext} context The given render context
   * @param {!GeneralPath} path The general path to be used
   * @param {!Point} startPoint The coordinates of the starting point of the bridge.
   * @param {!Point} endPoint The coordinates of the ending point of the bridge.
   * @param {number} gapLength The distance between the starting point and the end point.
   */
  createCustomBridge(context, path, startPoint, endPoint, gapLength) {
    // first finish the last segment
    path.lineTo(startPoint)
    // then draw our custom bridge, if the gap is large enough
    if (gapLength > 1) {
      // some helper vectors first
      const delta = endPoint.subtract(startPoint)
      const rightVector = delta.multiply(1 / gapLength)
      const upVector = new Point(rightVector.y, -rightVector.x)

      // get the height from the context
      const height = this.getBridgeHeight(context)
      // determine bending for our arc
      const arc = 3
      // now draw two arcs at the end and the start of the segment
      path.moveTo(startPoint.add(upVector.multiply(height)).subtract(rightVector.multiply(arc)))

      path.quadTo(
        startPoint.add(rightVector.multiply(arc)),
        startPoint.add(upVector.multiply(-height)).subtract(rightVector.multiply(arc))
      )
      path.moveTo(endPoint.add(rightVector.multiply(arc)).add(upVector.multiply(height)))
      path.quadTo(
        endPoint.subtract(rightVector.multiply(arc)),
        endPoint.add(upVector.multiply(-height)).add(rightVector.multiply(arc))
      )
    }
    // finally make sure that the edge continues at the right location
    path.moveTo(endPoint)
  }
}

/**
 * Custom {@link IObstacleProvider} implementation that returns the node style's outline
 * as an obstacle.
 * @see {@link IShapeGeometry#getOutline}
 */
export class GroupNodeObstacleProvider extends BaseClass(IObstacleProvider) {
  /**
   * Creates a new instance of <code>GroupNodeObstacleProvider</code>
   * @param {!INode} groupNode
   */
  constructor(groupNode) {
    super()
    this.groupNode = groupNode
  }

  /**
   * Returns an obstacle for the node style's outline.
   * @param {!IRenderContext} context The given render context
   * @see Specified by {@link IObstacleProvider#getObstacles}.
   * @returns {?GeneralPath}
   */
  getObstacles(context) {
    const style = this.groupNode.style
    const visible = style.renderer
      .getVisibilityTestable(this.groupNode, style)
      .isVisible(context, context.clip)
    if (visible) {
      return this.createPath()
    }
    // If the node is invisible, don't return anything (won't be painted anyway...)
    return null
  }

  /**
   * Uses the node style's outline as obstacle.
   * For node style renderers that don't provide a {@link IShapeGeometry}, no bridges will be created.
   * @returns {?GeneralPath}
   */
  createPath() {
    const style = this.groupNode.style
    if (style instanceof DemoGroupStyle) {
      const outline = new GeneralPath()
      outline.appendRectangle(
        this.groupNode.layout.toRect().getEnlarged(new Insets(-4, -22, -4, -4)),
        false
      )
      return outline
    }
    const geometry = style.renderer.getShapeGeometry(this.groupNode, style)
    return geometry.getOutline()
  }
}
