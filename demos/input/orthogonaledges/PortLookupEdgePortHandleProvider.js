/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  IEdge,
  IEdgePortHandleProvider,
  IHandle,
  IInputModeContext,
  INode
} from 'yfiles'
import NodeLayoutPortLocationHandle from './NodeLayoutPortLocationHandle.js'

/**
 * Creates an {@link IEdgePortHandleProvider} that constraints the original
 * port location handle to the layout rectangle of the port's owner node.
 */
export default class PortLookupEdgePortHandleProvider extends BaseClass(IEdgePortHandleProvider) {
  /**
   * Returns a handle that is constrained to the layout rectangle of the
   * port's owner node.
   * @param {!IInputModeContext} context The context in which the handle will be used
   * @param {!IEdge} edge The edge for which an handle is needed
   * @param {boolean} sourceHandle <code>True</code> if the handle for the source side/port should be returned,
   * <code>false</code> for the target side/port
   * @see Specified by {@link IEdgePortHandleProvider#getHandle}.
   * @returns {!IHandle}
   */
  getHandle(context, edge, sourceHandle) {
    const port = sourceHandle ? edge.sourcePort : edge.targetPort
    return port.owner instanceof INode
      ? new NodeLayoutPortLocationHandle(port.owner, port.lookup(IHandle.$class))
      : port.lookup(IHandle.$class)
  }
}
