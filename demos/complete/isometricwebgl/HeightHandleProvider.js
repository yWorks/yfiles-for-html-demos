/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IEnumerable,
  IHandle,
  IHandleProvider,
  IInputModeContext,
  INode,
  List
} from 'yfiles'
import HeightHandle from './HeightHandle.js'

/**
 * An {@link IHandleProvider} implementation that
 * adds a {@link HeightHandle} to a node's available handles.
 */
export default class HeightHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * @param {INode} node
   * @param {IHandleProvider} delegateHandler
   * @param {number} minimumHeight
   */
  constructor(node, delegateHandler, minimumHeight) {
    super()
    this.node = node
    this.delegateHandler = delegateHandler
    this.minimumHeight = minimumHeight
  }

  /**
   * @param {IInputModeContext} context
   * @returns {IEnumerable.<IHandle>}
   */
  getHandles(context) {
    const result = new List()
    if (this.delegateHandler) {
      result.addRange(this.delegateHandler.getHandles(context))
    }
    result.add(new HeightHandle(this.node, context, this.minimumHeight))
    return result
  }
}
