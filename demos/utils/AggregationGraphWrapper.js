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
  AdjacencyTypes,
  BaseClass,
  BendEventArgs,
  ContextLookup,
  EdgeDefaults,
  EdgeEventArgs,
  FilteredGraphWrapper,
  Graph,
  GraphWrapperBase,
  HashMap,
  IBend,
  IContextLookupChainLink,
  IEdge,
  IEdgeStyle,
  IGraph,
  ILabel,
  ILabelModelParameter,
  ILabelOwner,
  ILabelStyle,
  IListEnumerable,
  ILookup,
  ILookupDecorator,
  IMutablePoint,
  IMutableRectangle,
  INode,
  INodeStyle,
  IPoint,
  IPort,
  IPortLocationModelParameter,
  IPortOwner,
  IPortStyle,
  IPositionHandler,
  IReshapeHandler,
  ItemChangedEventArgs,
  ItemEventArgs,
  LabelEventArgs,
  List,
  ListEnumerable,
  MutablePoint,
  MutableRectangle,
  NodeDefaults,
  NodeEventArgs,
  OrientedRectangle,
  Point,
  PortEventArgs,
  Size
} from '@yfiles/yfiles'

/**
 * Determines what kind of edges should be created when replacing original edges with aggregation
 * edges in calls to methods of the {@link AggregationGraphWrapper}.
 */
export const EdgeReplacementPolicy = { NONE: 0, UNDIRECTED: 1, DIRECTED: 2 }

/**
 * An IGraph implementation that wraps another graph and can replace some of its items by other items.
 *
 * More precisely, a set of nodes can be aggregated to a new node with the {@link AggregationGraphWrapper.aggregate}
 * method. This will hide the set of nodes and create a new aggregation node while replacing adjacent edges with aggregation edges.
 *
 *
 * Items of the wrapped graph ("original graph") are called __original items__ while the temporary items that are
 * created for aggregation are called __aggregation items__.
 *
 *
 * This class implements a concept similar to grouping and folding. The conceptual difference is that with folding the
 * group nodes remain in the graph while the group is in expanded state. Contrary, with the AggregationGraphWrapper the
 * aggregation nodes are only in the graph when the nodes are aggregated. The difference in the implementation is that
 * the AggregationGraphWrapper reuses all original graph items, ensuring reference equality between items of the wrapped
 * graph and items of the AggregationGraphWrapper.
 *
 *
 * Note that this implementation does not support editing user gestures, e.g. with the GraphEditorInputMode.
 *
 *
 * Note also that this instance will register listeners with the wrapped graph instance, so
 * {@link AggregationGraphWrapper.dispose} should be called if this instance is not used any more.
 */
export class AggregationGraphWrapper extends GraphWrapperBase {
  // This implementation combines a filtered graph (for hiding items) and additional aggregation items contained in
  // the aggregationNodes and aggregationEdges lists.
  // Events are forwarded from the wrapped graph to the filtered graph to this graph.
  // Most IGraph methods are overridden and "multiplex" between the filtered graph and the aggregation items.
  $filteredGraph

  // the set of hidden nodes and edges
  $filteredOriginalNodes

  $filteredAggregationItems

  aggregationNodes
  $aggregationEdges
  $sourcePortToAggregationEdge
  $targetPortToAggregationEdge

  // live views of the currently visible items
  $nodes
  $edges
  $labels
  $ports

  $aggregationNodeDefaults
  $aggregationEdgeDefaults
  $lookupDecorator

  /**
   * Creates a new instance of this graph wrapper.
   * @param graph The graph to be wrapped ("original graph").
   * @throws If the `graph` is another {@link AggregationGraphWrapper}
   */
  constructor(graph) {
    super(graph)
    if (graph instanceof AggregationGraphWrapper) {
      throw new Error(
        'ArgumentError: Affected parameter graph: Cannot wrap another AggregationGraphWrapper'
      )
    }
    this.onGraphChanged(null, this.wrappedGraph)

    this.edgeReplacementPolicy = EdgeReplacementPolicy.UNDIRECTED

    this.$lookupDecorator = new AggregationLookupDecorator(this)

    this.$filteredOriginalNodes = new Set()

    this.$filteredAggregationItems = new Set()
    this.aggregationNodes = new List()
    this.$aggregationEdges = new List()
    this.$sourcePortToAggregationEdge = new Map()
    this.$targetPortToAggregationEdge = new Map()

    this.$nodes = new ListEnumerable(
      this.$filteredGraph.nodes.concat(
        this.aggregationNodes.filter(this.$aggregationItemPredicate.bind(this))
      )
    )
    this.$edges = new ListEnumerable(
      this.$filteredGraph.edges.concat(
        this.$aggregationEdges.filter(this.$aggregationItemPredicate.bind(this))
      )
    )
    this.$ports = new ListEnumerable(
      this.$nodes.flatMap((node) => node.ports).concat(this.$edges.flatMap((edge) => edge.ports))
    )
    this.$labels = new ListEnumerable(
      this.$nodes
        .flatMap((node) => node.labels)
        .concat(
          this.$edges
            .flatMap((edge) => edge.labels)
            .concat(this.$ports.flatMap((port) => port.labels))
        )
    )
  }

  get nodes() {
    return this.$nodes
  }

  get edges() {
    return this.$edges
  }

  get labels() {
    return this.$labels
  }

  get ports() {
    return this.$ports
  }

  /**
   * Sets what kind of edges should be created when replacing original edges with aggregation edges.
   * The default value is {@link EdgeReplacementPolicy.UNDIRECTED}.
   */
  edgeReplacementPolicy = EdgeReplacementPolicy.NONE

  get aggregationNodeDefaults() {
    if (!this.$aggregationNodeDefaults) {
      this.$aggregationNodeDefaults = new NodeDefaults()
    }
    return this.$aggregationNodeDefaults
  }

  set aggregationNodeDefaults(value) {
    this.$aggregationNodeDefaults = value
  }

  get aggregationEdgeDefaults() {
    if (!this.$aggregationEdgeDefaults) {
      this.$aggregationEdgeDefaults = new EdgeDefaults()
    }
    return this.$aggregationEdgeDefaults
  }

  set aggregationEdgeDefaults(value) {
    this.$aggregationEdgeDefaults = value
  }

  /**
   * Calls the base method with the {@link AggregationGraphWrapper.$filteredGraph} instead of the passed graph for correct event forwarding.
   */
  onGraphChanged(oldGraph, newGraph) {
    if (!oldGraph) {
      this.$filteredGraph = new FilteredGraphWrapper(
        this.wrappedGraph,
        this.$nodePredicate.bind(this),
        this.$edgePredicate.bind(this)
      )
      super.onGraphChanged(null, this.$filteredGraph)
    } else if (!newGraph) {
      this.$filteredGraph = null
      super.onGraphChanged(this.$filteredGraph, null)
    }
  }

  dispose() {
    this.$filteredGraph.dispose()
    super.dispose()
  }

  $aggregationItemPredicate(item) {
    return !this.$filteredAggregationItems.has(item)
  }

  $nodePredicate(node) {
    return !this.$filteredOriginalNodes || !this.$filteredOriginalNodes.has(node)
  }

  $edgePredicate(edge) {
    return true
  }

  /**
   * Hides the `portOwner` and all items depending on it and raises the according removed events.
   * For nodes, their labels, ports and adjacent edges are hidden. For edges, their labels, ports and bends are hidden.
   */
  $hide(portOwner) {
    const aggregationNode = portOwner instanceof AggregationNode ? portOwner : null
    if (aggregationNode) {
      const oldIsGroupNode = this.isGroupNode(aggregationNode)
      const oldParent = this.getParent(aggregationNode)
      this.$hideAdjacentEdges(aggregationNode)
      this.$filteredAggregationItems.add(aggregationNode)
      this.$raiseLabelRemovedEvents(aggregationNode)
      this.$raisePortRemovedEvents(aggregationNode)
      this.onNodeRemoved(new NodeEventArgs(aggregationNode, oldParent, oldIsGroupNode))
      return
    }

    const aggregationEdge = portOwner instanceof AggregationEdge ? portOwner : null
    if (aggregationEdge) {
      this.$hideAdjacentEdges(aggregationEdge)
      this.$filteredAggregationItems.add(aggregationEdge)
      this.$raiseLabelRemovedEvents(aggregationEdge)
      this.$raisePortRemovedEvents(aggregationEdge)
      this.onEdgeRemoved(new EdgeEventArgs(aggregationEdge))
      return
    }

    // hide adjacent aggregation edges (which are not hidden by filtered graph)
    this.aggregationEdgesAt(portOwner, AdjacencyTypes.ALL).forEach((edge) => {
      this.$hide(edge)
    })
    this.$filteredOriginalNodes.add(portOwner)
    this.$predicateChanged(portOwner)
  }

