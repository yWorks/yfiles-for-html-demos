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
import {
  EdgePortCandidates,
  HierarchicalLayout,
  HierarchicalLayoutData,
  HierarchicalLayoutEdgeDescriptor,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  LayoutData,
  LayoutOrientation,
  PortSides
} from '@yfiles/yfiles'

/**
 * Demonstrates how to configure {@link HierarchicalLayout}.
 * @param graph The graph to be laid out
 * @returns {{HierarchicalLayout, HierarchicalLayoutData}} the configured layout algorithm and the
 * corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  // create and configure the hierarchical layout algorithm
  const layout = new HierarchicalLayout()

  // default settings for edge routing
  const defaultEdgeDescriptor = layout.defaultEdgeDescriptor
  // the first segment length can be used to reserve "space" for edge decorations (typically
  // arrow heads) at the source end of an edge
  // since the demo's sample graph does not have source decorations, the first segment length
  // is reduced somewhat to slightly reduce the overall height of the diagram
  defaultEdgeDescriptor.minimumFirstSegmentLength = 5
  // the length of the last segment is increased to prevent bends "inside" target arrow heads
  defaultEdgeDescriptor.minimumLastSegmentLength = 20

  // default settings for node placement
  const defaultNodeDescriptor = layout.defaultNodeDescriptor
  // specifies the vertical alignment of nodes inside a layer (i.e., a horizontal line of nodes)
  // see e.g., the layer with nodes 1, 6, 8, 9, 23, and 25 where nodes with different heights are
  // bottom aligned
  defaultNodeDescriptor.layerAlignment = 0

  // specifies the main direction of the layout result
  layout.layoutOrientation = LayoutOrientation.BOTTOM_TO_TOP
  // specify a preferred maximum duration to prevent very long runtimes for LARGE graphs
  layout.stopDuration = '5s'
  // the minimum vertical distance between nodes in subsequent layers
  layout.minimumLayerDistance = 30
  // the minimum horizontal distance between nodes and long edges that span multiple layers
  // see e.g., node 1 and the edge connecting node 0 and node 4
  layout.nodeToEdgeDistance = 50
  // the minimum horizontal distance between two nodes in the same layer
  layout.nodeDistance = 10

  // try to reduce the number of bends in edges that connect nodes in subsequent layers
  // see e.g., the edges connecting node 26 to node 6 and node 10 to node 20
  // (comment the below three lines to observe the difference)
  layout.coordinateAssigner.straightenEdges = true
  // disable the barycenter node placer mode which produces more symmetric placements but would
  // make the straightenEdges option obsolete
  layout.coordinateAssigner.symmetryOptimizationStrategy = 'none'

  // create and configure layout data for the hierarchical layout algorithm
  const layoutData = new HierarchicalLayoutData()

  // aside from specifying edge routing options for all edges, it is also possible to specify
  // routing options for specific edges only - e.g., the following code changes the orthogonal
  // edge routing to octilinear routing for some edges
  const octilinearEdgeDescriptor = new HierarchicalLayoutEdgeDescriptor()
  octilinearEdgeDescriptor.minimumFirstSegmentLength = 5
  octilinearEdgeDescriptor.minimumLastSegmentLength = 20
  octilinearEdgeDescriptor.routingStyleDescriptor.defaultRoutingStyle = 'octilinear'
  // if different routing settings are necessary, the corresponding descriptors have to be
  // explicitly assigned to the appropriate edges
  layoutData.edgeDescriptors = (edge) =>
    isOctilinearEdge(edge) ? octilinearEdgeDescriptor : defaultEdgeDescriptor

  // declare some edges as "critical"
  // the set of critical edges will be routed as straight as possible
  // see the edges connecting nodes 19, 0, 1, and 2
  layoutData.criticalEdgePriorities = (edge) => (isCriticalEdge(edge) ? 10 : 0)

  // force the edge from node 20 to node 21 to leave its source node on the right side
  layoutData.ports.sourcePortCandidates.mapper.set(
    graph.edges.find((edge) => edge.tag === 12)!,
    new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT)
  )
  // force the edge from node 9 to node 7 to enter its target node on the right side
  layoutData.ports.targetPortCandidates.mapper.set(
    graph.edges.find((edge) => edge.tag === 32)!,
    new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT)
  )

  return { layout, layoutData }
}

/**
 * Determines if the given edge is a critical edge.
 * For this example, an arbitrary set of consecutive edges was chosen.
 */
function isCriticalEdge(edge: IEdge): boolean {
  const tag = edge.tag
  return tag === 1 || tag === 3 || tag === 16
}

/**
 * Determines if the given edge has to be routed in an octilinear fashion/
 * For this example, an arbitrary set of edges was chosen.
 */
function isOctilinearEdge(edge: IEdge): boolean {
  const tag = edge.tag
  return tag === 2 || tag === 6 || tag === 7 || tag === 17 || tag === 28 || tag === 33
}
