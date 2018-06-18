/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component', './AlgorithmConfiguration', './CentralityStage.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  AlgorithmConfiguration,
  CentralityStage
) => {
  /**
   * Configuration options for the Centrality Algorithms.
   */
  class CentralityConfig extends AlgorithmConfiguration {
    constructor(algorithmType) {
      super()
      this.$algorithmType = algorithmType
    }

    /**
     * Runs the selected centrality algorithm.
     * @param {yfiles.graph.IGraph} graph the graph on which a centrality algorithm is executed.
     */
    runAlgorithm(graph) {
      this.resetGraph(graph)

      const graphAdapter = new yfiles.layout.YGraphAdapter(graph)
      const nodeCentrality = graphAdapter.yGraph.createNodeMap()
      const edgeCentrality = graphAdapter.yGraph.createEdgeMap()
      const edgeWeightProvider = graphAdapter.createDataProvider(
        yfiles.graph.IEdge.$class,
        yfiles.lang.Number.$class,
        this.getEdgeWeight.bind(this)
      )

      switch (this.$algorithmType) {
        case CentralityConfig.WEIGHT_CENTRALITY:
          yfiles.algorithms.Centrality.weightCentrality(
            graphAdapter.yGraph,
            nodeCentrality,
            true,
            true,
            edgeWeightProvider
          )
          break
        case CentralityConfig.GRAPH_CENTRALITY:
          yfiles.algorithms.Centrality.graphCentrality(
            graphAdapter.yGraph,
            nodeCentrality,
            this.directed,
            edgeWeightProvider
          )
          break
        case CentralityConfig.NODE_EDGE_BETWEENESS_CENTRALITY:
          yfiles.algorithms.Centrality.nodeEdgeBetweenness(
            graphAdapter.yGraph,
            nodeCentrality,
            edgeCentrality,
            this.directed,
            edgeWeightProvider
          )
          yfiles.algorithms.Centrality.normalizeEdgeMap(graphAdapter.yGraph, edgeCentrality)
          this.applyEdgeCentralityColor(graph, edgeCentrality, graphAdapter)
          break
        case CentralityConfig.CLOSENESS_CENTRALITY:
          yfiles.algorithms.Centrality.closenessCentrality(
            graphAdapter.yGraph,
            nodeCentrality,
            this.directed,
            edgeWeightProvider
          )
          break
        case CentralityConfig.DEGREE_CENTRALITY:
        default:
          yfiles.algorithms.Centrality.degreeCentrality(
            graphAdapter.yGraph,
            nodeCentrality,
            true,
            true
          )
          break
      }
      yfiles.algorithms.Centrality.normalizeNodeMap(graphAdapter.yGraph, nodeCentrality)
      this.applyNodeCentralityColor(graph, nodeCentrality, graphAdapter)

      graphAdapter.yGraph.disposeNodeMap(nodeCentrality)
      graphAdapter.yGraph.disposeEdgeMap(edgeCentrality)
    }

    /**
     * Applies a color to the nodes according to the centrality value of the node.
     * @param {yfiles.graph.IGraph} graph the given graph
     * @param {yfiles.algorithms.INodeMap} centrality the node-map containing the centrality results
     * @param {yfiles.layout.YGraphAdapter} graphAdapter the adapter used for applied the centrality algorithm
     */
    applyNodeCentralityColor(graph, centrality, graphAdapter) {
      const extrema = this.getCentralityValues(graphAdapter.yGraph, centrality)
      const diff = extrema.max - extrema.min

      const mostCentralValue = 100
      const leastCentralValue = 30
      const colorNumber = 50

      graph.nodes.forEach(node => {
        const centralityId = centrality.getNumber(graphAdapter.getCopiedNode(node))
        const textLabelStyle = new yfiles.styles.DefaultLabelStyle({
          textFill: 'white'
        })
        node.tag = `${Math.round(centralityId * 100) / 100}`

        if (isNaN(node.tag) || isNaN(diff)) {
          node.tag = 'Inf'
        }
        graph.addLabel(node, node.tag, null, textLabelStyle, null, 'centrality')

        if (diff === 0 || isNaN(diff)) {
          graph.setStyle(
            node,
            this.getMarkedNodeStyle(0, {
              lightToDark: true,
              count: 50
            })
          )
          graph.setNodeLayout(
            node,
            new yfiles.geometry.Rect(
              node.layout.x,
              node.layout.y,
              leastCentralValue,
              leastCentralValue
            )
          )
        } else {
          // adjust gradient color
          const colorScale = (colorNumber - 1) / diff
          const index = parseInt((centralityId - extrema.min) * colorScale)
          graph.setStyle(
            node,
            this.getMarkedNodeStyle(index, {
              lightToDark: true,
              count: 50
            })
          )

          // adjust size
          const sizeScale = (mostCentralValue - leastCentralValue) / diff
          const size = parseInt(leastCentralValue + (centralityId - extrema.min) * sizeScale)
          graph.setNodeLayout(
            node,
            new yfiles.geometry.Rect(node.layout.x, node.layout.y, size, size)
          )
        }
      })
    }

    /**
     * Applies a color to the edges according to the centrality value of the edge.
     * @param {yfiles.graph.IG} graph the given graph
     * @param {files.algorithms.INodeMap} centrality the node-map containing the centrality results
     * @param {yfiles.layout.YGraphAdapter} graphAdapter the adapter used for applied the centrality algorithm
     */
    applyEdgeCentralityColor(graph, centrality, graphAdapter) {
      graph.edges.forEach(edge => {
        const centralityId = centrality.getNumber(graphAdapter.getCopiedEdge(edge))
        edge.tag = `${Math.round(centralityId * 100) / 100}`
        graph.addLabel(edge, edge.tag, null, null, null, 'centrality')
      })
    }

    /**
     * Returns a LayoutStage that sets the node sizes according to their centrality value.
     * This LayoutStage can be used to adjust the layout algorithm and to be able to use just one layout run.
     * @param {yfiles.layout.ILayoutAlgorithm} coreLayout the core layout algorithm
     * @param {boolean} directed true if the edges should be considered directed, false otherwise
     * @return {CentralityStage} a layoutStage that sets the node sizes according to their centrality value
     */
    getCentralityStage(coreLayout, directed) {
      const centralityStage = new CentralityStage(coreLayout)
      centralityStage.$centrality = this.$algorithmType
      centralityStage.$directed = directed
      return centralityStage
    }

    /**
     * Determines the minimum and the maximum centrality value of the graph.
     * @param {yfiles.algorithms.Graph} graph the given graph
     * @param {yfiles.algorithms.INodeMap} centrality the node map containing the centrality values
     * @return {{min: Number, max: number, difference: number}}
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

    /**
     * Returns the description text for the centrality algorithms.
     * @returns {string} the description text for the centrality algorithms
     */
    get descriptionText() {
      switch (this.$algorithmType) {
        case CentralityConfig.WEIGHT_CENTRALITY:
          return (
            '<p>This part of the demo shows the <em>weight centrality</em> for the nodes of the given graph.</p>' +
            '<p>Weights for edges can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>.' +
            'When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of edges into account.</p>' +
            '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
          )
        case CentralityConfig.GRAPH_CENTRALITY:
          return (
            '<p>This part of the demo shows the <em>graph centrality</em> for the nodes of the given graph.</p>' +
            '<p>Weights can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>. ' +
            'When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of ' +
            'edges into account.</p>' +
            '<p>Note that, for disconnected graphs the centrality values of all nodes will be zero.' +
            'This also applies to directed graphs without a node from which all other nodes are reachable.</p>' +
            '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
          )
        case CentralityConfig.NODE_EDGE_BETWEENESS_CENTRALITY:
          return (
            '<p>This part of the demo shows the <em>node betweeness centrality</em> for the nodes and edges of the given graph.</p>' +
            '<p>The edge betweenness centrality is presented by edge labels. Weights can be specified using <em>edge labels</em>. ' +
            'The weights of edges without labels are their <em>edge lengths</em>. When the algorithm should use <em>Uniform weights</em> ' +
            'all edges have equal weights. This algorithm can take the direction of edges into account.</p>' +
            '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
          )
        case CentralityConfig.CLOSENESS_CENTRALITY:
          return (
            '<p>This part of the demo shows the <em>closeness centrality</em> for the nodes of the given graph.</p>' +
            '<p>Weights can be specified using <em>edge labels</em>. The weights of edges without labels are their <em>edge lengths</em>.</p>' +
            '<p>When the algorithm should use <em>Uniform weights</em> all edges have equal weights. This algorithm can take the direction of edges into account.</p>' +
            '<p>Note that, for disconnected graphs the centrality values of all nodes will be zero.' +
            'This also applies to directed graphs without a node from which all other nodes are reachable.</p>' +
            '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
          )
        case CentralityConfig.DEGREE_CENTRALITY:
        default:
          return (
            '<p>This part of the demo shows the <em>degree centrality</em> for the nodes of the given graph. This algorithm ' +
            'uses the degree of the nodes (incoming and outgoing edges) to determine the centrality value for each node.</p>' +
            '<p>Larger and darker nodes are more central than small, light ones. The label shows the exact centrality value.</p>'
          )
      }
    }

    /**
     * Static field for degree centrality.
     * @return {number}
     */
    static get DEGREE_CENTRALITY() {
      return 0
    }

    /**
     * Static field for weight centrality.
     * @return {number}
     */
    static get WEIGHT_CENTRALITY() {
      return 1
    }

    /**
     * Static field for graph centrality.
     * @return {number}
     */
    static get GRAPH_CENTRALITY() {
      return 2
    }

    /**
     * Static field for node-edge-betweeness centrality.
     * @return {number}
     */
    static get NODE_EDGE_BETWEENESS_CENTRALITY() {
      return 3
    }

    /**
     * Static field for closeness centrality.
     * @return {number}
     */
    static get CLOSENESS_CENTRALITY() {
      return 4
    }
  }

  return CentralityConfig
})
