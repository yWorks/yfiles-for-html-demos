/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  BaseClass,
  CompositeLayoutData,
  DefaultTreeLayoutPortAssignment,
  DelegatingNodePlacer,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  GraphComponent,
  IComparer,
  IEnumerable,
  IGraph,
  INode,
  LayeredNodePlacer,
  LayeredRoutingStyle,
  LayoutExecutor,
  LayoutKeys,
  List,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Point,
  PortConstraint,
  PortConstraintKeys,
  PortSide,
  RotatableNodePlacerMatrix,
  SubgraphLayout,
  TreeLayout,
  TreeLayoutPortAssignmentMode,
  TreeReductionStage
} from 'yfiles'

import { Structure } from './MindmapUtil.js'

/**
 * This class contains methods that deal with the mindmap graph layout.
 */
export default class MindmapLayout {
  /**
   * Constructs the MindmapLayout.
   */
  constructor() {
    // initialize the layout
    this.gtl = new TreeLayout({
      // use port constraints
      defaultPortAssignment: new DefaultTreeLayoutPortAssignment(
        TreeLayoutPortAssignmentMode.PORT_CONSTRAINT
      )
    })
    this.gtl.prependStage(new PlaceNodesAtBarycenterStage())

    // create the node placers
    this.placerLeft = new LayeredNodePlacer(
      RotatableNodePlacerMatrix.ROT270,
      RotatableNodePlacerMatrix.ROT270
    )
    this.placerLeft.routingStyle = LayeredRoutingStyle.ORTHOGONAL
    this.placerLeft.verticalAlignment = 0
    this.placerLeft.spacing = 10
    this.placerLeft.layerSpacing = 45

    this.placerRight = new LayeredNodePlacer(
      RotatableNodePlacerMatrix.ROT90,
      RotatableNodePlacerMatrix.ROT90
    )
    this.placerRight.routingStyle = LayeredRoutingStyle.ORTHOGONAL
    this.placerRight.verticalAlignment = 0
    this.placerRight.spacing = 10
    this.placerRight.layerSpacing = 45

    this.placerRoot = new DelegatingNodePlacer(
      RotatableNodePlacerMatrix.DEFAULT,
      this.placerLeft,
      this.placerRight
    )

    this.$inLayout = false
  }

  /**
   * Gets a flag that tells whether a layout animation is currently in progress.
   * @return {boolean}
   */
  get inLayout() {
    return this.$inLayout
  }

  /**
   * Sets a flag that tells whether a layout animation is currently in progress.
   * @param {boolean} value The flag to be set.
   */
  set inLayout(value) {
    this.$inLayout = value
  }

  /**
   * Adds the mappers to the graph that are needed for the layout.
   * The mappers provide the layout algorithm with additional information that is needed
   * to achieve the desired layout.
   * @param {IGraph} graph The input graph.
   */
  addMappers(graph) {
    // tells the DelegatingNodePlacer which side a node is on
    graph.mapperRegistry.createDelegateMapper(
      DelegatingNodePlacer.PRIMARY_NODES_DP_KEY,
      Structure.isLeft
    )
    // tells the layout which node placer to use for a node
    graph.mapperRegistry.createDelegateMapper(TreeLayout.NODE_PLACER_DP_KEY, node => {
      if (Structure.isRoot(node)) {
        return this.placerRoot
      }
      if (Structure.isLeft(node)) {
        return this.placerLeft
      }
      return this.placerRight
    })
    // tells the layout which comparer to use for a node to sort the children
    graph.mapperRegistry.createDelegateMapper(TreeLayout.OUT_EDGE_COMPARER_DP_KEY, node => {
      if (Structure.isRoot(node)) {
        return new YCoordComparator()
      }
      if (Structure.isLeft(node)) {
        return this.placerLeft.createComparer()
      }
      return this.placerRight.createComparer()
    })

    // tells the layout which side to place a source port on
    graph.mapperRegistry.createDelegateMapper(
      PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY,
      edge =>
        PortConstraint.create(
          Structure.isLeft(edge.targetNode) ? PortSide.WEST : PortSide.EAST,
          true
        )
    )
    // tells the layout which side to place a target port on
    graph.mapperRegistry.createDelegateMapper(
      PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY,
      edge =>
        PortConstraint.create(
          Structure.isLeft(edge.targetNode) ? PortSide.EAST : PortSide.WEST,
          true
        )
    )

    // a layout stage that keeps a certain node in place during layout
    const fixNodeStage = new FixNodeLayoutStage()
    this.gtl.prependStage(fixNodeStage)

    // a layout stage that hides cross-reference edges from the layout
    graph.mapperRegistry.createDelegateMapper(
      TreeReductionStage.NON_TREE_EDGES_DP_KEY,
      Structure.isCrossReference
    )
    this.gtl.prependStage(new TreeReductionStage())
  }

