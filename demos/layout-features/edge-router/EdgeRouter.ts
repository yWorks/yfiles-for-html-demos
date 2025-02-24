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
  EdgeRouter,
  EdgeRouterData,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  LayoutData,
  PortSides
} from '@yfiles/yfiles'

/**
 * Demonstrates various settings of the {@link EdgeRouter} algorithm.
 * @param graph The graph to be laid out
 * @returns {{EdgeRouter, EdgeRouterData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph: IGraph): {
  layout: ILayoutAlgorithm
  layoutData: LayoutData
} {
  const router = new EdgeRouter()
  // create the layout data for the edge routing algorithm
  const layoutData = new EdgeRouterData()

  // define distance in pixels that edges should keep to other edges
  router.defaultEdgeDescriptor.minimumEdgeDistance = 5

  // minimum length of the first and last segments
  router.defaultEdgeDescriptor.minimumFirstSegmentLength = 15
  router.defaultEdgeDescriptor.minimumLastSegmentLength = 15

  // set minimum distance that edges need to keep from nodes
  router.minimumNodeToEdgeDistance = 5

  // make the router aware of fixed edge labels (i.e. it tries to avoid overlaps with them)
  router.edgeLabelPlacement = 'consider-unaffected-edge-labels'

  // the algorithm's scope is restricted such that some edges are not routed (red edges)
  configureRouterScope(graph, router, layoutData)

  // configure individual routing styles for edges (some octilinear, others orthogonal)
  configureRoutingStyle(graph, router, layoutData)

  // configure some edges to be grouped: in this example the golden edges are grouped at their
  // target side
  configureEdgeGrouping(graph, router, layoutData)

  // configure port candidates (restrict ports to specific sides) for some edges
  // (edges at node 5 and node 7 in the example graph)
  configurePortCandidates(layoutData)

  // define that the edge routes must be on a grid with a spacing of 10 pixels
  router.gridSpacing = 10

  // limit the time which the algorithm should use - when it is up, the process tries to finish
  // as fast as possible, falling back to more simple solutions and lower quality routes
  router.stopDuration = '5s'

  return { layout: router, layoutData }
}

/**
 * Configure the {@link EdgeRouter} to only route a specific set of affected edges.
 */
function configureRouterScope(graph: IGraph, router: EdgeRouter, data: EdgeRouterData): void {
  // define the set of edges that should be routed by using a delegate function
  data.scope.edges = (edge) => shouldRouteEdge(edge)
}

function shouldRouteEdge(e: IEdge) {
  if (e.tag === 15 || e.tag === 16 || e.tag === 17 || e.tag === 18 || e.tag === 19) {
    // exclude certain edges
    return false
  }
  // route the other ones
  return true
}

/**
 * Configures the routing style for the {@link EdgeRouter} such that some edges have orthogonal
 * and some an octilinear routing style.
 */
function configureRoutingStyle(
  graph: IGraph,
  router: EdgeRouter,
  layoutData: EdgeRouterData
): void {
  // the default style - configured on the defaultEdgeDescriptor instance - is orthogonal
  const defaultDescriptor = router.defaultEdgeDescriptor
  defaultDescriptor.routingStyle = 'orthogonal'

  // configure some edges to get an octilinear routing style (blue edges in the example graph)
  // copy the current default descriptor and change the routingStyle property on the copied instance
  const octilinearDescriptor = defaultDescriptor.createCopy()
  octilinearDescriptor.routingStyle = 'octilinear'
  layoutData.edgeDescriptors = (edge) =>
    routeOctilinear(edge) ? octilinearDescriptor : defaultDescriptor
}

function routeOctilinear(edge: IEdge) {
  return edge.tag === 11 || edge.tag === 12 || edge.tag === 0
}

/**
 * Defines edge grouping constraints for some specific edges.
 */
function configureEdgeGrouping(graph: IGraph, router: EdgeRouter, layoutData: EdgeRouterData) {
  const groupId = 'goldenGroup'
  layoutData.targetGroupIds = (edge: IEdge) => (edge.tag === 10 || edge.tag == 7 ? groupId : null)
}

/**
 * Defines port candidates for edges at specific nodes.
 */
function configurePortCandidates(layoutData: EdgeRouterData) {
  layoutData.ports.sourcePortCandidates = (edge) =>
    edge.sourceNode.tag === 5 || edge.sourceNode.tag === 7
      ? new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT).addFreeCandidate(PortSides.LEFT)
      : null
  layoutData.ports.targetPortCandidates = (edge) =>
    edge.targetNode.tag === 5 || edge.targetNode.tag === 7
      ? new EdgePortCandidates().addFreeCandidate(PortSides.RIGHT).addFreeCandidate(PortSides.LEFT)
      : null
}
