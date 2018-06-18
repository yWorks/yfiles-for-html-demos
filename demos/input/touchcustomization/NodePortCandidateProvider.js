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
   * This port candidate provider provides port candidates at each side and in the center of a node.
   * @extends yfiles.input.PortCandidateProviderBase
   */
  class NodePortCandidateProvider extends yfiles.input.PortCandidateProviderBase {
    /**
     * Creates a new instance of <code>NodePortCandidateProvider</code>.
     * @param {yfiles.graph.INode} node The given node.
     */
    constructor(node) {
      super()
      this.node = node
    }

    /**
     * Returns a list that contains the port candidates.
     * @param {yfiles.input.IInputModeContext} context The context for which the candidates should be provided
     * @see Overrides {@link yfiles.input.PortCandidateProviderBase#getPortCandidates}
     * @return {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getPortCandidates(context) {
      const candidates = new yfiles.collections.List()
      candidates.add(
        new yfiles.input.DefaultPortCandidate(
          this.node,
          yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
        )
      )
      candidates.add(
        new yfiles.input.DefaultPortCandidate(
          this.node,
          yfiles.graph.FreeNodePortLocationModel.NODE_LEFT_ANCHORED
        )
      )
      candidates.add(
        new yfiles.input.DefaultPortCandidate(
          this.node,
          yfiles.graph.FreeNodePortLocationModel.NODE_TOP_ANCHORED
        )
      )
      candidates.add(
        new yfiles.input.DefaultPortCandidate(
          this.node,
          yfiles.graph.FreeNodePortLocationModel.NODE_RIGHT_ANCHORED
        )
      )
      candidates.add(
        new yfiles.input.DefaultPortCandidate(
          this.node,
          yfiles.graph.FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED
        )
      )

      return candidates
    }
  }

  return NodePortCandidateProvider
})
