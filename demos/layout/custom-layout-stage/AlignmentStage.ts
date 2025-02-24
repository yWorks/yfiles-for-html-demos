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
  HierarchicalLayout,
  IGraph,
  LayoutEdge,
  LayoutGraph,
  LayoutStageBase,
  NodeDataKey
} from '@yfiles/yfiles'

/**
 * A layout stage that tries to align a specified set of nodes by using critical edge
 * priorities when the core layout is {@link HierarchicalLayout}.
 *
 * This sample shows how to define a custom {@link Mapper} which is used to define
 * data for this layout stage. In this case, the data is boolean and defines whether or
 * not a node is part of the alignment nodes set.
 *
 * Furthermore, it demonstrates how a graph can be pre-processed before the core layout and
 * post-processed (restored) afterwards. In the pre-processing step, dummy elements (in this
 * case edges) are inserted to realize the alignment and have to be marked as critical using
 * {@link HierarchicalLayoutData.criticalEdgePriorities}.
 * In the restoration step, the dummy elements are removed.
 *
 * This general approach (pre-processing, core layout, post-processing) can be used for many
 * scenarios where a custom layout stage is required.
 * Inserting temporary elements is an effective way to influence the layout result and customize
 * them to specific requirements. Keeping temporary elements only inside the layout graph and
 * using a custom stage has the huge advantages that no additional view graph ({@link IGraph})
 * elements must be created and that only a single layout run on the view graph is required,
 * thus, not affecting the layout animation.
 */
export default class AlignmentStage extends LayoutStageBase {
  /**
   * Key to register a {@link Mapper} with the input graph where the nodes that should
   * be aligned are marked.
   */
  static readonly ALIGNED_NODES_DATA_KEY: NodeDataKey<boolean> = new NodeDataKey(
    'AlignmentStage.ALIGNED_NODES_DATA_KEY'
  )

  protected applyLayoutImpl(graph: LayoutGraph): void {
    // Calculate an initial layout. This is needed so that the nodes to align
    // already have their proper vertical order as defined by the core layout.
    this.coreLayout?.applyLayout(graph)

    if (!(this.coreLayout instanceof HierarchicalLayout)) {
      // This stage is meant to be used with a hierarchical layout as its core layout algorithm
      // because it requires its critical path feature to realize the node alignment
      return
    }

    // Pre-processing: insert temporary alignment edges
    const alignmentEdges = this.insertAlignmentEdges(graph)

    // Use the layout data to mark the alignmentEdges edges as critical
    const layoutData = this.createLayoutData(graph, alignmentEdges)

    // Execute the hierarchical layout (core layout)
    graph.applyLayout(this.coreLayout, layoutData)

    // Post-processing: remove the temporary alignment edges
    this.restoreGraph(graph, alignmentEdges)
  }

  /**
   * Marks the edges that have to be aligned as critical using the layout data.
   */
  private createLayoutData(graph: LayoutGraph, alignmentEdges: LayoutEdge[]) {
    // Query the data map defining critical edge priorities and 'wrap' it.
    // This is an important step to allow the fact that critical edge priorities are defined
    // for edges other than the new alignment edges too.
    // Without considering the original data provider, the original data would be ignored/overwritten.
    const originalPriorities = graph.context.getItemData(
      HierarchicalLayout.CRITICAL_EDGE_PRIORITY_DATA_KEY
    )!

    const alignmentEdgesSet = new Set(alignmentEdges)
    const layoutData = (this.coreLayout as HierarchicalLayout).createLayoutData(graph)
    layoutData.criticalEdgePriorities = (edge) => {
      if (alignmentEdgesSet.has(edge)) {
        // An inserted edge gets a large criticality priority which means that it is important
        // that it should be straight,
        // yielding that the two adjacent nodes have to be aligned
        return 100
      }
      // For all other edges, we query the priority from the original provider
      return originalPriorities?.get(edge) ?? 0
    }
    return layoutData
  }

  /**
   * Prepares the graph by introducing temporary alignment edges between nodes marked as
   * alignment nodes in the data map registered with key {@link ALIGNED_NODES_DATA_KEY}.
   */
  private insertAlignmentEdges(graph: LayoutGraph): LayoutEdge[] {
    const dp = graph.context.getItemData(AlignmentStage.ALIGNED_NODES_DATA_KEY)
    if (dp === null) {
      // If no provider is registered, there is nothing to do
      return []
    }

    const orderedAlignmentNodes = graph.nodes
      // Handle nodes where the data map indicates that it is an alignment node
      .filter((node) => dp.get(node)!)
      // Order them by y-coordinates
      .toSorted((a, b) => a.layout.y - b.layout.y)
      .toArray()

    const alignedEdges: LayoutEdge[] = []
    for (let i = 1; i < orderedAlignmentNodes.length; i++) {
      // Insert an edge between two consecutive alignment nodes. Since we performed the core
      // layout initially already, we can assume that in the alignment nodes have y-coordinates that
      // are consistent with the layering the hierarchical layout (core layout) will produce.
      const edge = graph.createEdge(orderedAlignmentNodes[i - 1], orderedAlignmentNodes[i])
      // Remember the inserted edges because later we need to remove them
      alignedEdges.push(edge)
    }
    return alignedEdges
  }

  /**
   * Restores the graph by removing the temporarily inserted alignment edges.
   */
  private restoreGraph(graph: LayoutGraph, alignmentEdges: LayoutEdge[]) {
    if (!alignmentEdges) {
      // Nothing to do
      return
    }

    // Remove temporary edges
    for (const alignmentEdge of alignmentEdges) {
      graph.remove(alignmentEdge)
    }
  }
}
