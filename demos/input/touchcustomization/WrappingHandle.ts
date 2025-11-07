/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  type ClickEventArgs,
  type Cursor,
  type HandleType,
  IDragHandler,
  IHandle,
  type IInputModeContext,
  type IPoint,
  type Point
} from '@yfiles/yfiles'

/**
 * A handle implementation that wraps another handle and overrides the handle type and cursor with
 * the ones given in the constructor. This makes it possible to use a different handle template.
 */
export class WrappingHandle extends BaseClass(IHandle) {
    private handleCursor: Cursor | null;
    private handleType: HandleType | null;
    private wrappedHandle: IHandle;

  /**
   * Initializes a new WrappingHandle instance.
   * @param wrappedHandle The inner handle implementation.
   * @param handleType The handle type to use for this handle.
   * @param handleCursor The cursor to use for this handle.
   */
  constructor(
    wrappedHandle: IHandle,
    handleType: HandleType | null,
    handleCursor: Cursor | null
  ) {
    super()
      this.wrappedHandle = wrappedHandle;
      this.handleType = handleType;
      this.handleCursor = handleCursor;
  }

  /**
   * Gets the types of handles that determine how this handle is visualized.
   */
  get type(): HandleType {
    return this.handleType || this.wrappedHandle.type
  }

  get tag() {
    return null
  }

  /**
   * Gets the cursor that is displayed when the mouse is over this handle.
   */
  get cursor(): Cursor {
    return this.handleCursor || this.wrappedHandle.cursor
  }

  /**
   * Gets this handle's location.
   */
  get location(): IPoint {
    return this.wrappedHandle.location
  }

  /**
   * Initializes additional state when a drag gesture is started.
   * @param context The context to retrieve information about the drag from.
   */
  initializeDrag(context: IInputModeContext): void {
    this.wrappedHandle.initializeDrag(context)
  }

  /**
   * Handles drag events for this handle.
   * @param context The context to retrieve information about the drag from.
   * @param originalLocation The value of the {@link IDragHandler.location} property at the time of
   * {@link IDragHandler.initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the
   * handle to be at. Depending on the implementation the {@link IDragHandler.location} may or may
   * not be modified to reflect the new value.
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.wrappedHandle.handleMove(context, originalLocation, newLocation)
  }

  /**
   * Finishes the drag gesture for this handle.
   * @param context The context to retrieve information about the drag from.
   * @param originalLocation The value of the {@link IDragHandler.location}
   * property at the time of {@link IDragHandler.initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the
   * handle to be at. Depending on the implementation the {@link IDragHandler.location} may or may
   * not be modified to reflect the new value. This is the same value as delivered in the last
   * invocation of {@link IDragHandler.handleMove}
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.wrappedHandle.dragFinished(context, originalLocation, newLocation)
  }

  /**
   * Resets the effects of the previous drag gesture if the gesture is aborted.
   * @param context The context to retrieve information about the drag from.
   * @param originalLocation The value of the coordinate of the {@link IDragHandler.location}
   * property at the time of {@link IDragHandler.initializeDrag}.
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.wrappedHandle.cancelDrag(context, originalLocation)
  }

  /**
   * Called to indicate that the handle has been clicked by the user.
   */
  handleClick(evt: ClickEventArgs): void {
    this.wrappedHandle.handleClick(evt)
  }
}
