/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-component', './AlgorithmConfiguration.js', './DemoStyles.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  AlgorithmConfiguration,
  demoStyles
) => {
  /**
   * Configuration options for the Minimum Spanning Tree Algorithm.
   */
  class MinimumSpanningTreeConfig extends AlgorithmConfiguration {
    /**
     * Creates and configures a layout and the graph's {@link yfiles.graph.IGraph#mapperRegistry} if necessary.
     * @param {yfiles.graph.IGraph} graph The graph on which the minimum spanning tree algorithm is executed.
     */
    runAlgorithm(graph) {
      this.calculateSpanningTree(graph)
    }

    /**
     * Calculates the minimum spanning tree of the given graph.
     * @param {yfiles.graph.IGraph} graph The graph on which the minimum spanning tree algorithm is executed.
     */
    calculateSpanningTree(graph) {
      // reset edge styles
      graph.edges.forEach(edge => {
        graph.setStyle(edge, graph.edgeDefaults.style)
      })

      const adapter = new yfiles.layout.YGraphAdapter(graph)

      // the data provider for edge costs delegates to 'getEdgeWeight'
      const edgeWeightProvider = adapter.createDataProvider(
        yfiles.graph.IEdge.$class,
        yfiles.lang.Number.$class,
        this.getEdgeWeight.bind(this)
      )

      // calculate the edges of a minimum spanning tree
      const edgeList = yfiles.algorithms.SpanningTrees.minimum(adapter.yGraph, edgeWeightProvider)

      const mst = [[]]

      // mark those edges with the color style
      adapter.createEdgeEnumerable(edgeList).forEach(edge => {
        if (graph.contains(edge)) {
          graph.setStyle(edge, this.getMarkedEdgeStyle(false, 0, null))
          const source = edge.sourceNode
          const target = edge.targetNode

          graph.setStyle(source, new demoStyles.MultiColorNodeStyle())
          graph.setStyle(target, new demoStyles.MultiColorNodeStyle())

          mst[0].push(edge)
          mst[0].push(source)
          mst[0].push(target)

          edge.tag = {
            id: adapter.getCopiedEdge(edge).index,
            color: null,
            components: mst,
            edgeComponent: 0
          }
          source.tag = {
            id: adapter.getCopiedNode(source).index,
            color: null,
            components: mst,
            nodeComponents: [0]
          }
          target.tag = {
            id: adapter.getCopiedNode(target).index,
            color: null,
            components: mst,
            nodeComponents: [0]
          }
        }
      })
    }

    /**
     * Returns the description text for the minimum spanning tree algorithm.
     * @returns {string} the description text for the minimum spanning tree algorithm
     */
    get descriptionText() {
      return (
        "<p style='margin-top:0'>Finding <em>minimum spanning trees</em> in a graph is part of analysing graph structures.</p>" +
        '<p>Which edges are included in the minimum spanning tree can be influenced with costs. Edges with lower costs are more likely kept in the tree. ' +
        'Costs can be specified using <em>edge labels</em>. The cost of edges without labels is their <em>edge length</em>. When the algorithm should use ' +
        '<em>Uniform costs</em> all edges are treated the same.</p>'
      )
    }
  }

  return MinimumSpanningTreeConfig
})
