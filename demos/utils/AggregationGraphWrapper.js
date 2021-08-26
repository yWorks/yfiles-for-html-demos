/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Class,
  DefaultGraph,
  EdgeDefaults,
  EdgeEventArgs,
  FilteredGraphWrapper,
  GraphWrapperBase,
  HashMap,
  IBend,
  IContextLookup,
  IContextLookupChainLink,
  IEdge,
  IEdgeDefaults,
  IEdgeStyle,
  IEnumerable,
  IGraph,
  ILabel,
  ILabelModelParameter,
  ILabelOwner,
  ILabelStyle,
  IList,
  IListEnumerable,
  ILookup,
  ILookupDecorator,
  IMap,
  IModelItem,
  IMutablePoint,
  IMutableRectangle,
  INode,
  INodeDefaults,
  INodeStyle,
  IOrientedRectangle,
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
  LookupChain,
  MutablePoint,
  MutableRectangle,
  NodeDefaults,
  NodeEventArgs,
  OrientedRectangle,
  Point,
  PortEventArgs,
  Rect,
  Size
} from 'yfiles'

/**
 * Determines what kind of edges should be created when replacing original edges with aggregation
 * edges in calls to methods of the {@link AggregationGraphWrapper}.
 */
export const EdgeReplacementPolicy = {
  NONE: 0,
  UNDIRECTED: 1,
  DIRECTED: 2
}

/**
 * An IGraph implementation that wraps another graph and can replace some of its items by other items.
 * <p>
 * More precisely, a set of nodes can be aggregated to a new node with the {@link AggregationGraphWrapper#aggregate}
 * method. This will hide the set of nodes and create a new aggregation node while replacing adjacent edges with aggregation edges.
 * </p>
 * <p>
 * Items of the wrapped graph ("original graph") are called <em>original items</em> while the temporary items that are
 * created for aggregation are called <em>aggregation items</em>.
 * </p>
 * <p>
 * This class implements a concept similar to grouping and folding. The conceptual difference is that with folding the
 * group nodes remain in the graph while the group is in expanded state. Contrary, with the AggregationGraphWrapper the
 * aggregation nodes are only in the graph when the nodes are aggregated. The difference in the implementation is that
 * the AggregationGraphWrapper reuses all original graph items, ensuring reference equality between items of the wrapped
 * graph and items of the AggregationGraphWrapper.
 * </p>
 * <p>
 * Note that this implementation does not support editing user gestures, e.g. with the GraphEditorInputMode.
 * </p>
 * <p>
 * Note also that this instance will register listeners with the wrapped graph instance, so
 * {@link AggregationGraphWrapper#dispose} should be called if this instance is not used any more.
 * </p>
 */
