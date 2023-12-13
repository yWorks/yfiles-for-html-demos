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
  centralitySample,
  connectivitySample,
  cycleSample,
  kCoreSample,
  pathsSample,
  spanningTreeSample,
  substructuresCliquesSample,
  substructuresCyclesSample
} from '../samples/samples'
import type { IEdge, IGraph, INode } from 'yfiles'
import {
  calculateMinimumSpanningTree,
  minimumSpanningTreeDescription
} from './minimum-spanning-tree'
import {
  biconnectedComponentsDescription,
  calculateBiconnectedComponents,
  calculateConnectedComponents,
  calculateKCoreComponents,
  calculateReachableNodes,
  calculateStronglyConnectedComponents,
  connectedComponentsDescription,
  kCoreComponentsDescription,
  reachabilityDescription,
  stronglyConnectedComponentsDescription
} from './connectivity'
import { calculateCycles, cyclesDescription } from './cycles'
import {
  calculateClosenessCentrality,
  calculateDegreeCentrality,
  calculateEigenvectorCentrality,
  calculateGraphCentrality,
  calculateNodeEdgeBetweennessCentrality,
  calculatePageRankCentrality,
  calculateWeightCentrality,
  closenessCentralityDescription,
  degreeCentralityDescription,
  eigenvectorCentralityDescription,
  graphCentralityDescription,
  nodeEdgeBetweennessCentralityDescription,
  pageRankDescription,
  weightCentralityDescription
} from './centrality'
import { getCurrentAlgorithm, useDirectedEdges, useUniformEdgeWeights } from '../ui/ui-utils'
import {
  calculateChainSubstructures,
  calculateCliqueSubstructures,
  calculateCycleSubstructures,
  calculateStarSubstructures,
  calculateTreeSubstructures,
  chainsSubstructuresDescription,
  cliquesSubstructuresDescription,
  cycleSubstructuresDescription,
  starSubstructuresDescription,
  treeSubstructuresDescription
} from './substructures'
import { copyAndReplaceTag, getTag, resetResult, resetType } from '../demo-types'
import {
  allChainsDescription,
  allPathsDescription,
  calculateAllChains,
  calculateAllPaths,
  calculatedShortestPaths,
  calculateSingleSourceShortestPaths,
  shortestPathsDescription,
  singleSourceShortestPathsDescription
} from './paths'

/**
 * The sample data for this demo consist of adjacency lists.
 */
export type SampleData = Array<Array<number>>

/**
 * Type containing all the information needed to calculate and display the results.
 * It also stores the according sample graph and a description.
 */
export type Algorithm = {
  name: string
  directed?: boolean
  supportsDirectedness: boolean
  supportsEdgeWeights: boolean
  needsStartNodes?: boolean
  needsEndNodes?: boolean
  sample: SampleData
  apply: (graph: IGraph, config: AlgorithmConfig) => void
  description: string
}

/**
 * Type containing the configuration properties for an analysis algorithm.
 * The values are derived from the graph and the toolbar.
 */
export type AlgorithmConfig = {
  directed: boolean
  edgeWeights: Map<IEdge, number>
  startNodes?: INode[]
  endNodes?: INode[]
}

/**
 * Resets the node types.
 */
export function resetTypes(graph: IGraph): void {
  graph.nodes.forEach((node) => {
    resetType(node)
  })
}

/**
 * Applies the current algorithm with the correct configuration to the given graph.
 */
export function applyAlgorithm(graph: IGraph): void {
  resetGraph(graph)

  const currentAlgorithm = getCurrentAlgorithm()

  currentAlgorithm.apply(graph, {
    directed: useDirectedEdges(),
    edgeWeights: getEdgeWeights(graph),
    startNodes: getStartNodes(graph),
    endNodes: getEndNodes(graph)
  })

  graph.invalidateDisplays()
}

/**
 * Resets the results of the previous algorithm.
 * Removes all result-labels and resets the tag.
 */
export function resetGraph(graph: IGraph): void {
  graph.nodes.forEach((node) => {
    resetResult(node)
  })
  graph.edges.forEach((edge) => resetResult(edge))
  graph.nodeLabels.toArray().forEach((label) => {
    graph.remove(label)
  })
  graph.edgeLabels
    .toArray()
    .filter((label) => label.tag !== 'weight')
    .forEach((label) => {
      graph.remove(label)
    })
}

/**
 * A set of graph analysis algorithms.
 */
