/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IEdge,
  IEdgeReconnectionPortCandidateProvider,
  IEnumerable,
  IInputModeContext,
  IPortCandidate,
  IPortCandidateProvider,
  List
} from 'yfiles'

/**
 * An {@link IEdgeReconnectionPortCandidateProvider} that allows moving ports to
 * any other port candidate that another node provides.
 */
export default class EdgeReconnectionPortCandidateProvider extends BaseClass(
  IEdgeReconnectionPortCandidateProvider
) {
  /**
   * @param {!IEdge} edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * Gets a list of port candidates for edge reconnection that matches the list of candidates the
   * IPortCandidateProvider interface returns.
   * @returns {!IEnumerable.<IPortCandidate>} The list of source port candidates
   * @param {!IInputModeContext} context
   */
  getSourcePortCandidates(context) {
    return this.getPortCandidates(context, true)
  }

  /**
   * Gets a list of port candidates for edge reconnection that matches the list of candidates the
   * IPortCandidateProvider interface returns.
   * @returns {!IEnumerable.<IPortCandidate>} The list of target port candidates
   * @param {!IInputModeContext} context
   */
  getTargetPortCandidates(context) {
    return this.getPortCandidates(context, false)
  }

  /**
   * @param {!IInputModeContext} context
   * @param {boolean} source
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getPortCandidates(context, source) {
    const result = new List()

    // add the current one as the default
    const port = source ? this.edge.sourcePort : this.edge.targetPort
    result.add(new DefaultPortCandidate(port))

    const graph = context.graph
    if (!graph) {
      return result
    }
    for (const node of graph.nodes) {
      const provider = node.lookup(IPortCandidateProvider.$class)
      // If available, use the candidates from the provider. Otherwise, add a default candidate.
      if (provider) {
        const candidates = source
          ? provider.getAllSourcePortCandidates(context)
          : provider.getAllTargetPortCandidates(context)
        result.addRange(candidates)
      } else {
        result.add(new DefaultPortCandidate(node, FreeNodePortLocationModel.NODE_CENTER_ANCHORED))
      }
    }
    return result
  }
}
