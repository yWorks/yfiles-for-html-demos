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
import { BaseClass, HandlePositions, IHandle, IInputModeContext, Point, Rect, Size } from 'yfiles'

export default class AspectRatioHandle extends BaseClass(IHandle) {
  /**
   * Creates a new instance of <code>AspectRatioHandle</code>.
   * @param {IHandle} handle The delegate handler
   * @param {Point} position The handler's position
   * @param {Rect} layout The given node's layout
   */
  constructor(handle, position, layout) {
    super()
    this.handle = handle
    this.position = position
    this.layout = layout
    this.lastLocation = new Point(0, 0)
    this.ratio = 0
    this.originalSize = new Size(0, 0)
  }

  /**
   * Returns the location of the item.
   * @return {IPoint}
   */
  get location() {
    return this.handle.location
  }

  /**
   * Stores the initial location of the movement for reference, and calls the base method.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @see Specified by {@link IDragHandler#initializeDrag}.
   */
  initializeDrag(inputModeContext) {
    this.handle.initializeDrag(inputModeContext)
    this.lastLocation = this.handle.location.toPoint()
    this.originalSize = this.layout.toSize()
    if (this.layout.height === 0) {
      this.ratio = Number.POSITIVE_INFINITY
      return
    }
    switch (this.position) {
      case HandlePositions.NORTH_WEST:
      case HandlePositions.SOUTH_EAST:
        this.ratio = this.layout.width / this.layout.height
        break
      case HandlePositions.NORTH_EAST:
      case HandlePositions.SOUTH_WEST:
        this.ratio = -this.layout.width / this.layout.height
        break
      default:
        throw new Error()
    }
  }

  /**
   * Constrains the movement to one axis. This is done by calculating the
   * constrained location for the given new location, and invoking the
   * original handler with the constrained location.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @param {Point} originalLocation The value of the {@link IDragHandler#location}
   * property at the time of {@link IDragHandler#initializeDrag}
   * @param {Point} newLocation The coordinates in the world coordinate system that the client wants
   * the handle to be at. Depending on the implementation the {@link IDragHandler#location} may or may
   * not be modified to reflect the new value.
   * @see Specified by {@link IDragHandler#handleMove}.
   * @return {boolean}
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    // For the given new location, the larger node side specifies the actual size change.
    const minSize = 5
    let deltaDragX = newLocation.x - originalLocation.x
    let deltaDragY = newLocation.y - originalLocation.y
    if (this.ratio === 0) {
      deltaDragX = 0
    } else if (!isFinite(this.ratio)) {
      deltaDragY = 0
    } else if (Math.abs(this.ratio) > 1) {
      const sign =
        this.position === HandlePositions.SOUTH_EAST || this.position === HandlePositions.SOUTH_WEST
          ? 1
          : -1
      if (this.originalSize.height + sign * (deltaDragX / this.ratio) > minSize) {
        deltaDragY = deltaDragX / this.ratio
      } else {
        deltaDragY = Math.sign(deltaDragX / this.ratio) * (this.originalSize.height - minSize)
        deltaDragX = deltaDragY * this.ratio
      }
    } else {
      const sign =
        this.position === HandlePositions.NORTH_WEST || this.position === HandlePositions.SOUTH_WEST
          ? -1
          : 1
      if (this.originalSize.width + sign * (deltaDragY * this.ratio) > minSize) {
        deltaDragX = deltaDragY * this.ratio
      } else {
        deltaDragX = Math.sign(deltaDragY * this.ratio) * (this.originalSize.width - minSize)
        deltaDragY = deltaDragX / this.ratio
      }
    }

    newLocation = new Point(originalLocation.x + deltaDragX, originalLocation.y + deltaDragY)
    if (newLocation.equals(this.lastLocation)) {
      return
    }
    this.handle.handleMove(inputModeContext, originalLocation, newLocation)
    this.lastLocation = newLocation
  }

  /**
   * Called when dragging has been canceled by the user.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from
   * @param {Point} originalLocation The value of the coordinate of the
   * {@link IDragHandler#location} property at the time of
   *   {@link IDragHandler#initializeDrag}.
   */
  cancelDrag(inputModeContext, originalLocation) {
    this.handle.cancelDrag(inputModeContext, originalLocation)
  }

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
  dragFinished(inputModeContext, originalLocation, newLocation) {
    this.handle.dragFinished(inputModeContext, originalLocation, this.lastLocation)
  }

  /**
   * Returns the type of the handler.
   * @return {HandleTypes}
   */
  get type() {
    return this.handle.type
  }

  /**
   * Returns the cursor of the handler.
   * @return {Cursor}
   */
  get cursor() {
    return this.handle.cursor
  }
}
