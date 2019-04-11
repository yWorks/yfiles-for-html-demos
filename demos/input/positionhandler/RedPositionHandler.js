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
import { BaseClass, IInputModeContext, IPositionHandler, Point } from 'yfiles'

/**
 * A position handler that prevents node movements. This implementation is
 * very simple since most methods do nothing at all.
 */
export default class RedPositionHandler extends BaseClass(IPositionHandler) {
  /**
   * Returns the location of the item.
   * @return {IPoint}
   */
  get location() {
    return Point.ORIGIN
  }

  /**
   * Stores the initial location of the movement for reference, and calls the base method.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @see Specified by {@link IDragHandler#initializeDrag}.
   */
  initializeDrag(inputModeContext) {}

  /**
   * Prevents node movements.
   * @param {IInputModeContext} context The context to retrieve information about the drag from
   * @param {Point} originalLocation The value of the {@link IDragHandler#location}
   * property at the time of {@link IDragHandler#initializeDrag}
   * @param {Point} newLocation The coordinates in the world coordinate system that the client wants
   * the handle to be at. Depending on the implementation the {@link IDragHandler#location} may or may
   * not be modified to reflect the new value.
   * @see Specified by {@link IDragHandler#handleMove}.
   * @return {boolean}
   */
  handleMove(context, originalLocation, newLocation) {}

  /**
   * Called when dragging has been canceled by the user.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @param {Point} originalLocation The value of the coordinate of the
   * {@link IDragHandler#location} property at the time of
   *   {@link IDragHandler#initializeDrag}.
   */
  cancelDrag(inputModeContext, originalLocation) {}

  /**
   * Called when dragging has finished.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @param {Point} originalLocation The value of the {@link IDragHandler#location}
   * property at the time of {@link IDragHandler#initializeDrag}
   * @param {Point} newLocation The coordinates in the world coordinate system that the client wants
   * the handle to be at. Depending on the implementation the {@link IDragHandler#location} may or may
   * not be modified to reflect the new value. This is the same value as delivered in the last invocation of
   * {@link IDragHandler#handleMove}
   */
  dragFinished(inputModeContext, originalLocation, newLocation) {}
}
