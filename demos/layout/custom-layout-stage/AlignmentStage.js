/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DataProviderBase,
  Edge,
  HierarchicLayout,
  IDataProvider,
  IGraph,
  ILayoutAlgorithm,
  LayoutGraph,
  LayoutStageBase
} from 'yfiles'

/**
 * A layout stage that tries to align a specified set of nodes by using critical edge
 * priorities when the core layout is {@link HierarchicLayout}.
 *
 * This sample shows how to define a custom {@link IDataProvider} key which is used to define
 * data for this layout stage. In this case, the data is boolean and defines whether or
 * not a node is part of the alignment nodes set.
 *
 * Furthermore, it demonstrates how a graph can be pre-processed before the core layout and
 * post-processed (restored) afterwards. In the pre-processing step, dummy elements (in this
 * case edges) are inserted and the data registered at key
 * {@link HierarchicLayout.CRITICAL_EDGE_PRIORITY_DP_KEY} must be wrapped to realize the alignment.
 * In the restoration step, the dummy elements are removed and the data is restored accordingly.
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
   *
     * Key to register an {@link IDataProvider} with the input graph where the nodes that should
     * be aligned are marked.
     
  * @type {string}
   */
  static get ALIGNED_NODES_DP_KEY() {
    if (typeof AlignmentStage.$ALIGNED_NODES_DP_KEY === 'undefined') {
      AlignmentStage.$ALIGNED_NODES_DP_KEY = 'AlignmentStage.ALIGNED_NODES_DP_KEY'
    }

    return AlignmentStage.$ALIGNED_NODES_DP_KEY
  }

  /**
   * Backup of the {@link IDataProvider} that was registered at the input graph before
   * registering our own priorities.
   */
  originalPriorities = null

  /**
   * Stores the temporary edges this stage inserts before running the core layout algorithm.
   */
  alignmentEdges = null

  /**
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    // Calculate an initial layout. This is needed so that the nodes to align
    // already have their proper vertical order as defined by the core layout.
    this.applyLayoutCore(graph)

    if (!(this.coreLayout instanceof HierarchicLayout)) {
      // This stage is meant to be used with a hierarchic layout as its core layout algorithm
      // because it requires its critical path feature to realize the node alignment
      return
    }

    // Pre-processing: insert temporary alignment edges and define critical edge priorities
    this.insertAlignmentEdges(graph)

    // Execute the hierarchic layout (core layout)
    super.applyLayoutCore(graph)

    // Post-processing: remove the temporary alignment edges and restore critical edge priority data
    this.restoreGraph(graph)
  }

  /**
   * Prepares the graph by introducing temporary alignment edges between nodes marked as
   * alignment nodes in the data provider registered with key {@link ALIGNED_NODES_DP_KEY}.
   * @param {!LayoutGraph} graph
   */
  insertAlignmentEdges(graph) {
    const dp = graph.getDataProvider(AlignmentStage.ALIGNED_NODES_DP_KEY)
    if (dp === null) {
      // If no provider is registered, there is nothing to do
      return
    }

    const orderedAlignmentNodes = graph.nodes
      // Handle nodes where the data provider indicates that it is an alignment node
      .filter((node) => dp.getBoolean(node))
      // Order them by y-coordinates
      .orderBy(
        (node) => graph.getY(node),
        (a, b) => a - b
      )
      .toArray()

    this.alignmentEdges = []
    const alignmentEdgesSet = new Set()
    for (let i = 1; i < orderedAlignmentNodes.length; i++) {
      // Insert an edge between two consecutive alignment nodes. Since we performed the core
      // layout initially already, we can assume that in the alignment nodes have y-coordinates that
      // are consistent with the layering the hierarchical layout (core layout) will produce.
      const edge = graph.createEdge(orderedAlignmentNodes[i - 1], orderedAlignmentNodes[i])
      // Remember the inserted edges because later we need to remove them
      this.alignmentEdges.push(edge)
      alignmentEdgesSet.add(edge)
    }

    // Query the data provider defining critical edge priorities and 'wrap' it.
    // This is an important step to allow the fact that critical edge priorities are defined
    // for edges other than the new alignment edges too. Without considering the original provider
    // the original data would be ignored/overwritten.
    const originalPriorities = graph.getDataProvider(HierarchicLayout.CRITICAL_EDGE_PRIORITY_DP_KEY)
    graph.addDataProvider(
      HierarchicLayout.CRITICAL_EDGE_PRIORITY_DP_KEY,
      new (class extends DataProviderBase {
        /**
         * @param {!Edge} dataHolder
         * @returns {number}
         */
        getInt(dataHolder) {
          if (alignmentEdgesSet.has(dataHolder)) {
            // An inserted edge gets a large criticality priority which means that it is important
            // that it should be straight, thus, yielding that the two nodes it connects are aligned
            return 100
          }

          // For all other edges we query the priority from the original provider
          return originalPriorities?.getInt(dataHolder) || 0
        }
      })()
    )
    this.originalPriorities = originalPriorities
  }

  /**
   * Restores the graph by removing the temporarily inserted alignment edges.
   * @param {!LayoutGraph} graph
   */
  restoreGraph(graph) {
    if (!this.alignmentEdges) {
      // Nothing to do
      return
    }

    // Remove temporary edges
    for (const alignmentEdge of this.alignmentEdges) {
      graph.removeEdge(alignmentEdge)
    }

    // Restore the original critical edge priority data provider
    if (this.originalPriorities !== null) {
      graph.addDataProvider(HierarchicLayout.CRITICAL_EDGE_PRIORITY_DP_KEY, this.originalPriorities)
    } else {
      // There was none originally: remove the provider registering by this stage
      graph.removeDataProvider(HierarchicLayout.CRITICAL_EDGE_PRIORITY_DP_KEY)
    }
  }
}
