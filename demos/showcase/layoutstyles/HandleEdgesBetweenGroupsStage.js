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
  ContextModificationStage,
  GenericLabeling,
  ILayoutAlgorithm,
  LayoutEdge,
  LayoutGraph,
  LayoutGraphGrouping,
  LayoutGraphHider,
  LayoutKeys,
  LayoutStageBase,
  Mapper,
  TreeReductionStage
} from '@yfiles/yfiles'
/**
 * This stage temporarily removes edges that are incident to group nodes.
 *
 * The stage must be prepended to the layout algorithm and applies the following three steps:
 *
 *   - Removes edges from the graph that are incident to group nodes.
 *   - Invokes the core layout algorithm on the reduced graph.
 *   - Re-inserts all previously removed edges and optionally places their labels.
 *
 * This stage can be useful for layout algorithms or stages that cannot handle edges between group nodes, e.g.,
 * {@link TreeReductionStage}. Optionally, {@link HandleEdgesBetweenGroupsStage} can also place the labels of
 * the edges that were temporarily removed right after they are restored back to the graph.
 *
 * The routing of the temporarily hidden edges can be customized by specifying an
 * {@link markedEdgeRouter edge routing algorithm} for those edges.
 */
export default class HandleEdgesBetweenGroupsStage extends LayoutStageBase {
  considerEdgeLabels
  markedEdgeRouter
  /**
   * Creates an instance of HandleEdgesBetweenGroupsStage.
   * @param considerEdgeLabels whether or not the stage should place the labels of the edges that
   * have been temporarily hidden, when these edges will be restored back.
   * @param markedEdgeRouter the edge routing algorithm that is applied to the set of marked edges
   */
  constructor(considerEdgeLabels, markedEdgeRouter = null) {
    super()
    this.considerEdgeLabels = considerEdgeLabels
    this.markedEdgeRouter = markedEdgeRouter
  }
  /**
   * Removes all edges that are incident to group nodes and passes it to the core layout algorithm.
   * This stage removes some edges from the graph such that no edges incident to group nodes
   * exist. Then, it applies the core layout algorithm to the reduced graph.
   * After it produces the result, it re-inserts the previously removed edges and routes them.
   */
  applyLayoutImpl(graph) {
    if (!this.coreLayout) {
      return
    }
    const groupingSupport = LayoutGraphGrouping.createReadOnlyView(graph)
    if (!LayoutGraphGrouping.isGrouped(graph)) {
      this.coreLayout.applyLayout(graph)
    } else {
      const hiddenEdgesMap = new Mapper()
      const edgeHider = new LayoutGraphHider(graph)
      let existHiddenEdges = false
      for (const edge of graph.edges) {
        if (groupingSupport.isGroupNode(edge.source) || groupingSupport.isGroupNode(edge.target)) {
          hiddenEdgesMap.set(edge, true)
          edgeHider.hide(edge)
          existHiddenEdges = true
        } else {
          hiddenEdgesMap.set(edge, false)
        }
      }
      this.coreLayout.applyLayout(graph)
      if (existHiddenEdges) {
        edgeHider.unhideAll()
        // routes the marked edges
        this.routeMarkedEdges(graph, hiddenEdgesMap)
        if (this.considerEdgeLabels) {
          // place marked labels
          const labeling = new GenericLabeling({
            scope: 'edge-labels'
          })
          const labelingData = labeling.createLayoutData(graph)
          // all labels of hidden edges should be marked
          labelingData.scope.edgeLabels = (edgeLabel) =>
            edgeLabel.owner instanceof LayoutEdge && !!hiddenEdgesMap.get(edgeLabel.owner)
          graph.applyLayout(labeling, labelingData)
        }
      }
    }
  }
  /**
   * Routes all edges that are temporarily hidden by this stage.
   *
   * This method is called by applyLayout(graph) after the reduced graph was arranged by the
   * core layout algorithm. It may be overridden to apply custom edge routes.
   *
   * Note that, this method will do nothing if no edge routing algorithm was specified (i.e., if
   * it is `null`).
   *
   * @param graph the graph that contains the hidden edges
   * @param markedEdgesMap a map that returns `true` for all hidden by the stage edges of
   *        the graph
   */
  routeMarkedEdges(graph, markedEdgesMap) {
    if (this.markedEdgeRouter === null) {
      return
    }
    //temporarily add the selected edges to the layout context
    const contextStage = new ContextModificationStage(this.markedEdgeRouter)
    contextStage.addReplacementMap(LayoutKeys.ROUTE_EDGES_DATA_KEY, markedEdgesMap)
    contextStage.applyLayout(graph)
  }
}