  $hideAdjacentEdges(portOwner) {
    this.edgesAt(portOwner, AdjacencyTypes.ALL).forEach((edge) => this.$hide(edge))
  }

  /**
   * Shows an item, their labels/ports/bends, and their adjacent edges. Raises all necessary events.
   */
  $show(item) {
    if (item instanceof AggregationNode) {
      const aggregationNode = item
      this.$filteredAggregationItems.delete(aggregationNode)
      this.onNodeCreated(
        new NodeEventArgs(
          aggregationNode,
          this.getParent(aggregationNode),
          this.isGroupNode(aggregationNode)
        )
      )
      this.$raisePortAddedEvents(aggregationNode)
      this.$showAdjacentEdges(aggregationNode)
      this.$raiseLabelAddedEvents(aggregationNode)
      return
    }

    if (item instanceof AggregationEdge) {
      const aggregationEdge = item
      this.$filteredAggregationItems.delete(aggregationEdge)
      this.onEdgeCreated(new EdgeEventArgs(aggregationEdge))
      this.$raisePortAddedEvents(aggregationEdge)
      this.$showAdjacentEdges(aggregationEdge)
      this.$raiseLabelAddedEvents(aggregationEdge)
      return
    }

    this.$filteredOriginalNodes.delete(item)
    this.$predicateChanged(item)
    this.$showAdjacentEdges(item)
  }

  $showAdjacentEdges(portOwner) {
    // - cannot use EdgesAt() here, since hidden edges are not considered there
    const adjacentEdges = this.$edges.filter(
      (edge) =>
        portOwner.ports.includes(edge.sourcePort) || portOwner.ports.includes(edge.targetPort)
    )
    for (const edge of adjacentEdges) {
      if (this.ports.includes(edge.sourcePort) && this.ports.includes(edge.targetPort)) {
        this.$show(edge)
      }
    }
  }

  $raiseLabelAddedEvents(labelOwner) {
    for (const label of labelOwner.labels) {
      this.onLabelAdded(new LabelEventArgs(label, labelOwner))
    }
  }

  $raisePortAddedEvents(portOwner) {
    for (const port of portOwner.ports) {
      this.onPortAdded(new PortEventArgs(port, portOwner))
      this.$raiseLabelAddedEvents(port)
    }
  }

  $raiseLabelRemovedEvents(labelOwner) {
    for (const label of labelOwner.labels) {
      this.onLabelRemoved(new LabelEventArgs(label, labelOwner))
    }
  }

  $raisePortRemovedEvents(portOwner) {
    for (const port of portOwner.ports) {
      this.$raiseLabelRemovedEvents(port)
      this.onPortRemoved(new PortEventArgs(port, portOwner))
    }
  }

  $predicateChanged(item) {
    if (item instanceof INode) {
      this.$filteredGraph.nodePredicateChanged(item)
    } else if (item instanceof IEdge) {
      this.$filteredGraph.edgePredicateChanged(item)
    }
  }

  /**
   * Aggregates the `nodes` to a new aggregation node.
   * This temporarily removes the `nodes` together with their labels, ports, and adjacent edges. Then a new
   * aggregation node is created and replacement edges for all removed edges are created: for each edge between a node
   * in `nodes` and a node not in `nodes` a new edge is created. If this would lead to multiple
   * edges between the aggregation node and another node, only one edge (or two, see
   * {@link AggregationGraphWrapper.edgeReplacementPolicy}) is created.
   * @param nodes The nodes to be temporarily removed.
   * @param layout The layout for the new aggregation node or `null`
   * @param style The style for the new aggregation node or `null`
   * @param tag The style for the new aggregation node or `null`
   * @returns A new aggregation node.
   * @throws Any of the `nodes` is not in the graph.
   * @see {@link AggregationGraphWrapper.separate}
   */
  aggregate(nodes, layout, style, tag) {
    const badNode = nodes.find((node) => !this.contains(node))
    if (badNode != null) {
      throw new Error(
        `ArgumentError: Affected parameter nodes: Cannot aggregate node ${badNode} that is not in this graph.`
      )
    }

    const nodeLayout = layout
      ? new MutableRectangle(layout)
      : new MutableRectangle(Point.ORIGIN, this.aggregationNodeDefaults.size)
    const nodeStyle = style || this.aggregationNodeDefaults.getStyleInstance()
    const aggregatedNodes = new List(nodes)
    const aggregationNode = new AggregationNode(this, aggregatedNodes, nodeLayout, nodeStyle)
    aggregationNode.tag = tag || null
    const parent = this.groupingSupport.getNearestCommonAncestor(nodes)
    if (parent) {
      aggregationNode.parent = parent
      const aggregationNodeParent = parent instanceof AggregationNode ? parent : null
      if (aggregationNodeParent) {
        aggregationNodeParent.children.add(aggregationNode)
      }
    }

    this.aggregationNodes.add(aggregationNode)
    this.onNodeCreated(new ItemEventArgs(aggregationNode))

    if (this.edgeReplacementPolicy !== EdgeReplacementPolicy.NONE) {
      this.$replaceAdjacentEdges(nodes, aggregationNode)
    }

    // hide not until here, so old graph structure is still intact when replacing edges
    for (const node of nodes) {
      this.$hide(node)
    }

    return aggregationNode
  }

  /**
   * Replaces adjacent edges by new aggregation edges. Prevents duplicate edges following {@link AggregationGraphWrapper.edgeReplacementPolicy}.
   */
  $replaceAdjacentEdges(nodes, aggregationNode) {
    const edgesAreDirected = this.edgeReplacementPolicy === EdgeReplacementPolicy.DIRECTED
    const outgoingReplacementEdges = new HashMap()
    const incomingReplacementEdges = edgesAreDirected ? new HashMap() : outgoingReplacementEdges
    for (const node of nodes) {
      this.$replaceEdges(
        AdjacencyTypes.OUTGOING,
        node,
        aggregationNode,
        nodes,
        outgoingReplacementEdges
      )
      this.$replaceEdges(
        AdjacencyTypes.INCOMING,
        node,
        aggregationNode,
        nodes,
        incomingReplacementEdges
      )
    }

    // raise edge created events not until here, so the aggregated items are complete
    for (const edge of outgoingReplacementEdges.values) {
      this.onEdgeCreated(new EdgeEventArgs(edge))
    }

    if (edgesAreDirected) {
      for (const edge of incomingReplacementEdges.values) {
        this.onEdgeCreated(new EdgeEventArgs(edge))
      }
    }
  }

  $replaceEdges(adjacencyType, node, aggregationPortOwner, items, replacementEdges) {
    const adjacentEdges = this.edgesAt(node, adjacencyType).toList()
    for (const edge of adjacentEdges) {
      const isIncoming = adjacencyType === AdjacencyTypes.INCOMING
      const otherPort = isIncoming ? edge.sourcePort : edge.targetPort

      const otherPortOwner = otherPort.owner
      if (items.includes(otherPortOwner)) {
        // don't create aggregation edges for edges between aggregated items
        continue
      }
      const existingReplacementEdge = replacementEdges.get(otherPortOwner)
      if (existingReplacementEdge) {
        existingReplacementEdge.aggregatedEdges.add(edge)
        continue
      }

      if (edge instanceof AggregationEdge) {
        // otherwise the edge is automatically hidden by filtered graph
        this.$hide(edge)
      }

      const replacementEdge = this.$replaceEdge(edge, aggregationPortOwner, otherPort, isIncoming)
      replacementEdges.set(otherPortOwner, replacementEdge)
    }
  }

