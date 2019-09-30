/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  BaseClass,
  IInputModeContext,
  IPositionHandler,
  MutablePoint,
  MutableRectangle,
  Point
} from 'yfiles'

/**
 * A position handler that moves a given rectangle.
 */
export default class PositionHandler extends BaseClass(IPositionHandler) {
  /**
   * @param {MutableRectangle} rectangle
   */
  constructor(rectangle) {
    super()
    this.rectangle = rectangle
    this.offset = new MutablePoint()
  }

  /** @type {Point} */
  get location() {
    return this.rectangle.topLeft
  }

  /**
   * @param {IInputModeContext} context
   */
  initializeDrag(context) {
    const x = this.rectangle.x - context.canvasComponent.lastEventLocation.x
    const y = this.rectangle.y - context.canvasComponent.lastEventLocation.y
    this.offset.relocate(x, y)
  }

  /**
   * @param {IInputModeContext} context
   * @param {Point} originalLocation
   * @param {Point} newLocation
   */
  handleMove(context, originalLocation, newLocation) {
    const newX = newLocation.x + this.offset.x
    const newY = newLocation.y + this.offset.y
    this.rectangle.relocate(new Point(newX, newY))
  }

  /**
   * @param {IInputModeContext} context
   * @param {Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    this.rectangle.relocate(originalLocation)
  }

  /**
   * @param {IInputModeContext} context
   * @param {Point} originalLocation
   * @param {Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
    const newX = newLocation.x + this.offset.x
    const newY = newLocation.y + this.offset.y
    this.rectangle.relocate(new Point(newX, newY))
  }
}
