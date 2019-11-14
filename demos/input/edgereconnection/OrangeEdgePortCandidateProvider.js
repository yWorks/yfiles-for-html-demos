/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
'use strict'

define(['yfiles/view-editor'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * An {@link yfiles.input.IEdgeReconnectionPortCandidateProvider} that allows moving ports to
   * any other orange node, except for the opposite port's node.
   * @implements {yfiles.input.IEdgeReconnectionPortCandidateProvider}
   */
  class OrangeEdgePortCandidateProvider extends yfiles.lang.Class(
    yfiles.input.IEdgeReconnectionPortCandidateProvider
  ) {
    /**
     * Creates a new instance of <code>OrangeEdgePortCandidateProvider</code>.
     * @param {yfiles.graph.IEdge} edge The given edge
     */
    constructor(edge) {
      super()
      this.edge = edge
    }

    /**
     * Returns candidates for all ports at orange nodes in the graph, except
     * for the current target node to avoid the creation of selfloops.
     * @param {yfiles.input.IInputModeContext} context The context for which the candidates should be provided
     * @see Specified by {@link yfiles.input.IEdgeReconnectionPortCandidateProvider#getSourcePortCandidates}.
     * @return {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getSourcePortCandidates(context) {
      const result = new yfiles.collections.List()
      // add the current one as the default
      result.add(new yfiles.input.DefaultPortCandidate(this.edge.sourcePort))

      const graph = context.graph
      if (graph === null) {
        return result
      }
      graph.nodes.forEach(node => {
        if (node !== this.edge.targetPort.owner && node.tag === 'orange') {
          const provider = node.lookup(yfiles.input.IPortCandidateProvider.$class)
          // If available, use the candidates from the provider. Otherwise, add a default candidate.
          if (provider !== null) {
            result.addRange(provider.getTargetPortCandidates(context))
          } else {
            result.add(
              new yfiles.input.DefaultPortCandidate(
                node,
                yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
              )
            )
          }
        }
      })
      return result
    }

    /**
     * Returns candidates for all ports at orange nodes in the graph, except
     * for the current source node to avoid the creation of selfloops.
     * @param {yfiles.input.IInputModeContext} context The context for which the candidates should be provided
     * @see Specified by {@link yfiles.input.IEdgeReconnectionPortCandidateProvider#getTargetPortCandidates}.
     * @return {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getTargetPortCandidates(context) {
      const result = new yfiles.collections.List()
      // add the current one as the default
      result.add(new yfiles.input.DefaultPortCandidate(this.edge.targetPort))

      const graph = context.graph
      if (graph === null) {
        return result
      }
      graph.nodes.forEach(node => {
        if (node !== this.edge.sourcePort.owner && node.tag === 'orange') {
          const provider = node.lookup(yfiles.input.IPortCandidateProvider.$class)
          // If available, use the candidates from the provider. Otherwise, add a default candidate.
          if (provider !== null) {
            result.addRange(provider.getSourcePortCandidates(context))
          } else {
            result.add(
              new yfiles.input.DefaultPortCandidate(
                node,
                yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
              )
            )
          }
        }
      })
      return result
    }
  }

  return OrangeEdgePortCandidateProvider
})
