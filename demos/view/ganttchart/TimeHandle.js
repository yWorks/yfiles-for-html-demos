/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
export class TimeHandle extends BaseClass(IHandle, IPoint) {
  /**
   * Creates a new instance fo the given node.
   * @param {!INode} node The node whose lead or followUp time is changed through this handle.
   * @param {boolean} isFollowUpTime Whether this handle should change the lead or followUp time.
   */
  constructor(node, isFollowUpTime) {
    super()
    this.node = node

    // Stores the time when at which the drag operation was started.
    this._originalTime = 0

    this._isFollowUpTime = isFollowUpTime
  }

  /**
   * @type {!Cursor}
   */
  get cursor() {
    return Cursor.EW_RESIZE
  }

  /**
   * @type {!IPoint}
   */
  get location() {
    return this
  }

  /**
   * @type {!HandleTypes}
   */
  get type() {
    return HandleTypes.MOVE
  }

  /**
   * @type {number}
   */
  get x() {
    // return the right side of the node plus the followUp time, or the left minus the lead time
    return this.isFollowUpTime
      ? this.node.layout.x + this.node.layout.width + this.getTime()
      : this.node.layout.x - this.getTime()
  }

  /**
   * @type {number}
   */
  get y() {
    // return the vertical center of the layout
    return this.node.layout.y + this.node.layout.height * 0.5
  }

  /**
   * @type {!INode}
   */
  get item() {
    return this.node
  }

  /**
   * Determines the original lead or follow-up time for the associated activity node when a resize
   * gesture starts.
   * @param {!IInputModeContext} context The context to retrieve information about the drag from.
   */
  initializeDrag(context) {
    // remember the time at the drag start
    this._originalTime = this.getTime()
  }

  /**
   * Adjusts the lead or follow-up time for the associated activity node during node resize
   * operations.
   * @param {!IInputModeContext} context The context to retrieve information about the drag from.
   * @param {!Point} originalLocation The value of the {@link IDragHandler#location} property at the time of
   * {@link IDragHandler#initializeDrag}.
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants the
   * handle to be at. Depending on the implementation the {@link IDragHandler#location} may or may
   * not be modified to reflect the new value.
   * @returns {boolean}
   */
  handleMove(context, originalLocation, newLocation) {
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
   * @param {!IInputModeContext} context The context to retrieve information about the drag from.
   * @param {!Point} originalLocation The value of the {@link IDragHandler#location} property at the time of
   * {@link IDragHandler#initializeDrag}.
   * @param {!Point} newLocation The coordinates in the world coordinate system that the client wants the
   * handle to be at. Depending on the implementation the {@link IDragHandler#location} may or may
   * not be modified to reflect the new value. This is the same value as delivered in the last
   * invocation of {@link IDragHandler#handleMove}
   */
  dragFinished(context, originalLocation, newLocation) {
    this.setTime(this.calculateTime(newLocation))
  }

  /**
   * Resets the lead of follow-up time for the associated activity node when a resize gesture is
   * cancelled.
   * @param {!IInputModeContext} context The context to retrieve information about the drag from.
   * @param {!Point} originalLocation The value of the coordinate of the {@link IDragHandler#location}
   * property at the time of {@link IDragHandler#initializeDrag}.
   */
  cancelDrag(context, originalLocation) {
    // assign original value
    this.setTime(this._originalTime)
  }

  /**
   * @param {!Point} newLocation
   * @returns {number}
   */
  calculateTime(newLocation) {
    return this.isFollowUpTime
      ? Math.max(0, newLocation.x - (this.node.layout.x + this.node.layout.width))
      : Math.max(0, this.node.layout.x - newLocation.x)
  }

  /**
   * Gets the new value from the node tag.
   * @returns {number}
   */
  getTime() {
    // read the value from the tag
    const time = this.isFollowUpTime ? this.node.tag.followUpTimeWidth : this.node.tag.leadTimeWidth
    return time || 0
  }

  /**
   * Stores the new value in the node tag.
   * @param {number} val
   */
  setTime(val) {
    if (this.isFollowUpTime) {
      this.node.tag.followUpTimeWidth = val
    } else {
      this.node.tag.leadTimeWidth = val
    }
  }

  /**
   * Returns true if this handle changes its node's followUp time and false otherwise.
   * @type {boolean}
   */
  get isFollowUpTime() {
    return this._isFollowUpTime
  }
}

/**
 * A handle provider for the time handles.
 */
export class TimeHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * Creates a new instance for the given node.
   * @param {!INode} node
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * Returns handles for changing the lead and followUp times of the provider's node.
   * @param {!IInputModeContext} context
   * @returns {!IEnumerable.<IHandle>}
   */
  getHandles(context) {
    const leadTimeHandle = new TimeHandle(this.node, false)
    const followUpTimeHandle = new TimeHandle(this.node, true)
    return new List([leadTimeHandle, followUpTimeHandle])
  }
}
