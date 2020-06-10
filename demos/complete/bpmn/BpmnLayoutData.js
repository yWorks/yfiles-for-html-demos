/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  CopiedLayoutGraph,
  HierarchicLayoutData,
  HierarchicLayoutEdgeLayoutDescriptor,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  IEdge,
  IGraph,
  ILabel,
  ILayoutAlgorithm,
  IMapper,
  INode,
  LabelAngleReferences,
  LabelPlacements,
  LayerConstraintData,
  LayoutData,
  LayoutGraphAdapter,
  LayoutKeys,
  Mapper,
  NodeHalo,
  PortConstraint,
  PortConstraintKeys,
  PortSide,
  PreferredPlacementDescriptor,
  YBoolean,
  YObject
} from 'yfiles'

import {
  ActivityNodeStyle,
  ActivityType,
  BpmnEdgeStyle,
  ChoreographyNodeStyle,
  ConversationNodeStyle,
  EdgeType,
  EventCharacteristic,
  EventNodeStyle,
  EventPortStyle,
  GatewayNodeStyle,
  PoolNodeStyle
} from './bpmn-view.js'
import BpmnLayout from './BpmnLayout.js'

export default class BpmnLayoutData extends LayoutData {
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
   * @param {LayoutGraphAdapter} adapter
   * @param {ILayoutAlgorithm} layout
   * @param {CopiedLayoutGraph} layoutGraph
   */
  apply(adapter, layout, layoutGraph) {
    const graph = adapter.adaptedGraph

    // check if only selected elements should be laid out
    const layoutOnlySelection = layout instanceof BpmnLayout && layout.scope === 'SELECTED_ELEMENTS'

    // mark 'flow' edges, i.e. sequence flows, default flows and conditional flows
    adapter.addDataProvider(
      IEdge.$class,
      YBoolean.$class,
      BpmnLayout.SEQUENCE_FLOW_EDGES_DP_KEY,
      IMapper.fromDelegate(edge => isSequenceFlow(edge))
    )

    // mark boundary interrupting edges for the BalancingPortOptimizer
    adapter.addDataProvider(
      IEdge.$class,
      YBoolean.$class,
      BpmnLayout.BOUNDARY_INTERRUPTING_EDGES_DP_KEY,
      IMapper.fromDelegate(edge => edge.sourcePort.style instanceof EventPortStyle)
    )

    // mark conversations, events and gateways so their port locations are adjusted
    adapter.addDataProvider(
      INode.$class,
      YBoolean.$class,
      BpmnLayout.ADJUST_PORT_LOCATION_NODES_DP_KEY,
      IMapper.fromDelegate(
        node =>
          node.style instanceof ConversationNodeStyle ||
          node.style instanceof EventNodeStyle ||
          node.style instanceof GatewayNodeStyle
      )
    )

    // add NodeHalos around nodes with event ports or specific exterior labels so the layout keeps space for the
    // event ports and labels as well
    addNodeHalos(adapter, graph, layoutOnlySelection)

    // add PreferredPlacementDescriptors for labels on sequence, default or conditional flows to place them at source
    // side
    addEdgeLabelPlacementDescriptors(adapter)

    const hierarchicLayoutData = new HierarchicLayoutData()

    // mark nodes, edges and labels as either fixed or affected by the layout and configure port constraints and
    // incremental hints
    markFixedAndAffectedItems(adapter, hierarchicLayoutData, layoutOnlySelection)

    // mark associations and message flows as undirected so they have less impact on layering
    hierarchicLayoutData.edgeDirectedness = edge => {
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
        (isSubprocess(edge.sourceNode) && !(edge.sourcePort.style instanceof EventPortStyle)) ||
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
        node.style instanceof EventNodeStyle &&
        node.style.characteristic === EventCharacteristic.START &&
        graph.inDegree(node) === 0 &&
        (graph.getParent(node) === null || graph.getParent(node).style instanceof PoolNodeStyle)
      ) {
        layerConstraints.placeAtTop(node)
      }
    })
  }
}

/**
 * Adds a layer constraint which keeps the source node of the edge above the target node.
 * @param {LayerConstraintData} layerConstraints
 * @param {IEdge} edge
 * @param {IGraph} graph
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
 * @param {IGraph} graph
 * @param {INode} node
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
 * @param {HierarchicLayoutData} hierarchicLayoutData
 * @param {number} minimumEdgeLength
 */
