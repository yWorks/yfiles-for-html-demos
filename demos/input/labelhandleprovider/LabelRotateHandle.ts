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
  CanvasComponent,
  ClickEventArgs,
  Cursor,
  HandleTypes,
  ICanvasObject,
  IHandle,
  IInputModeContext,
  ILabel,
  ILabelModelParameterFinder,
  IPoint,
  OrientedRectangle,
  OrientedRectangleIndicatorInstaller,
  Point,
  Size
} from 'yfiles'

/**
 * A custom {@link IHandle} implementation that implements the functionality needed for rotating a label.
 */
export default class LabelRotateHandle extends BaseClass(IHandle) implements IHandle {
  readonly label: ILabel
  inputModeContext: IInputModeContext
  private handleLocation: LabelRotateHandleLivePoint = new LabelRotateHandleLivePoint(this)
  emulate = false
  dummyLocation: Point = null!
  up: Point = null!
  private rotationCenter: Point = null!
  private rotationIndicator: ICanvasObject | null = null

  /**
   * Creates a rotate handler for the given label.
   * @param label The given label
   * @param context The context to retrieve information
   */
  constructor(label: ILabel, context: IInputModeContext) {
    super()
    this.label = label
    this.inputModeContext = context
  }

  /**
   * Gets the type of the handler.
   */
  get type(): HandleTypes {
    return HandleTypes.ROTATE
  }

  /**
   * Returns the cursor object.
   */
  get cursor(): Cursor {
    return Cursor.CROSSHAIR
  }

  /**
   * Returns the handler's location.
   */
  get location(): IPoint {
    return this.handleLocation
  }

  /**
   * Invoked when dragging is about to start.
   * @param context The context to retrieve information
   */
  initializeDrag(context: IInputModeContext): void {
    this.inputModeContext = context
    // start using the calculated dummy bounds
    this.emulate = true
    const labelLayout = this.label.layout
    this.dummyLocation = labelLayout.anchorLocation
    this.up = labelLayout.upVector

    this.rotationCenter = labelLayout.orientedRectangleCenter
    const canvasComponent = context.canvasComponent
    if (canvasComponent !== null) {
      this.rotationIndicator = this.createAngleIndicator(canvasComponent)
    }
  }

  /**
   * Creates the indicator that shows the rotation angle of the label during drag.
   */
  private createAngleIndicator(canvasComponent: CanvasComponent) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const handle = this
    const indicatorInstaller = new (class extends OrientedRectangleIndicatorInstaller {
      getRectangle(item: any | null): OrientedRectangle {
        return handle.getCurrentLabelLayout()
      }
    })()
    return indicatorInstaller.addCanvasObject(
      canvasComponent.canvasContext,
      canvasComponent.selectionGroup,
      this
    )
  }

  /**
   * Invoked when an element has been dragged and its position should be updated.
   * @param context The context to retrieve information
   * @param originalLocation The value of the location property at the time of initializeDrag
   * @param newLocation The new location in the world coordinate system
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    // calculate the up vector
    this.up = newLocation.subtract(this.rotationCenter).normalized

    // and the anchor point
    const preferredSize = this.label.preferredSize

    const p2X = -preferredSize.width * 0.5
    const p2Y = preferredSize.height * 0.5

    const anchorX = this.rotationCenter.x - p2X * this.up.y - p2Y * this.up.x
    const anchorY = this.rotationCenter.y - (p2Y * this.up.y - p2X * this.up.x)

    // calculate the new location
    this.dummyLocation = new Point(anchorX, anchorY)
  }

  /**
   * Invoked when dragging has canceled.
   * @param context The context to retrieve information
   * @param originalLocation The value of the location property at the time of initializeDrag
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    // use the normal label bounds if the drag gesture is over
    this.emulate = false
    // remove the visual size indicator
    this.rotationIndicator?.remove()
    this.rotationIndicator = null
  }

  /**
   * Invoked when dragging has finished.
   * @param context The context to retrieve information
   * @param originalLocation The value of the location property at the time of initializeDrag
   * @param newLocation The new location in the world coordinate system
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point) {
    const graph = context.graph
    if (graph !== null) {
      const model = this.label.layoutParameter.model
      const finder = model.lookup(ILabelModelParameterFinder.$class)
      if (finder !== null) {
        const param = finder.findBestParameter(this.label, model, this.getCurrentLabelLayout())
        graph.setLabelLayoutParameter(this.label, param)
      }
    }
    this.cancelDrag(context, originalLocation)
  }

  /**
   * Returns the current label layout.
   */
  getCurrentLabelLayout(): OrientedRectangle {
    const preferredSize = this.label.preferredSize
    const labelLayout = this.label.layout
    return new OrientedRectangle(
      this.emulate ? this.dummyLocation.x : labelLayout.anchorX,
      this.emulate ? this.dummyLocation.y : labelLayout.anchorY,
      preferredSize.width,
      preferredSize.height,
      this.up.x,
      this.up.y
    )
  }

  /**
   * This implementation does nothing special when clicked.
   */
  handleClick(evt: ClickEventArgs): void {}
}

/**
 * Represents the new resize point for the given handler.
 */
class LabelRotateHandleLivePoint extends BaseClass(IPoint) implements IPoint {
  /**
   * Creates a new point for the given handle.
   * @param handle The given handle
   */
  constructor(private readonly handle: LabelRotateHandle) {
    super()
  }

  /**
   * Returns the x-coordinate of the location of the handle from the anchor, the size and the orientation.
   */
  get x(): number {
    const { anchor, up, preferredSize, offset } = this.getPositionInfo()
    return anchor.x + up.x * (preferredSize.height + offset) + -up.y * (preferredSize.width * 0.5)
  }

  /**
   * Returns the y-coordinate of the location of the handle from the anchor, the size and the orientation.
   */
  get y(): number {
    const { anchor, up, preferredSize, offset } = this.getPositionInfo()
    return anchor.y + up.y * (preferredSize.height + offset) + up.x * (preferredSize.width * 0.5)
  }

  /**
   * Prepares all relevant information needed to calculate the position of the handle.
   */
  private getPositionInfo(): { offset: number; anchor: Point; preferredSize: Size; up: Point } {
    const preferredSize = this.handle.label.preferredSize
    const labelLayout = this.handle.label.layout
    const anchor = this.handle.emulate ? this.handle.dummyLocation : labelLayout.anchorLocation
    const up = this.handle.emulate ? this.handle.up : labelLayout.upVector
    // calculate the location of the handle from the anchor, the size and the orientation
    const offset =
      this.handle.inputModeContext !== null
        ? 20 / this.handle.inputModeContext.canvasComponent!.zoom
        : 20
    return { anchor, up, preferredSize, offset }
  }
}