export class AggregationGraphWrapper extends GraphWrapperBase {
  /**
   * Creates a new instance of this graph wrapper.
   * @param {!IGraph} graph The graph to be wrapped ("original graph").
   * @throws If the <code>graph</code> is another {@link AggregationGraphWrapper}
   */
  constructor(graph) {
    super(graph)
    if (graph instanceof AggregationGraphWrapper) {
      throw new Error(
        'ArgumentError: Affected parameter graph: Cannot wrap another AggregationGraphWrapper'
      )
    }

    // Sets what kind of edges should be created when replacing original edges with aggregation edges.
    // The default value is {@link EdgeReplacementPolicy#UNDIRECTED}.
    this.edgeReplacementPolicy = EdgeReplacementPolicy.UNDIRECTED

    this.$lookupDecorator = new AggregationLookupDecorator(this)

    // the set of hidden nodes and edges
    this.$filteredOriginalNodes = new Set()

    this.$filteredAggregationItems = new Set()
    this.aggregationNodes = new List()
    this.$aggregationEdges = new List()

    // live views of the currently visible items
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
      this.$nodes.flatMap(node => node.ports).concat(this.$edges.flatMap(edge => edge.ports))
    )
    this.$labels = new ListEnumerable(
      this.$nodes
        .flatMap(node => node.labels)
        .concat(
          this.$edges.flatMap(edge => edge.labels).concat(this.$ports.flatMap(port => port.labels))
        )
    )
  }

  /**
   * @type {!IListEnumerable.<INode>}
   */
  get nodes() {
    return this.$nodes
  }

  /**
   * @type {!IListEnumerable.<IEdge>}
   */
  get edges() {
    return this.$edges
  }

  /**
   * @type {!IListEnumerable.<ILabel>}
   */
  get labels() {
    return this.$labels
  }

  /**
   * @type {!IListEnumerable.<IPort>}
   */
  get ports() {
    return this.$ports
  }

  /**
   * @type {!INodeDefaults}
   */
  get aggregationNodeDefaults() {
    if (!this.$aggregationNodeDefaults) {
      this.$aggregationNodeDefaults = new NodeDefaults()
    }
    return this.$aggregationNodeDefaults
  }

  /**
   * @type {!INodeDefaults}
   */
  set aggregationNodeDefaults(value) {
    this.$aggregationNodeDefaults = value
  }

  /**
   * @type {!IEdgeDefaults}
   */
  get aggregationEdgeDefaults() {
    if (!this.$aggregationEdgeDefaults) {
      this.$aggregationEdgeDefaults = new EdgeDefaults()
    }
    return this.$aggregationEdgeDefaults
  }

  /**
   * @type {!IEdgeDefaults}
   */
  set aggregationEdgeDefaults(value) {
    this.$aggregationEdgeDefaults = value
  }

  /**
   * Calls the base method with the {@link AggregationGraphWrapper#$filteredGraph} instead of the passed graph for correct event forwarding.
   * @param {!IGraph} oldGraph
   * @param {!IGraph} newGraph
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

  /**
   * @param {!(AggregationNode|AggregationEdge|AggregationLabel|AggregationPort)} item
   * @returns {boolean}
   */
  $aggregationItemPredicate(item) {
    return !this.$filteredAggregationItems.has(item)
  }

  /**
   * @param {!INode} node
   * @returns {boolean}
   */
  $nodePredicate(node) {
    return !this.$filteredOriginalNodes || !this.$filteredOriginalNodes.has(node)
  }

  /**
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  $edgePredicate(edge) {
    return true
  }

  /**
   * Hides the <code>portOwner</code> and all items depending on it and raises the according removed events.
   * For nodes, their labels, ports and adjacent edges are hidden. For edges, their labels, ports and bends are hidden.
   * @param {!IPortOwner} portOwner
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
    this.edgesAt(portOwner, AdjacencyTypes.ALL)
      .filter(edge => edge instanceof AggregationEdge)
      .forEach(edge => {
        this.$hide(edge)
      })
    this.$filteredOriginalNodes.add(portOwner)
    this.$predicateChanged(portOwner)
  }

  /**
   * @param {!(AggregationNode|AggregationEdge|AggregationPort)} portOwner
   */
  $hideAdjacentEdges(portOwner) {
    this.edgesAt(portOwner, AdjacencyTypes.ALL).forEach(edge => this.$hide(edge))
  }

  /**
   * Shows an item, their labels/ports/bends, and their adjacent edges. Raises all necessary events.
   * @param {!IPortOwner} item
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

  /**
   * @param {!IPortOwner} portOwner
   */
  $showAdjacentEdges(portOwner) {
    // - cannot use EdgesAt() here, since hidden edges are not considered there
    const adjacentEdges = this.$edges.filter(
      edge => portOwner.ports.includes(edge.sourcePort) || portOwner.ports.includes(edge.targetPort)
    )
    for (const edge of adjacentEdges) {
      if (this.ports.includes(edge.sourcePort) && this.ports.includes(edge.targetPort)) {
        this.$show(edge)
      }
    }
  }

  /**
   * @param {!ILabelOwner} labelOwner
   */
  $raiseLabelAddedEvents(labelOwner) {
    for (const label of labelOwner.labels) {
      this.onLabelAdded(new LabelEventArgs(label, labelOwner))
    }
  }

  /**
   * @param {!IPortOwner} portOwner
   */
  $raisePortAddedEvents(portOwner) {
    for (const port of portOwner.ports) {
      this.onPortAdded(new PortEventArgs(port, portOwner))
      this.$raiseLabelAddedEvents(port)
    }
  }

  /**
   * @param {!(AggregationNode|AggregationEdge|AggregationPort)} labelOwner
   */
  $raiseLabelRemovedEvents(labelOwner) {
    for (const label of labelOwner.labels) {
      this.onLabelRemoved(new LabelEventArgs(label, labelOwner))
    }
  }

  /**
   * @param {!(AggregationNode|AggregationEdge)} portOwner
   */
  $raisePortRemovedEvents(portOwner) {
    for (const port of portOwner.ports) {
      this.$raiseLabelRemovedEvents(port)
      this.onPortRemoved(new PortEventArgs(port, portOwner))
    }
  }

  /**
   * @param {!IModelItem} item
   */
  $predicateChanged(item) {
    if (item instanceof INode) {
      this.$filteredGraph.nodePredicateChanged(item)
    } else if (item instanceof IEdge) {
      this.$filteredGraph.edgePredicateChanged(item)
    }
  }

  /**
   * Aggregates the <code>nodes</code> to a new aggregation node.
   * This temporarily removes the <code>nodes</code> together with their labels, ports, and adjacent edges. Then a new
   * aggregation node is created and replacement edges for all removed edges are created: for each edge between a node
   * in <code>nodes</code> and a node not in <code>nodes</code> a new edge is created. If this would lead to multiple
   * edges between the aggregation node and another node, only one edge (or two, see
   * {@link AggregationGraphWrapper#edgeReplacementPolicy}) is created.
   * @param {!IListEnumerable.<INode>} nodes The nodes to be temporarily removed.
   * @param layout The layout for the new aggregation node or <code>null</code>
   * @param style The style for the new aggregation node or <code>null</code>
   * @param tag The style for the new aggregation node or <code>null</code>
   * @returns {!INode} A new aggregation node.
   * @throws Any of the <code>nodes</code> is not in the graph.
   * @see AggregationGraphWrapper#separate
   * @param {!Rect} [layout]
   * @param {!INodeStyle} [style]
   * @param {*} [tag]
   */
  aggregate(nodes, layout, style, tag) {
    const badNode = nodes.firstOrDefault(node => !this.contains(node))
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
   * Replaces adjacent edges by new aggregation edges. Prevents duplicate edges following {@link AggregationGraphWrapper#edgeReplacementPolicy}.
   * @param {!IListEnumerable.<INode>} nodes
   * @param {!AggregationNode} aggregationNode
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

  /**
   * @param {!AdjacencyTypes} adjacencyType
   * @param {!INode} node
   * @param {!IPortOwner} aggregationPortOwner
   * @param {!IListEnumerable.<INode>} items
   * @param {!IMap.<IPortOwner,AggregationEdge>} replacementEdges
   */
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

  /**
   * @param {!IEdge} edge
   * @param {!IPortOwner} newPortOwner
   * @param {!IPort} otherPort
   * @param {boolean} isIncoming
   * @returns {!AggregationEdge}
   */
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
   * Separates nodes again that were previously aggregated via {@link AggregationGraphWrapper#aggregate}.
   * Removes the aggregation node permanently together with its labels, ports, and adjacent edges. Then inserts the
   * items that were temporarily removed in {@link AggregationGraphWrapper#aggregate} again.
   * @param {!INode} node The aggregation node to separate.
   * @throws The <code>node</code> is not in the graph or is currently hidden or is not an aggregation node.
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

  /**
   * @param {!AggregationEdge} aggregationEdge
   */
  $showOrRemoveAggregatedEdges(aggregationEdge) {
    for (const aggregatedEdge of aggregationEdge.aggregatedEdges) {
      if (aggregatedEdge instanceof AggregationEdge) {
        const replacedEdge = aggregationEdge
        // manually show aggregated AggregationEdges, other edges are handled by filtered graph
        if (this.contains(replacedEdge.sourcePort) && this.contains(replacedEdge.targetPort)) {
          this.$show(aggregatedEdge)
        } else {
          this.$removeAggregationEdge(replacedEdge)
        }
      }
    }
  }

  /**
   * When nodes are separated in a different order they were aggregated, we need to create new aggregation edges for the nodes that were just expanded.
   * @param {!AggregationNode} aggregationNode
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

  /**
   * @param {!AdjacencyTypes} adjacencyType
   * @param {!INode} node
   * @param {!IMap.<INode,AggregationEdge>} seenNodes
   */
  $replaceMissingEdgesCore(adjacencyType, node, seenNodes) {
    const isIncoming = adjacencyType === AdjacencyTypes.INCOMING

    let edgesAt = this.$aggregationEdges.filter(edge =>
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

  /**
   * @param {!INode} node
   * @returns {?AggregationNode}
   */
  $findAggregationNode(node) {
    return this.aggregationNodes.firstOrDefault(n => n.aggregatedNodes.includes(node))
  }

  /**
   * Separates all aggregation nodes such that this graph contains exactly the same items as the {@link GraphWrapperBase#wrappedGraph}.
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
   * Returns <code>true</code> iff the <code>item</code> is an aggregation item and therefore not contained in the wrapped graph.
   * Does not check if the item is currently {@link AggregationGraphWrapper#contains contained} in the graph or whether
   * the items was created by this graph instance.
   * @param {!IModelItem} item The item to check.
   * @returns {boolean} <code>true</code> iff the <code>item</code> is an aggregation item.
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
   * Returns the items that are directly aggregated by the <code>item</code>.
   * <p>
   * In contrast to {@link AggregationGraphWrapper#getAllAggregatedOriginalItems} this method returns both original as
   * well as aggregation items, but only direct descendants in the aggregation hierarchy.
   * </p>
   * <p>
   * <code>item</code> doesn't need to be {@link AggregationGraphWrapper#contains contained} currently but might be
   * aggregated in another item.
   * </p>
   * @param {!T} item The aggregation item.
   * @returns {!IListEnumerable.<T>} The items that are aggregated by the <code>item</code>. If an aggregation node is passed, this will return
   * the aggregated nodes. If an aggregation edge is passed, this will return the edges it replaces. Otherwise an empty
   * enumerable will be returned. The enumerable may contain both aggregation items as well as original items.
   * @template {IModelItem} T
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
   * Returns the (recursively) aggregated original items of the <code>item</code>.
   * In contrast to {@link AggregationGraphWrapper#getAggregatedItems} this method returns only original items, but also
   * items recursively nested in the aggregation hierarchy.
   * @param {!IModelItem} item The aggregation item.
   * @returns {!IListEnumerable.<IModelItem>} A list of items of the {@link GraphWrapperBase#wrappedGraph} that is either directly contained in the
   * <code>item</code> or recursively in any contained aggregation items. This list consists only of items of the wrapped graph.
   * @see AggregationGraphWrapper#getAggregatedItems
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
   * If <code>item</code> is an aggregation node or aggregation edge, all aggregated items are removed as well.
   * @param {!IModelItem} item The item to remove.
   */
  remove(item) {
    if (!this.contains(item)) {
      throw new Error('ArgumentError: Affected parameter item: Item is not in this graph.')
    }
    this.$removeCore(item)
  }

  /**
   * @param {!IModelItem} item
   */
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

  /**
   * @param {!IPort} port
   */
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
      edge => edge.sourcePort === port || edge.targetPort === port
    ).size
    if (!isAggregationItem) {
      edgesAtPort += super.edgesAt(port, AdjacencyTypes.ALL).size
    }
    if (edgesAtPort === 0) {
      this.$removeCore(port)
    }
  }

  /**
   * @param {!AggregationNode} aggregationNode
   */
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

  /**
   * @param {!AggregationEdge} aggregationEdge
   */
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
    this.$filteredAggregationItems.delete(aggregationEdge)
    aggregationEdge.graph = null
    this.onEdgeRemoved(new EdgeEventArgs(aggregationEdge))
  }

  /**
   * @param {!AggregationBend} aggregationBend
   */
  $removeAggregationBend(aggregationBend) {
    const bendList = aggregationBend.owner.$bends
    const index = bendList.indexOf(aggregationBend)
    bendList.remove(aggregationBend)
    aggregationBend.graph = null
    this.onBendRemoved(new BendEventArgs(aggregationBend, aggregationBend.owner, index))
  }

  /**
   * @param {!AggregationPort} aggregationPort
   */
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

  /**
   * @param {!AggregationLabel} aggregationLabel
   */
  $removeAggregationLabel(aggregationLabel) {
    aggregationLabel.owner.$labels.remove(aggregationLabel)
    aggregationLabel.graph = null
    this.onLabelRemoved(new LabelEventArgs(aggregationLabel, aggregationLabel.owner))
  }

  /**
   * @template {(IPortOwner|IPort)} T
   * @param {!T} owner
   * @param {!AdjacencyTypes} type
   * @returns {!IListEnumerable.<IEdge>}
   */
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
            this.edges.filter(edge => owner.ports.includes(edge.targetPort))
          )
        case AdjacencyTypes.OUTGOING:
          return new ListEnumerable(
            this.edges.filter(edge => owner.ports.includes(edge.sourcePort))
          )
        default:
        case AdjacencyTypes.ALL:
          return new ListEnumerable(
            this.edges.filter(
              edge => owner.ports.includes(edge.sourcePort) || owner.ports.includes(edge.targetPort)
            )
          )
      }
    } else {
      switch (type) {
        case AdjacencyTypes.NONE:
          return IListEnumerable.EMPTY
        case AdjacencyTypes.INCOMING:
          return new ListEnumerable(this.edges.filter(edge => owner === edge.targetPort))
        case AdjacencyTypes.OUTGOING:
          return new ListEnumerable(this.edges.filter(edge => owner === edge.sourcePort))
        default:
        case AdjacencyTypes.ALL:
          return new ListEnumerable(
            this.edges.filter(edge => owner === edge.sourcePort || owner === edge.targetPort)
          )
      }
    }
  }

  /**
   * @param {!IEdge} edge
   * @param {!IPort} sourcePort
   * @param {!IPort} targetPort
   */
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

  /**
   * @param {?IModelItem} item
   * @returns {boolean}
   */
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

  /**
   * @param {!INode} node
   * @param {!Rect} layout
   */
  setNodeLayout(node, layout) {
    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }
    if (isNaN(layout.x) || isNaN(layout.y) || isNaN(layout.width) || isNaN(layout.height)) {
      throw new Error(
        `ArgumentError: Affected parameter layout: The layout must not contain a NaN value. ${layout}`
      )
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      const oldLayout = aggregationNode.layout.toRect()
      aggregationNode.layout.reshape(layout)
      this.onNodeLayoutChanged(aggregationNode, oldLayout)
    } else {
      super.setNodeLayout(node, layout)
    }
  }

  /**
   * @param {!(IPortOwner|object)} owner
   * @param {?IPortLocationModelParameter} [locationParameter]
   * @param {?IPortStyle} [style]
   * @param {*} [tag]
   * @returns {!IPort}
   */
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

  /**
   * @param {!IPort} port
   * @param {!IPortLocationModelParameter} locationParameter
   */
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
    if (!locationParameter.supports(port.owner)) {
      throw new Error(
        'ArgumentError: Affected parameter locationParameter: The parameter does not support this port'
      )
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

  /**
   * @param {!IEdge} edge
   * @param {!Point} location
   * @param {number} index
   * @returns {!IBend}
   */
  addBend(edge, location, index = -1) {
    if (!this.contains(edge)) {
      throw new Error('ArgumentError: Affected parameter edge: Edge is not in this graph.')
    }
    if (isNaN(location.x) || isNaN(location.y)) {
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

  /**
   * @param {!IBend} bend
   * @param {!Point} location
   */
  setBendLocation(bend, location) {
    if (location.equals(bend.location)) {
      return
    }
    if (!this.contains(bend)) {
      throw new Error('ArgumentError: Affected parameter bend: Edge is not in this graph.')
    }
    if (isNaN(location.x) || isNaN(location.y)) {
      throw new Error(
        'ArgumentError: Affected parameter location: The location must not contain a NaN value.'
      )
    }

    const aggregationBend = bend instanceof AggregationBend ? bend : null
    if (aggregationBend) {
      const oldLocation = aggregationBend.location.toPoint()
      aggregationBend.location.relocate(location)
      this.onBendLocationChanged(bend, oldLocation)
    } else {
      super.setBendLocation(bend, location)
    }
  }

  /**
   * @param {!(ILabelOwner|object)} owner
   * @param {!string} [text]
   * @param {?ILabelModelParameter} [layoutParameter]
   * @param {?ILabelStyle} [style]
   * @param {?(Size|SizeConvertible)} [preferredSize]
   * @param {*} [tag]
   * @returns {!ILabel}
   */
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

    if (!(preferredSize instanceof Size)) {
      if (Array.isArray(preferredSize)) {
        preferredSize = new Size(preferredSize[0], preferredSize[1])
      } else if (preferredSize) {
        preferredSize = new Size(preferredSize.width, preferredSize.height)
      }
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
      if (!!preferredSize && (isNaN(preferredSize.width) || isNaN(preferredSize.height))) {
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

  /**
   * @param {!(AggregationNode|AggregationEdge|AggregationPort)} owner
   * @returns {?ILabelModelParameter}
   */
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

  /**
   * @param {!(AggregationNode|AggregationEdge|AggregationPort)} owner
   * @returns {!ILabelStyle}
   */
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

  /**
   * @param {!ILabel} label
   * @param {!string} text
   */
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

  /**
   * @param {!ILabel} label
   * @param {!Size} preferredSize
   */
  setLabelPreferredSize(label, preferredSize) {
    if (label.preferredSize.equals(preferredSize)) {
      return
    }
    if (!this.contains(label)) {
      throw new Error('ArgumentError: Affected parameter label: Label is not in this graph.')
    }
    if (isNaN(preferredSize.width) || isNaN(preferredSize.height)) {
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

  /**
   * @param {!ILabel} label
   * @param {!ILabelModelParameter} layoutParameter
   */
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
    if (!layoutParameter.supports(label)) {
      throw new Error(
        'ArgumentError: Affected parameter layoutParameter: The parameter does not support the label.'
      )
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

  /**
   * @param {!(INode|IEdge|ILabel|IPort)} item
   * @param {!(INodeStyle|IEdgeStyle|ILabelStyle|IPortStyle)} style
   */
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

  /**
   * @param {!INode} node
   * @returns {!IListEnumerable.<INode>}
   */
  getChildren(node) {
    if (!node) {
      // top-level nodes
      return new ListEnumerable(this.nodes.filter(n => this.getParent(n) === null))
    }

    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      return new ListEnumerable(aggregationNode.children || IListEnumerable.EMPTY)
    }

    return new ListEnumerable(
      super.getChildren(node).concat(this.aggregationNodes.filter(an => an.parent === node))
    )
  }

  /**
   * @param {!INode} node
   * @returns {?INode}
   */
  getParent(node) {
    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      return aggregationNode.parent
    }

    const aggregationNodeParent = this.aggregationNodes.firstOrDefault(
      parent => !!parent.children && parent.children.includes(node)
    )
    if (aggregationNodeParent) {
      return aggregationNodeParent
    }

    return super.getParent(node)
  }

  /**
   * @param {!INode} node
   * @param {!INode} parent
   */
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

  /**
   * @param {!INode} node
   * @param {boolean} isGroupNode
   */
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

  /**
   * @param {?INode} node
   * @returns {boolean}
   */
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

  /**
   * @template {(INode|IPort)} T
   * @param {!(T|object)} source
   * @param {!T} [target]
   * @param {?IEdgeStyle} [style]
   * @param {*} [tag]
   * @returns {!IEdge}
   */
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
        this.onEdgeCreated(new ItemEventArgs(aggregationEdge))
        return aggregationEdge
      }
      return super.createEdge(sourcePort, targetPort, style, tag)
    }
  }

  /**
   * Does not raise EdgeCreated event!!
   * @param {!IPort} sourcePort
   * @param {!IPort} targetPort
   * @param {*} [tag]
   * @returns {!AggregationEdge}
   */
  $createAggregationEdge(sourcePort, targetPort, tag) {
    const edgeStyle = this.aggregationEdgeDefaults.getStyleInstance()
    const aggregationEdge = new AggregationEdge(this, sourcePort, targetPort, edgeStyle)
    aggregationEdge.tag = tag || null
    this.$aggregationEdges.add(aggregationEdge)
    return aggregationEdge
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(type) {
    return this.$lookupDecorator.lookup(type)
  }

  /**
   * @param {!IContextLookupChainLink} lookup
   */
  addLookup(lookup) {
    this.$lookupDecorator.addLookup(IGraph.$class, lookup)
  }

  /**
   * @param {!IContextLookupChainLink} lookup
   */
  removeLookup(lookup) {
    this.$lookupDecorator.removeLookup(IGraph.$class, lookup)
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  baseLookup(type) {
    return super.lookup(type)
  }

  /**
   * @param {!(AggregationNode|AggregationEdge|AggregationLabel|AggregationPort|AggregationBend)} aggregationItem
   * @param {!Class} type
   * @returns {?object}
   */
  delegateLookup(aggregationItem, type) {
    return this.$lookupDecorator.delegateLookup(aggregationItem, type)
  }

  /**
   * @param {!IModelItem} item
   * @param {!object} oldTag
   */
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
 * New chain links are added to the chains of this decorator as well as to the decorator of the {@link GraphWrapperBase#wrappedGraph}.
 */
class AggregationLookupDecorator extends BaseClass(ILookup, ILookupDecorator) {
  /**
   * @param {!AggregationGraphWrapper} graph
   */
  constructor(graph) {
    super()
    this.$graph = graph

    this.$wrappedDecorator = null

    this.$graphLookupChain = new LookupChain()
    this.$graphLookupChain.add(new GraphFallBackLookup())

    this.$nodeLookupChain = new LookupChain()
    this.$nodeLookupChain.add(new ItemFallBackLookup())
    this.$nodeLookupChain.add(new ItemDefaultLookup(DefaultGraph.DEFAULT_NODE_LOOKUP))
    this.$nodeLookupChain.add(new BlockReshapeAndPositionHandlerLookup())

    this.$edgeLookupChain = new LookupChain()
    this.$edgeLookupChain.add(new ItemFallBackLookup())
    this.$edgeLookupChain.add(new ItemDefaultLookup(DefaultGraph.DEFAULT_EDGE_LOOKUP))

    this.$bendLookupChain = new LookupChain()
    this.$bendLookupChain.add(new ItemFallBackLookup())
    this.$bendLookupChain.add(new ItemDefaultLookup(DefaultGraph.DEFAULT_BEND_LOOKUP))

    this.$portLookupChain = new LookupChain()
    this.$portLookupChain.add(new ItemFallBackLookup())
    this.$portLookupChain.add(new ItemDefaultLookup(DefaultGraph.DEFAULT_PORT_LOOKUP))

    this.$labelLookupChain = new LookupChain()
    this.$labelLookupChain.add(new ItemFallBackLookup())
    this.$labelLookupChain.add(new ItemDefaultLookup(DefaultGraph.DEFAULT_LABEL_LOOKUP))
  }

  /**
   * @param {!Class} t
   * @returns {boolean}
   */
  canDecorate(t) {
    if (
      t === INode.$class ||
      t === IEdge.$class ||
      t === IBend.$class ||
      t === IPort.$class ||
      t === ILabel.$class ||
      t === IModelItem.$class ||
      t === IGraph.$class
    ) {
      return !this.$wrappedDecorator || this.$wrappedDecorator.canDecorate(t)
    }
    return false
  }

  /**
   * @param {!Class} t
   * @param {!IContextLookupChainLink} lookup
   */
  addLookup(t, lookup) {
    if (t === INode.$class) {
      this.$nodeLookupChain.add(lookup)
    } else if (t === IEdge.$class) {
      this.$edgeLookupChain.add(lookup)
    } else if (t === IBend.$class) {
      this.$bendLookupChain.add(lookup)
    } else if (t === IPort.$class) {
      this.$portLookupChain.add(lookup)
    } else if (t === ILabel.$class) {
      this.$labelLookupChain.add(lookup)
    } else if (t === IGraph.$class) {
      this.$graphLookupChain.add(lookup)
    } else {
      throw new Error(`ArgumentError: Cannot decorate type ${t}`)
    }

    if (this.$wrappedDecorator) {
      this.$wrappedDecorator.addLookup(t, lookup)
    }
  }

  /**
   * @param {!Class} t
   * @param {!IContextLookupChainLink} lookup
   */
  removeLookup(t, lookup) {
    if (t === INode.$class) {
      this.$nodeLookupChain.remove(lookup)
    } else if (t === IEdge.$class) {
      this.$edgeLookupChain.remove(lookup)
    } else if (t === IBend.$class) {
      this.$bendLookupChain.remove(lookup)
    } else if (t === IPort.$class) {
      this.$portLookupChain.remove(lookup)
    } else if (t === ILabel.$class) {
      this.$labelLookupChain.remove(lookup)
    } else if (t === IGraph.$class) {
      this.$graphLookupChain.remove(lookup)
    }

    if (this.$wrappedDecorator) {
      this.$wrappedDecorator.removeLookup(t, lookup)
    }
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(type) {
    if (type === ILookupDecorator.$class) {
      this.$wrappedDecorator = this.$graph.baseLookup(type)
      return this
    }
    if (type === LookupChain.$class) {
      return this.$graphLookupChain
    }

    const lookup = this.$graph.getLookup()
    if (lookup) {
      return lookup.lookup(type)
    }

    return this.$graphLookupChain.contextLookup(this.$graph, type)
  }

  /**
   * @param {!IModelItem} item
   * @param {!Class} type
   * @returns {?object}
   */
  delegateLookup(item, type) {
    if (item instanceof INode) {
      return this.$nodeLookupChain.contextLookup(item, type)
    } else if (item instanceof IEdge) {
      return this.$edgeLookupChain.contextLookup(item, type)
    } else if (item instanceof ILabel) {
      return this.$labelLookupChain.contextLookup(item, type)
    } else if (item instanceof IBend) {
      return this.$bendLookupChain.contextLookup(item, type)
    } else if (item instanceof IPort) {
      return this.$portLookupChain.contextLookup(item, type)
    } else {
      return null
    }
  }
}

class ContextLookupChainLinkBase extends BaseClass(IContextLookupChainLink) {
  constructor() {
    super()
    this.$nextLink = null
  }

  /**
   * @param {!object} item
   * @param {!Class} type
   * @returns {?object}
   */
  contextLookup(item, type) {
    return this.$nextLink ? this.$nextLink.contextLookup(item, type) : null
  }

  /**
   * @param {!IContextLookup} next
   */
  setNext(next) {
    this.$nextLink = next
  }
}

class GraphFallBackLookup extends ContextLookupChainLinkBase {
  /**
   * @param {!object} item
   * @param {!Class} type
   * @returns {?object}
   */
  contextLookup(item, type) {
    return item.baseLookup(type) || super.contextLookup(item, type)
  }
}

class ItemFallBackLookup extends ContextLookupChainLinkBase {
  /**
   * @param {!object} item
   * @param {!Class} type
   * @returns {?object}
   */
  contextLookup(item, type) {
    return item.innerLookup(type) || super.contextLookup(item, type)
  }
}

class BlockReshapeAndPositionHandlerLookup extends ContextLookupChainLinkBase {
  /**
   * @param {!object} item
   * @param {!Class} type
   * @returns {?object}
   */
  contextLookup(item, type) {
    // The default implementations of IPositionHandler and IReshapeHandler don't support AggregationNode, which is
    // why moving and reshaping such nodes is not supported by default.
    if (type === IPositionHandler.$class || type === IReshapeHandler.$class) {
      return null
    }
    return super.contextLookup(item, type)
  }
}

class ItemDefaultLookup extends ContextLookupChainLinkBase {
  /**
   * @param {!IContextLookup} defaultLookup
   */
  constructor(defaultLookup) {
    super()
    this.$defaultLookup = defaultLookup
  }

  /**
   * @param {!object} item
   * @param {!Class} type
   * @returns {?object}
   */
  contextLookup(item, type) {
    return this.$defaultLookup.contextLookup(item, type) || super.contextLookup(item, type)
  }
}

/**
 * A simple INode implementation for aggregation nodes.
 */
class AggregationNode extends BaseClass(INode) {
  /**
   * @type {!IList.<INode>}
   */
  get aggregatedNodes() {
    return this.$aggregatedNodes
  }

  /**
   * @type {!IMutableRectangle}
   */
  get layout() {
    return this.$layout
  }

  /**
   * @type {!IListEnumerable.<ILabel>}
   */
  get labels() {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  /**
   * @type {!IListEnumerable.<IPort>}
   */
  get ports() {
    if (!this.$portsEnumerable) {
      this.$portsEnumerable = new ListEnumerable(this.$ports)
    }
    return this.$portsEnumerable
  }

  /**
   * @type {*}
   */
  get tag() {
    return this.$tag
  }

  /**
   * @type {*}
   */
  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  get graph() {
    return this.$graph
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  set graph(graph) {
    this.$graph = graph
  }

  /**
   * @type {!INodeStyle}
   */
  get style() {
    return this.$style
  }

  /**
   * @type {!INodeStyle}
   */
  set style(style) {
    this.$style = style
  }

  /**
   * @type {?IList.<INode>}
   */
  get children() {
    return this.$children
  }

  /**
   * @type {?IList.<INode>}
   */
  set children(children) {
    this.$children = children
  }

  /**
   * @type {?INode}
   */
  get parent() {
    return this.$parent
  }

  /**
   * @type {?INode}
   */
  set parent(value) {
    this.$parent = value
  }

  /**
   * @param {!AggregationGraphWrapper} graph
   * @param {!IList.<INode>} aggregatedNodes
   * @param {!IMutableRectangle} layout
   * @param {!INodeStyle} style
   */
  constructor(graph, aggregatedNodes, layout, style) {
    super(graph)
    this.$labelsEnumerable = null
    this.$portsEnumerable = null
    this.$aggregatedNodes = aggregatedNodes
    this.$layout = layout
    this.$style = style
    this.$graph = graph
    this.$labels = new List()
    this.$ports = new List()

    this.$children = null
    this.$parent = null
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  innerLookup(type) {
    if (type === INodeStyle.$class) {
      return this.style
    }
    if (type.isInstance(this.layout)) {
      return this.layout
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  /**
   * @returns {!string}
   */
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
  /**
   * @type {boolean}
   */
  get isSelfloop() {
    return this.sourcePort.owner === this.targetPort.owner
  }

  /**
   * @type {!IList.<IEdge>}
   */
  get aggregatedEdges() {
    return this.$aggregatedEdges
  }

  /**
   * @type {!IListEnumerable.<IBend>}
   */
  get bends() {
    if (!this.$bendsEnumerable) {
      this.$bendsEnumerable = new ListEnumerable(this.$bends)
    }
    return this.$bendsEnumerable
  }

  /**
   * @type {!IListEnumerable.<ILabel>}
   */
  get labels() {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  /**
   * @type {!IListEnumerable.<IPort>}
   */
  get ports() {
    if (!this.$portsEnumerable) {
      this.$portsEnumerable = new ListEnumerable(this.$ports)
    }
    return this.$portsEnumerable
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  get graph() {
    return this.$graph
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  set graph(graph) {
    this.$graph = graph
  }

  /**
   * @type {!IPort}
   */
  get sourcePort() {
    return this.$sourcePort
  }

  /**
   * @type {!IPort}
   */
  set sourcePort(value) {
    this.$sourcePort = value
  }

  /**
   * @type {!IPort}
   */
  get targetPort() {
    return this.$targetPort
  }

  /**
   * @type {!IPort}
   */
  set targetPort(value) {
    this.$targetPort = value
  }

  /**
   * @type {!IEdgeStyle}
   */
  get style() {
    return this.$style
  }

  /**
   * @type {!IEdgeStyle}
   */
  set style(value) {
    this.$style = value
  }

  /**
   * @type {*}
   */
  get tag() {
    return this.$tag
  }

  /**
   * @type {*}
   */
  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  /**
   * @param {!AggregationGraphWrapper} graph
   * @param {!IPort} sourcePort
   * @param {!IPort} targetPort
   * @param {!IEdgeStyle} style
   */
  constructor(graph, sourcePort, targetPort, style) {
    super()
    this.$labelsEnumerable = null
    this.$portsEnumerable = null
    this.$bendsEnumerable = null
    this.$graph = graph
    this.$sourcePort = sourcePort
    this.$targetPort = targetPort
    this.$style = style
    this.$bends = new List()
    this.$ports = new List()
    this.$labels = new List()
    this.$aggregatedEdges = new List()
  }

  /**
   * @template {(IPort|IPortOwner)} T
   * @param {!T} port
   * @returns {!T}
   */
  opposite(port) {
    if (port instanceof IPort) {
      return port === this.sourcePort ? this.targetPort : this.sourcePort
    } else {
      return port === this.sourceNode ? this.targetNode : this.sourceNode
    }
  }

  /**
   * @param {!Class} type
   * @returns {?Record.<string,*>}
   */
  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  innerLookup(type) {
    if (type === IEdgeStyle.$class) {
      return this.style
    }
    if (type.isInstance(this.bends)) {
      return this.bends
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  /**
   * @returns {!string}
   */
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
  /**
   * @type {!IEdge}
   */
  get owner() {
    return this.$owner
  }

  /**
   * @type {!IMutablePoint}
   */
  get location() {
    return this.$location
  }

  /**
   * @type {*}
   */
  get tag() {
    return this.$tag
  }

  /**
   * @type {*}
   */
  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  get graph() {
    return this.$graph
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  set graph(graph) {
    this.$graph = graph
  }

  /**
   * @param {!AggregationGraphWrapper} graph
   * @param {!AggregationEdge} owner
   * @param {!MutablePoint} location
   */
  constructor(graph, owner, location) {
    super()
    this.$owner = owner
    this.$location = location
    this.$graph = graph
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  innerLookup(type) {
    if (type.isInstance(this.location)) {
      return this.location
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  /**
   * @returns {!string}
   */
  toString() {
    return `Aggregation Bend [${this.location.x}, ${this.location.y}]`
  }
}

/**
 * A simple IPort implementation for ports of {@link AggregationNode}, {@link AggregationEdge}, or {@link AggregationPort}.
 */
class AggregationPort extends BaseClass(IPort) {
  /**
   * @type {!IPortOwner}
   */
  get owner() {
    return this.$owner
  }

  /**
   * @type {!IListEnumerable.<ILabel>}
   */
  get labels() {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  /**
   * @type {!IPortLocationModelParameter}
   */
  get locationParameter() {
    return this.$locationParameter
  }

  /**
   * @type {!IPortLocationModelParameter}
   */
  set locationParameter(value) {
    this.$locationParameter = value
  }

  /**
   * @type {!IPortStyle}
   */
  get style() {
    return this.$style
  }

  /**
   * @type {!IPortStyle}
   */
  set style(value) {
    this.$style = value
  }

  /**
   * @type {!object}
   */
  get tag() {
    return this.$tag
  }

  /**
   * @type {!object}
   */
  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  get graph() {
    return this.$graph
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  set graph(graph) {
    this.$graph = graph
  }

  /**
   * @param {!AggregationGraphWrapper} graph
   * @param {!AggregationNode} owner
   * @param {!IPortLocationModelParameter} locationParameter
   * @param {!IPortStyle} style
   */
  constructor(graph, owner, locationParameter, style) {
    super()
    this.$labelsEnumerable = null
    this.$owner = owner
    this.$locationParameter = locationParameter
    this.$style = style
    this.$labels = new List()
    this.$graph = graph
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  innerLookup(type) {
    if (type === IPortStyle.$class) {
      return this.style
    }
    if (type === IPortLocationModelParameter.$class) {
      return this.locationParameter
    }
    if (type === IPoint.$class) {
      return this.dynamicLocation
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  /**
   * @returns {!string}
   */
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
  /**
   * @type {?ILabelOwner}
   */
  get owner() {
    return this.$owner
  }

  /**
   * @type {!ILabelModelParameter}
   */
  get layoutParameter() {
    return this.$layoutParameter
  }

  /**
   * @type {!ILabelModelParameter}
   */
  set layoutParameter(parameter) {
    this.$layoutParameter = parameter
  }

  /**
   * @type {!Size}
   */
  get preferredSize() {
    return this.$preferredSize
  }

  /**
   * @type {!Size}
   */
  set preferredSize(size) {
    this.$preferredSize = size
  }

  /**
   * @type {!ILabelStyle}
   */
  get style() {
    return this.$style
  }

  /**
   * @type {!ILabelStyle}
   */
  set style(style) {
    this.$style = style
  }

  /**
   * @type {!string}
   */
  get text() {
    return this.$text
  }

  /**
   * @type {!string}
   */
  set text(text) {
    this.$text = text
  }

  /**
   * @type {*}
   */
  get tag() {
    return this.$tag
  }

  /**
   * @type {*}
   */
  set tag(value) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  /**
   * @type {!IOrientedRectangle}
   */
  get layout() {
    return this.$layout
  }

  /**
   * @type {!IOrientedRectangle}
   */
  set layout(value) {
    this.$layout = value
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  get graph() {
    return this.$graph
  }

  /**
   * @type {?AggregationGraphWrapper}
   */
  set graph(graph) {
    this.$graph = graph
  }

  /**
   * @param {!AggregationGraphWrapper} graph
   * @param {!(AggregationNode|AggregationEdge|AggregationPort)} labelOwner
   * @param {!string} text
   * @param {!ILabelModelParameter} layoutParameter
   * @param {!Size} preferredSize
   * @param {!ILabelStyle} style
   */
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

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  lookup(type) {
    return this.graph ? this.graph.delegateLookup(this, type) : null
  }

  /**
   * @param {!Class} type
   * @returns {?object}
   */
  innerLookup(type) {
    if (type === ILabelStyle.$class) {
      return this.style
    }
    if (type === ILabelModelParameter.$class) {
      return this.layoutParameter
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  /**
   * @returns {!string}
   */
  toString() {
    return `Aggregation Label ["${this.text}"; Owner: ${this.owner}]`
  }
}
