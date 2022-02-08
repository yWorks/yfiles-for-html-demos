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
  AdjacencyGraphBuilder,
  AdjacencyNodesSource,
  Class,
  DefaultGraph,
  EdgeCreator,
  EdgesSource,
  IEdge,
  IEnumerable,
  IGraph,
  ILabelDefaults,
  ILabelOwner,
  IModelItem,
  INode,
  ITagOwner,
  ItemEventArgs,
  GraphBuilder,
  NodeCreator,
  NodesSource,
  Point,
  Rect
} from 'yfiles'

/**
 * @typedef {Object} GraphBuilderOptionArgs
 * @property {IGraph} [graph]
 * @property {boolean} [lazyNodeDefinition]
 * @property {*} [nodesSource]
 * @property {*} [edgesSource]
 * @property {*} [groupsSource]
 * @property {*} [nodeIdBinding]
 * @property {*} [edgeIdBinding]
 * @property {*} [nodeLabelBinding]
 * @property {*} [groupBinding]
 * @property {*} [edgeLabelBinding]
 * @property {*} [sourceNodeBinding]
 * @property {*} [targetNodeBinding]
 * @property {*} [groupIdBinding]
 * @property {*} [groupLabelBinding]
 * @property {*} [parentGroupBinding]
 * @property {*} [locationXBinding]
 * @property {*} [locationYBinding]
 */
/**
 * @typedef {function} SimpleNodeListener
 */
/**
 * @typedef {function} SimpleEdgeListener
 */

/**
 Populates a graph from custom data.
 This class can be used when the data specifies a collection of nodes, a collection of edges, and optionally a collection
 of groups. The properties {@link SimpleGraphBuilder#nodesSource}, {@link SimpleGraphBuilder#groupsSource}, and {@link SimpleGraphBuilder#edgesSource} define the source collections from which nodes, groups, and edges will be created.
 Generally, using the {@link SimpleGraphBuilder} class consists of a few basic steps:
 <ol>
 <li>Set up the {@link SimpleGraphBuilder#graph} with the proper defaults for items ({@link IGraph#nodeDefaults}, {@link IGraph#groupNodeDefaults}, {@link IGraph#edgeDefaults})
 <li>Create a {@link SimpleGraphBuilder}.
 <li>Set the items sources. At the very least the {@link SimpleGraphBuilder#nodesSource} (unless using {@link SimpleGraphBuilder#lazyNodeDefinition}) and {@link SimpleGraphBuilder#edgesSource} are needed. If the items in the nodes collection are
 grouped somehow, then also set the {@link SimpleGraphBuilder#groupsSource} property.
 <li>Set up the bindings so that a graph structure can actually be created from the items sources. This involves at least
 setting up the {@link SimpleGraphBuilder#sourceNodeBinding} and {@link SimpleGraphBuilder#targetNodeBinding} properties so that edges can be created. If the edge objects don't actually contain the node
 objects as source and target, but instead an identifier of the node objects, then {@link SimpleGraphBuilder#sourceNodeBinding} and {@link SimpleGraphBuilder#targetNodeBinding} would return those identifiers
 and {@link SimpleGraphBuilder#nodeIdBinding} must be set to return that identifier when given a node object.
 <li>If {@link SimpleGraphBuilder#groupsSource} is set, then you also need to set the {@link SimpleGraphBuilder#groupBinding} property to enable mapping nodes to groups. Just like with edges and their
 source and target nodes, if the node object only contains an identifier for a group node and not the actual group
 object, then return the identifier in the {@link SimpleGraphBuilder#groupBinding} and set up the {@link SimpleGraphBuilder#groupIdBinding} to map group node objects to their identifiers. If group
 nodes can nest, you also need the {@link SimpleGraphBuilder#parentGroupBinding}.
 <li>You can also easily create labels for nodes, groups, and edges by using the {@link SimpleGraphBuilder#nodeLabelBinding}, {@link SimpleGraphBuilder#groupLabelBinding}, and {@link SimpleGraphBuilder#edgeLabelBinding} properties.
 <li>Call {@link SimpleGraphBuilder#buildGraph} to populate the graph. You can apply a layout algorithm afterward to make
 the graph look nice.
 <li>If your items or collections change later, call {@link SimpleGraphBuilder#updateGraph} to make those changes visible in
 the graph.
 </ol>
 You can further customize how nodes, groups, and edges are created by adding event handlers to the various events and
 modifying the items there. This can be used to modify items in ways that are not directly supported by the available
 bindings or defaults. This includes scenarios such as the following:
 <ul>
 <li>Setting node positions or adding bends to edges. Often a layout is applied to the graph after building it, so these
 things are only rarely needed.
 <li>Modifying individual items, such as setting a different style for every nodes, depending on the bound object.
 <li>Adding more than one label for an item, as the {@link SimpleGraphBuilder#nodeLabelBinding} and {@link SimpleGraphBuilder#edgeLabelBinding} will only create a single label, or adding labels to group nodes.
 </ul>
 There are creation and update events for all three types of items, which allows separate customization when nodes,
 groups, and edges are created or updated. For completely static graphs where {@link SimpleGraphBuilder#updateGraph} is
 not needed, the update events can be safely ignored.
 Depending on how the source data is laid out, you may also consider using {@link SimpleAdjacentNodesGraphBuilder},
 where node objects know their neighbors, or {@link SimpleTreeBuilder} where the graph is a tree and node objects know
 their children. Both of those other graph builders make edges implicit through the relationships between nodes and thus
 have no {@link SimpleGraphBuilder#edgesSource}.
 <h2>Note</h2>
 This class serves as a convenient way to create general graphs and has some limitations:
 <ul>
 <li>When populating the graph for the first time it will be cleared of all existing items.
 <li>Elements manually created on the graph in between calls to {@link SimpleGraphBuilder#updateGraph} may not be
 preserved.
 <li>Edge objects in {@link SimpleGraphBuilder#edgesSource} cannot change their source or target node. {@link SimpleGraphBuilder#sourceNodeBinding} and {@link SimpleGraphBuilder#targetNodeBinding} are only used during edge creation.
 </ul>
 If updates get too complex it's often better to write the code interfacing with the graph by hand instead of relying on
 {@link SimpleGraphBuilder}.
 The different graph builders are discussed in the section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder Creating a Graph from Business Data}. Class <code>GraphBuilder</code>, in
 particular, is topic of section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-GraphBuilder GraphBuilder}.
 @see SimpleAdjacentNodesGraphBuilder
 @see SimpleTreeBuilder */
export class SimpleGraphBuilder {
  /**
     Initializes a new instance of the {@link SimpleGraphBuilder} class that operates on the given graph.
     The <code>graph</code> will be {@link IGraph#clear cleared} and re-built from the data in {@link SimpleGraphBuilder#nodesSource}, {@link SimpleGraphBuilder#groupsSource}, and {@link SimpleGraphBuilder#edgesSource} when {@link SimpleGraphBuilder#buildGraph} is called.
     @param graphOrOptions The parameters to pass.
     @param [graphOrOptions.graph=null]
     @param [graphOrOptions.lazyNodeDefinition] A value indicating whether or not to automatically create nodes for values returned from {@link SimpleGraphBuilder#sourceNodeBinding} and {@link SimpleGraphBuilder#targetNodeBinding} that don't exist in {@link SimpleGraphBuilder#nodesSource}. This option sets the {@link SimpleGraphBuilder#lazyNodeDefinition} property on the created object.
     @param [graphOrOptions.nodesSource] The objects to be represented as nodes of the {@link SimpleGraphBuilder#graph}. This option sets the {@link SimpleGraphBuilder#nodesSource} property on the created object.
     @param [graphOrOptions.edgesSource] The objects to be represented as edges of the {@link SimpleGraphBuilder#graph}. This option sets the {@link SimpleGraphBuilder#edgesSource} property on the created object.
     @param [graphOrOptions.groupsSource] The objects to be represented as group nodes of the {@link SimpleGraphBuilder#graph}. This option sets the {@link SimpleGraphBuilder#groupsSource} property on the created object.
     @param [graphOrOptions.nodeIdBinding] A binding that maps node objects to their identifier. This option sets the {@link SimpleGraphBuilder#nodeIdBinding} property on the created object.
     @param [graphOrOptions.edgeIdBinding] A binding that maps edge objects to their identifier. This option sets the {@link SimpleGraphBuilder#edgeIdBinding} property on the created object.
     @param [graphOrOptions.nodeLabelBinding] A binding that maps a node object to a label. This option sets the {@link SimpleGraphBuilder#nodeLabelBinding} property on the created object.
     @param [graphOrOptions.groupBinding] A binding that maps node objects to their containing groups. This option sets the {@link SimpleGraphBuilder#groupBinding} property on the created object.
     @param [graphOrOptions.edgeLabelBinding] A binding that maps an edge object to a label. This option sets the {@link SimpleGraphBuilder#edgeLabelBinding} property on the created object.
     @param [graphOrOptions.sourceNodeBinding] A binding that maps edge objects to their source node. This option sets the {@link SimpleGraphBuilder#sourceNodeBinding} property on the created object.
     @param [graphOrOptions.targetNodeBinding] A binding that maps edge objects to their target node. This option sets the {@link SimpleGraphBuilder#targetNodeBinding} property on the created object.
     @param [graphOrOptions.groupIdBinding] A binding that maps group objects to their identifier. This option sets the {@link SimpleGraphBuilder#groupIdBinding} property on the created object.
     @param [graphOrOptions.groupLabelBinding] A binding that maps a group object to a label. This option sets the {@link SimpleGraphBuilder#groupLabelBinding} property on the created object.
     @param [graphOrOptions.parentGroupBinding] A binding that maps group objects to their containing groups. This option sets the {@link SimpleGraphBuilder#parentGroupBinding} property on the created object.
     @param [graphOrOptions.locationXBinding] The binding for determining a node's position on the x-axis. This option sets the {@link SimpleGraphBuilder#locationXBinding} property on the created object.
     @param [graphOrOptions.locationYBinding] The binding for determining a node's position on the y-axis. This option sets the {@link SimpleGraphBuilder#locationYBinding} property on the created object. * @param {?(IGraph|GraphBuilderOptionArgs)} [graphOrOptions]
  */
  constructor(graphOrOptions) {
    let options = null
    let graph
    if (!graphOrOptions) {
      graph = new DefaultGraph()
    } else if (IGraph.isInstance(graphOrOptions)) {
      graph = graphOrOptions
    } else {
      options = graphOrOptions
      graph = options.graph || new DefaultGraph()
    }

    this.$graphBuilderHelper = new GraphBuilderHelper(
      this,
      graph,
      (graph, parent, location, labelData, nodeObject) =>
        this.createNode(graph, parent, location, labelData, nodeObject),
      (graph, node, parent, location, labelData, nodeObject) =>
        this.updateNode(graph, node, parent, location, labelData, nodeObject),
      (graph, labelData, groupObject) => this.createGroupNode(graph, labelData, groupObject),
      (graph, groupNode, labelData, groupObject) =>
        this.updateGroupNode(graph, groupNode, labelData, groupObject),
      (graph, source, target, labelData, edgeObject) =>
        this.createEdge(graph, source, target, labelData, edgeObject),
      (graph, edge, labelData, edgeObject) => this.updateEdge(graph, edge, labelData, edgeObject)
    )

    this.$lazyNodeDefinition = false
    this.$nodesSource = null
    this.$edgesSource = null
    this.$groupsSource = null
    this.$edgeIdBinding = null
    this.$sourceNodeBinding = null
    this.$targetNodeBinding = null

    this.$graphBuilder = new GraphBuilder(graph)
    this.$builderNodesSource = this.$graphBuilder.createNodesSource([], null)
    this.$builderNodesSource.nodeCreator = this.$graphBuilderHelper.createNodeCreator()

    this.$builderGroupsSource = this.$graphBuilder.createGroupNodesSource([], null)
    this.$builderGroupsSource.nodeCreator = this.$graphBuilderHelper.createGroupCreator()

    this.$builderEdgesSource = this.$graphBuilder.createEdgesSource(
      [],
      dataItem => this.$sourceIdProvider && this.$sourceIdProvider(dataItem),
      dataItem => this.$targetIdProvider && this.$targetIdProvider(dataItem)
    )
    this.$builderEdgesSource.edgeCreator = this.$graphBuilderHelper.createEdgeCreator()

    if (options) {
      this.$applyOptions(options)
    }
  }

  /**
   * @param {!GraphBuilderOptionArgs} options
   */
  $applyOptions(options) {
    if (options.lazyNodeDefinition) this.lazyNodeDefinition = options.lazyNodeDefinition
    if (options.nodesSource) this.nodesSource = options.nodesSource
    if (options.edgesSource) this.edgesSource = options.edgesSource
    if (options.groupsSource) this.groupsSource = options.groupsSource
    if (options.nodeIdBinding) this.nodeIdBinding = options.nodeIdBinding
    if (options.edgeIdBinding) this.edgeIdBinding = options.edgeIdBinding
    if (options.nodeLabelBinding) this.nodeLabelBinding = options.nodeLabelBinding
    if (options.groupBinding) this.groupBinding = options.groupBinding
    if (options.edgeLabelBinding) this.edgeLabelBinding = options.edgeLabelBinding
    if (options.sourceNodeBinding) this.sourceNodeBinding = options.sourceNodeBinding
    if (options.targetNodeBinding) this.targetNodeBinding = options.targetNodeBinding
    if (options.groupIdBinding) this.groupIdBinding = options.groupIdBinding
    if (options.groupLabelBinding) this.groupLabelBinding = options.groupLabelBinding
    if (options.parentGroupBinding) this.parentGroupBinding = options.parentGroupBinding
    if (options.locationXBinding) this.locationXBinding = options.locationXBinding
    if (options.locationYBinding) this.locationYBinding = options.locationYBinding
  }

  /**
     Populates the graph with items generated from the bound data.
     The graph is cleared, and then new nodes, groups, and edges are created as defined by the source collections.
     @returns {!IGraph} The created graph.
     @see SimpleGraphBuilder#updateGraph */
  buildGraph() {
    this.graph.clear()
    this.$initialize()
    return this.$graphBuilder.buildGraph()
  }

  /**
   Updates the graph after changes in the bound data.
   In contrast to
   {@link SimpleGraphBuilder#buildGraph}, the graph is not cleared. Instead, graph elements corresponding to objects that
   are still present in the source collections are kept, new graph elements are created for new objects in the collections,
   and obsolete ones are removed.
   */
  updateGraph() {
    this.$initialize()
    this.$graphBuilder.updateGraph()
  }

  $initialize() {
    if (this.$nodesSource == null) {
      throw new Error('nodesSource must be set.')
    }

    if (
      this.$edgesSource != null &&
      (this.sourceNodeBinding == null || this.targetNodeBinding == null)
    ) {
      throw new Error(
        'Since edgesSource is set, sourceNodeBinding and targetNodeBinding must be set, too.'
      )
    }

    if (this.$lazyNodeDefinition && this.nodeIdBinding != null) {
      throw new Error('LazyNodeDefinition cannot be used with nodeIdBinding.')
    }

    this.$initializeProviders()
    this.$prepareData()
  }

  $initializeProviders() {
    this.$graphBuilderHelper.initializeProviders()

    this.$builderNodesSource.idProvider = GraphBuilderHelper.createIdProvider(this.nodeIdBinding)
    this.$builderGroupsSource.idProvider = GraphBuilderHelper.createIdProvider(this.groupIdBinding)
    this.$builderEdgesSource.idProvider = GraphBuilderHelper.createIdProvider(this.edgeIdBinding)

    this.$builderEdgesSource.edgeCreator.tagProvider = e => e

    this.$builderNodesSource.parentIdProvider = GraphBuilderHelper.createBinding(this.groupBinding)
    this.$builderGroupsSource.parentIdProvider = GraphBuilderHelper.createBinding(
      this.parentGroupBinding
    )

    this.$sourceIdProvider = GraphBuilderHelper.createBinding(this.sourceNodeBinding)
    this.$targetIdProvider = GraphBuilderHelper.createBinding(this.targetNodeBinding)
  }

  $prepareData() {
    const { nodeCollection, edgeCollection } = this.$maybeExtractLazyNodes()
    this.$graphBuilder.setData(this.$builderNodesSource, nodeCollection)
    this.$graphBuilder.setData(this.$builderEdgesSource, edgeCollection || [])
    this.$graphBuilder.setData(this.$builderGroupsSource, this.$groupsSource || [])
  }

  /**
   * @returns {!object}
   */
  $maybeExtractLazyNodes() {
    if (!this.$lazyNodeDefinition || !this.$edgesSource) {
      return { nodeCollection: this.$nodesSource, edgeCollection: this.$edgesSource }
    }

    const nodeCollectionCloner = createNodeCollectionCloner(this.$nodesSource)
    if (nodeCollectionCloner instanceof ObjectNodeCollectionCloner) {
      const edgeCollectionCloner = createEdgeCollectionCloner(this.$edgesSource)
      const iterator = edgeCollectionCloner.generator()

      let iteratorResult = iterator.next()
      while (!iteratorResult.done) {
        const edgeDataItem = iteratorResult.value

        const sourceNodeDataItem = this.$sourceIdProvider(edgeDataItem)
        const newSource = nodeCollectionCloner.has(sourceNodeDataItem)
          ? sourceNodeDataItem
          : nodeCollectionCloner.add(sourceNodeDataItem)

        const targetNodeDataItem = this.$targetIdProvider(edgeDataItem)
        const newTarget = !nodeCollectionCloner.has(targetNodeDataItem)
          ? nodeCollectionCloner.add(targetNodeDataItem)
          : targetNodeDataItem
        const newEdgeDataItem = { dataItem: edgeDataItem, source: newSource, target: newTarget }

        iteratorResult = iterator.next(newEdgeDataItem)
      }

      this.$sourceIdProvider = e => e.source
      this.$targetIdProvider = e => e.target

      const tagProvider = e => e.dataItem

      const edgesSource = this.$builderEdgesSource
      const helper = this.$graphBuilderHelper

      if (edgesSource.idProvider) {
        edgesSource.idProvider = compose(e => edgesSource.idProvider(e, null), tagProvider)
      }

      helper.edgeLabelProvider = compose(helper.edgeLabelProvider, tagProvider)
      edgesSource.edgeCreator.tagProvider = tagProvider

      return {
        nodeCollection: nodeCollectionCloner.collection,
        edgeCollection: edgeCollectionCloner.collection
      }
    } else {
      for (const edgeDataItem of createIterable(this.$edgesSource)) {
        const sourceNodeDataItem = this.$sourceIdProvider(edgeDataItem)
        if (!nodeCollectionCloner.has(sourceNodeDataItem)) {
          nodeCollectionCloner.add(sourceNodeDataItem)
        }
        const targetNodeDataItem = this.$targetIdProvider(edgeDataItem)
        if (!nodeCollectionCloner.has(targetNodeDataItem)) {
          nodeCollectionCloner.add(targetNodeDataItem)
        }
      }
      return { nodeCollection: nodeCollectionCloner.collection, edgeCollection: this.$edgesSource }
    }
  }

