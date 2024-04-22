/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  List,
  BaseClass,
  IEnumerable,
  IPortCandidate,
  IInputModeContext,
  IEdgeReconnectionPortCandidateProvider,
  IEdge,
  DefaultPortCandidate,
  PortCandidateValidity
} from 'yfiles'

export class FlowEdgeReconnectionPortCandidateProvider extends BaseClass(
  IEdgeReconnectionPortCandidateProvider
) {
  edge

  /**
   * @param {!IEdge} edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * @param {!IInputModeContext} undefined
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getSourcePortCandidates({ graph }) {
    const { edge } = this
    const candidates = new List()
    if (!graph) {
      return candidates
    }

    graph.ports
      // Exclude right-side port on the edge's source node:
      .filter((port) => port.owner !== edge.targetNode)
      // Exclude any right-side ports
      .filter((port) => port.tag.side !== 'left')
      // Exclude source ports that the edge's target node already connects to:
      .filter(
        (port) =>
          !graph.edges.some(
            (otherEdge) =>
              otherEdge !== edge &&
              otherEdge.targetPort === edge.targetPort &&
              otherEdge.sourcePort === port
          )
      )
      .forEach((port) => {
        const portCandidate = new DefaultPortCandidate(port)
        portCandidate.validity = PortCandidateValidity.VALID
        candidates.add(portCandidate)
      })

    return candidates
  }

  /**
   * @param {!IInputModeContext} undefined
   * @returns {!IEnumerable.<IPortCandidate>}
   */
  getTargetPortCandidates({ graph }) {
    const { edge } = this
    const candidates = new List()
    if (!graph) {
      return candidates
    }

    graph.ports
      // Exclude left-side port on the edge's source node:
      .filter((port) => port.owner !== edge.sourceNode)
      // Exclude any right-side ports
      .filter((port) => port.tag.side !== 'right')
      // Exclude target ports that the edge's source node already connects to:
      .filter(
        (port) =>
          !graph.edges.some(
            (otherEdge) =>
              otherEdge !== edge &&
              otherEdge.sourcePort === edge.sourcePort &&
              otherEdge.targetPort === port
          )
      )
      .forEach((port) => {
        const portCandidate = new DefaultPortCandidate(port)
        portCandidate.validity = PortCandidateValidity.VALID
        candidates.add(portCandidate)
      })

    return candidates
  }
}
