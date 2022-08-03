/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  ConstrainedHandle,
  Cursor,
  HandlePositions,
  HandleTypes,
  IHandle,
  IInputModeContext,
  IModelItem,
  INode,
  IReshapeHandleProvider,
  Point
} from 'yfiles'

/**
 * Provides the special node resize handles at the east and west side of a node.
 */
export class NodeReshapeHandleProvider extends BaseClass<IReshapeHandleProvider>(
  IReshapeHandleProvider
) {
  node: INode
  wrapped: IReshapeHandleProvider

  /**
   * Creates a new instance of NodeReshapeHandleProvider.
   */
  constructor(node: INode, wrapped: IReshapeHandleProvider) {
    super()
    this.node = node
    this.wrapped = wrapped
  }

  /**
   * Returns EAST and WEST as available handles.
   * @param context The context for which the handles are queried.
   */
  getAvailableHandles(context: IInputModeContext): HandlePositions {
    return HandlePositions.EAST | HandlePositions.WEST
  }

  /**
   * Returns a handle instance for changing the width of a node.
   * @param context The context for which the handles are queried.
   * @param position The single position a handle implementation should be returned for.
   */
  getHandle(context: IInputModeContext, position: HandlePositions): IHandle {
    return new NodeResizeHandle(this.node, this.wrapped.getHandle(context, position), position)
  }
}

/**
 * A special, invisible node resize handle that allows to change the width of a node.
 */
export class NodeResizeHandle extends ConstrainedHandle {
  private readonly _position: HandlePositions

  /**
   * Creates a new instance of NodeResizeHandle.
   * @param node The node that is resized.
   * @param wrappedHandle The handle to wrap.
   * @param position The handle position.
   */
  constructor(private node: INode, wrappedHandle: IHandle, position: HandlePositions) {
    super(wrappedHandle)
    this._position = position
  }

  /**
   * Constrains the location to the original y coordinate.
   * @param context The context in which the drag will be performed.
   * @param originalLocation The value of the
   * {@link ConstrainedHandle.location} property at the time of
   * {@link ConstrainedHandle.initializeDrag}.
   * @param newLocation The coordinates in the world coordinate system that the client wants the
   * handle to be at. Depending on the implementation the
   * {@link ConstrainedHandle.location} may or may not be modified to reflect the
   * new value.
   */
  constrainNewLocation(
    context: IInputModeContext,
    originalLocation: Point,
    newLocation: Point
  ): Point {
    return new Point(newLocation.x, originalLocation.y)
  }

  get cursor(): Cursor {
    return Cursor.EW_RESIZE
  }

  get position(): HandlePositions {
    return this._position
  }

  get type(): HandleTypes {
    return HandleTypes.INVISIBLE
  }

  get item(): IModelItem {
    return this.node
  }
}
