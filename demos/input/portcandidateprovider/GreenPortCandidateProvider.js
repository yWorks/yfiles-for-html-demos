/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  DefaultPortCandidate,
  IEnumerable,
  IInputModeContext,
  IListEnumerable,
  INode,
  IPortCandidate,
  IPortCandidateProvider,
  List,
  PortCandidateProviderBase,
  PortCandidateValidity
} from 'yfiles'

/**
 * This port candidate provider only allows connections from green nodes.
 * To achieve this, this class returns different port candidates for source
 * and target ports.
 */
export default class GreenPortCandidateProvider extends PortCandidateProviderBase {
  /**
   * Creates a new instance of <code>GreenPortCandidateProvider</code>.
   * @param {!INode} node The given node.
   */
  constructor(node) {
    super()
    this.node = node
  }

  /**
   * Returns a central port candidate if the owner node of the source
   * candidate is green, and an empty list otherwise.
   * @param {!IInputModeContext} context The context for which the candidates should be provided
   * @param {!IPortCandidate} source The opposite port candidate
   * @see Overrides {@link PortCandidateProviderBase#getTargetPortCandidates}
   * @see Specified by {@link IPortCandidateProvider#getTargetPortCandidates}.
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getTargetPortCandidates(context, source) {
    // Check if the source node is green
    if (source && source.owner.tag === 'green') {
      return IPortCandidateProvider.fromNodeCenter(this.node).getTargetPortCandidates(
        context,
        source
      )
    }
    return IListEnumerable.EMPTY
  }

  /**
   * Returns a list that contains a port candidate for each of the node's
   * ports. Each candidate has the same location as the port. If a port
   * already has a connected edge, its port candidate is marked as invalid.
   * Note that the variants of getPortCandidates for target ports are all
   * implemented by this class. Therefore, this method is only used for
   * source ports.
   * @param {!IInputModeContext} context The context for which the candidates should be provided
   * @see Overrides {@link PortCandidateProviderBase#getPortCandidates}
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getPortCandidates(context) {
    const candidates = new List()
    let hasValid = false
    const graph = context.graph

    if (graph) {
      // Create a port candidate for each free port on the node
      this.node.ports.forEach(port => {
        const portCandidate = new DefaultPortCandidate(port)
        const valid = graph.degree(port) === 0
        hasValid = hasValid || valid
        portCandidate.validity = valid ? PortCandidateValidity.VALID : PortCandidateValidity.INVALID
        candidates.add(portCandidate)
      })
    }

    // If no valid candidates have been created so far, use the ShapeGeometryPortCandidateProvider as fallback.
    // This provides a candidate in the middle of each of the four sides of the node.
    if (!hasValid) {
      candidates.addRange(
        IPortCandidateProvider.fromShapeGeometry(this.node, 0.5).getAllSourcePortCandidates(context)
      )
    }

    return candidates
  }
}
