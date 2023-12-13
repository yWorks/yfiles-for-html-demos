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
import { GraphCopier, IEdge, IModelItem, INode, Neighborhood, TraversalDirection } from 'yfiles'
import { NeighborhoodType } from './NeighborhoodType.js'

/**
 * Returns the "build neighborhood graph" callback that is able to create neighborhood graphs
 * of the given type.
 * @param {!NeighborhoodType} type the type of neighborhood graph to be built by the returned callback.
 * @param {number} distance the maximum graph distance between a start node and its neighbor nodes.
 * @returns {!BuildGraphCallback}
 */
export function getBuildGraphCallback(type, distance) {
  return NeighborhoodType.FOLDER_CONTENTS === type
    ? getBuildFolderContentsCallback()
    : getBuildNeighborhoodCallback(getTraversalDirection(type), distance)
}

/**
 * Returns a "build neighborhood graph" callback that creates a graph with copies of the child
 * nodes of group nodes and folder nodes (i.e. collapsed group nodes).
 * @returns {!BuildGraphCallback}
 */
export function getBuildFolderContentsCallback() {
  return (view, nodes, callback) => buildFolderContents(view, nodes, callback)
}

/**
 * Returns a "build neighborhood graph" callback that creates a graph with copies of the neighbor
 * nodes that satisfy the given traversal direction and the given maximum graph distance.
 * @param {!TraversalDirection} direction the traversal direction that determines how to collect neighbor nodes.
 * @param {number} distance the maximum graph distance between a start node and its neighbor nodes.
 * @returns {!BuildGraphCallback}
 */
export function getBuildNeighborhoodCallback(direction, distance) {
  return (view, nodes, callback) => buildNeighborhood(view, nodes, callback, direction, distance)
}

/**
 * Copies the child nodes of group nodes and folder nodes in the given source nodes set
 * to the given neighborhood view's neighborhood graph.
 * @param {!NeighborhoodView} view
 * @param {!Array.<INode>} selectedSourceNodes
 * @param {!function} elementCopiedCallback
 */
function buildFolderContents(view, selectedSourceNodes, elementCopiedCallback) {
  const nodesToCopy = new Set()

  const foldingView = view.sourceGraph.foldingView
  if (!foldingView) {
    throw new Error('FOLDER_CONTENTS mode only works on a folding enabled graph.')
  }

  // Get descendants of root nodes.
  const masterGraph = foldingView.manager.masterGraph
  const groupingSupport = masterGraph.groupingSupport
  selectedSourceNodes.forEach((node) => {
    groupingSupport.getDescendants(foldingView.getMasterItem(node)).forEach((descendant) => {
      nodesToCopy.add(descendant)
    })
  })

  // Use GraphCopier to copy the nodes inside the neighborhood into the NeighborhoodComponent's graph.
  // Include only edges that are descendants of the same root node.
  const graphCopier = new GraphCopier()
  graphCopier.copy({
    sourceGraph: masterGraph,
    targetGraph: view.neighborhoodGraph,
    filter: (item) => {
      if (item instanceof IEdge) {
        // filter intra-component edges
        return !!selectedSourceNodes.find(
          (node) =>
            groupingSupport.isDescendant(item.sourceNode, foldingView.getMasterItem(node)) &&
            groupingSupport.isDescendant(item.targetNode, foldingView.getMasterItem(node))
        )
      }
      return !(item instanceof INode) || nodesToCopy.has(item)
    },
    elementCopiedCallback
  })
}

/**
 * Copies the neighbor nodes of the given source nodes to the given neighborhood view's neighborhood graph.
 * @param {!NeighborhoodView} view
 * @param {!Array.<INode>} selectedSourceNodes
 * @param {!function} elementCopiedCallback
 * @param {!TraversalDirection} direction
 * @param {number} maxDistance
 */
function buildNeighborhood(
  view,
  selectedSourceNodes,
  elementCopiedCallback,
  direction,
  maxDistance
) {
  const sourceGraph = view.sourceGraph
  const nodesToCopy = new Set()

  for (const node of selectedSourceNodes) {
    nodesToCopy.add(node)
  }

  const result = new Neighborhood({
    startNodes: selectedSourceNodes,
    maximumDistance: maxDistance,
    traversalDirection: direction
  }).run(sourceGraph)

  for (const node of result.neighbors) {
    nodesToCopy.add(node)
  }

  // Use GraphCopier to copy the nodes inside the neighborhood into the NeighborhoodComponent's graph.
  const graphCopier = new GraphCopier()
  graphCopier.copy({
    sourceGraph: sourceGraph,
    targetGraph: view.neighborhoodGraph,
    filter: (item) => !(item instanceof INode) || nodesToCopy.has(item),
    elementCopiedCallback
  })
}

/**
 * Maps the given {@link NeighborhoodType} to the corresponding {@link TraversalDirection} that
 * is used by the {@link Neighborhood} algorithm in yFiles.
 * @param {!NeighborhoodType} type
 * @returns {!TraversalDirection}
 */
function getTraversalDirection(type) {
  switch (type) {
    case NeighborhoodType.PREDECESSORS:
      // Get predecessors of root node
      return TraversalDirection.PREDECESSOR
    case NeighborhoodType.SUCCESSORS:
      // Get successors of root node
      return TraversalDirection.SUCCESSOR
    case NeighborhoodType.BOTH:
      // Get predecessors and successors of root node
      return TraversalDirection.BOTH
    default:
    case NeighborhoodType.NEIGHBORHOOD:
      // Get direct and indirect neighbors of root node
      return TraversalDirection.UNDIRECTED
  }
}
