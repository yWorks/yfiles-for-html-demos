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
import { BezierEdgeStyle, Neighborhood, TraversalDirection } from 'yfiles'
import { NeighborhoodType } from './NeighborhoodType.js'
import { getBuildNeighborhoodCallback } from '../neighborhood/build-graph-callback.js'
import { createDemoEdgeStyle } from 'demo-resources/demo-styles'

/**
 * Returns the "build neighborhood graph" callback that is able to create neighborhood graphs
 * of the given type.
 * @param {!NeighborhoodType} type the type of neighborhood graph to be built by the returned callback.
 * @param {number} distance the maximum graph distance between a start node and its neighbor nodes.
 * @returns {!BuildGraphCallback}
 */
export function getBuildGraphCallback(type, distance) {
  return (view, nodes, callback) => {
    getBuildNeighborhoodCallback(getTraversalDirection(type), distance)(view, nodes, callback)

    const graph = view.neighborhoodGraph
    const edgeStyle = createNeighborhoodEdgeStyle()
    for (const edge of graph.edges) {
      graph.setStyle(edge, edgeStyle)
    }
  }
}

/**
 * Maps the given {@link NeighborhoodType} to the corresponding {@link TraversalDirection} that
 * is used by the {@link Neighborhood} algorithm in yFiles.
 * @param {!NeighborhoodType} mode
 * @returns {!TraversalDirection}
 */
function getTraversalDirection(mode) {
  switch (mode) {
    case NeighborhoodType.PREDECESSORS:
      return TraversalDirection.PREDECESSOR
    case NeighborhoodType.SUCCESSORS:
      return TraversalDirection.SUCCESSOR
    case NeighborhoodType.BOTH:
      return TraversalDirection.BOTH
    default: // NeighborhoodMode.NEIGHBORHOOD
      return TraversalDirection.UNDIRECTED
  }
}

/**
 * Creates a {@link BezierEdgeStyle} instance that uses the target arrow and stroke of the
 * default demo edge style.
 * @returns {!IEdgeStyle}
 */
function createNeighborhoodEdgeStyle() {
  const prototype = createDemoEdgeStyle()
  return new BezierEdgeStyle({
    stroke: prototype.stroke,
    targetArrow: prototype.targetArrow
  })
}
