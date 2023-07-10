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
import type { ClickEventArgs, IInputModeContext, INode, IRenderContext, Point, Rect } from 'yfiles'
import {
  BaseClass,
  Cursor,
  HandlePositions,
  HandleTypes,
  IEnumerable,
  IHandle,
  IHandleProvider,
  IPoint,
  IRectangle,
  IReshapeHandler,
  IVisualTemplate,
  ReshapeHandlerHandle,
  SvgVisual
} from 'yfiles'
import {
  getDate,
  getFollowUpWidth,
  getLeadWidth,
  getMainActivityWidth,
  getMainActivityX,
  hoursToWorldLength,
  worldLengthToHours
} from '../gantt-utils'
import { type Activity, getActivity } from '../resources/data-model'
import { patternFill } from './ActivityNodeStyle'

/**
 * Provides the handles for an activity node. Each activity node contains four handles.
 * Two of them are placed on the left/right of the solid internal area and determine the activity duration,
 * while the other two have a hatch fill, are placed on the left/right of the complete node shape and determine
 * the lead/follow-up time of the activity.
 */
export class ActivityNodeHandleProvider extends BaseClass(IHandleProvider) {
  constructor(private readonly node: INode) {
    super()
  }

  getHandles(context: IInputModeContext): IEnumerable<IHandle> {
    // lead/follow-up duration handles
    const leadTimeHandle = new TimeHandle(this.node)
    const followUpTimeHandle = new TimeHandle(this.node, true)

    // activity duration handles
    const activityReshapeHandler = new ActivityNodeReshapeHandler(this.node)
    const eastWrappedHandle = new ReshapeHandlerHandle(HandlePositions.EAST, activityReshapeHandler)
    const westWrappedHandle = new ReshapeHandlerHandle(HandlePositions.WEST, activityReshapeHandler)

    // contains the four handles for the activity node
    return IEnumerable.from([
      leadTimeHandle,
      followUpTimeHandle,
      eastWrappedHandle,
      westWrappedHandle
    ])
  }
}

/**
 * Controls the node reshape operation. Enlarges the activity node, calculates the new
 * start/end dates and updates the activity data associated with the given node.
 */
class ActivityNodeReshapeHandler extends BaseClass(IReshapeHandler, IRectangle) {
  private readonly wrappedHandler: IReshapeHandler

  constructor(private readonly node: INode) {
    super()
    this.wrappedHandler = node.lookup(IReshapeHandler.$class)!
  }

  /**
   * Returns the bounds of this activity node.
   */
  get bounds(): IRectangle {
    return this
  }

  /**
   * Enlarges the node bounds based on the size of the lead and follow-up time, if any.
   */
  expandBounds(bounds: Rect): Rect {
    const activity = getActivity(this.node)
    return bounds.getEnlarged({
      left: getLeadWidth(activity),
      right: getFollowUpWidth(activity)
    })
  }

  /**
   * Delegates the call to the default reshape handle implementation of the node.
   */
  initializeReshape(context: IInputModeContext): void {
    this.wrappedHandler.initializeReshape(context)
  }

  /**
   * Delegates the call to the default reshape handle implementation of the node.
   * The current node bounds and the bounds that the node had when the reshaping started are also
   * expanded to consider the lead/follow-up time.
   */
  handleReshape(context: IInputModeContext, originalBounds: Rect, newBounds: Rect): void {
    this.wrappedHandler.handleReshape(
      context,
      this.expandBounds(originalBounds),
      this.expandBounds(newBounds)
    )
  }

  /**
   * When the reshaping finishes, the start/end dates are calculated and the data associated with
   * the current node are updated.
   */
  reshapeFinished(context: IInputModeContext, originalBounds: Rect, newBounds: Rect): void {
    this.wrappedHandler.reshapeFinished(
      context,
      this.expandBounds(originalBounds),
      this.expandBounds(newBounds)
    )

    // Write the actual date back to the activity
    const activity = getActivity(this.node)
    if (originalBounds.x !== newBounds.x) {
      const startDate = getDate(this.node.layout.x + getLeadWidth(activity))
      activity.startDate = startDate.toISOString()
    }
    if (originalBounds.maxX !== newBounds.maxX) {
      const endDate = getDate(this.node.layout.maxX - getFollowUpWidth(activity))
      activity.endDate = endDate.toISOString()
    }
  }

  /**
   * Cancels the reshaping gesture by delegating to the default
   * implementation of the node's reshape handler.
   */
  cancelReshape(context: IInputModeContext, originalBounds: Rect): void {
    this.wrappedHandler.cancelReshape(context, this.expandBounds(originalBounds))
  }

  /**
   * Returns the x-coordinate where the 'solid' part of the activity node lies.
   */
  get x(): number {
    return this.node.layout.x + getLeadWidth(getActivity(this.node))
  }

  /**
   * Returns the y-coordinate of the activity node lies.
   */
  get y(): number {
    return this.node.layout.y
  }

  /**
   * Returns the actual width of the 'solid' part of the activity node
   * i.e., without considering the lead/ follow-up time.
   */
  get width(): number {
    return (
      this.node.layout.width -
      getLeadWidth(getActivity(this.node)) -
      getFollowUpWidth(getActivity(this.node))
    )
  }

  /**
   * Returns the height of the activity node.
   */
  get height(): number {
    return this.node.layout.height
  }
}

/**
 * A handle implementation that modifies the lead or follow-up time of an activity.
 */
export class TimeHandle extends BaseClass(IHandle, IPoint) {
  /**
   * Stores the time when at which the drag operation was started.
   */
  private originalDuration = 0
  private minimumWidth = 0
  private originalNodeLayout?: Rect
  private readonly activity: Activity
  private originalExtent = 0

