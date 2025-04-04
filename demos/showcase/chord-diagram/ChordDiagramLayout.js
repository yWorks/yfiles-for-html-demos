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
  EdgeDataKey,
  IGraph,
  IMapper,
  LayoutEdge,
  LayoutGraph,
  LayoutStageBase,
  Point
} from '@yfiles/yfiles'
/**
 * Arranges nodes in a circle.
 * Determines the size for each node by comparing the number and weights of all edges at the node.
 * In the resulting layout, ...
 * ... a node's width stores the angle (in radians) of the arc segment which the node represents and
 * ... a node's height stores the thickness of said arc segment.
 */
export class ChordDiagramLayout extends LayoutStageBase {
  _gapRatio
  static EDGE_WEIGHT_KEY = new EdgeDataKey('EDGE_WEIGHT_DATA_KEY')
  static STYLE_HINT_KEY = new EdgeDataKey('STYLE_HINT_DATA_KEY')
  static CENTER = Point.ORIGIN
  static RADIUS = 300
  /**
   * Sets the ratio of gaps to nodes, default value is 25%
   * @param value - [0..1] what ratio is occupied by empty space
   */
  set gapRatio(value) {
    this._gapRatio = value
  }
  /**
   * Returns the ratio of gaps to nodes, default value is 25%
   * @returns value [0..1] what ratio is occupied by empty space
   */
  get gapRatio() {
    return this._gapRatio
  }
  constructor() {
    super()
    this._gapRatio = 0.25
  }
  /**
   * Arranges the given graph.
   * Note, the input graph is a {@link LayoutGraph}, which is a copy of the {@link IGraph} that
   * is operated on when setting styles or where input events are received from.
   * @param graph the graph to be arranged.
   */
  applyLayoutImpl(graph) {
    // Retrieve the mapper that assigns a thickness to each edge. This has been set up
    // through the layout data
    const edgeThicknessMap = graph.context.getItemData(ChordDiagramLayout.EDGE_WEIGHT_KEY)
    // this mapper is used to make style information available to the EdgeStyle
    const edgeStyleHintMap = graph.context.getItemData(ChordDiagramLayout.STYLE_HINT_KEY)
    const radius = ChordDiagramLayout.RADIUS
    // compute the total thickness of all edges
    const totalEdgeWeights = graph.edges.reduce(
      (acc, current) => acc + edgeThicknessMap.get(current),
      0
    )
    // normalize the edge weights
    graph.edges.forEach((edge) => {
      const votesOnEdge = edgeThicknessMap.get(edge)
      const normalizedThickness = (votesOnEdge / totalEdgeWeights) * (Math.PI * (1 - this.gapRatio)) // reserve half the circle for gaps between nodes
      edgeThicknessMap.set(edge, normalizedThickness)
    })
    // nodes will be successively placed around a circle,
    // starting at an angle of 0° which corresponds to the rightmost point
    let startAngle = 0
    // gap between two nodes
    const gap = (Math.PI * 2 * this.gapRatio) / graph.nodes.size
    // compute a map of node sizes. The node size is equal to the compound size of all edges at the node
    const nodeSizes = graph.nodes
      .map((node) => node.edges.reduce((acc, curr) => acc + edgeThicknessMap.get(curr), 0))
      .toArray()
    // sort edges to prevent intra-node crossings
    graph.nodes.forEach((n, idx) => {
      n.sortOutEdges((edge0, edge1) => {
        const targetIndex0 = graph.nodes.findIndex((node) => node == edge0.target)
        const targetIndex1 = graph.nodes.findIndex((node) => node == edge1.target)
        return compareEdges(idx, targetIndex0, targetIndex1, nodeSizes, gap)
      })
      n.sortInEdges((edge0, edge1) => {
        const targetIndex0 = graph.nodes.findIndex((node) => node == edge0.source)
        const targetIndex1 = graph.nodes.findIndex((node) => node == edge1.source)
        return compareEdges(idx, targetIndex0, targetIndex1, nodeSizes, gap)
      })
      // observe how a different sorting strategy (or not sorting at all) influences the result
      // n.sortOutEdges(
      //   IComparer.create((edge0, edge1) => {
      //     const weight0 = edgeThicknessMap.getNumber(edge0)
      //     const weight1 = edgeThicknessMap.getNumber(edge1)
      //     if (weight0 < weight1) {
      //       return -1
      //     } else if (weight0 > weight1) {
      //       return 1
      //     } else {
      //       return 0
      //     }
      //   })
      // )
    })
    graph.nodes.forEach((n, idx) => {
      const nodeSize = nodeSizes[idx]
      n.layout.width = nodeSize
      n.layout.height = 40
      // set the position of this node as the center of its arc segment
      n.layout.center = new Point(
        radius * Math.cos(startAngle + (nodeSize + gap) * 0.5),
        radius * Math.sin(startAngle + (nodeSize + gap) * 0.5)
      )
      let edgeSegmentStart = startAngle + gap / 2
      // compute where the start and end points of inbound edges lie on a node
      n.inEdges.forEach((edge) => {
        const thickness = edgeThicknessMap.get(edge)
        const edgeSegmentEnd = edgeSegmentStart + thickness
        const center = edgeSegmentStart + 0.5 * thickness
        edge.targetPortLocation = new Point(radius * Math.cos(center), radius * Math.sin(center))
        const hints = getHints(edgeStyleHintMap, edge)
        hints.targetStart = new Point(
          radius * Math.cos(edgeSegmentStart),
          radius * Math.sin(edgeSegmentStart)
        )
        hints.targetEnd = new Point(
          radius * Math.cos(edgeSegmentEnd),
          radius * Math.sin(edgeSegmentEnd)
        )
        edgeSegmentStart = edgeSegmentEnd
      })
      // compute where the start and end points of outbound edges lie on a node
      n.outEdges.forEach((edge) => {
        const thickness = edgeThicknessMap.get(edge)
        const edgeSegmentEnd = edgeSegmentStart + thickness
        const center = edgeSegmentStart + 0.5 * thickness
        edge.sourcePortLocation = new Point(radius * Math.cos(center), radius * Math.sin(center))
        const hints = getHints(edgeStyleHintMap, edge)
        hints.sourceStart = new Point(
          radius * Math.cos(edgeSegmentStart),
          radius * Math.sin(edgeSegmentStart)
        )
        hints.sourceEnd = new Point(
          radius * Math.cos(edgeSegmentEnd),
          radius * Math.sin(edgeSegmentEnd)
        )
        edgeSegmentStart = edgeSegmentEnd
      })
      // forward to the next node position
      startAngle += nodeSize + gap
    })
  }
}
/**f
 * Gets the hints for the given edge.
 */
