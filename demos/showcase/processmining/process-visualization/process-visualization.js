/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { IEnumerable, IGraph } from 'yfiles'
import { addItem } from './ProcessItemVisual.js'
import { getProcessStepData, getProcessTransitionData } from '../process-graph-extraction.js'

/**
 * Prepares the graph for the visualization of heat and events.
 * The nodes are associated with data about the workload.
 * @param {!IGraph} graph
 * @param {!EventLog} eventLog
 * @returns {number}
 */
export function prepareProcessVisualization(graph, eventLog) {
  const eventsByActivities = Object.fromEntries(
    IEnumerable.from(eventLog).groupBy(
      event => event.activity,
      (activity, events) => [activity, events?.toList()]
    )
  )

  // determine the heat over time for each process step
  graph.nodes.forEach(processStep => {
    const processStepData = getProcessStepData(processStep)
    const events = eventsByActivities[processStepData.label]

    // add the event's heat value for its duration
    events?.forEach(event => {
      processStepData.heat.addValues(
        event.timestamp,
        event.timestamp + (event.duration ?? 0),
        event.cost ?? 1
      )
    })

    processStepData.capacity = processStepData.heat.getMaxValue()
  })

  // determine the heat over time for each process transition
  graph.edges.forEach(processTransition => {
    const processTransitionData = getProcessTransitionData(processTransition)
    const sourceEvents = eventsByActivities[processTransitionData.sourceLabel]
    const targetEvents = eventsByActivities[processTransitionData.targetLabel]

    const allEvents = sourceEvents.concat(targetEvents)
    allEvents
      .groupBy(
        event => event.caseId,
        (caseId, events) => events?.toArray() ?? []
      )
      .filter(events => events.length > 1)
      .map(events => events.sort((event1, event2) => event1.timestamp - event2.timestamp))
      .forEach(events => {
        // skip the last event if there is an odd number of events
        const count = events.length % 2 === 0 ? events.length - 1 : events.length - 2
        for (let i = 0; i < count; i += 2) {
          // add the transition's heat value for its duration
          processTransitionData.heat.addValues(events[i].timestamp, events[i + 1].timestamp, 1)

          // add an item to the transition representing the event
          addItem(
            processTransition,
            false,
            events[0].timestamp,
            events[1].timestamp,
            Math.random() * 3 + 5,
            (Math.random() * 0.2 + 0.5) / 4 + 0.4
          )
        }
      })

    processTransitionData.capacity = processTransitionData.heat.getMaxValue()
  })

  // return the maximum time
  const maxTime =
    eventLog.sort((event1, event2) => event1.timestamp - event2.timestamp).at(-1)?.timestamp ?? 0
  return maxTime + 1
}