export const algorithms: Record<string, Algorithm> = {
  'minimum-spanning-tree': {
    name: 'Minimum Spanning Tree',
    supportsDirectedness: false,
    supportsEdgeWeights: true,
    sample: spanningTreeSample,
    apply: calculateMinimumSpanningTree,
    description: minimumSpanningTreeDescription
  },
  'connected-components': {
    name: 'Connected Components',
    supportsDirectedness: false,
    supportsEdgeWeights: false,
    sample: connectivitySample,
    apply: calculateConnectedComponents,
    description: connectedComponentsDescription
  },
  'biconnected-components': {
    name: 'Biconnected Components',
    supportsDirectedness: false,
    supportsEdgeWeights: false,
    sample: connectivitySample,
    apply: calculateBiconnectedComponents,
    description: biconnectedComponentsDescription
  },
  'strongly-connected-components': {
    name: 'Strongly Connected Components',
    directed: true,
    supportsDirectedness: false,
    supportsEdgeWeights: false,
    sample: connectivitySample,
    apply: calculateStronglyConnectedComponents,
    description: stronglyConnectedComponentsDescription
  },
  reachability: {
    name: 'Reachability',
    supportsDirectedness: true,
    supportsEdgeWeights: false,
    needsStartNodes: true,
    sample: connectivitySample,
    apply: calculateReachableNodes,
    description: reachabilityDescription
  },
  'k-core-components': {
    name: 'k-Core Components',
    supportsDirectedness: false,
    supportsEdgeWeights: false,
    sample: kCoreSample,
    apply: calculateKCoreComponents,
    description: kCoreComponentsDescription
  },
  'shortest-paths': {
    name: 'Shortest Paths',
    supportsDirectedness: true,
    supportsEdgeWeights: true,
    needsStartNodes: true,
    needsEndNodes: true,
    sample: pathsSample,
    apply: calculatedShortestPaths,
    description: shortestPathsDescription
  },
  'all-paths': {
    name: 'All Paths',
    supportsDirectedness: true,
    supportsEdgeWeights: false,
    needsStartNodes: true,
    needsEndNodes: true,
    sample: pathsSample,
    apply: calculateAllPaths,
    description: allPathsDescription
  },
  'all-chains': {
    name: 'All Chains',
    supportsDirectedness: true,
    supportsEdgeWeights: false,
    sample: pathsSample,
    apply: calculateAllChains,
    description: allChainsDescription
  },
  'single-source-shortest-paths': {
    name: 'Single Source Shortest Paths',
    supportsDirectedness: true,
    supportsEdgeWeights: true,
    needsStartNodes: true,
    sample: pathsSample,
    apply: calculateSingleSourceShortestPaths,
    description: singleSourceShortestPathsDescription
  },
  cycles: {
    name: 'Cycles',
    supportsDirectedness: true,
    supportsEdgeWeights: false,
    sample: cycleSample,
    apply: calculateCycles,
    description: cyclesDescription
  },
  'degree-centrality': {
    name: 'Degree Centrality',
    supportsDirectedness: false,
    supportsEdgeWeights: false,
    sample: centralitySample,
    apply: calculateDegreeCentrality,
    description: degreeCentralityDescription
  },
  'weight-centrality': {
    name: 'Weight Centrality',
    supportsDirectedness: false,
    supportsEdgeWeights: true,
    sample: centralitySample,
    apply: calculateWeightCentrality,
    description: weightCentralityDescription
  },
  'graph-centrality': {
    name: 'Graph Centrality',
    supportsDirectedness: true,
    supportsEdgeWeights: true,
    sample: centralitySample,
    apply: calculateGraphCentrality,
    description: graphCentralityDescription
  },
  'node-edge-betweenness-centrality': {
    name: 'Node Edge Betweenness Centrality',
    supportsDirectedness: true,
    supportsEdgeWeights: true,
    sample: centralitySample,
    apply: calculateNodeEdgeBetweennessCentrality,
    description: nodeEdgeBetweennessCentralityDescription
  },
  'closeness-centrality': {
    name: 'Closeness Centrality',
    supportsDirectedness: true,
    supportsEdgeWeights: true,
    sample: centralitySample,
    apply: calculateClosenessCentrality,
    description: closenessCentralityDescription
  },
  'eigenvector-centrality': {
    name: 'Eigenvector Centrality',
    supportsDirectedness: true,
    supportsEdgeWeights: true,
    sample: centralitySample,
    apply: calculateEigenvectorCentrality,
    description: eigenvectorCentralityDescription
  },
  'page-rank': {
    name: 'Page Rank',
    supportsDirectedness: false,
    supportsEdgeWeights: true,
    sample: centralitySample,
    apply: calculatePageRankCentrality,
    description: pageRankDescription
  },
  'substructures-chains': {
    name: 'Substructures Chains',
    supportsDirectedness: true,
    supportsEdgeWeights: false,
    sample: substructuresCyclesSample,
    apply: calculateChainSubstructures,
    description: chainsSubstructuresDescription
  },
  'substructures-cycles': {
    name: 'Substructures Cycles',
    supportsDirectedness: true,
    supportsEdgeWeights: false,
    sample: substructuresCyclesSample,
    apply: calculateCycleSubstructures,
    description: cycleSubstructuresDescription
  },
  'substructures-stars': {
    name: 'Substructures Stars',
    supportsDirectedness: true,
    supportsEdgeWeights: false,
    sample: substructuresCyclesSample,
    apply: calculateStarSubstructures,
    description: starSubstructuresDescription
  },
  'substructures-trees': {
    name: 'Substructures Trees',
    supportsDirectedness: true,
    supportsEdgeWeights: false,
    sample: substructuresCyclesSample,
    apply: calculateTreeSubstructures,
    description: treeSubstructuresDescription
  },
  'substructures-cliques': {
    name: 'Substructures Cliques',
    supportsDirectedness: false,
    supportsEdgeWeights: false,
    sample: substructuresCliquesSample,
    apply: calculateCliqueSubstructures,
    description: cliquesSubstructuresDescription
  }
}

