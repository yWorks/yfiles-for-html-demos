/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/restrict-template-expressions */
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
  Size,
  type SizeConvertible
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
  private $filteredGraph?: FilteredGraphWrapper | null

  // the set of hidden nodes and edges
  private readonly $filteredOriginalNodes: Set<IModelItem>

  private $filteredAggregationItems: Set<
    AggregationNode | AggregationEdge | AggregationLabel | AggregationPort
  >

  private aggregationNodes: IList<AggregationNode>
  private $aggregationEdges: IList<AggregationEdge>

  // live views of the currently visible items
  private readonly $nodes: ListEnumerable<INode>
  private readonly $edges: ListEnumerable<IEdge>
  private readonly $labels: ListEnumerable<ILabel>
  private readonly $ports: ListEnumerable<IPort>

  private $aggregationNodeDefaults: INodeDefaults | undefined
  private $aggregationEdgeDefaults: IEdgeDefaults | undefined
  private $lookupDecorator: AggregationLookupDecorator

  /**
   * Creates a new instance of this graph wrapper.
   * @param graph The graph to be wrapped ("original graph").
   * @throws If the `graph` is another {@link AggregationGraphWrapper}
   */
  constructor(graph: IGraph) {
    super(graph)
    if (graph instanceof AggregationGraphWrapper) {
      throw new Error(
        'ArgumentError: Affected parameter graph: Cannot wrap another AggregationGraphWrapper'
      )
    }
    this.onGraphChanged(null, this.wrappedGraph)

    this.edgeReplacementPolicy = EdgeReplacementPolicy.UNDIRECTED

    this.$lookupDecorator = new AggregationLookupDecorator(this)

    this.$filteredOriginalNodes = new Set<IModelItem>()

    this.$filteredAggregationItems = new Set<
      AggregationNode | AggregationEdge | AggregationLabel | AggregationPort
    >()
    this.aggregationNodes = new List<AggregationNode>()
    this.$aggregationEdges = new List<AggregationEdge>()

    this.$nodes = new ListEnumerable<INode>(
      this.$filteredGraph!.nodes.concat(
        this.aggregationNodes.filter(this.$aggregationItemPredicate.bind(this))
      )
    )
    this.$edges = new ListEnumerable<IEdge>(
      this.$filteredGraph!.edges.concat(
        this.$aggregationEdges.filter(this.$aggregationItemPredicate.bind(this))
      )
    )
    this.$ports = new ListEnumerable<IPort>(
      this.$nodes.flatMap(node => node.ports).concat(this.$edges.flatMap(edge => edge.ports))
    )
    this.$labels = new ListEnumerable<ILabel>(
      this.$nodes
        .flatMap(node => node.labels)
        .concat(
          this.$edges.flatMap(edge => edge.labels).concat(this.$ports.flatMap(port => port.labels))
        )
    )
  }

  public get nodes(): IListEnumerable<INode> {
    return this.$nodes
  }

  public get edges(): IListEnumerable<IEdge> {
    return this.$edges
  }

  public get labels(): IListEnumerable<ILabel> {
    return this.$labels
  }

  public get ports(): IListEnumerable<IPort> {
    return this.$ports
  }

  /**
   * Sets what kind of edges should be created when replacing original edges with aggregation edges.
   * The default value is {@link EdgeReplacementPolicy.UNDIRECTED}.
   */
  public edgeReplacementPolicy = EdgeReplacementPolicy.NONE

  public get aggregationNodeDefaults(): INodeDefaults {
    if (!this.$aggregationNodeDefaults) {
      this.$aggregationNodeDefaults = new NodeDefaults()
    }
    return this.$aggregationNodeDefaults
  }

  public set aggregationNodeDefaults(value: INodeDefaults) {
    this.$aggregationNodeDefaults = value
  }

  public get aggregationEdgeDefaults(): IEdgeDefaults {
    if (!this.$aggregationEdgeDefaults) {
      this.$aggregationEdgeDefaults = new EdgeDefaults()
    }
    return this.$aggregationEdgeDefaults
  }

  public set aggregationEdgeDefaults(value: IEdgeDefaults) {
    this.$aggregationEdgeDefaults = value
  }

  /**
   * Calls the base method with the {@link AggregationGraphWrapper.$filteredGraph} instead of the passed graph for correct event forwarding.
   */
  public onGraphChanged(oldGraph: IGraph | null, newGraph: IGraph | null): void {
    if (!oldGraph) {
      this.$filteredGraph = new FilteredGraphWrapper(
        this.wrappedGraph!,
        this.$nodePredicate.bind(this),
        this.$edgePredicate.bind(this)
      )
      super.onGraphChanged(null, this.$filteredGraph)
    } else if (!newGraph) {
      this.$filteredGraph = null
      super.onGraphChanged(this.$filteredGraph, null)
    }
  }

  public dispose(): void {
    this.$filteredGraph!.dispose()
    super.dispose()
  }

  private $aggregationItemPredicate(
    item: AggregationNode | AggregationEdge | AggregationLabel | AggregationPort
  ): boolean {
    return !this.$filteredAggregationItems.has(item)
  }

  private $nodePredicate(node: INode): boolean {
    return !this.$filteredOriginalNodes || !this.$filteredOriginalNodes.has(node)
  }

  private $edgePredicate(edge: IEdge): boolean {
    return true
  }

  /**
   * Hides the `portOwner` and all items depending on it and raises the according removed events.
   * For nodes, their labels, ports and adjacent edges are hidden. For edges, their labels, ports and bends are hidden.
   */
  private $hide(portOwner: IPortOwner): void {
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

  private $hideAdjacentEdges(portOwner: AggregationNode | AggregationEdge | AggregationPort): void {
    this.edgesAt(portOwner, AdjacencyTypes.ALL).forEach(edge => this.$hide(edge))
  }

  /**
   * Shows an item, their labels/ports/bends, and their adjacent edges. Raises all necessary events.
   */
  private $show(item: IPortOwner): void {
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

  private $showAdjacentEdges(portOwner: IPortOwner): void {
    // - cannot use EdgesAt() here, since hidden edges are not considered there
    const adjacentEdges = this.$edges.filter(
      edge =>
        portOwner.ports.includes(edge.sourcePort!) || portOwner.ports.includes(edge.targetPort!)
    )
    for (const edge of adjacentEdges) {
      if (this.ports.includes(edge.sourcePort!) && this.ports.includes(edge.targetPort!)) {
        this.$show(edge)
      }
    }
  }

  private $raiseLabelAddedEvents(labelOwner: ILabelOwner): void {
    for (const label of labelOwner.labels) {
      this.onLabelAdded(new LabelEventArgs(label, labelOwner))
    }
  }

  private $raisePortAddedEvents(portOwner: IPortOwner): void {
    for (const port of portOwner.ports) {
      this.onPortAdded(new PortEventArgs(port, portOwner))
      this.$raiseLabelAddedEvents(port)
    }
  }

  private $raiseLabelRemovedEvents(
    labelOwner: AggregationNode | AggregationEdge | AggregationPort
  ): void {
    for (const label of labelOwner.labels) {
      this.onLabelRemoved(new LabelEventArgs(label, labelOwner))
    }
  }

  private $raisePortRemovedEvents(portOwner: AggregationNode | AggregationEdge): void {
    for (const port of portOwner.ports) {
      this.$raiseLabelRemovedEvents(port as AggregationPort)
      this.onPortRemoved(new PortEventArgs(port, portOwner))
    }
  }

  private $predicateChanged(item: IModelItem): void {
    if (item instanceof INode) {
      this.$filteredGraph!.nodePredicateChanged(item)
    } else if (item instanceof IEdge) {
      this.$filteredGraph!.edgePredicateChanged(item)
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
  public aggregate(
    nodes: IListEnumerable<INode>,
    layout?: Rect,
    style?: INodeStyle,
    tag?: any
  ): INode {
    const badNode = nodes.find(node => !this.contains(node))
    if (badNode != null) {
      throw new Error(
        `ArgumentError: Affected parameter nodes: Cannot aggregate node ${badNode} that is not in this graph.`
      )
    }

    const nodeLayout = layout
      ? new MutableRectangle(layout)
      : new MutableRectangle(Point.ORIGIN, this.aggregationNodeDefaults.size)
    const nodeStyle = style || this.aggregationNodeDefaults.getStyleInstance()
    const aggregatedNodes: IList<INode> = new List<INode>(nodes)
    const aggregationNode = new AggregationNode(this, aggregatedNodes, nodeLayout, nodeStyle)
    aggregationNode.tag = tag || null
    const parent = this.groupingSupport.getNearestCommonAncestor(nodes)
    if (parent) {
      aggregationNode.parent = parent
      const aggregationNodeParent = parent instanceof AggregationNode ? parent : null
      if (aggregationNodeParent) {
        aggregationNodeParent.children!.add(aggregationNode)
      }
    }

    this.aggregationNodes.add(aggregationNode)
    this.onNodeCreated(new ItemEventArgs<INode>(aggregationNode))

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
  private $replaceAdjacentEdges(
    nodes: IListEnumerable<INode>,
    aggregationNode: AggregationNode
  ): void {
    const edgesAreDirected = this.edgeReplacementPolicy === EdgeReplacementPolicy.DIRECTED
    const outgoingReplacementEdges = new HashMap<IPortOwner, AggregationEdge>()
    const incomingReplacementEdges = edgesAreDirected
      ? new HashMap<IPortOwner, AggregationEdge>()
      : outgoingReplacementEdges
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

  private $replaceEdges(
    adjacencyType: AdjacencyTypes,
    node: INode,
    aggregationPortOwner: IPortOwner,
    items: IListEnumerable<INode>,
    replacementEdges: IMap<IPortOwner, AggregationEdge>
  ): void {
    const adjacentEdges = this.edgesAt(node, adjacencyType).toList()
    for (const edge of adjacentEdges) {
      const isIncoming = adjacencyType === AdjacencyTypes.INCOMING
      const otherPort = isIncoming ? edge.sourcePort : edge.targetPort

      const otherPortOwner = otherPort!.owner
      if (items.includes(otherPortOwner as AggregationNode)) {
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

      const replacementEdge = this.$replaceEdge(edge, aggregationPortOwner, otherPort!, isIncoming)
      replacementEdges.set(otherPortOwner, replacementEdge)
    }
  }

  private $replaceEdge(
    edge: IEdge,
    newPortOwner: IPortOwner,
    otherPort: IPort,
    isIncoming: boolean
  ): AggregationEdge {
    const aggregationPort = this.addPort(newPortOwner)
    let replacementEdge: AggregationEdge
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
  public separate(node: INode): void {
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
      this.$removeAggregationEdge(edge as AggregationEdge)
    }

    this.$removeAggregationNode(aggregationNode)
    for (const aggregatedNode of aggregationNode.aggregatedNodes) {
      this.$show(aggregatedNode)
    }

    for (const edge of adjacentEdges) {
      this.$showOrRemoveAggregatedEdges(edge as AggregationEdge)
    }

    if (this.edgeReplacementPolicy !== EdgeReplacementPolicy.NONE) {
      this.$replaceMissingEdges(aggregationNode)
    }
  }

  private $showOrRemoveAggregatedEdges(aggregationEdge: AggregationEdge): void {
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
   */
  private $replaceMissingEdges(aggregationNode: AggregationNode): void {
    const edgesAreDirected = this.edgeReplacementPolicy === EdgeReplacementPolicy.DIRECTED
    const aggregatedNodes = aggregationNode.aggregatedNodes
    for (const node of aggregatedNodes) {
      const outgoingReplacementEdges = new HashMap<INode, AggregationEdge>()
      const incomingReplacementEdges = edgesAreDirected
        ? new HashMap<INode, AggregationEdge>()
        : outgoingReplacementEdges
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

  private $replaceMissingEdgesCore(
    adjacencyType: AdjacencyTypes,
    node: INode,
    seenNodes: IMap<INode, AggregationEdge>
  ): void {
    const isIncoming = adjacencyType === AdjacencyTypes.INCOMING

    let edgesAt: IEnumerable<IEdge> = this.$aggregationEdges.filter(edge =>
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

      aggregationEdge = this.$replaceEdge(edge, otherNode, thisPort!, isIncoming)
      seenNodes.set(otherNode, aggregationEdge)
    }
  }

  private $findAggregationNode(node: INode): AggregationNode | null {
    return this.aggregationNodes.find(n => n.aggregatedNodes.includes(node))
  }

  /**
   * Separates all aggregation nodes such that this graph contains exactly the same items as the {@link GraphWrapperBase.wrappedGraph}.
   */
  public separateAll(): void {
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
  public isAggregationItem(item: IModelItem): boolean {
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
  public getAggregatedItems<T extends IModelItem>(item: T): IListEnumerable<T> {
    if (item instanceof AggregationNode) {
      return new ListEnumerable<T>(item.aggregatedNodes as unknown as IList<T>)
    }

    if (item instanceof AggregationEdge) {
      return new ListEnumerable<T>(item.aggregatedEdges as unknown as IList<T>)
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
  public getAllAggregatedOriginalItems(item: IModelItem): IListEnumerable<IModelItem> {
    const result = new List<IModelItem>()
    const aggregatedItems = this.getAggregatedItems(item)
    for (const aggregatedItem of aggregatedItems) {
      if (this.isAggregationItem(aggregatedItem)) {
        result.addRange(this.getAllAggregatedOriginalItems(aggregatedItem))
      } else {
        result.add(aggregatedItem)
      }
    }
    return new ListEnumerable<IModelItem>(result)
  }

  /**
   * Removes the given item from the graph.
   * If `item` is an aggregation node or aggregation edge, all aggregated items are removed as well.
   * @param item The item to remove.
   */
  public remove(item: IModelItem): void {
    if (!this.contains(item)) {
      throw new Error('ArgumentError: Affected parameter item: Item is not in this graph.')
    }
    this.$removeCore(item)
  }

  private $removeCore(item: IModelItem): void {
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

  private $cleanupPort(port: IPort): void {
    const isAggregationItem = this.isAggregationItem(port)
    let tmp
    // check the auto-cleanup policy to apply
    const autoCleanUp = (
      isAggregationItem
        ? this.aggregationNodeDefaults
        : this.isGroupNode((tmp = port.owner) instanceof INode ? tmp : null)
        ? this.wrappedGraph!.groupNodeDefaults
        : this.wrappedGraph!.nodeDefaults
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

  private $removeAggregationNode(aggregationNode: AggregationNode): void {
    for (const port of aggregationNode.ports.toList()) {
      this.$removeAggregationPort(port as AggregationPort)
    }
    for (const label of aggregationNode.labels.toList()) {
      this.$removeAggregationLabel(label as AggregationLabel)
    }
    const oldIsGroupNode = this.isGroupNode(aggregationNode)
    const oldParent = this.getParent(aggregationNode)
    this.aggregationNodes.remove(aggregationNode)
    aggregationNode.graph = null
    this.onNodeRemoved(new NodeEventArgs(aggregationNode, oldParent, oldIsGroupNode))
  }

  private $removeAggregationEdge(aggregationEdge: AggregationEdge): void {
    for (const label of aggregationEdge.labels.toList()) {
      this.$removeAggregationLabel(label as AggregationLabel)
    }
    for (const port of aggregationEdge.ports.toList()) {
      this.$removeAggregationPort(port as AggregationPort)
    }
    for (const bend of aggregationEdge.bends.toList()) {
      this.$removeAggregationBend(bend as AggregationBend)
    }
    this.$aggregationEdges.remove(aggregationEdge)
    this.$filteredAggregationItems.delete(aggregationEdge)
    aggregationEdge.graph = null
    this.onEdgeRemoved(new EdgeEventArgs(aggregationEdge))
  }

  private $removeAggregationBend(aggregationBend: AggregationBend): void {
    const bendList = (aggregationBend.owner as AggregationEdge).$bends
    const index = bendList.indexOf(aggregationBend)
    bendList.remove(aggregationBend)
    aggregationBend.graph = null
    this.onBendRemoved(new BendEventArgs(aggregationBend, aggregationBend.owner, index))
  }

  private $removeAggregationPort(aggregationPort: AggregationPort): void {
    for (const edge of this.edgesAt(aggregationPort, AdjacencyTypes.ALL).toList()) {
      this.$removeAggregationEdge(edge as AggregationEdge)
    }
    for (const label of aggregationPort.labels.toList()) {
      this.$removeAggregationLabel(label as AggregationLabel)
    }
    ;(aggregationPort.owner as AggregationNode | AggregationEdge)!.$ports.remove(aggregationPort)
    aggregationPort.graph = null
    this.onPortRemoved(new PortEventArgs(aggregationPort, aggregationPort.owner))
  }

  private $removeAggregationLabel(aggregationLabel: AggregationLabel): void {
    ;(aggregationLabel.owner as
      | AggregationNode
      | AggregationEdge
      | AggregationPort)!.$labels.remove(aggregationLabel)
    aggregationLabel.graph = null
    this.onLabelRemoved(new LabelEventArgs(aggregationLabel, aggregationLabel.owner!))
  }

  public edgesAt<T extends IPortOwner | IPort>(
    owner: T,
    type: AdjacencyTypes
  ): IListEnumerable<IEdge> {
    if (!this.contains(owner)) {
      throw Error('ArgumentError: Affected parameter owner: Owner is not in this graph')
    }

    if (owner instanceof IPortOwner) {
      switch (type) {
        case AdjacencyTypes.NONE:
          return IListEnumerable.EMPTY
        case AdjacencyTypes.INCOMING:
          return new ListEnumerable<IEdge>(
            this.edges.filter(edge => owner.ports.includes(edge.targetPort!))
          )
        case AdjacencyTypes.OUTGOING:
          return new ListEnumerable<IEdge>(
            this.edges.filter(edge => owner.ports.includes(edge.sourcePort!))
          )
        default:
        case AdjacencyTypes.ALL:
          return new ListEnumerable<IEdge>(
            this.edges.filter(
              edge =>
                owner.ports.includes(edge.sourcePort!) || owner.ports.includes(edge.targetPort!)
            )
          )
      }
    } else {
      switch (type) {
        case AdjacencyTypes.NONE:
          return IListEnumerable.EMPTY
        case AdjacencyTypes.INCOMING:
          return new ListEnumerable<IEdge>(this.edges.filter(edge => owner === edge.targetPort))
        case AdjacencyTypes.OUTGOING:
          return new ListEnumerable<IEdge>(this.edges.filter(edge => owner === edge.sourcePort))
        default:
        case AdjacencyTypes.ALL:
          return new ListEnumerable<IEdge>(
            this.edges.filter(edge => owner === edge.sourcePort || owner === edge.targetPort)
          )
      }
    }
  }

  public setEdgePorts(edge: IEdge, sourcePort: IPort, targetPort: IPort): void {
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

  public contains(item: IModelItem | null): boolean {
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
    return this.$filteredGraph!.contains(item)
  }

  public setNodeLayout(node: INode, layout: Rect): void {
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

  public addPort(
    owner:
      | IPortOwner
      | {
          owner: IPortOwner
          locationParameter?: IPortLocationModelParameter | null
          style?: IPortStyle | null
          tag?: any
        },
    locationParameter?: IPortLocationModelParameter | null,
    style?: IPortStyle | null,
    tag?: any
  ): IPort {
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

      this.onPortAdded(new ItemEventArgs<IPort>(aggregationPort))
      return aggregationPort
    }
    if (locationParameter) {
      return super.addPort(owner, locationParameter, style, tag)
    } else {
      return super.addPort(owner)
    }
  }

  public setPortLocationParameter(
    port: IPort,
    locationParameter: IPortLocationModelParameter
  ): void {
    if (port.locationParameter === locationParameter) {
      return
    }
    if (!this.contains(port)) {
      throw new Error('ArgumentError: Affected parameter port: Port does not belong to this graph')
    }
    if (!locationParameter) {
      throw new Error('ArgumentError: Argument for parameter locationParameter is null')
    }
    if (!locationParameter.supports(port.owner!)) {
      throw new Error(
        'ArgumentError: Affected parameter locationParameter: The parameter does not support this port'
      )
    }

    const aggregationPort = port instanceof AggregationPort ? port : null
    if (aggregationPort) {
      const oldParameter = port.locationParameter
      aggregationPort.locationParameter = locationParameter
      this.onPortLocationParameterChanged(
        new ItemChangedEventArgs<IPort, IPortLocationModelParameter>(port, oldParameter)
      )
    } else {
      super.setPortLocationParameter(port, locationParameter)
    }
  }

  public addBend(edge: IEdge, location: Point, index = -1): IBend {
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
        ;(bendList as IList<IBend>).add(aggregationBend)
      } else {
        ;(bendList as IList<IBend>).insert(index, aggregationBend)
      }
      this.onBendAdded(new ItemEventArgs<IBend>(aggregationBend))
      return aggregationBend
    }
    return super.addBend(edge, location, index)
  }

  public setBendLocation(bend: IBend, location: Point): void {
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

  public addLabel(
    owner:
      | ILabelOwner
      | {
          owner: ILabelOwner
          text: string
          layoutParameter?: ILabelModelParameter | null
          style?: ILabelStyle | null
          preferredSize?: Size | SizeConvertible | null
          tag?: any
        },
    text?: string,
    layoutParameter?: ILabelModelParameter | null,
    style?: ILabelStyle | null,
    preferredSize?: Size | SizeConvertible | null,
    tag?: any
  ): ILabel {
    if (!(owner instanceof ILabelOwner)) {
      const options = owner
      owner = options.owner
      text = options.text
      layoutParameter = options.layoutParameter
      style = options.style
      preferredSize = options.preferredSize
      tag = options.tag
    }

    if (preferredSize && !(preferredSize instanceof Size)) {
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
      if (!!preferredSize && (isNaN(preferredSize.width) || isNaN(preferredSize.height))) {
        throw new Error(
          'ArgumentError: Affected parameter preferredSize: The size must not contain a NaN value.'
        )
      }

      const labelModelParameter = layoutParameter || this.$getLabelModelParameter(labelOwner)
      const labelStyle = style || this.$getLabelStyle(labelOwner)
      const labelPreferredSize =
        preferredSize ||
        this.calculateLabelPreferredSize(labelOwner, text!, labelModelParameter, labelStyle)

      const aggregationLabel = new AggregationLabel(
        this,
        labelOwner,
        text!,
        layoutParameter!,
        labelPreferredSize as Size,
        labelStyle
      )
      aggregationLabel.tag = tag
      labelOwner.$labels.add(aggregationLabel)

      this.onLabelAdded(new ItemEventArgs<ILabel>(aggregationLabel))
      return aggregationLabel
    }
    return super.addLabel(owner, text!, layoutParameter, style, preferredSize, tag)
  }

  private $getLabelModelParameter(
    owner: AggregationNode | AggregationEdge | AggregationPort
  ): ILabelModelParameter | null {
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

  private $getLabelStyle(owner: AggregationNode | AggregationEdge | AggregationPort): ILabelStyle {
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

  public setLabelText(label: ILabel, text: string): void {
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
      this.onLabelTextChanged(new ItemChangedEventArgs<ILabel, string>(label, oldText))
    } else {
      super.setLabelText(label, text)
    }
  }

  public setLabelPreferredSize(label: ILabel, preferredSize: Size): void {
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
      this.onLabelPreferredSizeChanged(
        new ItemChangedEventArgs<ILabel, Size>(label, oldPreferredSize)
      )
    } else {
      super.setLabelPreferredSize(label, preferredSize)
    }
  }

  public setLabelLayoutParameter(label: ILabel, layoutParameter: ILabelModelParameter): void {
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
      this.onLabelLayoutParameterChanged(
        new ItemChangedEventArgs<ILabel, ILabelModelParameter>(label, oldParameter)
      )
    } else {
      super.setLabelLayoutParameter(label, layoutParameter)
    }
  }

  public setStyle(
    item: INode | IEdge | ILabel | IPort,
    style: INodeStyle | IEdgeStyle | ILabelStyle | IPortStyle
  ): void {
    if (!this.contains(item)) {
      throw new Error('ArgumentError: Affected parameter item: Item is not in this graph.')
    }

    if (item instanceof INode) {
      const aggregationNode = item instanceof AggregationNode ? item : null
      if (aggregationNode) {
        if (aggregationNode.style !== style) {
          const oldStyle = aggregationNode.style
          aggregationNode.style = style as INodeStyle
          this.onNodeStyleChanged(new ItemChangedEventArgs<INode, INodeStyle>(item, oldStyle))
        }
      } else {
        super.setStyle(item, style as INodeStyle)
      }
    } else if (item instanceof IEdge) {
      const aggregationEdge = item instanceof AggregationEdge ? item : null
      if (aggregationEdge) {
        if (aggregationEdge.style !== style) {
          const oldStyle = aggregationEdge.style
          aggregationEdge.style = style as IEdgeStyle
          this.onEdgeStyleChanged(new ItemChangedEventArgs<IEdge, IEdgeStyle>(item, oldStyle))
        }
      } else {
        super.setStyle(item, style as IEdgeStyle)
      }
    } else if (item instanceof ILabel) {
      const aggregationLabel = item instanceof AggregationLabel ? item : null
      if (aggregationLabel) {
        if (aggregationLabel.style !== style) {
          const oldStyle = aggregationLabel.style
          aggregationLabel.style = style as ILabelStyle
          this.onLabelStyleChanged(new ItemChangedEventArgs<ILabel, ILabelStyle>(item, oldStyle))
        }
      } else {
        super.setStyle(item, style as ILabelStyle)
      }
    } else {
      const aggregationPort = item instanceof AggregationPort ? item : null
      if (aggregationPort) {
        if (aggregationPort.style !== style) {
          const oldStyle = aggregationPort.style
          aggregationPort.style = style as IPortStyle
          this.onPortStyleChanged(new ItemChangedEventArgs<IPort, IPortStyle>(item, oldStyle))
        }
      } else {
        super.setStyle(item, style as IPortStyle)
      }
    }
  }

  public getChildren(node: INode): IListEnumerable<INode> {
    if (!node) {
      // top-level nodes
      return new ListEnumerable<INode>(this.nodes.filter(n => this.getParent(n) === null))
    }

    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      return new ListEnumerable<INode>(aggregationNode.children || IListEnumerable.EMPTY)
    }

    return new ListEnumerable<INode>(
      super.getChildren(node).concat(this.aggregationNodes.filter(an => an.parent === node))
    )
  }

  public getParent(node: INode): INode | null {
    if (!this.contains(node)) {
      throw new Error('ArgumentError: Affected parameter node: Node is not in this graph.')
    }

    const aggregationNode = node instanceof AggregationNode ? node : null
    if (aggregationNode) {
      return aggregationNode.parent
    }

    const aggregationNodeParent = this.aggregationNodes.find(
      parent => !!parent.children && parent.children.includes(node)
    )
    if (aggregationNodeParent) {
      return aggregationNodeParent
    }

    return super.getParent(node)
  }

  public setParent(node: INode, parent: INode): void {
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
        aggregationParent.children!.add(node)
      }

      this.onParentChanged(new NodeEventArgs(node, oldParent, this.isGroupNode(node)))
    } else {
      super.setParent(node, parent)
    }
  }

  public setIsGroupNode(node: INode, isGroupNode: boolean): void {
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
        aggregationNode.children = new List<INode>()
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

  public isGroupNode(node: INode | null): boolean {
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

  public createEdge<T extends INode | IPort>(
    source: T | { source: T; target: T; style?: IEdgeStyle | null; tag?: any },
    target?: T,
    style?: IEdgeStyle | null,
    tag?: any
  ): IEdge {
    if (!(source instanceof INode || source instanceof IPort)) {
      const options = source as any
      source = options.source
      target = options.target
      style = options.style as IEdgeStyle
      tag = options.tag
    }

    if (!this.contains(source as T)) {
      throw new Error(
        "ArgumentError: Affected parameter source: Cannot create edge from a node that doesn't belong to this graph."
      )
    }
    if (!this.contains(target!)) {
      throw new Error(
        "ArgumentError: Affected parameter target: Cannot create edge to a node that doesn't belong to this graph."
      )
    }

    if (source instanceof INode) {
      const sourceNode = source
      const targetNode = target as INode
      if (sourceNode instanceof AggregationNode || targetNode instanceof AggregationNode) {
        const sourcePort = this.addPort(sourceNode)
        const targetPort = this.addPort(targetNode)
        return this.createEdge(sourcePort, targetPort, style, tag)
      }
      return super.createEdge(sourceNode, targetNode, style, tag)
    } else {
      const sourcePort = source as IPort
      const targetPort = target as IPort
      if (sourcePort instanceof AggregationPort || targetPort instanceof AggregationPort) {
        const edgeStyle = style || this.aggregationEdgeDefaults.getStyleInstance()
        const aggregationEdge = new AggregationEdge(this, sourcePort, targetPort, edgeStyle)
        aggregationEdge.tag = tag
        this.$aggregationEdges.add(aggregationEdge)
        this.onEdgeCreated(new ItemEventArgs<IEdge>(aggregationEdge as IEdge))
        return aggregationEdge as IEdge
      }
      return super.createEdge(sourcePort, targetPort, style, tag)
    }
  }

  /**
   * Does not raise EdgeCreated event!!
   */
  private $createAggregationEdge(sourcePort: IPort, targetPort: IPort, tag?: any): AggregationEdge {
    const edgeStyle = this.aggregationEdgeDefaults.getStyleInstance()
    const aggregationEdge = new AggregationEdge(this, sourcePort, targetPort, edgeStyle)
    aggregationEdge.tag = tag || null
    this.$aggregationEdges.add(aggregationEdge)
    return aggregationEdge
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  public lookup<T extends any>(type: Class<T>): T | null {
    return this.$lookupDecorator.lookup(type)
  }

  public addLookup(lookup: IContextLookupChainLink): void {
    this.$lookupDecorator.addLookup(IGraph.$class, lookup)
  }

  public removeLookup(lookup: IContextLookupChainLink): void {
    this.$lookupDecorator.removeLookup(IGraph.$class, lookup)
  }

  baseLookup<T>(type: Class<T>): T | null {
    return super.lookup(type)
  }

  delegateLookup(
    aggregationItem:
      | AggregationNode
      | AggregationEdge
      | AggregationLabel
      | AggregationPort
      | AggregationBend,
    type: Class
  ): object | null {
    return this.$lookupDecorator.delegateLookup(aggregationItem, type)
  }

  onTagChanged(item: IModelItem, oldTag: object): void {
    if (item instanceof INode) {
      this.onNodeTagChanged(new ItemChangedEventArgs<INode, object>(item, oldTag))
    } else if (item instanceof IEdge) {
      this.onEdgeTagChanged(new ItemChangedEventArgs<IEdge, object>(item, oldTag))
    } else if (item instanceof ILabel) {
      this.onLabelTagChanged(new ItemChangedEventArgs<ILabel, object>(item, oldTag))
    } else if (item instanceof IPort) {
      this.onPortTagChanged(new ItemChangedEventArgs<IPort, object>(item, oldTag))
    } else if (item instanceof IBend) {
      this.onBendTagChanged(new ItemChangedEventArgs<IBend, object>(item, oldTag))
    }
  }
}

/**
 * An ILookupDecorator implementation that contains its own lookup chains.
 * New chain links are added to the chains of this decorator as well as to the decorator of the {@link GraphWrapperBase.wrappedGraph}.
 */
class AggregationLookupDecorator extends BaseClass(ILookup, ILookupDecorator) {
  private $wrappedDecorator: ILookupDecorator | null

  private readonly $graph: AggregationGraphWrapper

  private readonly $graphLookupChain: LookupChain
  private readonly $nodeLookupChain: LookupChain
  private readonly $edgeLookupChain: LookupChain
  private readonly $bendLookupChain: LookupChain
  private readonly $portLookupChain: LookupChain
  private readonly $labelLookupChain: LookupChain

  constructor(graph: AggregationGraphWrapper) {
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

  public canDecorate(t: Class): boolean {
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

  public addLookup(t: Class, lookup: IContextLookupChainLink): void {
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

  public removeLookup(t: Class, lookup: IContextLookupChainLink): void {
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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  public lookup<T extends any>(type: Class<T>): T | null {
    if (type === ILookupDecorator.$class) {
      this.$wrappedDecorator = this.$graph.baseLookup(type) as ILookupDecorator
      return this as unknown as T
    }
    if (type === LookupChain.$class) {
      return this.$graphLookupChain as T
    }

    const lookup = this.$graph.getLookup()
    if (lookup) {
      return lookup.lookup(type)
    }

    return this.$graphLookupChain.contextLookup(this.$graph, type) as T
  }

  public delegateLookup(item: IModelItem, type: Class): object | null {
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

abstract class ContextLookupChainLinkBase extends BaseClass(IContextLookupChainLink) {
  private $nextLink: IContextLookup | null = null

  public contextLookup(item: object, type: Class): object | null {
    return this.$nextLink ? this.$nextLink.contextLookup(item, type) : null
  }

  public setNext(next: IContextLookup): void {
    this.$nextLink = next
  }
}

class GraphFallBackLookup extends ContextLookupChainLinkBase {
  public contextLookup(item: object, type: Class): object | null {
    return (item as AggregationGraphWrapper).baseLookup(type) || super.contextLookup(item, type)
  }
}

class ItemFallBackLookup extends ContextLookupChainLinkBase {
  public contextLookup(item: object, type: Class): object | null {
    return (
      (item as AggregationNode | AggregationEdge | AggregationLabel | AggregationPort).innerLookup(
        type
      ) || super.contextLookup(item, type)
    )
  }
}

class BlockReshapeAndPositionHandlerLookup extends ContextLookupChainLinkBase {
  public contextLookup(item: object, type: Class): object | null {
    // The default implementations of IPositionHandler and IReshapeHandler don't support AggregationNode, which is
    // why moving and reshaping such nodes is not supported by default.
    if (type === IPositionHandler.$class || type === IReshapeHandler.$class) {
      return null
    }
    return super.contextLookup(item, type)
  }
}

class ItemDefaultLookup extends ContextLookupChainLinkBase {
  private $defaultLookup: IContextLookup

  constructor(defaultLookup: IContextLookup) {
    super()
    this.$defaultLookup = defaultLookup
  }

  public contextLookup(item: object, type: Class): object | null {
    return this.$defaultLookup.contextLookup(item, type) || super.contextLookup(item, type)
  }
}

/**
 * A simple INode implementation for aggregation nodes.
 */
class AggregationNode extends BaseClass(INode) {
  private readonly $aggregatedNodes: IList<INode>
  private readonly $layout: IMutableRectangle
  private $style: INodeStyle
  private $children: IList<INode> | null
  private $parent: INode | null
  private $graph: AggregationGraphWrapper | null
  private $tag: any
  private $labelsEnumerable: IListEnumerable<ILabel> | null = null
  private $portsEnumerable: IListEnumerable<IPort> | null = null
  public $labels: IList<AggregationLabel>
  public $ports: IList<AggregationPort>

  get aggregatedNodes(): IList<INode> {
    return this.$aggregatedNodes
  }

  get layout(): IMutableRectangle {
    return this.$layout
  }

  public get labels(): IListEnumerable<ILabel> {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  public get ports(): IListEnumerable<IPort> {
    if (!this.$portsEnumerable) {
      this.$portsEnumerable = new ListEnumerable(this.$ports)
    }
    return this.$portsEnumerable
  }

  public get tag(): any {
    return this.$tag
  }

  public set tag(value: any) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  public get graph(): AggregationGraphWrapper | null {
    return this.$graph
  }

  public set graph(graph: AggregationGraphWrapper | null) {
    this.$graph = graph
  }

  get style(): INodeStyle {
    return this.$style
  }

  set style(style: INodeStyle) {
    this.$style = style
  }

  get children(): IList<INode> | null {
    return this.$children
  }

  set children(children: IList<INode> | null) {
    this.$children = children
  }

  get parent(): INode | null {
    return this.$parent
  }

  set parent(value: INode | null) {
    this.$parent = value
  }

  constructor(
    graph: AggregationGraphWrapper,
    aggregatedNodes: IList<INode>,
    layout: IMutableRectangle,
    style: INodeStyle
  ) {
    super(graph)
    this.$aggregatedNodes = aggregatedNodes
    this.$layout = layout
    this.$style = style
    this.$graph = graph
    this.$labels = new List<AggregationLabel>()
    this.$ports = new List<AggregationPort>()

    this.$children = null
    this.$parent = null
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  public innerLookup<T extends any>(type: Class<T>): T | null {
    if (type === INodeStyle.$class) {
      return this.style as T
    }
    if (type.isInstance(this.layout)) {
      return this.layout
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup<T extends any>(type: Class<T>): T | null {
    return this.graph ? (this.graph.delegateLookup(this, type) as T) : null
  }

  public toString(): string {
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
  public readonly $bends: IList<AggregationBend>
  public readonly $ports: IList<AggregationPort>
  public readonly $labels: IList<AggregationLabel>
  private readonly $aggregatedEdges: IList<AggregationEdge>
  private $graph: AggregationGraphWrapper | null
  private $sourcePort: IPort
  private $targetPort: IPort
  private $style: IEdgeStyle
  private $tag: any
  private $labelsEnumerable: IListEnumerable<AggregationLabel> | null = null
  private $portsEnumerable: IListEnumerable<AggregationPort> | null = null
  private $bendsEnumerable: IListEnumerable<AggregationBend> | null = null

  get isSelfloop(): boolean {
    return this.sourcePort.owner === this.targetPort.owner
  }

  get aggregatedEdges(): IList<IEdge> {
    return this.$aggregatedEdges
  }

  public get bends(): IListEnumerable<IBend> {
    if (!this.$bendsEnumerable) {
      this.$bendsEnumerable = new ListEnumerable(this.$bends)
    }
    return this.$bendsEnumerable
  }

  public get labels(): IListEnumerable<ILabel> {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  public get ports(): IListEnumerable<IPort> {
    if (!this.$portsEnumerable) {
      this.$portsEnumerable = new ListEnumerable(this.$ports)
    }
    return this.$portsEnumerable
  }

  public get graph(): AggregationGraphWrapper | null {
    return this.$graph
  }

  public set graph(graph: AggregationGraphWrapper | null) {
    this.$graph = graph
  }

  get sourcePort(): IPort {
    return this.$sourcePort
  }

  set sourcePort(value: IPort) {
    this.$sourcePort = value
  }

  get targetPort(): IPort {
    return this.$targetPort
  }

  set targetPort(value: IPort) {
    this.$targetPort = value
  }

  get style(): IEdgeStyle {
    return this.$style
  }

  set style(value: IEdgeStyle) {
    this.$style = value
  }

  public get tag(): any {
    return this.$tag
  }

  public set tag(value: any) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  constructor(
    graph: AggregationGraphWrapper,
    sourcePort: IPort,
    targetPort: IPort,
    style: IEdgeStyle
  ) {
    super()
    this.$graph = graph
    this.$sourcePort = sourcePort
    this.$targetPort = targetPort
    this.$style = style
    this.$bends = new List<AggregationBend>()
    this.$ports = new List<AggregationPort>()
    this.$labels = new List<AggregationLabel>()
    this.$aggregatedEdges = new List<AggregationEdge>()
  }

  opposite<T extends IPort | IPortOwner>(port: T): T {
    if (port instanceof IPort) {
      return (port === this.sourcePort ? this.targetPort : this.sourcePort) as T
    }
    return ((port as unknown as INode) === this.sourceNode
      ? this.targetNode!
      : this.sourceNode!) as unknown as T
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup<T extends any>(type: Class<T>): T | null {
    return this.graph ? (this.graph.delegateLookup(this, type) as T) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  public innerLookup<T extends any>(type: Class<T>): T | null {
    if (type === IEdgeStyle.$class) {
      return this.style as T
    }
    if (type.isInstance(this.bends)) {
      return this.bends
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  public toString(): string {
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
  private readonly $owner: AggregationEdge
  private readonly $location: IMutablePoint
  private $graph: AggregationGraphWrapper | null
  private $tag: any

  public get owner(): IEdge {
    return this.$owner
  }

  public get location(): IMutablePoint {
    return this.$location
  }

  public get tag(): any {
    return this.$tag
  }

  public set tag(value: any) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  public get graph(): AggregationGraphWrapper | null {
    return this.$graph
  }

  public set graph(graph: AggregationGraphWrapper | null) {
    this.$graph = graph
  }

  constructor(graph: AggregationGraphWrapper, owner: AggregationEdge, location: MutablePoint) {
    super()
    this.$owner = owner
    this.$location = location
    this.$graph = graph
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup<T extends any>(type: Class<T>): T | null {
    return this.graph ? (this.graph.delegateLookup(this, type) as T) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  public innerLookup<T extends any>(type: Class<T>): T | null {
    if (type.isInstance(this.location)) {
      return this.location
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  public toString(): string {
    return `Aggregation Bend [${this.location.x}, ${this.location.y}]`
  }
}

/**
 * A simple IPort implementation for ports of {@link AggregationNode}, {@link AggregationEdge}, or {@link AggregationPort}.
 */
class AggregationPort extends BaseClass(IPort) {
  private readonly $owner: AggregationNode | AggregationEdge | AggregationPort
  private $style: IPortStyle
  private $graph: AggregationGraphWrapper | null
  private $tag: any
  private $locationParameter: IPortLocationModelParameter
  private $labelsEnumerable: IListEnumerable<ILabel> | null = null
  public $labels: IList<AggregationLabel>

  get owner(): IPortOwner {
    return this.$owner as IPortOwner
  }

  public get labels(): IListEnumerable<ILabel> {
    if (!this.$labelsEnumerable) {
      this.$labelsEnumerable = new ListEnumerable(this.$labels)
    }
    return this.$labelsEnumerable
  }

  get locationParameter(): IPortLocationModelParameter {
    return this.$locationParameter
  }

  set locationParameter(value: IPortLocationModelParameter) {
    this.$locationParameter = value
  }

  get style(): IPortStyle {
    return this.$style
  }

  set style(value: IPortStyle) {
    this.$style = value
  }

  public get tag(): object | undefined {
    return this.$tag
  }

  public set tag(value: object | undefined) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  public get graph(): AggregationGraphWrapper | null {
    return this.$graph
  }

  public set graph(graph: AggregationGraphWrapper | null) {
    this.$graph = graph
  }

  constructor(
    graph: AggregationGraphWrapper,
    owner: AggregationNode,
    locationParameter: IPortLocationModelParameter,
    style: IPortStyle
  ) {
    super()
    this.$owner = owner
    this.$locationParameter = locationParameter
    this.$style = style
    this.$labels = new List<AggregationLabel>()
    this.$graph = graph
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup<T extends any>(type: Class<T>): T | null {
    return this.graph ? (this.graph.delegateLookup(this, type) as T) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  public innerLookup<T extends any>(type: Class<T>): T | null {
    if (type === IPortStyle.$class) {
      return this.style as T
    }
    if (type === IPortLocationModelParameter.$class) {
      return this.locationParameter as T
    }
    if (type === IPoint.$class) {
      return this.dynamicLocation as T
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  public toString(): string {
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
  private readonly $owner: AggregationNode | AggregationEdge | AggregationPort
  private $layoutParameter: ILabelModelParameter
  private $preferredSize: Size
  private $style: ILabelStyle
  private $text: string
  private $graph: AggregationGraphWrapper | null
  private $tag: any
  private $layout: IOrientedRectangle

  public get owner(): ILabelOwner | null {
    return this.$owner as ILabelOwner
  }

  get layoutParameter(): ILabelModelParameter {
    return this.$layoutParameter
  }

  set layoutParameter(parameter: ILabelModelParameter) {
    this.$layoutParameter = parameter
  }

  get preferredSize(): Size {
    return this.$preferredSize
  }

  set preferredSize(size: Size) {
    this.$preferredSize = size
  }

  get style(): ILabelStyle {
    return this.$style
  }

  set style(style: ILabelStyle) {
    this.$style = style
  }

  get text(): string {
    return this.$text
  }

  set text(text: string) {
    this.$text = text
  }

  public get tag(): any {
    return this.$tag
  }

  public set tag(value: any) {
    const oldTag = this.$tag
    this.$tag = value
    if (this.graph) {
      this.graph.onTagChanged(this, oldTag)
    }
  }

  get layout(): IOrientedRectangle {
    return this.$layout
  }

  set layout(value: IOrientedRectangle) {
    this.$layout = value
  }

  public get graph(): AggregationGraphWrapper | null {
    return this.$graph
  }

  public set graph(graph: AggregationGraphWrapper | null) {
    this.$graph = graph
  }

  constructor(
    graph: AggregationGraphWrapper,
    labelOwner: AggregationNode | AggregationEdge | AggregationPort,
    text: string,
    layoutParameter: ILabelModelParameter,
    preferredSize: Size,
    style: ILabelStyle
  ) {
    super(graph)
    this.$owner = labelOwner
    this.$text = text
    this.$layoutParameter = layoutParameter
    this.$preferredSize = preferredSize
    this.$style = style
    this.$graph = graph
    this.$layout = new OrientedRectangle()
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  lookup<T extends any>(type: Class<T>): T | null {
    return this.graph ? (this.graph.delegateLookup(this, type) as T) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  public innerLookup<T extends any>(type: Class<T>): T | null {
    if (type === ILabelStyle.$class) {
      return this.style as T
    }
    if (type === ILabelModelParameter.$class) {
      return this.layoutParameter as T
    }
    if (type.isInstance(this)) {
      return this
    }
    return null
  }

  public toString(): string {
    return `Aggregation Label ["${this.text}"; Owner: ${this.owner}]`
  }
}
