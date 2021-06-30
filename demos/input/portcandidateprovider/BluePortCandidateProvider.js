/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IEnumerable,
  IInputModeContext,
  INode,
  IPortCandidate,
  List,
  PortCandidateProviderBase,
  PortCandidateValidity
} from 'yfiles'

/**
 * This port candidate provider provides port candidates for the
 * ports of a node. If a port already has a connected edge, its
 * port candidate is marked as invalid.
 */
export default class BluePortCandidateProvider extends PortCandidateProviderBase {
  /**
   * Creates a new instance of <code>BluePortCandidateProvider</code>.
   * @param {!INode} node The given node.
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * Returns a list that contains a port candidate for each of the node's
   * ports. Each candidate has the same location as the port. If a port
   * already has a connected edge, its port candidate is marked as invalid.
   * Note that the various variants of getPortCandidates of
   * {@link PortCandidateProviderBase} delegate to this method.
   * This can be used to provide the same candidates for all use-cases.
   * @param {!IInputModeContext} context The context for which the candidates should be provided
   * @see Overrides {@link PortCandidateProviderBase#getPortCandidates}
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getPortCandidates(context) {
    const candidates = new List()
    const graph = context.graph

    // Create the candidate for each port
    if (graph) {
      this.node.ports.forEach(port => {
        const portCandidate = new DefaultPortCandidate(port)
        portCandidate.validity =
          graph.degree(port) === 0 ? PortCandidateValidity.VALID : PortCandidateValidity.INVALID
        candidates.add(portCandidate)
      })
    }

    // If no candidates have been created so far, create a single invalid candidate as fallback
    if (candidates.size === 0) {
      const item = new DefaultPortCandidate(
        this.node,
        FreeNodePortLocationModel.NODE_CENTER_ANCHORED
      )
      item.validity = PortCandidateValidity.INVALID
      candidates.add(item)
    }

    return candidates
  }
}
