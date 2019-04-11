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
import {
  BaseClass,
  Cursor,
  HandleTypes,
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
  /***
   * Creates a new instance fo the given node.
   * @param {INode} node The node.
   * @param {boolean} isFollowUpTime Whether this handle should change the lead or followUp time.
   */
  constructor(node, isFollowUpTime) {
    super()
    this.$node = node
    this.followUpTime = isFollowUpTime
  }

  /**
   * @returns {Cursor}
   */
  get cursor() {
    return Cursor.EW_RESIZE
  }

  /**
   * @returns {IPoint}
   */
  get location() {
    return this
  }

  /**
   * @returns {HandleTypes}
   */
  get type() {
    return HandleTypes.MOVE
  }

  /**
   * @returns {number}
   */
  get x() {
    // return the right side of the node plus the followUp time, or the left minus the lead time
    return this.followUpTime
      ? this.$node.layout.x + this.$node.layout.width + this.getTime()
      : this.$node.layout.x - this.getTime()
  }

  /**
   * @returns {number}
   */
  get y() {
    // return the vertical center of the layout
    return this.$node.layout.y + this.$node.layout.height * 0.5
  }

  /**
   * @returns {IModelItem}
   */
  get item() {
    return this.$node
  }

  /**
   * @param {IInputModeContext} context - The context to retrieve information about the drag from.
   */
  initializeDrag(context) {
    // remember the time at the drag start
    this.$originalTime = this.getTime()
  }

  /**
   * @param {IInputModeContext} context - The context to retrieve information about the drag from.
   * @param {Point} originalLocation - The value of the {@link IDragHandler#location}
   *   property at the time of {@link IDragHandler#initializeDrag}.
   * @param {Point} newLocation - The coordinates in the world coordinate system that the client
   *   wants the handle to be at. Depending on the implementation the {@link IDragHandler#location} may
   *   or may not be modified to reflect the new value.
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
   * @param {IInputModeContext} context - The context to retrieve information about the drag from.
   * @param {Point} originalLocation - The value of the {@link IDragHandler#location}
   *   property at the time of {@link IDragHandler#initializeDrag}.
   * @param {Point} newLocation - The coordinates in the world coordinate system that the client
   *   wants the handle to be at. Depending on the implementation the {@link IDragHandler#location} may
   *   or may not be modified to reflect the new value. This is the same value as delivered in the last invocation of
   *   {@link IDragHandler#handleMove}
   */
  dragFinished(context, originalLocation, newLocation) {
    this.setTime(this.calculateTime(newLocation))
  }

  /**
   * @param {IInputModeContext} context - The context to retrieve information about the drag from.
   * @param {Point} originalLocation - The value of the coordinate of the
   *   {@link IDragHandler#location} property at the time of
   *   {@link IDragHandler#initializeDrag}.
   */
  cancelDrag(context, originalLocation) {
    // assign original value
    this.setTime(this.$originalTime)
  }

  calculateTime(newLocation) {
    return this.followUpTime
      ? Math.max(0, newLocation.x - (this.$node.layout.x + this.$node.layout.width))
      : Math.max(0, this.$node.layout.x - newLocation.x)
  }

  /**
   * Gets the new value from the node tag.
   */
  getTime() {
    // read the value from the tag
    const time = this.followUpTime ? this.$node.tag.followUpTimeWidth : this.$node.tag.leadTimeWidth
    return time || 0
  }

  /**
   * Stores the new value in the node tag.
   */
  setTime(val) {
    if (this.followUpTime) {
      this.$node.tag.followUpTimeWidth = val
    } else {
      this.$node.tag.leadTimeWidth = val
    }
  }

  isFollowUpTime() {
    return this.followUpTime
  }
}

/**
 * A handle provider for the time handles.
 */
export class TimeHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * Creates a new instance for the given node.
   * @param {INode} node
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * @param {IInputModeContext} context -
   * @returns {IEnumerable.<IHandle>}
   */
  getHandles(context) {
    const leadTimeHandle = new TimeHandle(this.node, false)
    const followUpTimeHandle = new TimeHandle(this.node, true)
    return new List([leadTimeHandle, followUpTimeHandle])
  }
}
