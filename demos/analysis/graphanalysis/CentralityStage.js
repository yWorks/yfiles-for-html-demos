/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CentralityAlgorithm,
  Graph,
  ILayoutAlgorithm,
  INodeMap,
  LayoutGraph,
  LayoutStageBase,
  Maps
} from 'yfiles'

/**
 * A LayoutStage for changing the sizes of the nodes according to their centrality values.
 */
export class CentralityStage extends LayoutStageBase {
  /**
   * Creates a new instance of CentralityStage
   * @param {!ILayoutAlgorithm} layout
   */
  constructor(layout) {
    super(layout)

    // Specifies the centrality algorithm that will be applied.
    this.centrality = 0

    // Whether the edges should be considered directed or undirected.
    this.directed = false
  }

  /**
   * Applies the layout to the given graph.
   * @param {!LayoutGraph} graph the given graph
   */
  applyLayout(graph) {
    // run the core layout
    this.applyLayoutCore(graph)

    // run the selected centrality algorithm
    const centrality = Maps.createHashedNodeMap()
    const weightProvider = graph.getDataProvider('EDGE_WEIGHTS')

    const weights = Maps.createHashedEdgeMap()

    graph.edges.forEach(edge => {
      if (weightProvider !== null && weightProvider.get(edge) !== null) {
        weights.setNumber(edge, weightProvider.get(edge))
      } else {
        // calculate geometric edge length
        const path = graph.getPath(edge)
        let totalEdgeLength = 0
        for (let cursor = path.lineSegments(); cursor.ok; cursor.next()) {
          totalEdgeLength += cursor.lineSegment.length()
        }
        weights.setNumber(edge, totalEdgeLength)
      }
    })

    switch (this.centrality) {
      case 0: {
        // DEGREE_CENTRALITY
        CentralityAlgorithm.degreeCentrality(graph, centrality, true, true)
        break
      }
      case 1: {
        // WEIGHT_CENTRALITY
        CentralityAlgorithm.weightCentrality(graph, centrality, true, true, weights)
        break
      }
      case 2: {
        // GRAPH_CENTRALITY
        CentralityAlgorithm.graphCentrality(graph, centrality, this.directed, weights)
        break
      }
      case 3: {
        // NODE_EDGE_BETWEENESS_CENTRALITY
        const edgeCentrality = Maps.createHashedEdgeMap()
        CentralityAlgorithm.nodeEdgeBetweenness(
          graph,
          centrality,
          edgeCentrality,
          this.directed,
          weightProvider
        )
        break
      }
      case 4: {
        // CLOSENESS_CENTRALITY
        CentralityAlgorithm.closenessCentrality(graph, centrality, this.directed, weights)
        break
      }
      default: {
        // DEGREE_CENTRALITY
        CentralityAlgorithm.degreeCentrality(graph, centrality, true, true)
        break
      }
    }
    CentralityAlgorithm.normalizeNodeMap(graph, centrality)

    // change the node sizes
    const mostCentralSize = 100
    const leastCentralSize = 30
    const centralityValues = this.getCentralityValues(graph, centrality)
    graph.nodes.forEach(node => {
      const centralityId = centrality.getNumber(node)
      const nodeLayout = graph.getLayout(node)
      if (centralityValues.difference > 0) {
        const sizeScale = (mostCentralSize - leastCentralSize) / centralityValues.difference
        const size = Math.floor(
          leastCentralSize + (centralityId - centralityValues.min) * sizeScale
        )
        nodeLayout.setSize(size, size)
        nodeLayout.setLocation(
          nodeLayout.x + (nodeLayout.width * 0.5 - size * 0.5),
          nodeLayout.y + (nodeLayout.height * 0.5 - size * 0.5)
        )
      } else {
        nodeLayout.setSize(leastCentralSize, leastCentralSize)
        nodeLayout.setLocation(
          nodeLayout.x + (nodeLayout.width * 0.5 - leastCentralSize * 0.5),
          nodeLayout.y + (nodeLayout.height * 0.5 - leastCentralSize * 0.5)
        )
      }
    })
  }

  /**
   * Returns the range of centrality values of the nodes.
   * @param {!Graph} graph
   * @param {!INodeMap} centrality
   * @returns {!object}
   */
  getCentralityValues(graph, centrality) {
    let min = Number.MAX_VALUE
    let max = -Number.MAX_VALUE

    graph.nodes.forEach(node => {
      const centralityValue = centrality.getNumber(node)
      min = Math.min(min, centralityValue)
      max = Math.max(max, centralityValue)
    })

    return {
      min,
      max,
      difference: max - min
    }
  }
}
