/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IMutablePoint,
  IPoint,
  IPositionHandler,
  Point
} from 'yfiles'

/**
 * Simple implementation of an {@link IPositionHandler} that moves an {@link IMutablePoint}
 */
export class RectanglePositionHandler extends BaseClass(IPositionHandler) {
  position
  startPosition = null

  /**
   * Creates a position handler that delegates to a mutable position.
   * @param {!IMutablePoint} position The position that will be read and changed.
   */
  constructor(position) {
    super()
    this.position = position
  }

  /**
   * @type {!IPoint}
   */
  get location() {
    return this.position
  }

  /**
   * Stores the initial position of the {@link IMutablePoint}
   * @param {!IInputModeContext} context
   */
  initializeDrag(context) {
    this.startPosition = this.position.toPoint()
  }

  /**
   * Moves the {@link IMutablePoint} away from the start position by the difference
   * between newLocation and originalLocation
   * @param {!IInputModeContext} context The context
   * @param {!Point} originalLocation the original location
   * @param {!Point} newLocation the new location
   */
  handleMove(context, originalLocation, newLocation) {
    if (this.startPosition) {
      const currentPosition = this.startPosition.add(newLocation.subtract(originalLocation))
      if (this.position.x !== currentPosition.x || this.position.y !== currentPosition.y) {
        this.position.x = currentPosition.x
        this.position.y = currentPosition.y
      }
    }
  }

  /**
   * Moves the {@link IMutablePoint} back to the start position.
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   */
  cancelDrag(context, originalLocation) {
    if (this.startPosition) {
      if (this.position.x !== this.startPosition.x || this.position.y !== this.startPosition.y) {
        this.position.x = this.startPosition.x
        this.position.y = this.startPosition.y
      }
    }
  }

  /**
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  dragFinished(context, originalLocation, newLocation) {
    // eslint-disable-next-line no-useless-return
    return
  }
}