  $replaceEdge(edge, newPortOwner, otherPort, isIncoming) {
    const aggregationPort = this.addPort(newPortOwner)
    let replacementEdge
    if (isIncoming) {
      replacementEdge = this.$createAggregationEdge(otherPort, aggregationPort)
    } else {
      replacementEdge = this.$createAggregationEdge(aggregationPort, otherPort)
    }

    replacementEdge.aggregatedEdges.add(edge)
    return replacementEdge
  }

  /**
   * Separates nodes again that were previously aggregated via {@link AggregationGraphWrapper.aggregate}.
   * Removes the aggregation node permanently together with its labels, ports, and adjacent edges. Then inserts the
   * items that were temporarily removed in {@link AggregationGraphWrapper.aggregate} again.
   * @param node The aggregation node to separate.
   * @throws The `node` is not in the graph or is currently hidden or is not an aggregation node.
   */
  separate(node) {
    if (!(node instanceof AggregationNode)) {
      throw new Error(
        `ArgumentError: Affected parameter node: Cannot separate original node ${node}.`
      )
    }
    if (!this.contains(node)) {
      if (this.aggregationNodes.includes(node)) {
        throw new Error(
          `ArgumentError: Affected parameter node: Cannot separate aggregation node ${node}, because it is aggregated by another node.`
        )
      }
      throw new Error(
        `ArgumentError: Affected parameter node: Cannot separate aggregation node ${node} that is not in this graph.`
      )
    }

    const aggregationNode = node

    const adjacentEdges = this.edgesAt(aggregationNode, AdjacencyTypes.ALL).toList()
    for (const edge of adjacentEdges) {
      this.$removeAggregationEdge(edge)
    }

    this.$removeAggregationNode(aggregationNode)
    for (const aggregatedNode of aggregationNode.aggregatedNodes) {
      this.$show(aggregatedNode)
    }

    for (const edge of adjacentEdges) {
      this.$showOrRemoveAggregatedEdges(edge)
    }

    if (this.edgeReplacementPolicy !== EdgeReplacementPolicy.NONE) {
      this.$replaceMissingEdges(aggregationNode)
    }
  }

  $showOrRemoveAggregatedEdges(replacedEdge) {
    for (const aggregatedEdge of replacedEdge.aggregatedEdges) {
      // manually show aggregated AggregationEdges, other edges are handled by filtered graph
      if (this.contains(replacedEdge.sourcePort) && this.contains(replacedEdge.targetPort)) {
        this.$show(aggregatedEdge)
      } else {
        this.$removeAggregationEdge(replacedEdge)
      }
    }
  }

  /**
   * When nodes are separated in a different order they were aggregated, we need to create new aggregation edges for the nodes that were just expanded.
   */
  $replaceMissingEdges(aggregationNode) {
    const edgesAreDirected = this.edgeReplacementPolicy === EdgeReplacementPolicy.DIRECTED
    const aggregatedNodes = aggregationNode.aggregatedNodes
    for (const node of aggregatedNodes) {
      const outgoingReplacementEdges = new HashMap()
      const incomingReplacementEdges = edgesAreDirected ? new HashMap() : outgoingReplacementEdges
      this.$replaceMissingEdgesCore(AdjacencyTypes.OUTGOING, node, outgoingReplacementEdges)
      this.$replaceMissingEdgesCore(AdjacencyTypes.INCOMING, node, incomingReplacementEdges)

      // raise edge created events not until here, so the aggregated items are complete
      for (const edge of outgoingReplacementEdges.values) {
        this.onEdgeCreated(new EdgeEventArgs(edge))
      }

      if (edgesAreDirected) {
        for (const edge of incomingReplacementEdges.values) {
          this.onEdgeCreated(new EdgeEventArgs(edge))
        }
      }
    }
  }

  $replaceMissingEdgesCore(adjacencyType, node, seenNodes) {
    const isIncoming = adjacencyType === AdjacencyTypes.INCOMING

    let edgesAt = this.$aggregationEdges.filter((edge) =>
      node.ports.includes(isIncoming ? edge.targetPort : edge.sourcePort)
    )

    if (!this.isAggregationItem(node)) {
      edgesAt = edgesAt.concat(super.edgesAt(node, AdjacencyTypes.ALL))
    }

    for (const edge of edgesAt.toList()) {
      if (this.contains(edge)) {
        // is already a proper edge
        continue
      }

      const thisPort = isIncoming ? edge.targetPort : edge.sourcePort
      const otherPort = isIncoming ? edge.sourcePort : edge.targetPort
      // the node is contained in another aggregation node -> find it
      let otherNode
      if (!!otherPort && otherPort.owner instanceof INode) {
        otherNode = this.$findAggregationNode(otherPort.owner)
      }
      if (!otherNode || !this.contains(otherNode)) {
        continue
      }

      let aggregationEdge = seenNodes.get(otherNode)
      if (aggregationEdge) {
        // we already created an edge between this and the other node
        aggregationEdge.aggregatedEdges.add(edge)
        continue
      }

      aggregationEdge = this.$replaceEdge(edge, otherNode, thisPort, isIncoming)
      seenNodes.set(otherNode, aggregationEdge)
    }
  }

  $findAggregationNode(node) {
    return this.aggregationNodes.find((n) => n.aggregatedNodes.includes(node))
  }

  /**
   * Separates all aggregation nodes such that this graph contains exactly the same items as the {@link GraphWrapperBase.wrappedGraph}.
   */
  separateAll() {
    do {
      const visibleNodes = this.aggregationNodes
        .filter(this.$aggregationItemPredicate.bind(this))
        .toList()
      for (const aggregationNode of visibleNodes) {
        this.separate(aggregationNode)
      }
    } while (this.aggregationNodes.size > 0)
  }

  /**
   * Returns `true` iff the `item` is an aggregation item and therefore not contained in the wrapped graph.
   * Does not check if the item is currently {@link AggregationGraphWrapper.contains contained} in the graph or whether
   * the items was created by this graph instance.
   * @param item The item to check.
   * @returns `true` iff the `item` is an aggregation item.
   */
  isAggregationItem(item) {
    return (
      item instanceof AggregationNode ||
      item instanceof AggregationEdge ||
      item instanceof AggregationLabel ||
      item instanceof AggregationPort
    )
  }

  /**
   * Returns the items that are directly aggregated by the `item`.
   *
   * In contrast to {@link AggregationGraphWrapper.getAllAggregatedOriginalItems} this method returns both original as
   * well as aggregation items, but only direct descendants in the aggregation hierarchy.
   *
   *
   * `item` doesn't need to be {@link AggregationGraphWrapper.contains contained} currently but might be
   * aggregated in another item.
   *
   * @param item The aggregation item.
   * @returns The items that are aggregated by the `item`. If an aggregation node is passed, this will return
   * the aggregated nodes. If an aggregation edge is passed, this will return the edges it replaces. Otherwise an empty
   * enumerable will be returned. The enumerable may contain both aggregation items as well as original items.
   */
  getAggregatedItems(item) {
    if (item instanceof AggregationNode) {
      return new ListEnumerable(item.aggregatedNodes)
    }

    if (item instanceof AggregationEdge) {
      return new ListEnumerable(item.aggregatedEdges)
    }

    return IListEnumerable.EMPTY
  }

  /**
   * Returns the (recursively) aggregated original items of the `item`.
   * In contrast to {@link AggregationGraphWrapper.getAggregatedItems} this method returns only original items, but also
   * items recursively nested in the aggregation hierarchy.
   * @param item The aggregation item.
   * @returns A list of items of the {@link GraphWrapperBase.wrappedGraph} that is either directly contained in the
   * `item` or recursively in any contained aggregation items. This list consists only of items of the wrapped graph.
   * @see {@link AggregationGraphWrapper.getAggregatedItems}
   */
  getAllAggregatedOriginalItems(item) {
    const result = new List()
    const aggregatedItems = this.getAggregatedItems(item)
    for (const aggregatedItem of aggregatedItems) {
      if (this.isAggregationItem(aggregatedItem)) {
        result.addRange(this.getAllAggregatedOriginalItems(aggregatedItem))
      } else {
        result.add(aggregatedItem)
      }
    }
    return new ListEnumerable(result)
  }

