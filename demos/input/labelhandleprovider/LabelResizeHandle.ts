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
 * A custom {@link IHandle} implementation that allows resizing a label.
 */
export default class LabelResizeHandle extends BaseClass(IHandle) implements IHandle {
  private sizeIndicator: ICanvasObject | null = null
  private handleLocation: IPoint = new LabelResizeHandleLivePoint(this)
  emulate = false
  dummyPreferredSize: Size = null!
  dummyLocation: Point = null!

  /**
   * Creates a new instance of {@link LabelResizeHandle}.
   * @param label The label this handle is for
   * @param symmetricResize A value indicating whether resizing should be symmetric
   */
  constructor(
    readonly label: ILabel,
    private readonly symmetricResize: boolean
  ) {
    super()
  }

  /**
   * Gets the type of the handle.
   */
  get type(): HandleTypes {
    return HandleTypes.RESIZE
  }

  /**
   * Returns the handle's cursor.
   */
  get cursor(): Cursor {
    return Cursor.EW_RESIZE
  }

  /**
   * Returns the handle's location.
   */
  get location(): IPoint {
    return this.handleLocation
  }

  /**
   * Invoked when dragging is about to start.
   * @param context The context to retrieve information
   */
  initializeDrag(context: IInputModeContext): void {
    // start using the calculated dummy bounds
    this.emulate = true
    this.dummyPreferredSize = this.label.preferredSize
    this.dummyLocation = this.label.layout.anchorLocation
    const canvasComponent = context.canvasComponent
    if (canvasComponent !== null) {
      this.sizeIndicator = this.createSizeIndicator(canvasComponent)
    }
  }

  /**
   * Creates the indicator that shows the size of the label during drag.
   */
  private createSizeIndicator(canvasComponent: CanvasComponent) {
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
   * @param originalLocation The value of the location property at the time of
   *   initializeDrag
   * @param newLocation The new location in the world coordinate system
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    const layout = this.label.layout
    // the normal (orthogonal) vector of the 'up' vector
    const upNormal = new Point(-layout.upY, layout.upX)

    // calculate the total distance the handle has been moved in this drag gesture
    let delta: number = upNormal.scalarProduct(newLocation.subtract(originalLocation))

    // max with minus half the label size - because the label width can't shrink below zero
    delta = Math.max(delta, -layout.width * (this.symmetricResize ? 0.5 : 1))

    // add one or two times delta to the width to expand the label right and left
    const newWidth = layout.width + delta * (this.symmetricResize ? 2 : 1)
    this.dummyPreferredSize = new Size(newWidth, this.dummyPreferredSize.height)
    // calculate the new location
    this.dummyLocation = layout.anchorLocation.subtract(
      this.symmetricResize ? new Point(upNormal.x * delta, upNormal.y * delta) : new Point(0, 0)
    )
  }

  /**
   * Invoked when dragging has canceled.
   * @param context The context to retrieve information
   * @param originalLocation The value of the location property at the time of
   *   initializeDrag
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    // use the normal label bounds if the drag gesture is over
    this.emulate = false
    // remove the visual size indicator
    this.sizeIndicator?.remove()
    this.sizeIndicator = null
  }

  /**
   * Invoked when dragging has finished.
   * @param context The context to retrieve information
   * @param originalLocation The value of the location property at the time of
   *   initializeDrag
   * @param newLocation The new location in the world coordinate system
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point) {
    const graph = context.graph
    if (graph !== null) {
      // assign the new size
      graph.setLabelPreferredSize(this.label, this.dummyPreferredSize)

      // Use the layout of the resize rectangle to find a new labelLayoutParameter. This ensures
      // that the resize rectangle which acts as user feedback is in sync with the actual
      // labelLayoutParameter that is assigned to the label.
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
  private getCurrentLabelLayout(): OrientedRectangle {
    const labelLayout = this.label.layout
    if (this.emulate) {
      return new OrientedRectangle(
        this.dummyLocation.x,
        this.dummyLocation.y,
        this.dummyPreferredSize.width,
        this.dummyPreferredSize.height,
        labelLayout.upX,
        labelLayout.upY
      )
    }
    return new OrientedRectangle(
      labelLayout.anchorX,
      labelLayout.anchorY,
      this.label.preferredSize.width,
      this.label.preferredSize.height,
      labelLayout.upX,
      labelLayout.upY
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
class LabelResizeHandleLivePoint extends BaseClass(IPoint) implements IPoint {
  /**
   * Creates a new point for the given handler.
   * @param handle The given handler
   */
  constructor(private readonly handle: LabelResizeHandle) {
    super()
  }

  /**
   * Returns the x-coordinate of the location of the handle from the anchor, the size and the
   * orientation.
   */
  get x(): number {
    const { anchor, up, preferredSize } = this.getPositionInfo()
    return anchor.x + (up.x * preferredSize.height * 0.5 - up.y * preferredSize.width)
  }

  /**
   * Returns the y-coordinate of the location of the handle from the anchor, the size and the
   * orientation.
   */
  get y(): number {
    const { anchor, up, preferredSize } = this.getPositionInfo()
    return anchor.y + (up.y * preferredSize.height * 0.5 + up.x * preferredSize.width)
  }

  /**
   * Prepares all relevant information needed to calculate the position of the handle.
   */
  private getPositionInfo(): { anchor: Point; preferredSize: Size; up: Point } {
    const layout = this.handle.label.layout
    const up = layout.upVector
    const preferredSize = this.handle.emulate
      ? this.handle.dummyPreferredSize
      : this.handle.label.preferredSize
    const anchor = this.handle.emulate ? this.handle.dummyLocation : layout.anchorLocation
    return { anchor, up, preferredSize }
  }
}
