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
import {
  type GraphComponent,
  type GraphEditorInputMode,
  type IEdge,
  type INode,
  Reachability,
  ShortestPath
} from '@yfiles/yfiles'

/**
 * Demonstrates how to quickly configure and run the Reachability algorithm
 */
export function runReachabilityAlgorithm(graphComponent: GraphComponent): void {
  const nodes = graphComponent.graph.nodes.filter(
    (node) => !graphComponent.graph.isGroupNode(node)
  )
  if (nodes.size === 0) {
    return
  }
  // first reset the highlights
  graphComponent.highlights.clear()

  if (graphComponent.selection.nodes.size === 0) {
    graphComponent.selection.clear()
    graphComponent.selection.add(nodes.first()!)
  }

  // create, configure and run the algorithm in a single step
  // use the selected nodes as start nodes
  const startNodes = graphComponent.selection.nodes

  const reachability = new Reachability({
    startNodes: startNodes,
    directed: true // consider edge direction
  })
  const reachabilityResult = reachability.run(graphComponent.graph)

  // highlight the reachable nodes
  reachabilityResult.reachableNodes.forEach((n: INode): void => {
    graphComponent.highlights.add(n)
  })
}

/**
 * Demonstrates how to configure and run the ShortestPath algorithm.
 */
export async function runShortestPathAlgorithm(
  graphComponent: GraphComponent
): Promise<void> {
  // first reset the highlights
  graphComponent.highlights.clear()

  const graph = graphComponent.graph

  const nodes = graph.nodes.filter((node) => !graph.isGroupNode(node))
  if (nodes.size < 2) {
    return
  }

  // select source and sink node for the path-finding algorithm
  // use the first two selected nodes if possible
  const graphSelection = graphComponent.selection
  const nodeSelection = graphSelection.nodes
  const sourceNode =
    nodeSelection.size > 0 ? nodeSelection.at(0)! : nodes.first()!
  const sinkNode = nodeSelection.size > 1 ? nodeSelection.at(1)! : nodes.last()!
  graphSelection.clear()
  nodeSelection.add(sourceNode)
  nodeSelection.add(sinkNode)

  const shortestPath = new ShortestPath({
    source: sourceNode,
    sink: sinkNode,
    directed: false, // don't consider the edge direction
    // calculate the cost per edge as the distance between source and target node
    costs: (edge: IEdge): number =>
      edge.sourceNode.layout.center.subtract(edge.targetNode.layout.center)
        .vectorLength
  })
  const shortestPathResult = shortestPath.run(graph)

  const pathDistance = shortestPathResult.distance
  const pathNodes = shortestPathResult.path?.nodes ?? []
  const endNode = shortestPathResult.path?.end
  const pathEdges = shortestPathResult.edges

  if (!Number.isFinite(pathDistance)) {
    return
  }
  pathNodes.forEach((node: INode): void => {
    graphComponent.highlights.add(node)
  })
  graph.edges
    .filter((edge: IEdge): boolean => pathEdges.contains(edge))
    // and we select all matching edges
    .forEach((edge) => graphComponent.highlights.add(edge))

  // finally, we use the explicit "path.end" field to show the distance as a tooltip above
  // the sink node
  if (endNode) {
    const graphEditorInputMode =
      graphComponent.inputMode as GraphEditorInputMode
    await graphEditorInputMode.toolTipInputMode.show(
      endNode.layout.center,
      `Distance: ${pathDistance}`
    )
  }
}
