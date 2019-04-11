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
import { BaseClass, HandlePositions, IInputModeContext, IReshapeHandleProvider, Rect } from 'yfiles'
import BoxConstrainedHandle from './BoxConstrainedHandle.js'

/**
 * An {@link IReshapeHandleProvider} that limits the resizing of a
 * node to be within an enclosing rectangle and delegates for other aspects
 * to another (the original) handler.
 */
export default class OrangeReshapeHandleProvider extends BaseClass(IReshapeHandleProvider) {
  /**
   * Creates a new instance of <code>OrangeReshapeHandleProvider</code>.
   * @param {Rect} boundaryRectangle The boundary rectangle
   * @param {IReshapeHandleProvider} wrappedHandler The wrapped handler
   */
  constructor(boundaryRectangle, wrappedHandler) {
    super()
    this.boundaryRectangle = boundaryRectangle
    this.wrappedHandler = wrappedHandler
  }

  /**
   * Returns the available handles of the wrapped handler.
   * @param {IInputModeContext} inputModeContext The context for which the handles are queried
   * @see Specified by {@link IReshapeHandleProvider#getAvailableHandles}.
   * @return {HandlePositions}
   */
  getAvailableHandles(inputModeContext) {
    return this.wrappedHandler.getAvailableHandles(inputModeContext)
  }

  /**
   * Returns a handle for the given original position that is limited to
   * the bounds of the boundary rectangle of this class.
   * @param {IInputModeContext} inputModeContext The context for which the handles are queried
   * @param {HandlePositions} position The single position a handle implementation should be returned for
   * @see Specified by {@link IReshapeHandleProvider#getHandle}.
   * @return {IHandle}
   */
  getHandle(inputModeContext, position) {
    // return handle that is constrained by a box
    const handle = this.wrappedHandler.getHandle(inputModeContext, position)
    return new BoxConstrainedHandle(handle, this.boundaryRectangle)
  }
}