  /**
   * Moves the source and target ports of the given edges to the bottom-left or
   * bottom-right corner of the node.
   * @param {IGraph} graph The input graph.
   * @param {IEnumerable} edges The list of edges for which the ports should be adjusted.
   */
  adjustPortLocations(graph, edges) {
    edges.forEach(edge => {
      if (!Structure.isCrossReference(edge)) {
        const s = edge.sourceNode
        const t = edge.targetNode
        const sbl = new Point(-s.layout.width * 0.5, s.layout.height * 0.5)
        const sbr = new Point(+s.layout.width * 0.5, s.layout.height * 0.5)
        const tbl = new Point(-t.layout.width * 0.5, t.layout.height * 0.5)
        const tbr = new Point(+t.layout.width * 0.5, t.layout.height * 0.5)

        if (!Structure.isRoot(s)) {
          graph.setRelativePortLocation(edge.sourcePort, Structure.isLeft(s) ? sbl : sbr)
        } else {
          // source is root node - set port to center
          graph.setRelativePortLocation(edge.sourcePort, Point.ORIGIN)
        }

        if (!Structure.isRoot(t)) {
          graph.setRelativePortLocation(edge.targetPort, Structure.isLeft(t) ? tbr : tbl)
        }
      }
    })
  }

  /**
   * Calculates a layout on a subtree that is specified by a given
   * root node.
   * @param {IGraph} graph The input graph.
   * @param {INode} subtreeRoot The root node of the subtree.
   */
  layoutSubtree(graph, subtreeRoot) {
    const nodes = new List()
    const edges = new List()
    Structure.getSubtree(graph, subtreeRoot, nodes, edges)

    // a mapper that determines the nodes to layout
    const subtreeSelectionMapper = graph.mapperRegistry.createMapper(
      LayoutKeys.AFFECTED_NODES_DP_KEY
    )

    // choose subtree nodes
    graph.nodes.forEach(n => {
      subtreeSelectionMapper.set(n, false)
    })
    nodes.forEach(node => {
      subtreeSelectionMapper.set(node, true)
    })

    // fix node layout stage - mark subtree root node as fixed
    const layoutData = new FixNodeLayoutData({
      fixedNodes: subtreeRoot
    })

    this.adjustPortLocations(graph, edges)
    graph.applyLayout(new SubgraphLayout(this.gtl), layoutData)

    // remove the mapper
    graph.mapperRegistry.removeMapper(LayoutKeys.AFFECTED_NODES_DP_KEY)
  }

  /**
   * Calculates an animated layout on the graph.
   * @param {GraphComponent} graphComponent The given graphComponent.
   * @param {List?} incrementalNodes
   * @param {boolean?} collapse
   * @return {Promise}
   */
  async layout(graphComponent, incrementalNodes, collapse) {
    // check a layout is currently in progress
    if (this.inLayout) {
      return Promise.resolve()
    }
    const graph = graphComponent.graph
    this.adjustPortLocations(graph, graph.edges)
    this.inLayout = true
    // disable the input mode so that no user interactions are allowed during layout
    const inputMode = graphComponent.inputMode
    inputMode.enabled = false

    const layoutData = new CompositeLayoutData(
      new FixNodeLayoutData({ fixedNodes: Structure.isRoot })
    )
    if (incrementalNodes && incrementalNodes.size > 0) {
      if (!collapse) {
        // move the incremental nodes to the barycenter of their neighbors before layout to get a
        // smooth layout animation
        this.prepareSmoothExpandLayoutAnimation(graph, incrementalNodes)
      } else {
        // mark the incremental nodes so they end up in the barycenter of their neighbors after
        // layout for a smooth layout animation
        layoutData.items.add(
          new PlaceNodesAtBarycenterStageData({
            affectedNodes: node => incrementalNodes.includes(node)
          })
        )
      }
    }

    // execute an animated layout
    const newLayoutExecutor = new LayoutExecutor({
      graphComponent,
      layout: this.gtl,
      layoutData,
      duration: '0.2s'
    })
    try {
      await newLayoutExecutor.start()
    } catch (error) {
      if (error.name === 'AlgorithmAbortedError') {
        alert(
          'The layout computation was canceled because the maximum configured runtime was exceeded.'
        )
      } else if (typeof window.reportError === 'function') {
        window.reportError(error)
      }
    } finally {
      this.inLayout = false
      inputMode.enabled = true
    }
  }

  /**
   * Moves incremental nodes between their neighbors before expanding for a smooth animation.
   */
  prepareSmoothExpandLayoutAnimation(graph, incrementalNodes) {
    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: node => incrementalNodes.includes(node)
    })
    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }

  static get instance() {
    // eslint-disable-next-line no-return-assign
    return MindmapLayout.$instance || (MindmapLayout.$instance = new MindmapLayout())
  }
}

/**
 * Sorts edges depending on the y-coordinates of their target nodes.
 * By default, edges are sorted from top to bottom. However, in case sides are taken into consideration, edges with
 * target nodes to the right are sorted bottom up and edges with target nodes to the left are sorted top down.
 * This is important when this comparator is used to determine the order of children for layout.
 */
class YCoordComparator extends BaseClass(IComparer) {
  /** @return {number} */
  compare(x, y) {
    const edge1 = x
    const edge2 = y
    const y1 = YCoordComparator.getY(edge1)
    const y2 = YCoordComparator.getY(edge2)

    if (YCoordComparator.isLeft(edge1.target)) {
      return y1 - y2
    }
    return y2 - y1
  }

  /**
   * @return {boolean}
   */
  static isLeft(n) {
    return n.graph.getDataProvider(DelegatingNodePlacer.PRIMARY_NODES_DP_KEY).getBoolean(n)
  }

  /**
   * @return {number}
   */
  static getY(e) {
    return e.graph.getY(e.target)
  }
}