/**
 * Returns a map containing a weight value for each edge.
 */
function getEdgeWeights(graph: IGraph): Map<IEdge, number> {
  const weights = new Map<IEdge, number>()
  graph.edges.forEach((edge) => {
    if (useUniformEdgeWeights()) {
      weights.set(edge, 1)
    } else {
      // if edge has at least one label ...
      if (edge.labels.size > 0) {
        // ... try to return its value
        const edgeWeight = parseFloat(edge.labels.first().text)
        weights.set(edge, Math.max(edgeWeight, 0))
      } else {
        weights.set(edge, 1)
      }
    }
  })
  return weights
}

/**
 * Retrieves all nodes that are marked as start nodes.
 */
function getStartNodes(graph: IGraph): INode[] {
  const currentAlgorithm = getCurrentAlgorithm()
  const needsStartNodes = currentAlgorithm.needsStartNodes ?? false
  if (!needsStartNodes || graph.nodes.size === 0) {
    return []
  }

  const startNodes = graph.nodes.filter((node) => getTag(node).type === 'start').toArray()
  if (startNodes.length === 0) {
    const startNode = graph.nodes.first()
    const tag = copyAndReplaceTag(startNode)
    tag.type = 'start'
    startNodes.push(startNode)
  }
  return startNodes
}

/**
 * Retrieves all nodes that are marked as end nodes.
 */
function getEndNodes(graph: IGraph): INode[] {
  const currentAlgorithm = getCurrentAlgorithm()
  const needsEndNodes = currentAlgorithm.needsEndNodes ?? false
  if (!needsEndNodes || graph.nodes.size === 0) {
    return []
  }

  const endNodes = graph.nodes.filter((node) => getTag(node).type === 'end').toArray()
  if (endNodes.length === 0) {
    const endNode = graph.nodes.last()
    const tag = copyAndReplaceTag(endNode)
    tag.type = 'end'
    endNodes.push(endNode)
  }
  return endNodes
}

/**
 * Marks the item by adding the component to its tag.
 */
export function markItem(item: INode | IEdge, componentId = 0): void {
  setComponent(item, componentId)
}

/**
 * Adds the component to the item's tag.
 */
export function setComponent(item: INode | IEdge, componentId: number): void {
  const tag = copyAndReplaceTag(item)
  const components: number[] = tag.components
  if (!components.includes(componentId)) {
    components.push(componentId)
  }
}

/**
 * Sets the centrality value on the item's tag.
 */
export function setCentrality(item: INode | IEdge, centrality: number): void {
  const tag = copyAndReplaceTag(item)
  tag.centrality = centrality
  tag.gradient = centrality
}

/**
 * Sets the gradient value on the item's tag.
 */
export function setGradient(item: INode | IEdge, gradient: number): void {
  const tag = copyAndReplaceTag(item)
  tag.gradient = gradient
}
