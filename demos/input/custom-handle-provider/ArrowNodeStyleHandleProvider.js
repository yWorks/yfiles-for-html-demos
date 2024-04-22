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
import {
  ArrowNodeStyle,
  ArrowStyleShape,
  BaseClass,
  IEnumerable,
  IHandle,
  IHandleProvider,
  IInputModeContext,
  INode
} from 'yfiles'
import { ArrowNodeStyleAngleHandle } from './ArrowNodeStyleAngleHandle.js'
import { ArrowNodeStyleShaftRatioHandle } from './ArrowNodeStyleShaftRatioHandle.js'

/**
 * An {@link IHandleProvider} for nodes using an {@link ArrowNodeStyle} that provides an
 * {@link ArrowNodeStyleAngleHandle}, an {@link ArrowNodeStyleShaftRatioHandle} and further
 * handles provided by a delegating provider.
 *
 * The {@link ArrowNodeStyleShaftRatioHandle} is only provided for {@link ArrowStyleShape.ARROW},
 * {@link ArrowStyleShape.DOUBLE_ARROW}, and {@link ArrowStyleShape.NOTCHED_ARROW}.
 */
export default class ArrowNodeStyleHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * Creates a new instance of {@link ArrowNodeStyleHandleProvider} with the given
   * {@link stylePropertyChanged} action and an optional {@link delegateProvider} whose handles are
   * also returned.
   * @param {!INode} node The node to provide handles for.
   * @param {!function} stylePropertyChanged An action that is called when the handle is moved.
   * @param delegateProvider The wrapped {@link IHandleProvider implementation}.
   * @param {?IHandleProvider} [delegateProvider=null]
   */
  constructor(node, stylePropertyChanged, delegateProvider = null) {
    super()
    this.delegateProvider = delegateProvider
    this.stylePropertyChanged = stylePropertyChanged
    this.node = node
  }

  /**
   * @param {!IInputModeContext} context
   * @returns {!IEnumerable.<IHandle>}
   */
  getHandles(context) {
    const handles = []

    if (this.delegateProvider) {
      handles.push(...this.delegateProvider.getHandles(context))
    }

    if (this.node.style instanceof ArrowNodeStyle) {
      handles.push(new ArrowNodeStyleAngleHandle(this.node, this.stylePropertyChanged))
      if (this.hasShaft(this.node.style)) {
        handles.push(new ArrowNodeStyleShaftRatioHandle(this.node, this.stylePropertyChanged))
      }
    }
    return IEnumerable.from(handles)
  }

  /**
   * @param {!ArrowNodeStyle} style
   * @returns {boolean}
   */
  hasShaft(style) {
    return (
      style.shape === ArrowStyleShape.ARROW ||
      style.shape === ArrowStyleShape.DOUBLE_ARROW ||
      style.shape === ArrowStyleShape.NOTCHED_ARROW
    )
  }
}