function addMinimumEdgeLength(hierarchicLayoutData, minimumEdgeLength) {
  // each edge should have a minimum length so that all its labels can be placed on it one
  // after another with a minimum label-to-label distance
  const minLabelToLabelDistance = 5
  hierarchicLayoutData.edgeLayoutDescriptors = edge => {
    let minLength = 0
    edge.labels.forEach(label => {
      const labelSize = label.layout.bounds
      minLength += Math.max(labelSize.width, labelSize.height)
    })
    if (edge.labels.size > 1) {
      minLength += (edge.labels.size - 1) * minLabelToLabelDistance
    }

    return new HierarchicLayoutEdgeLayoutDescriptor({
      routingStyle: new HierarchicLayoutRoutingStyle(HierarchicLayoutEdgeRoutingStyle.ORTHOGONAL),
      minimumLength: Math.max(minLength, minimumEdgeLength),
      minimumFirstSegmentLength: 20,
      minimumLastSegmentLength: 20
    })
  }
}

/**
 * Determines whether or not the given node represents a sub-process.
 * @param {INode} node
 * @return {boolean}
 */
function isSubprocess(node) {
  return (
    node.style instanceof ActivityNodeStyle &&
    (node.style.activityType === ActivityType.SUB_PROCESS ||
      node.style.activityType === ActivityType.EVENT_SUB_PROCESS)
  )
}

/**
 * Determines whether or not the given edge represents a message flow.
 * @param {IEdge} edge
 * @return {boolean}
 */
function isMessageFlow(edge) {
  return edge.style instanceof BpmnEdgeStyle && edge.style.type === EdgeType.MESSAGE_FLOW
}

/**
 * Determines whether or not the given edge represents a sequence flow.
 * @param {IEdge} edge
 * @return {boolean}
 */
function isSequenceFlow(edge) {
  if (!(edge.style instanceof BpmnEdgeStyle)) {
    return false
  }
  const bpmnEdgeStyle = edge.style
  return (
    bpmnEdgeStyle.type === EdgeType.SEQUENCE_FLOW ||
    bpmnEdgeStyle.type === EdgeType.DEFAULT_FLOW ||
    bpmnEdgeStyle.type === EdgeType.CONDITIONAL_FLOW
  )
}

/**
 * Determines whether or not the given edge represents an association.
 * @param {IEdge} edge
 * @return {boolean}
 */
function isAssociation(edge) {
  if (!(edge.style instanceof BpmnEdgeStyle)) {
    return false
  }
  const bpmnEdgeStyle = edge.style
  return (
    bpmnEdgeStyle.type === EdgeType.ASSOCIATION ||
    bpmnEdgeStyle.type === EdgeType.BIDIRECTED_ASSOCIATION ||
    bpmnEdgeStyle.type === EdgeType.DIRECTED_ASSOCIATION
  )
}

/**
 * Adds node halos to reserve some space for labels.
 * @param {LayoutGraphAdapter} adapter
 * @param {IGraph} graph
 * @param {boolean} layoutOnlySelection
 */
