/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  BetweennessCentrality,
  ClosenessCentrality,
  ConnectedComponents,
  DefaultLabelStyle,
  DegreeCentrality,
  EigenvectorCentrality,
  FilteredGraphWrapper,
  GraphCentrality,
  GraphStructureAnalyzer,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  INode,
  PageRank,
  Rect,
  ResultItemMapping,
  WeightCentrality
} from 'yfiles'
import AlgorithmConfiguration from './AlgorithmConfiguration.js'
import CentralityStage from './CentralityStage.js'

/**
 * Configuration options for the Centrality Algorithms.
 */
export default class CentralityConfig extends AlgorithmConfiguration {
  /**
   * @param {number} algorithmType
   */
  constructor(algorithmType) {
    super()
    this.algorithmType = algorithmType
  }

  /**
   * Runs the selected centrality algorithm.
   * @param {!IGraph} graph the graph on which a centrality algorithm is executed.
   */
  runAlgorithm(graph) {
    this.resetGraph(graph)

    switch (this.algorithmType) {
      case CentralityConfig.WEIGHT_CENTRALITY: {
        const result = new WeightCentrality({
          weights: edge => this.getEdgeWeight(edge),
          considerOutgoingEdges: true,
          considerIncomingEdges: true
        }).run(graph)
        this.applyNodeCentralityColor(graph, result.normalizedNodeCentrality)
        break
      }
      case CentralityConfig.GRAPH_CENTRALITY: {
        const result = new GraphCentrality({
          weights: edge => this.getEdgeWeight(edge),
          directed: this.directed
        }).run(graph)
        this.applyNodeCentralityColor(graph, result.normalizedNodeCentrality)
        break
      }
      case CentralityConfig.NODE_EDGE_BETWEENESS_CENTRALITY: {
        const result = new BetweennessCentrality({
          weights: edge => this.getEdgeWeight(edge),
          directed: this.directed
        }).run(graph)
        this.applyNodeCentralityColor(graph, result.normalizedNodeCentrality)
        this.applyEdgeCentralityColor(graph, result.normalizedEdgeCentrality)
        break
      }
      case CentralityConfig.CLOSENESS_CENTRALITY: {
        const analyzer = new GraphStructureAnalyzer(graph)
        if (analyzer.isConnected()) {
          const result = new ClosenessCentrality({
            weights: edge => this.getEdgeWeight(edge),
            directed: this.directed
          }).run(graph)

          this.applyNodeCentralityColor(graph, result.normalizedNodeCentrality)
        } else {
          // if the graph in not connected, we run the algorithm separately to each connected component
          const connectedComponentsResult = new ConnectedComponents().run(graph)

          connectedComponentsResult.components.forEach(component => {
            const result = new ClosenessCentrality({
              weights: edge => this.getEdgeWeight(edge),
              directed: this.directed,
              subgraphNodes: component.nodes
            }).run(graph)

            // we only want to apply the styling to the components' nodes
            const filteredGraph = new FilteredGraphWrapper(
              graph,
              node => component.nodes.contains(node),
              edge => true
            )
            this.applyNodeCentralityColor(filteredGraph, result.normalizedNodeCentrality)
          })
        }
        break
      }
      case CentralityConfig.DEGREE_CENTRALITY: {
        const result = new DegreeCentrality({
          considerOutgoingEdges: true,
          considerIncomingEdges: true
        }).run(graph)
        this.applyNodeCentralityColor(graph, result.normalizedNodeCentrality)
        break
      }
      case CentralityConfig.EIGENVECTOR_CENTRALITY: {
        const result = new EigenvectorCentrality().run(graph)
        this.applyNodeCentralityColor(graph, result.nodeCentrality)
        break
      }
      case CentralityConfig.PAGERANK_CENTRALITY:
      default: {
        const result = new PageRank({
          edgeWeights: edge => this.getEdgeWeight(edge)
        }).run(graph)
        this.applyNodeCentralityColor(graph, result.pageRank)
        break
      }
    }
  }

