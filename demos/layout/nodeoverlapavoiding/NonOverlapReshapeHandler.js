/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
/**
 * An {@link IReshapeHandler} that resizes a node and creates space if it grows.
 */
import {
  BaseClass,
  GraphComponent,
  IInputModeContext,
  INode,
  IRectangle,
  IReshapeHandler,
  Rect,
  WaitInputMode
} from '@yfiles/yfiles'
import { LayoutHelper } from './LayoutHelper'
export class NonOverlapReshapeHandler extends BaseClass(IReshapeHandler) {
  /**
   * The node we are currently resizing.
   */
  node
  /**
   * The original {@link IReshapeHandler}.
   */
  handler
  /**
   * Creates space if the node grows.
   */
  layoutHelper
  timeoutHandle
  constructor(node, handler) {
    super()
    this.node = node
    this.handler = handler
    this.layoutHelper = null
    this.timeoutHandle = null
  }
  get bounds() {
    return this.handler.bounds
  }
  /**
   * The node is upon to be resized.
   */
  initializeReshape(context) {
    this.layoutHelper = new LayoutHelper(context.canvasComponent, this.node)
    this.layoutHelper.initializeLayout()
    this.handler.initializeReshape(context)
  }
  /**
   * The node is resized.
   */
  handleReshape(context, originalBounds, newBounds) {
    this.clearTimeout()
    this.handler.handleReshape(context, originalBounds, newBounds)
    this.timeoutHandle = setTimeout(async () => {
      await this.layoutHelper.runLayout()
    }, 50)
  }
  /**
   * The resize gesture is canceled.
   */
  async cancelReshape(context, originalBounds) {
    this.clearTimeout()
    this.handler.cancelReshape(context, originalBounds)
    const waitInputMode = context.lookup(WaitInputMode)
    if (waitInputMode) {
      // disable user interaction while the finish cancel is running
      waitInputMode.waiting = true
    }
    await this.layoutHelper.cancelLayout()
    if (waitInputMode) {
      waitInputMode.waiting = false
    }
  }
  /**
   * The resize gesture is finished.
   */
  async reshapeFinished(context, originalBounds, newBounds) {
    this.clearTimeout()
    this.handler.reshapeFinished(context, originalBounds, newBounds)
    const waitInputMode = context.lookup(WaitInputMode)
    if (waitInputMode) {
      // disable user interaction while the finish layout is running
      waitInputMode.waiting = true
    }
    await this.layoutHelper.finishLayout()
    if (waitInputMode) {
      waitInputMode.waiting = false
    }
  }
  clearTimeout() {
    if (this.timeoutHandle !== null) {
      clearTimeout(this.timeoutHandle)
      this.timeoutHandle = null
    }
  }
}
