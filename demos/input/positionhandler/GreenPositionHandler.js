/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  ConstrainedPositionHandler,
  IDragHandler,
  IInputModeContext,
  IPoint,
  IPositionHandler,
  Point
} from 'yfiles'

/**
 * A position handler that constrains the movement of a node to one axis
 * (for each gesture) and delegates for other aspects to another (the
 * original) handler.
 * Note that the simpler solution for this use case is subclassing
 * {@link ConstrainedPositionHandler}, however the interface is
 * completely implemented for illustration purposes, here.
 */
export default class GreenPositionHandler extends BaseClass(IPositionHandler) {
  /**
   * Creates a new instance of {@link GreenPositionHandler}
   * @param {!IPositionHandler} handler The default handler
   */
  constructor(handler) {
    super()
    this.lastLocation = null
    this.handler = handler
  }

  /**
   * Returns the location of the item.
   * @type {!IPoint}
   */
  get location() {
    return this.handler.location
  }

  /**
   * Stores the initial location of the movement for reference and calls the base method.
   * @param {!IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @see Specified by {@link IDragHandler.initializeDrag}.
   */
  initializeDrag(inputModeContext) {
    this.handler.initializeDrag(inputModeContext)
    this.lastLocation = this.handler.location.toPoint()
  }

  /**
   * Constrains the movement to one axis. This is done by calculating the
   * constrained location for the given new location, and invoking the
   * original handler with the constrained location.
   * @param {!IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @param {!Point} originalLocation The value of the {@link IDragHandler.location}
   * property at the time of {@link IDragHandler.initializeDrag}
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants
   * the handle to be at. Depending on the implementation the {@link IDragHandler.location} may or may
   * not be modified to reflect the new value.
   * @see Specified by {@link IDragHandler.handleMove}.
   * @returns {boolean}
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    // The larger difference in coordinates specifies whether this is
    // a horizontal or vertical movement.
    const delta = newLocation.subtract(originalLocation)
    const isHorizontalMovement = Math.abs(delta.x) > Math.abs(delta.y)

    const updatedNewLocation = isHorizontalMovement
      ? new Point(newLocation.x, originalLocation.y)
      : new Point(originalLocation.x, newLocation.y)

    if (updatedNewLocation.equals(this.lastLocation)) {
      return false
    }

    this.handler.handleMove(inputModeContext, originalLocation, updatedNewLocation)
    this.lastLocation = updatedNewLocation
    return true
  }

  /**
   * Called when dragging has been canceled by the user.
   * @param {!IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @param {!Point} originalLocation The value of the coordinate of the
   * {@link IDragHandler.location} property at the time of
   *   {@link IDragHandler.initializeDrag}.
   */
  cancelDrag(inputModeContext, originalLocation) {
    this.handler.cancelDrag(inputModeContext, originalLocation)
  }

  /**
   * Called when dragging has finished.
   * @param {!IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @param {!Point} originalLocation The value of the {@link IDragHandler.location}
   * property at the time of {@link IDragHandler.initializeDrag}
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants
   * the handle to be at. Depending on the implementation the {@link IDragHandler.location} may or may
   * not be modified to reflect the new value. This is the same value as delivered in the last invocation of
   * {@link IDragHandler.handleMove}
   */
  dragFinished(inputModeContext, originalLocation, newLocation) {
    this.handler.dragFinished(inputModeContext, originalLocation, this.lastLocation)
  }
}
