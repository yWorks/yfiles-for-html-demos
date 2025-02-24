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
import { type IGraph, SpanningTree } from '@yfiles/yfiles'
import type { AlgorithmConfig } from './algorithms'
import { markItem } from './algorithms'

/**
 * Description of the algorithm which determines the minimum spanning tree of a graph.
 */ export const minimumSpanningTreeDescription = `
  <p style='margin-top:0'>Finding the <em>minimum spanning tree</em> in a graph is part of analyzing graph structures.</p>
  <p>Which edges are included in the minimum spanning tree can be influenced with costs. Edges with lower costs are more likely kept in the tree. </p>
  <p>Costs can be specified using <em>edge labels</em>. The cost of edges without labels is their <em>edge length</em>. When the algorithm should use
  <em>Uniform costs</em> all edges are treated the same. For the sake of simplicity, in this demo we allow only positive edge-costs.</p>`

/**
 * Calculates the minimum spanning tree for the given graph.
 */
export function calculateMinimumSpanningTree(graph: IGraph, config: AlgorithmConfig): void {
  if (graph.nodes.size === 0 || graph.edges.size === 0) {
    return
  }

  // calculate the edges of a minimum spanning tree
  const result = new SpanningTree({ costs: config.edgeWeights }).run(graph)

  // mark those edges
  result.edges.forEach((edge) => {
    markItem(edge)
  })

  graph.nodes.forEach((node) => {
    markItem(node)
  })
}