  /**
   * Removes the given item from the graph.
   * If `item` is an aggregation node or aggregation edge, all aggregated items are removed as well.
   * @param item The item to remove.
   */
  remove(item) {
    if (!this.contains(item)) {
      throw new Error('ArgumentError: Affected parameter item: Item is not in this graph.')
    }
    this.$removeCore(item)
  }

  $removeCore(item) {
    const aggregationNode = item instanceof AggregationNode ? item : null
    if (aggregationNode) {
      if (aggregationNode.graph !== this) {
        return
      }
      this.$removeAggregationNode(aggregationNode)
      for (const aggregatedNode of aggregationNode.aggregatedNodes) {
        // we can remove the node without checking if it is in the graph
        this.$removeCore(aggregatedNode)
      }
      return
    }

    const aggregationEdge = item instanceof AggregationEdge ? item : null
    if (aggregationEdge) {
      if (aggregationEdge.graph !== this) {
        return
      }
      this.$removeAggregationEdge(aggregationEdge)

      for (const aggregatedEdge of aggregationEdge.aggregatedEdges) {
        this.$removeCore(aggregatedEdge)
      }

      this.$cleanupPort(aggregationEdge.sourcePort)
      this.$cleanupPort(aggregationEdge.targetPort)
      return
    }

    if (item instanceof AggregationBend) {
      this.$removeAggregationBend(item)
    } else if (item instanceof AggregationPort) {
      this.$removeAggregationPort(item)
    } else if (item instanceof AggregationLabel) {
      this.$removeAggregationLabel(item)
    } else {
      super.remove(item)
    }
  }

  $cleanupPort(port) {
    const isAggregationItem = this.isAggregationItem(port)
    let tmp
    // check the auto-cleanup policy to apply
    const autoCleanUp = (
      isAggregationItem
        ? this.aggregationNodeDefaults
        : this.isGroupNode((tmp = port.owner) instanceof INode ? tmp : null)
          ? this.wrappedGraph.groupNodeDefaults
          : this.wrappedGraph.nodeDefaults
    ).ports.autoCleanUp
    if (!autoCleanUp) {
      return
    }
    let edgesAtPort = this.$aggregationEdges.filter(
      (edge) => edge.sourcePort === port || edge.targetPort === port
    ).size
    if (!isAggregationItem) {
      edgesAtPort += super.edgesAt(port, AdjacencyTypes.ALL).size
    }
    if (edgesAtPort === 0) {
      this.$removeCore(port)
    }
  }

  $removeAggregationNode(aggregationNode) {
    for (const port of aggregationNode.ports.toList()) {
      this.$removeAggregationPort(port)
    }
    for (const label of aggregationNode.labels.toList()) {
      this.$removeAggregationLabel(label)
    }
    const oldIsGroupNode = this.isGroupNode(aggregationNode)
    const oldParent = this.getParent(aggregationNode)
    this.aggregationNodes.remove(aggregationNode)
    aggregationNode.graph = null
    this.onNodeRemoved(new NodeEventArgs(aggregationNode, oldParent, oldIsGroupNode))
  }

  $removeAggregationEdge(aggregationEdge) {
    for (const label of aggregationEdge.labels.toList()) {
      this.$removeAggregationLabel(label)
    }
    for (const port of aggregationEdge.ports.toList()) {
      this.$removeAggregationPort(port)
    }
    for (const bend of aggregationEdge.bends.toList()) {
      this.$removeAggregationBend(bend)
    }
    this.$aggregationEdges.remove(aggregationEdge)
    this.$sourcePortToAggregationEdge.delete(aggregationEdge.sourcePort)
    this.$targetPortToAggregationEdge.delete(aggregationEdge.targetPort)
    this.$filteredAggregationItems.delete(aggregationEdge)
    aggregationEdge.graph = null
    this.onEdgeRemoved(new EdgeEventArgs(aggregationEdge))
  }

  $removeAggregationBend(aggregationBend) {
    const bendList = aggregationBend.owner.$bends
    const index = bendList.indexOf(aggregationBend)
    bendList.remove(aggregationBend)
    aggregationBend.graph = null
    this.onBendRemoved(new BendEventArgs(aggregationBend, aggregationBend.owner, index))
  }

  $removeAggregationPort(aggregationPort) {
    for (const edge of this.edgesAt(aggregationPort, AdjacencyTypes.ALL).toList()) {
      this.$removeAggregationEdge(edge)
    }
    for (const label of aggregationPort.labels.toList()) {
      this.$removeAggregationLabel(label)
    }
    aggregationPort.owner.$ports.remove(aggregationPort)
    aggregationPort.graph = null
    this.onPortRemoved(new PortEventArgs(aggregationPort, aggregationPort.owner))
  }

  $removeAggregationLabel(aggregationLabel) {
    aggregationLabel.owner.$labels.remove(aggregationLabel)
    aggregationLabel.graph = null
    this.onLabelRemoved(new LabelEventArgs(aggregationLabel, aggregationLabel.owner))
  }

  edgesAt(owner, type) {
    if (!this.contains(owner)) {
      throw Error('ArgumentError: Affected parameter owner: Owner is not in this graph')
    }

    if (owner instanceof IPortOwner) {
      switch (type) {
        case AdjacencyTypes.NONE:
          return IListEnumerable.EMPTY
        case AdjacencyTypes.INCOMING:
          return new ListEnumerable(
            this.edges.filter((edge) => owner.ports.includes(edge.targetPort))
          )
        case AdjacencyTypes.OUTGOING:
          return new ListEnumerable(
            this.edges.filter((edge) => owner.ports.includes(edge.sourcePort))
          )
        default:
        case AdjacencyTypes.ALL:
          return new ListEnumerable(
            this.edges.filter(
              (edge) =>
                owner.ports.includes(edge.sourcePort) || owner.ports.includes(edge.targetPort)
            )
          )
      }
    } else {
      switch (type) {
        case AdjacencyTypes.NONE:
          return IListEnumerable.EMPTY
        case AdjacencyTypes.INCOMING:
          return new ListEnumerable(this.edges.filter((edge) => owner === edge.targetPort))
        case AdjacencyTypes.OUTGOING:
          return new ListEnumerable(this.edges.filter((edge) => owner === edge.sourcePort))
        default:
        case AdjacencyTypes.ALL:
          return new ListEnumerable(
            this.edges.filter((edge) => owner === edge.sourcePort || owner === edge.targetPort)
          )
      }
    }
  }

  aggregationEdgesAt(owner, type) {
    if (!this.contains(owner)) {
      throw Error('ArgumentError: Affected parameter owner: Owner is not in this graph')
    }

    let aggregationEdges

    switch (type) {
      case AdjacencyTypes.NONE:
        return IListEnumerable.EMPTY
      case AdjacencyTypes.INCOMING:
        aggregationEdges = owner.ports.map((port) => this.$targetPortToAggregationEdge.get(port))
        break
      case AdjacencyTypes.OUTGOING:
        aggregationEdges = owner.ports.map((port) => this.$sourcePortToAggregationEdge.get(port))
        break
      default:
      case AdjacencyTypes.ALL:
        aggregationEdges = owner.ports.map(
          (port) =>
            this.$targetPortToAggregationEdge.get(port) ??
            this.$sourcePortToAggregationEdge.get(port)
        )
        break
    }
    return new ListEnumerable(
      aggregationEdges.filter((edge) => !!edge && this.$aggregationItemPredicate(edge))
    )
  }

  setEdgePorts(edge, sourcePort, targetPort) {
    if (!this.contains(edge)) {
      throw new Error(`ArgumentError: Affected parameter edge: Not in Graph: ${edge}`)
    }
    if (!this.contains(sourcePort)) {
      throw new Error(`ArgumentError: Affected parameter sourcePort: Not in Graph ${sourcePort}`)
    }
    if (!this.contains(targetPort)) {
      throw new Error(`ArgumentError: Affected parameter targetPort: Not in Graph: ${targetPort}`)
    }

    if (edge instanceof AggregationEdge) {
      throw new Error(`NotSupportedError: Cannot set ports of aggregation edge ${edge}`)
    }
    if (sourcePort instanceof AggregationPort) {
      throw new Error(`InvalidOperationError: Cannot reconnect original edge to ${sourcePort}.`)
    }
    if (targetPort instanceof AggregationPort) {
      throw new Error(`InvalidOperationError: Cannot reconnect original edge to ${targetPort}.`)
    }
    super.setEdgePorts(edge, sourcePort, targetPort)
  }

