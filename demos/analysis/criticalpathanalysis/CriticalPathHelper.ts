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
  EdgeLabelPreferredPlacement,
  type GraphComponent,
  HierarchicalLayout,
  HierarchicalLayoutData,
  type IEdge,
  type IGraph,
  type INode,
  LabelAlongEdgePlacements,
  LabelEdgeSides,
  PortAdjustmentPolicy,
  RankAssignment,
  ShortestPath
} from '@yfiles/yfiles'

/**
 * Calculates the critical path in this graph network. We run first the rank assignment algorithm and we
 * assign to each node a number that represents its rank and to each edge a number that represents its slack.
 * The slack is the amount of time by which a task can be delayed without delaying the completion time of the project.
 * Afterward, we find the nodes with the smallest/highest ranking and we calculate the shortest path between
 * them for which we take into consideration the slack values of each edge.
 * @param graphComponent The input graphComponent
 */
export function calculateCriticalPathEdges(graphComponent: GraphComponent) {
  const graph = graphComponent.graph
  // the duration of each task is stored in the node's tag
  const taskDuration = (node: INode) => node.tag.duration | 0
  // the duration when moving from the source's task to the target's task
  const transitionDuration = (edge: IEdge) => edge.tag.transitionDuration | 0

  // runs the rank assignment algorithm to calculate the ranks and the slacks
  const results = calculateRanksAndSlacks(graph, taskDuration, transitionDuration)

  // Finds the nodes with the lowest/highest ranking...
  // In this graph, it is not really necessary since START and FINISH nodes will be the marked as
  // lowest/highest but for the general case, we have to find them based on the result of the algorithm
  const { lowestNode, highestNode } = findHighestLowestNodes(graph)

  // Calculates the shortest path between these two nodes on the graph when the edges
  // are weighted by their slack number
  const criticalPathEdges = new ShortestPath({
    source: lowestNode,
    sink: highestNode,
    costs: results.slack,
    directed: true
  }).run(graph).edges

  // adds the result information to the edges' tags
  const criticalEdgeSet = new Set(criticalPathEdges)
  graph.edges.forEach((edge) => {
    edge.tag.slack = results.slack(edge)
    if (criticalEdgeSet.has(edge)) {
      edge.tag.critical = true
    }
  })
}

/**
 * Returns the nodes with the lowest and highest ranking
 * @param graph The input graph
 */
export function findHighestLowestNodes(graph: IGraph): { highestNode: INode; lowestNode: INode } {
  const getLayerId = (node: INode) => Number(node.tag.layerId ?? 0)
  const order = graph.nodes.toSorted((a, b) => Math.sign(getLayerId(a) - getLayerId(b)))
  const lowestNode = order.first()!
  const highestNode = order.last()!
  lowestNode.tag.lowestNode = true
  highestNode.tag.highestNode = true
  return { lowestNode, highestNode }
}

/**
 * Runs the rank assignment algorithm to calculate a rank for each node and a slack for each edge.
 * @param graph The input graph
 * @param taskDuration The duration of each task represented by nodes
 * @param transitionDuration The duration when moving from one task to another (edge transition duration)
 */
function calculateRanksAndSlacks(
  graph: IGraph,
  taskDuration: (node: INode) => number,
  transitionDuration: (edge: IEdge) => number
): { slack: (edge: IEdge) => number } {
  // for each edge the min distance is the time needed for the task of each source node to be completed
  // plus the time needed to move from the source task to the target task
  const minDistance = (edge: IEdge) => {
    return transitionDuration(edge) + taskDuration(edge.sourceNode)
  }

  // run the rank assignment algorithm
  const rankAssignmentResult = new RankAssignment({
    minimumEdgeLengths: (edge) => transitionDuration(edge) + taskDuration(edge.sourceNode)
  }).run(graph)

  // store the ranking of each node at its tag
  const rankIds = rankAssignmentResult.nodeRankIds
  graph.nodes.forEach((node) => {
    node.tag.layerId = rankIds.get(node) || 0
  })

  return {
    slack: (edge) =>
      (rankIds.get(edge.targetNode) || 0) - (rankIds.get(edge.sourceNode) || 0) - minDistance(edge)
  }
}

/**
 * Configures the HierarchicalLayout algorithm. Nodes will be placed in layers based on their ranks,
 * while edges that belong to the critical path will gain priority so that the corresponding nodes
 * incident to them are aligned.
 * @param graphComponent The given graphComponent
 */
export async function runLayout(graphComponent: GraphComponent): Promise<void> {
  // the layering is calculated based on the result of the rank assignment
  const layout = new HierarchicalLayout({
    fromScratchLayeringStrategy: 'user-defined',
    layoutOrientation: 'left-to-right'
  })

  const layoutData = new HierarchicalLayoutData({
    // the information about the layering is stored in the node tags
    givenLayersIndices: (node) => node.tag.layerId,
    // edges that belong to the critical path have priority
    criticalEdgePriorities: (edge) => (edge.tag.critical ? 1 : 0),
    // configure the edge placement
    edgeLabelPreferredPlacements: () =>
      new EdgeLabelPreferredPlacement({
        edgeSide: LabelEdgeSides.LEFT_OF_EDGE,
        placementAlongEdge: LabelAlongEdgePlacements.AT_TARGET,
        distanceToEdge: 5
      })
  })

  // run the layout
  await graphComponent.applyLayoutAnimated({
    layout,
    layoutData,
    animationDuration: '0.5s',
    portAdjustmentPolicies: PortAdjustmentPolicy.ALWAYS
  })
  await graphComponent.fitGraphBounds()
}
