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
  HandlePositions,
  IInputModeContext,
  INode,
  IReshapeHandleProvider
} from 'yfiles'
import AspectRatioHandle from './AspectRatioHandle.js'

/**
 * An {@link IReshapeHandleProvider} that restricts the available
 * handles provided by the wrapped handler to the ones in the four corners.
 * If the wrapped handler doesn't provide all of these handles, this
 * handler doesn't do this as well. In addition, these handles have a
 * custom behavior: they maintain the current aspect ratio of the node.
 */
export default class GreenReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  /**
   * Creates a new instance of <code>GreenReshapeHandleProvider</code>.
   * @param {IReshapeHandleProvider} wrappedHandler The wrapped handler
   * @param {INode} node The given node
   */
  constructor(wrappedHandler, node) {
    super()
    this.wrappedHandler = wrappedHandler
    this.node = node
  }

  /**
   * Returns the available handles provided by the wrapped handler
   * restricted to the ones in the four corners.
   * @param {IInputModeContext} inputModeContext The context for which the handles are queried
   * @see Specified by {@link IReshapeHandleProvider#getAvailableHandles}.
   * @return {HandlePositions}
   */
  getAvailableHandles(inputModeContext) {
    // return only corner handles
    return (
      this.wrappedHandler.getAvailableHandles(inputModeContext) &
      (HandlePositions.NORTH_EAST |
        HandlePositions.NORTH_WEST |
        HandlePositions.SOUTH_EAST |
        HandlePositions.SOUTH_WEST)
    )
  }

  /**
   * Returns a custom handle to maintains the aspect ratio of the node.
   * @param {IInputModeContext} inputModeContext The context for which the handles are queried
   * @param {HandlePositions} position The single position a handle implementation should be returned for
   * @see Specified by {@link IReshapeHandleProvider#getHandle}.
   * @return {IHandle}
   */
  getHandle(inputModeContext, position) {
    return new AspectRatioHandle(
      this.wrappedHandler.getHandle(inputModeContext, position),
      position,
      this.node.layout
    )
  }
}
