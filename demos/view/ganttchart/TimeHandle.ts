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
  HandleTypes,
  IEnumerable,
  IHandle,
  IHandleProvider,
  IInputModeContext,
  INode,
  IPoint,
  List,
  Point
} from 'yfiles'

/**
 * A handle implementation that modifies the lead or followUp time of an activity.
 */
export class TimeHandle extends BaseClass<IHandle, IPoint>(IHandle, IPoint) {
  private readonly _isFollowUpTime: boolean
  /**
   * Stores the time when at which the drag operation was started.
   */
  private _originalTime = 0

  /**
   * Creates a new instance fo the given node.
   * @param node The node whose lead or followUp time is changed through this handle.
   * @param isFollowUpTime Whether this handle should change the lead or followUp time.
   */
  constructor(private readonly node: INode, isFollowUpTime: boolean) {
    super()
    this._isFollowUpTime = isFollowUpTime
  }

  get cursor(): Cursor {
    return Cursor.EW_RESIZE
  }

  get location(): IPoint {
    return this
  }

  get type(): HandleTypes {
    return HandleTypes.MOVE
  }

  get x(): number {
    // return the right side of the node plus the followUp time, or the left minus the lead time
    return this.isFollowUpTime
      ? this.node.layout.x + this.node.layout.width + this.getTime()
      : this.node.layout.x - this.getTime()
  }

  get y(): number {
    // return the vertical center of the layout
    return this.node.layout.y + this.node.layout.height * 0.5
  }

  get item(): INode {
    return this.node
  }

  /**
   * Determines the original lead or follow-up time for the associated activity node when a resize
   * gesture starts.
   * @param context The context to retrieve information about the drag from.
   */
  initializeDrag(context: IInputModeContext): void {
    // remember the time at the drag start
    this._originalTime = this.getTime()
  }

  /**
   * Adjusts the lead or follow-up time for the associated activity node during node resize
   * operations.
   * @param context The context to retrieve information about the drag from.
   * @param originalLocation The value of the {@link IHandle.location} property at the time of
   * {@link IHandle.initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the
   * handle to be at. Depending on the implementation the {@link IHandle.location} may or may
   * not be modified to reflect the new value.
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): boolean {
    // get current value
    const oldTime = this.getTime()
    // get value from new handle location
    const newTime = this.calculateTime(newLocation)
    if (oldTime !== newTime) {
      // if values differ, update the time
      this.setTime(newTime)
      return true // return that something changed
    }
    return false // nothing changed
  }

  /**
   * Adjusts the lead or follow-up time for the associated activity node when a node resize is
   * finished.
   * @param context The context to retrieve information about the drag from.
   * @param originalLocation The value of the {@link IHandle.location} property at the time of
   * {@link IHandle.initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the
   * handle to be at. Depending on the implementation the {@link IHandle.location} may or may
   * not be modified to reflect the new value. This is the same value as delivered in the last
   * invocation of {@link IHandle.handleMove}
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    this.setTime(this.calculateTime(newLocation))
  }

  /**
   * Resets the lead of follow-up time for the associated activity node when a resize gesture is
   * cancelled.
   * @param context The context to retrieve information about the drag from.
   * @param originalLocation The value of the coordinate of the {@link IHandle.location}
   * property at the time of {@link IHandle.initializeDrag}.
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    // assign original value
    this.setTime(this._originalTime)
  }

  /**
   * This implementation does nothing special when clicked.
   */
  handleClick(evt: ClickEventArgs): void {}

  private calculateTime(newLocation: Point): number {
    return this.isFollowUpTime
      ? Math.max(0, newLocation.x - (this.node.layout.x + this.node.layout.width))
      : Math.max(0, this.node.layout.x - newLocation.x)
  }

  /**
   * Gets the new value from the node tag.
   */
  getTime(): number {
    // read the value from the tag
    const time = this.isFollowUpTime ? this.node.tag.followUpTimeWidth : this.node.tag.leadTimeWidth
    return time || 0
  }

  /**
   * Stores the new value in the node tag.
   */
  private setTime(val: number): void {
    if (this.isFollowUpTime) {
      this.node.tag.followUpTimeWidth = val
    } else {
      this.node.tag.leadTimeWidth = val
    }
  }

  /**
   * Returns true if this handle changes its node's followUp time and false otherwise.
   */
  get isFollowUpTime(): boolean {
    return this._isFollowUpTime
  }
}

/**
 * A handle provider for the time handles.
 */
export class TimeHandleProvider extends BaseClass<IHandleProvider>(IHandleProvider) {
  /**
   * Creates a new instance for the given node.
   */
  constructor(private readonly node: INode) {
    super()
  }

  /**
   * Returns handles for changing the lead and followUp times of the provider's node.
   */
  getHandles(context: IInputModeContext): IEnumerable<IHandle> {
    const leadTimeHandle = new TimeHandle(this.node, false)
    const followUpTimeHandle = new TimeHandle(this.node, true)
    return new List([leadTimeHandle, followUpTimeHandle])
  }
}
