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
import { type GraphComponent, LouvainModularityClustering, PageRank, Rect } from '@yfiles/yfiles'
import { getNodeTag } from '../types'

/**
 * Applies Louvain modularity clustering algorithm to the graph.
 * Assigns each node a cluster ID based on community detection.
 *
 * @param graphComponent - The graph component to cluster
 */
export function applyClustering(graphComponent: GraphComponent): void {
  const louvainModularity = new LouvainModularityClustering()
  const graph = graphComponent.graph
  const result = louvainModularity.run(graph)
  const nodeClusterIds = result.nodeClusterIds
  graph.nodes.forEach((node) => {
    getNodeTag(node).clusterId = nodeClusterIds.get(node)!
  })
}

/**
 * Applies PageRank centrality algorithm to determine node importance.
 * Scales node sizes based on centrality score (higher centrality = larger node).
 *
 * @param graphComponent - The graph component to apply PageRank to
 */
export function applyPageRankAlgorithm(graphComponent: GraphComponent): void {
  const graph = graphComponent.graph
  const result = new PageRank().run(graph)
  const pageRank = result.pageRank

  // Size range for nodes based on centrality
  const mostCentralSize = 60
  const leastCentralSize = 40

  // Update each node's size based on its PageRank centrality
  graph.nodes.forEach((node) => {
    let centralityScore = pageRank.get(node)!
    // Handle NaN values (e.g., isolated nodes)
    // Centrality values are already normalized in [0,1]
    if (Number.isNaN(centralityScore)) {
      centralityScore = 0
    }
    // Scale size linearly: leastCentralSize + (centrality * range)
    const size = Math.floor(
      leastCentralSize + centralityScore * (mostCentralSize - leastCentralSize)
    )
    // Apply new node layout with scaled size
    graph.setNodeLayout(node, Rect.from([0, 0, size, size]))
  })
}
