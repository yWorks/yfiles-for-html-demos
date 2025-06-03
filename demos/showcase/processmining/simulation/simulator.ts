/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import type { IEdge, IGraph, INode, List } from '@yfiles/yfiles'
import type { EventLog } from '../event-log-types'
import { getProcessStepTag, getProcessTransitionTag, getSimulationGraph } from './simulation-graph'

/**
 * Creates an event log for a simulated process.
 */
export function createSimulatedEventLog(): EventLog {
  const eventLog: EventLog = []

  // get the graph that simulates steps and transitions as a base to create the events
  const graph = getSimulationGraph()

  // simulate multiple traversals through the graph
  // and add events to the log at each step and transition
  const simulationCount = graph.nodes.size * 30
  for (let i = 0; i < simulationCount; i++) {
    let time = Math.random() * 10
    const traversalDuration = Math.random() * 0.2 + 0.5

    let startNode = getRandom(graph.nodes.filter((node) => graph.inDegree(node) === 0).toList())
    if (startNode) {
      let startNodeTag = getProcessStepTag(startNode)
      const duration = Math.random() * Math.random() * 0.5

      // add an event for passing the first step
      eventLog.push({ caseId: i, activity: startNodeTag.label, timestamp: time, duration })

      let maxLength = graph.edges.size * 2
      while (maxLength > 0) {
        if (graph.degree(startNode) > 0) {
          const nextEdge = getRandomOutEdge(graph, startNode)
          if (!nextEdge) {
            break
          }

          const pause = Math.random() * startNode.tag.duration
          startNode = nextEdge.opposite(startNode) as INode
          startNodeTag = getProcessStepTag(startNode)

          // add an event to go to the next step
          eventLog.push({
            caseId: i,
            activity: startNodeTag.label,
            timestamp: time + traversalDuration,
            duration: pause
          })

          time += traversalDuration + pause
        }
        maxLength--
      }
    }
  }
  return eventLog
}

/**
 * Returns an out-edge at the given node which is chosen randomly.
 */
function getRandomOutEdge(graph: IGraph, node: INode): IEdge | null {
  const probabilitySum = graph.outEdgesAt(node).sum((edge) => {
    const edgeTag = getProcessTransitionTag(edge)
    return edgeTag.probability ?? 1
  })
  let value = Math.random() * probabilitySum
  return graph.outEdgesAt(node).find((edge) => {
    const edgeTag = getProcessTransitionTag(edge)
    value -= edgeTag.probability ?? 1
    return value <= 0
  })
}

/**
 * Returns a random integer value.
 * @param max the maximum value of the new integer value
 */
function nextInt(max: number): number {
  return Math.floor(Math.random() * max)
}

/**
 * Returns a random element of the given list.
 */
function getRandom<T>(list: List<T>): T | null {
  return list.size > 0 ? list.get(nextInt(list.size)) : null
}
