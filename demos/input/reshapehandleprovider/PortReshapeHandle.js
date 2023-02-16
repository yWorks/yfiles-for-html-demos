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
  ClickEventArgs,
  Cursor,
  HandlePositions,
  HandleTypes,
  IHandle,
  IInputModeContext,
  IPoint,
  IPort,
  NodeStylePortStyleAdapter,
  Point,
  Size
} from 'yfiles'

export class PortReshapeHandle extends BaseClass(IHandle) {
  /**
   * Creates a new instance for port and its adapter.
   * @param {!IInputModeContext} context The context of the reshape gesture.
   * @param {!IPort} port The port whose visualization shall be resized.
   * @param {!NodeStylePortStyleAdapter} adapter The adapter whose render size shall be changed.
   * @param {!HandlePositions} position The position of the handle.
   * @param {!Size} minimumSize The minimum render size for the given port.
   */
  constructor(context, port, adapter, position, minimumSize) {
    super()
    this.minimumSize = minimumSize
    this.position = position
    this.adapter = adapter
    this.port = port
    this.context = context

    // The initial render size (i.e. the size of the port visualization). Used to reset the visualization size on cancel.
    this.initialRenderSize = Size.EMPTY

    // The margins the handle is placed form the port visualization bounds.
    // The margins are applied in view coordinates. Default is `4`.
    this.margins = 4
  }

  /**
   * Returns the current location of the handle.
   * @type {!IPoint}
   */
  get location() {
    return this.calculateLocation()
  }

  /**
   * Calculates the location of the handle considering the {@link IPort.location port location},
   * {@link NodeStylePortStyleAdapter.renderSize render size} and {@link margins}.
   * @returns {!Point}
   */
  calculateLocation() {
    const portLocation = this.port.location
    let handleX = portLocation.x
    let handleY = portLocation.y
    const marginsInViewCoordinates = this.margins / this.context.zoom
    if (
      this.position === HandlePositions.NORTH_WEST ||
      this.position === HandlePositions.WEST ||
      this.position === HandlePositions.SOUTH_WEST
    ) {
      handleX -= this.adapter.renderSize.width / 2 + marginsInViewCoordinates
    } else if (
      this.position === HandlePositions.NORTH_EAST ||
      this.position === HandlePositions.EAST ||
      this.position === HandlePositions.SOUTH_EAST
    ) {
      handleX += this.adapter.renderSize.width / 2 + marginsInViewCoordinates
    }
    if (
      this.position === HandlePositions.NORTH_WEST ||
      this.position === HandlePositions.NORTH ||
      this.position === HandlePositions.NORTH_EAST
    ) {
      handleY -= this.adapter.renderSize.height / 2 + marginsInViewCoordinates
    } else if (
      this.position === HandlePositions.SOUTH_WEST ||
      this.position === HandlePositions.SOUTH ||
      this.position === HandlePositions.SOUTH_EAST
    ) {
      handleY += this.adapter.renderSize.height / 2 + marginsInViewCoordinates
    }
    return new Point(handleX, handleY)
  }

  /**
   * Stores the initial {@link NodeStylePortStyleAdapter.renderSize render size}.
   * @param {!IInputModeContext} context The context of the reshape gesture.
   */
  initializeDrag(context) {
    this.initialRenderSize = this.adapter.renderSize
  }

  /**
   * Calculates and applies the new {@link NodeStylePortStyleAdapter.renderSize render size}.
   * @param {!IInputModeContext} context The context of the reshape gesture.
   * @param {!Point} originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants the handle to be at.
   */
  handleMove(context, originalLocation, newLocation) {
    // calculate the size delta implied by the originalLocation and newLocation
    const delta = this.calculateDelta(originalLocation, newLocation)
    // calculate and apply the new render size
    this.adapter.renderSize = this.calculateNewSize(delta)
  }

  /**
   * Calculates the size adjustment for the port's render size from the previous and current
   * mouse location.
   * @param {!Point} originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants the handle to be at.
   * @returns {!Size}
   */
  calculateDelta(originalLocation, newLocation) {
    // calculate the delta the mouse has been moved since initializeDrag
    const mouseDelta = newLocation.subtract(originalLocation)
    // depending on the handle position this mouse delta shall increase or decrease the render size
    switch (this.position) {
      case HandlePositions.NORTH_WEST:
        return new Size(-2 * mouseDelta.x, -2 * mouseDelta.y)
      case HandlePositions.NORTH:
        return new Size(0, -2 * mouseDelta.y)
      case HandlePositions.NORTH_EAST:
        return new Size(2 * mouseDelta.x, -2 * mouseDelta.y)
      case HandlePositions.WEST:
        return new Size(-2 * mouseDelta.x, 0)
      case HandlePositions.EAST:
        return new Size(2 * mouseDelta.x, 0)
      case HandlePositions.SOUTH_WEST:
        return new Size(-2 * mouseDelta.x, 2 * mouseDelta.y)
      case HandlePositions.SOUTH:
        return new Size(0, 2 * mouseDelta.y)
      case HandlePositions.SOUTH_EAST:
        return new Size(2 * mouseDelta.x, 2 * mouseDelta.y)
    }
    return Size.EMPTY
  }

  /**
   * Calculates the new render size for the port from the current render size and the given
   * size adjustment while respecting the {@link minimumSize minimum size}.
   * @param {!Size} delta the size adjustment for the port's render size.
   * @returns {!Size}
   */
  calculateNewSize(delta) {
    const newWidth = Math.max(this.minimumSize.width, this.initialRenderSize.width + delta.width)
    const newHeight = Math.max(
      this.minimumSize.height,
      this.initialRenderSize.height + delta.height
    )
    return new Size(newWidth, newHeight)
  }

  /**
   * Resets the {@link NodeStylePortStyleAdapter.renderSize render size} to its initial value.
   * @param {!IInputModeContext} context The context of the reshape gesture.
   * @param {!Point} originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   */
  cancelDrag(context, originalLocation) {
    this.adapter.renderSize = this.initialRenderSize
  }

  /**
   * Calculates and applies the final {@link NodeStylePortStyleAdapter.renderSize render size}.
   * @param {!IInputModeContext} context The context of the reshape gesture.
   * @param {!Point} originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants the handle to be at.
   */
  dragFinished(context, originalLocation, newLocation) {
    const delta = this.calculateDelta(originalLocation, newLocation)
    this.adapter.renderSize = this.calculateNewSize(delta)
  }

  /**
   * Returns {@link HandleTypes.RESIZE}.
   * @type {!HandleTypes}
   */
  get type() {
    return HandleTypes.RESIZE
  }

  /**
   * Returns a resize cursor matching the handle position.
   * @type {!Cursor}
   */
  get cursor() {
    switch (this.position) {
      case HandlePositions.SOUTH:
      case HandlePositions.NORTH:
        return Cursor.NS_RESIZE
      case HandlePositions.EAST:
      case HandlePositions.WEST:
        return Cursor.EW_RESIZE
      case HandlePositions.NORTH_WEST:
      case HandlePositions.SOUTH_EAST:
        return Cursor.NWSE_RESIZE
      case HandlePositions.NORTH_EAST:
      case HandlePositions.SOUTH_WEST:
        return Cursor.NESW_RESIZE
    }
    return Cursor.NONE
  }

  /**
   * This implementation does nothing special when clicked.
   * @param {!ClickEventArgs} evt
   */
  handleClick(evt) {}
}
