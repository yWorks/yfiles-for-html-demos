/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
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
import { IGraph, IModelItem, SpanningTree } from 'yfiles'
import { AlgorithmConfiguration } from './AlgorithmConfiguration.js'
import { MultiColorNodeStyle } from './DemoStyles.js'

/**
 * Configuration options for the Minimum Spanning Tree Algorithm.
 */
export class MinimumSpanningTreeConfig extends AlgorithmConfiguration {
  /**
   * Creates and configures a layout and the graph's {@link IGraph.mapperRegistry} if necessary.
   * @param {!IGraph} graph The graph on which the minimum spanning tree algorithm is executed.
   */
  runAlgorithm(graph) {
    this.calculateSpanningTree(graph)
  }

  /**
   * Calculates the minimum spanning tree of the given graph.
   * @param {!IGraph} graph The graph on which the minimum spanning tree algorithm is executed.
   */
  calculateSpanningTree(graph) {
    if (graph.nodes.size === 0 || graph.edges.size === 0) {
      return
    }
    // reset edge styles
    graph.edges.forEach((edge, index) => {
      graph.setStyle(edge, graph.edgeDefaults.style)
      if (!edge.tag) {
        edge.tag = {}
      }
      edge.tag.id = index
    })
    // calculate the edges of a minimum spanning tree
    const result = new SpanningTree({ costs: edge => this.getEdgeWeight(edge) }).run(graph)

    graph.nodes.forEach((node, index) => {
      if (!node.tag) {
        node.tag = {}
      }
      node.tag.id = index
    })

    const mst = [[]]
    // mark those edges with the color style
    result.edges.forEach(edge => {
      if (graph.contains(edge)) {
        graph.setStyle(edge, this.getMarkedEdgeStyle(false, 0))
        const source = edge.sourceNode
        const target = edge.targetNode

        graph.setStyle(source, new MultiColorNodeStyle())
        graph.setStyle(target, new MultiColorNodeStyle())

        mst[0].push(edge)
        mst[0].push(source)
        mst[0].push(target)

        edge.tag = {
          id: edge.tag.id,
          color: null,
          components: mst,
          edgeComponent: 0
        }
        source.tag = {
          id: source.tag.id,
          color: null,
          components: mst,
          nodeComponents: [0]
        }
        target.tag = {
          id: target.tag.id,
          color: null,
          components: mst,
          nodeComponents: [0]
        }
      }
    })
  }

  /**
   * Returns the description text for the minimum spanning tree algorithm.
   * @returns the description text for the minimum spanning tree algorithm
   * @type {!string}
   */
  get descriptionText() {
    return (
      "<p style='margin-top:0'>Finding the <em>minimum spanning tree</em> in a graph is part of analysing graph structures.</p>" +
      '<p>Which edges are included in the minimum spanning tree can be influenced with costs. Edges with lower costs are more likely kept in the tree. </p>' +
      '<p>Costs can be specified using <em>edge labels</em>. The cost of edges without labels is their <em>edge length</em>. When the algorithm should use ' +
      '<em>Uniform costs</em> all edges are treated the same. For the sake of simplicity, in this demo we allow only positive edge costs.</p>'
    )
  }
}
