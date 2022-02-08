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
  EdgeRouterScope,
  GenericLabeling,
  IDataProvider,
  IEdgeMap,
  ILayoutAlgorithm,
  LayoutGraph,
  LayoutGraphHider,
  LayoutGroupingSupport,
  LayoutStageBase,
  Maps,
  StraightLineEdgeRouter,
  TreeReductionStage
} from 'yfiles'

/**
 * This stage temporarily removes edges that are incident to group nodes.
 *
 * The stage must be prepended to the layout algorithm and applies the following three steps:
 * <ul>
 *   <li>Removes edges from the graph that are incident to group nodes.</li>
 *   <li>Invokes the core layout algorithm on the reduced graph.</li>
 *   <li>Re-inserts all previously removed edges and optionally places their labels.</li>
 * </ul>
 *
 * This stage can be useful for layout algorithms or stages that cannot handle edges between group nodes, e.g.,
 * {@link TreeReductionStage}. Optionally, {@link HandleEdgesBetweenGroupsStage} can also place the labels of
 * the edges that were temporarily removed right after they are restored back to the graph.
 *
 * The routing of the temporarily hidden edges can be customized by specifying an
 * {@link #markedEdgeRouter edge routing algorithm} for those edges.
 */
export default class HandleEdgesBetweenGroupsStage extends LayoutStageBase {
  /**
   * @param {boolean} placeLabels
   */
  constructor(placeLabels) {
    super()
    this.$considerEdgeLabels = placeLabels
    this.$edgeSelectionKey = new StraightLineEdgeRouter().affectedEdgesDpKey
    this.$markedEdgeRouter = null
  }

  /**
   * Specifies the key to register a data provider that will be used by the
   * edge routing algorithm to determine the edges that need to be routed.
   * @type {*}
   */
  get edgeSelectionKey() {
    return this.$edgeSelectionKey
  }

  /**
   * @type {*}
   */
  set edgeSelectionKey(value) {
    this.$edgeSelectionKey = value
  }

  /**
   * Specifies the edge routing algorithm that is applied to the set of marked edges.
   *
   * Note that it is required that a suitable edge selection key is specified and the router's scope is
   * reduced to the affected edges.
   * @type {?ILayoutAlgorithm}
   */
  get markedEdgeRouter() {
    return this.$markedEdgeRouter
  }

  /**
   * @type {?ILayoutAlgorithm}
   */
  set markedEdgeRouter(value) {
    this.$markedEdgeRouter = value
  }

  /**
   * Specifies whether or not the stage should place the labels of the edges that
   * have been temporarily hidden, when these edges will be restored back.
   * @type {boolean}
   */
  get considerEdgeLabels() {
    return this.$considerEdgeLabels
  }

  /**
   * @type {boolean}
   */
  set considerEdgeLabels(value) {
    this.$considerEdgeLabels = value
  }

  /**
   * Removes all edges that are incident to group nodes and passes it to the core layout algorithm.
   * This stage removes some edges from the graph such that no edges incident to group nodes
   * exist. Then, it applies the core layout algorithm to the reduced graph.
   * After it produces the result, it re-inserts the previously removed edges and routes them.
   * @param {!LayoutGraph} graph
   */
  applyLayout(graph) {
    const groupingSupport = new LayoutGroupingSupport(graph)

    if (!LayoutGroupingSupport.isGrouped(graph)) {
      this.applyLayoutCore(graph)
    } else {
      const hiddenEdgesMap = Maps.createHashedEdgeMap()

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

      this.applyLayoutCore(graph)

      if (existHiddenEdges) {
        edgeHider.unhideAll()

        // routes the marked edges
        this.routeMarkedEdges(graph, hiddenEdgesMap)

        if (this.considerEdgeLabels) {
          // all labels of hidden edges should be marked
          const affectedLabelsDpKey = 'affectedLabelsDpKey'
          const nonTreeLabelsMap = Maps.createHashedDataMap()

          for (const edge of graph.edges) {
            const ell = graph.getLabelLayout(edge)
            for (const labelLayout of ell) {
              nonTreeLabelsMap.set(labelLayout, hiddenEdgesMap.get(edge))
            }
          }

          // add selection marker
          graph.addDataProvider(affectedLabelsDpKey, nonTreeLabelsMap)

          // place marked labels
          const labeling = new GenericLabeling()
          labeling.placeNodeLabels = false
          labeling.placeEdgeLabels = true
          labeling.affectedLabelsDpKey = affectedLabelsDpKey
          labeling.applyLayout(graph)

          // dispose selection key
          graph.removeDataProvider(affectedLabelsDpKey)
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
   * it is <code>null</code>).
   *
   * @param {!LayoutGraph} graph the graph that contains the hidden edges
   * @param {!IEdgeMap} markedEdgesMap a map that returns <code>true</code> for all hidden by the stage edges of
   *        the graph
   */
  routeMarkedEdges(graph, markedEdgesMap) {
    const router = this.markedEdgeRouter
    if (router === null) {
      return
    }

    let backupDP = null
    if (this.edgeSelectionKey) {
      backupDP = graph.getDataProvider(this.edgeSelectionKey)
      graph.addDataProvider(this.edgeSelectionKey, markedEdgesMap)
    }
    if (router instanceof StraightLineEdgeRouter) {
      router.scope = EdgeRouterScope.ROUTE_AFFECTED_EDGES
      router.affectedEdgesDpKey = this.edgeSelectionKey
    }

    router.applyLayout(graph)

    if (this.edgeSelectionKey) {
      graph.removeDataProvider(this.edgeSelectionKey)

      if (backupDP != null) {
        graph.addDataProvider(this.edgeSelectionKey, backupDP)
      }
    }
  }
}
