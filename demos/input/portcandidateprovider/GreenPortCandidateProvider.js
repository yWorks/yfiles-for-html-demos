/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
   * This port candidate provider only allows connections from green nodes.
   * To achieve this, this class returns different port candidates for source
   * and target ports.
   * @extends yfiles.input.PortCandidateProviderBase
   */
  class GreenPortCandidateProvider extends yfiles.input.PortCandidateProviderBase {
    /**
     * Creates a new instance of <code>GreenPortCandidateProvider</code>.
     * @param {yfiles.graph.INode} node The given node.
     */
    constructor(node) {
      super()
      this.node = node
    }

    /**
     * Returns a central port candidate if the owner node of the source
     * candidate is green, and an empty list otherwise.
     * @param {yfiles.input.IInputModeContext} context The context for which the candidates should be provided
     * @param {yfiles.input.IPortCandidate} source The opposite port candidate
     * @see Overrides {@link yfiles.input.PortCandidateProviderBase#getTargetPortCandidates}
     * @see Specified by {@link yfiles.input.IPortCandidateProvider#getTargetPortCandidates}.
     * @return {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getTargetPortCandidates(context, source) {
      // Check if the source node is green
      if (typeof source !== 'undefined' && source.owner.tag === 'green') {
        return yfiles.input.IPortCandidateProvider.fromNodeCenter(
          this.node
        ).getTargetPortCandidates(context, source)
      }
      return yfiles.collections.IListEnumerable.EMPTY
    }

    /**
     * Returns a list that contains a port candidate for each of the node's
     * ports. Each candidate has the same location as the port. If a port
     * already has a connected edge, its port candidate is marked as invalid.
     * Note that the variants of getPortCandidates for target ports are all
     * implemented by this class. Therefore, this method is only used for
     * source ports.
     * @param {yfiles.input.IInputModeContext} context The context for which the candidates should be provided
     * @see Overrides {@link yfiles.input.PortCandidateProviderBase#getPortCandidates}
     * @return {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getPortCandidates(context) {
      const candidates = new yfiles.collections.List()
      let hasValid = false
      const graph = context.graph
      if (graph !== null) {
        // Create a port candidate for each free port on the node
        this.node.ports.forEach(port => {
          const portCandidate = new yfiles.input.DefaultPortCandidate(port)
          const valid = graph.degree(port) === 0
          hasValid |= valid
          portCandidate.validity = valid
            ? yfiles.input.PortCandidateValidity.VALID
            : yfiles.input.PortCandidateValidity.INVALID
          candidates.add(portCandidate)
        })
      }

      // If no valid candidates have been created so far, use the ShapeGeometryPortCandidateProvider as fallback.
      // This provides a candidate in the middle of each of the four sides of the node.
      if (!hasValid) {
        candidates.addRange(
          yfiles.input.IPortCandidateProvider.fromShapeGeometry(
            this.node,
            0.5
          ).getAllSourcePortCandidates(context)
        )
      }
      return candidates
    }
  }

  return GreenPortCandidateProvider
})
