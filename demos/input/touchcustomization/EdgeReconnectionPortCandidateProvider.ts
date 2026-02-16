/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FreeNodePortLocationModel,
  type IEdge,
  IEdgeReconnectionPortCandidateProvider,
  type IEnumerable,
  type IInputModeContext,
  type IPortCandidate,
  IPortCandidateProvider,
  List,
  PortCandidate
} from '@yfiles/yfiles'

/**
 * An {@link IEdgeReconnectionPortCandidateProvider} that allows moving ports to
 * any other port candidate that another node provides.
 */
export class EdgeReconnectionPortCandidateProvider extends BaseClass(
  IEdgeReconnectionPortCandidateProvider
) {
  private edge: IEdge

  constructor(edge: IEdge) {
    super()
    this.edge = edge
  }

  /**
   * Gets a list of port candidates for edge reconnection that matches the list of candidates the
   * IPortCandidateProvider interface returns.
   * @returns The list of source port candidates
   */
  getSourcePortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    return this.getPortCandidates(context, true)
  }

  /**
   * Gets a list of port candidates for edge reconnection that matches the list of candidates the
   * IPortCandidateProvider interface returns.
   * @returns The list of target port candidates
   */
  getTargetPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
    return this.getPortCandidates(context, false)
  }

  private getPortCandidates(
    context: IInputModeContext,
    source: boolean
  ): IEnumerable<IPortCandidate> {
    const result = new List<IPortCandidate>()

    // add the current one as the default
    const port = source ? this.edge.sourcePort : this.edge.targetPort
    result.add(new PortCandidate(port))

    const graph = context.graph
    if (!graph) {
      return result
    }
    for (const node of graph.nodes) {
      const provider = node.lookup(IPortCandidateProvider)
      // If available, use the candidates from the provider. Otherwise, add a default candidate.
      if (provider) {
        const candidates = source
          ? provider.getAllSourcePortCandidates(context)
          : provider.getAllTargetPortCandidates(context)
        result.addRange(candidates)
      } else {
        result.add(new PortCandidate(node, FreeNodePortLocationModel.CENTER))
      }
    }
    return result
  }
}
