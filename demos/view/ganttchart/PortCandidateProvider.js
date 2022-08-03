/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
  DefaultPortCandidate,
  IEnumerable,
  IInputModeContext,
  INode,
  IPortCandidate,
  IPortCandidateProvider,
  List
} from 'yfiles'
import ActivityNodePortLocationModel from './ActivityNodePortLocationModel.js'

/**
 * A port candidate provider for the port on the left and right side of activity nodes.
 */
export default class PortCandidateProvider extends BaseClass(IPortCandidateProvider) {
  /**
   * @param {!INode} node
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * Returns a port candidate on the right side of the node where an edge can start.
   * @param {!IInputModeContext} context The context for which the candidates should be provided.
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getAllSourcePortCandidates(context) {
    // create a port candidate at the right side of the node
    const candidates = new List()
    const defaultPortCandidate = new DefaultPortCandidate(
      this.node,
      ActivityNodePortLocationModel.RIGHT
    )
    candidates.add(defaultPortCandidate)
    return candidates
  }

  /**
   * Returns a port candidate on the left side of the node where an edge can end.
   * @param {!IInputModeContext} context The context for which the candidates should be provided.
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getAllTargetPortCandidates(context) {
    // create a port candidate at the left side of the node
    const candidates = new List()
    const defaultPortCandidate = new DefaultPortCandidate(
      this.node,
      ActivityNodePortLocationModel.LEFT
    )
    candidates.add(defaultPortCandidate)
    return candidates
  }

  /**
   * Returns all port candidates that apply for the provided opposite target port candidate.
   * @param {!IInputModeContext} context The context for which the candidates should be provided.
   * @param {!IPortCandidate} target The opposite port candidate.
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getSourcePortCandidates(context, target) {
    return this.getAllSourcePortCandidates(context)
  }

  /**
   * Returns all port candidates that apply for the provided opposite source port candidate.
   * @param {!IInputModeContext} context The context for which the candidates should be provided.
   * @param {!IPortCandidate} source The opposite port candidate.
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getTargetPortCandidates(context, source) {
    return this.getAllTargetPortCandidates(context)
  }
}