  /**
   * Applies a color to the nodes according to the centrality value of the node.
   * @param {!IGraph} graph the given graph
   * @param {!ResultItemMapping.<INode,number>} centrality the node-map containing the centrality results
   */
  applyNodeCentralityColor(graph, centrality) {
    const extrema = this.getCentralityValues(graph, centrality)
    const diff = extrema.max - extrema.min

    const mostCentralValue = 100
    const leastCentralValue = 30
    const colorNumber = 50

    graph.nodes.forEach((node, index) => {
      const centralityId = centrality.get(node)
      const textLabelStyle = new DefaultLabelStyle({
        textFill: 'white'
      })

      node.tag = { id: index }

      let centralityValue = Math.round(centralityId * 100) / 100
      if (!Number.isFinite(centralityValue) || !Number.isFinite(diff)) {
        centralityValue = 'Inf'
      }

      graph.addLabel({
        owner: node,
        text: centralityValue.toString(),
        style: textLabelStyle,
        tag: 'centrality'
      })

      if (diff === 0 || centralityValue === 'Inf') {
        graph.setStyle(
          node,
          this.getMarkedNodeStyle(0, {
            lightToDark: true,
            size: 50
          })
        )
        graph.setNodeLayout(
          node,
          new Rect(node.layout.x, node.layout.y, leastCentralValue, leastCentralValue)
        )
      } else {
        // adjust gradient color
        const colorScale = (colorNumber - 1) / diff
        const index = Math.floor((centralityId - extrema.min) * colorScale)
        graph.setStyle(
          node,
          this.getMarkedNodeStyle(index, {
            lightToDark: true,
            size: 50
          })
        )

        // adjust size
        const sizeScale = (mostCentralValue - leastCentralValue) / diff
        const size = Math.floor(leastCentralValue + (centralityId - extrema.min) * sizeScale)
        graph.setNodeLayout(node, new Rect(node.layout.x, node.layout.y, size, size))
      }
    })
  }

  /**
   * Applies a color to the edges according to the centrality value of the edge.
   * @param {!IGraph} graph the given graph
   * @param {!ResultItemMapping.<IEdge,number>} centrality the node-map containing the centrality results
   */
  applyEdgeCentralityColor(graph, centrality) {
    graph.edges.forEach(edge => {
      const centralityId = centrality.get(edge)
      graph.addLabel({
        owner: edge,
        text: `${Math.round(centralityId * 100) / 100}`,
        style: new DefaultLabelStyle({
          font: '10px bold Tahoma',
          backgroundStroke: '2px lightskyblue',
          backgroundFill: 'aliceblue',
          autoFlip: false,
          insets: [3, 5, 3, 5]
        }),
        tag: 'centrality'
      })
    })
  }

  /**
   * Returns a LayoutStage that sets the node sizes according to their centrality value.
   * This LayoutStage can be used to adjust the layout algorithm and to be able to use just one layout run.
   * @param {!ILayoutAlgorithm} coreLayout the core layout algorithm
   * @param {boolean} directed true if the edges should be considered directed, false otherwise
   * @returns {!CentralityStage} a layoutStage that sets the node sizes according to their centrality value
   */
  getCentralityStage(coreLayout, directed) {
    const centralityStage = new CentralityStage(coreLayout)
    centralityStage.centrality = this.algorithmType
    centralityStage.directed = directed
    return centralityStage
  }

  /**
   * Determines the minimum and the maximum centrality value of the graph.
   * @param {!IGraph} graph the given graph
   * @param {!ResultItemMapping.<INode,number>} centrality the node map containing the centrality values
   * @returns {!object}
   */
  getCentralityValues(graph, centrality) {
    let min = Number.MAX_VALUE
    let max = -Number.MAX_VALUE

    graph.nodes.forEach(node => {
      const centralityValue = centrality.get(node)
      min = Math.min(min, centralityValue)
      max = Math.max(max, centralityValue)
    })

    return {
      min,
      max,
      difference: max - min
    }
  }

