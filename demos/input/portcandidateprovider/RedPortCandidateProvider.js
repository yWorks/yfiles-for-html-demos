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
  DefaultPortCandidate,
  FreeNodePortLocationModel,
  IInputModeContext,
  INode,
  List,
  PortCandidateProviderBase,
  PortCandidateValidity
} from 'yfiles'

/**
 * This port candidate provider does not allow edges to start/end at a particular node.
 */
export default class RedPortCandidateProvider extends PortCandidateProviderBase {
  /**
   * Creates a new instance of <code>BluePortCandidateProvider</code>.
   * @param {INode} node The given node.
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * Returns a list with a single invalid port candidate. This candidate is
   * located in the center of the node to display the invalid port
   * highlight at that location.
   * Note that the various variants of getPortCandidates of
   * {@link PortCandidateProviderBase} delegate to this method.
   * This can be used to provide the same candidates for all use-cases.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @see Overrides {@link PortCandidateProviderBase#getPortCandidates}
   * @return {IEnumerable.<IPortCandidate>}
   */
  getPortCandidates(context) {
    const candidates = new List()
    const portCandidate = new DefaultPortCandidate(
      this.node,
      FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    )
    portCandidate.validity = PortCandidateValidity.INVALID
    candidates.add(portCandidate)
    return candidates
  }
}