  /**
     Creates an edge from the given <code>edgeObject</code> and <code>labelData</code>.
     This method is called for every edge that is created either when {@link SimpleGraphBuilder#buildGraph building the graph}, or when new items appear in the {@link SimpleGraphBuilder#edgesSource}
     when {@link SimpleGraphBuilder#updateGraph updating it}.
     The default behavior is to create the edge, assign the <code>edgeObject</code> to the edge's {@link ITagOwner#tag} property, and create a label from
     <code>labelData</code>, if present.
     Customizing how edges are created is usually easier by adding an event handler to the {@link SimpleGraphBuilder#addEdgeCreatedListener EdgeCreated}
     event than by overriding this method.
     @param {!IGraph} graph The graph in which to create the edge.
     @param {?INode} source The source node for the edge.
     @param {?INode} target The target node for the edge.
     @param {*} labelData The optional label data of the edge if an {@link SimpleGraphBuilder#edgeLabelBinding} is specified.
     @param {*} edgeObject The object from {@link SimpleGraphBuilder#edgesSource} from which to create the edge.
     @returns {?IEdge} The created edge. */
  createEdge(graph, source, target, labelData, edgeObject) {
    return this.$graphBuilderHelper.createEdge(graph, source, target, labelData, edgeObject)
  }

  /**
     Creates a group node from the given <code>groupObject</code> and <code>labelData</code>.
     This method is called for every group node that is created either when {@link SimpleGraphBuilder#buildGraph building the graph}, or when new items appear in
     the {@link SimpleGraphBuilder#groupsSource} when {@link SimpleGraphBuilder#updateGraph updating it}.
     The default behavior is to create the group node, assign the <code>groupObject</code> to the group node's {@link ITagOwner#tag} property, and create a
     label from <code>labelData</code>, if present.
     Customizing how group nodes are created is usually easier by adding an event handler to the {@link SimpleGraphBuilder#addGroupNodeCreatedListener GroupNodeCreated}
     event than by overriding this method.
     @param {!IGraph} graph The graph in which to create the group node.
     @param {*} labelData The optional label data of the group node if an {@link SimpleGraphBuilder#groupLabelBinding} is specified.
     @param {*} groupObject The object from {@link SimpleGraphBuilder#groupsSource} from which to create the group node.
     @returns {!INode} The created group node. */
  createGroupNode(graph, labelData, groupObject) {
    return this.$graphBuilderHelper.createGroupNode(graph, labelData, groupObject)
  }

  /**
     Creates a node with the specified parent from the given <code>nodeObject</code> and <code>labelData</code>.
     This method is called for every node that is created either when {@link SimpleGraphBuilder#buildGraph building the graph}, or when new items appear in the {@link SimpleGraphBuilder#nodesSource}
     when {@link SimpleGraphBuilder#updateGraph updating it}.
     The default behavior is to create the node with the given parent node, assign the <code>nodeObject</code> to the node's {@link ITagOwner#tag} property,
     and create a label from <code>labelData</code>, if present.
     Customizing how nodes are created is usually easier by adding an event handler to the {@link SimpleGraphBuilder#addNodeCreatedListener NodeCreated}
     event than by overriding this method.
     @param {!IGraph} graph The graph in which to create the node.
     @param {?INode} parent The node's parent node.
     @param {!Point} location The location of the node.
     @param {*} labelData The optional label data of the node if an {@link SimpleGraphBuilder#nodeLabelBinding} is specified.
     @param {*} nodeObject The object from {@link SimpleGraphBuilder#nodesSource} from which to create the node.
     @returns {!INode} The created node. */
  createNode(graph, parent, location, labelData, nodeObject) {
    return this.$graphBuilderHelper.createNode(graph, parent, location, labelData, nodeObject)
  }

  /**
     Retrieves the object from which a given item has been created.
     @param {!IModelItem} item The item to get the object for.
     @returns {*} The object from which the graph item has been created.
     @see SimpleGraphBuilder#getNode
     @see SimpleGraphBuilder#getEdge
     @see SimpleGraphBuilder#getGroup */
  getBusinessObject(item) {
    return this.$graphBuilderHelper.getBusinessObject(item)
  }

  /**
     Retrieves the edge associated with an object from the {@link SimpleGraphBuilder#edgesSource}.
     @param {*} businessObject An object from the {@link SimpleGraphBuilder#edgesSource}.
     @returns {?IEdge} The edge associated with <code>businessObject</code>, or <code>null</code> in case there is no edge associated with that object. This can happen
     if <code>businessObject</code> is new since the last call to {@link SimpleGraphBuilder#updateGraph}.
     @see SimpleGraphBuilder#getNode
     @see SimpleGraphBuilder#getGroup
     @see SimpleGraphBuilder#getBusinessObject */
  getEdge(businessObject) {
    return this.$graphBuilderHelper.getEdge(businessObject)
  }

  /**
     Retrieves the group node associated with an object from the {@link SimpleGraphBuilder#groupsSource}.
     @param {*} groupObject An object from the {@link SimpleGraphBuilder#groupsSource}.
     @returns {?INode} The group node associated with <code>groupObject</code>, or <code>null</code> in case there is no group node associated with that object. This can
     happen if <code>groupObject</code> is new since the last call to {@link SimpleGraphBuilder#updateGraph}.
     @see SimpleGraphBuilder#getNode
     @see SimpleGraphBuilder#getEdge
     @see SimpleGraphBuilder#getBusinessObject */
  getGroup(groupObject) {
    return this.$graphBuilderHelper.getGroup(groupObject)
  }

  /**
     Retrieves the node associated with an object from the {@link SimpleGraphBuilder#nodesSource}.
     @param {*} nodeObject An object from the {@link SimpleGraphBuilder#nodesSource}.
     @returns {?INode} The node associated with <code>nodeObject</code>, or <code>null</code> in case there is no node associated with that object. This can happen if <code>nodeObject</code>
     is new since the last call to {@link SimpleGraphBuilder#updateGraph}.
     @see SimpleGraphBuilder#getEdge
     @see SimpleGraphBuilder#getGroup
     @see SimpleGraphBuilder#getBusinessObject */
  getNode(nodeObject) {
    return this.$graphBuilderHelper.getNode(nodeObject)
  }

  /**
     Updates an existing edge when the {@link SimpleGraphBuilder#updateGraph graph is updated}.
     This method is called during {@link SimpleGraphBuilder#updateGraph updating the graph} for every edge that already exists in the graph where its corresponding
     object from {@link SimpleGraphBuilder#edgesSource} is also still present.
     Customizing how edges are updated is usually easier by adding an event handler to the {@link SimpleGraphBuilder#addEdgeUpdatedListener EdgeUpdated}
     event than by overriding this method.
     @param {!IGraph} graph The edge's containing graph.
     @param {!IEdge} edge The edge to update.
     @param {*} labelData The optional label data of the edge if an {@link SimpleGraphBuilder#edgeLabelBinding} is specified.
     @param {*} edgeObject The object from {@link SimpleGraphBuilder#edgesSource} from which the edge has been created. */
  updateEdge(graph, edge, labelData, edgeObject) {
    this.$graphBuilderHelper.updateEdge(graph, edge, labelData, edgeObject)
  }

  /**
     Updates an existing group node when the {@link SimpleGraphBuilder#updateGraph graph is updated}.
     This method is called during {@link SimpleGraphBuilder#updateGraph updating the graph} for every group node that already exists in the graph where its
     corresponding object from {@link SimpleGraphBuilder#groupsSource} is also still present.
     Customizing how group nodes are updated is usually easier by adding an event handler to the {@link SimpleGraphBuilder#addGroupNodeUpdatedListener GroupNodeUpdated}
     event than by overriding this method.
     @param {!IGraph} graph The group node's containing graph.
     @param {!INode} groupNode The group node to update.
     @param {*} labelData The optional label data of the group node if an {@link SimpleGraphBuilder#groupLabelBinding} is specified.
     @param {*} groupObject The object from {@link SimpleGraphBuilder#groupsSource} from which the group node has been created. */
  updateGroupNode(graph, groupNode, labelData, groupObject) {
    this.$graphBuilderHelper.updateGroupNode(graph, groupNode, labelData, groupObject)
  }

  /**
     Updates an existing node when the {@link SimpleGraphBuilder#updateGraph graph is updated}.
     This method is called during {@link SimpleGraphBuilder#updateGraph updating the graph} for every node that already exists in the graph where its corresponding
     object from {@link SimpleGraphBuilder#nodesSource} is also still present.
     Customizing how nodes are updated is usually easier by adding an event handler to the {@link SimpleGraphBuilder#addNodeUpdatedListener NodeUpdated}
     event than by overriding this method.
     @param {!IGraph} graph The node's containing graph.
     @param {!INode} node The node to update.
     @param {?INode} parent The node's parent node.
     @param {!Point} location The location of the node.
     @param {*} labelData The optional label data of the node if an {@link SimpleGraphBuilder#nodeLabelBinding} is specified.
     @param {*} nodeObject The object from {@link SimpleGraphBuilder#nodesSource} from which the node has been created. */
  updateNode(graph, node, parent, location, labelData, nodeObject) {
    this.$graphBuilderHelper.updateNode(graph, node, parent, location, labelData, nodeObject)
  }

  /**
     Gets the {@link IGraph graph} used by this class. * @type {!IGraph}
  */
  get graph() {
    return this.$graphBuilder.graph
  }

  /**
     Gets or sets a value indicating whether or not to automatically create nodes for values returned from {@link SimpleGraphBuilder#sourceNodeBinding} and {@link SimpleGraphBuilder#targetNodeBinding} that don't
     exist in {@link SimpleGraphBuilder#nodesSource}.
     When this property is set to <code>false</code>, nodes in the graph are <em>only</em> created from {@link SimpleGraphBuilder#nodesSource}, and edge objects that result in source or
     target nodes not in {@link SimpleGraphBuilder#nodesSource} will have no edge created.
     If this property is set to <code>true</code>, edges will always be created, and if {@link SimpleGraphBuilder#sourceNodeBinding} or {@link SimpleGraphBuilder#targetNodeBinding} return values not in
     {@link SimpleGraphBuilder#nodesSource}, additional nodes are created as needed.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#edgesSource * @type {boolean}
  */
  get lazyNodeDefinition() {
    return this.$lazyNodeDefinition
  }

  /**
   * @type {boolean}
   */
  set lazyNodeDefinition(value) {
    this.$lazyNodeDefinition = value
  }

  /**
     Gets or sets the objects to be represented as nodes of the {@link SimpleGraphBuilder#graph}. * @type {*}
  */
  get nodesSource() {
    return this.$nodesSource
  }

  /**
   * @type {*}
   */
  set nodesSource(value) {
    this.$nodesSource = value
  }

  /**
     Gets or sets the objects to be represented as edges of the {@link SimpleGraphBuilder#graph}. * @type {*}
  */
  get edgesSource() {
    return this.$edgesSource
  }

  /**
   * @type {*}
   */
  set edgesSource(value) {
    this.$edgesSource = value
  }

  /**
     Gets or sets the objects to be represented as group nodes of the {@link SimpleGraphBuilder#graph}. * @type {*}
  */
  get groupsSource() {
    return this.$groupsSource
  }

  /**
   * @type {*}
   */
  set groupsSource(value) {
    this.$groupsSource = value
  }

  /**
     Gets or sets a binding that maps node objects to their identifier.
     This maps an business object that represents a node to its identifier. This is needed when {@link SimpleGraphBuilder#edgesSource edge objects} only contain an
     identifier to specify their source and target nodes instead of pointing directly to the respective node object.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     <b>Warning:</b> The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleGraphBuilder#updateGraph update mechanism} cannot
     determine whether nodes have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#sourceNodeBinding
     @see SimpleGraphBuilder#targetNodeBinding * @type {*}
  */
  get nodeIdBinding() {
    return this.$graphBuilderHelper.nodeIdBinding
  }

  /**
   * @type {*}
   */
  set nodeIdBinding(value) {
    this.$graphBuilderHelper.nodeIdBinding = value
  }

  /**
     Gets or sets a binding that maps edge objects to their identifier.
     This maps an business object that represents a edge to its identifier. This can be used to improve the performance of
     the {@link SimpleGraphBuilder} because internal maps can use a primitive id as key to store the business object instead
     of the JavaScript object itself.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     <b>Warning:</b> The identifiers returned by the binding must be stable and not change over time.
     * @type {*}
  */
  get edgeIdBinding() {
    return this.$edgeIdBinding
  }

  /**
   * @type {*}
   */
  set edgeIdBinding(value) {
    this.$edgeIdBinding = value
  }

  /**
     Gets or sets a binding that maps a node object to a label.
     This maps a business object that represents a node to an object that represents the label for the node.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleGraphBuilder#addNodeCreatedListener NodeCreated}
     event.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     Returning <code>null</code> from the binding will not create a label for that node.
     @see SimpleGraphBuilder#nodesSource * @type {*}
  */
  get nodeLabelBinding() {
    return this.$graphBuilderHelper.nodeLabelBinding
  }

