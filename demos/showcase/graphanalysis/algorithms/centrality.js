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
  BetweennessCentrality,
  ClosenessCentrality,
  ConnectedComponents,
  DegreeCentrality,
  EigenvectorCentrality,
  GraphCentrality,
  GraphStructureAnalyzer,
  LabelStyle,
  PageRank,
  WeightCentrality
} from '@yfiles/yfiles'
import { setCentrality } from './algorithms'
const centralityLabelStyle = new LabelStyle({
  font: '10px bold Tahoma,sans-serif',
  backgroundStroke: '2px #17bebb',
  backgroundFill: '#ffffff',
  autoFlip: false,
  padding: [3, 5, 3, 5]
})
/**
 * Description of the algorithm which determines the degree centrality values.
 */
export const degreeCentralityDescription = `
  <p>This part of the demo shows the <em>degree centrality</em> for the nodes of the given graph. This algorithm
  uses the degree of the nodes (incoming and outgoing edges) to determine the centrality value for each node.</p>
  <p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>`
/**
 * Calculates the degree centrality values for the given graph.
 */
export function calculateDegreeCentrality(graph) {
  const result = new DegreeCentrality({
    considerOutgoingEdges: true,
    considerIncomingEdges: true
  }).run(graph)
  const nodeCentrality = result.nodeCentrality
  const normalizedNodeCentrality = result.normalizedNodeCentrality
  graph.nodes.forEach((node) => {
    const centrality = normalizedNodeCentrality.get(node)
    setCentrality(node, centrality)
    graph.addLabel({
      owner: node,
      text: nodeCentrality.get(node).toFixed(2)
    })
  })
}
/**
 * Description of the algorithm which determines the weight centrality values.
 */
export const weightCentralityDescription = `
  <p>This part of the demo shows the <em>weight centrality</em> for the nodes of the given graph.</p>
  <p>Weights for edges must be positive and can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>.
  When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of edges into account.</p>
  <p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>`
/**
 * Calculates the weight centrality values for the given graph.
 */ export function calculateWeightCentrality(graph, config) {
  const result = new WeightCentrality({
    weights: config.edgeWeights,
    considerOutgoingEdges: true,
    considerIncomingEdges: true
  }).run(graph)
  const nodeCentrality = result.nodeCentrality
  const normalizedNodeCentrality = result.normalizedNodeCentrality
  graph.nodes.forEach((node) => {
    const centrality = normalizedNodeCentrality.get(node)
    setCentrality(node, centrality)
    graph.addLabel({ owner: node, text: nodeCentrality.get(node).toFixed(2) })
  })
}
/**
 * Description of the algorithm which determines the graph centrality values.
 */ export const graphCentralityDescription = `
  <p>This part of the demo shows the <em>graph centrality</em> for the nodes of the given graph.</p>
  <p>Weights must be positive and can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>.
  When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of
  edges into account.</p>
  <p>Note that, for disconnected graphs the centrality values of all nodes will be zero.
  This also applies to directed graphs without a node from which all other nodes are reachable.</p>
  <p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>`
/**
 * Calculates the graph centrality values for the given graph.
 */
export function calculateGraphCentrality(graph, config) {
  const result = new GraphCentrality({
    weights: config.edgeWeights,
    directed: config.directed
  }).run(graph)
  const nodeCentrality = result.nodeCentrality
  const normalizedNodeCentrality = result.normalizedNodeCentrality
  graph.nodes.forEach((node) => {
    const centrality = normalizedNodeCentrality.get(node)
    setCentrality(node, centrality)
    graph.addLabel({ owner: node, text: nodeCentrality.get(node).toFixed(2) })
  })
}
/**
 * Description of the algorithm which determines the node-edge betweenness centrality values.
 */ export const nodeEdgeBetweennessCentralityDescription = `
  <p>This part of the demo shows the <em>node betweenness centrality</em> for the nodes and edges of the given graph.</p>
  <p>The edge betweenness centrality is presented by edge labels. Weights must be positive and can be specified using <em>edge labels</em>.
  The weights of edges without labels are their <em>edge lengths</em>. When the algorithm should use <em>Uniform weights</em>
  all edges have equal weights. This algorithm can take the direction of edges into account.</p>
  <p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>`
/**
 * Calculates the node-edge betweenness centrality values for the given graph.
 */