  contains(item) {
    const node = item instanceof AggregationNode ? item : null
    if (node) {
      return node.graph === this && this.$aggregationItemPredicate(node)
    }
    const edge = item instanceof AggregationEdge ? item : null
    if (edge) {
      return edge.graph === this && this.$aggregationItemPredicate(edge)
    }
    const port = item instanceof AggregationPort ? item : null
    if (port) {
      return port.graph === this && this.contains(port.owner)
    }
    const label = item instanceof AggregationLabel ? item : null
    if (label) {
      return label.graph === this && this.contains(label.owner)
    }
    const bend = item instanceof AggregationBend ? item : null
    if (bend) {
      return bend.graph === this && this.contains(bend.owner)
    }
    return this.$filteredGraph.contains(item)
  }

  setNodeLayout(node, layout) {
    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }
    if (
      Number.isNaN(layout.x) ||
      Number.isNaN(layout.y) ||
      Number.isNaN(layout.width) ||
      Number.isNaN(layout.height)
    ) {
      throw new Error(
        `ArgumentError: Affected parameter layout: The layout must not contain a NaN value. ${layout}`
      )
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      const oldLayout = aggregationNode.layout.toRect()
      aggregationNode.layout.setShape(layout)
      this.onNodeLayoutChanged(aggregationNode, oldLayout)
    } else {
      super.setNodeLayout(node, layout)
    }
  }

  addPort(owner, locationParameter, style, tag) {
    if (!(owner instanceof IPortOwner)) {
      const options = owner
      owner = options.owner
      locationParameter = options.locationParameter
      style = options.style
      tag = options.tag
    }

    if (!this.contains(owner)) {
      throw new Error(
        `ArgumentError: Affected parameter owner: Owner is not in this graph. ${owner}`
      )
    }
    if (owner instanceof AggregationEdge) {
      throw new Error(
        `ArgumentError: Affected parameter owner: Edge ports are not supported for aggregated edges ${owner}`
      )
    }

    const aggregationNode = owner instanceof AggregationNode ? owner : null
    if (aggregationNode) {
      const portLocationParameter =
        locationParameter || this.aggregationNodeDefaults.ports.getLocationParameterInstance(owner)
      const portStyle = style || this.aggregationNodeDefaults.ports.getStyleInstance(owner)
      const aggregationPort = new AggregationPort(
        this,
        aggregationNode,
        portLocationParameter,
        portStyle
      )
      aggregationPort.tag = tag
      aggregationNode.$ports.add(aggregationPort)

      this.onPortAdded(new ItemEventArgs(aggregationPort))
      return aggregationPort
    }
    if (locationParameter) {
      return super.addPort(owner, locationParameter, style, tag)
    } else {
      return super.addPort(owner)
    }
  }

  setPortLocationParameter(port, locationParameter) {
    if (port.locationParameter === locationParameter) {
      return
    }
    if (!this.contains(port)) {
      throw new Error('ArgumentError: Affected parameter port: Port does not belong to this graph')
    }
    if (!locationParameter) {
      throw new Error('ArgumentError: Argument for parameter locationParameter is null')
    }

    const aggregationPort = port instanceof AggregationPort ? port : null
    if (aggregationPort) {
      const oldParameter = port.locationParameter
      aggregationPort.locationParameter = locationParameter
      this.onPortLocationParameterChanged(new ItemChangedEventArgs(port, oldParameter))
    } else {
      super.setPortLocationParameter(port, locationParameter)
    }
  }

  addBend(edge, location, index = -1) {
    if (!this.contains(edge)) {
      throw new Error('ArgumentError: Affected parameter edge: Edge is not in this graph.')
    }
    if (Number.isNaN(location.x) || Number.isNaN(location.y)) {
      throw new Error(
        'ArgumentError: Affected parameter location: The location must not contain a NaN value.'
      )
    }

    const aggregationEdge = edge instanceof AggregationEdge ? edge : null
    if (aggregationEdge) {
      const aggregationBend = new AggregationBend(this, aggregationEdge, new MutablePoint(location))
      const bendList = aggregationEdge.$bends
      if (index < 0) {
        bendList.add(aggregationBend)
      } else {
        bendList.insert(index, aggregationBend)
      }
      this.onBendAdded(new ItemEventArgs(aggregationBend))
      return aggregationBend
    }
    return super.addBend(edge, location, index)
  }

  setBendLocation(bend, location) {
    if (location.equals(bend.location)) {
      return
    }
    if (!this.contains(bend)) {
      throw new Error('ArgumentError: Affected parameter bend: Edge is not in this graph.')
    }
    if (Number.isNaN(location.x) || Number.isNaN(location.y)) {
      throw new Error(
        'ArgumentError: Affected parameter location: The location must not contain a NaN value.'
      )
    }

    const aggregationBend = bend instanceof AggregationBend ? bend : null
    if (aggregationBend) {
      const oldLocation = aggregationBend.location.toPoint()
      aggregationBend.location.setLocation(location)
      this.onBendLocationChanged(bend, oldLocation)
    } else {
      super.setBendLocation(bend, location)
    }
  }

  addLabel(owner, text, layoutParameter, style, preferredSize, tag) {
    if (!(owner instanceof ILabelOwner)) {
      const options = owner
      owner = options.owner
      text = options.text
      layoutParameter = options.layoutParameter
      style = options.style
      preferredSize = options.preferredSize
      tag = options.tag
    }

    if (preferredSize != null && !(preferredSize instanceof Size)) {
      preferredSize = Size.from(preferredSize)
    }

    const labelOwner =
      owner instanceof AggregationNode ||
      owner instanceof AggregationEdge ||
      owner instanceof AggregationPort
        ? owner
        : null
    if (labelOwner) {
      if (!this.contains(owner)) {
        throw new Error('ArgumentError: Affected parameter owner: Owner is not in this graph.')
      }
      if (
        !!preferredSize &&
        (Number.isNaN(preferredSize.width) || Number.isNaN(preferredSize.height))
      ) {
        throw new Error(
          'ArgumentError: Affected parameter preferredSize: The size must not contain a NaN value.'
        )
      }

      const labelModelParameter = layoutParameter || this.$getLabelModelParameter(labelOwner)
      const labelStyle = style || this.$getLabelStyle(labelOwner)
      const labelPreferredSize =
        preferredSize ||
        this.calculateLabelPreferredSize(labelOwner, text, labelModelParameter, labelStyle)

      const aggregationLabel = new AggregationLabel(
        this,
        labelOwner,
        text,
        layoutParameter,
        labelPreferredSize,
        labelStyle
      )
      aggregationLabel.tag = tag
      labelOwner.$labels.add(aggregationLabel)

      this.onLabelAdded(new ItemEventArgs(aggregationLabel))
      return aggregationLabel
    }
    return super.addLabel(owner, text, layoutParameter, style, preferredSize, tag)
  }

  $getLabelModelParameter(owner) {
    if (owner instanceof AggregationNode) {
      return this.aggregationNodeDefaults.labels.getLayoutParameterInstance(owner)
    } else if (owner instanceof AggregationEdge) {
      return this.aggregationEdgeDefaults.labels.getLayoutParameterInstance(owner)
    } else {
      const aggregationPort = owner
      if (aggregationPort.owner instanceof INode) {
        return this.aggregationNodeDefaults.ports.labels.getLayoutParameterInstance(owner)
      } else {
        return this.aggregationEdgeDefaults.ports.labels.getLayoutParameterInstance(owner)
      }
    }
  }

  $getLabelStyle(owner) {
    if (owner instanceof AggregationNode) {
      return this.aggregationNodeDefaults.labels.getStyleInstance(owner)
    } else if (owner instanceof AggregationEdge) {
      return this.aggregationEdgeDefaults.labels.getStyleInstance(owner)
    } else {
      const aggregationPort = owner
      if (aggregationPort.owner instanceof INode) {
        return this.aggregationNodeDefaults.ports.labels.getStyleInstance(owner)
      } else {
        return this.aggregationEdgeDefaults.ports.labels.getStyleInstance(owner)
      }
    }
  }

  setLabelText(label, text) {
    if (label.text === text) {
      return
    }
    if (!this.contains(label)) {
      throw new Error('ArgumentError: Affected parameter label: Label is not in this graph.')
    }

    const aggregationLabel = label instanceof AggregationLabel ? label : null
    if (aggregationLabel) {
      const oldText = label.text
      aggregationLabel.text = text
      this.onLabelTextChanged(new ItemChangedEventArgs(label, oldText))
    } else {
      super.setLabelText(label, text)
    }
  }

  setLabelPreferredSize(label, preferredSize) {
    if (label.preferredSize.equals(preferredSize)) {
      return
    }
    if (!this.contains(label)) {
      throw new Error('ArgumentError: Affected parameter label: Label is not in this graph.')
    }
    if (Number.isNaN(preferredSize.width) || Number.isNaN(preferredSize.height)) {
      throw new Error(
        'ArgumentError: Affected parameter preferredSize: The size must not contain a NaN value.'
      )
    }

    const aggregationLabel = label instanceof AggregationLabel ? label : null
    if (aggregationLabel) {
      const oldPreferredSize = label.preferredSize
      aggregationLabel.preferredSize = preferredSize
      this.onLabelPreferredSizeChanged(new ItemChangedEventArgs(label, oldPreferredSize))
    } else {
      super.setLabelPreferredSize(label, preferredSize)
    }
  }

  setLabelLayoutParameter(label, layoutParameter) {
    if (label.layoutParameter === layoutParameter) {
      return
    }
    if (!this.contains(label)) {
      throw new Error(
        'ArgumentError: Affected parameter label: Label does not belong to this graph.'
      )
    }
    if (!layoutParameter) {
      throw new Error('Argument Error: Argument for parameter layoutParameter is null.')
    }

    const aggregationLabel = label instanceof AggregationLabel ? label : null
    if (aggregationLabel) {
      const oldParameter = label.layoutParameter
      aggregationLabel.layoutParameter = layoutParameter
      this.onLabelLayoutParameterChanged(new ItemChangedEventArgs(label, oldParameter))
    } else {
      super.setLabelLayoutParameter(label, layoutParameter)
    }
  }

  setStyle(item, style) {
    if (!this.contains(item)) {
      throw new Error('ArgumentError: Affected parameter item: Item is not in this graph.')
    }

    if (item instanceof INode) {
      const aggregationNode = item instanceof AggregationNode ? item : null
      if (aggregationNode) {
        if (aggregationNode.style !== style) {
          const oldStyle = aggregationNode.style
          aggregationNode.style = style
          this.onNodeStyleChanged(new ItemChangedEventArgs(item, oldStyle))
        }
      } else {
        super.setStyle(item, style)
      }
    } else if (item instanceof IEdge) {
      const aggregationEdge = item instanceof AggregationEdge ? item : null
      if (aggregationEdge) {
        if (aggregationEdge.style !== style) {
          const oldStyle = aggregationEdge.style
          aggregationEdge.style = style
          this.onEdgeStyleChanged(new ItemChangedEventArgs(item, oldStyle))
        }
      } else {
        super.setStyle(item, style)
      }
    } else if (item instanceof ILabel) {
      const aggregationLabel = item instanceof AggregationLabel ? item : null
      if (aggregationLabel) {
        if (aggregationLabel.style !== style) {
          const oldStyle = aggregationLabel.style
          aggregationLabel.style = style
          this.onLabelStyleChanged(new ItemChangedEventArgs(item, oldStyle))
        }
      } else {
        super.setStyle(item, style)
      }
    } else {
      const aggregationPort = item instanceof AggregationPort ? item : null
      if (aggregationPort) {
        if (aggregationPort.style !== style) {
          const oldStyle = aggregationPort.style
          aggregationPort.style = style
          this.onPortStyleChanged(new ItemChangedEventArgs(item, oldStyle))
        }
      } else {
        super.setStyle(item, style)
      }
    }
  }

  getChildren(node) {
    if (!node) {
      // top-level nodes
      return new ListEnumerable(this.nodes.filter((n) => this.getParent(n) === null))
    }

    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      return new ListEnumerable(aggregationNode.children || IListEnumerable.EMPTY)
    }

    return new ListEnumerable(
      super.getChildren(node).concat(this.aggregationNodes.filter((an) => an.parent === node))
    )
  }

  getParent(node) {
    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      return aggregationNode.parent
    }

    const aggregationNodeParent = this.aggregationNodes.find(
      (parent) => !!parent.children && parent.children.includes(node)
    )
    if (aggregationNodeParent) {
      return aggregationNodeParent
    }

    return super.getParent(node)
  }

  setParent(node, parent) {
    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }
    if (parent && !this.contains(parent)) {
      throw new Error('ArgumentError: Affected parameter parent: Parent is not in this graph.')
    }

    const oldParent = this.getParent(node)
    const oldAggregationParent = oldParent instanceof AggregationNode ? oldParent : null
    if (oldAggregationParent && oldAggregationParent.children) {
      oldAggregationParent.children.remove(node)
    }

    if (node instanceof AggregationNode || parent instanceof AggregationNode) {
      if (!(node instanceof AggregationNode) && !(oldParent instanceof AggregationNode)) {
        // if neither node nor oldParent are AggregationNode, notify WrappedGraph that this relationship is no longer valid
        super.setParent(node, null)
      }

      if (!this.isGroupNode(parent)) {
        this.setIsGroupNode(parent, true)
      }

      const aggregationNode = node instanceof AggregationNode ? node : null
      if (aggregationNode) {
        aggregationNode.parent = node
      }
      const aggregationParent = parent instanceof AggregationNode ? parent : null
      if (aggregationParent) {
        aggregationParent.children.add(node)
      }

      this.onParentChanged(new NodeEventArgs(node, oldParent, this.isGroupNode(node)))
    } else {
      super.setParent(node, parent)
    }
  }

  setIsGroupNode(node, isGroupNode) {
    if (!node) {
      if (!isGroupNode) {
        throw new Error('InvalidOperationError: Cannot make the root a non-group node.')
      }
      // root stays a group node
      return
    }
    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      if (isGroupNode && !aggregationNode.children) {
        aggregationNode.children = new List()
        this.onIsGroupNodeChanged(new NodeEventArgs(node, this.getParent(node), false))
      } else if (!isGroupNode && aggregationNode.children) {
        if (aggregationNode.children.size > 0) {
          throw new Error(
            'InvalidOperationError: Cannot set the type of the node to non-group as long as it has children.'
          )
        }
        aggregationNode.children = null
        this.onIsGroupNodeChanged(new NodeEventArgs(node, this.getParent(node), true))
      }
    } else {
      super.setIsGroupNode(node, isGroupNode)
    }
  }

  isGroupNode(node) {
    if (!node) {
      // null represents the root which is always a group node
      return true
    }

    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph')
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      return aggregationNode.children === null
    }
    return super.isGroupNode(node)
  }

  createEdge(source, target, style, tag) {
    if (!(source instanceof INode || source instanceof IPort)) {
      const options = source
      source = options.source
      target = options.target
      style = options.style
      tag = options.tag
    }

    if (!this.contains(source)) {
      throw new Error(
        "ArgumentError: Affected parameter source: Cannot create edge from a node that doesn't belong to this graph."
      )
    }
    if (!this.contains(target)) {
      throw new Error(
        "ArgumentError: Affected parameter target: Cannot create edge to a node that doesn't belong to this graph."
      )
    }

    if (source instanceof INode) {
      const sourceNode = source
      const targetNode = target
      if (sourceNode instanceof AggregationNode || targetNode instanceof AggregationNode) {
        const sourcePort = this.addPort(sourceNode)
        const targetPort = this.addPort(targetNode)
        return this.createEdge(sourcePort, targetPort, style, tag)
      }
      return super.createEdge(sourceNode, targetNode, style, tag)
    } else {
      const sourcePort = source
      const targetPort = target
      if (sourcePort instanceof AggregationPort || targetPort instanceof AggregationPort) {
        const edgeStyle = style || this.aggregationEdgeDefaults.getStyleInstance()
        const aggregationEdge = new AggregationEdge(this, sourcePort, targetPort, edgeStyle)
        aggregationEdge.tag = tag
        this.$aggregationEdges.add(aggregationEdge)
        this.$sourcePortToAggregationEdge.set(sourcePort, aggregationEdge)
        this.$targetPortToAggregationEdge.set(targetPort, aggregationEdge)
        this.onEdgeCreated(new ItemEventArgs(aggregationEdge))
        return aggregationEdge
      }
      return super.createEdge(sourcePort, targetPort, style, tag)
    }
  }

  /**
   * Does not raise EdgeCreated event!!
   */
  $createAggregationEdge(sourcePort, targetPort, tag) {
    const edgeStyle = this.aggregationEdgeDefaults.getStyleInstance()
    const aggregationEdge = new AggregationEdge(this, sourcePort, targetPort, edgeStyle)
    aggregationEdge.tag = tag || null
    this.$aggregationEdges.add(aggregationEdge)
    this.$sourcePortToAggregationEdge.set(sourcePort, aggregationEdge)
    this.$targetPortToAggregationEdge.set(targetPort, aggregationEdge)
    return aggregationEdge
  }

  lookup(type) {
    return this.$lookupDecorator.lookup(type)
  }

  addLookup(lookup) {
    this.$lookupDecorator.addLookup(IGraph, lookup)
  }

  removeLookup(lookup) {
    this.$lookupDecorator.removeLookup(IGraph, lookup)
  }

  baseLookup(type) {
    return super.lookup(type)
  }

  delegateLookup(aggregationItem, type) {
    return this.$lookupDecorator.delegateLookup(aggregationItem, type)
  }

  onTagChanged(item, oldTag) {
    if (item instanceof INode) {
      this.onNodeTagChanged(new ItemChangedEventArgs(item, oldTag))
    } else if (item instanceof IEdge) {
      this.onEdgeTagChanged(new ItemChangedEventArgs(item, oldTag))
    } else if (item instanceof ILabel) {
      this.onLabelTagChanged(new ItemChangedEventArgs(item, oldTag))
    } else if (item instanceof IPort) {
      this.onPortTagChanged(new ItemChangedEventArgs(item, oldTag))
    } else if (item instanceof IBend) {
      this.onBendTagChanged(new ItemChangedEventArgs(item, oldTag))
    }
  }
}