  /**
   * Returns the description text for the centrality algorithms.
   * @return the description text for the centrality algorithms
   * @type {!string}
   */
  get descriptionText() {
    switch (this.algorithmType) {
      case CentralityConfig.WEIGHT_CENTRALITY:
        return (
          '<p>This part of the demo shows the <em>weight centrality</em> for the nodes of the given graph.</p>' +
          '<p>Weights for edges must be positive and can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>. ' +
          'When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of edges into account.</p>' +
          '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
        )
      case CentralityConfig.GRAPH_CENTRALITY:
        return (
          '<p>This part of the demo shows the <em>graph centrality</em> for the nodes of the given graph.</p>' +
          '<p>Weights must be positive and can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>. ' +
          'When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of ' +
          'edges into account.</p>' +
          '<p>Note that, for disconnected graphs the centrality values of all nodes will be zero.' +
          'This also applies to directed graphs without a node from which all other nodes are reachable.</p>' +
          '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
        )
      case CentralityConfig.NODE_EDGE_BETWEENESS_CENTRALITY:
        return (
          '<p>This part of the demo shows the <em>node betweeness centrality</em> for the nodes and edges of the given graph.</p>' +
          '<p>The edge betweenness centrality is presented by edge labels. Weights must be positive and can be specified using <em>edge labels</em>. ' +
          'The weights of edges without labels are their <em>edge lengths</em>. When the algorithm should use <em>Uniform weights</em> ' +
          'all edges have equal weights. This algorithm can take the direction of edges into account.</p>' +
          '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
        )
      case CentralityConfig.CLOSENESS_CENTRALITY:
        return (
          '<p>This part of the demo shows the <em>closeness centrality</em> for the nodes of the given graph.</p>' +
          '<p>Weights must be positive and can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>.</p>' +
          '<p>When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of edges into account.</p>' +
          '<p>Note that, for disconnected graphs the algorithm will be applied to each connected component separately.</p>' +
          '<p>The centrality of all nodes will be zero for directed graphs if there exists a node that is not reachable from all other nodes.</p>' +
          '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
        )
      case CentralityConfig.DEGREE_CENTRALITY:
        return (
          '<p>This part of the demo shows the <em>degree centrality</em> for the nodes of the given graph. This algorithm ' +
          'uses the degree of the nodes (incoming and outgoing edges) to determine the centrality value for each node.</p>' +
          '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
        )
      case CentralityConfig.EIGENVECTOR_CENTRALITY:
        return (
          '<p>This part of the demo shows the <em>Eigenvector centrality</em> for the nodes of the given graph.' +
          '<p>Eigenvector centrality is a measure of the influence a node has on a network: ' +
          "The more nodes point to a node, the higher is that node's centrality.</p>" +
          '<p>The centrality values are scaled so that the largest centrality value is 1.0.</p>' +
          '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
        )
      case CentralityConfig.PAGERANK_CENTRALITY:
      default:
        return (
          '<p>This part of the demo shows the <em>PageRank</em> values for the nodes of the given graph.' +
          '<p>The algorithm starts by initializing the rank value for each node. ' +
          'After that it uses multiple iterations to propagate the rank of a node to its successors. ' +
          'The base factor for each successor is 1. These base factors are multiplied by edge weights and node weights if specified. </p>' +
          '<p>The final node factors are scaled afterwards to sum up to 1 so the overall rank stays the same after each iteration. ' +
          'The old rank value of the node multiplied with these scaled factors are then distributed to the successors. </p>' +
          "<p>After each iteration, the relative change of each node's rank value ((newRank - oldRank)/oldRank) is calculated. " +
          'If all rank value changes are below the specified precision or if the maximal iterations are reached, the algorithm stops.</p>' +
          '<p>Larger and darker nodes have a higher PageRank value than small, light ones. The label shows the exact PageRank value.</p>'
        )
    }
  }

  /**
   * Static field for degree centrality.
   * @type {number}
   */
  static get DEGREE_CENTRALITY() {
    return 0
  }

  /**
   * Static field for weight centrality.
   * @type {number}
   */
  static get WEIGHT_CENTRALITY() {
    return 1
  }

  /**
   * Static field for graph centrality.
   * @type {number}
   */
  static get GRAPH_CENTRALITY() {
    return 2
  }

  /**
   * Static field for node-edge-betweeness centrality.
   * @type {number}
   */
  static get NODE_EDGE_BETWEENESS_CENTRALITY() {
    return 3
  }

  /**
   * Static field for closeness centrality.
   * @type {number}
   */
  static get CLOSENESS_CENTRALITY() {
    return 4
  }

  /**
   * Static field for eigenvector centrality.
   * @type {number}
   */
  static get EIGENVECTOR_CENTRALITY() {
    return 5
  }

  /**
   * Static field for PageRank centrality.
   * @type {number}
   */
  static get PAGERANK_CENTRALITY() {
    return 6
  }
}
