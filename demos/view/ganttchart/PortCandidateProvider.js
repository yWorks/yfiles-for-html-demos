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

define(['yfiles/view-component', './ActivityNodePortLocationModel.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  ActivityNodePortLocationModel
) => {
  /**
   * A port candidate provider for the port on the left and right side of activity nodes.
   * @class PortCandidateProvider
   * @implements {yfiles.input.IPortCandidateProvider}
   */
  class PortCandidateProvider extends yfiles.lang.Class(yfiles.input.IPortCandidateProvider) {
    constructor(node) {
      super()
      this.node = node
    }

    /**
     * Returns a port candidate on the right side of the node where an edge can start.
     * @param {yfiles.input.IInputModeContext} context - The context for which the candidates should be provided.
     * @returns {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getAllSourcePortCandidates(context) {
      // create a port candidate at the right side of the node
      const candidates = new yfiles.collections.List()
      const defaultPortCandidate = new yfiles.input.DefaultPortCandidate(
        this.node,
        ActivityNodePortLocationModel.RIGHT
      )
      candidates.add(defaultPortCandidate)
      return candidates
    }

    /**
     * Returns a port candidate on the left side of the node where an edge can end.
     * @param {yfiles.input.IInputModeContext} context - The context for which the candidates should be provided.
     * @returns {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getAllTargetPortCandidates(context) {
      // create a port candidate at the left side of the node
      const candidates = new yfiles.collections.List()
      const defaultPortCandidate = new yfiles.input.DefaultPortCandidate(
        this.node,
        ActivityNodePortLocationModel.LEFT
      )
      candidates.add(defaultPortCandidate)
      return candidates
    }

    /**
     * @param {yfiles.input.IInputModeContext} context - The context for which the candidates should be provided.
     * @param {yfiles.input.IPortCandidate} target - The opposite port candidate.
     * @returns {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getSourcePortCandidates(context, target) {
      return this.getAllSourcePortCandidates(context)
    }

    /**
     * @param {yfiles.input.IInputModeContext} context - The context for which the candidates should be provided.
     * @param {yfiles.input.IPortCandidate} source - The opposite port candidate.
     * @returns {yfiles.collections.IEnumerable.<yfiles.input.IPortCandidate>}
     */
    getTargetPortCandidates(context, source) {
      return this.getAllTargetPortCandidates(context)
    }
  }

  return PortCandidateProvider
})