  constructor(readonly node: INode, readonly isFollowUpTime = false) {
    super()
    this.activity = getActivity(this.node)
  }

  /**
   * Determines the original lead or follow-up time for the associated activity node when a resize
   * gesture starts.
   */
  initializeDrag(context: IInputModeContext): void {
    this.minimumWidth =
      this.node.layout.width -
      (this.isFollowUpTime ? getFollowUpWidth(this.activity) : getLeadWidth(this.activity))
    this.originalNodeLayout = this.node.layout.toRect()
    this.originalDuration = this.getDuration()
    this.originalExtent = this.isFollowUpTime
      ? this.node.layout.maxX - getFollowUpWidth(this.activity)
      : this.node.layout.x + getLeadWidth(this.activity)
  }

  /**
   * Adjusts the lead or follow-up time for the associated activity node during node resize
   * operations.
   */
  handleMove(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    const newDuration = this.calculateNewDuration(newLocation)
    this.setNewDuration(newDuration)
    const newLength = hoursToWorldLength(newDuration)
    const newNodeLayout = this.calculateNewNodeLayout(newLength)
    context.graph?.setNodeLayout(this.node, newNodeLayout)
  }

  /**
   * Adjusts the lead or follow-up time for the associated activity node when a resize gesture is
   * finished.
   */
  dragFinished(context: IInputModeContext, originalLocation: Point, newLocation: Point): void {
    // Nothing to do: We've already updated everything in handleMove
  }

  /**
   * Resets the lead or follow-up time for the associated activity node when a resize gesture is
   * cancelled.
   */
  cancelDrag(context: IInputModeContext, originalLocation: Point): void {
    context.graph?.setNodeLayout(this.node, this.originalNodeLayout!)
    this.setNewDuration(this.originalDuration)
  }

  handleClick(evt: ClickEventArgs): void {
    // we don't handle clicks
  }

  /**
   * Calculates the duration of an activity based on the new location and whether the time is follow-up.
   */
  private calculateNewDuration(newLocation: Point): number {
    if (this.isFollowUpTime) {
      const newWidth = Math.max(0, newLocation.x - this.originalExtent)
      return Math.round(worldLengthToHours(newWidth)) // Quantize to full hours
    } else {
      const newWidth = Math.max(0, this.originalExtent - newLocation.x)
      return Math.round(worldLengthToHours(newWidth)) // Quantize to full hours
    }
  }

  /**
   * Calculates the new bounds of the node based on the new duration of the activity.
   */
  private calculateNewNodeLayout(newLength: number): Rect {
    const widthChange = newLength - hoursToWorldLength(this.originalDuration)
    return this.originalNodeLayout!.getEnlarged(
      this.isFollowUpTime ? { right: widthChange } : { left: widthChange }
    )
  }

  /**
   * Returns the new lead or follow-up time stored in the data of this activity.
   */
  getDuration(): number {
    // read the value for the specific activity
    const time = this.isFollowUpTime ? this.activity.followUpTime : this.activity.leadTime
    return time ?? 0
  }

  /**
   * Stores the new lead or follow-up time in hours in the data of this activity.
   */
  private setNewDuration(hours: number): void {
    if (this.isFollowUpTime) {
      this.activity.followUpTime = hours
    } else {
      this.activity.leadTime = hours
    }
  }

  /**
   * Returns the types of handles for the activity nodes.
   */
  get type(): HandleTypes {
    return HandleTypes.RESIZE | HandleTypes.VARIANT2
  }

  /**
   * Returns the type of cursor for this handle.
   */
  get cursor(): Cursor {
    return Cursor.EW_RESIZE
  }

  /**
   * Returns the location of this handle.
   */
  get location(): IPoint {
    return this
  }

  /**
   * Returns the x-position of this handle based on whether the time is lead or follow-up.
   */
  get x(): number {
    const activity = this.activity
    if (this.isFollowUpTime) {
      return (
        getMainActivityX(activity, this.node) +
        getMainActivityWidth(activity, this.node) +
        Math.max(12, getFollowUpWidth(activity) + 6)
      )
    } else {
      return getMainActivityX(activity, this.node) - Math.max(12, getLeadWidth(activity) + 6)
    }
  }

  /**
   * Returns the y-coordinate of the center of the node.
   */
  get y(): number {
    return this.node.layout.center.y
  }
}

/**
 * A handle template for {@link TimeHandle}s, so that they can look different from the normal
 * resize handles.
 */
export class TimeHandleTemplate extends BaseClass(IVisualTemplate) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createVisual(context: IRenderContext, bounds: Rect, dataObject: any): SvgVisual | null {
    const radius = 10

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const d = `M ${radius} ${radius} h -${radius * 0.5} a ${radius} ${radius} 0 0 1 0 -${
      radius * 2
    } h ${radius * 0.5} z`
    path.setAttribute('d', d)
    path.setAttribute('fill', 'black')
    path.setAttribute('stroke', 'white')
    path.setAttribute('stroke-width', '5')

    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pattern.setAttribute('d', d)
    patternFill.applyTo(pattern, context)
    pattern.setAttribute('stroke', 'black')
    pattern.setAttribute('stroke-width', '1.5')

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.append(path, pattern)
    const scale = (dataObject as TimeHandle).isFollowUpTime ? -5 / radius : 5 / radius
    g.setAttribute('transform', `scale(${scale})`)

    return new SvgVisual(g)
  }

  updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual,
    bounds: Rect,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataObject: any
  ): SvgVisual | null {
    return oldVisual
  }
}