  /**
   * @type {*}
   */
  set nodeLabelBinding(value) {
    this.$graphBuilderHelper.nodeLabelBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their containing groups.
     This maps an object <i>N</i> that represents a node to another object <i>G</i> that specifies the containing group of <i>N</i>. If <i>G</i> is contained
     in {@link SimpleGraphBuilder#groupsSource}, then the node for <i>N</i> becomes a child node of the group for <i>G</i>.
     If a {@link SimpleGraphBuilder#groupIdBinding} is set, the returned object <i>G</i> must be the ID of the object that specifies the group instead of that object itself.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#groupsSource
     @see SimpleGraphBuilder#groupIdBinding * @type {*}
  */
  get groupBinding() {
    return this.$graphBuilderHelper.groupBinding
  }

  /**
   * @type {*}
   */
  set groupBinding(value) {
    this.$graphBuilderHelper.groupBinding = value
  }

  /**
     Gets or sets a binding that maps an edge object to a label.
     This maps an object that represents an edge to an object that represents the label for the edge.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleGraphBuilder#addEdgeCreatedListener EdgeCreated}
     event.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     Returning <code>null</code> from the binding will not create a label for that edge.
     @see SimpleGraphBuilder#edgesSource * @type {*}
  */
  get edgeLabelBinding() {
    return this.$graphBuilderHelper.edgeLabelBinding
  }

  /**
   * @type {*}
   */
  set edgeLabelBinding(value) {
    this.$graphBuilderHelper.edgeLabelBinding = value
  }

  /**
     Gets or sets a binding that maps edge objects to their source node.
     This maps an object <i>E</i> that represents an edge to another object <i>N</i> that specifies the source node of <i>E</i>.
     If a {@link SimpleGraphBuilder#nodeIdBinding} is set, the returned object <i>N</i> must be the ID of the object that specifies the node instead of that object itself.
     If {@link SimpleGraphBuilder#lazyNodeDefinition} is <code>true</code>, the resulting node object does not have to exist in {@link SimpleGraphBuilder#nodesSource}; instead, nodes are created as needed.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#targetNodeBinding
     @see SimpleGraphBuilder#nodeIdBinding
     @see SimpleGraphBuilder#lazyNodeDefinition * @type {*}
  */
  get sourceNodeBinding() {
    return this.$sourceNodeBinding
  }

  /**
   * @type {*}
   */
  set sourceNodeBinding(value) {
    this.$sourceNodeBinding = value
  }

  /**
     Gets or sets a binding that maps edge objects to their target node.
     This maps an object <i>E</i> that represents an edge to another object <i>N</i> that specifies the target node of <i>E</i>.
     If a {@link SimpleGraphBuilder#nodeIdBinding} is set, the returned object <i>N</i> must be the ID of the object that specifies the node instead of that object itself.
     If {@link SimpleGraphBuilder#lazyNodeDefinition} is <code>true</code>, the resulting node object does not have to exist in {@link SimpleGraphBuilder#nodesSource}; instead, nodes are created as needed.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#sourceNodeBinding
     @see SimpleGraphBuilder#nodeIdBinding
     @see SimpleGraphBuilder#lazyNodeDefinition * @type {*}
  */
  get targetNodeBinding() {
    return this.$targetNodeBinding
  }

  /**
   * @type {*}
   */
  set targetNodeBinding(value) {
    this.$targetNodeBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their identifier.
     This maps an object that represents a group node to its identifier. This is needed when {@link SimpleGraphBuilder#nodesSource node objects} only contain an
     identifier to specify the group they belong to instead of pointing directly to the respective group object. The same
     goes for the parent group in group objects.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. Functions will be called with both <code>this</code> and the first and only argument as the value to convert.
     <b>Warning:</b> The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleGraphBuilder#updateGraph update mechanism} cannot
     determine whether groups have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
     @see SimpleGraphBuilder#groupsSource
     @see SimpleGraphBuilder#groupBinding
     @see SimpleGraphBuilder#parentGroupBinding * @type {*}
  */
  get groupIdBinding() {
    return this.$graphBuilderHelper.groupIdBinding
  }

  /**
   * @type {*}
   */
  set groupIdBinding(value) {
    this.$graphBuilderHelper.groupIdBinding = value
  }

  /**
     Gets or sets a binding that maps a group object to a label.
     This maps an object that represents a group node to an object that represents the label for the group node.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleGraphBuilder#addGroupNodeCreatedListener GroupNodeCreated}
     event.
     Returning <code>null</code> from the binding will not create a label for that group node.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. Functions will be called with both <code>this</code> and the first and only argument as the value to convert.
     @see SimpleGraphBuilder#groupsSource * @type {*}
  */
  get groupLabelBinding() {
    return this.$graphBuilderHelper.groupLabelBinding
  }

  /**
   * @type {*}
   */
  set groupLabelBinding(value) {
    this.$graphBuilderHelper.groupLabelBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their containing groups.
     This maps an object <i>G</i> that represents a group node to another object <i>P</i> that specifies the containing group of <i>G</i>. If <i>P</i> is
     contained in {@link SimpleGraphBuilder#groupsSource}, then the group node for <i>G</i> becomes a child node of the group for <i>P</i>.
     If a {@link SimpleGraphBuilder#groupIdBinding} is set, the returned object <i>P</i> must be the ID of the object that specifies the group instead of that object itself.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleGraphBuilder#groupsSource
     @see SimpleGraphBuilder#groupIdBinding * @type {*}
  */
  get parentGroupBinding() {
    return this.$graphBuilderHelper.parentGroupBinding
  }

  /**
   * @type {*}
   */
  set parentGroupBinding(value) {
    this.$graphBuilderHelper.parentGroupBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the x-axis.
     This binding maps a business object that represents a node to a number that specifies the x-coordinate of that node.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource * @type {*}
  */
  get locationXBinding() {
    return this.$graphBuilderHelper.locationXBinding
  }

  /**
   * @type {*}
   */
  set locationXBinding(value) {
    this.$graphBuilderHelper.locationXBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the y-axis.
     This binding maps a business object that represents a node to a number that specifies the y-coordinate of that node.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource * @type {*}
  */
  get locationYBinding() {
    return this.$graphBuilderHelper.locationYBinding
  }

  /**
   * @type {*}
   */
  set locationYBinding(value) {
    this.$graphBuilderHelper.locationYBinding = value
  }

  /**
     Adds the given listener for the <code>NodeCreated</code> event that occurs when a node has been created.
     This event can be used to further customize the created node.
     New nodes are created either in response to calling {@link SimpleGraphBuilder#buildGraph}, or in response to calling {@link SimpleGraphBuilder#updateGraph}
     when there are new items in {@link SimpleGraphBuilder#nodesSource}.
     @param {!SimpleNodeListener} listener The listener to add.
     @see SimpleGraphBuilder#addNodeUpdatedListener
     @see SimpleGraphBuilder#removeNodeCreatedListener */
  addNodeCreatedListener(listener) {
    this.$graphBuilderHelper.addNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>NodeCreated</code> event that occurs when a node has been created.
     This event can be used to further customize the created node.
     New nodes are created either in response to calling {@link SimpleGraphBuilder#buildGraph}, or in response to calling {@link SimpleGraphBuilder#updateGraph}
     when there are new items in {@link SimpleGraphBuilder#nodesSource}.
     @param {!SimpleNodeListener} listener The listener to remove.
     @see SimpleGraphBuilder#addNodeUpdatedListener
     @see SimpleGraphBuilder#addNodeCreatedListener */
  removeNodeCreatedListener(listener) {
    this.$graphBuilderHelper.removeNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>NodeUpdated</code> event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder#addNodeCreatedListener NodeCreated}.
     Nodes are updated in response to calling {@link SimpleGraphBuilder#updateGraph} for items that haven't been added anew
     in {@link SimpleGraphBuilder#nodesSource} since the last call to {@link SimpleGraphBuilder#buildGraph} or {@link SimpleGraphBuilder#updateGraph}.
     @param {!SimpleNodeListener} listener The listener to add.
     @see SimpleGraphBuilder#addNodeCreatedListener
     @see SimpleGraphBuilder#removeNodeUpdatedListener */
  addNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.addNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>NodeUpdated</code> event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder#addNodeCreatedListener NodeCreated}.
     Nodes are updated in response to calling {@link SimpleGraphBuilder#updateGraph} for items that haven't been added anew
     in {@link SimpleGraphBuilder#nodesSource} since the last call to {@link SimpleGraphBuilder#buildGraph} or {@link SimpleGraphBuilder#updateGraph}.
     @param {!SimpleNodeListener} listener The listener to remove.
     @see SimpleGraphBuilder#addNodeCreatedListener
     @see SimpleGraphBuilder#addNodeUpdatedListener */
  removeNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeNodeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the <code>EdgeCreated</code> event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
     New edges are created either in response to calling {@link SimpleGraphBuilder#buildGraph}, or in response to calling {@link SimpleGraphBuilder#updateGraph}
     when there are new items in {@link SimpleGraphBuilder#edgesSource}.
     @param {!SimpleEdgeListener} listener The listener to add.
     @see SimpleGraphBuilder#addEdgeUpdatedListener
     @see SimpleGraphBuilder#removeEdgeCreatedListener */
  addEdgeCreatedListener(listener) {
    this.$graphBuilderHelper.addEdgeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>EdgeCreated</code> event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
     New edges are created either in response to calling {@link SimpleGraphBuilder#buildGraph}, or in response to calling {@link SimpleGraphBuilder#updateGraph}
     when there are new items in {@link SimpleGraphBuilder#edgesSource}.
     @param {!SimpleEdgeListener} listener The listener to remove.
     @see SimpleGraphBuilder#addEdgeUpdatedListener
     @see SimpleGraphBuilder#addEdgeCreatedListener */
  removeEdgeCreatedListener(listener) {
    this.$graphBuilderHelper.removeEdgeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>EdgeUpdated</code> event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder#addEdgeCreatedListener EdgeCreated}.
     Edges are updated in response to calling {@link SimpleGraphBuilder#updateGraph} for items that haven't been added anew
     in {@link SimpleGraphBuilder#edgesSource} since the last call to {@link SimpleGraphBuilder#buildGraph} or {@link SimpleGraphBuilder#updateGraph}.
     @param {!SimpleEdgeListener} listener The listener to add.
     @see SimpleGraphBuilder#addEdgeCreatedListener
     @see SimpleGraphBuilder#removeEdgeUpdatedListener */
  addEdgeUpdatedListener(listener) {
    this.$graphBuilderHelper.addEdgeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>EdgeUpdated</code> event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder#addEdgeCreatedListener EdgeCreated}.
     Edges are updated in response to calling {@link SimpleGraphBuilder#updateGraph} for items that haven't been added anew
     in {@link SimpleGraphBuilder#edgesSource} since the last call to {@link SimpleGraphBuilder#buildGraph} or {@link SimpleGraphBuilder#updateGraph}.
     @param {!SimpleEdgeListener} listener The listener to remove.
     @see SimpleGraphBuilder#addEdgeCreatedListener
     @see SimpleGraphBuilder#addEdgeUpdatedListener */
  removeEdgeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeEdgeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the <code>GroupNodeCreated</code> event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
     New group nodes are created either in response to calling {@link SimpleGraphBuilder#buildGraph}, or in response to
     calling {@link SimpleGraphBuilder#updateGraph} when there are new items in {@link SimpleGraphBuilder#groupsSource}.
     @param {!SimpleNodeListener} listener The listener to add.
     @see SimpleGraphBuilder#addGroupNodeUpdatedListener
     @see SimpleGraphBuilder#removeGroupNodeCreatedListener */
  addGroupNodeCreatedListener(listener) {
    this.$graphBuilderHelper.addGroupNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>GroupNodeCreated</code> event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
     New group nodes are created either in response to calling {@link SimpleGraphBuilder#buildGraph}, or in response to
     calling {@link SimpleGraphBuilder#updateGraph} when there are new items in {@link SimpleGraphBuilder#groupsSource}.
     @param {!SimpleNodeListener} listener The listener to remove.
     @see SimpleGraphBuilder#addGroupNodeUpdatedListener
     @see SimpleGraphBuilder#addGroupNodeCreatedListener */
  removeGroupNodeCreatedListener(listener) {
    this.$graphBuilderHelper.removeGroupNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>GroupNodeUpdated</code> event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder#addGroupNodeCreatedListener GroupNodeCreated}.
     Group nodes are updated in response to calling {@link SimpleGraphBuilder#updateGraph} for items that haven't been added
     anew in {@link SimpleGraphBuilder#groupsSource} since the last call to {@link SimpleGraphBuilder#buildGraph} or {@link SimpleGraphBuilder#updateGraph}.
     @param {!SimpleNodeListener} listener The listener to add.
     @see SimpleGraphBuilder#addGroupNodeCreatedListener
     @see SimpleGraphBuilder#removeGroupNodeUpdatedListener */
  addGroupNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.addGroupNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>GroupNodeUpdated</code> event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder#addGroupNodeCreatedListener GroupNodeCreated}.
     Group nodes are updated in response to calling {@link SimpleGraphBuilder#updateGraph} for items that haven't been added
     anew in {@link SimpleGraphBuilder#groupsSource} since the last call to {@link SimpleGraphBuilder#buildGraph} or {@link SimpleGraphBuilder#updateGraph}.
     @param {!SimpleNodeListener} listener The listener to remove.
     @see SimpleGraphBuilder#addGroupNodeCreatedListener
     @see SimpleGraphBuilder#addGroupNodeUpdatedListener */
  removeGroupNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeGroupNodeUpdatedListener(listener)
  }
}

export class SimpleGraphBuilderItemEventArgs extends ItemEventArgs {
  /**
     Creates a new instance of the {@link SimpleGraphBuilderItemEventArgs} class with the given graph, item, and source object.
     @param {!IGraph} graph The graph that can be used to modify <code>item</code>.
     @param {!TItem} item The item created from <code>itemData</code>.
     @param {!TSourceObject} sourceObject The object <code>item</code> was created from. */
  constructor(graph, item, sourceObject) {
    super(item)
    // Gets the graph that can be used to modify the {@link ItemEventArgs#item}.
    this.graph = graph
    // Gets the object the {@link ItemEventArgs#item} has been created from.
    this.sourceObject = sourceObject
  }
}

/**
 * @param {*} collection
 * @returns {!Iterable}
 */
function createIterable(collection) {
  if (collection[Symbol.iterator]) {
    return collection
  } else {
    return Object.values(collection)
  }
}

/**
 * @param {*} originalCollection
 * @returns {!NodeCollectionCloner}
 */
function createNodeCollectionCloner(originalCollection) {
  if (originalCollection[Symbol.iterator]) {
    return new IterableNodeCollectionCloner(originalCollection)
  } else {
    return new ObjectNodeCollectionCloner(originalCollection)
  }
}

/**
 * @typedef {Object} NodeCollectionCloner
 * @property {Function} add
 * @property {Function} has
 * @property {*} collection
 */

class IterableNodeCollectionCloner {
  /**
   * @type {*}
   */
  get collection() {
    return this.$array
  }

  /**
   * @param {!(IEnumerable|Array.<*>|Iterable)} originalCollection
   */
  constructor(originalCollection) {
    this.$array = []
    this.$valueSet = new Set()

    for (const itemData of originalCollection) {
      this.add(itemData)
    }
  }

  /**
   * @param {*} itemData
   * @returns {*}
   */
  add(itemData) {
    this.$array.push(itemData)
    this.$valueSet.add(itemData)
    return itemData
  }

  /**
   * @param {*} itemData
   * @returns {boolean}
   */
  has(itemData) {
    return this.$valueSet.has(itemData)
  }
}

class ObjectNodeCollectionCloner {
  /**
   * @type {*}
   */
  get collection() {
    return this.$object
  }

  /**
   * @param {!Record.<string,*>} originalCollection
   */
  constructor(originalCollection) {
    this.$currentIndex = 0
    this.$object = {}
    this.$valueSet = new Set()
    Object.keys(originalCollection).forEach(key => {
      this.$object[key] = originalCollection[key]
      this.$valueSet.add(key)

      const numberIndex = parseInt(key)
      if (!isNaN(numberIndex)) {
        this.$currentIndex = Math.max(this.$currentIndex, numberIndex)
      }
    })
  }

  /**
   * @param {*} itemData
   * @returns {*}
   */
  add(itemData) {
    const key = this.$newKey()
    this.$object[key] = itemData
    this.$valueSet.add(key)
    return key
  }

  /**
   * @param {*} id
   * @returns {boolean}
   */
  has(id) {
    return this.$valueSet.has(id)
  }

  /**
   * @returns {!string}
   */
  $newKey() {
    return (++this.$currentIndex).toString(10)
  }
}

/**
 * @param {*} originalCollection
 * @returns {!EdgeCollectionCloner}
 */
function createEdgeCollectionCloner(originalCollection) {
  if (originalCollection[Symbol.iterator]) {
    return new IterableEdgeCollectionCloner(originalCollection)
  } else {
    return new ObjectEdgeCollectionCloner(originalCollection)
  }
}

/**
 * @typedef {Object} EdgeCollectionCloner
 * @property {Function} generator
 * @property {*} collection
 */

class IterableEdgeCollectionCloner {
  /**
   * @param {!Iterable} originalCollection
   */
  constructor(originalCollection) {
    this.$originalCollection = originalCollection
    this.$array = []
  }

  /**
   * @type {*}
   */
  get collection() {
    return this.$array
  }

  /**
   * @returns {!Generator}
   */
  *generator() {
    for (const edgeDataItem of this.$originalCollection) {
      this.$array.push(yield edgeDataItem)
    }
  }
}

class ObjectEdgeCollectionCloner {
  /**
   * @type {*}
   */
  get collection() {
    return this.$object
  }

  /**
   * @param {!Record.<string,*>} originalCollection
   */
  constructor(originalCollection) {
    this.$originalCollection = originalCollection
    this.$object = {}
  }

  /**
   * @returns {!Generator}
   */
  *generator() {
    for (const [id, edgeDataItem] of Object.entries(this.$originalCollection)) {
      this.$object[id] = yield edgeDataItem
    }
  }
}

/**
 * @typedef {Object} SimpleTreeBuilderOptionArgs
 * @property {IGraph} [graph]
 * @property {*} [nodesSource]
 * @property {*} [groupsSource]
 * @property {*} [idBinding]
 * @property {*} [nodeLabelBinding]
 * @property {*} [locationXBinding]
 * @property {*} [locationYBinding]
 * @property {*} [childBinding]
 * @property {*} [groupBinding]
 * @property {*} [edgeLabelBinding]
 * @property {*} [groupIdBinding]
 * @property {*} [groupLabelBinding]
 * @property {*} [parentGroupBinding]
 */

/**
 * @typedef {Object} NodeType
 * @property {*} dataItem
 * @property {Array.<NodeType>} children
 */

/**
 * @typedef {Object} AdjacentNodesGraphBuilderBaseCalls
 * @property {Function} createNodeBase
 * @property {Function} createGroupNodeBase
 * @property {Function} createEdgeBase
 * @property {Function} updateEdgeBase
 * @property {Function} updateGroupNodeBase
 * @property {Function} updateNodeBase
 */
/**
 Populates a graph from custom data where objects corresponding to nodes have a parent-child relationship.
 This class can be used when the data specifies a collection of nodes, each of which knows its child nodes,
 andoptionallya collection of groups. The properties {@link SimpleTreeBuilder#nodesSource} and {@link SimpleTreeBuilder#groupsSource} define the source collections from which nodes and groups
 will be created.
 Generally, using the {@link SimpleTreeBuilder} class consists of a few basic steps:
 <ol>
 <li>Set up the {@link SimpleTreeBuilder#graph} with the proper defaults for items ({@link IGraph#nodeDefaults}, {@link IGraph#groupNodeDefaults}, {@link IGraph#edgeDefaults})
 <li>Create a {@link SimpleTreeBuilder}.
 <li>Set the items sources. At the very least the {@link SimpleTreeBuilder#nodesSource} is needed. Note that the {@link SimpleTreeBuilder#nodesSource} does not have to contain all nodes, as nodes
 that are implicitly specified through the {@link SimpleTreeBuilder#childBinding} are automatically added to the graph as well. If the items in the nodes
 collection are grouped somehow, then also set the {@link SimpleTreeBuilder#groupsSource} property.
 <li>Set up the bindings so that a graph structure can actually be created from the items sources. This involves setting up
 the {@link SimpleTreeBuilder#childBinding} property so that edges can be created. If the node objects don't actually contain their children objects, but
 instead identifiers of other node objects, then {@link SimpleTreeBuilder#childBinding} would return those identifiers and {@link SimpleTreeBuilder#idBinding} must be set to return that
 identifier when given a node object.
 <li>If {@link SimpleTreeBuilder#groupsSource} is set, then you also need to set the {@link SimpleTreeBuilder#groupBinding} property to enable mapping nodes to groups. Just like with a node's children,
 if the node object only contains an identifier for a group node and not the actual group object, then return the
 identifier in the {@link SimpleTreeBuilder#groupBinding} and set up the {@link SimpleTreeBuilder#groupIdBinding} to map group node objects to their identifiers. If group nodes can nest, you also
 need the {@link SimpleTreeBuilder#parentGroupBinding}.
 <li>You can also easily create labels for nodes, groups, and edges by using the {@link SimpleTreeBuilder#nodeLabelBinding}, {@link SimpleTreeBuilder#groupLabelBinding}, and {@link SimpleTreeBuilder#edgeLabelBinding} properties.
 <li>Call {@link SimpleTreeBuilder#buildGraph} to populate the graph. You can apply a layout algorithm afterward to make the
 graph look nice.
 <li>If your items or collections change later, call {@link SimpleTreeBuilder#updateGraph} to make those changes visible in
 the graph.
 </ol>
 You can further customize how nodes, groups, and edges are created by adding event handlers to the various events and
 modifying the items there. This can be used to modify items in ways that are not directly supported by the available
 bindings or defaults. This includes scenarios such as the following:
 <ul>
 <li>Setting node positions or adding bends to edges. Often a layout is applied to the graph after building it, so these
 things are only rarely needed.
 <li>Modifying individual items, such as setting a different style for every nodes, depending on the bound object.
 <li>Adding more than one label for an item, as the {@link SimpleTreeBuilder#nodeLabelBinding} and {@link SimpleTreeBuilder#edgeLabelBinding} will only create a single label, or adding labels to group nodes.
 </ul>
 There are creation and update events for all three types of items, which allows separate customization when nodes,
 groups, and edges are created or updated. For completely static graphs where {@link SimpleTreeBuilder#updateGraph} is
 not needed, the update events can be safely ignored.
 Depending on how the source data is laid out, you may also consider using {@link SimpleAdjacentNodesGraphBuilder},
 where node objects know their neighbors, or {@link SimpleGraphBuilder} which is a more general approach to creating
 arbitrary graphs.
 <h2>Note</h2>
 This class serves as a convenient way to create trees or forests and has some limitations:
 <ul>
 <li>When populating the graph for the first time it will be cleared of all existing items.
 <li>When using a {@link SimpleTreeBuilder#idBinding}, all nodes have to exist in the {@link SimpleTreeBuilder#nodesSource}. Nodes cannot be created on demand from IDs only.
 <li>Elements manually created on the graph in between calls to {@link SimpleTreeBuilder#updateGraph} may not be preserved.
 </ul>
 If updates get too complex it's often better to write the code interfacing with the graph by hand instead of relying on
 {@link SimpleTreeBuilder}.
 The different graph builders are discussed in the section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder Creating a Graph from Business Data}. Class <code>TreeBuilder</code>, in
 particular, is topic of section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-TreeBuilder TreeBuilder}.
 @see SimpleGraphBuilder
 @see SimpleAdjacentNodesGraphBuilder */
export class SimpleTreeBuilder {
  /**
     Initializes a new instance of the {@link SimpleTreeBuilder} class that operates on the given graph.
     The <code>graph</code> will be {@link IGraph#clear cleared} and re-built from the data in {@link SimpleTreeBuilder#nodesSource} and {@link SimpleTreeBuilder#groupsSource} when {@link SimpleTreeBuilder#buildGraph} is called.
     @param graphOrOptions The parameters to pass.
     @param [graphOrOptions.graph=null]
     @param [graphOrOptions.nodesSource] The objects to be represented as nodes of the {@link SimpleTreeBuilder#graph}. This option sets the {@link SimpleTreeBuilder#nodesSource} property on the created object.
     @param [graphOrOptions.groupsSource] The objects to be represented as group nodes of the {@link SimpleTreeBuilder#graph}. This option sets the {@link SimpleTreeBuilder#groupsSource} property on the created object.
     @param [graphOrOptions.idBinding] A binding that maps node objects to their identifier. This option sets the {@link SimpleTreeBuilder#idBinding} property on the created object.
     @param [graphOrOptions.nodeLabelBinding] A binding that maps a node object to a label. This option sets the {@link SimpleTreeBuilder#nodeLabelBinding} property on the created object.
     @param [graphOrOptions.locationXBinding] The binding for determining a node's position on the x-axis. This option sets the {@link SimpleTreeBuilder#locationXBinding} property on the created object.
     @param [graphOrOptions.locationYBinding] The binding for determining a node's position on the y-axis. This option sets the {@link SimpleTreeBuilder#locationYBinding} property on the created object.
     @param [graphOrOptions.childBinding] A binding that maps node objects to their child nodes. This option sets the {@link SimpleTreeBuilder#childBinding} property on the created object.
     @param [graphOrOptions.groupBinding] A binding that maps node objects to their containing groups. This option sets the {@link SimpleTreeBuilder#groupBinding} property on the created object.
     @param [graphOrOptions.edgeLabelBinding] A binding that maps a node object representing the edge's target node to a label. This option sets the {@link SimpleTreeBuilder#edgeLabelBinding} property on the created object.
     @param [graphOrOptions.groupIdBinding] A binding that maps group objects to their identifier. This option sets the {@link SimpleTreeBuilder#groupIdBinding} property on the created object.
     @param [graphOrOptions.groupLabelBinding] A binding that maps a group object to a label. This option sets the {@link SimpleTreeBuilder#groupLabelBinding} property on the created object.
     @param [graphOrOptions.parentGroupBinding] A binding that maps group objects to their containing groups. This option sets the {@link SimpleTreeBuilder#parentGroupBinding} property on the created object. * @param {?(IGraph|SimpleTreeBuilderOptionArgs)} [graphOrOptions]
  */
  constructor(graphOrOptions) {
    let options = null
    let graph
    if (!graphOrOptions) {
      graph = new DefaultGraph()
    } else if (IGraph.isInstance(graphOrOptions)) {
      graph = graphOrOptions
    } else {
      options = graphOrOptions
      graph = options.graph || new DefaultGraph()
    }

    this.$edgeLabelBinding = null
    this.$adjacentNodesGraphBuilder = this.$createAdjacentNodesGraphBuilderWrapper(graph)

    if (options) {
      this.$applyOptions(options)
    }
  }

  /**
   * @param {!SimpleTreeBuilderOptionArgs} options
   */
  $applyOptions(options) {
    if (options.nodesSource) this.nodesSource = options.nodesSource
    if (options.childBinding) this.childBinding = options.childBinding
    if (options.groupsSource) this.groupsSource = options.groupsSource
    if (options.idBinding) this.idBinding = options.idBinding
    if (options.nodeLabelBinding) this.nodeLabelBinding = options.nodeLabelBinding
    if (options.groupBinding) this.groupBinding = options.groupBinding
    if (options.edgeLabelBinding) this.edgeLabelBinding = options.edgeLabelBinding
    if (options.groupIdBinding) this.groupIdBinding = options.groupIdBinding
    if (options.groupLabelBinding) this.groupLabelBinding = options.groupLabelBinding
    if (options.parentGroupBinding) this.parentGroupBinding = options.parentGroupBinding
    if (options.locationXBinding) this.locationXBinding = options.locationXBinding
    if (options.locationYBinding) this.locationYBinding = options.locationYBinding
  }

  /**
   * @param {!IGraph} graph
   * @returns {*}
   */
  $createAdjacentNodesGraphBuilderWrapper(graph) {
    class AdjacentNodesGraphBuilderWrapper extends SimpleAdjacentNodesGraphBuilder {
      /**
       * @param {?(IGraph|AdjacentNodesGraphBuilderOptionArgs)} graphOrOptions
       * @param {!SimpleTreeBuilder} treeBuilder
       */
      constructor(graphOrOptions, treeBuilder) {
        super(graphOrOptions)
        this.$treeBuilder = treeBuilder
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} source
       * @param {!INode} target
       * @param {*} labelData
       * @returns {!IEdge}
       */
      createEdge(graph, source, target, labelData) {
        return this.$treeBuilder.createEdge(graph, source, target, labelData)
      }

      /**
       * @param {!IGraph} graph
       * @param {*} labelData
       * @param {*} groupObject
       * @returns {!INode}
       */
      createGroupNode(graph, labelData, groupObject) {
        return this.$treeBuilder.createGroupNode(graph, labelData, groupObject)
      }

      /**
       * @param {!IGraph} graph
       * @param {?INode} parent
       * @param {!Point} location
       * @param {*} labelData
       * @param {*} nodeObject
       * @returns {!INode}
       */
      createNode(graph, parent, location, labelData, nodeObject) {
        return this.$treeBuilder.createNode(graph, parent, location, labelData, nodeObject)
      }

      /**
       * @param {!IGraph} graph
       * @param {!IEdge} edge
       * @param {*} labelData
       */
      updateEdge(graph, edge, labelData) {
        this.$treeBuilder.updateEdge(graph, edge, labelData)
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} groupNode
       * @param {*} labelData
       * @param {*} groupObject
       */
      updateGroupNode(graph, groupNode, labelData, groupObject) {
        this.$treeBuilder.updateGroupNode(graph, groupNode, labelData, groupObject)
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} node
       * @param {?INode} parent
       * @param {!Point} location
       * @param {*} labelData
       * @param {*} nodeObject
       */
      updateNode(graph, node, parent, location, labelData, nodeObject) {
        this.$treeBuilder.updateNode(graph, node, parent, location, labelData, nodeObject)
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} source
       * @param {!INode} target
       * @param {*} labelData
       * @returns {!IEdge}
       */
      createEdgeBase(graph, source, target, labelData) {
        return super.createEdge(graph, source, target, labelData)
      }

      /**
       * @param {!IGraph} graph
       * @param {*} labelData
       * @param {*} groupObject
       * @returns {!INode}
       */
      createGroupNodeBase(graph, labelData, groupObject) {
        return super.createGroupNode(graph, labelData, groupObject)
      }

      /**
       * @param {!IGraph} graph
       * @param {?INode} parent
       * @param {!Point} location
       * @param {*} labelData
       * @param {*} nodeObject
       * @returns {!INode}
       */
      createNodeBase(graph, parent, location, labelData, nodeObject) {
        return super.createNode(graph, parent, location, labelData, nodeObject)
      }

      /**
       * @param {!IGraph} graph
       * @param {!IEdge} edge
       * @param {*} labelData
       */
      updateEdgeBase(graph, edge, labelData) {
        super.updateEdge(graph, edge, labelData)
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} groupNode
       * @param {*} labelData
       * @param {*} groupObject
       */
      updateGroupNodeBase(graph, groupNode, labelData, groupObject) {
        super.updateGroupNode(graph, groupNode, labelData, groupObject)
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} node
       * @param {?INode} parent
       * @param {!Point} location
       * @param {*} labelData
       * @param {*} nodeObject
       */
      updateNodeBase(graph, node, parent, location, labelData, nodeObject) {
        super.updateNode(graph, node, parent, location, labelData, nodeObject)
      }
    }

    return new AdjacentNodesGraphBuilderWrapper(graph, this)
  }

  /**
     Populates the graph with items generated from the bound data.
     The graph is cleared, and then new nodes, groups, and edges are created as defined by the source collections.
     @returns {!IGraph} The created graph.
     @see SimpleTreeBuilder#updateGraph */
  buildGraph() {
    if (this.nodesSource == null || this.childBinding == null) {
      throw new Error(
        'The nodesSource and childBinding properties must be set before calling buildGraph.'
      )
    }
    return this.$adjacentNodesGraphBuilder.buildGraph()
  }

  /**
   Updates the graph after changes in the bound data.
   In contrast to
   {@link SimpleTreeBuilder#buildGraph}, the graph is not cleared. Instead, graph elements corresponding to objects that
   are still present in the source collections are kept, new graph elements are created for new objects in the collections,
   and obsolete ones are removed.
   */
  updateGraph() {
    this.$adjacentNodesGraphBuilder.updateGraph()
  }

  /**
     Creates an edge from the given <code>source</code>, <code>target</code>, and <code>labelData</code>.
     This method is called for every edge that is created either when {@link SimpleTreeBuilder#buildGraph building the graph}, or when new items appear in the {@link SimpleTreeBuilder#childBinding}
     when {@link SimpleTreeBuilder#updateGraph updating it}.
     The default behavior is to create the edge and create a label from <code>labelData</code>, if present.
     Customizing how edges are created is usually easier by adding an event handler to the {@link SimpleTreeBuilder#addEdgeCreatedListener EdgeCreated}
     event than by overriding this method.
     @param {!IGraph} graph The graph in which to create the edge.
     @param {!INode} source The source node for the edge.
     @param {!INode} target The target node for the edge.
     @param {*} labelData The optional label data of the edge if an {@link SimpleTreeBuilder#edgeLabelBinding} is specified.
     @returns {!IEdge} The created edge. */
  createEdge(graph, source, target, labelData) {
    return this.$adjacentNodesGraphBuilder.createEdgeBase(graph, source, target, labelData)
  }

  /**
     Creates a group node from the given <code>groupObject</code> and <code>labelData</code>.
     This method is called for every group node that is created either when {@link SimpleTreeBuilder#buildGraph building the graph}, or when new items appear in
     the {@link SimpleTreeBuilder#groupsSource} when {@link SimpleTreeBuilder#updateGraph updating it}.
     The default behavior is to create the group node, assign the <code>groupObject</code> to the group node's {@link ITagOwner#tag} property, and create a
     label from <code>labelData</code>, if present.
     Customizing how group nodes are created is usually easier by adding an event handler to the {@link SimpleTreeBuilder#addGroupNodeCreatedListener GroupNodeCreated}
     event than by overriding this method.
     @param {!IGraph} graph The graph in which to create the group node.
     @param {*} labelData The optional label data of the group node if an {@link SimpleTreeBuilder#groupLabelBinding} is specified.
     @param {*} groupObject The object from {@link SimpleTreeBuilder#groupsSource} from which to create the group node.
     @returns {!INode} The created group node. */
  createGroupNode(graph, labelData, groupObject) {
    return this.$adjacentNodesGraphBuilder.createGroupNodeBase(graph, labelData, groupObject)
  }

  /**
     Creates a node with the specified parent from the given <code>nodeObject</code> and <code>labelData</code>.
     This method is called for every node that is created either when {@link SimpleTreeBuilder#buildGraph building the graph}, or when new items appear in the {@link SimpleTreeBuilder#nodesSource}
     when {@link SimpleTreeBuilder#updateGraph updating it}.
     The default behavior is to create the node with the given parent node, assign the <code>nodeObject</code> to the node's {@link ITagOwner#tag} property,
     and create a label from <code>labelData</code>, if present.
     Customizing how nodes are created is usually easier by adding an event handler to the {@link SimpleTreeBuilder#addNodeCreatedListener NodeCreated}
     event than by overriding this method.
     @param {!IGraph} graph The graph in which to create the node.
     @param {?INode} parent The node's parent node.
     @param {!Point} location The location of the node.
     @param {*} labelData The optional label data of the node if an {@link SimpleTreeBuilder#nodeLabelBinding} is specified.
     @param {*} nodeObject The object from {@link SimpleTreeBuilder#nodesSource} from which to create the node.
     @returns {!INode} The created node. */
  createNode(graph, parent, location, labelData, nodeObject) {
    return this.$adjacentNodesGraphBuilder.createNodeBase(
      graph,
      parent,
      location,
      labelData,
      nodeObject
    )
  }

  /**
     Retrieves the object from which a given item has been created.
     @param {!IModelItem} item The item to get the object for.
     @returns {*} The object from which the graph item has been created.
     @see SimpleTreeBuilder#getNode
     @see SimpleTreeBuilder#getGroup */
  getBusinessObject(item) {
    return this.$adjacentNodesGraphBuilder.getBusinessObject(item)
  }

  /**
     Retrieves the group node associated with an object from the {@link SimpleTreeBuilder#groupsSource}.
     @param {*} groupObject An object from the {@link SimpleTreeBuilder#groupsSource}.
     @returns {?INode} The group node associated with <code>groupObject</code>, or <code>null</code> in case there is no group node associated with that object. This can
     happen if <code>groupObject</code> is new since the last call to {@link SimpleTreeBuilder#updateGraph}.
     @see SimpleTreeBuilder#getNode
     @see SimpleTreeBuilder#getBusinessObject */
  getGroup(groupObject) {
    return this.$adjacentNodesGraphBuilder.getGroup(groupObject)
  }

  /**
     Retrieves the node associated with an object from the {@link SimpleTreeBuilder#nodesSource}.
     @param {*} nodeObject An object from the {@link SimpleTreeBuilder#nodesSource}.
     @returns {?INode} The node associated with <code>nodeObject</code>, or <code>null</code> in case there is no node associated with that object. This can happen if <code>nodeObject</code>
     is new since the last call to {@link SimpleTreeBuilder#updateGraph}.
     @see SimpleTreeBuilder#getGroup
     @see SimpleTreeBuilder#getBusinessObject */
  getNode(nodeObject) {
    return this.$adjacentNodesGraphBuilder.getNode(nodeObject)
  }

  /**
     Updates an existing edge when the {@link SimpleTreeBuilder#updateGraph graph is updated}.
     This method is called during {@link SimpleTreeBuilder#updateGraph updating the graph} for every edge that already exists in the graph where its corresponding
     source and target node objects also still exist.
     Customizing how edges are updated is usually easier by adding an event handler to the {@link SimpleTreeBuilder#addEdgeUpdatedListener EdgeUpdated}
     event than by overriding this method.
     @param {!IGraph} graph The edge's containing graph.
     @param {!IEdge} edge The edge to update.
     @param {*} labelData The optional label data of the edge if an {@link SimpleTreeBuilder#nodeLabelBinding} is specified. */
  updateEdge(graph, edge, labelData) {
    this.$adjacentNodesGraphBuilder.updateEdgeBase(graph, edge, labelData)
  }

  /**
     Updates an existing group node when the {@link SimpleTreeBuilder#updateGraph graph is updated}.
     This method is called during {@link SimpleTreeBuilder#updateGraph updating the graph} for every group node that already exists in the graph where its
     corresponding object from {@link SimpleTreeBuilder#groupsSource} is also still present.
     Customizing how group nodes are updated is usually easier by adding an event handler to the {@link SimpleTreeBuilder#addGroupNodeUpdatedListener GroupNodeUpdated}
     event than by overriding this method.
     @param {!IGraph} graph The group node's containing graph.
     @param {!INode} groupNode The group node to update.
     @param {*} labelData The optional label data of the group node if an {@link SimpleTreeBuilder#groupLabelBinding} is specified.
     @param {*} groupObject The object from {@link SimpleTreeBuilder#groupsSource} from which the group node has been created. */
  updateGroupNode(graph, groupNode, labelData, groupObject) {
    this.$adjacentNodesGraphBuilder.updateGroupNodeBase(graph, groupNode, labelData, groupObject)
  }

  /**
     Updates an existing node when the {@link SimpleTreeBuilder#updateGraph graph is updated}.
     This method is called during {@link SimpleTreeBuilder#updateGraph updating the graph} for every node that already exists in the graph where its corresponding
     object from {@link SimpleTreeBuilder#nodesSource} is also still present.
     Customizing how nodes are updated is usually easier by adding an event handler to the {@link SimpleTreeBuilder#addNodeUpdatedListener NodeUpdated}
     event than by overriding this method.
     @param {!IGraph} graph The node's containing graph.
     @param {!INode} node The node to update.
     @param {?INode} parent The node's parent node.
     @param {!Point} location The location of the node.
     @param {*} labelData The optional label data of the node if an {@link SimpleTreeBuilder#nodeLabelBinding} is specified.
     @param {*} nodeObject The object from {@link SimpleTreeBuilder#nodesSource} from which the node has been created. */
  updateNode(graph, node, parent, location, labelData, nodeObject) {
    this.$adjacentNodesGraphBuilder.updateNodeBase(
      graph,
      node,
      parent,
      location,
      labelData,
      nodeObject
    )
  }

  /**
     Gets the {@link IGraph graph} used by this class. * @type {!IGraph}
  */
  get graph() {
    return this.$adjacentNodesGraphBuilder.graph
  }

  /**
     Gets or sets the objects to be represented as nodes of the {@link SimpleTreeBuilder#graph}.
     Note that it is not necessary to include all nodes in this property, if they can be reached via the
     {@link SimpleTreeBuilder#childBinding}. In this case it suffices to include all root nodes.
     * @type {*}
  */
  get nodesSource() {
    return this.$adjacentNodesGraphBuilder.nodesSource
  }

  /**
   * @type {*}
   */
  set nodesSource(value) {
    this.$adjacentNodesGraphBuilder.nodesSource = value
  }

  /**
     Gets or sets the objects to be represented as group nodes of the {@link SimpleTreeBuilder#graph}. * @type {*}
  */
  get groupsSource() {
    return this.$adjacentNodesGraphBuilder.groupsSource
  }

  /**
   * @type {*}
   */
  set groupsSource(value) {
    this.$adjacentNodesGraphBuilder.groupsSource = value
  }

  /**
     Gets or sets a binding that maps node objects to their identifier.
     This maps an object that represents a node to its identifier. This is needed when {@link SimpleTreeBuilder#childBinding children} are represented only by an
     identifier of nodes instead of pointing directly to the respective node objects.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     <b>Warning:</b> The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleTreeBuilder#updateGraph update mechanism} cannot
     determine whether nodes have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
     @see SimpleTreeBuilder#nodesSource
     @see SimpleTreeBuilder#childBinding * @type {*}
  */
  get idBinding() {
    return this.$adjacentNodesGraphBuilder.nodeIdBinding
  }

  /**
   * @type {*}
   */
  set idBinding(value) {
    this.$adjacentNodesGraphBuilder.nodeIdBinding = value
  }

  /**
     Gets or sets a binding that maps a node object to a label.
     This maps an object that represents a node to an object that represents the label for the node.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleTreeBuilder#addNodeCreatedListener NodeCreated}
     event.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     Returning <code>null</code> from the binding will not create a label for that node.
     @see SimpleTreeBuilder#nodesSource * @type {*}
  */
  get nodeLabelBinding() {
    return this.$adjacentNodesGraphBuilder.nodeLabelBinding
  }

  /**
   * @type {*}
   */
  set nodeLabelBinding(value) {
    this.$adjacentNodesGraphBuilder.nodeLabelBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the x-axis.
     This binding maps a business object that represents a node to a number that specifies the x-coordinate of that node.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleTreeBuilder#nodesSource * @type {*}
  */
  get locationXBinding() {
    return this.$adjacentNodesGraphBuilder.locationXBinding
  }

  /**
   * @type {*}
   */
  set locationXBinding(value) {
    this.$adjacentNodesGraphBuilder.locationXBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the y-axis.
     This binding maps a business object that represents a node to a number that specifies the y-coordinate of that node.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleTreeBuilder#nodesSource * @type {*}
  */
  get locationYBinding() {
    return this.$adjacentNodesGraphBuilder.locationYBinding
  }

  /**
   * @type {*}
   */
  set locationYBinding(value) {
    this.$adjacentNodesGraphBuilder.locationYBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their child nodes.
     This maps an object that represents a node to a set of other objects that represent its child nodes.
     If a {@link SimpleTreeBuilder#idBinding} is set, the returned objects must be the IDs of node objects instead of the node objects themselves.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleTreeBuilder#nodesSource
     @see SimpleTreeBuilder#idBinding * @type {*}
  */
  get childBinding() {
    return this.$adjacentNodesGraphBuilder.successorsBinding
  }

  /**
   * @type {*}
   */
  set childBinding(value) {
    this.$adjacentNodesGraphBuilder.successorsBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their containing groups.
     This maps an object <i>N</i> that represents a node to another object <i>G</i> that specifies the containing group of <i>N</i>. If <i>G</i> is contained
     in {@link SimpleTreeBuilder#groupsSource}, then the node for <i>N</i> becomes a child node of the group for <i>G</i>.
     If a {@link SimpleTreeBuilder#groupIdBinding} is set, the returned object <i>G</i> must be the ID of the object that specifies the group instead of that object itself.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleTreeBuilder#nodesSource
     @see SimpleTreeBuilder#groupsSource
     @see SimpleTreeBuilder#groupIdBinding * @type {*}
  */
  get groupBinding() {
    return this.$adjacentNodesGraphBuilder.groupBinding
  }

  /**
   * @type {*}
   */
  set groupBinding(value) {
    this.$adjacentNodesGraphBuilder.groupBinding = value
  }

  /**
     Gets or sets a binding that maps a node object representing the edge's target node to a label.
     This maps an object that represents an edge to an object that represents the label for the edge.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleTreeBuilder#addEdgeCreatedListener EdgeCreated}
     event.
     Returning <code>null</code> from the binding will not create a label for that edge.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     * @type {*}
  */
  get edgeLabelBinding() {
    return this.$edgeLabelBinding
  }

  /**
   * @type {*}
   */
  set edgeLabelBinding(value) {
    this.$edgeLabelBinding = value
    const edgeLabelBinding = GraphBuilderHelper.createBinding(value)
    if (edgeLabelBinding != null) {
      this.$adjacentNodesGraphBuilder.edgeLabelBinding = (source, target) =>
        edgeLabelBinding(target)
    } else {
      this.$adjacentNodesGraphBuilder.edgeLabelBinding = null
    }
  }

  /**
     Gets or sets a binding that maps group objects to their identifier.
     This maps an object that represents a group node to its identifier. This is needed when {@link SimpleTreeBuilder#nodesSource node objects} only contain an
     identifier to specify the group they belong to instead of pointing directly to the respective group object. The same
     goes for the parent group in group objects.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     <b>Warning:</b> The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleTreeBuilder#updateGraph update mechanism} cannot
     determine whether groups have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
     @see SimpleTreeBuilder#groupsSource
     @see SimpleTreeBuilder#groupBinding
     @see SimpleTreeBuilder#parentGroupBinding * @type {*}
  */
  get groupIdBinding() {
    return this.$adjacentNodesGraphBuilder.groupIdBinding
  }

  /**
   * @type {*}
   */
  set groupIdBinding(value) {
    this.$adjacentNodesGraphBuilder.groupIdBinding = value
  }

  /**
     Gets or sets a binding that maps a group object to a label.
     This maps an object that represents a group node to an object that represents the label for the group node.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleTreeBuilder#addGroupNodeCreatedListener GroupNodeCreated}
     event.
     Returning <code>null</code> from the binding will not create a label for that group node.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleTreeBuilder#groupsSource * @type {*}
  */
  get groupLabelBinding() {
    return this.$adjacentNodesGraphBuilder.groupLabelBinding
  }

  /**
   * @type {*}
   */
  set groupLabelBinding(value) {
    this.$adjacentNodesGraphBuilder.groupLabelBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their containing groups.
     This maps an object <i>G</i> that represents a group node to another object <i>P</i> that specifies the containing group of <i>G</i>. If <i>P</i> is
     contained in {@link SimpleTreeBuilder#groupsSource}, then the group node for <i>G</i> becomes a child node of the group for <i>P</i>.
     If a {@link SimpleTreeBuilder#groupIdBinding} is set, the returned object <i>P</i> must be the ID of the object that specifies the group instead of that object itself.
     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.
     @see SimpleTreeBuilder#groupsSource
     @see SimpleTreeBuilder#groupIdBinding * @type {*}
  */
  get parentGroupBinding() {
    return this.$adjacentNodesGraphBuilder.parentGroupBinding
  }

  /**
   * @type {*}
   */
  set parentGroupBinding(value) {
    this.$adjacentNodesGraphBuilder.parentGroupBinding = value
  }

  /**
     Adds the given listener for the <code>NodeCreated</code> event that occurs when a node has been created.
     This event can be used to further customize the created node.
     New nodes are created either in response to calling {@link SimpleTreeBuilder#buildGraph}, or in response to calling {@link SimpleTreeBuilder#updateGraph}
     when there are new items in {@link SimpleTreeBuilder#nodesSource}.
     @param {!SimpleNodeListener} listener The listener to add.
     @see SimpleTreeBuilder#addNodeUpdatedListener
     @see SimpleTreeBuilder#removeNodeCreatedListener */
  addNodeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.addNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>NodeCreated</code> event that occurs when a node has been created.
     This event can be used to further customize the created node.
     New nodes are created either in response to calling {@link SimpleTreeBuilder#buildGraph}, or in response to calling {@link SimpleTreeBuilder#updateGraph}
     when there are new items in {@link SimpleTreeBuilder#nodesSource}.
     @param {!SimpleNodeListener} listener The listener to remove.
     @see SimpleTreeBuilder#addNodeUpdatedListener
     @see SimpleTreeBuilder#addNodeCreatedListener */
  removeNodeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>NodeUpdated</code> event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder#addNodeCreatedListener NodeCreated}.
     Nodes are updated in response to calling {@link SimpleTreeBuilder#updateGraph} for items that haven't been added anew
     in {@link SimpleTreeBuilder#nodesSource} since the last call to {@link SimpleTreeBuilder#buildGraph} or {@link SimpleTreeBuilder#updateGraph}.
     @param {!SimpleNodeListener} listener The listener to add.
     @see SimpleTreeBuilder#addNodeCreatedListener
     @see SimpleTreeBuilder#removeNodeUpdatedListener */
  addNodeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.addNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>NodeUpdated</code> event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder#addNodeCreatedListener NodeCreated}.
     Nodes are updated in response to calling {@link SimpleTreeBuilder#updateGraph} for items that haven't been added anew
     in {@link SimpleTreeBuilder#nodesSource} since the last call to {@link SimpleTreeBuilder#buildGraph} or {@link SimpleTreeBuilder#updateGraph}.
     @param {!SimpleNodeListener} listener The listener to remove.
     @see SimpleTreeBuilder#addNodeCreatedListener
     @see SimpleTreeBuilder#addNodeUpdatedListener */
  removeNodeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeNodeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the <code>EdgeCreated</code> event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
     New edges are created either in response to calling {@link SimpleTreeBuilder#buildGraph}, or in response to calling {@link SimpleTreeBuilder#updateGraph}
     when there are new items in {@link SimpleTreeBuilder#childBinding}.
     @param {!SimpleEdgeListener} listener The listener to add.
     @see SimpleTreeBuilder#addEdgeUpdatedListener
     @see SimpleTreeBuilder#removeEdgeCreatedListener */
  addEdgeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.addEdgeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>EdgeCreated</code> event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
     New edges are created either in response to calling {@link SimpleTreeBuilder#buildGraph}, or in response to calling {@link SimpleTreeBuilder#updateGraph}
     when there are new items in {@link SimpleTreeBuilder#childBinding}.
     @param {!SimpleEdgeListener} listener The listener to remove.
     @see SimpleTreeBuilder#addEdgeUpdatedListener
     @see SimpleTreeBuilder#addEdgeCreatedListener */
  removeEdgeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeEdgeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>EdgeUpdated</code> event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder#addEdgeCreatedListener EdgeCreated}.
     Edges are updated in response to calling {@link SimpleTreeBuilder#updateGraph} for items that haven't been added anew
     in {@link SimpleTreeBuilder#childBinding} since the last call to {@link SimpleTreeBuilder#buildGraph} or {@link SimpleTreeBuilder#updateGraph}.
     @param {!SimpleEdgeListener} listener The listener to add.
     @see SimpleTreeBuilder#addEdgeCreatedListener
     @see SimpleTreeBuilder#removeEdgeUpdatedListener */
  addEdgeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.addEdgeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>EdgeUpdated</code> event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder#addEdgeCreatedListener EdgeCreated}.
     Edges are updated in response to calling {@link SimpleTreeBuilder#updateGraph} for items that haven't been added anew
     in {@link SimpleTreeBuilder#childBinding} since the last call to {@link SimpleTreeBuilder#buildGraph} or {@link SimpleTreeBuilder#updateGraph}.
     @param {!SimpleEdgeListener} listener The listener to remove.
     @see SimpleTreeBuilder#addEdgeCreatedListener
     @see SimpleTreeBuilder#addEdgeUpdatedListener */
  removeEdgeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeEdgeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the <code>GroupNodeCreated</code> event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
     New group nodes are created either in response to calling {@link SimpleTreeBuilder#buildGraph}, or in response to
     calling {@link SimpleTreeBuilder#updateGraph} when there are new items in {@link SimpleTreeBuilder#groupsSource}.
     @param {!SimpleNodeListener} listener The listener to add.
     @see SimpleTreeBuilder#addGroupNodeUpdatedListener
     @see SimpleTreeBuilder#removeGroupNodeCreatedListener */
  addGroupNodeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.addGroupNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>GroupNodeCreated</code> event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
     New group nodes are created either in response to calling {@link SimpleTreeBuilder#buildGraph}, or in response to
     calling {@link SimpleTreeBuilder#updateGraph} when there are new items in {@link SimpleTreeBuilder#groupsSource}.
     @param {!SimpleNodeListener} listener The listener to remove.
     @see SimpleTreeBuilder#addGroupNodeUpdatedListener
     @see SimpleTreeBuilder#addGroupNodeCreatedListener */
  removeGroupNodeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeGroupNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>GroupNodeUpdated</code> event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder#addGroupNodeCreatedListener GroupNodeCreated}.
     Group nodes are updated in response to calling {@link SimpleTreeBuilder#updateGraph} for items that haven't been added
     anew in {@link SimpleTreeBuilder#groupsSource} since the last call to {@link SimpleTreeBuilder#buildGraph} or {@link SimpleTreeBuilder#updateGraph}.
     @param {!SimpleNodeListener} listener The listener to add.
     @see SimpleTreeBuilder#addGroupNodeCreatedListener
     @see SimpleTreeBuilder#removeGroupNodeUpdatedListener */
  addGroupNodeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.addGroupNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>GroupNodeUpdated</code> event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder#addGroupNodeCreatedListener GroupNodeCreated}.
     Group nodes are updated in response to calling {@link SimpleTreeBuilder#updateGraph} for items that haven't been added
     anew in {@link SimpleTreeBuilder#groupsSource} since the last call to {@link SimpleTreeBuilder#buildGraph} or {@link SimpleTreeBuilder#updateGraph}.
     @param {!SimpleNodeListener} listener The listener to remove.
     @see SimpleTreeBuilder#addGroupNodeCreatedListener
     @see SimpleTreeBuilder#addGroupNodeUpdatedListener */
  removeGroupNodeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeGroupNodeUpdatedListener(listener)
  }
}

/**
 * @typedef {Object} AdjacentNodesGraphBuilderOptionArgs
 * @property {IGraph} [graph]
 * @property {*} [nodesSource]
 * @property {*} [groupsSource]
 * @property {*} [nodeIdBinding]
 * @property {*} [nodeLabelBinding]
 * @property {*} [locationXBinding]
 * @property {*} [locationYBinding]
 * @property {*} [groupBinding]
 * @property {function} [edgeLabelBinding]
 * @property {*} [groupIdBinding]
 * @property {*} [groupLabelBinding]
 * @property {*} [parentGroupBinding]
 * @property {*} [successorsBinding]
 * @property {*} [predecessorsBinding]
 */

/**
 Populates a graph from custom data where objects corresponding to nodes know their neighbors.
 This class can be used when the data specifies a collection of nodes in which each node knows its direct neighbors,
 and—optionally—a collection of groups. The properties {@link SimpleAdjacentNodesGraphBuilder#nodesSource} and {@link SimpleAdjacentNodesGraphBuilder#groupsSource} define the source collections from which nodes and groups
 will be created.

 Generally, using the {@link SimpleAdjacentNodesGraphBuilder} class consists of a few basic steps:

 <ol>
 <li>Set up the {@link SimpleAdjacentNodesGraphBuilder#graph} with the proper defaults for items ({@link IGraph#nodeDefaults}, {@link IGraph#groupNodeDefaults}, {@link IGraph#edgeDefaults})
 <li>Create an {@link SimpleAdjacentNodesGraphBuilder}.
 <li>Set the items sources. At the very least the {@link SimpleAdjacentNodesGraphBuilder#nodesSource} is needed. Note that the {@link SimpleAdjacentNodesGraphBuilder#nodesSource} does not have to contain all nodes, as nodes
 that are implicitly specified through the {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} and {@link SimpleAdjacentNodesGraphBuilder#successorsBinding} are automatically added to the graph as well. If the items in the nodes
 collection are grouped somehow, then also set the {@link SimpleAdjacentNodesGraphBuilder#groupsSource} property.
 <li>Set up the bindings so that a graph structure can actually be created from the items sources. This involves at least
 setting up either the {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder#successorsBinding} property so that edges can be created. If the node objects don't actually contain their
 neighboring node objects, but instead identifiers of other node objects, then {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} and {@link SimpleAdjacentNodesGraphBuilder#successorsBinding} would return those identifiers and {@link SimpleAdjacentNodesGraphBuilder#nodeIdBinding}
 must be set to return that identifier when given a node object.
 <li>If {@link SimpleAdjacentNodesGraphBuilder#groupsSource} is set, then you also need to set the {@link SimpleAdjacentNodesGraphBuilder#groupBinding} property to enable mapping nodes to groups. Just like with edges and their
 source and target nodes, if the node object only contains an identifier for a group node and not the actual group
 object, then return the identifier in the {@link SimpleAdjacentNodesGraphBuilder#groupBinding} and set up the {@link SimpleAdjacentNodesGraphBuilder#groupIdBinding} to map group node objects to their identifiers. If group
 nodes can nest, you also need the {@link SimpleAdjacentNodesGraphBuilder#parentGroupBinding}.
 <li>You can also easily create labels for nodes, groups, and edges by using the {@link SimpleAdjacentNodesGraphBuilder#nodeLabelBinding}, {@link SimpleAdjacentNodesGraphBuilder#groupLabelBinding}, and {@link SimpleAdjacentNodesGraphBuilder#edgeLabelBinding} properties.
 <li>Call {@link SimpleAdjacentNodesGraphBuilder#buildGraph} to populate the graph. You can apply a layout algorithm
 afterward to make the graph look nice.
 <li>If your items or collections change later, call {@link SimpleAdjacentNodesGraphBuilder#updateGraph} to make those
 changes visible in the graph.
 </ol>
 You can further customize how nodes, groups, and edges are created by adding event handlers to the various events and
 modifying the items there. This can be used to modify items in ways that are not directly supported by the available
 bindings or defaults. This includes scenarios such as the following:

 <ul>
 <li>Setting node positions or adding bends to edges. Often a layout is applied to the graph after building it, so these
 things are only rarely needed.
 <li>Modifying individual items, such as setting a different style for every nodes, depending on the bound object.
 <li>Adding more than one label for an item, as the {@link SimpleAdjacentNodesGraphBuilder#nodeLabelBinding} and {@link SimpleAdjacentNodesGraphBuilder#edgeLabelBinding} will only create a single label, or adding labels to group nodes.
 </ul>
 There are creation and update events for all three types of items, which allows separate customization when nodes,
 groups, and edges are created or updated. For completely static graphs where {@link SimpleAdjacentNodesGraphBuilder#updateGraph}
 is not needed, the update events can be safely ignored.

 Depending on how the source data is laid out, you may also consider using {@link SimpleTreeBuilder}, where the graph is
 a tree and node objects know their children, or {@link SimpleGraphBuilder} which is a more general approach to creating
 arbitrary graphs.

 <h2>Note</h2>

 This class serves as a convenient way to create general graphs and has some limitations:

 <ul>
 <li>When populating the graph for the first time it will be cleared of all existing items.
 <li>When using a {@link SimpleAdjacentNodesGraphBuilder#nodeIdBinding}, all nodes have to exist in the {@link SimpleAdjacentNodesGraphBuilder#nodesSource}. Nodes cannot be created on demand from IDs only.
 <li>Elements manually created on the graph in between calls to {@link SimpleAdjacentNodesGraphBuilder#updateGraph} may not
 be preserved.
 </ul>
 If updates get too complex it's often better to write the code interfacing with the graph by hand instead of relying on
 {@link SimpleGraphBuilder}.

 The different graph builders are discussed in the section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder Creating a Graph from Business Data}. Class
 <code>AdjacentNodesGraphBuilder</code>, in particular, is topic of section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-AdjacentNodesGraphBuilder AdjacentNodesGraphBuilder}.

 @see SimpleGraphBuilder
 @see SimpleTreeBuilder
 @see SimpleAdjacentNodesGraphBuilder */
export class SimpleAdjacentNodesGraphBuilder {
  /**
     Initializes a new instance of the {@link SimpleAdjacentNodesGraphBuilder} class that operates on the given graph.
     The <code>graph</code> will be {@link IGraph#clear cleared} and re-built from the data in {@link SimpleAdjacentNodesGraphBuilder#nodesSource} and {@link SimpleAdjacentNodesGraphBuilder#groupsSource} when {@link SimpleAdjacentNodesGraphBuilder#buildGraph}
     is called.

     @param graphOrOptions The parameters to pass.
     @param [graphOrOptions.graph=null]
     @param [graphOrOptions.nodesSource] The objects to be represented as nodes of the {@link SimpleAdjacentNodesGraphBuilder#graph}. This option sets the {@link SimpleAdjacentNodesGraphBuilder#nodesSource} property on the created object.
     @param [graphOrOptions.groupsSource] The objects to be represented as group nodes of the {@link SimpleAdjacentNodesGraphBuilder#graph}. This option sets the {@link SimpleAdjacentNodesGraphBuilder#groupsSource} property on the created object.
     @param [graphOrOptions.nodeIdBinding] A binding that maps node objects to their identifier. This option sets the {@link SimpleAdjacentNodesGraphBuilder#nodeIdBinding} property on the created object.
     @param [graphOrOptions.nodeLabelBinding] A binding that maps a node object to a label. This option sets the {@link SimpleAdjacentNodesGraphBuilder#nodeLabelBinding} property on the created object.
     @param [graphOrOptions.locationXBinding] The binding for determining a node's position on the x-axis. This option sets the {@link SimpleAdjacentNodesGraphBuilder#locationXBinding} property on the created object.
     @param [graphOrOptions.locationYBinding] The binding for determining a node's position on the y-axis. This option sets the {@link SimpleAdjacentNodesGraphBuilder#locationYBinding} property on the created object.
     @param [graphOrOptions.groupBinding] A binding that maps node objects to their containing groups. This option sets the {@link SimpleAdjacentNodesGraphBuilder#groupBinding} property on the created object.
     @param [graphOrOptions.edgeLabelBinding] A binding that maps an edge, represented by its source and target node object, to a label. This option sets the {@link SimpleAdjacentNodesGraphBuilder#edgeLabelBinding} property on the created object.
     @param [graphOrOptions.groupIdBinding] A binding that maps group objects to their identifier. This option sets the {@link SimpleAdjacentNodesGraphBuilder#groupIdBinding} property on the created object.
     @param [graphOrOptions.groupLabelBinding] A binding that maps a group object to a label. This option sets the {@link SimpleAdjacentNodesGraphBuilder#groupLabelBinding} property on the created object.
     @param [graphOrOptions.parentGroupBinding] A binding that maps group objects to their containing groups. This option sets the {@link SimpleAdjacentNodesGraphBuilder#parentGroupBinding} property on the created object.
     @param [graphOrOptions.successorsBinding] A binding that maps node objects to their successors. This option sets the {@link SimpleAdjacentNodesGraphBuilder#successorsBinding} property on the created object.
     @param [graphOrOptions.predecessorsBinding] A binding that maps node objects to their predecessors. This option sets the {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} property on the created object.
     @see SimpleAdjacentNodesGraphBuilder * @param {?(IGraph|AdjacentNodesGraphBuilderOptionArgs)} [graphOrOptions]
  */
  constructor(graphOrOptions) {
    let options = null
    let graph
    if (!graphOrOptions) {
      graph = new DefaultGraph()
    } else if (IGraph.isInstance(graphOrOptions)) {
      graph = graphOrOptions
    } else {
      options = graphOrOptions
      graph = options.graph || new DefaultGraph()
    }

    this.$graphBuilderHelper = new GraphBuilderHelper(
      this,
      graph,
      (graph, parent, location, labelData, nodeObject) =>
        this.$createNodeAndMirrorNode(graph, parent, location, labelData, nodeObject),
      (graph, node, parent, location, labelData, nodeObject) =>
        this.$updateNodeAndCreateMirrorNode(graph, node, parent, location, labelData, nodeObject),
      (graph, labelData, groupObject) => this.createGroupNode(graph, labelData, groupObject),
      (graph, groupNode, labelData, groupObject) =>
        this.updateGroupNode(graph, groupNode, labelData, groupObject),
      (graph, source, target, labelData) =>
        this.$createEdgeAndMirrorEdge(source, target, graph, labelData),
      (graph, edge, labelData) => {
        this.$updateEdgeAndCreateMirrorEdge(edge, graph, labelData)
      }
    )

    this.$nodesSource = null
    this.$groupsSource = null
    this.$predecessorsProvider = null
    this.$successorsProvider = null
    this.$predecessorsIdProvider = null
    this.$successorsIdProvider = null

    this.$graphBuilder = new AdjacencyGraphBuilder(graph)
    this.$builderNodesSource = this.$graphBuilder.createNodesSource([])
    this.$builderNodesSource.nodeCreator = this.$graphBuilderHelper.createNodeCreator()

    this.$builderEdgeCreator = this.$graphBuilderHelper.createEdgeCreator(true)

    this.$builderNodesSource.addSuccessorsSource(
      dataItem => this.$successorsProvider && this.$successorsProvider(dataItem),
      this.$builderNodesSource,
      this.$builderEdgeCreator
    )
    this.$builderNodesSource.addPredecessorsSource(
      dataItem => this.$predecessorsProvider && this.$predecessorsProvider(dataItem),
      this.$builderNodesSource,
      this.$builderEdgeCreator
    )

    this.$builderNodesSource.addSuccessorIds(
      dataItem => this.$successorsIdProvider && this.$successorsIdProvider(dataItem),
      this.$builderEdgeCreator
    )
    this.$builderNodesSource.addPredecessorIds(
      dataItem => this.$predecessorsIdProvider && this.$predecessorsIdProvider(dataItem),
      this.$builderEdgeCreator
    )

    this.$builderGroupsSource = this.$graphBuilder.createGroupNodesSource([])
    this.$builderGroupsSource.nodeCreator = this.$graphBuilderHelper.createGroupCreator()

    this.$mirrorGraph = new DefaultGraph()
    this.$nodeToMirrorNodeMap = new Map()

    if (options) {
      this.$applyOptions(options)
    }
  }

  /**
   * @param {!AdjacentNodesGraphBuilderOptionArgs} options
   */
  $applyOptions(options) {
    if (options.nodesSource) this.nodesSource = options.nodesSource
    if (options.groupsSource) this.groupsSource = options.groupsSource
    if (options.nodeIdBinding) this.nodeIdBinding = options.nodeIdBinding
    if (options.nodeLabelBinding) this.nodeLabelBinding = options.nodeLabelBinding
    if (options.groupBinding) this.groupBinding = options.groupBinding
    if (options.edgeLabelBinding) this.edgeLabelBinding = options.edgeLabelBinding
    if (options.groupIdBinding) this.groupIdBinding = options.groupIdBinding
    if (options.groupLabelBinding) this.groupLabelBinding = options.groupLabelBinding
    if (options.parentGroupBinding) this.parentGroupBinding = options.parentGroupBinding
    if (options.locationXBinding) this.locationXBinding = options.locationXBinding
    if (options.locationYBinding) this.locationYBinding = options.locationYBinding
    if (options.predecessorsBinding) this.predecessorsBinding = options.predecessorsBinding
    if (options.successorsBinding) this.successorsBinding = options.successorsBinding
  }

  /**
     Populates the graph with items generated from the bound data.
     The graph is cleared, and then new nodes, groups, and edges are created as defined by the source collections.

     @returns {!IGraph} The created graph.
     @see SimpleAdjacentNodesGraphBuilder#updateGraph
     @see SimpleAdjacentNodesGraphBuilder */
  buildGraph() {
    this.$initialize()
    this.graph.clear()
    const graph = this.$graphBuilder.buildGraph()
    this.$cleanup()
    return graph
  }

  /**
   Updates the graph after changes in the bound data.
   In contrast to
   {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, the graph is not cleared. Instead, graph elements corresponding to
   objects that are still present in the source collections are kept, new graph elements are created for new objects in the
   collections, and obsolete ones are removed.

   @see SimpleAdjacentNodesGraphBuilder */
  updateGraph() {
    this.$initialize()
    this.$graphBuilder.updateGraph()
    this.$cleanup()
  }

  $initialize() {
    if (
      this.$nodesSource == null ||
      (this.successorsBinding == null && this.predecessorsBinding == null)
    ) {
      throw new Error(
        'The nodesSource and successorsBinding or predecessorsBinding properties must be set before calling buildGraph.'
      )
    }
    this.$initializeProviders()
    this.$prepareData()
  }

  $initializeProviders() {
    this.$graphBuilderHelper.initializeProviders()

    const predecessorsProvider = GraphBuilderHelper.createBinding(this.predecessorsBinding)
    const distinctPredecessorsProvider = predecessorsProvider
      ? dataItem => this.$eliminateDuplicateEdges(dataItem, predecessorsProvider(dataItem), false)
      : null

    const successorsProvider = GraphBuilderHelper.createBinding(this.successorsBinding)
    const distinctSuccessorsProvider = successorsProvider
      ? dataItem => this.$eliminateDuplicateEdges(dataItem, successorsProvider(dataItem), true)
      : null

    if (this.nodeIdBinding) {
      this.$predecessorsProvider = null
      this.$successorsProvider = null
      this.$predecessorsIdProvider = distinctPredecessorsProvider
      this.$successorsIdProvider = distinctSuccessorsProvider
    } else {
      this.$predecessorsProvider = distinctPredecessorsProvider
      this.$successorsProvider = distinctSuccessorsProvider
      this.$predecessorsIdProvider = null
      this.$successorsIdProvider = null
    }

    this.$builderNodesSource.idProvider = GraphBuilderHelper.createIdProvider(this.nodeIdBinding)
    this.$builderGroupsSource.idProvider = GraphBuilderHelper.createIdProvider(this.groupIdBinding)

    this.$builderNodesSource.nodeCreator.tagProvider = n => n
    this.$builderEdgeCreator.tagProvider = () => null

    this.$builderNodesSource.parentIdProvider = GraphBuilderHelper.createBinding(this.groupBinding)
    this.$builderGroupsSource.parentIdProvider = GraphBuilderHelper.createBinding(
      this.parentGroupBinding
    )
  }

  $prepareData() {
    this.$graphBuilder.setData(this.$builderNodesSource, this.$nodesSource)
    this.$graphBuilder.setData(this.$builderGroupsSource, this.$groupsSource || [])
  }

  /**
   * @param {*} thisDataItem
   * @param {*} neighborCollection
   * @param {boolean} neighborIsSuccessor
   * @returns {*}
   */
  $eliminateDuplicateEdges(thisDataItem, neighborCollection, neighborIsSuccessor) {
    if (!neighborCollection) {
      return neighborCollection
    }
    const set = new Set()
    if (neighborCollection[Symbol.iterator]) {
      const distinctCollection = []
      for (const neighbor of neighborCollection) {
        if (
          !set.has(neighbor) &&
          !this.$isDuplicate(thisDataItem, this.$maybeResolveId(neighbor), neighborIsSuccessor)
        ) {
          set.add(neighbor)
          distinctCollection.push(neighbor)
        }
      }
      return distinctCollection
    } else {
      const distinctCollection = {}
      for (const [key, neighbor] of Object.entries(neighborCollection)) {
        if (
          !set.has(neighbor) &&
          !this.$isDuplicate(thisDataItem, this.$maybeResolveId(neighbor), neighborIsSuccessor)
        ) {
          set.add(neighbor)
          distinctCollection[key] = neighbor
        }
      }
      return distinctCollection
    }
  }

  /**
   * @param {*} thisDataItem
   * @param {*} neighborDataItem
   * @param {boolean} neighborIsSuccessor
   * @returns {boolean}
   */
  $isDuplicate(thisDataItem, neighborDataItem, neighborIsSuccessor) {
    let thisNode = this.getNode(thisDataItem)
    let neighborNode = this.getNode(neighborDataItem)

    if (!thisNode || !neighborNode) {
      return false
    }

    thisNode = this.$nodeToMirrorNodeMap.get(thisNode)
    neighborNode = this.$nodeToMirrorNodeMap.get(neighborNode)

    return (
      neighborIsSuccessor
        ? this.$mirrorGraph.successors(thisNode)
        : this.$mirrorGraph.predecessors(thisNode)
    ).includes(neighborNode)
  }

  /**
   * @param {*} dataItemOrId
   * @returns {*}
   */
  $maybeResolveId(dataItemOrId) {
    return this.nodeIdBinding ? this.$getDataItemById(dataItemOrId) : dataItemOrId
  }

  /**
   * @param {*} id
   * @returns {*}
   */
  $getDataItemById(id) {
    for (const dataItem of createIterable(this.$nodesSource)) {
      if (this.$builderNodesSource.idProvider(dataItem, null) === id) {
        return dataItem
      }
    }
    return null
  }

  $cleanup() {
    this.$mirrorGraph.clear()
    this.$nodeToMirrorNodeMap.clear()
  }

  /**
     Creates a new edge connecting the given nodes.
     This class calls this method to create all new edges, and customers may override it to customize edge creation.

     @param {!IGraph} graph The graph.
     @param {!INode} source The source node of the edge.
     @param {!INode} target The target node of the edge.
     @param {*} labelData The optional label data of the edge if an {@link SimpleAdjacentNodesGraphBuilder#edgeLabelBinding} is specified.
     @returns {!IEdge} The created edge.
     @see SimpleAdjacentNodesGraphBuilder */
  createEdge(graph, source, target, labelData) {
    return this.$graphBuilderHelper.createEdge(graph, source, target, labelData, null)
  }

  /**
   * @param {?INode} source
   * @param {?INode} target
   * @param {!IGraph} graph
   * @param {*} labelData
   * @returns {!IEdge}
   */
  $createEdgeAndMirrorEdge(source, target, graph, labelData) {
    const sourceMirrorNode = this.$nodeToMirrorNodeMap.get(source)
    const targetMirrorNode = this.$nodeToMirrorNodeMap.get(target)
    if (sourceMirrorNode && targetMirrorNode) {
      this.$mirrorGraph.createEdge(sourceMirrorNode, targetMirrorNode)
    }
    return this.createEdge(graph, source, target, labelData)
  }

  /**
     Creates a group node from the given <code>groupObject</code> and <code>labelData</code>.
     This method is called for every group node that is created either when {@link SimpleAdjacentNodesGraphBuilder#buildGraph building the graph}, or when new items appear in
     the {@link SimpleAdjacentNodesGraphBuilder#groupsSource} when {@link SimpleAdjacentNodesGraphBuilder#updateGraph updating it}.

     The default behavior is to create the group node, assign the <code>groupObject</code> to the group node's {@link ITagOwner#tag} property, and create a
     label from <code>labelData</code>, if present.

     Customizing how group nodes are created is usually easier by adding an event handler to the {@link SimpleAdjacentNodesGraphBuilder#addGroupNodeCreatedListener GroupNodeCreated}
     event than by overriding this method.

     @param {!IGraph} graph The graph in which to create the group node.
     @param {*} labelData The optional label data of the group node if an {@link SimpleAdjacentNodesGraphBuilder#groupLabelBinding} is specified.
     @param {*} groupObject The object from {@link SimpleAdjacentNodesGraphBuilder#groupsSource} from which to create the group node.
     @returns {!INode} The created group node.
     @see SimpleAdjacentNodesGraphBuilder */
  createGroupNode(graph, labelData, groupObject) {
    return this.$graphBuilderHelper.createGroupNode(graph, labelData, groupObject)
  }

  /**
     Creates a node with the specified parent from the given <code>nodeObject</code> and <code>labelData</code>.
     This method is called for every node that is created either when {@link SimpleAdjacentNodesGraphBuilder#buildGraph building the graph}, or when new items appear in the {@link SimpleAdjacentNodesGraphBuilder#nodesSource}
     when {@link SimpleAdjacentNodesGraphBuilder#updateGraph updating it}.

     The default behavior is to create the node with the given parent node, assign the <code>nodeObject</code> to the node's {@link ITagOwner#tag} property,
     and create a label from <code>labelData</code>, if present.

     Customizing how nodes are created is usually easier by adding an event handler to the {@link SimpleAdjacentNodesGraphBuilder#addNodeCreatedListener NodeCreated}
     event than by overriding this method.

     @param {!IGraph} graph The graph in which to create the node.
     @param {?INode} parent The node's parent node.
     @param {!Point} location The location of the node.
     @param {*} labelData The optional label data of the node if an {@link SimpleAdjacentNodesGraphBuilder#nodeLabelBinding} is specified.
     @param {*} nodeObject The object from {@link SimpleAdjacentNodesGraphBuilder#nodesSource} from which to create the node.
     @returns {!INode} The created node.
     @see SimpleAdjacentNodesGraphBuilder */
  createNode(graph, parent, location, labelData, nodeObject) {
    return this.$graphBuilderHelper.createNode(graph, parent, location, labelData, nodeObject)
  }

  /**
   * @param {!IGraph} graph
   * @param {?INode} parent
   * @param {!Point} location
   * @param {*} labelData
   * @param {*} nodeObject
   * @returns {!INode}
   */
  $createNodeAndMirrorNode(graph, parent, location, labelData, nodeObject) {
    const node = this.createNode(graph, parent, location, labelData, nodeObject)
    const mirrorNode = this.$mirrorGraph.createNode()
    this.$nodeToMirrorNodeMap.set(node, mirrorNode)
    return node
  }

  /**
     Retrieves the object from which a given item has been created.
     @param {!IModelItem} item The item to get the object for.
     @returns {*} The object from which the graph item has been created.
     @see SimpleAdjacentNodesGraphBuilder#getNode
     @see SimpleAdjacentNodesGraphBuilder#getGroup
     @see SimpleAdjacentNodesGraphBuilder */
  getBusinessObject(item) {
    return this.$graphBuilderHelper.getBusinessObject(item)
  }

  /**
     Retrieves the group node associated with an object from the {@link SimpleAdjacentNodesGraphBuilder#groupsSource}.
     @param {*} groupObject An object from the {@link SimpleAdjacentNodesGraphBuilder#groupsSource}.
     @returns {?INode} The group node associated with <code>groupObject</code>, or <code>null</code> in case there is no group node associated with that object. This can
     happen if <code>groupObject</code> is new since the last call to {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.
     @see SimpleAdjacentNodesGraphBuilder#getNode
     @see SimpleAdjacentNodesGraphBuilder#getBusinessObject
     @see SimpleAdjacentNodesGraphBuilder */
  getGroup(groupObject) {
    return this.$graphBuilderHelper.getGroup(groupObject)
  }

  /**
     Retrieves the node associated with an object from the {@link SimpleAdjacentNodesGraphBuilder#nodesSource}.
     @param {*} nodeObject An object from the {@link SimpleAdjacentNodesGraphBuilder#nodesSource}.
     @returns {?INode} The node associated with <code>nodeObject</code>, or <code>null</code> in case there is no node associated with that object. This can happen if <code>nodeObject</code>
     is new since the last call to {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.
     @see SimpleAdjacentNodesGraphBuilder#getGroup
     @see SimpleAdjacentNodesGraphBuilder#getBusinessObject
     @see SimpleAdjacentNodesGraphBuilder */
  getNode(nodeObject) {
    return this.$graphBuilderHelper.getNode(nodeObject)
  }

  /**
     Updates an existing edge connecting the given nodes when {@link SimpleGraphBuilder#updateGraph} is called and the edge
     should remain in the graph.
     This implementation updates the label of the <code>edge</code> with the given <code>labelData</code> and fires the {@link SimpleAdjacentNodesGraphBuilder#addEdgeUpdatedListener EdgeUpdated}
     event.

     @param {!IGraph} graph The graph.
     @param {!IEdge} edge The edge to update.
     @param {*} labelData The optional label data of the edge if an {@link SimpleAdjacentNodesGraphBuilder#edgeLabelBinding} is specified.
     @see SimpleAdjacentNodesGraphBuilder */
  updateEdge(graph, edge, labelData) {
    this.$graphBuilderHelper.updateEdge(graph, edge, labelData, null)
  }

  /**
   * @param {!IEdge} edge
   * @param {!IGraph} graph
   * @param {*} labelData
   */
  $updateEdgeAndCreateMirrorEdge(edge, graph, labelData) {
    const sourceMirrorNode = this.$nodeToMirrorNodeMap.get(edge.sourceNode)
    const targetMirrorNode = this.$nodeToMirrorNodeMap.get(edge.targetNode)
    if (sourceMirrorNode && targetMirrorNode) {
      this.$mirrorGraph.createEdge(sourceMirrorNode, targetMirrorNode)
    }
    this.updateEdge(graph, edge, labelData)
  }

  /**
     Updates an existing group node when the {@link SimpleAdjacentNodesGraphBuilder#updateGraph graph is updated}.
     This method is called during {@link SimpleAdjacentNodesGraphBuilder#updateGraph updating the graph} for every group node that already exists in the graph where its
     corresponding object from {@link SimpleAdjacentNodesGraphBuilder#groupsSource} is also still present.

     Customizing how group nodes are updated is usually easier by adding an event handler to the {@link SimpleAdjacentNodesGraphBuilder#addGroupNodeUpdatedListener GroupNodeUpdated}
     event than by overriding this method.

     @param {!IGraph} graph The group node's containing graph.
     @param {!INode} groupNode The group node to update.
     @param {*} labelData The optional label data of the group node if an {@link SimpleAdjacentNodesGraphBuilder#groupLabelBinding} is specified.
     @param {*} groupObject The object from {@link SimpleAdjacentNodesGraphBuilder#groupsSource} from which the group node has been created.
     @see SimpleAdjacentNodesGraphBuilder */
  updateGroupNode(graph, groupNode, labelData, groupObject) {
    this.$graphBuilderHelper.updateGroupNode(graph, groupNode, labelData, groupObject)
  }

  /**
     Updates an existing node when the {@link SimpleAdjacentNodesGraphBuilder#updateGraph graph is updated}.
     This method is called during {@link SimpleAdjacentNodesGraphBuilder#updateGraph updating the graph} for every node that already exists in the graph where its corresponding
     object from {@link SimpleAdjacentNodesGraphBuilder#nodesSource} is also still present.

     Customizing how nodes are updated is usually easier by adding an event handler to the {@link SimpleAdjacentNodesGraphBuilder#addNodeUpdatedListener NodeUpdated}
     event than by overriding this method.

     @param {!IGraph} graph The node's containing graph.
     @param {!INode} node The node to update.
     @param {?INode} parent The node's parent node.
     @param {!Point} location The location of the node.
     @param {*} labelData The optional label data of the node if an {@link SimpleAdjacentNodesGraphBuilder#nodeLabelBinding} is specified.
     @param {*} nodeObject The object from {@link SimpleAdjacentNodesGraphBuilder#nodesSource} from which the node has been created.
     @see SimpleAdjacentNodesGraphBuilder */
  updateNode(graph, node, parent, location, labelData, nodeObject) {
    this.$graphBuilderHelper.updateNode(graph, node, parent, location, labelData, nodeObject)
  }

  /**
   * @param {!IGraph} graph
   * @param {!INode} node
   * @param {?INode} parent
   * @param {!Point} location
   * @param {*} labelData
   * @param {*} nodeObject
   */
  $updateNodeAndCreateMirrorNode(graph, node, parent, location, labelData, nodeObject) {
    this.updateNode(graph, node, parent, location, labelData, nodeObject)
    const mirrorNode = this.$mirrorGraph.createNode()
    this.$nodeToMirrorNodeMap.set(node, mirrorNode)
  }

  /**
     Gets the {@link IGraph graph} used by this class.
     @see SimpleAdjacentNodesGraphBuilder * @type {!IGraph}
  */
  get graph() {
    return this.$graphBuilder.graph
  }

  /**
     Gets or sets the objects to be represented as nodes of the {@link SimpleAdjacentNodesGraphBuilder#graph}.
     Note that it is not necessary to include all nodes in this property, if they can be reached via the {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} or
     {@link SimpleAdjacentNodesGraphBuilder#successorsBinding}. In this case it suffices to include all root nodes.

     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get nodesSource() {
    return this.$nodesSource
  }

  /**
   * @type {*}
   */
  set nodesSource(value) {
    this.$nodesSource = value
  }

  /**
     Gets or sets the objects to be represented as group nodes of the {@link SimpleAdjacentNodesGraphBuilder#graph}.
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get groupsSource() {
    return this.$groupsSource
  }

  /**
   * @type {*}
   */
  set groupsSource(value) {
    this.$groupsSource = value
  }

  /**
   * @type {*}
   */
  get nodeIdBinding() {
    return this.$nodeIdBinding
  }

  /**
   * @type {*}
   */
  set nodeIdBinding(value) {
    this.$nodeIdBinding = value
  }

  /**
     Gets or sets a binding that maps a node object to a label.
     This maps an object that represents a node to an object that represents the label for the node.

     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleAdjacentNodesGraphBuilder#addNodeCreatedListener NodeCreated}
     event.

     Returning <code>null</code> from the binding will not create a label for that node.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get nodeLabelBinding() {
    return this.$graphBuilderHelper.nodeLabelBinding
  }

  /**
   * @type {*}
   */
  set nodeLabelBinding(value) {
    this.$graphBuilderHelper.nodeLabelBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the x-axis.
     This binding maps a business object that represents a node to a number that specifies the x-coordinate of that node.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get locationXBinding() {
    return this.$graphBuilderHelper.locationXBinding
  }

  /**
   * @type {*}
   */
  set locationXBinding(value) {
    this.$graphBuilderHelper.locationXBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the y-axis.
     This binding maps a business object that represents a node to a number that specifies the y-coordinate of that node.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get locationYBinding() {
    return this.$graphBuilderHelper.locationYBinding
  }

  /**
   * @type {*}
   */
  set locationYBinding(value) {
    this.$graphBuilderHelper.locationYBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their containing groups.
     This maps an object <i>N</i> that represents a node to another object <i>G</i> that specifies the containing group of <i>N</i>. If <i>G</i> is contained
     in {@link SimpleAdjacentNodesGraphBuilder#groupsSource}, then the node for <i>N</i> becomes a child node of the group for <i>G</i>.

     If a {@link SimpleAdjacentNodesGraphBuilder#groupIdBinding} is set, the returned object <i>G</i> must be the ID of the object that specifies the group instead of that object itself.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder#groupsSource
     @see SimpleAdjacentNodesGraphBuilder#groupIdBinding
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get groupBinding() {
    return this.$graphBuilderHelper.groupBinding
  }

  /**
   * @type {*}
   */
  set groupBinding(value) {
    this.$graphBuilderHelper.groupBinding = value
  }

  /**
     Gets or sets a binding that maps an edge, represented by its source and target node object, to a label.
     This maps the source and target node objects to an object that represents the label for the edge.

     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener EdgeCreated}
     event.

     Returning <code>null</code> from the binding will not create a label for that edge.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder * @type {?function}
  */
  get edgeLabelBinding() {
    return this.$graphBuilderHelper.edgeLabelBinding
  }

  /**
   * @type {?function}
   */
  set edgeLabelBinding(value) {
    this.$graphBuilderHelper.edgeLabelBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their identifier.
     This maps an object that represents a group node to its identifier. This is needed when {@link SimpleAdjacentNodesGraphBuilder#nodesSource node objects} only contain an
     identifier to specify the group they belong to instead of pointing directly to the respective group object. The same
     goes for the parent group in group objects.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     <b>Warning:</b> The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleAdjacentNodesGraphBuilder#updateGraph update mechanism} cannot
     determine whether groups have been added or updated. For the same reason this property must not be changed after having
     built the graph once.

     @see SimpleAdjacentNodesGraphBuilder#groupsSource
     @see SimpleAdjacentNodesGraphBuilder#groupBinding
     @see SimpleAdjacentNodesGraphBuilder#parentGroupBinding
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get groupIdBinding() {
    return this.$graphBuilderHelper.groupIdBinding
  }

  /**
   * @type {*}
   */
  set groupIdBinding(value) {
    this.$graphBuilderHelper.groupIdBinding = value
  }

  /**
     Gets or sets a binding that maps a group object to a label.
     This maps an object that represents a group node to an object that represents the label for the group node.

     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleAdjacentNodesGraphBuilder#addGroupNodeCreatedListener GroupNodeCreated}
     event.

     Returning <code>null</code> from the binding will not create a label for that group node.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder#groupsSource
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get groupLabelBinding() {
    return this.$graphBuilderHelper.groupLabelBinding
  }

  /**
   * @type {*}
   */
  set groupLabelBinding(value) {
    this.$graphBuilderHelper.groupLabelBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their containing groups.
     This maps an object <i>G</i> that represents a group node to another object <i>P</i> that specifies the containing group of <i>G</i>. If <i>P</i> is
     contained in {@link SimpleAdjacentNodesGraphBuilder#groupsSource}, then the group node for <i>G</i> becomes a child node of the group for <i>P</i>.

     If a {@link SimpleAdjacentNodesGraphBuilder#groupIdBinding} is set, the returned object <i>P</i> must be the ID of the object that specifies the group instead of that object itself.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder#groupsSource
     @see SimpleAdjacentNodesGraphBuilder#groupIdBinding
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get parentGroupBinding() {
    return this.$graphBuilderHelper.parentGroupBinding
  }

  /**
   * @type {*}
   */
  set parentGroupBinding(value) {
    this.$graphBuilderHelper.parentGroupBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their successors.
     This maps an object that represents a node to a set of other objects that represent its successor nodes, i.e. other
     nodes connected with an outgoing edge.

     If a {@link SimpleAdjacentNodesGraphBuilder#nodeIdBinding} is set, the returned objects must be the IDs of node objects instead of the node objects themselves.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder#predecessorsBinding
     @see SimpleAdjacentNodesGraphBuilder#nodeIdBinding
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get successorsBinding() {
    return this.$successorsBinding
  }

  /**
   * @type {*}
   */
  set successorsBinding(value) {
    this.$successorsBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their predecessors.
     This maps an object that represents a node to a set of other objects that represent its predecessor nodes, i.e. other
     nodes connected with an incoming edge.

     If a {@link SimpleAdjacentNodesGraphBuilder#nodeIdBinding} is set, the returned objects must be the IDs of node objects instead of the node objects themselves.

     The binding can either be a plain JavaScript function, a String, <code>null</code>, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's <code>this</code>
     is set to the business object, too.

     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder#successorsBinding
     @see SimpleAdjacentNodesGraphBuilder#nodeIdBinding
     @see SimpleAdjacentNodesGraphBuilder * @type {*}
  */
  get predecessorsBinding() {
    return this.$predecessorsBinding
  }

  /**
   * @type {*}
   */
  set predecessorsBinding(value) {
    this.$predecessorsBinding = value
  }

  /**
     Adds the given listener for the <code>NodeCreated</code> event that occurs when a node has been created.
     This event can be used to further customize the created node.

     New nodes are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, or in response
     to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder#nodesSource}.

     @param {!function} listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#addNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  addNodeCreatedListener(listener) {
    this.$graphBuilderHelper.addNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>NodeCreated</code> event that occurs when a node has been created.
     This event can be used to further customize the created node.

     New nodes are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, or in response
     to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder#nodesSource}.

     @param {!function} listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#addNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#addNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeNodeCreatedListener(listener) {
    this.$graphBuilderHelper.removeNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>NodeUpdated</code> event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder#addNodeCreatedListener NodeCreated}.

     Nodes are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} for items that haven't
     been added anew in {@link SimpleAdjacentNodesGraphBuilder#nodesSource} since the last call to {@link SimpleAdjacentNodesGraphBuilder#buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.

     @param {!function} listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#addNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  addNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.addNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>NodeUpdated</code> event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder#addNodeCreatedListener NodeCreated}.

     Nodes are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} for items that haven't
     been added anew in {@link SimpleAdjacentNodesGraphBuilder#nodesSource} since the last call to {@link SimpleAdjacentNodesGraphBuilder#buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.

     @param {!function} listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#addNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#addNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeNodeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the <code>EdgeCreated</code> event that occurs when an edge has been created.
     This event can be used to further customize the created edge.

     New edges are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, or in response
     to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder#successorsBinding}.

     @param {!function} listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#addEdgeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeEdgeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  addEdgeCreatedListener(listener) {
    this.$graphBuilderHelper.addEdgeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>EdgeCreated</code> event that occurs when an edge has been created.
     This event can be used to further customize the created edge.

     New edges are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, or in response
     to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder#successorsBinding}.

     @param {!function} listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#addEdgeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeEdgeCreatedListener(listener) {
    this.$graphBuilderHelper.removeEdgeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>EdgeUpdated</code> event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener EdgeCreated}.

     Edges are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} for items that haven't
     been added anew in {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder#successorsBinding} since the last call to {@link SimpleAdjacentNodesGraphBuilder#buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.

     Depending on how the source data is structured, this event can be raised during
     {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, or multiple times for the same edge during
     {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.

     @param {!function} listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeEdgeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  addEdgeUpdatedListener(listener) {
    this.$graphBuilderHelper.addEdgeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>EdgeUpdated</code> event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener EdgeCreated}.

     Edges are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} for items that haven't
     been added anew in {@link SimpleAdjacentNodesGraphBuilder#predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder#successorsBinding} since the last call to {@link SimpleAdjacentNodesGraphBuilder#buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.

     Depending on how the source data is structured, this event can be raised during
     {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, or multiple times for the same edge during
     {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.

     @param {!function} listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#addEdgeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeEdgeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeEdgeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the <code>GroupNodeCreated</code> event that occurs when a group node has been created.
     This event can be used to further customize the created group node.

     New group nodes are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, or in
     response to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder#groupsSource}.

     @param {!function} listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#addGroupNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeGroupNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  addGroupNodeCreatedListener(listener) {
    this.$graphBuilderHelper.addGroupNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the <code>GroupNodeCreated</code> event that occurs when a group node has been created.
     This event can be used to further customize the created group node.

     New group nodes are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder#buildGraph}, or in
     response to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder#groupsSource}.

     @param {!function} listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#addGroupNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#addGroupNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeGroupNodeCreatedListener(listener) {
    this.$graphBuilderHelper.removeGroupNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the <code>GroupNodeUpdated</code> event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder#addGroupNodeCreatedListener GroupNodeCreated}.

     Group nodes are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} for items that
     haven't been added anew in {@link SimpleAdjacentNodesGraphBuilder#groupsSource} since the last call to {@link SimpleAdjacentNodesGraphBuilder#buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.

     @param {!function} listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#addGroupNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeGroupNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  addGroupNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.addGroupNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the <code>GroupNodeUpdated</code> event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder#addGroupNodeCreatedListener GroupNodeCreated}.

     Group nodes are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder#updateGraph} for items that
     haven't been added anew in {@link SimpleAdjacentNodesGraphBuilder#groupsSource} since the last call to {@link SimpleAdjacentNodesGraphBuilder#buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder#updateGraph}.

     @param {!function} listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#addGroupNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#addGroupNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeGroupNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeGroupNodeUpdatedListener(listener)
  }
}

/**
 * @typedef {function} CreateNodeSignature
 */

/**
 * @typedef {function} UpdateNodeSignature
 */

/**
 * @typedef {function} CreateGroupNodeSignature
 */

/**
 * @typedef {function} UpdateGroupNodeSignature
 */

/**
 * @typedef {function} CreateEdgeSignature
 */

/**
 * @typedef {function} UpdateEdgeSignature
 */

class GraphBuilderHelper {
  /**
   * @param {!object} eventSender
   * @param {!IGraph} graph
   * @param {!CreateNodeSignature} createNode
   * @param {!UpdateNodeSignature} updateNode
   * @param {!CreateGroupNodeSignature} createGroupNode
   * @param {!UpdateGroupNodeSignature} updateGroupNode
   * @param {!CreateEdgeSignature} createEdge
   * @param {!UpdateEdgeSignature} updateEdge
   */
  constructor(
    eventSender,
    graph,
    createNode,
    updateNode,
    createGroupNode,
    updateGroupNode,
    createEdge,
    updateEdge
  ) {
    this.$eventSender = eventSender
    this.$graph = graph
    this.$builderCreateNode = createNode
    this.$builderUpdateNode = updateNode
    this.$builderCreateGroupNode = createGroupNode
    this.$builderUpdateGroupNode = updateGroupNode
    this.$builderCreateEdge = createEdge
    this.$builderUpdateEdge = updateEdge

    this.$nodeCreatedListeners = []
    this.$nodeUpdatedListeners = []
    this.$groupCreatedListeners = []
    this.$groupUpdatedListeners = []
    this.$edgeCreatedListeners = []
    this.$edgeUpdatedListeners = []

    this.nodeIdBinding = null
    this.groupIdBinding = null
    this.nodeLabelBinding = null
    this.groupLabelBinding = null
    this.edgeLabelBinding = null
    this.groupBinding = null
    this.locationXBinding = null
    this.locationYBinding = null
    this.parentGroupBinding = null
  }

  initializeProviders() {
    this.nodeLabelProvider = GraphBuilderHelper.createBinding(this.nodeLabelBinding)
    this.groupLabelProvider = GraphBuilderHelper.createBinding(this.groupLabelBinding)
    this.edgeLabelProvider = GraphBuilderHelper.createBinding(this.edgeLabelBinding)

    this.locationXProvider = GraphBuilderHelper.createBinding(this.locationXBinding)
    this.locationYProvider = GraphBuilderHelper.createBinding(this.locationYBinding)
  }

  /**
   * @param {!IGraph} graph
   * @param {?INode} source
   * @param {?INode} target
   * @param {*} labelData
   * @param {*} edgeObject
   * @returns {?IEdge}
   */
  createEdge(graph, source, target, labelData, edgeObject) {
    if (source == null || target == null) {
      // early exit if source or target node doesn't exist
      return null
    }
    const edge = graph.createEdge(source, target, graph.edgeDefaults.getStyleInstance(), edgeObject)
    if (labelData != null) {
      graph.addLabel(edge, labelData.toString(), null, null, null, labelData)
    }
    return this.$onEdgeCreated(edge, edgeObject)
  }

  /**
   * @param {!IGraph} graph
   * @param {*} labelData
   * @param {*} groupObject
   * @returns {!INode}
   */
  createGroupNode(graph, labelData, groupObject) {
    const nodeDefaults = graph.groupNodeDefaults
    const groupNode = graph.createGroupNode(
      null,
      new Rect(Point.ORIGIN, nodeDefaults.size),
      nodeDefaults.getStyleInstance(),
      groupObject
    )
    if (labelData != null) {
      this.$graph.addLabel(groupNode, labelData.toString(), null, null, null, labelData)
    }
    return this.$onGroupCreated(groupNode, groupObject)
  }

  /**
   * @param {!IGraph} graph
   * @param {?INode} parent
   * @param {!Point} location
   * @param {*} labelData
   * @param {*} nodeObject
   * @returns {!INode}
   */
  createNode(graph, parent, location, labelData, nodeObject) {
    const nodeDefaults = graph.nodeDefaults
    try {
      const node = graph.createNode(
        parent,
        new Rect(location, nodeDefaults.size),
        nodeDefaults.getStyleInstance(),
        nodeObject
      )

      if (labelData != null) {
        this.$graph.addLabel(node, labelData.toString(), null, null, null, labelData)
      }

      return this.$onNodeCreated(node, nodeObject)
    } catch (err) {
      if (err instanceof Error && err.message === 'No node created!') {
        // This usually only happens when the GraphBuilder is used on a foldingView
        throw new Error(
          'Could not create node. When folding is used, make sure to use the master graph in the GraphBuilder.'
        )
      }
      throw err
    }
  }

  /**
   * @param {!IGraph} graph
   * @param {!IEdge} edge
   * @param {*} labelData
   * @param {*} edgeObject
   */
  updateEdge(graph, edge, labelData, edgeObject) {
    if (edge.tag !== edgeObject) {
      edge.tag = edgeObject
    }
    GraphBuilderHelper.$updateLabels(graph, graph.edgeDefaults.labels, edge, labelData)
    this.$onEdgeUpdated(edge, edgeObject)
  }

  /**
   * @param {!IGraph} graph
   * @param {!INode} groupNode
   * @param {*} labelData
   * @param {*} groupObject
   */
  updateGroupNode(graph, groupNode, labelData, groupObject) {
    if (groupNode.tag !== groupObject) {
      groupNode.tag = groupObject
    }
    GraphBuilderHelper.$updateLabels(graph, graph.nodeDefaults.labels, groupNode, labelData)
    this.$onGroupUpdated(groupNode, groupObject)
  }

  /**
   * @param {!IGraph} graph
   * @param {!INode} node
   * @param {?INode} parent
   * @param {!Point} location
   * @param {*} labelData
   * @param {*} nodeObject
   */
  updateNode(graph, node, parent, location, labelData, nodeObject) {
    if (node.tag !== nodeObject) {
      node.tag = nodeObject
    }
    GraphBuilderHelper.$updateLabels(graph, graph.nodeDefaults.labels, node, labelData)
    if (graph.getParent(node) !== parent) {
      graph.setParent(node, parent)
    }
    if (!node.layout.topLeft.equals(location)) {
      graph.setNodeLayout(node, new Rect(location, node.layout.toSize()))
    }
    this.$onNodeUpdated(node, nodeObject)
  }

  /**
   * @param {!IGraph} graph
   * @param {!ILabelDefaults} labelDefaults
   * @param {!ILabelOwner} item
   * @param {*} labelData
   */
  static $updateLabels(graph, labelDefaults, item, labelData) {
    const labels = item.labels
    if (typeof labelData === 'undefined' || labelData === null) {
      while (labels.size > 0) {
        graph.remove(labels.get(labels.size - 1))
      }
    } else if (labels.size === 0) {
      graph.addLabel(
        item,
        labelData.toString(),
        labelDefaults.getLayoutParameterInstance(item),
        labelDefaults.getStyleInstance(item),
        null,
        labelData
      )
    } else if (labels.size > 0) {
      const label = labels.get(0)
      if (label.text !== labelData.toString()) {
        graph.setLabelText(label, labelData.toString())
      }
      if (label.tag !== labelData) {
        label.tag = labelData
      }
    }
  }

  /**
   * @param {!IModelItem} item
   * @returns {*}
   */
  getBusinessObject(item) {
    return item.tag
  }

  /**
   * @param {*} businessObject
   * @returns {?IEdge}
   */
  getEdge(businessObject) {
    return this.$graph.edges.find(e => e.tag === businessObject)
  }

  /**
   * @param {*} groupObject
   * @returns {?INode}
   */
  getGroup(groupObject) {
    return this.$graph.nodes.find(n => n.tag === groupObject)
  }

  /**
   * @param {*} nodeObject
   * @returns {?INode}
   */
  getNode(nodeObject) {
    return this.$graph.nodes.find(n => n.tag === nodeObject)
  }

  /**
   * @param {*} binding
   * @returns {?function}
   */
  static createIdProvider(binding) {
    if (binding === null || binding === undefined) {
      return null
    } else if (typeof binding === 'string') {
      return dataItem => dataItem[binding]
    } else {
      return binding
    }
  }

  /**
   * @param {*} binding
   * @returns {?function}
   */
  static createBinding(binding) {
    if (binding === undefined || binding === null) {
      return null
    } else if (typeof binding === 'string') {
      return dataItem => dataItem[binding]
    } else {
      return binding
    }
  }

  /**
   * @returns {!NodeCreator}
   */
  createNodeCreator() {
    class SimpleGraphBuilderNodeCreator extends NodeCreator {
      /**
       * @param {!GraphBuilderHelper} graphBuilder
       */
      constructor(graphBuilder) {
        super()
        this.$graphBuilder = graphBuilder
      }

      /**
       * @param {!IGraph} graph
       * @param {?INode} parent
       * @param {*} dataItem
       * @returns {!INode}
       */
      createNode(graph, parent, dataItem) {
        const location = this.$getLocation(dataItem, Point.ORIGIN)
        const labelData = this.$getLabelData(dataItem)
        const nodeObject = this.$getNodeObject(dataItem)
        return this.$graphBuilder.$builderCreateNode(graph, parent, location, labelData, nodeObject)
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} node
       * @param {?INode} parent
       * @param {*} dataItem
       */
      updateNode(graph, node, parent, dataItem) {
        const location = this.$getLocation(dataItem, node.layout.topLeft)
        const labelData = this.$getLabelData(dataItem)
        const nodeObject = this.$getNodeObject(dataItem)
        this.$graphBuilder.$builderUpdateNode(graph, node, parent, location, labelData, nodeObject)
      }

      /**
       * @param {*} dataItem
       * @returns {*}
       */
      $getNodeObject(dataItem) {
        if (this.tagProvider) {
          return this.tagProvider(dataItem)
        }
        return dataItem
      }

      /**
       * @param {*} dataItem
       * @returns {*}
       */
      $getLabelData(dataItem) {
        return this.$graphBuilder.nodeLabelProvider
          ? this.$graphBuilder.nodeLabelProvider(dataItem)
          : null
      }

      /**
       * @param {*} dataItem
       * @param {!Point} fallback
       * @returns {!Point}
       */
      $getLocation(dataItem, fallback) {
        return new Point(
          this.$graphBuilder.locationXProvider
            ? this.$graphBuilder.locationXProvider(dataItem)
            : fallback.x,
          this.$graphBuilder.locationYProvider
            ? this.$graphBuilder.locationYProvider(dataItem)
            : fallback.y
        )
      }
    }

    return new SimpleGraphBuilderNodeCreator(this)
  }

  /**
   * @returns {!NodeCreator}
   */
  createGroupCreator() {
    class SimpleGraphBuilderGroupCreator extends NodeCreator {
      /**
       * @param {!GraphBuilderHelper} graphBuilder
       */
      constructor(graphBuilder) {
        super()
        this.$graphBuilder = graphBuilder
      }

      /**
       * @param {!IGraph} graph
       * @param {?INode} parent
       * @param {*} dataItem
       * @returns {!INode}
       */
      createNode(graph, parent, dataItem) {
        const labelData = this.$getLabelData(dataItem)
        const nodeObject = this.$getNodeObject(dataItem)
        const node = this.$graphBuilder.$builderCreateGroupNode(graph, labelData, nodeObject)
        graph.setParent(node, parent)
        return node
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} node
       * @param {?INode} parent
       * @param {*} dataItem
       */
      updateNode(graph, node, parent, dataItem) {
        const labelData = this.$getLabelData(dataItem)
        const nodeObject = this.$getNodeObject(dataItem)
        this.$graphBuilder.$builderUpdateGroupNode(graph, node, labelData, nodeObject)
        if (graph.getParent(node) !== parent) {
          graph.setParent(node, parent)
        }
      }

      /**
       * @param {*} dataItem
       * @returns {*}
       */
      $getNodeObject(dataItem) {
        if (this.tagProvider) {
          return this.tagProvider(dataItem)
        }
        return dataItem
      }

      /**
       * @param {*} dataItem
       * @returns {*}
       */
      $getLabelData(dataItem) {
        return this.$graphBuilder.groupLabelProvider
          ? this.$graphBuilder.groupLabelProvider(dataItem)
          : null
      }
    }

    return new SimpleGraphBuilderGroupCreator(this)
  }

  /**
   * @param {boolean} [labelDataFromSourceAndTarget=false]
   * @returns {!EdgeCreator}
   */
  createEdgeCreator(labelDataFromSourceAndTarget = false) {
    class SimpleGraphBuilderEdgeCreator extends EdgeCreator {
      /**
       * @param {!GraphBuilderHelper} graphBuilder
       * @param {boolean} labelDataFromSourceAndTarget
       */
      constructor(graphBuilder, labelDataFromSourceAndTarget) {
        super()
        this.$graphBuilder = graphBuilder
        this.$labelDataFromSourceAndTarget = labelDataFromSourceAndTarget
      }

      /**
       * @param {!IGraph} graph
       * @param {!INode} source
       * @param {!INode} target
       * @param {*} dataItem
       * @returns {!IEdge}
       */
      createEdge(graph, source, target, dataItem) {
        const labelData = this.$getLabelData(dataItem, source, target)
        const edgeObject = this.$getEdgeObject(dataItem)
        const edge = this.$graphBuilder.$builderCreateEdge(
          graph,
          source,
          target,
          labelData,
          edgeObject
        )
        if (edge == null) {
          throw new Error('An edge must be created by createEdge.')
        }
        return edge
      }

      /**
       * @param {!IGraph} graph
       * @param {!IEdge} edge
       * @param {*} dataItem
       */
      updateEdge(graph, edge, dataItem) {
        const labelData = this.$getLabelData(dataItem, edge.sourceNode, edge.targetNode)
        const edgeObject = this.$getEdgeObject(dataItem)
        this.$graphBuilder.$builderUpdateEdge(graph, edge, labelData, edgeObject)
      }

      /**
       * @param {*} dataItem
       * @returns {*}
       */
      $getEdgeObject(dataItem) {
        if (this.tagProvider) {
          return this.tagProvider(dataItem)
        }
        return dataItem
      }

      /**
       * @param {*} dataItem
       * @param {!INode} source
       * @param {!INode} target
       * @returns {*}
       */
      $getLabelData(dataItem, source, target) {
        if (this.$labelDataFromSourceAndTarget) {
          return this.$graphBuilder.edgeLabelProvider
            ? this.$graphBuilder.edgeLabelProvider(source.tag, target.tag)
            : null
        } else {
          return this.$graphBuilder.edgeLabelProvider
            ? this.$graphBuilder.edgeLabelProvider(dataItem)
            : null
        }
      }
    }

    return new SimpleGraphBuilderEdgeCreator(this, labelDataFromSourceAndTarget)
  }

  /**
   * @template T
   * @param {!Array.<T>} listeners
   * @param {!T} listener
   */
  static $addEventListener(listeners, listener) {
    listeners.push(listener)
  }

  /**
   * @template T
   * @param {!Array.<T>} listeners
   * @param {!T} listener
   */
  static $removeEventListener(listeners, listener) {
    const index = listeners.indexOf(listener)
    if (index >= 0) {
      listeners.splice(index, 1)
    }
  }

  /**
   * @template TEvent
   * @param {!Array.<function>} listeners
   * @param {!TEvent} evt
   */
  $fireEvent(listeners, evt) {
    listeners.forEach(l => l(this.$eventSender, evt))
  }

  /**
   * @param {!INode} node
   * @param {*} dataItem
   * @returns {!INode}
   */
  $onNodeCreated(node, dataItem) {
    if (this.$nodeCreatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, node, dataItem)
      this.$fireEvent(this.$nodeCreatedListeners, evt)
      return evt.item
    }
    return node
  }

  /**
   * @param {!INode} node
   * @param {*} dataItem
   * @returns {!INode}
   */
  $onNodeUpdated(node, dataItem) {
    if (this.$nodeUpdatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, node, dataItem)
      this.$fireEvent(this.$nodeUpdatedListeners, evt)
      return evt.item
    }
    return node
  }

  /**
   * @param {!INode} group
   * @param {*} dataItem
   * @returns {!INode}
   */
  $onGroupCreated(group, dataItem) {
    if (this.$groupCreatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, group, dataItem)
      this.$fireEvent(this.$groupCreatedListeners, evt)
      return evt.item
    }
    return group
  }

  /**
   * @param {!INode} group
   * @param {*} dataItem
   * @returns {!INode}
   */
  $onGroupUpdated(group, dataItem) {
    if (this.$groupUpdatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, group, dataItem)
      this.$fireEvent(this.$groupUpdatedListeners, evt)
      return evt.item
    }
    return group
  }

  /**
   * @param {!IEdge} edge
   * @param {*} dataItem
   * @returns {!IEdge}
   */
  $onEdgeCreated(edge, dataItem) {
    if (this.$edgeCreatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, edge, dataItem)
      this.$fireEvent(this.$edgeCreatedListeners, evt)
      return evt.item
    }
    return edge
  }

  /**
   * @param {!IEdge} edge
   * @param {*} dataItem
   * @returns {!IEdge}
   */
  $onEdgeUpdated(edge, dataItem) {
    if (this.$edgeUpdatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, edge, dataItem)
      this.$fireEvent(this.$edgeUpdatedListeners, evt)
      return evt.item
    }
    return edge
  }

  /**
   * @param {!SimpleNodeListener} listener
   */
  addNodeCreatedListener(listener) {
    GraphBuilderHelper.$addEventListener(this.$nodeCreatedListeners, listener)
  }

  /**
   * @param {!SimpleNodeListener} listener
   */
  removeNodeCreatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$nodeCreatedListeners, listener)
  }

  /**
   * @param {!SimpleNodeListener} listener
   */
  addNodeUpdatedListener(listener) {
    GraphBuilderHelper.$addEventListener(this.$nodeUpdatedListeners, listener)
  }

  /**
   * @param {!SimpleNodeListener} listener
   */
  removeNodeUpdatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$nodeUpdatedListeners, listener)
  }

  /**
   * @param {!SimpleEdgeListener} listener
   */
  addEdgeCreatedListener(listener) {
    GraphBuilderHelper.$addEventListener(this.$edgeCreatedListeners, listener)
  }

  /**
   * @param {!SimpleEdgeListener} listener
   */
  removeEdgeCreatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$edgeCreatedListeners, listener)
  }

  /**
   * @param {!SimpleEdgeListener} listener
   */
  addEdgeUpdatedListener(listener) {
    GraphBuilderHelper.$addEventListener(this.$edgeUpdatedListeners, listener)
  }

  /**
   * @param {!SimpleEdgeListener} listener
   */
  removeEdgeUpdatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$edgeUpdatedListeners, listener)
  }

  /**
   * @param {!SimpleNodeListener} listener
   */
  addGroupNodeCreatedListener(listener) {
    GraphBuilderHelper.$addEventListener(this.$groupCreatedListeners, listener)
  }

  /**
   * @param {!SimpleNodeListener} listener
   */
  removeGroupNodeCreatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$groupCreatedListeners, listener)
  }

  /**
   * @param {!SimpleNodeListener} listener
   */
  addGroupNodeUpdatedListener(listener) {
    GraphBuilderHelper.$addEventListener(this.$groupUpdatedListeners, listener)
  }

  /**
   * @param {!SimpleNodeListener} listener
   */
  removeGroupNodeUpdatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$groupUpdatedListeners, listener)
  }
}

/**
 * @template TIn
 * @template T
 * @template TR
 * @param {?function} [f1]
 * @param {?function} [f2]
 * @returns {?function}
 */
function compose(f1, f2) {
  if (f2 && f1) {
    return a => f1(f2(a))
  }
  return null
}

Class.fixType(SimpleGraphBuilder, 'SimpleGraphBuilder')
Class.fixType(SimpleGraphBuilderItemEventArgs, 'SimpleGraphBuilderItemEventArgs')