/**
 * An ILookupDecorator implementation that contains its own lookup chains.
 * New chain links are added to the chains of this decorator as well as to the decorator of the {@link GraphWrapperBase.wrappedGraph}.
 */
class AggregationLookupDecorator extends BaseClass(ILookup, ILookupDecorator) {
  $wrappedDecorator

  $graph

  $graphLookup = new ContextLookup(IGraph)
  $nodeLookup = new ContextLookup(INode)
  $edgeLookup = new ContextLookup(IEdge)
  $bendLookup = new ContextLookup(IBend)
  $portLookup = new ContextLookup(IPort)
  $labelLookup = new ContextLookup(ILabel)

  constructor(graph) {
    super()
    this.$graph = graph

    this.$wrappedDecorator = null

    this.$graphLookup.addLookup(new GraphFallBackLookup())
    this.$nodeLookup.addLookup(new ItemFallBackLookup())
    this.$nodeLookup.addLookup(new ItemDefaultLookup(Graph.DEFAULT_NODE_LOOKUP))
    this.$nodeLookup.addLookup(new BlockReshapeAndPositionHandlerLookup())

    this.$edgeLookup.addLookup(new ItemFallBackLookup())
    this.$edgeLookup.addLookup(new ItemDefaultLookup(Graph.DEFAULT_EDGE_LOOKUP))

    this.$bendLookup.addLookup(new ItemFallBackLookup())
    this.$bendLookup.addLookup(new ItemDefaultLookup(Graph.DEFAULT_BEND_LOOKUP))

    this.$portLookup.addLookup(new ItemFallBackLookup())
    this.$portLookup.addLookup(new ItemDefaultLookup(Graph.DEFAULT_PORT_LOOKUP))

    this.$labelLookup.addLookup(new ItemFallBackLookup())
    this.$labelLookup.addLookup(new ItemDefaultLookup(Graph.DEFAULT_LABEL_LOOKUP))
  }

