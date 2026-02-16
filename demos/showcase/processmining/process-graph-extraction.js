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
import { HeatData } from './process-visualization/HeatData'
import { HierarchicalLayout, IEnumerable, LayoutExecutor } from '@yfiles/yfiles'

// Ensure that the LayoutExecutor class is not removed by build optimizers
// It is needed for the 'applyLayoutAnimated' method in this demo.
LayoutExecutor.ensure()

/**
 * Returns the information for the given process step.
 */
export function getProcessStepData(step) {
  return step.tag
}

/**
 * Returns the information for the given process transition.
 */
export function getProcessTransitionData(transition) {
  return transition.tag
}

/**
 * Creates default information for a process step with the given activity.
 */
function createProcessStepData(activity) {
  return { label: activity, heat: new HeatData(128, 0, 30), capacity: 1 }
}

/**
 * Creates default information for a process transition between the given activities.
 */
function createProcessTransitionData(sourceActivity, targetActivity) {
  return {
    sourceLabel: sourceActivity,
    targetLabel: targetActivity,
    heat: new HeatData(128, 0, 30),
    capacity: 1
  }
}

/**
 * Extracts a graph from the given event log which represents the process flow.
 */
export function extractGraph(eventLog, graphComponent) {
  const graph = graphComponent.graph
  graph.clear()

  const activity2node = new Map()
  const activities2edge = new Map()

  // group events by case-id to get the path of each case through the process steps
  IEnumerable.from(eventLog)
    .groupBy(
      (event) => event.caseId,
      (caseId, events) => events?.toArray() ?? []
    )
    .forEach((events) => {
      let lastEvent
      events
        // sort the events by timestamp to have the correct order of traversal
        .sort((event1, event2) => event1.timestamp - event2.timestamp)
        .forEach((event) => {
          const activity = event.activity

          // add a node for the event's activity
          // if there is no node for this activity, yet
          let node = activity2node.get(activity)
          if (!node) {
            node = graph.createNode({
              labels: [event.activity],
              tag: createProcessStepData(activity)
            })
            activity2node.set(activity, node)
          }

          // add an edge between the current and the last activity
          // if there is no edge for between them, yet
          const lastActivity = lastEvent?.activity
          let edge = activities2edge.get(lastActivity + activity)
          if (lastEvent && !edge) {
            const lastNode = activity2node.get(lastActivity)
            edge = graph.createEdge({
              source: lastNode,
              target: node,
              tag: createProcessTransitionData(lastActivity, activity)
            })
            activities2edge.set(lastActivity + activity, edge)
          }

          lastEvent = event
        })
    })

  // apply an automatic layout to position the steps and transitions
  graph.applyLayout(getHierarchicalLayout())
  graphComponent.fitGraphBounds()
}

/**
 * Returns a hierarchical layout with curved edges.
 */
function getHierarchicalLayout() {
  const hierarchicalLayout = new HierarchicalLayout()
  hierarchicalLayout.defaultEdgeDescriptor.routingStyleDescriptor.defaultRoutingStyle = 'curved'
  return hierarchicalLayout
}
