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
  EdgeLabelPreferredPlacement,
  EdgePortCandidates,
  GenericLabelingData,
  GenericLayoutData,
  HierarchicalLayoutData,
  HierarchicalLayoutEdgeDescriptor,
  IEdge,
  IGraph,
  IGraphSelection,
  ILabel,
  IMapper,
  INode,
  Insets,
  LabelAlongEdgePlacements,
  LabelAngleReferences,
  LabelEdgeSides,
  LayerConstraintData,
  LayoutData,
  LayoutKeys,
  Mapper,
  PortSides
} from '@yfiles/yfiles'
import {
  ActivityNodeStyle,
  ActivityType,
  BpmnEdgeStyle,
  ChoreographyNodeStyle,
  ConversationNodeStyle,
  EventCharacteristic,
  EventNodeStyle,
  EventPortStyle,
  GatewayNodeStyle,
  BpmnEdgeType,
  PoolNodeStyle
} from './bpmn-view'
import { BpmnLabelProfitModel, BpmnLayout } from './BpmnLayout'
export default class BpmnLayoutData {
  _minimumEdgeLength = 20
  _startNodesFirst = false
  _compactMessageFlowLayering = false
  /**
   * Gets whether start nodes are pulled to the leftmost or topmost layer.
   * Defaults to false.
   */
  get startNodesFirst() {
    return this._startNodesFirst
  }
  /**
   * Sets whether start nodes are pulled to the leftmost or topmost layer.
   * Defaults to false.
   */
  set startNodesFirst(first) {
    this._startNodesFirst = first
  }
  /**
   * Gets whether message flows have only weak impact on the layering.
   * Having weak impact, message flows are more likely to be back edges. This often results in more compact layouts.
   * Defaults to false.
   */
  get compactMessageFlowLayering() {
    return this._compactMessageFlowLayering
  }
  /**
   * Sets whether message flows have only weak impact on the layering.
   * Having weak impact, message flows are more likely to be back edges. This often results in more compact layouts.
   * Defaults to false.
   */
  set compactMessageFlowLayering(compact) {
    this._compactMessageFlowLayering = compact
  }
  /**
   * Gets the minimum length of edges.
   * Defaults to 20.0.
   */
  get minimumEdgeLength() {
    return this._minimumEdgeLength
  }
  /**
   * Sets the minimum length of edges.
   * Defaults to 20.0.
   */
  set minimumEdgeLength(length) {
    this._minimumEdgeLength = length
  }
  create(graph, selection, layoutScope) {
    const data = new GenericLayoutData()
    const hierarchicalLayoutData = new HierarchicalLayoutData()
    const labelingData = new GenericLabelingData()
    // check if only selected elements should be laid out
    const layoutOnlySelection = layoutScope === 'SELECTED_ELEMENTS'
    // mark 'flow' edges, i.e. sequence flows, default flows and conditional flows
    data.addItemCollection(BpmnLayout.SEQUENCE_FLOW_EDGES_DATA_KEY).predicate = isSequenceFlow
    // mark boundary interrupting edges for the BalancingPortOptimizer
    data.addItemCollection(BpmnLayout.BOUNDARY_INTERRUPTING_EDGES_DATA_KEY).predicate = (edge) =>
      edge.sourcePort.style instanceof EventPortStyle
    // mark conversations, events and gateways so their port locations are adjusted
    data.addItemCollection(BpmnLayout.ADJUST_PORT_LOCATION_NODES_DATA_KEY).predicate = (node) =>
      node.style instanceof ConversationNodeStyle ||
      node.style instanceof EventNodeStyle ||
      node.style instanceof GatewayNodeStyle
    // add Insets around nodes with event ports or specific exterior labels, so the layout keeps space for the
    // event ports and labels as well
    addNodeMargins(hierarchicalLayoutData, graph, selection, layoutOnlySelection)
    // add PreferredPlacementDescriptors for labels on sequence, default or conditional flows to place them at source
    // side
    addEdgeLabelPlacementDescriptors(labelingData)
    // add a custom profits for BPMN labels
    labelingData.nodeLabelCandidateProcessors.mapperFunction = (_) =>
      BpmnLabelProfitModel.nodeLabelProfitDelegate
    // mark nodes, edges and labels as either fixed or affected by the layout and configure port candidates
    markFixedAndAffectedItems(
      data,
      hierarchicalLayoutData,
      labelingData,
      selection,
      layoutOnlySelection
    )
    // mark associations and message flows as undirected so they have less impact on layering
    hierarchicalLayoutData.edgeDirectedness = (edge) =>
      isMessageFlow(edge) || isAssociation(edge) ? 0 : 1
    // add layer constraints for start events, sub processes and message flows
    addLayerConstraints(
      graph,
      hierarchicalLayoutData,
      this.startNodesFirst,
      this.compactMessageFlowLayering
    )
    // add EdgeLayoutDescriptor to specify minimum edge length for edges
    addMinimumEdgeLength(hierarchicalLayoutData, this.minimumEdgeLength)
    // applies hierarchical layout configurations
    return data.combineWith(hierarchicalLayoutData).combineWith(labelingData)
  }
}
const addLayerConstraints = (
  graph,
  hierarchicalLayoutData,
  startNodesFirst,
  compactMessageFlowLayering
) => {
  // use layer constraints via HierarchicalLayoutData
  const layerConstraints = hierarchicalLayoutData.layerConstraints
  graph.edges.forEach((edge) => {
    if (isMessageFlow(edge) && !compactMessageFlowLayering) {
      // message flow layering compaction is disabled, we add a 'weak' same layer constraint, i.e. source node shall
      // be placed at least 0 layers above target node
      layerConstraints.placeInOrder(edge.sourceNode, edge.targetNode, 0, 1)
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
    graph.nodes.forEach((node) => {
      if (
        node.style instanceof EventNodeStyle &&
        node.style.characteristic === EventCharacteristic.START &&
        graph.inDegree(node) === 0 &&
        (graph.getParent(node) == null || graph.getParent(node).style instanceof PoolNodeStyle)
      ) {
        layerConstraints.placeAtTop(node)
      }
    })
  }
}
/**
 * Adds a layer constraint which keeps the source node of the edge above the target node.
 */
function addAboveLayerConstraint(layerConstraints, edge, graph) {
  const sourceNode = edge.sourceNode
  const targetNode = edge.targetNode
  const sourceNodes = []
  const targetNodes = []
  collectLeafNodes(graph, sourceNode, sourceNodes)
  collectLeafNodes(graph, targetNode, targetNodes)
  sourceNodes.forEach((source) => {
    targetNodes.forEach((target) => {
      layerConstraints.placeInOrder(source, target)
    })
  })
}
/**
 * Fills the given leaf-nodes list recursively.
 */
function collectLeafNodes(graph, node, leafNodes) {
  const children = graph.getChildren(node)
  if (children.size > 0) {
    children.forEach((child) => {
      collectLeafNodes(graph, child, leafNodes)
    })
  } else {
    leafNodes.push(node)
  }
}
/**
 * Adds a minimum length for each edge to make enough room for their labels.
 */
function addMinimumEdgeLength(hierarchicalLayoutData, minimumEdgeLength) {
  // each edge should have a minimum length so that all its labels can be placed on it one
  // after another with a minimum label-to-label distance
  const minLabelToLabelDistance = 5
  hierarchicalLayoutData.edgeDescriptors = (edge) => {
    let minLength = 0
    edge.labels.forEach((label) => {
      const labelSize = label.layout.bounds
      minLength += Math.max(labelSize.width, labelSize.height)
    })
    if (edge.labels.size > 1) {
      minLength += (edge.labels.size - 1) * minLabelToLabelDistance
    }
    return new HierarchicalLayoutEdgeDescriptor({
      minimumLength: Math.max(minLength, minimumEdgeLength),
      minimumFirstSegmentLength: 20,
      minimumLastSegmentLength: 20
    })
  }
}
/**
 * Determines whether the given node represents a sub-process.
 */
function isSubprocess(node) {
  return (
    node.style instanceof ActivityNodeStyle &&
    (node.style.activityType === ActivityType.SUB_PROCESS ||
      node.style.activityType === ActivityType.EVENT_SUB_PROCESS)
  )
}
/**
 * Determines whether the given edge represents a message flow.
 */
function isMessageFlow(edge) {
  return edge.style instanceof BpmnEdgeStyle && edge.style.type === BpmnEdgeType.MESSAGE_FLOW
}
/**
 * Determines whether the given edge represents a sequence flow.
 */
function isSequenceFlow(edge) {
  if (!(edge.style instanceof BpmnEdgeStyle)) {
    return false
  }
  const bpmnEdgeStyle = edge.style
  return (
    bpmnEdgeStyle.type === BpmnEdgeType.SEQUENCE_FLOW ||
    bpmnEdgeStyle.type === BpmnEdgeType.DEFAULT_FLOW ||
    bpmnEdgeStyle.type === BpmnEdgeType.CONDITIONAL_FLOW
  )
}
/**
 * Determines whether the given edge represents an association.
 */
function isAssociation(edge) {
  if (!(edge.style instanceof BpmnEdgeStyle)) {
    return false
  }
  const bpmnEdgeStyle = edge.style
  return (
    bpmnEdgeStyle.type === BpmnEdgeType.ASSOCIATION ||
    bpmnEdgeStyle.type === BpmnEdgeType.BIDIRECTED_ASSOCIATION ||
    bpmnEdgeStyle.type === BpmnEdgeType.DIRECTED_ASSOCIATION
  )
}
/**
 * Adds node halos to reserve some space for labels.
 */
function addNodeMargins(data, graph, selection, layoutOnlySelection) {
  const nodeMargins = new Mapper()
  graph.nodes.forEach((node) => {
    let top = 0.0
    let left = 0.0
    let bottom = 0.0
    let right = 0.0
    // for each port with an EventPortStyle extend the node halo to cover the ports render size
    node.ports.forEach((port) => {
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
      node.labels.forEach((label) => {
        if (isNodeLabelAffected(graph, selection, label, layoutOnlySelection)) {
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
    nodeMargins.set(node, new Insets(top, right, bottom, left))
  })
  data.nodeMargins = nodeMargins
}
/**
 * Checks whether the given label is considered for the layout.
 */
function isNodeLabelAffected(graph, selection, label, layoutOnlySelection) {
  if (label.owner instanceof INode) {
    const node = label.owner
    const isInnerLabel = node.layout.contains(label.layout.center)
    const isPool = node.style instanceof PoolNodeStyle
    const isChoreography = node.style instanceof ChoreographyNodeStyle
    const isGroupNode = graph.isGroupNode(node)
    return (
      !isInnerLabel &&
      !isPool &&
      !isChoreography &&
      !isGroupNode &&
      (!layoutOnlySelection || selection.includes(node))
    )
  }
  return false
}
/**
 * Adds preferred placement for each edge.
 */
function addEdgeLabelPlacementDescriptors(labelingData) {
  const atSourceDescriptor = new EdgeLabelPreferredPlacement({
    placementAlongEdge: LabelAlongEdgePlacements.AT_SOURCE_PORT,
    edgeSide: LabelEdgeSides.LEFT_OF_EDGE,
    angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  })
  const defaultDescriptor = new EdgeLabelPreferredPlacement({
    angleReference: LabelAngleReferences.RELATIVE_TO_EDGE_FLOW
  })
  labelingData.edgeLabelPreferredPlacements = (label) => {
    const labelOwner = label.owner
    const edgeType = labelOwner.style.type
    if (
      edgeType === BpmnEdgeType.SEQUENCE_FLOW ||
      edgeType === BpmnEdgeType.DEFAULT_FLOW ||
      edgeType === BpmnEdgeType.CONDITIONAL_FLOW
    ) {
      // labels on sequence, default and conditional flow edges should be placed at the source side.
      return atSourceDescriptor
    }
    return defaultDescriptor
  }
}
/**
 * Marks which items are fixed or affected.
 */
function markFixedAndAffectedItems(
  data,
  hierarchicalLayoutData,
  labelingData,
  selection,
  layoutOnlySelection
) {
  if (layoutOnlySelection) {
    const affectedEdges = IMapper.fromHandler(
      (edge) =>
        selection.includes(edge) ||
        selection.includes(edge.sourceNode) ||
        selection.includes(edge.targetNode)
    )
    data.addItemMapping(LayoutKeys.ROUTE_EDGES_DATA_KEY).mapper = affectedEdges
    // fix ports of unselected edges and edges at event ports
    hierarchicalLayoutData.ports.sourcePortCandidates = (edge) =>
      !affectedEdges.get(edge) || edge.sourcePort.style instanceof EventPortStyle
        ? new EdgePortCandidates().addFreeCandidate(getSide(edge, true))
        : null
    hierarchicalLayoutData.ports.targetPortCandidates = (edge) =>
      !affectedEdges.get(edge)
        ? new EdgePortCandidates().addFreeCandidate(getSide(edge, false))
        : null
    // give core layout hints that selected nodes and edges should be incremental
    hierarchicalLayoutData.incrementalNodes = (item) => selection.includes(item)
    hierarchicalLayoutData.incrementalEdges = (edge) => affectedEdges.get(edge) ?? false
    labelingData.scope.nodeLabels = (label) => {
      const node = label.owner
      const isInnerLabel = node.layout.contains(label.layout.center)
      const isPool = node.style instanceof PoolNodeStyle
      const isChoreography = node.style instanceof ChoreographyNodeStyle
      return !isInnerLabel && !isPool && !isChoreography && selection.includes(node)
    }
    labelingData.scope.edgeLabels = (label) => affectedEdges.get(label.owner) ?? false
  } else {
    // fix source port of edges at event ports
    hierarchicalLayoutData.ports.sourcePortCandidates = (edge) =>
      edge.sourcePort.style instanceof EventPortStyle
        ? new EdgePortCandidates().addFreeCandidate(getSide(edge, true))
        : null
    labelingData.scope.nodeLabels = (label) => {
      const node = label.owner
      const isInnerLabel = node.layout.contains(label.layout.center)
      const isPool = node.style instanceof PoolNodeStyle
      const isChoreography = node.style instanceof ChoreographyNodeStyle
      return !isInnerLabel && !isPool && !isChoreography
    }
    labelingData.scope.edgeLabels = () => true
  }
}
/**
 * Returns at which side of its source/target an edge should connect.
 */
function getSide(edge, atSource) {
  const port = atSource ? edge.sourcePort : edge.targetPort
  if (!(port.owner instanceof INode)) {
    return PortSides.ANY
  }
  const node = port.owner
  const relPortLocation = port.location.subtract(node.layout.center)
  // calculate relative port position scaled by the node size
  const sdx = relPortLocation.x / (node.layout.width / 2)
  const sdy = relPortLocation.y / (node.layout.height / 2)
  if (Math.abs(sdx) > Math.abs(sdy)) {
    // left or right
    return sdx < 0 ? PortSides.LEFT : PortSides.RIGHT
  } else if (Math.abs(sdx) < Math.abs(sdy)) {
    return sdy < 0 ? PortSides.TOP : PortSides.BOTTOM
  }
  // port is somewhere at the diagonals of the node bounds
  // so we can't decide the port side based on the port location
  // better use the attached segment to decide on the port side
  return getSideFromSegment(edge, atSource)
}
/**
 * Returns at which side of its source an edge should connect considering the first/last segment.
 */
function getSideFromSegment(edge, atSource) {
  const port = atSource ? edge.sourcePort : edge.targetPort
  const opposite = atSource ? edge.targetPort : edge.sourcePort
  const from = port.location
  const bend = edge.bends.at(atSource ? 0 : -1)
  const to = bend?.location ?? opposite.location
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) > Math.abs(dy)) {
    // right or left
    return dx < 0 ? PortSides.LEFT : PortSides.RIGHT
  }
  return dy < 0 ? PortSides.TOP : PortSides.BOTTOM
}
