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
  List,
  PortCandidate,
  PortCandidateProviderBase,
  PortCandidateValidity
} from '@yfiles/yfiles'
import { assertPortTag } from './FlowNodePort'

export class FlowNodePortCandidateProvider extends PortCandidateProviderBase {
  owner

  constructor(owner) {
    super()
    this.owner = owner
  }

  getPortCandidates(_context) {
    const candidates = new List()
    this.addExistingPorts(this.owner, candidates)
    return candidates
  }

  /**
   * A valid target port candidate must:
   *   - have a different side than the source port;
   *   - be on a different node than the source port;
   *   - not already be connected to the source port (regardless of the direction).
   */
  getTargetPortCandidates(context, source) {
    const graph = context.graph
    const candidates = new List()
    if (!graph || !source.port) {
      return candidates
    }
    assertPortTag(source.port.tag)

    const sourceSide = source.port.tag.side

    graph.ports
      // Exclude same-sided ports:
      .filter((port) => port.tag.side !== sourceSide)
      // Exclude ports on the source node:
      .filter((port) => port.owner !== source.owner)
      // Exclude ports that the source port already connects to:
      .filter(
        (port) =>
          !graph.edges.some((edge) => {
            // Compare points by string representations instead of comparing just simple port instances.
            // This helps to avoid scenario where node is recreated with undo and port instances don't match on the recreated edge
            const edgePortPoints = [edge.sourcePort.toString(), edge.targetPort.toString()]
            return (
              edgePortPoints.includes(port.toString()) &&
              edgePortPoints.includes(source.port.toString())
            )
          })
      )
      .forEach((port) => {
        const portCandidate = new PortCandidate(port)
        portCandidate.validity = PortCandidateValidity.VALID
        candidates.add(portCandidate)
      })

    return candidates
  }
}
