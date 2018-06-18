/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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

define(['yfiles/view-layout-bridge', 'BpmnLayout.js', 'bpmn-view.js'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  BpmnLayout,
  BpmnView
) => {
  /**
   * Specifies custom data for the {@link BpmnLayout}.
   * Prepares BPMN layout information provided by the styles for assignment of layout information calculated by
   * {@link BpmnLayout}.
   */
  class BpmnLayoutData extends yfiles.layout.LayoutData {
    constructor() {
      super()
      this.$minimumEdgeLength = 20
    }

    /**
     * Gets whether or not start node are pulled to the leftmost or topmost layer.
     * Defaults to false.
     * @return {boolean}
     */
    get startNodesFirst() {
      return this.$startNodesFirst
    }

    /**
     * Sets whether or not start node are pulled to the leftmost or topmost layer.
     * Defaults to false.
     * @param {boolean} first
     */
    set startNodesFirst(first) {
      this.$startNodesFirst = first
    }

    /**
     * Gets whether or not message flows have only weak impact on the layering.
     * Having weak impact, message flows are more likely to be back edges. This often results in more compact layouts.
     * Defaults to false.
     * @return {boolean}
     */
    get compactMessageFlowLayering() {
      return this.$compactMessageFlowLayering
    }

    /**
     * Sets whether or not message flows have only weak impact on the layering.
     * Having weak impact, message flows are more likely to be back edges. This often results in more compact layouts.
     * Defaults to false.
     * @param {boolean} compact
     */
    set compactMessageFlowLayering(compact) {
      this.$compactMessageFlowLayering = compact
    }

    /**
     * Gets the minimum length of edges.
     * Defaults to 20.0.
     * @return {number}
     */
    get minimumEdgeLength() {
      return this.$minimumEdgeLength
    }

    /**
     * Sets the minimum length of edges.
     * Defaults to 20.0.
     * @param {number} length
     */
    set minimumEdgeLength(length) {
      this.$minimumEdgeLength = length
    }

    /**
     * @param {yfiles.layout.LayoutGraphAdapter} adapter
     * @param {yfiles.layout.ILayoutAlgorithm} layout
     * @param {yfiles.layout.CopiedLayoutGraph} layoutGraph
     */
    apply(adapter, layout, layoutGraph) {
      const graph = adapter.adaptedGraph

      // check if only selected elements should be laid out
      const layoutOnlySelection =
        layout instanceof BpmnLayout && layout.scope === 'SELECTED_ELEMENTS'

      // mark 'flow' edges, i.e. sequence flows, default flows and conditional flows
      adapter.addDataProvider(
        yfiles.graph.IEdge.$class,
        yfiles.lang.Boolean.$class,
        BpmnLayout.SEQUENCE_FLOW_EDGES_DP_KEY,
        yfiles.collections.IMapper.fromDelegate(edge => isSequenceFlow(edge))
      )

      // mark boundary interrupting edges for the BalancingPortOptimizer
      adapter.addDataProvider(
        yfiles.graph.IEdge.$class,
        yfiles.lang.Boolean.$class,
        BpmnLayout.BOUNDARY_INTERRUPTING_EDGES_DP_KEY,
        yfiles.collections.IMapper.fromDelegate(
          edge => edge.sourcePort.style instanceof BpmnView.EventPortStyle
        )
      )

      // mark conversations, events and gateways so their port locations are adjusted
      adapter.addDataProvider(
        yfiles.graph.INode.$class,
        yfiles.lang.Boolean.$class,
        BpmnLayout.ADJUST_PORT_LOCATION_NODES_DP_KEY,
        yfiles.collections.IMapper.fromDelegate(
          node =>
            node.style instanceof BpmnView.ConversationNodeStyle ||
            node.style instanceof BpmnView.EventNodeStyle ||
            node.style instanceof BpmnView.GatewayNodeStyle
        )
      )

      // add NodeHalos around nodes with event ports or specific exterior labels so the layout keeps space for the
      // event ports and labels as well
      addNodeHalos(adapter, graph, layoutOnlySelection)

      // add PreferredPlacementDescriptors for labels on sequence, default or conditional flows to place them at source
      // side
      addEdgeLabelPlacementDescriptors(adapter)

      const hierarchicLayoutData = new yfiles.hierarchic.HierarchicLayoutData()

      // mark nodes, edges and labels as either fixed or affected by the layout and configure port constraints and
      // incremental hints
      markFixedAndAffectedItems(adapter, hierarchicLayoutData, layoutOnlySelection)

      // mark associations and message flows as undirected so they have less impact on layering
      hierarchicLayoutData.edgeDirectedness.delegate = edge => {
        if (isMessageFlow(edge) || isAssociation(edge)) {
          return 0
        }
        return 1
      }

      // add layer constraints for start events, sub processes and message flows
      addLayerConstraints(
        graph,
        hierarchicLayoutData,
        this.startNodesFirst,
        this.compactMessageFlowLayering
      )

      // add EdgeLayoutDescriptor to specify minimum edge length for edges
      addMinimumEdgeLength(hierarchicLayoutData, this.minimumEdgeLength)

      // applies hierarchic layout configurations
      hierarchicLayoutData.apply(adapter, layout, layoutGraph)
    }
  }

  const addLayerConstraints = (
    graph,
    hierarchicLayoutData,
    startNodesFirst,
    compactMessageFlowLayering
  ) => {
    // use layer constraints via HierarchicLayoutData
    const layerConstraints = hierarchicLayoutData.layerConstraints

    graph.edges.forEach(edge => {
      if (isMessageFlow(edge) && !compactMessageFlowLayering) {
        // message flow layering compaction is disabled, we add a 'weak' same layer constraint, i.e. source node shall
        // be placed at least 0 layers above target node
        layerConstraints.placeAbove(edge.targetNode, edge.sourceNode, 0, 1)
      } else if (isSequenceFlow(edge)) {
        if (
          (isSubprocess(edge.sourceNode) &&
            !(edge.sourcePort.style instanceof BpmnView.EventPortStyle)) ||
          isSubprocess(edge.targetNode)
        ) {
          // For edges to or from a subprocess that are not attached to an (interrupting) event port, the flow should
          // be considered. If the subprocess is a group node, any constraints to it are ignored so we have to add the
          // constraints to the content nodes of the subprocess
          addAboveLayerConstraint(layerConstraints, edge, graph)
        }
      }
    })

    // if start events should be pulled to the first layer, add PlaceNodeAtTop constraint.
    if (startNodesFirst) {
      graph.nodes.forEach(node => {
        if (
          node.style instanceof BpmnView.EventNodeStyle &&
          node.style.characteristic === BpmnView.EventCharacteristic.START &&
          graph.inDegree(node) === 0 &&
          (graph.getParent(node) === null ||
            graph.getParent(node).style instanceof BpmnView.PoolNodeStyle)
        ) {
          layerConstraints.placeAtTop(node)
        }
      })
    }
  }

  /**
   * Adds a layer constraint which keeps the source node of the edge above the target node.
   * @param {yfiles.hierarchic.LayerConstraintData} layerConstraints
   * @param {yfiles.graph.IEdge} edge
   * @param {yfiles.graph.IGraph} graph
   */
  function addAboveLayerConstraint(layerConstraints, edge, graph) {
    const sourceNode = edge.sourceNode
    const targetNode = edge.targetNode

    const sourceNodes = []
    const targetNodes = []
    collectLeafNodes(graph, sourceNode, sourceNodes)
    collectLeafNodes(graph, targetNode, targetNodes)
    sourceNodes.forEach(source => {
      targetNodes.forEach(target => {
        layerConstraints.placeAbove(target, source)
      })
    })
  }

  /**
   * Fills the given leaf-nodes list recursively.
   * @param {yfiles.graph.IGraph} graph
   * @param {yfiles.graph.INode} node
   * @param {Array} leafNodes
   */
  function collectLeafNodes(graph, node, leafNodes) {
    const children = graph.getChildren(node)
    if (children.size > 0) {
      children.forEach(child => {
        collectLeafNodes(graph, child, leafNodes)
      })
    } else {
      leafNodes.push(node)
    }
  }

  /**
   * Adds a minimum length for each edge to make enough room for their labels.
   * @param {yfiles.hierarchic.HierarchicLayoutData} hierarchicLayoutData
   * @param {number} minimumEdgeLength
   */
  function addMinimumEdgeLength(hierarchicLayoutData, minimumEdgeLength) {
    // each edge should have a minimum length so that all its labels can be placed on it one
    // after another with a minimum label-to-label distance
    const minLabelToLabelDistance = 5
    hierarchicLayoutData.edgeLayoutDescriptors.delegate = edge => {
      const descriptor = new yfiles.hierarchic.EdgeLayoutDescriptor()
      descriptor.routingStyle = new yfiles.hierarchic.RoutingStyle(
        yfiles.hierarchic.EdgeRoutingStyle.ORTHOGONAL
      )
      let minLength = 0
      edge.labels.forEach(label => {
        const labelSize = label.layout.bounds
        minLength += Math.max(labelSize.width, labelSize.height)
      })
      if (edge.labels.size > 1) {
        minLength += (edge.labels.size - 1) * minLabelToLabelDistance
      }
      descriptor.minimumLength = Math.max(minLength, minimumEdgeLength)
      descriptor.minimumFirstSegmentLength = 20
      descriptor.minimumLastSegmentLength = 20
      return descriptor
    }
  }

  /**
   * Determines whether or not the given node represents a sub-process.
   * @param {yfiles.graph.INode} node
   * @return {boolean}
   */
  function isSubprocess(node) {
    return (
      node.style instanceof BpmnView.ActivityNodeStyle &&
      (node.style.activityType === BpmnView.ActivityType.SUB_PROCESS ||
        node.style.activityType === BpmnView.ActivityType.EVENT_SUB_PROCESS)
    )
  }

  /**
   * Determines whether or not the given edge represents a message flow.
   * @param {yfiles.graph.IEdge} edge
   * @return {boolean}
   */
  function isMessageFlow(edge) {
    return (
      edge.style instanceof BpmnView.BpmnEdgeStyle &&
      edge.style.type === BpmnView.EdgeType.MESSAGE_FLOW
    )
  }

  /**
   * Determines whether or not the given edge represents a sequence flow.
   * @param {yfiles.graph.IEdge} edge
   * @return {boolean}
   */
  function isSequenceFlow(edge) {
    if (!(edge.style instanceof BpmnView.BpmnEdgeStyle)) {
      return false
    }
    const bpmnEdgeStyle = edge.style
    return (
      bpmnEdgeStyle.type === BpmnView.EdgeType.SEQUENCE_FLOW ||
      bpmnEdgeStyle.type === BpmnView.EdgeType.DEFAULT_FLOW ||
      bpmnEdgeStyle.type === BpmnView.EdgeType.CONDITIONAL_FLOW
    )
  }

  /**
   * Determines whether or not the given edge represents an association.
   * @param {yfiles.graph.IEdge} edge
   * @return {boolean}
   */
  function isAssociation(edge) {
    if (!(edge.style instanceof BpmnView.BpmnEdgeStyle)) {
      return false
    }
    const bpmnEdgeStyle = edge.style
    return (
      bpmnEdgeStyle.type === BpmnView.EdgeType.ASSOCIATION ||
      bpmnEdgeStyle.type === BpmnView.EdgeType.BIDIRECTED_ASSOCIATION ||
      bpmnEdgeStyle.type === BpmnView.EdgeType.DIRECTED_ASSOCIATION
    )
  }

  /**
   * Adds node halos to reserve some space for labels.
   * @param {yfiles.layout.LayoutGraphAdapter} adapter
   * @param {yfiles.graph.IGraph} graph
   * @param {boolean} layoutOnlySelection
   */
  function addNodeHalos(adapter, graph, layoutOnlySelection) {
    const nodeHalos = new yfiles.collections.Mapper()
    graph.nodes.forEach(node => {
      let top = 0.0
      let left = 0.0
      let bottom = 0.0
      let right = 0.0

      // for each port with an EventPortStyle extend the node halo to cover the ports render size
      node.ports.forEach(port => {
        if (port.style instanceof BpmnView.EventPortStyle) {
          const eventPortStyle = port.style
          const renderSize = eventPortStyle.renderSize
          const location = port.location
          top = Math.max(top, node.layout.y - location.y - renderSize.height / 2)
          left = Math.max(left, node.layout.x - location.x - renderSize.width / 2)
          bottom = Math.max(bottom, location.y + renderSize.height / 2 - node.layout.maxY)
          right = Math.max(right, location.x + renderSize.width / 2 - node.layout.maxX)
        }
      })

      // for each node without incoming or outgoing edges reserve space for laid out exterior labels
      if (graph.inDegree(node) === 0 || graph.outDegree(node) === 0) {
        const margin = 15
        node.labels.forEach(label => {
          if (isNodeLabelAffected(label, adapter, layoutOnlySelection)) {
            const labelBounds = label.layout.bounds
            if (graph.inDegree(node) === 0) {
              left = Math.max(left, labelBounds.width + margin)
              top = Math.max(top, labelBounds.height + margin)
            }
            if (graph.outDegree(node) === 0) {
              right = Math.max(right, labelBounds.width + margin)
              bottom = Math.max(bottom, labelBounds.height + margin)
            }
          }
        })
      }

      nodeHalos.set(node, yfiles.layout.NodeHalo.create(top, left, bottom, right))
    })
    adapter.addDataProvider(
      yfiles.graph.INode.$class,
      yfiles.layout.NodeHalo.$class,
      yfiles.layout.NodeHalo.NODE_HALO_DP_KEY,
      nodeHalos
    )
  }

  /**
   * Checks whether or not the given label is considered for the layout.
   * @param {yfiles.graph.ILabel} label
   * @param {yfiles.layout.LayoutGraphAdapter} adapter
   * @param {boolean} layoutOnlySelection
   * @return {boolean}
   */
  function isNodeLabelAffected(label, adapter, layoutOnlySelection) {
    if (yfiles.graph.INode.isInstance(label.owner)) {
      const node = label.owner
      const isInnerLabel = node.layout.contains(label.layout.orientedRectangleCenter)
      const isPool = node.style instanceof BpmnView.PoolNodeStyle
      const isChoreography = node.style instanceof BpmnView.ChoreographyNodeStyle
      const isGroupNode = adapter.adaptedGraph.isGroupNode(node)
      return (
        !isInnerLabel &&
        !isPool &&
        !isChoreography &&
        !isGroupNode &&
        (!layoutOnlySelection || adapter.selectionModel.isSelected(node))
      )
    }
    return false
  }

  /**
   * Adds preferred placement for each edge.
   * @param {yfiles.layout.LayoutGraphAdapter} adapter
   */
  function addEdgeLabelPlacementDescriptors(adapter) {
    const atSourceDescriptor = new yfiles.layout.PreferredPlacementDescriptor({
      placeAlongEdge: yfiles.layout.LabelPlacements.AT_SOURCE_PORT,
      sideOfEdge: yfiles.layout.LabelPlacements.LEFT_OF_EDGE,
      angleReference: yfiles.layout.LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
    })
    const defaultDescriptor = new yfiles.layout.PreferredPlacementDescriptor({
      angleReference: yfiles.layout.LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
    })
    adapter.addDataProvider(
      yfiles.graph.ILabel.$class,
      yfiles.lang.Object.$class,
      yfiles.layout.LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
      yfiles.collections.IMapper.fromDelegate(label => {
        const edgeType = label.owner.style.type
        if (
          edgeType === BpmnView.EdgeType.SEQUENCE_FLOW ||
          edgeType === BpmnView.EdgeType.DEFAULT_FLOW ||
          edgeType === BpmnView.EdgeType.CONDITIONAL_FLOW
        ) {
          // labels on sequence, default and conditional flow edges should be placed at the source side.
          return atSourceDescriptor
        }
        return defaultDescriptor
      })
    )
  }

  /**
   * Marks which items are fixed or affected.
   * @param {yfiles.layout.LayoutGraphAdapter} adapter
   * @param {yfiles.hierarchic.HierarchicLayoutData} hierarchicLayoutData
   * @param {boolean} layoutOnlySelection
   */
  function markFixedAndAffectedItems(adapter, hierarchicLayoutData, layoutOnlySelection) {
    if (layoutOnlySelection) {
      const affectedEdges = yfiles.collections.IMapper.fromDelegate(
        edge =>
          adapter.selectionModel.isSelected(edge) ||
          adapter.selectionModel.isSelected(edge.sourceNode) ||
          adapter.selectionModel.isSelected(edge.targetNode)
      )

      adapter.addDataProvider(
        yfiles.graph.INode.$class,
        yfiles.lang.Boolean.$class,
        yfiles.layout.LayoutKeys.AFFECTED_NODES_DP_KEY,
        affectedEdges
      )

      // fix ports of unselected edges and edges at event ports
      adapter.addDataProvider(
        yfiles.graph.IEdge.$class,
        yfiles.layout.PortConstraint.$class,
        yfiles.layout.PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY,
        yfiles.collections.IMapper.fromDelegate(edge => {
          if (
            !affectedEdges.get(edge) ||
            edge.sourcePort.style instanceof BpmnView.EventPortStyle
          ) {
            return yfiles.layout.PortConstraint.create(getSide(edge, true))
          }
          return null
        })
      )
      adapter.addDataProvider(
        yfiles.graph.IEdge.$class,
        yfiles.layout.PortConstraint.$class,
        yfiles.layout.PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY,
        yfiles.collections.IMapper.fromDelegate(edge => {
          if (!affectedEdges.get(edge)) {
            return yfiles.layout.PortConstraint.create(getSide(edge, false))
          }
          return null
        })
      )

      // give core layout hints that selected nodes and edges should be incremental
      hierarchicLayoutData.incrementalHints.contextDelegate = (item, factory) => {
        if (yfiles.graph.INode.isInstance(item) && adapter.selectionModel.isSelected(item)) {
          return factory.createLayerIncrementallyHint(item)
        } else if (yfiles.graph.IEdge.isInstance(item) && affectedEdges.get(item)) {
          return factory.createSequenceIncrementallyHint(item)
        }
        return null
      }
      adapter.addDataProvider(
        yfiles.graph.ILabel.$class,
        yfiles.lang.Boolean.$class,
        BpmnLayout.AFFECTED_LABELS_DP_KEY,
        yfiles.collections.IMapper.fromDelegate(label => {
          if (yfiles.graph.IEdge.isInstance(label.owner)) {
            return affectedEdges.get(label.owner)
          }
          if (yfiles.graph.INode.isInstance(label.owner)) {
            const node = label.owner
            const isInnerLabel = node.layout.contains(label.layout.orientedRectangleCenter)
            const isPool = node.style instanceof BpmnView.PoolNodeStyle
            const isChoreography = node.style instanceof BpmnView.ChoreographyNodeStyle
            return (
              !isInnerLabel && !isPool && !isChoreography && adapter.selectionModel.isSelected(node)
            )
          }
          return false
        })
      )
    } else {
      // fix source port of edges at event ports
      adapter.addDataProvider(
        yfiles.graph.IEdge.$class,
        yfiles.layout.PortConstraint.$class,
        yfiles.layout.PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY,
        yfiles.collections.IMapper.fromDelegate(edge => {
          if (edge.sourcePort.style instanceof BpmnView.EventPortStyle) {
            return yfiles.layout.PortConstraint.create(getSide(edge, true))
          }
          return null
        })
      )

      adapter.addDataProvider(
        yfiles.graph.ILabel.$class,
        yfiles.lang.Boolean.$class,
        BpmnLayout.AFFECTED_LABELS_DP_KEY,
        yfiles.collections.IMapper.fromDelegate(label => {
          if (yfiles.graph.IEdge.isInstance(label.owner)) {
            return true
          }
          if (yfiles.graph.INode.isInstance(label.owner)) {
            const node = label.owner
            const isInnerLabel = node.layout.contains(label.layout.orientedRectangleCenter)
            const isPool = node.style instanceof BpmnView.PoolNodeStyle
            const isChoreography = node.style instanceof BpmnView.ChoreographyNodeStyle
            return !isInnerLabel && !isPool && !isChoreography
          }
          return false
        })
      )
    }
  }

  /**
   * Returns at which side of its source/target an edge should connect.
   * @param {yfiles.graph.IEdge} edge
   * @param {boolean} atSource
   * @return {yfiles.layout.PortSide}
   */
  function getSide(edge, atSource) {
    const port = atSource ? edge.sourcePort : edge.targetPort
    if (!yfiles.graph.INode.isInstance(port.owner)) {
      return yfiles.layout.PortSide.ANY
    }
    const node = port.owner
    const relPortLocation = port.location.subtract(node.layout.center)

    // calculate relative port position scaled by the node size
    const sdx = relPortLocation.x / (node.layout.width / 2)
    const sdy = relPortLocation.y / (node.layout.height / 2)

    if (Math.abs(sdx) > Math.abs(sdy)) {
      // east or west
      return sdx < 0 ? yfiles.layout.PortSide.WEST : yfiles.layout.PortSide.EAST
    } else if (Math.abs(sdx) < Math.abs(sdy)) {
      return sdy < 0 ? yfiles.layout.PortSide.NORTH : yfiles.layout.PortSide.SOUTH
    }

    // port is somewhere at the diagonals of the node bounds
    // so we can't decide the port side based on the port location
    // better use the attached segment to decide on the port side
    return getSideFromSegment(edge, atSource)
  }

  /**
   * Returns at which side of its source an edge should connect considering the first/last segment..
   * @param {yfiles.graph.IEdge} edge
   * @param {boolean} atSource
   * @return {yfiles.layout.PortSide}
   */
  function getSideFromSegment(edge, atSource) {
    const port = atSource ? edge.sourcePort : edge.targetPort
    const opposite = atSource ? edge.targetPort : edge.sourcePort
    const from = port.location

    const to =
      edge.bends.size > 0
        ? (atSource ? edge.bends.get(0) : edge.bends.last()).location
        : opposite.location

    const dx = to.x - from.x
    const dy = to.y - from.y
    if (Math.abs(dx) > Math.abs(dy)) {
      // east or west
      return dx < 0 ? yfiles.layout.PortSide.WEST : yfiles.layout.PortSide.EAST
    }

    return dy < 0 ? yfiles.layout.PortSide.NORTH : yfiles.layout.PortSide.SOUTH
  }

  return BpmnLayoutData
})
