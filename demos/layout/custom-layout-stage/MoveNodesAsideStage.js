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
  EdgeRouter,
  INode,
  LayoutGraph,
  LayoutGraphAdapter,
  LayoutGraphHider,
  LayoutGraphUtilities,
  LayoutStageBase,
  Maps,
  YNode
} from 'yfiles'

const NODE_DISTANCE = 15

/**
 * A layout stage that excludes nodes with a special tag
 * (<code>{ moveAside: boolean }</code>) from the core layout
 * and instead moves those nodes to the side of the resulting layout.
 *
 * This sample demonstrates how to use properties of the original graph to do
 * something in the layout (which has a different graph model).
 *
 * It also demonstrates how a layout stage works in general that performs its core
 * layout only on a part of the original graph. This often also requires that the
 * excluded items have to be placed some other way, and also that adjacent edges may
 * have to be re-routed to get a consistent result in the end.
 *
 * A similar approach is used by layout stages like TreeReductionStage (which
 * temporarily removes non-tree edges), HideGroupNodesStage (which pretends that
 * no group nodes exist), SubgraphLayoutStage, and others.
 */
export default class MoveNodesAsideStage extends LayoutStageBase {
  /**
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    // The simplest way to hide items in the graph temporarily is the LayoutGraphHider,
    // which also remembers the hidden items and can re-show them later.
    const hider = new LayoutGraphHider(graph)
    // To get access to the original node we can use LayoutGraphAdapter's
    // ORIGINAL_NODE_DP_KEY. This will only work if the layout is performed on an IGraph
    // instance, typically via LayoutExecutor. However, in most usages of yFiles this is
    // the case. Alternative approaches to get custom data into the layout exist, and are
    // shown in the other layout stages. In this specific case where only the node's tag
    // is required, it would also be sufficient to use the LayoutGraphAdapter.ORIGINAL_TAG_DP_KEY.
    // The provider registered with it yields the tag of the original INode given a layout graph node.
    const originalNodeDp = graph.getDataProvider(LayoutGraphAdapter.ORIGINAL_NODE_DP_KEY)

    const asideNodes = []

    for (const node of graph.nodes) {
      // For each node, get the original node and see whether the tag specifies that it
      // should be handled specially.
      const iNode = originalNodeDp?.get(node)
      if (iNode?.tag?.moveAside) {
        // If so, hide the node for now ...
        hider.hide(node)
        // ... and remember it for later use
        asideNodes.push(node)
      }
    }

    // Then, run the core layout, which calculates a layout for the remaining graph.
    super.applyLayoutCore(graph)

    // What's left now is to place the nodes we've hidden earlier.
    // Since we've hidden them from the core layout, they remain at their
    // original location for now.

    // We need the bounding box of the graph without the nodes, to place
    // them correctly.
    const boundingBox = LayoutGraphUtilities.getBoundingBox(
      graph,
      graph.getNodeCursor(),
      graph.getEdgeCursor()
    )

    // Then we show everything again. We've collected the originally-hidden
    // nodes and edges above, already. We also have to make sure in general
    // that the graph doesn't change its structure during layout. So we always
    // have to undo everything we do to the graph structure.
    hider.unhideAll()

    // In this case we want to place all of the “aside” nodes in a single column
    // to the right of the rest of the graph. Let's first figure out how tall that
    // column is so we can immediately place them in the correct place.
    let nodeStackHeight = 0
    for (const node of asideNodes) {
      nodeStackHeight += graph.getHeight(node)
    }
    // Also account for the distance between the nodes
    nodeStackHeight += NODE_DISTANCE * (asideNodes.length - 1)

    // Now we can place the nodes.
    const x = boundingBox.maxX + NODE_DISTANCE
    let y = boundingBox.centerY - nodeStackHeight / 2
    for (const node of asideNodes) {
      graph.setLocation(node, x, y)
      y += graph.getLayout(node).height + NODE_DISTANCE
    }

    // Now we still have to deal with the edges that may have been connected to
    // the nodes we've moved aside. Those still have their original path from
    // before the layout because they've been hidden as well.

    // In this case we simply apply an EdgeRouter to calculate suitable routes
    // to the nodes that we moved aside.
    const edgeRouter = new EdgeRouter({
      scope: 'route-edges-at-affected-nodes'
    })
    // We also have to tell the EdgeRouter which edges to route (in this case,
    // edges at affected nodes, so we tell it the affected nodes)
    const affectedNodesDp = Maps.createHashedNodeMap()
    asideNodes.forEach(node => affectedNodesDp.setBoolean(node, true))
    graph.addDataProvider(edgeRouter.affectedNodesDpKey, affectedNodesDp)

    // Finally, EdgeRouter can calculate routes for the remaining edges.
    edgeRouter.applyLayout(graph)

    graph.removeDataProvider(edgeRouter.affectedNodesDpKey)
  }
}