  addLookup(t, lookup) {
    if (t === INode) {
      this.$nodeLookup.addLookup(lookup)
    } else if (t === IEdge) {
      this.$edgeLookup.addLookup(lookup)
    } else if (t === IBend) {
      this.$bendLookup.addLookup(lookup)
    } else if (t === IPort) {
      this.$portLookup.addLookup(lookup)
    } else if (t === ILabel) {
      this.$labelLookup.addLookup(lookup)
    } else if (t === IGraph) {
      this.$graphLookup.addLookup(lookup)
    } else {
      throw new Error(`ArgumentError: Cannot decorate type ${t}`)
    }

    if (this.$wrappedDecorator) {
      this.$wrappedDecorator.addLookup(t, lookup)
    }
  }

  removeLookup(t, lookup) {
    if (t === INode) {
      this.$nodeLookup.removeLookup(lookup)
    } else if (t === IEdge) {
      this.$edgeLookup.removeLookup(lookup)
    } else if (t === IBend) {
      this.$bendLookup.removeLookup(lookup)
    } else if (t === IPort) {
      this.$portLookup.removeLookup(lookup)
    } else if (t === ILabel) {
      this.$labelLookup.removeLookup(lookup)
    } else if (t === IGraph) {
      this.$graphLookup.removeLookup(lookup)
    }

    if (this.$wrappedDecorator) {
      this.$wrappedDecorator.removeLookup(t, lookup)
    }
  }

  lookup(type) {
    if (type === ILookupDecorator) {
      this.$wrappedDecorator = this.$graph.baseLookup(type)
      return this
    }

    return this.$graphLookup.lookup(this.$graph, type)
  }

  delegateLookup(item, type) {
    if (item instanceof INode) {
      return this.$nodeLookup.contextLookup(item, type)
    } else if (item instanceof IEdge) {
      return this.$edgeLookup.contextLookup(item, type)
    } else if (item instanceof ILabel) {
      return this.$labelLookup.contextLookup(item, type)
    } else if (item instanceof IBend) {
      return this.$bendLookup.contextLookup(item, type)
    } else if (item instanceof IPort) {
      return this.$portLookup.contextLookup(item, type)
    } else {
      return null
    }
  }
}

class ContextLookupChainLinkBase extends BaseClass(IContextLookupChainLink) {
  $nextLink = null

  contextLookup(item, type) {
    return this.$nextLink ? this.$nextLink.contextLookup(item, type) : null
  }

  setNext(next) {
    this.$nextLink = next
  }
}

class GraphFallBackLookup extends ContextLookupChainLinkBase {
  contextLookup(item, type) {
    return item.baseLookup(type) || super.contextLookup(item, type)
  }
}

class ItemFallBackLookup extends ContextLookupChainLinkBase {
  contextLookup(item, type) {
    return item.innerLookup(type) || super.contextLookup(item, type)
  }
}

class BlockReshapeAndPositionHandlerLookup extends ContextLookupChainLinkBase {
  contextLookup(item, type) {
    // The default implementations of IPositionHandler and IReshapeHandler don't support AggregationNode, which is
    // why moving and reshaping such nodes is not supported by default.
    if (type === IPositionHandler || type === IReshapeHandler) {
      return null
    }
    return super.contextLookup(item, type)
  }
}

class ItemDefaultLookup extends ContextLookupChainLinkBase {
  $defaultLookup

  constructor(defaultLookup) {
    super()
    this.$defaultLookup = defaultLookup
  }

  contextLookup(item, type) {
    return this.$defaultLookup.contextLookup(item, type) || super.contextLookup(item, type)
  }
}

/**
 * A simple INode implementation for aggregation nodes.
 */
class AggregationNode extends BaseClass(INode) {
  $aggregatedNodes
  $layout
  $style
  $children
  $parent
  $graph
  $tag
  $labelsEnumerable = null
  $portsEnumerable = null
  $labels
  $ports

  get aggregatedNodes() {
    return this.$aggregatedNodes
  }

  get layout() {
    return this.$layout
  }

