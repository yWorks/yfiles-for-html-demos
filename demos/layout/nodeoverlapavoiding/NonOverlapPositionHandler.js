/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
 * An {@link IPositionHandler} that moves a node and creates space at the new location.
 * @class
 * @implements {IPositionHandler}
 */
import {
  BaseClass,
  GraphComponent,
  IInputModeContext,
  INode,
  IPoint,
  IPositionHandler,
  IReparentNodeHandler,
  Point,
  WaitInputMode
} from 'yfiles'
import { LayoutHelper } from './LayoutHelper.js'

export class NonOverlapPositionHandler extends BaseClass(IPositionHandler) {
  /**
   * The node we are currently moving.
   */
  node = null

  /**
   * The original {@link IPositionHandler}.
   */
  handler = null

  /**
   * Creates space at the new location.
   */
  layoutHelper = null

  /**
   * To check whether re-parenting is taking place.
   */
  reparentHandler = null

  timeoutHandle

  /**
   * @param {!INode} node
   * @param {!IPositionHandler} handler
   */
  constructor(node, handler) {
    super()
    this.node = node
    this.handler = handler
    this.timeoutHandle = null
  }

  /**
   * @type {!IPoint}
   */
  get location() {
    return this.handler.location
  }

  /**
   * The node is upon to be dragged.
   * @param {!IInputModeContext} context
   */
  initializeDrag(context) {
    this.reparentHandler = context.lookup(IReparentNodeHandler.$class)
    this.layoutHelper = new LayoutHelper(context.canvasComponent, this.node)
    this.layoutHelper.initializeLayout()
    this.handler.initializeDrag(context)
  }

  /**
   * The node is dragged.
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   */
  handleMove(context, originalLocation, newLocation) {
    this.clearTimeout()

    this.handler.handleMove(context, originalLocation, newLocation)

    if (!this.reparentHandler || !this.reparentHandler.isReparentGesture(context, this.node)) {
      this.timeoutHandle = setTimeout(() => {
        this.layoutHelper.runLayout()
      }, 50)
    }
  }

  /**
   * The drag is canceled.
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @returns {!Promise}
   */
  async cancelDrag(context, originalLocation) {
    this.clearTimeout()
    this.handler.cancelDrag(context, originalLocation)

    const waitInputMode = context.lookup(WaitInputMode.$class)
    if (waitInputMode) {
      // disable user interaction while the cancel layout is running
      waitInputMode.waiting = true
    }

    await this.layoutHelper.cancelLayout()

    if (waitInputMode) {
      waitInputMode.waiting = false
    }
  }

  /**
   * The drag is finished.
   * @param {!IInputModeContext} context
   * @param {!Point} originalLocation
   * @param {!Point} newLocation
   * @returns {!Promise}
   */
  async dragFinished(context, originalLocation, newLocation) {
    this.clearTimeout()
    this.handler.dragFinished(context, originalLocation, newLocation)

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
