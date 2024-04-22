/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GeneralPath,
  IArrow,
  IBoundsProvider,
  IVisualCreator,
  Matrix,
  Point,
  SvgVisual
} from 'yfiles'

/**
 * @typedef {*} Cache
 */

export class CustomArrow extends BaseClass(IArrow, IVisualCreator, IBoundsProvider) {
  anchor
  direction
  arrowPath

  /**
   * Initializes a new instance of the {@link CustomArrow} class.
   * @param {number} [distance=1]
   */
  constructor(distance = 1) {
    super()
    this.distance = distance
    this.anchor = Point.ORIGIN
    this.direction = Point.ORIGIN
    this.arrowPath = null
  }

  /**
   * @type {number}
   */
  get length() {
    return this.distance * 2
  }

  /**
   * @type {number}
   */
  get cropLength() {
    return 1
  }

  /**
   * @param {!IEdge} edge
   * @param {boolean} atSource
   * @param {!Point} anchor
   * @param {!Point} direction
   * @returns {!IVisualCreator}
   */
  getVisualCreator(edge, atSource, anchor, direction) {
    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * @param {!IRenderContext} context
   * @returns {!SvgVisual}
   */
  createVisual(context) {
    if (this.arrowPath === null) {
      this.arrowPath = this.createArrowPath(this.distance)
    }

    const path = this.arrowPath.createSvgPath()
    path.setAttribute('fill', 'white')
    path.setAttribute('stroke', 'black')
    path.setAttribute('stroke-width', '1')
    path.setAttribute(
      'transform',
      `matrix(
        ${-this.direction.x}
        ${-this.direction.y}
        ${this.direction.y}
        ${-this.direction.x}
        ${this.anchor.x}
        ${this.anchor.y}
      )`
    )

    const svgVisual = new SvgVisual(path)
    svgVisual.cache = {
      distance: this.distance
    }
    return svgVisual
  }

  /**
   * @param {!IRenderContext} context
   * @param {!Visual} oldVisual
   * @returns {!SvgVisual}
   */
  updateVisual(context, oldVisual) {
    const svgVisual = oldVisual
    const cache = svgVisual.cache
    const path = svgVisual.svgElement

    if (this.distance !== cache.distance) {
      const arrowPath = this.createArrowPath(this.distance)
      path.setAttribute('d', arrowPath.createSvgPathData())
      cache.distance = this.distance
    }

    path.setAttribute(
      'transform',
      `matrix(
        ${-this.direction.x}
        ${-this.direction.y}
        ${this.direction.y}
        ${-this.direction.x}
        ${this.anchor.x}
        ${this.anchor.y}
      )`
    )
    return svgVisual
  }

  /**
   * @param {number} dist
   * @returns {!GeneralPath}
   */
  createArrowPath(dist) {
    const path = new GeneralPath()
    path.moveTo(new Point(dist * 2 + 1, dist * 0.5))
    path.lineTo(new Point(dist * 2 + 1, dist + 1))
    path.lineTo(new Point(0, 0))
    path.lineTo(new Point(dist * 2 + 1, -dist - 1))
    path.lineTo(new Point(dist * 2 + 1, -dist * 0.5))
    return path
  }

  /**
   * @param {!IEdge} edge
   * @param {boolean} atSource
   * @param {!Point} anchor
   * @param {!Point} direction
   * @returns {!IBoundsProvider}
   */
  getBoundsProvider(edge, atSource, anchor, direction) {
    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * @param {!ICanvasContext} context
   * @returns {!Rect}
   */
  getBounds(context) {
    return this.createArrowPath(this.distance)
      .getBounds()
      .getTransformed(
        new Matrix(
          -this.direction.x,
          -this.direction.y,
          this.direction.y,
          -this.direction.x,
          this.anchor.x,
          this.anchor.y
        )
      )
  }
}
