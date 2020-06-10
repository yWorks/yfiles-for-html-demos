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
  DefaultPortCandidate,
  FreeNodePortLocationModel,
  IEdgeReconnectionPortCandidateProvider,
  IInputModeContext,
  IListEnumerable,
  List
} from 'yfiles'

/**
 * An {@link IEdgeReconnectionPortCandidateProvider} that uses candidates with a
 * dynamic NodeScaled port location model. It allows moving ports to any
 * location inside a green node.
 */
export default class GreenEdgePortCandidateProvider extends BaseClass(
  IEdgeReconnectionPortCandidateProvider
) {
  /**
   * Returns all source port candidates that may be used for all nodes.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @see Specified by {@link IEdgeReconnectionPortCandidateProvider#getTargetPortCandidates}.
   * @return {IEnumerable.<IPortCandidate>}
   */
  getSourcePortCandidates(context) {
    const graph = context.graph
    if (graph === null) {
      return IListEnumerable.EMPTY
    }
    const candidates = new List()
    graph.nodes.forEach(node => {
      if (node.tag === 'green') {
        candidates.add(new DefaultPortCandidate(node, FreeNodePortLocationModel.INSTANCE))
      }
    })
    return candidates
  }

  /**
   * Returns all target port candidates that may be used for all nodes.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @see Specified by {@link IEdgeReconnectionPortCandidateProvider#getTargetPortCandidates}.
   * @return {IEnumerable.<IPortCandidate>}
   */
  getTargetPortCandidates(context) {
    return this.getSourcePortCandidates(context)
  }
}
