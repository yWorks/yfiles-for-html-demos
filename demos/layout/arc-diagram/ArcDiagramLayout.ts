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
  BaseClass,
  HierarchicalLayout,
  ILayoutAlgorithm,
  LayoutGraph,
  LayoutGraphAlgorithms,
  Point
} from '@yfiles/yfiles'

/**
 * Arranges graphs in a manner that is suitable for arc diagrams.
 *
 * I.e., nodes are placed from left to right on a horizontal line and edges are routed as "arcs"
 * from the source's node center to the target's node center.
 *
 * The actual left-to-right order of nodes may be {@link NodeOrder.FROM_SKETCH from sketch}, in
 * {@link NodeOrder.TOPOLOGICAL topological sort order}, or such that
 * {@link NodeOrder.MINIMIZE_CROSSINGS the number of edge crossings is minimized}.
 *
 * Edges may be routed such that their bends are control points for cubic bezier curves that
 * approximate semicircles. Alternatively, edges may be routed with a single bend such that
 * source node center, target node center, and bend location define a unique semi circle.
 *
 * @see {@link nodeOrder}
 * @see {@link createBezierControlPoints}
 */
export class ArcDiagramLayout extends BaseClass(ILayoutAlgorithm) {
  /**
   * The minimum distance between two subsequent nodes.
   */
  public minimumNodeDistance = 30
  /**
   * Specifies if edge path bends should be calculated as cubic bezier control points.
   * If this property is set to `true`, edges are routed in such a way that their
   * bends are control points for cubic bezier curves that approximate semi-circles.
   * If this property is set to `false`, edges are routed with a single bend such that
   * source node center, target node center, and bend location define a unique semi circle.
   */
  public createBezierControlPoints = true
  /**
   * Specifies the left-to-right order of nodes.
   * @see {@link NodeOrder}
   */
  public nodeOrder: NodeOrder = NodeOrder.FROM_SKETCH

  /**
   * Arranges the given graph.
   * @param graph the graph to be arranged.
   */
  applyLayout(graph: LayoutGraph): void {
    if (graph.nodes.size > 0) {
      this.placeNodes(graph)
    }

    if (graph.edges.size > 0) {
      this.routeEdges(graph)
    }
  }

  /**
   * Places the nodes of the given graph on a horizontal line from left to right.
   * The order in which the nodes are placed is determined by property {@link nodeOrder}.
   * @param graph the graph to be arranged.
   */
  private placeNodes(graph: LayoutGraph): void {
    let maxW = graph.nodes.first()!.layout.width
    for (const node of graph.nodes) {
      maxW = Math.max(maxW, node.layout.width)
    }

    const dist = maxW + this.minimumNodeDistance
    const order = calculateNodeOrder(graph, this.nodeOrder)
    for (const node of graph.nodes) {
      const pos = order[node.index]
      node.layout.center = new Point(pos * dist, 0)
    }
  }

  /**
   * Routes the edges in the given graph.
   * @param graph the graph to be arranged.
   */
  private routeEdges(graph: LayoutGraph): void {
    const bezier = this.createBezierControlPoints
    const bezierFactor = (4 * (Math.sqrt(2) - 1)) / 3

    for (const edge of graph.edges) {
      edge.resetPath()
      if (edge.selfLoop) {
        continue
      }

      const src = edge.source
      const tgt = edge.target

      const cxSrc = src.layout.centerX
      const cxTgt = tgt.layout.centerX
      const cxCircle = (cxSrc + cxTgt) * 0.5
      const radius = cxCircle - Math.min(cxSrc, cxTgt)

      if (bezier) {
        const sign = cxSrc > cxTgt ? -1 : 1

        const d = radius * bezierFactor
        graph.addBend(edge, cxSrc, -d)
        graph.addBend(edge, cxCircle - sign * d, -radius)
        graph.addBend(edge, cxCircle, -radius)
        graph.addBend(edge, cxCircle + sign * d, -radius)
        graph.addBend(edge, cxTgt, -d)
      } else {
        graph.addBend(edge, cxCircle, -radius)
      }
    }
  }
}

/**
 * Calculates the left-to-right order of nodes for the given graph according to the given node order
 * policy.
 * @param graph the graph to be arranged.
 * @param nodeOrderPolicy the node order policy that determines the calculated order.
 */
function calculateNodeOrder(graph: LayoutGraph, nodeOrderPolicy: NodeOrder): number[] {
  const order = new Array<number>(graph.nodes.size)

  switch (nodeOrderPolicy) {
    case NodeOrder.MINIMIZE_CROSSINGS:
      minimizeCrossings(graph, order)
      break
    case NodeOrder.TOPOLOGICAL:
      const topologicalNodeOrder = LayoutGraphAlgorithms.topologicalNodeOrder(graph)
      graph.nodes.forEach((node, index) => {
        order[index] = topologicalNodeOrder.indexOf(node)
      })
      break
    default:
      // From sketch
      fill(order)
      break
  }

  return order
}

/**
 * Fills the given array with numbers from `0` to `array.length - 1`
 * in ascending order.
 * @param order the array to fill.
 */
function fill(order: Array<number>): void {
  for (let i = 0, n = order.length; i < n; ++i) {
    order[i] = i
  }
}

/**
 * Calculate a node order with few crossings for the given graph.
 * This implementation leverages {@link HierarchicalLayout}'s sequencing phase towards this end.
 * Note, crossing minimization is an NP-hard problem. For this reason, {@link HierarchicalLayout}
 * uses an approximation when calculating a sequence.
 * @param graph the graph for which a node order is calculated.
 * @param order the array to store the new node order for the given graph.
 */
function minimizeCrossings(graph: LayoutGraph, order: Array<number>): void {
  // run hierarchical layout's sequencing phase to calculate a node order with few crossings
  const hierarchicalLayout = new HierarchicalLayout({
    fromScratchLayeringStrategy: 'user-defined',
    core: {
      stopAfterSequencing: false
    }
  })
  const hierarchicalLayoutData = hierarchicalLayout.createLayoutData(graph)
  hierarchicalLayoutData.givenLayersIndices = () => 0
  graph.applyLayout(hierarchicalLayout, hierarchicalLayoutData)

  // write the node sequence to the order array
  graph.nodes.forEach((node, index) => {
    order[index] = hierarchicalLayoutData.sequenceIndicesResult.get(node)!
  })
}

/**
 * Specifies policies for calculating the node order in an arc diagram.
 */
export enum NodeOrder {
  /**
   * Nodes will be placed from left to right in the order they were created in the graph.
   */
  FROM_SKETCH,
  /**
   * Nodes will be placed from left to right such that the number of crossings between edges is
   * reduced as much as possible.
   */
  MINIMIZE_CROSSINGS,
  /**
   * If the graph is acyclic, nodes will be placed from left to right in the order calculated
   * by a topological sorting.
   * If the graph is not acyclic, nodes will be placed from left to right in the order they were
   * created in the graph.
   */
  TOPOLOGICAL
}