function getHints(map, edge) {
  let hints = map.get(edge)
  if (!hints) {
    hints = {
      circleCenter: Point.ORIGIN,
      sourceStart: Point.ORIGIN,
      sourceEnd: Point.ORIGIN,
      targetStart: Point.ORIGIN,
      targetEnd: Point.ORIGIN
    }
    map.set(edge, hints)
  }
  return hints
}
/**
 * Helper function to compute the distance between startIndex and targetIndex nodes
 * in clockwise direction.
 */
function clockwiseDistance(startIndex, targetIndex, nodeSizes, gap) {
  if (startIndex == targetIndex) {
    return 0
  }
  let distance = nodeSizes[targetIndex] / 2
  let idx = startIndex
  while (idx != targetIndex) {
    distance += nodeSizes[idx] + gap
    idx = idx >= nodeSizes.length - 1 ? 0 : idx + 1
  }
  return distance
}
/**
 * Helper function to compute the distance between startIndex and targetIndex nodes
 * in counter-clockwise direction.
 */
function counterclockwiseDistance(startIndex, targetIndex, nodeSizes, gap) {
  if (startIndex == targetIndex) {
    return 0
  }
  let distance = nodeSizes[targetIndex] / 2
  let idx = startIndex
  while (idx != targetIndex) {
    distance += nodeSizes[idx] + gap
    idx = idx <= 0 ? nodeSizes.length - 1 : idx - 1
  }
  return distance
}
/**
 * Helper function to compute which edge should precede another on a node. If the shortest paths from
 * the start node lead in the same direction, sort them by distance. Else, arrange them, so they
 * spread out undisturbed by one another.
 */
function compareEdges(startIndex, targetIndex0, targetIndex1, nodeSizes, gap) {
  const t0LeftDistance = clockwiseDistance(startIndex, targetIndex0, nodeSizes, gap)
  const t0RightDistance = counterclockwiseDistance(startIndex, targetIndex0, nodeSizes, gap)
  const t0IsLeft = t0LeftDistance < t0RightDistance
  const t1LeftDistance = clockwiseDistance(startIndex, targetIndex1, nodeSizes, gap)
  const t1RightDistance = counterclockwiseDistance(startIndex, targetIndex1, nodeSizes, gap)
  const t1IsLeft = t1LeftDistance < t1RightDistance
  if (t0IsLeft && t1IsLeft) {
    if (t0LeftDistance < t1LeftDistance) {
      return 1
    } else {
      return -1
    }
  }
  if (!t0IsLeft && !t1IsLeft) {
    if (t0RightDistance < t1RightDistance) {
      return -1
    } else {
      return 1
    }
  }
  if (t0IsLeft && !t1IsLeft) {
    return 1
  }
  if (!t0IsLeft && t1IsLeft) {
    return -1
  }
  return 0
}
