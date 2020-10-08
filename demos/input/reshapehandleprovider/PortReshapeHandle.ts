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
  BaseClass,
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

export class PortReshapeHandle extends BaseClass<IHandle>(IHandle) {
  readonly context: IInputModeContext
  readonly port: IPort
  readonly adapter: NodeStylePortStyleAdapter
  readonly position: HandlePositions

  /**
   * The initial RenderSize used to reset the size on Cancel.
   */
  private initialRenderSize: Size = Size.EMPTY

  /**
   * The margins the handle is placed form the port visualization bounds.
   * The margins are applied in view coordinates. Default is <c>4</c>.
   */
  public margins: number

  /**
   * The minimum size the {@link NodeStylePortStyleAdapter.renderSize} may have.
   */
  public minimumSize: Size = Size.EMPTY

  /**
   * Creates a new instance for port and its adapter.
   * @param context The context of the reshape gesture.
   * @param port The port whose visualization shall be resized.
   * @param adapter The adapter whose render size shall be changed.
   * @param position The position of the handle.
   */
  public constructor(
    context: IInputModeContext,
    port: IPort,
    adapter: NodeStylePortStyleAdapter,
    position: HandlePositions
  ) {
    super()
    this.context = context
    this.position = position
    this.adapter = adapter
    this.port = port
    this.margins = 4
  }

  /**
   * Returns the current location of the handle.
   */
  public get location(): IPoint {
    return this.calculateLocation()
  }

  /**
   * Calculates the location of the handle considering the {@link IPort.location port location},
   * {@link NodeStylePortStyleAdapter.renderSize} and {@link margins}.
   */
  private calculateLocation(): Point {
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
   * Stores the initial {@link NodeStylePortStyleAdapter.renderSize}.
   * @param context The context of the reshape gesture.
   */
  public initializeDrag(context: IInputModeContext): void {
    this.initialRenderSize = this.adapter.renderSize
  }

  /**
   * Calculates and applies the new {@link NodeStylePortStyleAdapter.renderSize}.
   * @param context The context of the reshape gesture.
   * @param originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the handle to be at.
   */
  public handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    // calculate the size delta implied by the originalLocation and newLocation
    const delta = this.calculateDelta(originalLocation, newLocation)
    // calculate and apply the new render size
    this.adapter.renderSize = this.calculateNewSize(delta)
  }

  private calculateDelta(originalLocation: Point, newLocation: Point): Size {
    // calculate the delta the mouse has been moved since InitializeDrag
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

  private calculateNewSize(delta: Size): Size {
    const newWidth = Math.max(this.minimumSize.width, this.initialRenderSize.width + delta.width)
    const newHeight = Math.max(
      this.minimumSize.height,
      this.initialRenderSize.height + delta.height
    )
    return new Size(newWidth, newHeight)
  }

  /**
   * Resets {@link NodeStylePortStyleAdapter.renderSize} to its initial value.
   * @param context The context of the reshape gesture.
   * @param originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   */
  public cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.adapter.renderSize = this.initialRenderSize
  }

  /**
   * Calculates and applies the final {@link NodeStylePortStyleAdapter.renderSize}.
   * @param context The context of the reshape gesture.
   * @param originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the handle to be at.
   */
  public dragFinished(
    context: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): void {
    const delta = this.calculateDelta(originalLocation, newLocation)
    this.adapter.renderSize = this.calculateNewSize(delta)
  }

  /**
   * Returns {@link HandleTypes.RESIZE}.
   */
  public get type(): HandleTypes {
    return HandleTypes.RESIZE
  }

  /**
   * Returns a resize cursor matching the handle position.
   */
  public get cursor(): Cursor {
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
}
