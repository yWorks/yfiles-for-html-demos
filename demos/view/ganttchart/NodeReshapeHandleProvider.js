/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ConstrainedDragHandler,
  ConstrainedHandle,
  Cursor,
  HandlePositions,
  HandleTypes,
  IHandle,
  IInputModeContext,
  INode,
  IReshapeHandleProvider,
  Point
} from 'yfiles'

/**
 * Provides the special node resize handles at the east and west side of a node.
 */
export class NodeReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  /**
   * Creates a new instance.
   * @param {INode} node
   * @param {IReshapeHandleProvider} wrapped
   */
  constructor(node, wrapped) {
    super()
    this.node = node
    this.wrapped = wrapped
  }

  /**
   * @param {IInputModeContext} context - The context for which the handles are queried.
   * @returns {HandlePositions}
   */
  getAvailableHandles(context) {
    return HandlePositions.EAST | HandlePositions.WEST
  }

  /**
   * @param {IInputModeContext} context - The context for which the handles are queried.
   * @param {HandlePositions} position - The single position a handle implementation should be returned
   *   for.
   * @returns {IHandle}
   */
  getHandle(context, position) {
    return new NodeResizeHandle(this.node, this.wrapped.getHandle(context, position), position)
  }
}

/**
 * A special, invisible node resize handle that allows to change the width of a node.
 */
export class NodeResizeHandle extends ConstrainedHandle {
  /**
   * @constructs
   * @param {INode} node The node that is resized.
   * @param {IHandle} wrappedHandle The handle to wrap.
   * @param {HandlePositions} position The handle position.
   */
  constructor(node, wrappedHandle, position) {
    super(wrappedHandle)
    this.$node = node
    this.$position = position
  }

  /**
   * Constrains the location to the original y coordinate
   * @param {IInputModeContext} context - The context in which the drag will be performed.
   * @param {Point} originalLocation - The value of the
   *   {@link ConstrainedDragHandler<TWrapped>#location} property at the time of
   *   {@link ConstrainedDragHandler<TWrapped>#initializeDrag}.
   * @param {Point} newLocation - The coordinates in the world coordinate system that the client
   *   wants the handle to be at. Depending on the implementation the
   *   {@link ConstrainedDragHandler<TWrapped>#location} may or may not be modified to reflect the new
   *   value.
   * @returns {Point}
   */
  constrainNewLocation(context, originalLocation, newLocation) {
    return new Point(newLocation.x, originalLocation.y)
  }

  /**
   * @returns {Cursor}
   */
  get cursor() {
    return Cursor.EW_RESIZE
  }

  /**
   * @returns {HandlePositions}
   */
  get position() {
    return this.$position
  }

  /**
   * @returns {HandleTypes}
   */
  get type() {
    return HandleTypes.INVISIBLE
  }

  /**
   * @returns {IModelItem}
   */
  get item() {
    return this.$node
  }
}
