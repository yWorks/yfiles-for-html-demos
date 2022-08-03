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
} from 'yfiles'
import { LayoutHelper } from './LayoutHelper.js'

export class NonOverlapReshapeHandler extends BaseClass(IReshapeHandler) {
  /**
   * @param {!INode} node
   * @param {!IReshapeHandler} handler
   */
  constructor(node, handler) {
    super()
    // The node we are currently resizing.
    this.node = node
    // The original {@link IReshapeHandler}.
    this.handler = handler
    // Creates space if the node grows.
    this.layoutHelper = null
    this.timeoutHandle = null
  }

  /**
   * @type {!IRectangle}
   */
  get bounds() {
    return this.handler.bounds
  }

  /**
   * The node is upon to be resized.
   * @param {!IInputModeContext} context
   */
  initializeReshape(context) {
    this.layoutHelper = new LayoutHelper(context.canvasComponent, this.node)
    this.layoutHelper.initializeLayout()
    this.handler.initializeReshape(context)
  }

  /**
   * The node is resized.
   * @param {!IInputModeContext} context
   * @param {!Rect} originalBounds
   * @param {!Rect} newBounds
   */
  handleReshape(context, originalBounds, newBounds) {
    this.clearTimeout()
    this.handler.handleReshape(context, originalBounds, newBounds)
    this.timeoutHandle = setTimeout(() => {
      this.layoutHelper.runLayout()
    }, 50)
  }

  /**
   * The resize gesture is canceled.
   * @param {!IInputModeContext} context
   * @param {!Rect} originalBounds
   * @returns {!Promise}
   */
  async cancelReshape(context, originalBounds) {
    this.clearTimeout()
    this.handler.cancelReshape(context, originalBounds)

    const waitInputMode = context.lookup(WaitInputMode.$class)
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
   * @param {!IInputModeContext} context
   * @param {!Rect} originalBounds
   * @param {!Rect} newBounds
   * @returns {!Promise}
   */
  async reshapeFinished(context, originalBounds, newBounds) {
    this.clearTimeout()
    this.handler.reshapeFinished(context, originalBounds, newBounds)

    const waitInputMode = context.lookup(WaitInputMode.$class)
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
