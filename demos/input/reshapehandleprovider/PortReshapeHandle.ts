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
  Cursor,
  HandlePositions,
  HandleType,
  IHandle,
  type IInputModeContext,
  type IPoint,
  type IPort,
  Point,
  type ShapePortStyle,
  Size
} from '@yfiles/yfiles'

export class PortReshapeHandle extends BaseClass(IHandle) {
    private readonly minimumSize: Size;
    private readonly position: HandlePositions;
    private readonly portStyle: ShapePortStyle;
    private readonly port: IPort;
    private readonly context: IInputModeContext;
  /**
   * The margins the handle is placed form the port visualization bounds.
   * The margins are applied in view coordinates. Default is `4`.
   */
  public margins: number

  /**
   * The initial render size (i.e. the size of the port visualization). Used to reset the visualization size on cancel.
   */
  private initialRenderSize: Size = Size.EMPTY

  /**
   * Creates a new instance for port and its adapter.
   * @param context The context of the reshape gesture.
   * @param port The port whose visualization shall be resized.
   * @param portStyle The adapter whose render size shall be changed.
   * @param position The position of the handle.
   * @param minimumSize The minimum render size for the given port.
   */
  public constructor(
    context: IInputModeContext,
    port: IPort,
    portStyle: ShapePortStyle,
    position: HandlePositions,
    minimumSize: Size
  ) {
    super()
      this.context = context;
      this.port = port;
      this.portStyle = portStyle;
      this.position = position;
      this.minimumSize = minimumSize;
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
   * {@link ShapePortStyle.renderSize render size} and {@link margins}.
   */
  private calculateLocation(): Point {
    const portLocation = this.port.location
    let handleX = portLocation.x
    let handleY = portLocation.y
    const marginsInViewCoordinates = this.margins / this.context.zoom
    if (
      this.position === HandlePositions.TOP_LEFT ||
      this.position === HandlePositions.LEFT ||
      this.position === HandlePositions.BOTTOM_LEFT
    ) {
      handleX -= this.portStyle.renderSize.width / 2 + marginsInViewCoordinates
    } else if (
      this.position === HandlePositions.TOP_RIGHT ||
      this.position === HandlePositions.RIGHT ||
      this.position === HandlePositions.BOTTOM_RIGHT
    ) {
      handleX += this.portStyle.renderSize.width / 2 + marginsInViewCoordinates
    }
    if (
      this.position === HandlePositions.TOP_LEFT ||
      this.position === HandlePositions.TOP ||
      this.position === HandlePositions.TOP_RIGHT
    ) {
      handleY -= this.portStyle.renderSize.height / 2 + marginsInViewCoordinates
    } else if (
      this.position === HandlePositions.BOTTOM_LEFT ||
      this.position === HandlePositions.BOTTOM ||
      this.position === HandlePositions.BOTTOM_RIGHT
    ) {
      handleY += this.portStyle.renderSize.height / 2 + marginsInViewCoordinates
    }
    return new Point(handleX, handleY)
  }

  /**
   * Stores the initial {@link ShapePortStyle.renderSize render size}.
   * @param context The context of the reshape gesture.
   */
  public initializeDrag(context: IInputModeContext): void {
    this.initialRenderSize = this.portStyle.renderSize
  }

  /**
   * Calculates and applies the new {@link ShapePortStyle.renderSize render size}.
   * @param context The context of the reshape gesture.
   * @param originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the handle to be at.
   */
  public handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    // calculate the size delta implied by the originalLocation and newLocation
    const delta = this.calculateDelta(originalLocation, newLocation)
    // calculate and apply the new render size
    this.portStyle.renderSize = this.calculateNewSize(delta)
  }

  /**
   * Calculates the size adjustment for the port's render size from the previous and current
   * mouse location.
   * @param originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the handle to be at.
   */
  private calculateDelta(originalLocation: Point, newLocation: Point): Size {
    // calculate the delta the mouse has been moved since initializeDrag
    const mouseDelta = newLocation.subtract(originalLocation)
    // depending on the handle position this mouse delta shall increase or decrease the render size
    switch (this.position) {
      case HandlePositions.TOP_LEFT:
        return new Size(-2 * mouseDelta.x, -2 * mouseDelta.y)
      case HandlePositions.TOP:
        return new Size(0, -2 * mouseDelta.y)
      case HandlePositions.TOP_RIGHT:
        return new Size(2 * mouseDelta.x, -2 * mouseDelta.y)
      case HandlePositions.LEFT:
        return new Size(-2 * mouseDelta.x, 0)
      case HandlePositions.RIGHT:
        return new Size(2 * mouseDelta.x, 0)
      case HandlePositions.BOTTOM_LEFT:
        return new Size(-2 * mouseDelta.x, 2 * mouseDelta.y)
      case HandlePositions.BOTTOM:
        return new Size(0, 2 * mouseDelta.y)
      case HandlePositions.BOTTOM_RIGHT:
        return new Size(2 * mouseDelta.x, 2 * mouseDelta.y)
    }
    return Size.EMPTY
  }

  /**
   * Calculates the new render size for the port from the current render size and the given
   * size adjustment while respecting the {@link minimumSize minimum size}.
   * @param delta the size adjustment for the port's render size.
   */
  private calculateNewSize(delta: Size): Size {
    const newWidth = Math.max(this.minimumSize.width, this.initialRenderSize.width + delta.width)
    const newHeight = Math.max(
      this.minimumSize.height,
      this.initialRenderSize.height + delta.height
    )
    return new Size(newWidth, newHeight)
  }

  /**
   * Resets the {@link ShapePortStyle.renderSize render size} to its initial value.
   * @param context The context of the reshape gesture.
   * @param originalLocation The value of the {@link location} property at the time of {@link initializeDrag}.
   */
  public cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    this.portStyle.renderSize = this.initialRenderSize
  }

  /**
   * Calculates and applies the final {@link ShapePortStyle.renderSize render size}.
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
    this.portStyle.renderSize = this.calculateNewSize(delta)
  }

  /**
   * Returns {@link HandleType.RESIZE}.
   */
  public get type(): HandleType {
    return HandleType.RESIZE
  }

  /**
   *  Gets an optional tag object associated with the handle.
   */
  public get tag(): any {
    return null
  }

  /**
   * Returns a resize cursor matching the handle position.
   */
  public get cursor(): Cursor {
    switch (this.position) {
      case HandlePositions.BOTTOM:
      case HandlePositions.TOP:
        return Cursor.NS_RESIZE
      case HandlePositions.RIGHT:
      case HandlePositions.LEFT:
        return Cursor.EW_RESIZE
      case HandlePositions.TOP_LEFT:
      case HandlePositions.BOTTOM_RIGHT:
        return Cursor.NWSE_RESIZE
      case HandlePositions.TOP_RIGHT:
      case HandlePositions.BOTTOM_LEFT:
        return Cursor.NESW_RESIZE
    }
    return Cursor.NONE
  }

  /**
   * This implementation does nothing special when clicked.
   */
  handleClick(evt: ClickEventArgs): void {}
}
