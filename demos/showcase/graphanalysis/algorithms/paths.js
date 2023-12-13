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
import {
  AllPairsShortestPaths,
  Chains,
  Paths,
  ShortestPath,
  SingleSourceShortestPaths
} from 'yfiles'
import { markItem, setComponent, setGradient } from './algorithms.js'

/**
 * Description of the algorithm which determines the shortest paths between nodes.
 */
export const shortestPathsDescription = `
  <p>This part of the demo highlights the <em>shortest/cheapest path</em> between nodes that can be
  marked using the <em>Context Menu</em>. It is possible to mark multiple sources/targets. Which
  path should be focused can be specified at the nodes that belong to several paths.</p>
  <p>Costs can be specified using <em>edge labels</em>. The cost of edges without labels is their
  <em>edge length</em>. When the algorithm should use <em>Uniform costs</em> all edges are treated
  the same. For the sake of simplicity, in this demo we allow only positive edge-costs.</p>
  <p>This algorithm can take the direction of edges into account.</p>`

/**
 * Calculates the shortest paths between start and end nodes.
 * @param {!IGraph} graph
 * @param {!AlgorithmConfig} config
 */
export function calculatedShortestPaths(graph, config) {
  const startNodes = config.startNodes
  const endNodes = config.endNodes
  if (!startNodes || !endNodes || (startNodes.length === 0 && endNodes.length)) {
    // there are no start and edge nodes, hence there are no paths
    return
  }

  if (startNodes.length === 1 && endNodes.length === 1) {
    const result = new ShortestPath({
      directed: config.directed,
      costs: config.edgeWeights,
      source: startNodes[0],
      sink: endNodes[0]
    }).run(graph)

    result.nodes.forEach((node) => {
      markItem(node)
    })
    result.edges.forEach((edge) => {
      markItem(edge)
    })
  } else {
    const result = new AllPairsShortestPaths({
      directed: config.directed,
      costs: config.edgeWeights,
      sources: startNodes,
      sinks: endNodes
    }).run(graph)

    result.paths.forEach((path, pathIndex) => {
      path.nodes.forEach((node) => {
        markItem(node, pathIndex)
      })
      path.edges.forEach((edge) => {
        markItem(edge, pathIndex)
      })
    })
  }
}

/**
 * Description of the algorithm which determines all paths between nodes.
 */
export const allPathsDescription = `
  <p>This part of the demo highlights <em>all paths</em> between two nodes that can be marked using
  the <em>Context Menu</em>.</p>
  <p>The paths may share some parts and therefore can overlap. Which path is in focus can be
  specified at the nodes which belong to several paths.</p>
  <p>This algorithm can take the direction of edges into account.</p>`

/**
 * Calculates all paths between start and edge nodes.
 * @param {!IGraph} graph
 * @param {!AlgorithmConfig} config
 */
export function calculateAllPaths(graph, config) {
  const startNodes = config.startNodes
  const endNodes = config.endNodes
  if (!startNodes || !endNodes || (startNodes.length === 0 && endNodes.length)) {
    // there are no start and edge nodes, hence there are no paths
    return
  }

  const result = new Paths({
    directed: config.directed,
    startNodes: startNodes,
    endNodes: endNodes
  }).run(graph)

  result.paths.forEach((path, pathIndex) => {
    path.nodes.forEach((node) => {
      markItem(node, pathIndex)
    })
    path.edges.forEach((edge) => {
      markItem(edge, pathIndex)
    })
  })
}

/**
 * Description of the algorithm which determines all chains in the graph.
 */
export const allChainsDescription = `
  <p>This part of the demo highlights <em>all chains</em> in the graph. Chains contain only nodes
  with degree 2 as well as their start and end node.</p>
  <p>Which path is focused in case a node belongs to several chains can be specified at these nodes.</p>
  <p>This algorithm can take the direction of edges into account.</p>`

/**
 * Calculates all chains in the given graph.
 * @param {!IGraph} graph
 * @param {!AlgorithmConfig} config
 */
export function calculateAllChains(graph, config) {
  const result = new Chains({ directed: config.directed }).run(graph)

  result.chains.forEach((chain, pathIndex) => {
    chain.nodes.forEach((node) => {
      markItem(node, pathIndex)
    })
    chain.edges.forEach((edge) => {
      markItem(edge, pathIndex)
    })
  })
}

/**
 * Description of all shortest paths from a single source to all other nodes.
 */
export const singleSourceShortestPathsDescription = `
  <p>This part of the demo marks the shortest paths from a <em>single source</em> to all other
  reachable nodes in the graph.</p>
  <p>The gradient of node and edge colors represents the distance from the source. The source can be
  marked using the <em>Context Menu</em>.</p>
  <p>Costs can be specified using <em>edge labels</em>. The cost of edges without labels is their
  <em>edge length</em>. When the algorithm should <em>Uniform costs</em> all edges are treated the
  same. For the sake of simplicity, in this demo we allow only positive edge-costs.</p>
  <p>This algorithm can take the direction of edges into account.</p>`

/**
 * Calculates all shortest paths from a single source to all other nodes.
 * @param {!IGraph} graph
 * @param {!AlgorithmConfig} config
 */
export function calculateSingleSourceShortestPaths(graph, config) {
  const startNodes = config.startNodes
  if (!startNodes || startNodes.length === 0) {
    return
  }

  const result = new SingleSourceShortestPaths({
    source: startNodes[0],
    sinks: graph.nodes,
    directed: config.directed,
    costs: config.edgeWeights
  }).run(graph)

  // determine the longest path length to be able to scale the distances later
  const longestPathLength = result.paths.reduce((maxPathLength, path) => {
    const pathLength = path.edges.reduce((edgeLength, edge) => {
      return edgeLength + config.edgeWeights.get(edge)
    }, 0)
    return Math.max(maxPathLength, pathLength)
  }, 0)

  const distances = result.distances
  const predecessors = result.predecessors
  result.paths
    .orderBy(
      (path) => path.nodes.size,
      (p1, p2) => p1 - p2
    )
    .forEach((path, pathIndex) => {
      path.nodes.forEach((node) => {
        const distance = distances.get(node) / longestPathLength

        setComponent(node, pathIndex)
        setGradient(node, distance)

        const inEdge = predecessors.get(node)
        if (inEdge) {
          setComponent(inEdge, pathIndex)
          setGradient(inEdge, distance)
        }
      })
    })
}
