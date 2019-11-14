/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
'use strict'

/* eslint-disable no-continue */
/* eslint-disable no-lonely-if */

define([
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'yfiles/router-polyline'
], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * A layout stage that adjusts the source and target ports at non-regular shaped nodes
   * so that the edges end inside the node.
   * Only activity nodes are considered to have regular shapes.
   * @implements {yfiles.layout.ILayoutAlgorithm}
   */
  class PortLocationAdjuster extends yfiles.lang.Class(yfiles.layout.ILayoutAlgorithm) {
    /**
     * Main layout routine that assigns new layout information to the given graph.
     * @param {yfiles.layout.LayoutGraph} graph the input graph.
     * @see Specified by {@link yfiles.layout.ILayoutAlgorithm#applyLayout}.
     */
    applyLayout(graph) {
      const affectedNodesDP = graph.getDataProvider(PortLocationAdjuster.AFFECTED_NODES_DP_KEY)

      for (let ec = graph.getEdgeCursor(); ec.ok; ec.next()) {
        const e = ec.edge
        const path = graph.getPath(e)
        // adjust source point
        if (affectedNodesDP === null || affectedNodesDP.getBoolean(e.source)) {
          adjustPortLocation(graph, e, path, true)
        }
        if (affectedNodesDP === null || affectedNodesDP.getBoolean(e.target)) {
          adjustPortLocation(graph, e, path, false)
        }
      }
    }

    /**
     * Data provider key used to store if the ports on a node should be adjusted.
     * @type {Object}
     */
    static get AFFECTED_NODES_DP_KEY() {
      return 'com.yworks.yfiles.bpmn.layout.PortLocationAdjuster.AffectedNodesDpKey'
    }
  }

  /**
   * Adjusts the edge end points so they don't end outside the shape of the node they are attached to.
   */
  function adjustPortLocation(graph, e, path, atSource) {
    const node = atSource ? e.source : e.target
    const pointRel = atSource ? graph.getSourcePointRel(e) : graph.getTargetPointRel(e)
    // get offset from the node center to the end of the shape at the node side the edge connects to
    const segment = path.getLineSegment(atSource ? 0 : path.length() - 2)
    const offset = Math.min(graph.getWidth(node), graph.getHeight(node)) / 2
    const offsetX = (segment.deltaX > 0) ^ atSource ? -offset : offset
    const offsetY = (segment.deltaY > 0) ^ atSource ? -offset : offset
    // if the edge end point is at the center of this side, we use the calculated offset to put the end point on
    // the node bounds, otherwise we prolong the last segment to the center line of the node so it doesn't end
    // outside the node's shape
    const newPortLocation = segment.isHorizontal
      ? new yfiles.algorithms.YPoint(pointRel.y !== 0 ? 0 : offsetX, pointRel.y)
      : new yfiles.algorithms.YPoint(pointRel.x, pointRel.x !== 0 ? 0 : offsetY)
    if (atSource) {
      graph.setSourcePointRel(e, newPortLocation)
    } else {
      graph.setTargetPointRel(e, newPortLocation)
    }
  }

  /**
   * An automatic layout algorithm for BPMN diagrams.
   *
   * Some elements have to be marked with the DataProvider keys
   * {@link BpmnLayout#SEQUENCE_FLOW_EDGES_DP_KEY} and {@link BpmnLayout#BOUNDARY_INTERRUPTING_EDGES_DP_KEY}.
   *
   * @implements {yfiles.layout.ILayoutAlgorithm}
   */
  class BpmnLayout extends yfiles.lang.Class(yfiles.layout.ILayoutAlgorithm) {
    constructor() {
      super()
      this.$scope = 'ALL_ELEMENTS'
      this.$laneInsets = 10
      this.$layoutOrientation = 'LEFT_TO_RIGHT'
      this.$minimumNodeDistance = 40
    }

    /**
     * Gets the scope of graph elements that are laid out.
     * Possible values are 'ALL_ELEMENTS'
     * and 'SELECTED_ELEMENTS'.
     *
     * Defaults to 'ALL_ELEMENTS'.
     *
     * Note, if the scope is set to 'SELECTED_ELEMENTS',
     * non-selected elements may also be moved. However the layout algorithm uses the initial position of
     * such elements as sketch.
     *
     * @return {'ALL_ELEMENTS'|'SELECTED_ELEMENTS'}
     */
    get scope() {
      return this.$scope
    }

    /**
     * Sets the scope of graph elements that are laid out.
     * Possible values are 'ALL_ELEMENTS'
     * and 'SELECTED_ELEMENTS'.
     *
     * Defaults to 'ALL_ELEMENTS'.
     *
     * Note, if the scope is set to 'SELECTED_ELEMENTS',
     * non-selected elements may also be moved. However the layout algorithm uses the initial position of
     * such elements as sketch.
     *
     * @param {'ALL_ELEMENTS'|'SELECTED_ELEMENTS'} scope
     */
    set scope(scope) {
      this.$scope = scope
    }

    /**
     * Gets the insets used for swim-lanes.
     * The insets for swim-lanes, that is the distance between a graph element
     * and the border of its enclosing swim-lane.
     *
     * Defaults to <code>10.0</code>.
     *
     * @returns {number}
     */
    get laneInsets() {
      return this.$laneInsets
    }

    /**
     * Sets the insets used for swim-lanes.
     * The insets for swim-lanes, that is the distance between a graph element
     * and the border of its enclosing swim-lane.
     *
     * Defaults to <code>10.0</code>.
     *
     * @param {number} insets
     */
    set laneInsets(insets) {
      this.$laneInsets = insets
    }

    /**
     * Gets the minimum distance between two node elements.
     * Defaults to <code>40.0</code>
     * @returns {number}
     */
    get minimumNodeDistance() {
      return this.$minimumNodeDistance
    }

    /**
     * Sets the minimum distance between two node elements.
     * Defaults to <code>40.0</code>
     * @param {number} distance
     */
    set minimumNodeDistance(distance) {
      this.$minimumNodeDistance = distance
    }

    /**
     * Gets the layout orientation.
     * Defaults to {@link 'LEFT_TO_RIGHT'}.
     * @returns {'LEFT_TO_RIGHT'|'TOP_TO_BOTTOM'}
     */
    get layoutOrientation() {
      return this.$layoutOrientation
    }

    /**
     * Sets the layout orientation.
     * Defaults to {@link 'LEFT_TO_RIGHT'}.
     * @param {'LEFT_TO_RIGHT'|'TOP_TO_BOTTOM'} orientation
     */
    set layoutOrientation(orientation) {
      this.$layoutOrientation = orientation
    }

    /**
     * Lays out the specified graph.
     * @see Specified by {@link yfiles.layout.ILayoutAlgorithm#applyLayout}.
     */
    applyLayout(graph) {
      if (graph.empty) {
        return
      }
      // set the laneInsets to all partition grid columns and rows
      this.configurePartitionGrid(graph)

      // run core layout
      this.applyHierarchicLayout(graph)

      // apply generic labeling
      BpmnLayout.applyLabeling(graph)
      // adjust endpoints of edges
      new PortLocationAdjuster().applyLayout(graph)

      // remove data provider for CriticalEdgePriorityDpKey that was added by BalancingPortOptimizer
      graph.removeDataProvider(yfiles.hierarchic.HierarchicLayout.CRITICAL_EDGE_PRIORITY_DP_KEY)
    }

    configurePartitionGrid(graph) {
      const grid = yfiles.layout.PartitionGrid.getPartitionGrid(graph)
      if (grid !== null) {
        grid.columns.forEach(columnObject => {
          const column = columnObject
          column.leftInset += this.laneInsets
          column.rightInset += this.laneInsets
        })
        grid.rows.forEach(rowObject => {
          const row = rowObject
          row.topInset += this.laneInsets
          row.bottomInset += this.laneInsets
        })
      }
    }

    applyHierarchicLayout(graph) {
      const hl = new yfiles.hierarchic.HierarchicLayout()
      hl.orthogonalRouting = true
      hl.recursiveGroupLayering = false
      hl.componentLayoutEnabled = false
      hl.fromScratchLayerer = new BackLoopLayerer()
      hl.minimumLayerDistance = this.minimumNodeDistance
      hl.nodeToNodeDistance = this.minimumNodeDistance
      hl.nodePlacer.barycenterMode = true
      hl.nodePlacer.straightenEdges = true
      hl.layoutOrientation =
        this.layoutOrientation === 'LEFT_TO_RIGHT'
          ? yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
          : yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM
      hl.hierarchicLayoutCore.portConstraintOptimizer = new BalancingPortOptimizer(
        new yfiles.hierarchic.PortCandidateOptimizer()
      )
      if (this.scope === 'SELECTED_ELEMENTS') {
        const newAsIsLayerer = new yfiles.hierarchic.AsIsLayerer()
        newAsIsLayerer.maximumNodeSize = 5
        hl.fixedElementsLayerer = newAsIsLayerer

        hl.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
      }
      hl.applyLayout(graph)
    }

    static applyLabeling(graph) {
      const labeling = new yfiles.labeling.GenericLabeling()
      labeling.reduceAmbiguity = true
      labeling.placeNodeLabels = true
      labeling.placeEdgeLabels = true
      labeling.affectedLabelsDpKey = BpmnLayout.AFFECTED_LABELS_DP_KEY
      labeling.profitModel = new BpmnLabelProfitModel(graph)
      labeling.customProfitModelRatio = 0.15
      labeling.applyLayout(graph)
    }

    /**
     * Data provider key used to store if an edge represents a sequence flow, default flow or
     * conditional flow.
     * @type {Object}
     */
    static get SEQUENCE_FLOW_EDGES_DP_KEY() {
      return 'com.yworks.yfiles.bpmn.layout.BpmnLayout.SequenceFlowEdgesDpKey'
    }

    /**
     * Data provider key used to store if an edge starts at a boundary interrupting event.
     * @type {Object}
     */
    static get BOUNDARY_INTERRUPTING_EDGES_DP_KEY() {
      return 'com.yworks.yfiles.bpmn.layout.BpmnLayout.BoundaryInterruptingEdgesDpKey'
    }

    /**
     * Data provider key used to store which labels shall be positioned by the labeling
     * algorithm.
     * @type {Object}
     */
    static get AFFECTED_LABELS_DP_KEY() {
      return 'com.yworks.yfiles.bpmn.layout.BpmnLayout.AffectedLabelsDpKey'
    }

    /**
     * Data provider key used to identify nodes for which the port locations should be
     * adjusted.
     * @type {Object}
     */
    static get ADJUST_PORT_LOCATION_NODES_DP_KEY() {
      return PortLocationAdjuster.AFFECTED_NODES_DP_KEY
    }

    /**
     * Returns if the edge represents a sequence flow, default flow or conditional flow.
     * @see {@link BpmnLayout#SEQUENCE_FLOW_EDGES_DP_KEY}
     * @return {boolean}
     */
    static isSequenceFlow(edge, graph) {
      const flowDP = graph.getDataProvider(BpmnLayout.SEQUENCE_FLOW_EDGES_DP_KEY)
      return flowDP !== null && flowDP.getBoolean(edge)
    }

    /**
     * Returns if the edge is attached to a boundary interrupting event.
     * @see {@link BpmnLayout#BOUNDARY_INTERRUPTING_EDGES_DP_KEY}
     * @return {boolean}
     */
    static isBoundaryInterrupting(edge, graph) {
      const isInterruptingDP = graph.getDataProvider(BpmnLayout.BOUNDARY_INTERRUPTING_EDGES_DP_KEY)
      return isInterruptingDP !== null && isInterruptingDP.getBoolean(edge)
    }
  }

  /**
   * A layerer stage that pulls back loop components to earlier layers to reduce the spanned layers of back edges.
   * A back loop component is a set of connected nodes satisfying the following rules:
   * <ul>
   * <li>the set contains no sink node, i.e. no node with out degree 0</li>
   * <li>all outgoing edges to nodes outside of this set are back edges.</li>
   * </ul>
   * @extends yfiles.hierarchic.ConstraintIncrementalLayerer
   */
  class BackLoopLayerer extends yfiles.hierarchic.ConstraintIncrementalLayerer {
    /**
     * Creates a new instance with the specified core layerer.
     */
    constructor() {
      super(new yfiles.hierarchic.TopologicalLayerer())
      this.allowSameLayerEdges = true
      // @type {NodeState[]}
      this.nodeStates = null
      // @type {number[]}
      this.currentLayers = null
    }

    /**
     * Assigns all nodes of the graph to layers and adds them to the {@link yfiles.hierarchic.ILayers} instance.
     *
     * In order to create new layers, factory method {@link yfiles.hierarchic.ILayers#insert} has to be used.
     *
     * Information about the nodes is provided by a {@link yfiles.hierarchic.ILayoutDataProvider}. However, positional
     * information
     * (see {@link yfiles.hierarchic.INodeData#position} and {@link yfiles.hierarchic.INodeData#layer}) is not
     * available during this phase.
     *
     * @param {yfiles.layout.LayoutGraph} graph the input graph
     * @param {yfiles.hierarchic.ILayers} layers
     * the {@link yfiles.hierarchic.ILayers} instance that will be filled with the results of the calculation
     * @param {yfiles.hierarchic.ILayoutDataProvider} ldp
     * the {@link yfiles.hierarchic.ILayoutDataProvider} used for querying information about the nodes and edges
     * @see {@link yfiles.hierarchic.ILayers#insert}
     * @see {@link yfiles.hierarchic.ILayer#add}
     * @see Specified by {@link yfiles.hierarchic.ILayerer#assignLayers}.
     */
    assignLayers(graph, layers, ldp) {
      // get core layer assignment
      super.assignLayers(graph, layers, ldp)

      // Hide all edges that are no sequence flows
      const graphHider = new yfiles.algorithms.LayoutGraphHider(graph)
      for (let i = 0, arr = graph.getEdgeArray(); i < arr.length; i++) {
        const edge = arr[i]
        if (!BpmnLayout.isSequenceFlow(edge, graph)) {
          graphHider.hide(edge)
        }
      }

      // determine current layer of all nodes
      this.currentLayers = new Array(graph.nodeCount)
      for (let i = 0; i < layers.size(); i++) {
        for (let nc = layers.getLayer(i).list.nodes(); nc.ok; nc.next()) {
          this.currentLayers[nc.node.index] = i
        }
      }

      // mark nodes on a back-loop and candidates that may be on a back loop if other back-loop nodes are reassigned
      this.nodeStates = new Array(graph.nodeCount)
      let candidates = new yfiles.algorithms.NodeList()
      const backLoopNodes = new yfiles.algorithms.NodeList()
      for (let i = layers.size() - 1; i >= 0; i--) {
        // check from last to first layer to detect candidates as well
        const nodes = layers.getLayer(i).list
        this.updateNodeStates(nodes, backLoopNodes, candidates)
      }

      // swap layer for back-loop nodes
      while (backLoopNodes.size > 0) {
        for (let nc = backLoopNodes.nodes(); nc.ok; nc.next()) {
          const node = nc.node
          const currentLayer = this.currentLayers[node.index]
          // the target layer is the next layer after the highest fixed target node layer
          let targetLayer = 0
          for (let edge = node.firstOutEdge; edge !== null; edge = edge.nextOutEdge) {
            const targetNodeIndex = edge.target.index
            if (this.nodeStates[targetNodeIndex] === NodeState.FIXED) {
              targetLayer = Math.max(targetLayer, this.currentLayers[targetNodeIndex] + 1)
            }
          }
          if (targetLayer === 0) {
            // no fixed target found, so all targets must be candidates
            // -> we skip the node as we don't know where the candidates will be placed at the end
            continue
          }
          if (targetLayer < currentLayer) {
            layers.getLayer(currentLayer).remove(node)
            layers.getLayer(targetLayer).add(node)
            this.currentLayers[node.index] = targetLayer
            this.nodeStates[node.index] = NodeState.FIXED
          }
        }
        backLoopNodes.clear()

        // update states of the candidates
        candidates = this.updateNodeStates(
          candidates,
          backLoopNodes,
          new yfiles.algorithms.NodeList()
        )
      }

      // remove empty layers
      for (let i = layers.size() - 1; i >= 0; i--) {
        if (layers.getLayer(i).list.size === 0) {
          layers.remove(i)
        }
      }

      // cleanup
      graphHider.unhideAll()
      this.nodeStates = null
      this.currentLayers = null
    }

    /**
     * @return {yfiles.algorithms.NodeList}
     */
    updateNodeStates(nodes, backLoopNodes, candidates) {
      for (let nc = nodes.nodes(); nc.ok; nc.next()) {
        const node = nc.node
        const nodeState = this.getNodeState(node)
        switch (nodeState) {
          case NodeState.BACK_LOOPING:
            backLoopNodes.addFirst(node)
            break
          case NodeState.BACK_LOOPING_CANDIDATE:
            candidates.addFirst(node)
            break
          default:
        }
        this.nodeStates[node.index] = nodeState
      }
      return candidates
    }

    /**
     * @return {NodeState}
     */
    getNodeState(node) {
      const nodeLayer = this.currentLayers[node.index]
      if (nodeLayer === 0) {
        // nodes in the first layer can't have any back edges
        return NodeState.FIXED
      }
      let nodeState = NodeState.FIXED
      for (let edge = node.firstOutEdge; edge !== null; edge = edge.nextOutEdge) {
        const targetIndex = edge.target.index
        if (this.currentLayers[targetIndex] >= nodeLayer) {
          // no back-looping edge...
          if (
            this.nodeStates[targetIndex] === NodeState.BACK_LOOPING ||
            this.nodeStates[targetIndex] === NodeState.BACK_LOOPING_CANDIDATE
          ) {
            // ...but target is back-looping, so this one might be as well
            nodeState = NodeState.BACK_LOOPING_CANDIDATE
          } else {
            // ... and target is fixed -> this node is fixed as well.
            nodeState = NodeState.FIXED
            break
          }
        } else if (nodeState === NodeState.FIXED) {
          // no back looping candidate -> back-looping
          nodeState = NodeState.BACK_LOOPING
        }
      }
      return nodeState
    }
  }

  /**
   * The state of a node while calculating those nodes on a back loop that might be pulled
   * to a lower layer.
   * @class
   */
  const NodeState = yfiles.lang.Enum('NodeState', {
    FIXED: 0,
    BACK_LOOPING: 1,
    BACK_LOOPING_CANDIDATE: 2
  })

  /**
   * This port optimizer tries to balance the edges on each node and distribute them to the four node sides.
   * To balances the edge distribution it calculates edges that should be on a
   * {@link yfiles.hierarchic.HierarchicLayout#CRITICAL_EDGE_DP_KEY critical path} and define the flow of the diagram.
   * Furthermore it uses {@link yfiles.hierarchic.IItemFactory#setTemporaryPortConstraint temporary port constraints}
   * on the non-flow sides of the nodes.
   * @extends yfiles.hierarchic.PortConstraintOptimizerBase
   */
  class BalancingPortOptimizer extends yfiles.hierarchic.PortConstraintOptimizerBase {
    constructor(coreOptimizer) {
      super()
      // @type {yfiles.hierarchic.IPortConstraintOptimizer}
      this.coreOptimizer = coreOptimizer
      // @type {yfiles.hierarchic.PortConstraintOptimizerSameLayerData}
      this.sameLayerData = null
      // @type {yfiles.algorithms.IEdgeMap}
      this.edge2LaneCrossing = null
      // @type {yfiles.algorithms.INodeMap}
      this.node2LaneAlignment = null
    }

    optimizeAfterLayering(graph, layers, ldp, itemFactory) {
      if (this.coreOptimizer !== null) {
        this.coreOptimizer.optimizeAfterLayering(graph, layers, ldp, itemFactory)
      }
    }

    optimizeAfterSequencing(graph, layers, ldp, itemFactory) {
      if (this.coreOptimizer !== null) {
        this.coreOptimizer.optimizeAfterSequencing(graph, layers, ldp, itemFactory)
      }
      super.optimizeAfterSequencing(graph, layers, ldp, itemFactory)
    }

    optimizeAfterSequencingForSingleNode(
      node,
      inEdgeOrder,
      outEdgeOrder,
      graph,
      ldp,
      itemFactory
    ) {}

    /** @return {yfiles.hierarchic.PortConstraintOptimizerSameLayerData} */
    insertSameLayerStructures(graph, layers, ldp, itemFactory) {
      // store the SameLayerData for later use
      this.sameLayerData = super.insertSameLayerStructures(graph, layers, ldp, itemFactory)
      return this.sameLayerData
    }

    optimizeAfterSequencingForAllNodes(inEdgeOrder, outEdgeOrder, graph, layers, ldp, itemFactory) {
      this.edge2LaneCrossing = yfiles.algorithms.Maps.createHashedEdgeMap()
      this.node2LaneAlignment = yfiles.algorithms.Maps.createHashedNodeMap()

      const criticalEdges = yfiles.algorithms.Maps.createHashedEdgeMap()

      // determine whether an edge crosses a swim-lane border and if so in which direction
      graph.edges.forEach(edge => {
        const originalEdge = this.getOriginalEdge(edge, ldp)

        // now we have a 'real' edge with valid source and target nodes
        const originalSourceId = getLaneId(originalEdge.source, ldp)
        const originalTargetId = getLaneId(originalEdge.target, ldp)
        let crossing = LaneCrossing.NONE
        if (originalSourceId !== originalTargetId) {
          // check if we need to flip the sides because edge and original edge have different directions
          const flipSides = edge.source !== originalEdge.source
          const sourceId = flipSides ? originalTargetId : originalSourceId
          const targetId = flipSides ? originalSourceId : originalTargetId

          crossing = sourceId > targetId ? LaneCrossing.TO_WEST : LaneCrossing.TO_EAST
        }
        this.edge2LaneCrossing.set(edge, crossing)
      })

      // determine basic node alignment
      graph.nodes.forEach(n => {
        const alignment = this.calculateLaneAlignment(n)
        this.node2LaneAlignment.set(n, alignment)
      })

      graph.nodes.forEach(n => {
        // sort the edges with the provided comparer
        n.sortInEdges(inEdgeOrder)
        n.sortOutEdges(outEdgeOrder)

        // calculate 'critical' in and out-edges whose nodes should be aligned in flow
        const bestInEdge = n.inDegree > 0 ? this.getBestFlowEdge(n.inEdges, ldp, graph) : null
        const bestOutEdge = n.outDegree > 0 ? this.getBestFlowEdge(n.outEdges, ldp, graph) : null
        if (bestInEdge !== null) {
          criticalEdges.set(bestInEdge, criticalEdges.get(bestInEdge) + 0.5)
        }
        if (bestOutEdge !== null) {
          criticalEdges.set(bestOutEdge, criticalEdges.get(bestOutEdge) + 0.5)
        }
        if (n.degree <= 4) {
          // should usually be the case and we can distribute each edge to its own side
          // remember which node side is already taken by an in- or out-edge
          let westTakenByInEdge = false
          let eastTakenByInEdge = false
          let westTakenByOutEdge = false
          let eastTakenByOutEdge = false

          if (n.inDegree > 0 && n.outDegree < 3) {
            // if there are at least three out-edges, we distribute those first, otherwise we start with the in-edges

            const firstInEdge = n.firstInEdge
            const lastInEdge = n.lastInEdge
            if (
              this.getLaneCrossing(firstInEdge) === LaneCrossing.TO_EAST &&
              (n.inDegree > 1 || this.isSameLayerEdge(firstInEdge, ldp))
            ) {
              // the first in-edge comes from west and is either a same layer edge or there are other in-edges
              constrainWest(firstInEdge, false, itemFactory)
              westTakenByInEdge = true
            }
            if (!westTakenByInEdge || n.outDegree < 2) {
              // don't use west and east side for in-edges if there are at least 2 out-edges
              if (
                this.getLaneCrossing(lastInEdge) === LaneCrossing.TO_WEST &&
                (n.inDegree > 1 || this.isSameLayerEdge(lastInEdge, ldp))
              ) {
                // the last in-edge comes from east and is either
                // a same-layer edge or there are other in-edges
                constrainEast(lastInEdge, false, itemFactory)
                eastTakenByInEdge = true
              }
            }
          }

          if (n.outDegree > 0) {
            const firstOutEdge = n.firstOutEdge
            const lastOutEdge = n.lastOutEdge

            if (!westTakenByInEdge) {
              // the west side is still free
              if (
                BpmnLayout.isBoundaryInterrupting(firstOutEdge, graph) ||
                (this.getLaneCrossing(firstOutEdge) === LaneCrossing.TO_WEST &&
                  (n.outDegree > 1 || this.isSameLayerEdge(firstOutEdge, ldp)))
              ) {
                // the first out-edge is either boundary interrupting or goes to west and
                // is either a same layer edge or there are other out-edges
                constrainWest(firstOutEdge, true, itemFactory)
                westTakenByOutEdge = true
              } else if (
                eastTakenByInEdge &&
                n.outDegree >= 2 &&
                !this.isSameLayerEdge(firstOutEdge.nextOutEdge, ldp)
              ) {
                // the east side is already taken but we have more then one out edge.
                // if the second out edge is a same layer edge, constraining the firstOutEdge could lead to
                // no in-flow edge
                constrainWest(firstOutEdge, true, itemFactory)
                westTakenByOutEdge = true
              }
            }
            if (!eastTakenByInEdge) {
              // the east side is still free
              if (
                this.getLaneCrossing(lastOutEdge) === LaneCrossing.TO_EAST &&
                (n.outDegree > 1 || this.isSameLayerEdge(lastOutEdge, ldp))
              ) {
                // the last out-edge goes to east and
                // is either a same layer edge or there are other out-edges
                constrainEast(lastOutEdge, true, itemFactory)
                eastTakenByOutEdge = true
              } else if (
                westTakenByInEdge &&
                n.outDegree >= 2 &&
                !this.isSameLayerEdge(lastOutEdge.prevOutEdge, ldp)
              ) {
                // the west side is already taken but we have more then one out edge.
                // if the second last out edge is a same layer edge, constraining the lastOutEdge could lead to
                // no in-flow edge
                constrainEast(lastOutEdge, true, itemFactory)
                eastTakenByOutEdge = true
              }
            }
          }

          // distribute remaining in-edges
          if (n.inDegree === 2 && !(eastTakenByInEdge || westTakenByInEdge)) {
            // two in-edges but none distributed, yet
            if (bestInEdge === n.firstInEdge && !eastTakenByOutEdge) {
              // first in-edge is in-flow edge and east side is still free
              constrainEast(n.lastInEdge, false, itemFactory)
              eastTakenByInEdge = true
            } else if (bestInEdge === n.lastInEdge && !westTakenByOutEdge) {
              // last in-edge is in-flow edge and west side is still free
              constrainWest(n.firstInEdge, false, itemFactory)
              westTakenByInEdge = true
            }
          } else if (
            n.inDegree === 3 &&
            !(eastTakenByInEdge && westTakenByInEdge) &&
            !this.isSameLayerEdge(n.firstInEdge.nextInEdge, ldp)
          ) {
            // three in-edges but not both sides taken, yet and the middle edge is no same layer edge
            if (!eastTakenByOutEdge) {
              // if not already taken, constraint the last in-edge to east
              constrainEast(n.lastInEdge, false, itemFactory)
              eastTakenByInEdge = true
            }
            if (!westTakenByOutEdge) {
              // if not already taken, constraint the first in-edge to west
              constrainWest(n.firstInEdge, false, itemFactory)
              westTakenByInEdge = true
            }
          }

          // distribute remaining out-edges
          if (n.outDegree === 2 && !(eastTakenByOutEdge || westTakenByOutEdge)) {
            // two out-edges but none distributed, yet
            if (bestOutEdge === n.firstOutEdge && !eastTakenByInEdge) {
              // first out-edge is in-flow edge and east side is still free
              constrainEast(n.lastOutEdge, true, itemFactory)
              // noinspection ReuseOfLocalVariableJS
              eastTakenByOutEdge = true
            } else if (bestOutEdge === n.lastOutEdge && !westTakenByInEdge) {
              // last out-edge is in-flow edge and west side is still free
              constrainWest(n.firstOutEdge, true, itemFactory)
              // noinspection ReuseOfLocalVariableJS
              westTakenByOutEdge = true
            }
          } else if (
            n.outDegree === 3 &&
            !(eastTakenByOutEdge && westTakenByOutEdge) &&
            !this.isSameLayerEdge(n.firstOutEdge.nextOutEdge, ldp)
          ) {
            // three out-edges but not both sides taken, yet and the middle edge is no same layer edge
            if (!eastTakenByInEdge) {
              // if not already taken, constraint the last out-edge to east
              constrainEast(n.lastOutEdge, true, itemFactory)
              // noinspection ReuseOfLocalVariableJS
              eastTakenByOutEdge = true
            }
            if (!westTakenByInEdge) {
              // if not already taken, constraint the first out-edge to west
              constrainWest(n.firstOutEdge, true, itemFactory)
              // noinspection ReuseOfLocalVariableJS
              westTakenByOutEdge = true
            }
          }
        }
      })

      // register the data provider for critical edge paths. It is deregistered again by BpmnLayout itself
      graph.addDataProvider(
        yfiles.hierarchic.HierarchicLayout.CRITICAL_EDGE_PRIORITY_DP_KEY,
        criticalEdges
      )

      this.sameLayerData = null
      this.edge2LaneCrossing = null
      this.node2LaneAlignment = null
    }

    /**
     * @return {LaneCrossing}
     */
    getLaneCrossing(edge) {
      return this.edge2LaneCrossing.get(edge)
    }

    /**
     * @return {LaneAlignment}
     */
    getLaneAlignment(source) {
      return this.node2LaneAlignment.get(source)
    }

    /**
     * Get the {@link yfiles.algorithms.Edge} representing the original edge on the graph.
     * As the core layout algorithm creates temporary edges for example for same-layer edges and edges spanning
     * multiple layers, we need to lookup the original edge of the graph for example as key in data providers.
     * @return {yfiles.algorithms.Edge}
     */
    getOriginalEdge(edge, ldp) {
      const originalEdgeSource = this.sameLayerData.getOriginalEdge(edge.source)
      const originalEdgeTarget = this.sameLayerData.getOriginalEdge(edge.target)
      const originalEdge = originalEdgeSource || originalEdgeTarget || edge
      const edgeData = ldp.getEdgeData(originalEdge)
      return edgeData.associatedEdge || originalEdge
    }

    /**
     * Returns the best suited edge in <param name="edges"/> for use as in-flow edge or <code>null</code>
     * if no such edge could be found.
     * @return {yfiles.algorithms.Edge}
     */
    getBestFlowEdge(edges, ldp, graph) {
      const weakCandidates = new yfiles.collections.List()
      const candidates = new yfiles.collections.List()

      const edgeArray = edges.toArray()
      for (let i = 0; i < edgeArray.length; i++) {
        const edge = edgeArray[i]
        {
          const originalEdge = this.getOriginalEdge(edge, ldp)
          if (
            this.edge2LaneCrossing.get(edge) !== LaneCrossing.NONE ||
            BpmnLayout.isBoundaryInterrupting(originalEdge, graph) ||
            this.isSameLayerEdge(originalEdge, ldp) ||
            edge.selfLoop
          ) {
            // an edge should not be aligned if:
            // - it crosses stripe borders
            // - it is boundary interrupting
            // - it is a same-layer edge
            // - it is a self-loop
            continue
          }
          if (ldp.getEdgeData(edge).reversed || !BpmnLayout.isSequenceFlow(originalEdge, graph)) {
            // it is only a weak candidate if:
            // - it is reversed
            // - it is no sequence flow
            weakCandidates.add(edge)
          } else {
            candidates.add(edge)
          }
        }
      }
      if (candidates.size > 0) {
        // if there are several candidates, choose the one that would keep the LaneAlignment
        // of its source and target node consistent
        candidates.sort((edge1, edge2) => {
          const ac1 = this.getAlignmentConsistency(edge1)
          const ac2 = this.getAlignmentConsistency(edge2)
          return ac2 - ac1
        })
        return candidates.get(0)
      }
      if (weakCandidates.size > 0) {
        return weakCandidates.get(Math.floor(weakCandidates.size / 2.0) | 0)
      }
      return null
    }

    /**
     * Returns how much the {@link LaneAlignment} of the source and target node is consistent.
     * The consistency is <pre><code>2</code></pre>, if both nodes have the same alignment.
     * It is <pre><code>1</code></pre> if exactly one of the alignments is
     * {@link LaneAlignment#NONE} and <pre><code>0</code></pre> otherwise.
     * @return {number}
     */
    getAlignmentConsistency(edge) {
      const sourceLA = this.getLaneAlignment(edge.source)
      const targetLA = this.getLaneAlignment(edge.target)
      if (sourceLA === targetLA) {
        return 2
      }
      return sourceLA === LaneAlignment.NONE || targetLA === LaneAlignment.NONE ? 1 : 0
    }

    /**
     * Returns if the source and target node of the {@link BalancingPortOptimizer#getOriginalEdge original edge} of
     * <code>edge</code> are on the same layer.
     * @return {boolean}
     */
    isSameLayerEdge(edge, ldp) {
      const originalEdge = this.getOriginalEdge(edge, ldp)
      const sourceNodeData = ldp.getNodeData(originalEdge.source)
      const targetNodeData = ldp.getNodeData(originalEdge.target)
      return (
        sourceNodeData !== null &&
        targetNodeData !== null &&
        sourceNodeData.layer === targetNodeData.layer
      )
    }

    /**
     * Determine the alignment of a node in its swim-lane depending on the {@link LaneCrossing}s
     * of its attached edges.
     * @return {LaneAlignment}
     */
    calculateLaneAlignment(n) {
      let toRightCount = 0
      let toLeftCount = 0
      n.edges.forEach(edge => {
        const crossing = this.edge2LaneCrossing.get(edge)
        if (n === edge.source) {
          if (crossing === LaneCrossing.TO_EAST) {
            toRightCount++
          } else if (crossing === LaneCrossing.TO_WEST) {
            toLeftCount++
          }
        } else if (crossing === LaneCrossing.TO_EAST) {
          toLeftCount++
        } else if (crossing === LaneCrossing.TO_WEST) {
          toRightCount++
        }
      })
      if (toLeftCount > toRightCount) {
        return LaneAlignment.LEFT
      } else if (toLeftCount < toRightCount) {
        return LaneAlignment.RIGHT
      }
      return LaneAlignment.NONE
    }

    /**
     * weak port constraints that are assigned as temporary port constraints
     * @type {yfiles.layout.PortConstraint}
     */
    static get PORT_CONSTRAINT_EAST() {
      // eslint-disable-next-line no-return-assign
      return (
        BalancingPortOptimizer.$portConstraintEast ||
        (BalancingPortOptimizer.$portConstraintEast = yfiles.layout.PortConstraint.create(
          yfiles.layout.PortSide.EAST
        ))
      )
    }

    /**
     * weak port constraints that are assigned as temporary port constraints
     * @type {yfiles.layout.PortConstraint}
     */
    static get PORT_CONSTRAINT_WEST() {
      // eslint-disable-next-line no-return-assign
      return (
        BalancingPortOptimizer.$portConstraintWest ||
        (BalancingPortOptimizer.$portConstraintWest = yfiles.layout.PortConstraint.create(
          yfiles.layout.PortSide.WEST
        ))
      )
    }
  }

  /**
   * Specifies the alignment of a node in its swim-lane.
   * @see {@link BalancingPortOptimizer#calculateLaneAlignment}
   */
  const LaneAlignment = yfiles.lang.Enum('LaneAlignmnet', {
    /**
     * The node has no special alignment.
     */
    NONE: 0,
    /**
     * The node is aligned to the left side.
     */
    LEFT: 1,
    /**
     * The node is aligned to the right side.
     */
    RIGHT: 2
  })

  /**
   * Specifies in which direction an edge crosses swim-lane borders.
   */
  const LaneCrossing = yfiles.lang.Enum('LaneCrossing', {
    /**
     * The edge doesn't cross a swim-lane border.
     */
    NONE: 0,
    /**
     * The edge crosses swim-lane borders to the east, so its source node is in a swim-lane with a lower
     * <code>SwimlaneDescriptor.ComputedLaneIndex</code>.
     */
    TO_EAST: 1,
    /**
     * The edge crosses swim-lane borders to the west, so its source node is in a swim-lane with a higher
     * <code>SwimlaneDescriptor.ComputedLaneIndex</code>.
     */
    TO_WEST: 2
  })

  /**
   * Sets a {@link yfiles.hierarchic.IItemFactory#setTemporaryPortConstraint temporary east port constraint}
   * on <code>source</code> or target side of <code>edge</code>.
   */
  function constrainEast(edge, source, itemFactory) {
    itemFactory.setTemporaryPortConstraint(
      edge,
      source,
      BalancingPortOptimizer.PORT_CONSTRAINT_EAST
    )
  }

  /**
   * Sets a {@link yfiles.hierarchic.IItemFactory#setTemporaryPortConstraint temporary west port constraint}
   * on <code>source</code> or target side of <code>edge</code>.
   */
  function constrainWest(edge, source, itemFactory) {
    itemFactory.setTemporaryPortConstraint(
      edge,
      source,
      BalancingPortOptimizer.PORT_CONSTRAINT_WEST
    )
  }

  /**
   * Returns the <code>SwimlaneDescriptor.ComputedLaneIndex</code> for <code>node</code>.
   * @return {number}
   */
  function getLaneId(node, ldp) {
    const nodeData = ldp.getNodeData(node)
    const laneDesc = nodeData !== null ? nodeData.swimLaneDescriptor : null
    return laneDesc !== null ? laneDesc.computedLaneIndex : -1
  }

  /**
   * A profit model for exterior node labels that prefers node sides that are far away
   * from incoming or outgoing edges.
   * @implements {yfiles.layout.IProfitModel}
   */
  class BpmnLabelProfitModel extends yfiles.lang.Class(yfiles.layout.IProfitModel) {
    constructor(graph) {
      super()
      // @type {yfiles.layout.LayoutGraph}
      this.graph = graph
    }

    /**
     * Returns the profit for placing a label using the given {@link yfiles.layout.LabelCandidate}.
     *
     * Higher profit means better candidates. Hence, there is a higher probability that the candidate is chosen by a
     * labeling algorithm.
     *
     * Profits need to have a value between <code>0</code> and <code>1</code>.
     *
     * @param {yfiles.layout.LabelCandidate} candidate the candidate
     * @return {number} the profit of the candidate
     * @see Specified by {@link yfiles.layout.IProfitModel#getProfit}.
     */
    getProfit(candidate) {
      if (yfiles.layout.IEdgeLabelLayout.isInstance(candidate.owner)) {
        return 1
      }
      let profit = 0
      /** @type {yfiles.layout.INodeLabelLayout} */
      const nl = candidate.owner
      const node = this.graph.getOwnerNode(nl)
      const nodeLayout = this.graph.getLayout(node)
      const candidateLayout = candidate.boundingBox
      const isLeft = candidateLayout.x + candidateLayout.width / 2 < nodeLayout.x
      const isRight =
        candidateLayout.x + candidateLayout.width / 2 > nodeLayout.x + nodeLayout.width
      const isTop = candidateLayout.y + candidateLayout.height / 2 < nodeLayout.y
      const isBottom =
        candidateLayout.y + candidateLayout.height / 2 > nodeLayout.y + nodeLayout.height

      const horizontalCenter = !isLeft && !isRight
      const verticalCenter = !isTop && !isBottom
      if (horizontalCenter && verticalCenter) {
        // candidate is in center -> don't use
        return 0
      } else if (horizontalCenter || verticalCenter) {
        profit = 0.95
      } else {
        // diagonal candidates get a bit less profit
        profit = 0.9
      }
      node.edges.forEach(edge => {
        const portLocation =
          edge.source === node
            ? this.graph.getSourcePointRel(edge)
            : this.graph.getTargetPointRel(edge)
        if (Math.abs(portLocation.x) > Math.abs(portLocation.y)) {
          // edge at left or right
          if ((portLocation.x < 0 && isLeft) || (portLocation.x > 0 && isRight)) {
            if (isTop || isBottom) {
              profit -= 0.03
            } else {
              // edge at same side as candidate
              profit -= 0.2
            }
          } else if (horizontalCenter) {
            // candidate is close to the edge but not on the same side
            profit -= 0.01
          }
        } else {
          // edge at top or bottom
          if ((portLocation.y < 0 && isTop) || (portLocation.y > 0 && isBottom)) {
            if (isLeft || isRight) {
              profit -= 0.03
            } else {
              profit -= 0.2
            }
          } else if (verticalCenter) {
            // candidate is close to the edge but not on the same side
            profit -= 0.01
          }
        }
      })

      return Math.max(0, profit)
    }
  }

  return BpmnLayout
})
