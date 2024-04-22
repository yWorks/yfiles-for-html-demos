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
  EdgeRouter,
  EdgeRouterData,
  EdgeRouterEdgeRoutingStyle,
  EdgeRouterScope,
  Grid,
  ICollection,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  LayoutData,
  List,
  PortCandidate,
  PortDirections
} from 'yfiles'

/**
 * Demonstrates various settings of the {@link EdgeRouter} algorithm.
 * @param {!IGraph} graph The graph to be laid out
 * @returns {!object} {{EdgeRouter, EdgeRouterData}} the configured layout algorithm and the corresponding layout data
 */
export function createFeatureLayoutConfiguration(graph) {
  const router = new EdgeRouter()
  // create the layout data for the edge routing algorithm
  const layoutData = new EdgeRouterData()

  // define distance in pixels that edges should keep to other edges
  router.defaultEdgeLayoutDescriptor.minimumEdgeToEdgeDistance = 5

  // minimum length of the first and last segments
  router.defaultEdgeLayoutDescriptor.minimumFirstSegmentLength = 15
  router.defaultEdgeLayoutDescriptor.minimumLastSegmentLength = 15

  // set minimum distance that edges need to keep from nodes
  router.minimumNodeToEdgeDistance = 5

  // make the router aware of fixed node and edge labels (i.e. it tries to avoid overlaps with them)
  router.considerEdgeLabels = true
  router.considerNodeLabels = true

  // the algorithm's scope is restricted such that some edges are not routed (red edges)
  configureRouterScope(graph, router, layoutData)

  // configure individual routing styles for edges (some octilinear, others orthogonal)
  configureRoutingStyle(graph, router, layoutData)

  // configure some edges to be grouped: in this example the golden edges are grouped at their
  // target side
  configureEdgeGrouping(graph, router, layoutData)

  // configure port candidates (restrict ports to specific sides) for some edges
  // (edges at node 5 and node 7 in the example graph)
  configurePortCandidates(graph, router, layoutData)

  // define that the edge routes must be on a grid with a spacing of 10 pixels
  router.grid = new Grid(0, 0, 10)

  // limit the time which the algorithm should use - when it is up, the process tries to finish
  // as fast as possible, falling back to more simple solutions and lower quality routes
  router.maximumDuration = 5000

  return { layout: router, layoutData }
}

/**
 * Configure the {@link EdgeRouter} to only route a specific set of affected edges.
 * @param {!IGraph} graph
 * @param {!EdgeRouter} router
 * @param {!EdgeRouterData} data
 */
function configureRouterScope(graph, router, data) {
  // use scope 'affected' edges meaning that we must define a set of edges that are affected
  router.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES

  // define the set of edges that should be routed by using a delegate function
  data.affectedEdges.delegate = (edge) => shouldRouteEdge(edge)
}

/**
 * @param {!IEdge} e
 */
function shouldRouteEdge(e) {
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
 * @param {!IGraph} graph
 * @param {!EdgeRouter} router
 * @param {!EdgeRouterData} layoutData
 */
function configureRoutingStyle(graph, router, layoutData) {
  // the default style - configured on the defaultEdgeLayoutDescriptor instance - is orthogonal
  const defaultDescriptor = router.defaultEdgeLayoutDescriptor
  defaultDescriptor.routingStyle = EdgeRouterEdgeRoutingStyle.ORTHOGONAL

  // configure some edges to get an octilinear routing style (blue edges in the example graph)
  // copy the current default descriptor and change the routingStyle property on the copied instance
  const octilinearDescriptor = defaultDescriptor.createCopy()
  octilinearDescriptor.routingStyle = EdgeRouterEdgeRoutingStyle.OCTILINEAR
  layoutData.edgeLayoutDescriptors.delegate = (edge) =>
    routeOctilinear(edge) ? octilinearDescriptor : defaultDescriptor
}

/**
 * @param {!IEdge} edge
 */
function routeOctilinear(edge) {
  return edge.tag === 11 || edge.tag === 12 || edge.tag === 0
}

/**
 * Defines edge grouping constraints for some specific edges.
 * @param {!IGraph} graph
 * @param {!EdgeRouter} router
 * @param {!EdgeRouterData} layoutData
 */
function configureEdgeGrouping(graph, router, layoutData) {
  const groupId = 'goldenGroup'
  layoutData.targetGroupIds.delegate = (edge) => (edge.tag === 10 || edge.tag == 7 ? groupId : null)
}

/**
 * Defines port candidates for edges at specific nodes.
 * @param {!IGraph} graph
 * @param {!EdgeRouter} router
 * @param {!EdgeRouterData} layoutData
 */
function configurePortCandidates(graph, router, layoutData) {
  layoutData.sourcePortCandidates = (edge) => {
    if (edge.sourceNode.tag === 5 || edge.sourceNode.tag === 7) {
      return new List([
        PortCandidate.createCandidate(PortDirections.EAST),
        PortCandidate.createCandidate(PortDirections.WEST)
      ])
    }
    return null
  }
  layoutData.targetPortCandidates = (edge) => {
    if (edge.targetNode.tag === 5 || edge.targetNode.tag === 7) {
      return new List([
        PortCandidate.createCandidate(PortDirections.EAST),
        PortCandidate.createCandidate(PortDirections.WEST)
      ])
    }
    return null
  }
}
