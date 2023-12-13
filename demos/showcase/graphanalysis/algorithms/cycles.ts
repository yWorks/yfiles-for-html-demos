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
import { ConnectedComponents, CycleEdges, type IGraph } from 'yfiles'
import { type AlgorithmConfig, markItem } from './algorithms'

/**
 * Description of the algorithm which determines all cycle edges in the graph.
 */
export const cyclesDescription = `
  <p style='margin-top:0'>Finding <em>cycles in a graph</em> is part of analyzing graph structures.
  This part of the demo shows an algorithm that finds edges that belong to a cycle in a graph.</p>
  <p>Independent cycles are presented with different colors. Cycles which share common nodes and
  edges get the same color. This algorithm is able to take the <em>direction of edges</em> into account.</p>`

/**
 * Calculates the cycle edges in the given graph.
 */
export function calculateCycles(graph: IGraph, config: AlgorithmConfig): void {
  // find all edges that belong to a cycle
  const result = new CycleEdges({ directed: config.directed }).run(graph)
  const cycleEdges = result.edges

  if (cycleEdges.size === 0) {
    return
  }

  // find the edges that belong to the same component within the subgraph
  // consisting only of elements that belong a cycle
  const connectedComponentsResult = new ConnectedComponents({
    subgraphEdges: cycleEdges,
    subgraphNodes: (node) => graph.edgesAt(node).some((edge) => cycleEdges.includes(edge))
  }).run(graph)

  // color the cycle edges depending on which component they belong to
  connectedComponentsResult.components.forEach((cycle, cycleId) => {
    cycle.nodes.forEach((node) => markItem(node, cycleId))
    cycle.inducedEdges.forEach((edge) => markItem(edge, cycleId))
  })
}