  get labels() {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  get ports() {
    if (!this.$portsEnumerable) {
      this.$portsEnumerable = new ListEnumerable(this.$ports)
    }
    return this.$portsEnumerable
  }

  get tag() {
    return this.$tag
  }

  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  get graph() {
    return this.$graph
  }

  set graph(graph) {
    this.$graph = graph
  }

  get style() {
    return this.$style
  }

  set style(style) {
    this.$style = style
  }

  get children() {
    return this.$children
  }

  set children(children) {
    this.$children = children
  }

  get parent() {
    return this.$parent
  }

  set parent(value) {
    this.$parent = value
  }

  constructor(graph, aggregatedNodes, layout, style) {
    super(graph)
    this.$aggregatedNodes = aggregatedNodes
    this.$layout = layout
    this.$style = style
    this.$graph = graph
    this.$labels = new List()
    this.$ports = new List()

    this.$children = null
    this.$parent = null
  }

  innerLookup(type) {
    if (type === INodeStyle) {
      return this.style
    }
    if (type === IMutableRectangle) {
      return this.layout
    }
    if (type === AggregationNode) {
      return this
    }
    return null
  }

  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  toString() {
    return this.labels.size > 0
      ? this.$labels.size > 0
        ? this.$labels.get(0).text
        : 'ILabelOwner'
      : `Aggregation Node (${this.aggregatedNodes.size}) [${this.layout.x}, ${this.layout.y}, ${this.layout.width}, ${this.layout.height}]`
  }
}

/**
 * A simple IEdge implementation for aggregation edges.
 */
class AggregationEdge extends BaseClass(IEdge) {
  $bends
  $ports
  $labels
  $aggregatedEdges
  $graph
  $sourcePort
  $targetPort
  $style
  $tag
  $labelsEnumerable = null
  $portsEnumerable = null
  $bendsEnumerable = null

  get isSelfLoop() {
    return this.sourcePort.owner === this.targetPort.owner
  }

  get aggregatedEdges() {
    return this.$aggregatedEdges
  }

  get bends() {
    if (!this.$bendsEnumerable) {
      this.$bendsEnumerable = new ListEnumerable(this.$bends)
    }
    return this.$bendsEnumerable
  }

  get labels() {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  get ports() {
    if (!this.$portsEnumerable) {
      this.$portsEnumerable = new ListEnumerable(this.$ports)
    }
    return this.$portsEnumerable
  }

  get graph() {
    return this.$graph
  }

  set graph(graph) {
    this.$graph = graph
  }

  get sourcePort() {
    return this.$sourcePort
  }

  set sourcePort(value) {
    this.$sourcePort = value
  }

  get targetPort() {
    return this.$targetPort
  }

  set targetPort(value) {
    this.$targetPort = value
  }

  get style() {
    return this.$style
  }

  set style(value) {
    this.$style = value
  }

  get tag() {
    return this.$tag
  }

  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  constructor(graph, sourcePort, targetPort, style) {
    super()
    this.$graph = graph
    this.$sourcePort = sourcePort
    this.$targetPort = targetPort
    this.$style = style
    this.$bends = new List()
    this.$ports = new List()
    this.$labels = new List()
    this.$aggregatedEdges = new List()
  }

  opposite(port) {
    if (port instanceof IPort) {
      return port === this.sourcePort ? this.targetPort : this.sourcePort
    }
    return port === this.sourceNode ? this.targetNode : this.sourceNode
  }

  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  innerLookup(type) {
    if (type === IEdgeStyle) {
      return this.style
    }
    if (type === IListEnumerable) {
      return this.bends
    }
    if (type === AggregationEdge) {
      return this
    }
    return null
  }

  toString() {
    if (this.labels.size > 0) {
      return this.$labels.size > 0 ? this.$labels.get(0).text : 'ILabelOwner'
    } else {
      if (
        (this.sourcePort && this.sourcePort.owner instanceof IEdge) ||
        (this.targetPort && this.targetPort.owner instanceof IEdge)
      ) {
        return 'Aggregation Edge [ At another Edge ]'
      } else {
        return `Aggregation Edge (${this.aggregatedEdges.size}) [${this.sourcePort} -> ${this.targetPort}]`
      }
    }
  }
}

/**
 * A simple IBend implementation for bends of {@link AggregationEdge}s.
 */
class AggregationBend extends BaseClass(IBend) {
  $owner
  $location
  $graph
  $tag

  get owner() {
    return this.$owner
  }

  get location() {
    return this.$location
  }

  get tag() {
    return this.$tag
  }

  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  get graph() {
    return this.$graph
  }

  set graph(graph) {
    this.$graph = graph
  }

  constructor(graph, owner, location) {
    super()
    this.$owner = owner
    this.$location = location
    this.$graph = graph
  }

  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  innerLookup(type) {
    if (type === IMutablePoint) {
      return this.location
    }
    if (type === AggregationBend) {
      return this
    }
    return null
  }

  toString() {
    return `Aggregation Bend [${this.location.x}, ${this.location.y}]`
  }
}

/**
 * A simple IPort implementation for ports of {@link AggregationNode}, {@link AggregationEdge}, or {@link AggregationPort}.
 */
class AggregationPort extends BaseClass(IPort) {
  $owner
  $style
  $graph
  $tag
  $locationParameter
  $labelsEnumerable = null
  $labels

  get owner() {
    return this.$owner
  }

  get labels() {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  get locationParameter() {
    return this.$locationParameter
  }

  set locationParameter(value) {
    this.$locationParameter = value
  }

  get style() {
    return this.$style
  }

  set style(value) {
    this.$style = value
  }

  get tag() {
    return this.$tag
  }

  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  get graph() {
    return this.$graph
  }

  set graph(graph) {
    this.$graph = graph
  }

  constructor(graph, owner, locationParameter, style) {
    super()
    this.$owner = owner
    this.$locationParameter = locationParameter
    this.$style = style
    this.$labels = new List()
    this.$graph = graph
  }

  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  innerLookup(type) {
    if (type === IPortStyle) {
      return this.style
    }
    if (type === IPortLocationModelParameter) {
      return this.locationParameter
    }
    if (type === IPoint) {
      return this.dynamicLocation
    }
    if (type === AggregationPort) {
      return this
    }
    return null
  }

  toString() {
    let text = 'Aggregation Port ['

    try {
      text += `Location: ${this.location}`
    } catch (e) {
      // ignored
    }
    return `${text}Parameter: ${this.locationParameter}; Owner: ${this.owner}]`
  }
}

/**
 * A simple ILabel implementation for labels of {@link AggregationNode}, {@link AggregationEdge}, or {@link AggregationPort}.
 */
class AggregationLabel extends BaseClass(ILabel) {
  $owner
  $layoutParameter
  $preferredSize
  $style
  $text
  $graph
  $tag
  $layout

  get owner() {
    return this.$owner
  }

  get layoutParameter() {
    return this.$layoutParameter
  }

  set layoutParameter(parameter) {
    this.$layoutParameter = parameter
  }

  get preferredSize() {
    return this.$preferredSize
  }

  set preferredSize(size) {
    this.$preferredSize = size
  }

  get style() {
    return this.$style
  }

  set style(style) {
    this.$style = style
  }

  get text() {
    return this.$text
  }

  set text(text) {
    this.$text = text
  }

  get tag() {
    return this.$tag
  }

  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  get layout() {
    return this.$layout
  }

  set layout(value) {
    this.$layout = value
  }

  get graph() {
    return this.$graph
  }

  set graph(graph) {
    this.$graph = graph
  }

  constructor(graph, labelOwner, text, layoutParameter, preferredSize, style) {
    super(graph)
    this.$owner = labelOwner
    this.$text = text
    this.$layoutParameter = layoutParameter
    this.$preferredSize = preferredSize
    this.$style = style
    this.$graph = graph
    this.$layout = new OrientedRectangle()
  }

  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  innerLookup(type) {
    if (type === ILabelStyle) {
      return this.style
    }
    if (type === ILabelModelParameter) {
      return this.layoutParameter
    }
    if (type === AggregationLabel) {
      return this
    }
    return null
  }

  toString() {
    return `Aggregation Label ["${this.text}"; Owner: ${this.owner}]`
  }
}