function addNodeHalos(adapter, graph, layoutOnlySelection) {
  const nodeHalos = new Mapper()
  graph.nodes.forEach(node => {
    let top = 0.0
    let left = 0.0
    let bottom = 0.0
    let right = 0.0

    // for each port with an EventPortStyle extend the node halo to cover the ports render size
    node.ports.forEach(port => {
      if (port.style instanceof EventPortStyle) {
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

    nodeHalos.set(node, NodeHalo.create(top, left, bottom, right))
  })
  adapter.addDataProvider(INode.$class, NodeHalo.$class, NodeHalo.NODE_HALO_DP_KEY, nodeHalos)
}

/**
 * Checks whether or not the given label is considered for the layout.
 * @param {ILabel} label
 * @param {LayoutGraphAdapter} adapter
 * @param {boolean} layoutOnlySelection
 * @return {boolean}
 */
function isNodeLabelAffected(label, adapter, layoutOnlySelection) {
  if (INode.isInstance(label.owner)) {
    const node = label.owner
    const isInnerLabel = node.layout.contains(label.layout.orientedRectangleCenter)
    const isPool = node.style instanceof PoolNodeStyle
    const isChoreography = node.style instanceof ChoreographyNodeStyle
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
 * @param {LayoutGraphAdapter} adapter
 */
function addEdgeLabelPlacementDescriptors(adapter) {
  const atSourceDescriptor = new PreferredPlacementDescriptor({
    placeAlongEdge: LabelPlacements.AT_SOURCE_PORT,
    sideOfEdge: LabelPlacements.LEFT_OF_EDGE,
    angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  })
  const defaultDescriptor = new PreferredPlacementDescriptor({
    angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  })
  adapter.addDataProvider(
    ILabel.$class,
    YObject.$class,
    LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
    IMapper.fromDelegate(label => {
      const edgeType = label.owner.style.type
      if (
        edgeType === EdgeType.SEQUENCE_FLOW ||
        edgeType === EdgeType.DEFAULT_FLOW ||
        edgeType === EdgeType.CONDITIONAL_FLOW
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
 * @param {LayoutGraphAdapter} adapter
 * @param {HierarchicLayoutData} hierarchicLayoutData
 * @param {boolean} layoutOnlySelection
 */
function markFixedAndAffectedItems(adapter, hierarchicLayoutData, layoutOnlySelection) {
  if (layoutOnlySelection) {
    const affectedEdges = IMapper.fromDelegate(
      edge =>
        adapter.selectionModel.isSelected(edge) ||
        adapter.selectionModel.isSelected(edge.sourceNode) ||
        adapter.selectionModel.isSelected(edge.targetNode)
    )

    adapter.addDataProvider(
      INode.$class,
      YBoolean.$class,
      LayoutKeys.AFFECTED_NODES_DP_KEY,
      affectedEdges
    )

    // fix ports of unselected edges and edges at event ports
    adapter.addDataProvider(
      IEdge.$class,
      PortConstraint.$class,
      PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY,
      IMapper.fromDelegate(edge => {
        if (!affectedEdges.get(edge) || edge.sourcePort.style instanceof EventPortStyle) {
          return PortConstraint.create(getSide(edge, true))
        }
        return null
      })
    )
    adapter.addDataProvider(
      IEdge.$class,
      PortConstraint.$class,
      PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY,
      IMapper.fromDelegate(edge => {
        if (!affectedEdges.get(edge)) {
          return PortConstraint.create(getSide(edge, false))
        }
        return null
      })
    )

    // give core layout hints that selected nodes and edges should be incremental
    hierarchicLayoutData.incrementalHints.contextDelegate = (item, factory) => {
      if (INode.isInstance(item) && adapter.selectionModel.isSelected(item)) {
        return factory.createLayerIncrementallyHint(item)
      } else if (IEdge.isInstance(item) && affectedEdges.get(item)) {
        return factory.createSequenceIncrementallyHint(item)
      }
      return null
    }
    adapter.addDataProvider(
      ILabel.$class,
      YBoolean.$class,
      BpmnLayout.AFFECTED_LABELS_DP_KEY,
      IMapper.fromDelegate(label => {
        if (IEdge.isInstance(label.owner)) {
          return affectedEdges.get(label.owner)
        }
        if (INode.isInstance(label.owner)) {
          const node = label.owner
          const isInnerLabel = node.layout.contains(label.layout.orientedRectangleCenter)
          const isPool = node.style instanceof PoolNodeStyle
          const isChoreography = node.style instanceof ChoreographyNodeStyle
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
      IEdge.$class,
      PortConstraint.$class,
      PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY,
      IMapper.fromDelegate(edge => {
        if (edge.sourcePort.style instanceof EventPortStyle) {
          return PortConstraint.create(getSide(edge, true))
        }
        return null
      })
    )

    adapter.addDataProvider(
      ILabel.$class,
      YBoolean.$class,
      BpmnLayout.AFFECTED_LABELS_DP_KEY,
      IMapper.fromDelegate(label => {
        if (IEdge.isInstance(label.owner)) {
          return true
        }
        if (INode.isInstance(label.owner)) {
          const node = label.owner
          const isInnerLabel = node.layout.contains(label.layout.orientedRectangleCenter)
          const isPool = node.style instanceof PoolNodeStyle
          const isChoreography = node.style instanceof ChoreographyNodeStyle
          return !isInnerLabel && !isPool && !isChoreography
        }
        return false
      })
    )
  }
}

/**
 * Returns at which side of its source/target an edge should connect.
 * @param {IEdge} edge
 * @param {boolean} atSource
 * @return {PortSide}
 */
function getSide(edge, atSource) {
  const port = atSource ? edge.sourcePort : edge.targetPort
  if (!INode.isInstance(port.owner)) {
    return PortSide.ANY
  }
  const node = port.owner
  const relPortLocation = port.location.subtract(node.layout.center)

  // calculate relative port position scaled by the node size
  const sdx = relPortLocation.x / (node.layout.width / 2)
  const sdy = relPortLocation.y / (node.layout.height / 2)

  if (Math.abs(sdx) > Math.abs(sdy)) {
    // east or west
    return sdx < 0 ? PortSide.WEST : PortSide.EAST
  } else if (Math.abs(sdx) < Math.abs(sdy)) {
    return sdy < 0 ? PortSide.NORTH : PortSide.SOUTH
  }

  // port is somewhere at the diagonals of the node bounds
  // so we can't decide the port side based on the port location
  // better use the attached segment to decide on the port side
  return getSideFromSegment(edge, atSource)
}

/**
 * Returns at which side of its source an edge should connect considering the first/last segment..
 * @param {IEdge} edge
 * @param {boolean} atSource
 * @return {PortSide}
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
    return dx < 0 ? PortSide.WEST : PortSide.EAST
  }

  return dy < 0 ? PortSide.NORTH : PortSide.SOUTH
}