export function calculateNodeEdgeBetweennessCentrality(graph, config) {
  const result = new BetweennessCentrality({
    weights: config.edgeWeights,
    directed: config.directed
  }).run(graph)
  const nodeCentrality = result.nodeCentrality
  const normalizedNodeCentrality = result.normalizedNodeCentrality
  graph.nodes.forEach((node) => {
    const centrality = normalizedNodeCentrality.get(node)
    setCentrality(node, centrality)
    graph.addLabel({ owner: node, text: nodeCentrality.get(node).toFixed(2) })
  })
  const edgeCentrality = result.edgeCentrality
  const normalizedEdgeCentrality = result.normalizedEdgeCentrality
  graph.edges.forEach((edge) => {
    const centrality = normalizedEdgeCentrality.get(edge)
    setCentrality(edge, centrality)
    graph.addLabel({
      owner: edge,
      text: edgeCentrality.get(edge).toFixed(2),
      tag: 'centrality',
      style: centralityLabelStyle
    })
  })
}
/**
 * Description of the algorithm which determines the closeness centrality values.
 */ export const closenessCentralityDescription = `
  <p>This part of the demo shows the <em>closeness centrality</em> for the nodes of the given graph.</p>
  <p>Weights must be positive and can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>.</p>
  <p>When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of edges into account.</p>
  <p>Note that, for disconnected graphs the algorithm will be applied to each connected component separately.</p>
  <p>The centrality of all nodes will be zero for directed graphs if there exists a node that is not reachable from all other nodes.</p>
  <p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>`
/**
 * Calculates the closeness centrality values for the given graph.
 */
export function calculateClosenessCentrality(graph, config) {
  const analyzer = new GraphStructureAnalyzer(graph)
  if (analyzer.isConnected()) {
    const result = new ClosenessCentrality({
      weights: config.edgeWeights,
      directed: config.directed
    }).run(graph)
    const normalizedNodeCentrality = result.normalizedNodeCentrality
    graph.nodes.forEach((node) => {
      const centrality = normalizedNodeCentrality.get(node)
      setCentrality(node, centrality)
      graph.addLabel({
        owner: node,
        // we use normalized node centrality for the labels to avoid very small values
        text: centrality.toFixed(2)
      })
    })
  } else {
    // if the graph is not connected, we run the algorithm separately to each connected component
    const connectedComponentsResult = new ConnectedComponents().run(graph)
    connectedComponentsResult.components.forEach((component) => {
      const result = new ClosenessCentrality({
        weights: config.edgeWeights,
        directed: config.directed,
        subgraphNodes: component.nodes
      }).run(graph)
      const normalizedNodeCentrality = result.normalizedNodeCentrality
      component.nodes.forEach((node) => {
        const centrality = normalizedNodeCentrality.get(node)
        setCentrality(node, centrality)
        // we use normalized node centrality for the labels to avoid very small values
        graph.addLabel({ owner: node, text: centrality.toFixed(2) })
      })
    })
  }
}
/**
 * Description of the algorithm which determines the Eigenvector centrality values.
 */ export const eigenvectorCentralityDescription = `
  <p>This part of the demo shows the <em>Eigenvector centrality</em> for the nodes of the given graph.</p>
  <p>Eigenvector centrality is a measure of the influence a node has on a network:
  The more nodes point to a node, the higher is that node's centrality.</p>
  <p>The centrality values are scaled so that the largest centrality value is 1.0.</p>
  <p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>`
/**
 * Calculates the Eigenvector centrality values for the given graph.
 */
export function calculateEigenvectorCentrality(graph) {
  const result = new EigenvectorCentrality().run(graph)
  const nodeCentrality = result.nodeCentrality
  graph.nodes.forEach((node) => {
    const centrality = nodeCentrality.get(node)
    setCentrality(node, centrality)
    graph.addLabel({
      owner: node,
      text: Number.isNaN(centrality) ? 'Inf' : centrality.toFixed(2)
    })
  })
}
/**
 * Description of the algorithm which determines the page rank values.
 */
export const pageRankDescription = `
  <p>This part of the demo shows the <em>PageRank</em> values for the nodes of the given graph.
  <p>The algorithm starts by initializing the rank value for each node. Then,
  it uses multiple iterations to propagate the rank of a node to its successors.
  The base factor for each successor is 1. These base factors are multiplied by edge weights and
  node weights if specified.</p>
  <p>The final node factors are scaled afterward to sum up to 1, so the overall rank stays the same
  after each iteration. The old rank value of the node multiplied with these scaled factors are then
  distributed to the successors.</p>
  <p>After each iteration, the relative change of each node's rank value ((newRank - oldRank)/oldRank)
  is calculated. If all rank value changes are below the specified precision or if the maximal
  iterations are reached, the algorithm stops.</p>
  <p>Larger and darker nodes have a higher PageRank value than small, light ones. The label shows
  the exact PageRank value.</p>`
/**
 * Calculates the page rank values for the given graph.
 */
export function calculatePageRankCentrality(graph, config) {
  const result = new PageRank({
    edgeWeights: config.edgeWeights
  }).run(graph)
  const pageRank = result.pageRank
  const maximumRank = graph.nodes.reduce((maxRank, node) => {
    return Math.max(maxRank, pageRank.get(node))
  }, 0)
  graph.nodes.forEach((node) => {
    const rank = pageRank.get(node)
    setCentrality(node, rank / maximumRank)
    graph.addLabel({
      owner: node,
      text: rank.toFixed(2)
    })
  })
}
