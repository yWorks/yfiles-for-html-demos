/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/* eslint-disable jsdoc/check-alignment,jsdoc/multiline-blocks */
import {
  AdjacencyGraphBuilder,
  EdgeCreator,
  Graph,
  GraphBuilder,
  IGraph,
  ITagOwner,
  ItemEventArgs,
  NodeCreator,
  Point,
  Rect
} from '@yfiles/yfiles'

/**
 Populates a graph from custom data.
 This class can be used when the data specifies a collection of nodes, a collection of edges, and optionally a collection
 of groups. The properties {@link SimpleGraphBuilder.nodesSource}, {@link SimpleGraphBuilder.groupsSource}, and {@link SimpleGraphBuilder.edgesSource} define the source collections from which nodes, groups, and edges will be created.
 Generally, using the {@link SimpleGraphBuilder} class consists of a few basic steps:

 1. Set up the {@link SimpleGraphBuilder.graph} with the proper defaults for items ({@link IGraph.nodeDefaults}, {@link IGraph.groupNodeDefaults}, {@link IGraph.edgeDefaults})
 2. Create a {@link SimpleGraphBuilder}.
 3. Set the items sources. At the very least the {@link SimpleGraphBuilder.nodesSource} (unless using {@link SimpleGraphBuilder.lazyNodeDefinition}) and {@link SimpleGraphBuilder.edgesSource} are needed. If the items in the nodes collection are
 grouped somehow, then also set the {@link SimpleGraphBuilder.groupsSource} property.
 4. Set up the bindings so that a graph structure can actually be created from the items sources. This involves at least
 setting up the {@link SimpleGraphBuilder.sourceNodeBinding} and {@link SimpleGraphBuilder.targetNodeBinding} properties so that edges can be created. If the edge objects don't actually contain the node
 objects as source and target, but instead an identifier of the node objects, then {@link SimpleGraphBuilder.sourceNodeBinding} and {@link SimpleGraphBuilder.targetNodeBinding} would return those identifiers
 and {@link SimpleGraphBuilder.nodeIdBinding} must be set to return that identifier when given a node object.
 5. If {@link SimpleGraphBuilder.groupsSource} is set, then you also need to set the {@link SimpleGraphBuilder.groupBinding} property to enable mapping nodes to groups. Just like with edges and their
 source and target nodes, if the node object only contains an identifier for a group node and not the actual group
 object, then return the identifier in the {@link SimpleGraphBuilder.groupBinding} and set up the {@link SimpleGraphBuilder.groupIdBinding} to map group node objects to their identifiers. If group
 nodes can nest, you also need the {@link SimpleGraphBuilder.parentGroupBinding}.
 6. You can also easily create labels for nodes, groups, and edges by using the {@link SimpleGraphBuilder.nodeLabelBinding}, {@link SimpleGraphBuilder.groupLabelBinding}, and {@link SimpleGraphBuilder.edgeLabelBinding} properties.
 7. Call {@link SimpleGraphBuilder.buildGraph} to populate the graph. You can apply a layout algorithm afterward to make the graph look nice.
 8. If your items or collections change later, call {@link SimpleGraphBuilder.updateGraph} to make those changes visible in the graph.


 You can further customize how nodes, groups, and edges are created by adding event handlers to the various events and
 modifying the items there. This can be used to modify items in ways that are not directly supported by the available
 bindings or defaults. This includes scenarios such as the following:

 - Setting node positions or adding bends to edges. Often a layout is applied to the graph after building it, so these
 things are only rarely needed.
 - Modifying individual items, such as setting a different style for every nodes, depending on the bound object.
 - Adding more than one label for an item, as the {@link SimpleGraphBuilder.nodeLabelBinding} and {@link SimpleGraphBuilder.edgeLabelBinding} will only create a single label, or adding labels to group nodes.

 There are creation and update events for all three types of items, which allows separate customization when nodes,
 groups, and edges are created or updated. For completely static graphs where {@link SimpleGraphBuilder.updateGraph} is
 not needed, the update events can be safely ignored.
 Depending on how the source data is laid out, you may also consider using {@link SimpleAdjacentNodesGraphBuilder},
 where node objects know their neighbors, or {@link SimpleTreeBuilder} where the graph is a tree and node objects know
 their children. Both of those other graph builders make edges implicit through the relationships between nodes and thus
 have no {@link SimpleGraphBuilder.edgesSource}.

 ## Note

 This class serves as a convenient way to create general graphs and has some limitations:

 - When populating the graph for the first time it will be cleared of all existing items.
 - Elements manually created on the graph in between calls to {@link SimpleGraphBuilder.updateGraph} may not be preserved.
 - Edge objects in {@link SimpleGraphBuilder.edgesSource} cannot change their source or target node.
 {@link SimpleGraphBuilder.sourceNodeBinding} and {@link SimpleGraphBuilder.targetNodeBinding} are only used during edge creation.

 If updates get too complex it's often better to write the code interfacing with the graph by hand instead of relying on
 {@link SimpleGraphBuilder}.
 The different graph builders are discussed in the section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder Creating a Graph from Business Data}. Class {@link GraphBuilder}, in
 particular, is topic of section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-GraphBuilder GraphBuilder}.
 @see {@link SimpleAdjacentNodesGraphBuilder}
 @see {@link SimpleTreeBuilder}
 */
export class SimpleGraphBuilder {
  $graphBuilder
  $builderNodesSource
  $builderGroupsSource
  $builderEdgesSource

  $graphBuilderHelper

  $sourceIdProvider
  $targetIdProvider

  /**
     Initializes a new instance of the {@link SimpleGraphBuilder} class that operates on the given graph.
     The `graph` will be {@link IGraph.clear cleared} and re-built from the data in {@link SimpleGraphBuilder.nodesSource}, {@link SimpleGraphBuilder.groupsSource}, and {@link SimpleGraphBuilder.edgesSource} when {@link SimpleGraphBuilder.buildGraph} is called.
     @param graphOrOptions The parameters to pass.
     @param [graphOrOptions.graph] The graph
     @param [graphOrOptions.lazyNodeDefinition] A value indicating whether or not to automatically create nodes for values returned from {@link SimpleGraphBuilder.sourceNodeBinding} and {@link SimpleGraphBuilder.targetNodeBinding} that don't exist in {@link SimpleGraphBuilder.nodesSource}. This option sets the {@link SimpleGraphBuilder.lazyNodeDefinition} property on the created object.
     @param [graphOrOptions.nodesSource] The objects to be represented as nodes of the {@link SimpleGraphBuilder.graph}. This option sets the {@link SimpleGraphBuilder.nodesSource} property on the created object.
     @param [graphOrOptions.edgesSource] The objects to be represented as edges of the {@link SimpleGraphBuilder.graph}. This option sets the {@link SimpleGraphBuilder.edgesSource} property on the created object.
     @param [graphOrOptions.groupsSource] The objects to be represented as group nodes of the {@link SimpleGraphBuilder.graph}. This option sets the {@link SimpleGraphBuilder.groupsSource} property on the created object.
     @param [graphOrOptions.nodeIdBinding] A binding that maps node objects to their identifier. This option sets the {@link SimpleGraphBuilder.nodeIdBinding} property on the created object.
     @param [graphOrOptions.edgeIdBinding] A binding that maps edge objects to their identifier. This option sets the {@link SimpleGraphBuilder.edgeIdBinding} property on the created object.
     @param [graphOrOptions.nodeLabelBinding] A binding that maps a node object to a label. This option sets the {@link SimpleGraphBuilder.nodeLabelBinding} property on the created object.
     @param [graphOrOptions.groupBinding] A binding that maps node objects to their containing groups. This option sets the {@link SimpleGraphBuilder.groupBinding} property on the created object.
     @param [graphOrOptions.edgeLabelBinding] A binding that maps an edge object to a label. This option sets the {@link SimpleGraphBuilder.edgeLabelBinding} property on the created object.
     @param [graphOrOptions.sourceNodeBinding] A binding that maps edge objects to their source node. This option sets the {@link SimpleGraphBuilder.sourceNodeBinding} property on the created object.
     @param [graphOrOptions.targetNodeBinding] A binding that maps edge objects to their target node. This option sets the {@link SimpleGraphBuilder.targetNodeBinding} property on the created object.
     @param [graphOrOptions.groupIdBinding] A binding that maps group objects to their identifier. This option sets the {@link SimpleGraphBuilder.groupIdBinding} property on the created object.
     @param [graphOrOptions.groupLabelBinding] A binding that maps a group object to a label. This option sets the {@link SimpleGraphBuilder.groupLabelBinding} property on the created object.
     @param [graphOrOptions.parentGroupBinding] A binding that maps group objects to their containing groups. This option sets the {@link SimpleGraphBuilder.parentGroupBinding} property on the created object.
     @param [graphOrOptions.locationXBinding] The binding for determining a node's position on the x-axis. This option sets the {@link SimpleGraphBuilder.locationXBinding} property on the created object.
     @param [graphOrOptions.locationYBinding] The binding for determining a node's position on the y-axis. This option sets the {@link SimpleGraphBuilder.locationYBinding} property on the created object.
     */
  constructor(graphOrOptions) {
    let options = null
    let graph
    if (!graphOrOptions) {
      graph = new Graph()
    } else if (graphOrOptions instanceof IGraph) {
      graph = graphOrOptions
    } else {
      options = graphOrOptions
      graph = options.graph || new Graph()
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
    this.$builderNodesSource = this.$graphBuilder.createNodesSource([], '')
    this.$builderNodesSource.nodeCreator = this.$graphBuilderHelper.createNodeCreator()

    this.$builderGroupsSource = this.$graphBuilder.createGroupNodesSource([], '')
    this.$builderGroupsSource.nodeCreator = this.$graphBuilderHelper.createGroupCreator()

    this.$builderEdgesSource = this.$graphBuilder.createEdgesSource(
      [],
      (dataItem) => this.$sourceIdProvider && this.$sourceIdProvider(dataItem),
      (dataItem) => this.$targetIdProvider && this.$targetIdProvider(dataItem)
    )
    this.$builderEdgesSource.edgeCreator = this.$graphBuilderHelper.createEdgeCreator()

    if (options) {
      this.$applyOptions(options)
    }
  }

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
     @returns The created graph.
     @see {@link SimpleGraphBuilder.updateGraph} */
  buildGraph() {
    this.graph.clear()
    this.$initialize()
    return this.$graphBuilder.buildGraph()
  }

  /**
     Updates the graph after changes in the bound data.
     In contrast to
     {@link SimpleGraphBuilder.buildGraph}, the graph is not cleared. Instead, graph elements corresponding to objects that
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

    this.$builderEdgesSource.edgeCreator.tagProvider = (e) => e

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

      this.$sourceIdProvider = (e) => e.source
      this.$targetIdProvider = (e) => e.target

      const tagProvider = (e) => e.dataItem

      const edgesSource = this.$builderEdgesSource
      const helper = this.$graphBuilderHelper

      if (edgesSource.idProvider) {
        edgesSource.idProvider = compose((e) => edgesSource.idProvider(e, null), tagProvider)
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
     Creates an edge from the given `edgeObject` and `labelData`.
     This method is called for every edge that is created either when {@link SimpleGraphBuilder.buildGraph building the graph}, or when new items appear in the {@link SimpleGraphBuilder.edgesSource}
     when {@link SimpleGraphBuilder.updateGraph updating it}.
     The default behavior is to create the edge, assign the `edgeObject` to the edge's {@link ITagOwner.tag} property, and create a label from
     `labelData`, if present.
     Customizing how edges are created is usually easier by adding an event handler to the {@link SimpleGraphBuilder.setEdgeCreatedListener EdgeCreated}
     event than by overriding this method.
     @param graph The graph in which to create the edge.
     @param source The source node for the edge.
     @param target The target node for the edge.
     @param labelData The optional label data of the edge if an {@link SimpleGraphBuilder.edgeLabelBinding} is specified.
     @param edgeObject The object from {@link SimpleGraphBuilder.edgesSource} from which to create the edge.
     @returns The created edge.
     */
  createEdge(graph, source, target, labelData, edgeObject) {
    return this.$graphBuilderHelper.createEdge(graph, source, target, labelData, edgeObject)
  }

  /**
     Creates a group node from the given `groupObject` and `labelData`.
     This method is called for every group node that is created either when {@link SimpleGraphBuilder.buildGraph building the graph}, or when new items appear in
     the {@link SimpleGraphBuilder.groupsSource} when {@link SimpleGraphBuilder.updateGraph updating it}.
     The default behavior is to create the group node, assign the `groupObject` to the group node's {@link ITagOwner.tag} property, and create a
     label from `labelData`, if present.
     Customizing how group nodes are created is usually easier by adding an event handler to the {@link SimpleGraphBuilder.setGroupNodeCreatedListener GroupNodeCreated}
     event than by overriding this method.
     @param graph The graph in which to create the group node.
     @param labelData The optional label data of the group node if an {@link SimpleGraphBuilder.groupLabelBinding} is specified.
     @param groupObject The object from {@link SimpleGraphBuilder.groupsSource} from which to create the group node.
     @returns The created group node.
     */
  createGroupNode(graph, labelData, groupObject) {
    return this.$graphBuilderHelper.createGroupNode(graph, labelData, groupObject)
  }

  /**
     Creates a node with the specified parent from the given `nodeObject` and `labelData`.
     This method is called for every node that is created either when {@link SimpleGraphBuilder.buildGraph building the graph}, or when new items appear in the {@link SimpleGraphBuilder.nodesSource}
     when {@link SimpleGraphBuilder.updateGraph updating it}.
     The default behavior is to create the node with the given parent node, assign the `nodeObject` to the node's {@link ITagOwner.tag} property,
     and create a label from `labelData`, if present.
     Customizing how nodes are created is usually easier by adding an event handler to the {@link SimpleGraphBuilder.setNodeCreatedListener NodeCreated}
     event than by overriding this method.
     @param graph The graph in which to create the node.
     @param parent The node's parent node.
     @param location The location of the node.
     @param labelData The optional label data of the node if an {@link SimpleGraphBuilder.nodeLabelBinding} is specified.
     @param nodeObject The object from {@link SimpleGraphBuilder.nodesSource} from which to create the node.
     @returns The created node.
     */
  createNode(graph, parent, location, labelData, nodeObject) {
    return this.$graphBuilderHelper.createNode(graph, parent, location, labelData, nodeObject)
  }

  /**
     Retrieves the object from which a given item has been created.
     @param item The item to get the object for.
     @returns The object from which the graph item has been created.
     @see SimpleGraphBuilder#getNode
     @see SimpleGraphBuilder#getEdge
     @see SimpleGraphBuilder#getGroup
     */
  getBusinessObject(item) {
    return this.$graphBuilderHelper.getBusinessObject(item)
  }

  /**
     Retrieves the edge associated with an object from the {@link SimpleGraphBuilder.edgesSource}.
     @param businessObject An object from the {@link SimpleGraphBuilder.edgesSource}.
     @returns The edge associated with `businessObject`, or `null` in case there is no edge associated with that object. This can happen
      if `businessObject` is new since the last call to {@link SimpleGraphBuilder.updateGraph}.
     @see SimpleGraphBuilder#getNode
     @see SimpleGraphBuilder#getGroup
     @see SimpleGraphBuilder#getBusinessObject
     */
  getEdge(businessObject) {
    return this.$graphBuilderHelper.getEdge(businessObject)
  }

  /**
     Retrieves the group node associated with an object from the {@link SimpleGraphBuilder.groupsSource}.
     @param groupObject An object from the {@link SimpleGraphBuilder.groupsSource}.
     @returns The group node associated with `groupObject`, or `null` in case there is no group node associated with that object. This can
      happen if `groupObject` is new since the last call to {@link SimpleGraphBuilder.updateGraph}.
     @see SimpleGraphBuilder#getNode
     @see SimpleGraphBuilder#getEdge
     @see SimpleGraphBuilder#getBusinessObject
     */
  getGroup(groupObject) {
    return this.$graphBuilderHelper.getGroup(groupObject)
  }

  /**
     Retrieves the node associated with an object from the {@link SimpleGraphBuilder.nodesSource}.
     @param nodeObject An object from the {@link SimpleGraphBuilder.nodesSource}.
     @returns The node associated with `nodeObject`, or `null` in case there is no node associated with that object. This can happen if `nodeObject`
      is new since the last call to {@link SimpleGraphBuilder.updateGraph}.
     @see SimpleGraphBuilder#getEdge
     @see SimpleGraphBuilder#getGroup
     @see SimpleGraphBuilder#getBusinessObject */
  getNode(nodeObject) {
    return this.$graphBuilderHelper.getNode(nodeObject)
  }

  /**
     Updates an existing edge when the {@link SimpleGraphBuilder.updateGraph graph is updated}.
     This method is called during {@link SimpleGraphBuilder.updateGraph updating the graph} for every edge that already exists in the graph where its corresponding
     object from {@link SimpleGraphBuilder.edgesSource} is also still present.
     Customizing how edges are updated is usually easier by adding an event handler to the {@link SimpleGraphBuilder.setEdgeUpdatedListener EdgeUpdated}
     event than by overriding this method.
     @param graph The edge's containing graph.
     @param edge The edge to update.
     @param labelData The optional label data of the edge if an {@link SimpleGraphBuilder.edgeLabelBinding} is specified.
     @param edgeObject The object from {@link SimpleGraphBuilder.edgesSource} from which the edge has been created.
     */
  updateEdge(graph, edge, labelData, edgeObject) {
    this.$graphBuilderHelper.updateEdge(graph, edge, labelData, edgeObject)
  }

  /**
     Updates an existing group node when the {@link SimpleGraphBuilder.updateGraph graph is updated}.
     This method is called during {@link SimpleGraphBuilder.updateGraph updating the graph} for every group node that already exists in the graph where its
     corresponding object from {@link SimpleGraphBuilder.groupsSource} is also still present.
     Customizing how group nodes are updated is usually easier by adding an event handler to the {@link SimpleGraphBuilder.setGroupNodeUpdatedListener GroupNodeUpdated}
     event than by overriding this method.
     @param graph The group node's containing graph.
     @param groupNode The group node to update.
     @param labelData The optional label data of the group node if an {@link SimpleGraphBuilder.groupLabelBinding} is specified.
     @param groupObject The object from {@link SimpleGraphBuilder.groupsSource} from which the group node has been created.
     */
  updateGroupNode(graph, groupNode, labelData, groupObject) {
    this.$graphBuilderHelper.updateGroupNode(graph, groupNode, labelData, groupObject)
  }

  /**
     Updates an existing node when the {@link SimpleGraphBuilder.updateGraph graph is updated}.
     This method is called during {@link SimpleGraphBuilder.updateGraph updating the graph} for every node that already exists in the graph where its corresponding
     object from {@link SimpleGraphBuilder.nodesSource} is also still present.
     Customizing how nodes are updated is usually easier by adding an event handler to the {@link SimpleGraphBuilder.setNodeUpdatedListener NodeUpdated}
     event than by overriding this method.
     @param graph The node's containing graph.
     @param node The node to update.
     @param parent The node's parent node.
     @param location The location of the node.
     @param labelData The optional label data of the node if an {@link SimpleGraphBuilder.nodeLabelBinding} is specified.
     @param nodeObject The object from {@link SimpleGraphBuilder.nodesSource} from which the node has been created.
     */
  updateNode(graph, node, parent, location, labelData, nodeObject) {
    this.$graphBuilderHelper.updateNode(graph, node, parent, location, labelData, nodeObject)
  }

  /**
   * Gets the {@link IGraph graph} used by this class.
   */
  get graph() {
    return this.$graphBuilder.graph
  }

  $lazyNodeDefinition

  /**
     Gets or sets a value indicating whether or not to automatically create nodes for values returned from {@link SimpleGraphBuilder.sourceNodeBinding} and {@link SimpleGraphBuilder.targetNodeBinding} that don't
     exist in {@link SimpleGraphBuilder.nodesSource}.
     When this property is set to `false`, nodes in the graph are __only__ created from {@link SimpleGraphBuilder.nodesSource}, and edge objects that result in source or
     target nodes not in {@link SimpleGraphBuilder.nodesSource} will have no edge created.
     If this property is set to `true`, edges will always be created, and if {@link SimpleGraphBuilder.sourceNodeBinding} or {@link SimpleGraphBuilder.targetNodeBinding} return values not in
     {@link SimpleGraphBuilder.nodesSource}, additional nodes are created as needed.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#edgesSource */
  get lazyNodeDefinition() {
    return this.$lazyNodeDefinition
  }

  set lazyNodeDefinition(value) {
    this.$lazyNodeDefinition = value
  }

  $nodesSource

  /**
   * Gets or sets the objects to be represented as nodes of the {@link SimpleGraphBuilder.graph}.
   */
  get nodesSource() {
    return this.$nodesSource
  }

  set nodesSource(value) {
    this.$nodesSource = value
  }

  $edgesSource

  /**
   * Gets or sets the objects to be represented as edges of the {@link SimpleGraphBuilder.graph}.
   */
  get edgesSource() {
    return this.$edgesSource
  }

  set edgesSource(value) {
    this.$edgesSource = value
  }

  $groupsSource

  /**
   * Gets or sets the objects to be represented as group nodes of the {@link SimpleGraphBuilder.graph}.
   */
  get groupsSource() {
    return this.$groupsSource
  }

  set groupsSource(value) {
    this.$groupsSource = value
  }

  /**
     Gets or sets a binding that maps node objects to their identifier.
  
     This maps an business object that represents a node to its identifier. This is needed when {@link SimpleGraphBuilder.edgesSource edge objects} only contain an
     identifier to specify their source and target nodes instead of pointing directly to the respective node object.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     __Warning:__ The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleGraphBuilder.updateGraph update mechanism} cannot
     determine whether nodes have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#sourceNodeBinding
     @see SimpleGraphBuilder#targetNodeBinding */
  get nodeIdBinding() {
    return this.$graphBuilderHelper.nodeIdBinding
  }

  set nodeIdBinding(value) {
    this.$graphBuilderHelper.nodeIdBinding = value
  }

  $edgeIdBinding

  /**
     Gets or sets a binding that maps edge objects to their identifier.
     This maps an business object that represents a edge to its identifier. This can be used to improve the performance of
     the {@link SimpleGraphBuilder} because internal maps can use a primitive id as key to store the business object instead
     of the JavaScript object itself.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     __Warning:__ The identifiers returned by the binding must be stable and not change over time.
     */
  get edgeIdBinding() {
    return this.$edgeIdBinding
  }

  set edgeIdBinding(value) {
    this.$edgeIdBinding = value
  }

  /**
     Gets or sets a binding that maps a node object to a label.
  
     This maps a business object that represents a node to an object that represents the label for the node.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleGraphBuilder.setNodeCreatedListener NodeCreated}
     event.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     Returning `null` from the binding will not create a label for that node.
     @see SimpleGraphBuilder#nodesSource
     */
  get nodeLabelBinding() {
    return this.$graphBuilderHelper.nodeLabelBinding
  }

  set nodeLabelBinding(value) {
    this.$graphBuilderHelper.nodeLabelBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their containing groups.
  
     This maps an object _N_ that represents a node to another object _G_ that specifies the containing group of _N_. If _G_ is contained
     in {@link SimpleGraphBuilder.groupsSource}, then the node for _N_ becomes a child node of the group for _G_.
     If a {@link SimpleGraphBuilder.groupIdBinding} is set, the returned object _G_ must be the ID of the object that specifies the group instead of that object itself.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#groupsSource
     @see SimpleGraphBuilder#groupIdBinding
     */
  get groupBinding() {
    return this.$graphBuilderHelper.groupBinding
  }

  set groupBinding(value) {
    this.$graphBuilderHelper.groupBinding = value
  }

  /**
     Gets or sets a binding that maps an edge object to a label.
     This maps an object that represents an edge to an object that represents the label for the edge.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleGraphBuilder.setEdgeCreatedListener EdgeCreated}
     event.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     Returning `null` from the binding will not create a label for that edge.
     @see SimpleGraphBuilder#edgesSource
     */
  get edgeLabelBinding() {
    return this.$graphBuilderHelper.edgeLabelBinding
  }

  set edgeLabelBinding(value) {
    this.$graphBuilderHelper.edgeLabelBinding = value
  }

  $sourceNodeBinding

  /**
     Gets or sets a binding that maps edge objects to their source node.
     This maps an object _E_ that represents an edge to another object _N_ that specifies the source node of _E_.
     If a {@link SimpleGraphBuilder.nodeIdBinding} is set, the returned object _N_ must be the ID of the object that specifies the node instead of that object itself.
     If {@link SimpleGraphBuilder.lazyNodeDefinition} is `true`, the resulting node object does not have to exist in {@link SimpleGraphBuilder.nodesSource}; instead, nodes are created as needed.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#targetNodeBinding
     @see SimpleGraphBuilder#nodeIdBinding
     @see SimpleGraphBuilder#lazyNodeDefinition
     */
  get sourceNodeBinding() {
    return this.$sourceNodeBinding
  }

  set sourceNodeBinding(value) {
    this.$sourceNodeBinding = value
  }

  $targetNodeBinding

  /**
     Gets or sets a binding that maps edge objects to their target node.
     This maps an object _E_ that represents an edge to another object _N_ that specifies the target node of _E_.
     If a {@link SimpleGraphBuilder.nodeIdBinding} is set, the returned object _N_ must be the ID of the object that specifies the node instead of that object itself.
     If {@link SimpleGraphBuilder.lazyNodeDefinition} is `true`, the resulting node object does not have to exist in {@link SimpleGraphBuilder.nodesSource}; instead, nodes are created as needed.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource
     @see SimpleGraphBuilder#sourceNodeBinding
     @see SimpleGraphBuilder#nodeIdBinding
     @see SimpleGraphBuilder#lazyNodeDefinition
     */
  get targetNodeBinding() {
    return this.$targetNodeBinding
  }

  set targetNodeBinding(value) {
    this.$targetNodeBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their identifier.
     This maps an object that represents a group node to its identifier. This is needed when {@link SimpleGraphBuilder.nodesSource node objects} only contain an
     identifier to specify the group they belong to instead of pointing directly to the respective group object. The same
     goes for the parent group in group objects.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. Functions will be called with both `this` and the first and only argument as the value to convert.
  
     __Warning:__ The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleGraphBuilder.updateGraph update mechanism} cannot
     determine whether groups have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
     @see SimpleGraphBuilder#groupsSource
     @see SimpleGraphBuilder#groupBinding
     @see SimpleGraphBuilder#parentGroupBinding
     */
  get groupIdBinding() {
    return this.$graphBuilderHelper.groupIdBinding
  }

  set groupIdBinding(value) {
    this.$graphBuilderHelper.groupIdBinding = value
  }

  /**
     Gets or sets a binding that maps a group object to a label.
     This maps an object that represents a group node to an object that represents the label for the group node.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleGraphBuilder.setGroupNodeCreatedListener GroupNodeCreated}
     event.
     Returning `null` from the binding will not create a label for that group node.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. Functions will be called with both `this` and the first and only argument as the value to convert.
     @see SimpleGraphBuilder#groupsSource
     */
  get groupLabelBinding() {
    return this.$graphBuilderHelper.groupLabelBinding
  }

  set groupLabelBinding(value) {
    this.$graphBuilderHelper.groupLabelBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their containing groups.
     This maps an object _G_ that represents a group node to another object _P_ that specifies the containing group of _G_. If _P_ is
     contained in {@link SimpleGraphBuilder.groupsSource}, then the group node for _G_ becomes a child node of the group for _P_.
     If a {@link SimpleGraphBuilder.groupIdBinding} is set, the returned object _P_ must be the ID of the object that specifies the group instead of that object itself.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleGraphBuilder#groupsSource
     @see SimpleGraphBuilder#groupIdBinding
     */
  get parentGroupBinding() {
    return this.$graphBuilderHelper.parentGroupBinding
  }

  set parentGroupBinding(value) {
    this.$graphBuilderHelper.parentGroupBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the x-axis.
     This binding maps a business object that represents a node to a number that specifies the x-coordinate of that node.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource
     */
  get locationXBinding() {
    return this.$graphBuilderHelper.locationXBinding
  }

  set locationXBinding(value) {
    this.$graphBuilderHelper.locationXBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the y-axis.
     This binding maps a business object that represents a node to a number that specifies the y-coordinate of that node.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleGraphBuilder#nodesSource
     */
  get locationYBinding() {
    return this.$graphBuilderHelper.locationYBinding
  }

  set locationYBinding(value) {
    this.$graphBuilderHelper.locationYBinding = value
  }

  /**
     Adds the given listener for the `NodeCreated` event that occurs when a node has been created.
     This event can be used to further customize the created node.
     New nodes are created either in response to calling {@link SimpleGraphBuilder.buildGraph}, or in response to calling {@link SimpleGraphBuilder.updateGraph}
     when there are new items in {@link SimpleGraphBuilder.nodesSource}.
     @param listener The listener to add.
     @see SimpleGraphBuilder#setNodeUpdatedListener
     @see SimpleGraphBuilder#removeNodeCreatedListener
     */
  setNodeCreatedListener(listener) {
    this.$graphBuilderHelper.setNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `NodeCreated` event that occurs when a node has been created.
     This event can be used to further customize the created node.
     New nodes are created either in response to calling {@link SimpleGraphBuilder.buildGraph}, or in response to calling {@link SimpleGraphBuilder.updateGraph}
     when there are new items in {@link SimpleGraphBuilder.nodesSource}.
     @param listener The listener to remove.
     @see SimpleGraphBuilder#setNodeUpdatedListener
     @see SimpleGraphBuilder#setNodeCreatedListener
     */
  removeNodeCreatedListener(listener) {
    this.$graphBuilderHelper.removeNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `NodeUpdated` event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder.setNodeCreatedListener NodeCreated}.
     Nodes are updated in response to calling {@link SimpleGraphBuilder.updateGraph} for items that haven't been added anew
     in {@link SimpleGraphBuilder.nodesSource} since the last call to {@link SimpleGraphBuilder.buildGraph} or {@link SimpleGraphBuilder.updateGraph}.
     @param listener The listener to add.
     @see SimpleGraphBuilder#setNodeCreatedListener
     @see SimpleGraphBuilder#removeNodeUpdatedListener
     */
  setNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.setNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `NodeUpdated` event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder.setNodeCreatedListener NodeCreated}.
     Nodes are updated in response to calling {@link SimpleGraphBuilder.updateGraph} for items that haven't been added anew
     in {@link SimpleGraphBuilder.nodesSource} since the last call to {@link SimpleGraphBuilder.buildGraph} or {@link SimpleGraphBuilder.updateGraph}.
     @param listener The listener to remove.
     @see SimpleGraphBuilder#setNodeCreatedListener
     @see SimpleGraphBuilder#setNodeUpdatedListener
     */
  removeNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeNodeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the `EdgeCreated` event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
     New edges are created either in response to calling {@link SimpleGraphBuilder.buildGraph}, or in response to calling {@link SimpleGraphBuilder.updateGraph}
     when there are new items in {@link SimpleGraphBuilder.edgesSource}.
     @param listener The listener to add.
     @see SimpleGraphBuilder#addEdgeUpdatedListener
     @see SimpleGraphBuilder#removeEdgeCreatedListener
     */
  addEdgeCreatedListener(listener) {
    this.$graphBuilderHelper.setEdgeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `EdgeCreated` event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
     New edges are created either in response to calling {@link SimpleGraphBuilder.buildGraph}, or in response to calling {@link SimpleGraphBuilder.updateGraph}
     when there are new items in {@link SimpleGraphBuilder.edgesSource}.
     @param listener The listener to remove.
     @see SimpleGraphBuilder#addEdgeUpdatedListener
     @see SimpleGraphBuilder#addEdgeCreatedListener
     */
  removeEdgeCreatedListener(listener) {
    this.$graphBuilderHelper.removeEdgeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `EdgeUpdated` event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder.setEdgeCreatedListener EdgeCreated}.
     Edges are updated in response to calling {@link SimpleGraphBuilder.updateGraph} for items that haven't been added anew
     in {@link SimpleGraphBuilder.edgesSource} since the last call to {@link SimpleGraphBuilder.buildGraph} or {@link SimpleGraphBuilder.updateGraph}.
     @param listener The listener to add.
     @see SimpleGraphBuilder#addEdgeCreatedListener
     @see SimpleGraphBuilder#removeEdgeUpdatedListener
     */
  addEdgeUpdatedListener(listener) {
    this.$graphBuilderHelper.setEdgeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `EdgeUpdated` event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder.setEdgeCreatedListener EdgeCreated}.
     Edges are updated in response to calling {@link SimpleGraphBuilder.updateGraph} for items that haven't been added anew
     in {@link SimpleGraphBuilder.edgesSource} since the last call to {@link SimpleGraphBuilder.buildGraph} or {@link SimpleGraphBuilder.updateGraph}.
     @param listener The listener to remove.
     @see SimpleGraphBuilder#addEdgeCreatedListener
     @see SimpleGraphBuilder#addEdgeUpdatedListener
     */
  removeEdgeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeEdgeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the `GroupNodeCreated` event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
     New group nodes are created either in response to calling {@link SimpleGraphBuilder.buildGraph}, or in response to
     calling {@link SimpleGraphBuilder.updateGraph} when there are new items in {@link SimpleGraphBuilder.groupsSource}.
     @param listener The listener to add.
     @see SimpleGraphBuilder#setGroupNodeUpdatedListener
     @see SimpleGraphBuilder#removeGroupNodeCreatedListener
     */
  setGroupNodeCreatedListener(listener) {
    this.$graphBuilderHelper.setGroupNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `GroupNodeCreated` event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
     New group nodes are created either in response to calling {@link SimpleGraphBuilder.buildGraph}, or in response to
     calling {@link SimpleGraphBuilder.updateGraph} when there are new items in {@link SimpleGraphBuilder.groupsSource}.
     @param listener The listener to remove.
     @see SimpleGraphBuilder#setGroupNodeUpdatedListener
     @see SimpleGraphBuilder#setGroupNodeCreatedListener
     */
  removeGroupNodeCreatedListener(listener) {
    this.$graphBuilderHelper.removeGroupNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `GroupNodeUpdated` event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder.setGroupNodeCreatedListener GroupNodeCreated}.
     Group nodes are updated in response to calling {@link SimpleGraphBuilder.updateGraph} for items that haven't been added
     anew in {@link SimpleGraphBuilder.groupsSource} since the last call to {@link SimpleGraphBuilder.buildGraph} or {@link SimpleGraphBuilder.updateGraph}.
     @param listener The listener to add.
     @see SimpleGraphBuilder#setGroupNodeCreatedListener
     @see SimpleGraphBuilder#removeGroupNodeUpdatedListener
     */
  setGroupNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.setGroupNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `GroupNodeUpdated` event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleGraphBuilder.setGroupNodeCreatedListener GroupNodeCreated}.
     Group nodes are updated in response to calling {@link SimpleGraphBuilder.updateGraph} for items that haven't been added
     anew in {@link SimpleGraphBuilder.groupsSource} since the last call to {@link SimpleGraphBuilder.buildGraph} or {@link SimpleGraphBuilder.updateGraph}.
     @param listener The listener to remove.
     @see SimpleGraphBuilder#setGroupNodeCreatedListener
     @see SimpleGraphBuilder#setGroupNodeUpdatedListener
     */
  removeGroupNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeGroupNodeUpdatedListener(listener)
  }
}

export class SimpleGraphBuilderItemEventArgs extends ItemEventArgs {
  /**
     Creates a new instance of the {@link SimpleGraphBuilderItemEventArgs} class with the given graph, item, and source object.
     @param graph The graph that can be used to modify `item`.
     @param item The item created from `itemData`.
     @param sourceObject The object `item` was created from.
     */
  constructor(graph, item, sourceObject) {
    super(item)
    this.graph = graph
    this.sourceObject = sourceObject
  }

  /**
     Gets the graph that can be used to modify the {@link ItemEventArgs.item}.
     */
  graph
  /**
     Gets the object the {@link ItemEventArgs.item} has been created from.
     */
  sourceObject
}

function createIterable(collection) {
  if (collection[Symbol.iterator]) {
    return collection
  } else {
    return Object.values(collection)
  }
}

function createNodeCollectionCloner(originalCollection) {
  if (originalCollection[Symbol.iterator]) {
    return new IterableNodeCollectionCloner(originalCollection)
  } else {
    return new ObjectNodeCollectionCloner(originalCollection)
  }
}

class IterableNodeCollectionCloner {
  $array
  $valueSet

  get collection() {
    return this.$array
  }

  constructor(originalCollection) {
    this.$array = []
    this.$valueSet = new Set()

    for (const itemData of originalCollection) {
      this.add(itemData)
    }
  }

  add(itemData) {
    this.$array.push(itemData)
    this.$valueSet.add(itemData)
    return itemData
  }

  has(itemData) {
    return this.$valueSet.has(itemData)
  }
}

class ObjectNodeCollectionCloner {
  $object
  $valueSet
  $currentIndex

  get collection() {
    return this.$object
  }

  constructor(originalCollection) {
    this.$currentIndex = 0
    this.$object = {}
    this.$valueSet = new Set()
    Object.keys(originalCollection).forEach((key) => {
      this.$object[key] = originalCollection[key]
      this.$valueSet.add(key)

      const numberIndex = parseInt(key)
      if (!Number.isNaN(numberIndex)) {
        this.$currentIndex = Math.max(this.$currentIndex, numberIndex)
      }
    })
  }

  add(itemData) {
    const key = this.$newKey()
    this.$object[key] = itemData
    this.$valueSet.add(key)
    return key
  }

  has(id) {
    return this.$valueSet.has(id)
  }

  $newKey() {
    return (++this.$currentIndex).toString(10)
  }
}

function createEdgeCollectionCloner(originalCollection) {
  if (originalCollection[Symbol.iterator]) {
    return new IterableEdgeCollectionCloner(originalCollection)
  } else {
    return new ObjectEdgeCollectionCloner(originalCollection)
  }
}

class IterableEdgeCollectionCloner {
  $array
  $originalCollection

  constructor(originalCollection) {
    this.$originalCollection = originalCollection
    this.$array = []
  }

  get collection() {
    return this.$array
  }

  *generator() {
    for (const edgeDataItem of this.$originalCollection) {
      this.$array.push(yield edgeDataItem)
    }
  }
}

class ObjectEdgeCollectionCloner {
  $originalCollection
  $object

  get collection() {
    return this.$object
  }

  constructor(originalCollection) {
    this.$originalCollection = originalCollection
    this.$object = {}
  }

  *generator() {
    for (const [id, edgeDataItem] of Object.entries(this.$originalCollection)) {
      this.$object[id] = yield edgeDataItem
    }
  }
}

/**
 Populates a graph from custom data where objects corresponding to nodes have a parent-child relationship.
 This class can be used when the data specifies a collection of nodes, each of which knows its child nodes,
 and optionally a collection of groups. The properties {@link SimpleTreeBuilder.nodesSource} and {@link SimpleTreeBuilder.groupsSource} define the source collections from which nodes and groups
 will be created.
 Generally, using the {@link SimpleTreeBuilder} class consists of a few basic steps:

 1. Set up the {@link SimpleTreeBuilder.graph} with the proper defaults for items ({@link IGraph.nodeDefaults}, {@link IGraph.groupNodeDefaults}, {@link IGraph.edgeDefaults})
 2. Create a {@link SimpleTreeBuilder}.
 3. Set the items sources. At the very least the {@link SimpleTreeBuilder.nodesSource} is needed. Note that the {@link SimpleTreeBuilder.nodesSource} does not have to contain all nodes, as nodes
 that are implicitly specified through the {@link SimpleTreeBuilder.childBinding} are automatically added to the graph as well. If the items in the nodes
 collection are grouped somehow, then also set the {@link SimpleTreeBuilder.groupsSource} property.
 4. Set up the bindings so that a graph structure can actually be created from the items sources. This involves setting up
 the {@link SimpleTreeBuilder.childBinding} property so that edges can be created. If the node objects don't actually contain their children objects, but
 instead identifiers of other node objects, then {@link SimpleTreeBuilder.childBinding} would return those identifiers and {@link SimpleTreeBuilder.idBinding} must be set to return that
 identifier when given a node object.
 5. If {@link SimpleTreeBuilder.groupsSource} is set, then you also need to set the {@link SimpleTreeBuilder.groupBinding} property to enable mapping nodes to groups. Just like with a node's children,
 if the node object only contains an identifier for a group node and not the actual group object, then return the
 identifier in the {@link SimpleTreeBuilder.groupBinding} and set up the {@link SimpleTreeBuilder.groupIdBinding} to map group node objects to their identifiers. If group nodes can nest, you also
 need the {@link SimpleTreeBuilder.parentGroupBinding}.
 6. You can also easily create labels for nodes, groups, and edges by using the {@link SimpleTreeBuilder.nodeLabelBinding}, {@link SimpleTreeBuilder.groupLabelBinding}, and {@link SimpleTreeBuilder.edgeLabelBinding} properties.
 7. Call {@link SimpleTreeBuilder.buildGraph} to populate the graph. You can apply a layout algorithm afterward to make the graph look nice.
 8. If your items or collections change later, call {@link SimpleTreeBuilder.updateGraph} to make those changes visible in the graph.


 You can further customize how nodes, groups, and edges are created by adding event handlers to the various events and
 modifying the items there. This can be used to modify items in ways that are not directly supported by the available
 bindings or defaults. This includes scenarios such as the following:

 - Setting node positions or adding bends to edges. Often a layout is applied to the graph after building it, so these
 things are only rarely needed.
 - Modifying individual items, such as setting a different style for every nodes, depending on the bound object.
 - Adding more than one label for an item, as the {@link SimpleTreeBuilder.nodeLabelBinding} and
 {@link SimpleTreeBuilder.edgeLabelBinding} will only create a single label, or adding labels to group nodes.

 There are creation and update events for all three types of items, which allows separate customization when nodes,
 groups, and edges are created or updated. For completely static graphs where {@link SimpleTreeBuilder.updateGraph} is
 not needed, the update events can be safely ignored.
 Depending on how the source data is laid out, you may also consider using {@link SimpleAdjacentNodesGraphBuilder},
 where node objects know their neighbors, or {@link SimpleGraphBuilder} which is a more general approach to creating
 arbitrary graphs.

 ## Note

 This class serves as a convenient way to create trees or forests and has some limitations:

 - When populating the graph for the first time it will be cleared of all existing items.
 - When using a {@link SimpleTreeBuilder.idBinding}, all nodes have to exist in the {@link SimpleTreeBuilder.nodesSource}. Nodes cannot be created on demand from IDs only.
 - Elements manually created on the graph in between calls to {@link SimpleTreeBuilder.updateGraph} may not be preserved.

 If updates get too complex it's often better to write the code interfacing with the graph by hand instead of relying on
 {@link SimpleTreeBuilder}.
 The different graph builders are discussed in the section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder Creating a Graph from Business Data}. Class {@link TreeBuilder}, in
 particular, is topic of section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-TreeBuilder TreeBuilder}.
 @see {@link SimpleGraphBuilder}
 @see {@link SimpleAdjacentNodesGraphBuilder}
 */
export class SimpleTreeBuilder {
  $adjacentNodesGraphBuilder

  $edgeLabelBinding

  /**
     Initializes a new instance of the {@link SimpleTreeBuilder} class that operates on the given graph.
     The `graph` will be {@link IGraph.clear cleared} and re-built from the data in {@link SimpleTreeBuilder.nodesSource} and {@link SimpleTreeBuilder.groupsSource} when {@link SimpleTreeBuilder.buildGraph} is called.
     @param graphOrOptions The parameters to pass.
     @param [graphOrOptions.graph] The graph.
     @param [graphOrOptions.nodesSource] The objects to be represented as nodes of the {@link SimpleTreeBuilder.graph}. This option sets the {@link SimpleTreeBuilder.nodesSource} property on the created object.
     @param [graphOrOptions.groupsSource] The objects to be represented as group nodes of the {@link SimpleTreeBuilder.graph}. This option sets the {@link SimpleTreeBuilder.groupsSource} property on the created object.
     @param [graphOrOptions.idBinding] A binding that maps node objects to their identifier. This option sets the {@link SimpleTreeBuilder.idBinding} property on the created object.
     @param [graphOrOptions.nodeLabelBinding] A binding that maps a node object to a label. This option sets the {@link SimpleTreeBuilder.nodeLabelBinding} property on the created object.
     @param [graphOrOptions.locationXBinding] The binding for determining a node's position on the x-axis. This option sets the {@link SimpleTreeBuilder.locationXBinding} property on the created object.
     @param [graphOrOptions.locationYBinding] The binding for determining a node's position on the y-axis. This option sets the {@link SimpleTreeBuilder.locationYBinding} property on the created object.
     @param [graphOrOptions.childBinding] A binding that maps node objects to their child nodes. This option sets the {@link SimpleTreeBuilder.childBinding} property on the created object.
     @param [graphOrOptions.groupBinding] A binding that maps node objects to their containing groups. This option sets the {@link SimpleTreeBuilder.groupBinding} property on the created object.
     @param [graphOrOptions.edgeLabelBinding] A binding that maps a node object representing the edge's target node to a label. This option sets the {@link SimpleTreeBuilder.edgeLabelBinding} property on the created object.
     @param [graphOrOptions.groupIdBinding] A binding that maps group objects to their identifier. This option sets the {@link SimpleTreeBuilder.groupIdBinding} property on the created object.
     @param [graphOrOptions.groupLabelBinding] A binding that maps a group object to a label. This option sets the {@link SimpleTreeBuilder.groupLabelBinding} property on the created object.
     @param [graphOrOptions.parentGroupBinding] A binding that maps group objects to their containing groups. This option sets the {@link SimpleTreeBuilder.parentGroupBinding} property on the created object. */
  constructor(graphOrOptions) {
    let options = null
    let graph
    if (!graphOrOptions) {
      graph = new Graph()
    } else if (graphOrOptions instanceof IGraph) {
      graph = graphOrOptions
    } else {
      options = graphOrOptions
      graph = options.graph || new Graph()
    }

    this.$edgeLabelBinding = null
    this.$adjacentNodesGraphBuilder = this.$createAdjacentNodesGraphBuilderWrapper(graph)

    if (options) {
      this.$applyOptions(options)
    }
  }

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

  $createAdjacentNodesGraphBuilderWrapper(graph) {
    class AdjacentNodesGraphBuilderWrapper extends SimpleAdjacentNodesGraphBuilder {
      $treeBuilder

      constructor(graphOrOptions, treeBuilder) {
        super(graphOrOptions)
        this.$treeBuilder = treeBuilder
      }

      createEdge(graph, source, target, labelData) {
        return this.$treeBuilder.createEdge(graph, source, target, labelData)
      }

      createGroupNode(graph, labelData, groupObject) {
        return this.$treeBuilder.createGroupNode(graph, labelData, groupObject)
      }

      createNode(graph, parent, location, labelData, nodeObject) {
        return this.$treeBuilder.createNode(graph, parent, location, labelData, nodeObject)
      }

      updateEdge(graph, edge, labelData) {
        this.$treeBuilder.updateEdge(graph, edge, labelData)
      }

      updateGroupNode(graph, groupNode, labelData, groupObject) {
        this.$treeBuilder.updateGroupNode(graph, groupNode, labelData, groupObject)
      }

      updateNode(graph, node, parent, location, labelData, nodeObject) {
        this.$treeBuilder.updateNode(graph, node, parent, location, labelData, nodeObject)
      }

      createEdgeBase(graph, source, target, labelData) {
        return super.createEdge(graph, source, target, labelData)
      }

      createGroupNodeBase(graph, labelData, groupObject) {
        return super.createGroupNode(graph, labelData, groupObject)
      }

      createNodeBase(graph, parent, location, labelData, nodeObject) {
        return super.createNode(graph, parent, location, labelData, nodeObject)
      }

      updateEdgeBase(graph, edge, labelData) {
        super.updateEdge(graph, edge, labelData)
      }

      updateGroupNodeBase(graph, groupNode, labelData, groupObject) {
        super.updateGroupNode(graph, groupNode, labelData, groupObject)
      }

      updateNodeBase(graph, node, parent, location, labelData, nodeObject) {
        super.updateNode(graph, node, parent, location, labelData, nodeObject)
      }
    }

    return new AdjacentNodesGraphBuilderWrapper(graph, this)
  }

  /**
     Populates the graph with items generated from the bound data.
     The graph is cleared, and then new nodes, groups, and edges are created as defined by the source collections.
     @returns The created graph.
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
     {@link SimpleTreeBuilder.buildGraph}, the graph is not cleared. Instead, graph elements corresponding to objects that
     are still present in the source collections are kept, new graph elements are created for new objects in the collections,
     and obsolete ones are removed.
     */
  updateGraph() {
    this.$adjacentNodesGraphBuilder.updateGraph()
  }

  /**
     Creates an edge from the given `source`, `target`, and `labelData`.
     This method is called for every edge that is created either when {@link SimpleTreeBuilder.buildGraph building the graph}, or when new items appear in the {@link SimpleTreeBuilder.childBinding}
     when {@link SimpleTreeBuilder.updateGraph updating it}.
     The default behavior is to create the edge and create a label from `labelData`, if present.
     Customizing how edges are created is usually easier by adding an event handler to the {@link SimpleTreeBuilder.setEdgeCreatedListener EdgeCreated}
     event than by overriding this method.
     @param graph The graph in which to create the edge.
     @param source The source node for the edge.
     @param target The target node for the edge.
     @param labelData The optional label data of the edge if an {@link SimpleTreeBuilder.edgeLabelBinding} is specified.
     @returns The created edge. */
  createEdge(graph, source, target, labelData) {
    return this.$adjacentNodesGraphBuilder.createEdgeBase(graph, source, target, labelData)
  }

  /**
     Creates a group node from the given `groupObject` and `labelData`.
     This method is called for every group node that is created either when {@link SimpleTreeBuilder.buildGraph building the graph}, or when new items appear in
     the {@link SimpleTreeBuilder.groupsSource} when {@link SimpleTreeBuilder.updateGraph updating it}.
     The default behavior is to create the group node, assign the `groupObject` to the group node's {@link ITagOwner.tag} property, and create a
     label from `labelData`, if present.
     Customizing how group nodes are created is usually easier by adding an event handler to the {@link SimpleTreeBuilder.setGroupNodeCreatedListener GroupNodeCreated}
     event than by overriding this method.
     @param graph The graph in which to create the group node.
     @param labelData The optional label data of the group node if an {@link SimpleTreeBuilder.groupLabelBinding} is specified.
     @param groupObject The object from {@link SimpleTreeBuilder.groupsSource} from which to create the group node.
     @returns The created group node. */
  createGroupNode(graph, labelData, groupObject) {
    return this.$adjacentNodesGraphBuilder.createGroupNodeBase(graph, labelData, groupObject)
  }

  /**
     Creates a node with the specified parent from the given `nodeObject` and `labelData`.
     This method is called for every node that is created either when {@link SimpleTreeBuilder.buildGraph building the graph}, or when new items appear in the {@link SimpleTreeBuilder.nodesSource}
     when {@link SimpleTreeBuilder.updateGraph updating it}.
     The default behavior is to create the node with the given parent node, assign the `nodeObject` to the node's {@link ITagOwner.tag} property,
     and create a label from `labelData`, if present.
     Customizing how nodes are created is usually easier by adding an event handler to the {@link SimpleTreeBuilder.setNodeCreatedListener NodeCreated}
     event than by overriding this method.
     @param graph The graph in which to create the node.
     @param parent The node's parent node.
     @param location The location of the node.
     @param labelData The optional label data of the node if an {@link SimpleTreeBuilder.nodeLabelBinding} is specified.
     @param nodeObject The object from {@link SimpleTreeBuilder.nodesSource} from which to create the node.
     @returns The created node. */
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
     @param item The item to get the object for.
     @returns The object from which the graph item has been created.
     @see SimpleTreeBuilder#getNode
     @see SimpleTreeBuilder#getGroup */
  getBusinessObject(item) {
    return this.$adjacentNodesGraphBuilder.getBusinessObject(item)
  }

  /**
     Retrieves the group node associated with an object from the {@link SimpleTreeBuilder.groupsSource}.
     @param groupObject An object from the {@link SimpleTreeBuilder.groupsSource}.
     @returns The group node associated with `groupObject`, or `null` in case there is no group node associated with that object. This can
      happen if `groupObject` is new since the last call to {@link SimpleTreeBuilder.updateGraph}.
     @see SimpleTreeBuilder#getNode
     @see SimpleTreeBuilder#getBusinessObject */
  getGroup(groupObject) {
    return this.$adjacentNodesGraphBuilder.getGroup(groupObject)
  }

  /**
     Retrieves the node associated with an object from the {@link SimpleTreeBuilder.nodesSource}.
     @param nodeObject An object from the {@link SimpleTreeBuilder.nodesSource}.
     @returns The node associated with `nodeObject`, or `null` in case there is no node associated with that object. This can happen if `nodeObject`
      is new since the last call to {@link SimpleTreeBuilder.updateGraph}.
     @see SimpleTreeBuilder#getGroup
     @see SimpleTreeBuilder#getBusinessObject */
  getNode(nodeObject) {
    return this.$adjacentNodesGraphBuilder.getNode(nodeObject)
  }

  /**
     Updates an existing edge when the {@link SimpleTreeBuilder.updateGraph graph is updated}.
     This method is called during {@link SimpleTreeBuilder.updateGraph updating the graph} for every edge that already exists in the graph where its corresponding
     source and target node objects also still exist.
     Customizing how edges are updated is usually easier by adding an event handler to the {@link SimpleTreeBuilder.setEdgeUpdatedListener EdgeUpdated}
     event than by overriding this method.
     @param graph The edge's containing graph.
     @param edge The edge to update.
     @param labelData The optional label data of the edge if an {@link SimpleTreeBuilder.nodeLabelBinding} is specified. */
  updateEdge(graph, edge, labelData) {
    this.$adjacentNodesGraphBuilder.updateEdgeBase(graph, edge, labelData)
  }

  /**
     Updates an existing group node when the {@link SimpleTreeBuilder.updateGraph graph is updated}.
     This method is called during {@link SimpleTreeBuilder.updateGraph updating the graph} for every group node that already exists in the graph where its
     corresponding object from {@link SimpleTreeBuilder.groupsSource} is also still present.
     Customizing how group nodes are updated is usually easier by adding an event handler to the {@link SimpleTreeBuilder.setGroupNodeUpdatedListener GroupNodeUpdated}
     event than by overriding this method.
     @param graph The group node's containing graph.
     @param groupNode The group node to update.
     @param labelData The optional label data of the group node if an {@link SimpleTreeBuilder.groupLabelBinding} is specified.
     @param groupObject The object from {@link SimpleTreeBuilder.groupsSource} from which the group node has been created. */
  updateGroupNode(graph, groupNode, labelData, groupObject) {
    this.$adjacentNodesGraphBuilder.updateGroupNodeBase(graph, groupNode, labelData, groupObject)
  }

  /**
     Updates an existing node when the {@link SimpleTreeBuilder.updateGraph graph is updated}.
     This method is called during {@link SimpleTreeBuilder.updateGraph updating the graph} for every node that already exists in the graph where its corresponding
     object from {@link SimpleTreeBuilder.nodesSource} is also still present.
     Customizing how nodes are updated is usually easier by adding an event handler to the {@link SimpleTreeBuilder.setNodeUpdatedListener NodeUpdated}
     event than by overriding this method.
     @param graph The node's containing graph.
     @param node The node to update.
     @param parent The node's parent node.
     @param location The location of the node.
     @param labelData The optional label data of the node if an {@link SimpleTreeBuilder.nodeLabelBinding} is specified.
     @param nodeObject The object from {@link SimpleTreeBuilder.nodesSource} from which the node has been created. */
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
     Gets the {@link IGraph graph} used by this class. */
  get graph() {
    return this.$adjacentNodesGraphBuilder.graph
  }

  /**
     Gets or sets the objects to be represented as nodes of the {@link SimpleTreeBuilder.graph}.
     Note that it is not necessary to include all nodes in this property, if they can be reached via the
     {@link SimpleTreeBuilder.childBinding}. In this case it suffices to include all root nodes.
     */
  get nodesSource() {
    return this.$adjacentNodesGraphBuilder.nodesSource
  }

  set nodesSource(value) {
    this.$adjacentNodesGraphBuilder.nodesSource = value
  }

  /**
     Gets or sets the objects to be represented as group nodes of the {@link SimpleTreeBuilder.graph}. */
  get groupsSource() {
    return this.$adjacentNodesGraphBuilder.groupsSource
  }

  set groupsSource(value) {
    this.$adjacentNodesGraphBuilder.groupsSource = value
  }

  /**
     Gets or sets a binding that maps node objects to their identifier.
     This maps an object that represents a node to its identifier. This is needed when {@link SimpleTreeBuilder.childBinding children} are represented only by an
     identifier of nodes instead of pointing directly to the respective node objects.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     __Warning:__ The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleTreeBuilder.updateGraph update mechanism} cannot
     determine whether nodes have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
     @see SimpleTreeBuilder#nodesSource
     @see SimpleTreeBuilder#childBinding */
  get idBinding() {
    return this.$adjacentNodesGraphBuilder.nodeIdBinding
  }

  set idBinding(value) {
    this.$adjacentNodesGraphBuilder.nodeIdBinding = value
  }

  /**
     Gets or sets a binding that maps a node object to a label.
     This maps an object that represents a node to an object that represents the label for the node.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleTreeBuilder.setNodeCreatedListener NodeCreated}
     event.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     Returning `null` from the binding will not create a label for that node.
     @see SimpleTreeBuilder#nodesSource */
  get nodeLabelBinding() {
    return this.$adjacentNodesGraphBuilder.nodeLabelBinding
  }

  set nodeLabelBinding(value) {
    this.$adjacentNodesGraphBuilder.nodeLabelBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the x-axis.
     This binding maps a business object that represents a node to a number that specifies the x-coordinate of that node.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleTreeBuilder#nodesSource */
  get locationXBinding() {
    return this.$adjacentNodesGraphBuilder.locationXBinding
  }

  set locationXBinding(value) {
    this.$adjacentNodesGraphBuilder.locationXBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the y-axis.
     This binding maps a business object that represents a node to a number that specifies the y-coordinate of that node.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleTreeBuilder#nodesSource */
  get locationYBinding() {
    return this.$adjacentNodesGraphBuilder.locationYBinding
  }

  set locationYBinding(value) {
    this.$adjacentNodesGraphBuilder.locationYBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their child nodes.
     This maps an object that represents a node to a set of other objects that represent its child nodes.
     If a {@link SimpleTreeBuilder.idBinding} is set, the returned objects must be the IDs of node objects instead of the node objects themselves.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleTreeBuilder#nodesSource
     @see SimpleTreeBuilder#idBinding */
  get childBinding() {
    return this.$adjacentNodesGraphBuilder.successorsBinding
  }

  set childBinding(value) {
    this.$adjacentNodesGraphBuilder.successorsBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their containing groups.
     This maps an object _N_ that represents a node to another object _G_ that specifies the containing group of _N_. If _G_ is contained
     in {@link SimpleTreeBuilder.groupsSource}, then the node for _N_ becomes a child node of the group for _G_.
     If a {@link SimpleTreeBuilder.groupIdBinding} is set, the returned object _G_ must be the ID of the object that specifies the group instead of that object itself.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleTreeBuilder#nodesSource
     @see SimpleTreeBuilder#groupsSource
     @see SimpleTreeBuilder#groupIdBinding */
  get groupBinding() {
    return this.$adjacentNodesGraphBuilder.groupBinding
  }

  set groupBinding(value) {
    this.$adjacentNodesGraphBuilder.groupBinding = value
  }

  /**
     Gets or sets a binding that maps a node object representing the edge's target node to a label.
     This maps an object that represents an edge to an object that represents the label for the edge.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleTreeBuilder.setEdgeCreatedListener EdgeCreated}
     event.
     Returning `null` from the binding will not create a label for that edge.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     */
  get edgeLabelBinding() {
    return this.$edgeLabelBinding
  }

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
     This maps an object that represents a group node to its identifier. This is needed when {@link SimpleTreeBuilder.nodesSource node objects} only contain an
     identifier to specify the group they belong to instead of pointing directly to the respective group object. The same
     goes for the parent group in group objects.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     __Warning:__ The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleTreeBuilder.updateGraph update mechanism} cannot
     determine whether groups have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
     @see SimpleTreeBuilder#groupsSource
     @see SimpleTreeBuilder#groupBinding
     @see SimpleTreeBuilder#parentGroupBinding */
  get groupIdBinding() {
    return this.$adjacentNodesGraphBuilder.groupIdBinding
  }

  set groupIdBinding(value) {
    this.$adjacentNodesGraphBuilder.groupIdBinding = value
  }

  /**
     Gets or sets a binding that maps a group object to a label.
     This maps an object that represents a group node to an object that represents the label for the group node.
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleTreeBuilder.setGroupNodeCreatedListener GroupNodeCreated}
     event.
     Returning `null` from the binding will not create a label for that group node.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleTreeBuilder#groupsSource */
  get groupLabelBinding() {
    return this.$adjacentNodesGraphBuilder.groupLabelBinding
  }

  set groupLabelBinding(value) {
    this.$adjacentNodesGraphBuilder.groupLabelBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their containing groups.
     This maps an object _G_ that represents a group node to another object _P_ that specifies the containing group of _G_. If _P_ is
     contained in {@link SimpleTreeBuilder.groupsSource}, then the group node for _G_ becomes a child node of the group for _P_.
     If a {@link SimpleTreeBuilder.groupIdBinding} is set, the returned object _P_ must be the ID of the object that specifies the group instead of that object itself.
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
     @see SimpleTreeBuilder#groupsSource
     @see SimpleTreeBuilder#groupIdBinding */
  get parentGroupBinding() {
    return this.$adjacentNodesGraphBuilder.parentGroupBinding
  }

  set parentGroupBinding(value) {
    this.$adjacentNodesGraphBuilder.parentGroupBinding = value
  }

  /**
     Adds the given listener for the `NodeCreated` event that occurs when a node has been created.
     This event can be used to further customize the created node.
     New nodes are created either in response to calling {@link SimpleTreeBuilder.buildGraph}, or in response to calling {@link SimpleTreeBuilder.updateGraph}
     when there are new items in {@link SimpleTreeBuilder.nodesSource}.
     @param listener The listener to add.
     @see SimpleTreeBuilder#setNodeUpdatedListener
     @see SimpleTreeBuilder#removeNodeCreatedListener */
  setNodeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.setNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `NodeCreated` event that occurs when a node has been created.
     This event can be used to further customize the created node.
     New nodes are created either in response to calling {@link SimpleTreeBuilder.buildGraph}, or in response to calling {@link SimpleTreeBuilder.updateGraph}
     when there are new items in {@link SimpleTreeBuilder.nodesSource}.
     @param listener The listener to remove.
     @see SimpleTreeBuilder#setNodeUpdatedListener
     @see SimpleTreeBuilder#setNodeCreatedListener */
  removeNodeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `NodeUpdated` event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder.setNodeCreatedListener NodeCreated}.
     Nodes are updated in response to calling {@link SimpleTreeBuilder.updateGraph} for items that haven't been added anew
     in {@link SimpleTreeBuilder.nodesSource} since the last call to {@link SimpleTreeBuilder.buildGraph} or {@link SimpleTreeBuilder.updateGraph}.
     @param listener The listener to add.
     @see SimpleTreeBuilder#setNodeCreatedListener
     @see SimpleTreeBuilder#removeNodeUpdatedListener */
  setNodeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.setNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `NodeUpdated` event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder.setNodeCreatedListener NodeCreated}.
     Nodes are updated in response to calling {@link SimpleTreeBuilder.updateGraph} for items that haven't been added anew
     in {@link SimpleTreeBuilder.nodesSource} since the last call to {@link SimpleTreeBuilder.buildGraph} or {@link SimpleTreeBuilder.updateGraph}.
     @param listener The listener to remove.
     @see SimpleTreeBuilder#setNodeCreatedListener
     @see SimpleTreeBuilder#setNodeUpdatedListener */
  removeNodeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeNodeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the `EdgeCreated` event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
     New edges are created either in response to calling {@link SimpleTreeBuilder.buildGraph}, or in response to calling {@link SimpleTreeBuilder.updateGraph}
     when there are new items in {@link SimpleTreeBuilder.childBinding}.
     @param listener The listener to add.
     @see SimpleTreeBuilder#setEdgeUpdatedListener
     @see SimpleTreeBuilder#removeEdgeCreatedListener */
  addEdgeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.addEdgeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `EdgeCreated` event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
     New edges are created either in response to calling {@link SimpleTreeBuilder.buildGraph}, or in response to calling {@link SimpleTreeBuilder.updateGraph}
     when there are new items in {@link SimpleTreeBuilder.childBinding}.
     @param listener The listener to remove.
     @see SimpleTreeBuilder#setEdgeUpdatedListener
     @see SimpleTreeBuilder#addEdgeCreatedListener */
  removeEdgeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeEdgeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `EdgeUpdated` event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder.setEdgeCreatedListener EdgeCreated}.
     Edges are updated in response to calling {@link SimpleTreeBuilder.updateGraph} for items that haven't been added anew
     in {@link SimpleTreeBuilder.childBinding} since the last call to {@link SimpleTreeBuilder.buildGraph} or {@link SimpleTreeBuilder.updateGraph}.
     @param listener The listener to add.
     @see SimpleTreeBuilder#addEdgeCreatedListener
     @see SimpleTreeBuilder#removeEdgeUpdatedListener */
  setEdgeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.addEdgeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `EdgeUpdated` event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder.setEdgeCreatedListener EdgeCreated}.
     Edges are updated in response to calling {@link SimpleTreeBuilder.updateGraph} for items that haven't been added anew
     in {@link SimpleTreeBuilder.childBinding} since the last call to {@link SimpleTreeBuilder.buildGraph} or {@link SimpleTreeBuilder.updateGraph}.
     @param listener The listener to remove.
     @see SimpleTreeBuilder#addEdgeCreatedListener
     @see SimpleTreeBuilder#setEdgeUpdatedListener */
  removeEdgeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeEdgeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the `GroupNodeCreated` event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
     New group nodes are created either in response to calling {@link SimpleTreeBuilder.buildGraph}, or in response to
     calling {@link SimpleTreeBuilder.updateGraph} when there are new items in {@link SimpleTreeBuilder.groupsSource}.
     @param listener The listener to add.
     @see SimpleTreeBuilder#setGroupNodeUpdatedListener
     @see SimpleTreeBuilder#removeGroupNodeCreatedListener */
  setGroupNodeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.setGroupNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `GroupNodeCreated` event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
     New group nodes are created either in response to calling {@link SimpleTreeBuilder.buildGraph}, or in response to
     calling {@link SimpleTreeBuilder.updateGraph} when there are new items in {@link SimpleTreeBuilder.groupsSource}.
     @param listener The listener to remove.
     @see SimpleTreeBuilder#setGroupNodeUpdatedListener
     @see SimpleTreeBuilder#setGroupNodeCreatedListener */
  removeGroupNodeCreatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeGroupNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `GroupNodeUpdated` event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder.setGroupNodeCreatedListener GroupNodeCreated}.
     Group nodes are updated in response to calling {@link SimpleTreeBuilder.updateGraph} for items that haven't been added
     anew in {@link SimpleTreeBuilder.groupsSource} since the last call to {@link SimpleTreeBuilder.buildGraph} or {@link SimpleTreeBuilder.updateGraph}.
     @param listener The listener to add.
     @see SimpleTreeBuilder#setGroupNodeCreatedListener
     @see SimpleTreeBuilder#removeGroupNodeUpdatedListener */
  setGroupNodeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.setGroupNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `GroupNodeUpdated` event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleTreeBuilder.setGroupNodeCreatedListener GroupNodeCreated}.
     Group nodes are updated in response to calling {@link SimpleTreeBuilder.updateGraph} for items that haven't been added
     anew in {@link SimpleTreeBuilder.groupsSource} since the last call to {@link SimpleTreeBuilder.buildGraph} or {@link SimpleTreeBuilder.updateGraph}.
     @param listener The listener to remove.
     @see SimpleTreeBuilder#setGroupNodeCreatedListener
     @see SimpleTreeBuilder#setGroupNodeUpdatedListener */
  removeGroupNodeUpdatedListener(listener) {
    this.$adjacentNodesGraphBuilder.removeGroupNodeUpdatedListener(listener)
  }
}

/**
 Populates a graph from custom data where objects corresponding to nodes know their neighbors.
 This class can be used when the data specifies a collection of nodes in which each node knows its direct neighbors,
 and optionally a collection of groups. The properties {@link SimpleAdjacentNodesGraphBuilder.nodesSource} and {@link SimpleAdjacentNodesGraphBuilder.groupsSource} define the source collections from which nodes and groups
 will be created.

 Generally, using the {@link SimpleAdjacentNodesGraphBuilder} class consists of a few basic steps:

 1. Set up the {@link SimpleAdjacentNodesGraphBuilder.graph} with the proper defaults for items ({@link IGraph.nodeDefaults}, {@link IGraph.groupNodeDefaults}, {@link IGraph.edgeDefaults})
 2. Create an {@link SimpleAdjacentNodesGraphBuilder}.
 3. Set the items sources. At the very least the {@link SimpleAdjacentNodesGraphBuilder.nodesSource} is needed. Note that the {@link SimpleAdjacentNodesGraphBuilder.nodesSource} does not have to contain all nodes, as nodes
 that are implicitly specified through the {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} and {@link SimpleAdjacentNodesGraphBuilder.successorsBinding} are automatically added to the graph as well. If the items in the nodes
 collection are grouped somehow, then also set the {@link SimpleAdjacentNodesGraphBuilder.groupsSource} property.
 4. Set up the bindings so that a graph structure can actually be created from the items sources. This involves at least
 setting up either the {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder.successorsBinding} property so that edges can be created. If the node objects don't actually contain their
 neighboring node objects, but instead identifiers of other node objects, then {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} and {@link SimpleAdjacentNodesGraphBuilder.successorsBinding} would return those identifiers and {@link SimpleAdjacentNodesGraphBuilder.nodeIdBinding}
 must be set to return that identifier when given a node object.
 5. If {@link SimpleAdjacentNodesGraphBuilder.groupsSource} is set, then you also need to set the {@link SimpleAdjacentNodesGraphBuilder.groupBinding} property to enable mapping nodes to groups. Just like with edges and their
 source and target nodes, if the node object only contains an identifier for a group node and not the actual group
 object, then return the identifier in the {@link SimpleAdjacentNodesGraphBuilder.groupBinding} and set up the {@link SimpleAdjacentNodesGraphBuilder.groupIdBinding} to map group node objects to their identifiers. If group
 nodes can nest, you also need the {@link SimpleAdjacentNodesGraphBuilder.parentGroupBinding}.
 6. You can also easily create labels for nodes, groups, and edges by using the {@link SimpleAdjacentNodesGraphBuilder.nodeLabelBinding}, {@link SimpleAdjacentNodesGraphBuilder.groupLabelBinding}, and {@link SimpleAdjacentNodesGraphBuilder.edgeLabelBinding} properties.
 7. Call {@link SimpleAdjacentNodesGraphBuilder.buildGraph} to populate the graph. You can apply a layout algorithm
 afterward to make the graph look nice.
 8. If your items or collections change later, call {@link SimpleAdjacentNodesGraphBuilder.updateGraph} to make those
 changes visible in the graph.


 You can further customize how nodes, groups, and edges are created by adding event handlers to the various events and
 modifying the items there. This can be used to modify items in ways that are not directly supported by the available
 bindings or defaults. This includes scenarios such as the following:

 - Setting node positions or adding bends to edges. Often a layout is applied to the graph after building it, so these
 things are only rarely needed.
 - Modifying individual items, such as setting a different style for every nodes, depending on the bound object.
 - Adding more than one label for an item, as the {@link SimpleAdjacentNodesGraphBuilder.nodeLabelBinding} and {@link SimpleAdjacentNodesGraphBuilder.edgeLabelBinding} will only create a single label, or adding labels to group nodes.

 There are creation and update events for all three types of items, which allows separate customization when nodes,
 groups, and edges are created or updated. For completely static graphs where {@link SimpleAdjacentNodesGraphBuilder.updateGraph}
 is not needed, the update events can be safely ignored.

 Depending on how the source data is laid out, you may also consider using {@link SimpleTreeBuilder}, where the graph is
 a tree and node objects know their children, or {@link SimpleGraphBuilder} which is a more general approach to creating
 arbitrary graphs.

 ## Note

 This class serves as a convenient way to create general graphs and has some limitations:

 - When populating the graph for the first time it will be cleared of all existing items.
 - When using a {@link SimpleAdjacentNodesGraphBuilder.nodeIdBinding}, all nodes have to exist in the {@link SimpleAdjacentNodesGraphBuilder.nodesSource}. Nodes cannot be created on demand from IDs only.
 - Elements manually created on the graph in between calls to {@link SimpleAdjacentNodesGraphBuilder.updateGraph} may not
 be preserved.

 If updates get too complex it's often better to write the code interfacing with the graph by hand instead of relying on
 {@link SimpleGraphBuilder}.

 The different graph builders are discussed in the section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder Creating a Graph from Business Data}. Class
 {@link AdjacencyGraphBuilder}, in particular, is topic of section {@link https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-AdjacencyGraphBuilder AdjacencyGraphBuilder}.

 @see {@link SimpleGraphBuilder}
 @see {@link SimpleTreeBuilder}
 @see {@link SimpleAdjacentNodesGraphBuilder}
 */
export class SimpleAdjacentNodesGraphBuilder {
  $graphBuilderHelper
  $graphBuilder
  $builderNodesSource
  $builderEdgeCreator
  $builderGroupsSource
  $mirrorGraph
  $nodeToMirrorNodeMap

  $nodesSource
  $groupsSource
  $successorsBinding
  $predecessorsBinding
  $predecessorsProvider
  $successorsProvider
  $predecessorsIdProvider
  $successorsIdProvider

  /**
     Initializes a new instance of the {@link SimpleAdjacentNodesGraphBuilder} class that operates on the given graph.
     The `graph` will be {@link IGraph.clear cleared} and re-built from the data in {@link SimpleAdjacentNodesGraphBuilder.nodesSource} and {@link SimpleAdjacentNodesGraphBuilder.groupsSource} when {@link SimpleAdjacentNodesGraphBuilder.buildGraph}
     is called.
  
     @param graphOrOptions The parameters to pass.
     @param [graphOrOptions.graph] The graph.
     @param [graphOrOptions.nodesSource] The objects to be represented as nodes of the {@link SimpleAdjacentNodesGraphBuilder.graph}. This option sets the {@link SimpleAdjacentNodesGraphBuilder.nodesSource} property on the created object.
     @param [graphOrOptions.groupsSource] The objects to be represented as group nodes of the {@link SimpleAdjacentNodesGraphBuilder.graph}. This option sets the {@link SimpleAdjacentNodesGraphBuilder.groupsSource} property on the created object.
     @param [graphOrOptions.nodeIdBinding] A binding that maps node objects to their identifier. This option sets the {@link SimpleAdjacentNodesGraphBuilder.nodeIdBinding} property on the created object.
     @param [graphOrOptions.nodeLabelBinding] A binding that maps a node object to a label. This option sets the {@link SimpleAdjacentNodesGraphBuilder.nodeLabelBinding} property on the created object.
     @param [graphOrOptions.locationXBinding] The binding for determining a node's position on the x-axis. This option sets the {@link SimpleAdjacentNodesGraphBuilder.locationXBinding} property on the created object.
     @param [graphOrOptions.locationYBinding] The binding for determining a node's position on the y-axis. This option sets the {@link SimpleAdjacentNodesGraphBuilder.locationYBinding} property on the created object.
     @param [graphOrOptions.groupBinding] A binding that maps node objects to their containing groups. This option sets the {@link SimpleAdjacentNodesGraphBuilder.groupBinding} property on the created object.
     @param [graphOrOptions.edgeLabelBinding] A binding that maps an edge, represented by its source and target node object, to a label. This option sets the {@link SimpleAdjacentNodesGraphBuilder.edgeLabelBinding} property on the created object.
     @param [graphOrOptions.groupIdBinding] A binding that maps group objects to their identifier. This option sets the {@link SimpleAdjacentNodesGraphBuilder.groupIdBinding} property on the created object.
     @param [graphOrOptions.groupLabelBinding] A binding that maps a group object to a label. This option sets the {@link SimpleAdjacentNodesGraphBuilder.groupLabelBinding} property on the created object.
     @param [graphOrOptions.parentGroupBinding] A binding that maps group objects to their containing groups. This option sets the {@link SimpleAdjacentNodesGraphBuilder.parentGroupBinding} property on the created object.
     @param [graphOrOptions.successorsBinding] A binding that maps node objects to their successors. This option sets the {@link SimpleAdjacentNodesGraphBuilder.successorsBinding} property on the created object.
     @param [graphOrOptions.predecessorsBinding] A binding that maps node objects to their predecessors. This option sets the {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} property on the created object.
     @see SimpleAdjacentNodesGraphBuilder */
  constructor(graphOrOptions) {
    let options = null
    let graph
    if (!graphOrOptions) {
      graph = new Graph()
    } else if (graphOrOptions instanceof IGraph) {
      graph = graphOrOptions
    } else {
      options = graphOrOptions
      graph = options.graph || new Graph()
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
    this.$builderNodesSource = this.$graphBuilder.createNodesSource([], null)
    this.$builderNodesSource.nodeCreator = this.$graphBuilderHelper.createNodeCreator()

    this.$builderEdgeCreator = this.$graphBuilderHelper.createEdgeCreator(true)

    this.$builderNodesSource.addSuccessorsSource(
      (dataItem) => this.$successorsProvider && this.$successorsProvider(dataItem),
      this.$builderNodesSource,
      this.$builderEdgeCreator
    )
    this.$builderNodesSource.addPredecessorsSource(
      (dataItem) => this.$predecessorsProvider && this.$predecessorsProvider(dataItem),
      this.$builderNodesSource,
      this.$builderEdgeCreator
    )

    this.$builderNodesSource.addSuccessorIds(
      (dataItem) => this.$successorsIdProvider && this.$successorsIdProvider(dataItem),
      this.$builderEdgeCreator
    )
    this.$builderNodesSource.addPredecessorIds(
      (dataItem) => this.$predecessorsIdProvider && this.$predecessorsIdProvider(dataItem),
      this.$builderEdgeCreator
    )

    this.$builderGroupsSource = this.$graphBuilder.createGroupNodesSource([], null)
    this.$builderGroupsSource.nodeCreator = this.$graphBuilderHelper.createGroupCreator()

    this.$mirrorGraph = new Graph()
    this.$nodeToMirrorNodeMap = new Map()

    if (options) {
      this.$applyOptions(options)
    }
  }

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
  
     @returns The created graph.
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
     {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, the graph is not cleared. Instead, graph elements corresponding to
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
      ? (dataItem) => this.$eliminateDuplicateEdges(dataItem, predecessorsProvider(dataItem), false)
      : null

    const successorsProvider = GraphBuilderHelper.createBinding(this.successorsBinding)
    const distinctSuccessorsProvider = successorsProvider
      ? (dataItem) => this.$eliminateDuplicateEdges(dataItem, successorsProvider(dataItem), true)
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

    this.$builderNodesSource.nodeCreator.tagProvider = (n) => n
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

  $maybeResolveId(dataItemOrId) {
    return this.nodeIdBinding ? this.$getDataItemById(dataItemOrId) : dataItemOrId
  }

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
  
     @param graph The graph.
     @param source The source node of the edge.
     @param target The target node of the edge.
     @param labelData The optional label data of the edge if an {@link SimpleAdjacentNodesGraphBuilder.edgeLabelBinding} is specified.
     @returns The created edge.
     @see SimpleAdjacentNodesGraphBuilder */
  createEdge(graph, source, target, labelData) {
    return this.$graphBuilderHelper.createEdge(graph, source, target, labelData, null)
  }

  $createEdgeAndMirrorEdge(source, target, graph, labelData) {
    const sourceMirrorNode = this.$nodeToMirrorNodeMap.get(source)
    const targetMirrorNode = this.$nodeToMirrorNodeMap.get(target)
    if (sourceMirrorNode && targetMirrorNode) {
      this.$mirrorGraph.createEdge(sourceMirrorNode, targetMirrorNode)
    }
    return this.createEdge(graph, source, target, labelData)
  }

  /**
     Creates a group node from the given `groupObject` and `labelData`.
     This method is called for every group node that is created either when {@link SimpleAdjacentNodesGraphBuilder.buildGraph building the graph}, or when new items appear in
     the {@link SimpleAdjacentNodesGraphBuilder.groupsSource} when {@link SimpleAdjacentNodesGraphBuilder.updateGraph updating it}.
  
     The default behavior is to create the group node, assign the `groupObject` to the group node's {@link ITagOwner.tag} property, and create a
     label from `labelData`, if present.
  
     Customizing how group nodes are created is usually easier by adding an event handler to the {@link SimpleAdjacentNodesGraphBuilder.setGroupNodeCreatedListener GroupNodeCreated}
     event than by overriding this method.
  
     @param graph The graph in which to create the group node.
     @param labelData The optional label data of the group node if an {@link SimpleAdjacentNodesGraphBuilder.groupLabelBinding} is specified.
     @param groupObject The object from {@link SimpleAdjacentNodesGraphBuilder.groupsSource} from which to create the group node.
     @returns The created group node.
     @see SimpleAdjacentNodesGraphBuilder */
  createGroupNode(graph, labelData, groupObject) {
    return this.$graphBuilderHelper.createGroupNode(graph, labelData, groupObject)
  }

  /**
     Creates a node with the specified parent from the given `nodeObject` and `labelData`.
     This method is called for every node that is created either when {@link SimpleAdjacentNodesGraphBuilder.buildGraph building the graph}, or when new items appear in the {@link SimpleAdjacentNodesGraphBuilder.nodesSource}
     when {@link SimpleAdjacentNodesGraphBuilder.updateGraph updating it}.
  
     The default behavior is to create the node with the given parent node, assign the `nodeObject` to the node's {@link ITagOwner.tag} property,
     and create a label from `labelData`, if present.
  
     Customizing how nodes are created is usually easier by adding an event handler to the {@link SimpleAdjacentNodesGraphBuilder.setNodeCreatedListener NodeCreated}
     event than by overriding this method.
  
     @param graph The graph in which to create the node.
     @param parent The node's parent node.
     @param location The location of the node.
     @param labelData The optional label data of the node if an {@link SimpleAdjacentNodesGraphBuilder.nodeLabelBinding} is specified.
     @param nodeObject The object from {@link SimpleAdjacentNodesGraphBuilder.nodesSource} from which to create the node.
     @returns The created node.
     @see SimpleAdjacentNodesGraphBuilder */
  createNode(graph, parent, location, labelData, nodeObject) {
    return this.$graphBuilderHelper.createNode(graph, parent, location, labelData, nodeObject)
  }

  $createNodeAndMirrorNode(graph, parent, location, labelData, nodeObject) {
    const node = this.createNode(graph, parent, location, labelData, nodeObject)
    const mirrorNode = this.$mirrorGraph.createNode()
    this.$nodeToMirrorNodeMap.set(node, mirrorNode)
    return node
  }

  /**
     Retrieves the object from which a given item has been created.
     @param item The item to get the object for.
     @returns The object from which the graph item has been created.
     @see SimpleAdjacentNodesGraphBuilder#getNode
     @see SimpleAdjacentNodesGraphBuilder#getGroup
     @see SimpleAdjacentNodesGraphBuilder */
  getBusinessObject(item) {
    return this.$graphBuilderHelper.getBusinessObject(item)
  }

  /**
     Retrieves the group node associated with an object from the {@link SimpleAdjacentNodesGraphBuilder.groupsSource}.
     @param groupObject An object from the {@link SimpleAdjacentNodesGraphBuilder.groupsSource}.
     @returns The group node associated with `groupObject`, or `null` in case there is no group node associated with that object. This can
      happen if `groupObject` is new since the last call to {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
     @see SimpleAdjacentNodesGraphBuilder#getNode
     @see SimpleAdjacentNodesGraphBuilder#getBusinessObject
     @see SimpleAdjacentNodesGraphBuilder */
  getGroup(groupObject) {
    return this.$graphBuilderHelper.getGroup(groupObject)
  }

  /**
     Retrieves the node associated with an object from the {@link SimpleAdjacentNodesGraphBuilder.nodesSource}.
     @param nodeObject An object from the {@link SimpleAdjacentNodesGraphBuilder.nodesSource}.
     @returns The node associated with `nodeObject`, or `null` in case there is no node associated with that object. This can happen if `nodeObject`
      is new since the last call to {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
     @see SimpleAdjacentNodesGraphBuilder#getGroup
     @see SimpleAdjacentNodesGraphBuilder#getBusinessObject
     @see SimpleAdjacentNodesGraphBuilder */
  getNode(nodeObject) {
    return this.$graphBuilderHelper.getNode(nodeObject)
  }

  /**
     Updates an existing edge connecting the given nodes when {@link SimpleGraphBuilder.updateGraph} is called and the edge
     should remain in the graph.
     This implementation updates the label of the `edge` with the given `labelData` and fires the {@link SimpleAdjacentNodesGraphBuilder.setEdgeUpdatedListener EdgeUpdated}
     event.
  
     @param graph The graph.
     @param edge The edge to update.
     @param labelData The optional label data of the edge if an {@link SimpleAdjacentNodesGraphBuilder.edgeLabelBinding} is specified.
     @see SimpleAdjacentNodesGraphBuilder */
  updateEdge(graph, edge, labelData) {
    this.$graphBuilderHelper.updateEdge(graph, edge, labelData, null)
  }

  $updateEdgeAndCreateMirrorEdge(edge, graph, labelData) {
    const sourceMirrorNode = this.$nodeToMirrorNodeMap.get(edge.sourceNode)
    const targetMirrorNode = this.$nodeToMirrorNodeMap.get(edge.targetNode)
    if (sourceMirrorNode && targetMirrorNode) {
      this.$mirrorGraph.createEdge(sourceMirrorNode, targetMirrorNode)
    }
    this.updateEdge(graph, edge, labelData)
  }

  /**
     Updates an existing group node when the {@link SimpleAdjacentNodesGraphBuilder.updateGraph graph is updated}.
     This method is called during {@link SimpleAdjacentNodesGraphBuilder.updateGraph updating the graph} for every group node that already exists in the graph where its
     corresponding object from {@link SimpleAdjacentNodesGraphBuilder.groupsSource} is also still present.
  
     Customizing how group nodes are updated is usually easier by adding an event handler to the {@link SimpleAdjacentNodesGraphBuilder.setGroupNodeUpdatedListener GroupNodeUpdated}
     event than by overriding this method.
  
     @param graph The group node's containing graph.
     @param groupNode The group node to update.
     @param labelData The optional label data of the group node if an {@link SimpleAdjacentNodesGraphBuilder.groupLabelBinding} is specified.
     @param groupObject The object from {@link SimpleAdjacentNodesGraphBuilder.groupsSource} from which the group node has been created.
     @see SimpleAdjacentNodesGraphBuilder */
  updateGroupNode(graph, groupNode, labelData, groupObject) {
    this.$graphBuilderHelper.updateGroupNode(graph, groupNode, labelData, groupObject)
  }

  /**
     Updates an existing node when the {@link SimpleAdjacentNodesGraphBuilder.updateGraph graph is updated}.
     This method is called during {@link SimpleAdjacentNodesGraphBuilder.updateGraph updating the graph} for every node that already exists in the graph where its corresponding
     object from {@link SimpleAdjacentNodesGraphBuilder.nodesSource} is also still present.
  
     Customizing how nodes are updated is usually easier by adding an event handler to the {@link SimpleAdjacentNodesGraphBuilder.setNodeUpdatedListener NodeUpdated}
     event than by overriding this method.
  
     @param graph The node's containing graph.
     @param node The node to update.
     @param parent The node's parent node.
     @param location The location of the node.
     @param labelData The optional label data of the node if an {@link SimpleAdjacentNodesGraphBuilder.nodeLabelBinding} is specified.
     @param nodeObject The object from {@link SimpleAdjacentNodesGraphBuilder.nodesSource} from which the node has been created.
     @see SimpleAdjacentNodesGraphBuilder */
  updateNode(graph, node, parent, location, labelData, nodeObject) {
    this.$graphBuilderHelper.updateNode(graph, node, parent, location, labelData, nodeObject)
  }

  $updateNodeAndCreateMirrorNode(graph, node, parent, location, labelData, nodeObject) {
    this.updateNode(graph, node, parent, location, labelData, nodeObject)
    const mirrorNode = this.$mirrorGraph.createNode()
    this.$nodeToMirrorNodeMap.set(node, mirrorNode)
  }

  /**
     Gets the {@link IGraph graph} used by this class.
     @see SimpleAdjacentNodesGraphBuilder */
  get graph() {
    return this.$graphBuilder.graph
  }

  /**
     Gets or sets the objects to be represented as nodes of the {@link SimpleAdjacentNodesGraphBuilder.graph}.
     Note that it is not necessary to include all nodes in this property, if they can be reached via the {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} or
     {@link SimpleAdjacentNodesGraphBuilder.successorsBinding}. In this case it suffices to include all root nodes.
  
     @see SimpleAdjacentNodesGraphBuilder */
  get nodesSource() {
    return this.$nodesSource
  }

  set nodesSource(value) {
    this.$nodesSource = value
  }

  /**
     Gets or sets the objects to be represented as group nodes of the {@link SimpleAdjacentNodesGraphBuilder.graph}.
     @see SimpleAdjacentNodesGraphBuilder */
  get groupsSource() {
    return this.$groupsSource
  }

  set groupsSource(value) {
    this.$groupsSource = value
  }

  /**
     Gets or sets a binding that maps node objects to their identifier.
     This maps an object that represents a node to its identifier. This is needed when {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding predecessors} or {@link SimpleAdjacentNodesGraphBuilder.successorsBinding successors} are
     represented only by an identifier of nodes instead of pointing directly to the respective node objects.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     __Warning:__ The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleAdjacentNodesGraphBuilder.updateGraph update mechanism} cannot
     determine whether nodes have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
  
     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder#predecessorsBinding
     @see SimpleAdjacentNodesGraphBuilder#successorsBinding
     @see SimpleAdjacentNodesGraphBuilder */
  $nodeIdBinding

  get nodeIdBinding() {
    return this.$nodeIdBinding
  }

  set nodeIdBinding(value) {
    this.$nodeIdBinding = value
  }

  /**
     Gets or sets a binding that maps a node object to a label.
     This maps an object that represents a node to an object that represents the label for the node.
  
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleAdjacentNodesGraphBuilder.setNodeCreatedListener NodeCreated}
     event.
  
     Returning `null` from the binding will not create a label for that node.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder */
  get nodeLabelBinding() {
    return this.$graphBuilderHelper.nodeLabelBinding
  }

  set nodeLabelBinding(value) {
    this.$graphBuilderHelper.nodeLabelBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the x-axis.
     This binding maps a business object that represents a node to a number that specifies the x-coordinate of that node.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder */
  get locationXBinding() {
    return this.$graphBuilderHelper.locationXBinding
  }

  set locationXBinding(value) {
    this.$graphBuilderHelper.locationXBinding = value
  }

  /**
     Gets or sets the binding for determining a node's position on the y-axis.
     This binding maps a business object that represents a node to a number that specifies the y-coordinate of that node.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder */
  get locationYBinding() {
    return this.$graphBuilderHelper.locationYBinding
  }

  set locationYBinding(value) {
    this.$graphBuilderHelper.locationYBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their containing groups.
     This maps an object _N_ that represents a node to another object _G_ that specifies the containing group of _N_. If _G_ is contained
     in {@link SimpleAdjacentNodesGraphBuilder.groupsSource}, then the node for _N_ becomes a child node of the group for _G_.
  
     If a {@link SimpleAdjacentNodesGraphBuilder.groupIdBinding} is set, the returned object _G_ must be the ID of the object that specifies the group instead of that object itself.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder#groupsSource
     @see SimpleAdjacentNodesGraphBuilder#groupIdBinding
     @see SimpleAdjacentNodesGraphBuilder */
  get groupBinding() {
    return this.$graphBuilderHelper.groupBinding
  }

  set groupBinding(value) {
    this.$graphBuilderHelper.groupBinding = value
  }

  /**
     Gets or sets a binding that maps an edge, represented by its source and target node object, to a label.
     This maps the source and target node objects to an object that represents the label for the edge.
  
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleAdjacentNodesGraphBuilder.setEdgeCreatedListener EdgeCreated}
     event.
  
     Returning `null` from the binding will not create a label for that edge.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder */
  get edgeLabelBinding() {
    return this.$graphBuilderHelper.edgeLabelBinding
  }

  set edgeLabelBinding(value) {
    this.$graphBuilderHelper.edgeLabelBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their identifier.
     This maps an object that represents a group node to its identifier. This is needed when {@link SimpleAdjacentNodesGraphBuilder.nodesSource node objects} only contain an
     identifier to specify the group they belong to instead of pointing directly to the respective group object. The same
     goes for the parent group in group objects.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     __Warning:__ The identifiers returned by the binding must be stable and not change over time. Otherwise the {@link SimpleAdjacentNodesGraphBuilder.updateGraph update mechanism} cannot
     determine whether groups have been added or updated. For the same reason this property must not be changed after having
     built the graph once.
  
     @see SimpleAdjacentNodesGraphBuilder#groupsSource
     @see SimpleAdjacentNodesGraphBuilder#groupBinding
     @see SimpleAdjacentNodesGraphBuilder#parentGroupBinding
     @see SimpleAdjacentNodesGraphBuilder */
  get groupIdBinding() {
    return this.$graphBuilderHelper.groupIdBinding
  }

  set groupIdBinding(value) {
    this.$graphBuilderHelper.groupIdBinding = value
  }

  /**
     Gets or sets a binding that maps a group object to a label.
     This maps an object that represents a group node to an object that represents the label for the group node.
  
     The resulting object will be converted into a string to be displayed as the label's text. If this is insufficient, a
     label can also be created directly in an event handler of the {@link SimpleAdjacentNodesGraphBuilder.setGroupNodeCreatedListener GroupNodeCreated}
     event.
  
     Returning `null` from the binding will not create a label for that group node.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder#groupsSource
     @see SimpleAdjacentNodesGraphBuilder */
  get groupLabelBinding() {
    return this.$graphBuilderHelper.groupLabelBinding
  }

  set groupLabelBinding(value) {
    this.$graphBuilderHelper.groupLabelBinding = value
  }

  /**
     Gets or sets a binding that maps group objects to their containing groups.
     This maps an object _G_ that represents a group node to another object _P_ that specifies the containing group of _G_. If _P_ is
     contained in {@link SimpleAdjacentNodesGraphBuilder.groupsSource}, then the group node for _G_ becomes a child node of the group for _P_.
  
     If a {@link SimpleAdjacentNodesGraphBuilder.groupIdBinding} is set, the returned object _P_ must be the ID of the object that specifies the group instead of that object itself.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder#groupsSource
     @see SimpleAdjacentNodesGraphBuilder#groupIdBinding
     @see SimpleAdjacentNodesGraphBuilder */
  get parentGroupBinding() {
    return this.$graphBuilderHelper.parentGroupBinding
  }

  set parentGroupBinding(value) {
    this.$graphBuilderHelper.parentGroupBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their successors.
     This maps an object that represents a node to a set of other objects that represent its successor nodes, i.e. other
     nodes connected with an outgoing edge.
  
     If a {@link SimpleAdjacentNodesGraphBuilder.nodeIdBinding} is set, the returned objects must be the IDs of node objects instead of the node objects themselves.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder#predecessorsBinding
     @see SimpleAdjacentNodesGraphBuilder#nodeIdBinding
     @see SimpleAdjacentNodesGraphBuilder */
  get successorsBinding() {
    return this.$successorsBinding
  }

  set successorsBinding(value) {
    this.$successorsBinding = value
  }

  /**
     Gets or sets a binding that maps node objects to their predecessors.
     This maps an object that represents a node to a set of other objects that represent its predecessor nodes, i.e. other
     nodes connected with an incoming edge.
  
     If a {@link SimpleAdjacentNodesGraphBuilder.nodeIdBinding} is set, the returned objects must be the IDs of node objects instead of the node objects themselves.
  
     The binding can either be a plain JavaScript function, a String, `null`, or an array which contains the same types
     recursively. A function is called with the business object to convert as first and only parameter, and the function's `this`
     is set to the business object, too.
  
     @see SimpleAdjacentNodesGraphBuilder#nodesSource
     @see SimpleAdjacentNodesGraphBuilder#successorsBinding
     @see SimpleAdjacentNodesGraphBuilder#nodeIdBinding
     @see SimpleAdjacentNodesGraphBuilder */
  get predecessorsBinding() {
    return this.$predecessorsBinding
  }

  set predecessorsBinding(value) {
    this.$predecessorsBinding = value
  }

  /**
     Adds the given listener for the `NodeCreated` event that occurs when a node has been created.
     This event can be used to further customize the created node.
  
     New nodes are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, or in response
     to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder.nodesSource}.
  
     @param listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#setNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  setNodeCreatedListener(listener) {
    this.$graphBuilderHelper.setNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `NodeCreated` event that occurs when a node has been created.
     This event can be used to further customize the created node.
  
     New nodes are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, or in response
     to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder.nodesSource}.
  
     @param listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#setNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#setNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeNodeCreatedListener(listener) {
    this.$graphBuilderHelper.removeNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `NodeUpdated` event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder.setNodeCreatedListener NodeCreated}.
  
     Nodes are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} for items that haven't
     been added anew in {@link SimpleAdjacentNodesGraphBuilder.nodesSource} since the last call to {@link SimpleAdjacentNodesGraphBuilder.buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
  
     @param listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#setNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  setNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.setNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `NodeUpdated` event that occurs when a node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder.setNodeCreatedListener NodeCreated}.
  
     Nodes are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} for items that haven't
     been added anew in {@link SimpleAdjacentNodesGraphBuilder.nodesSource} since the last call to {@link SimpleAdjacentNodesGraphBuilder.buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
  
     @param listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#setNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#setNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeNodeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the `EdgeCreated` event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
  
     New edges are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, or in response
     to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder.successorsBinding}.
  
     @param listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#addEdgeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeEdgeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  addEdgeCreatedListener(listener) {
    this.$graphBuilderHelper.setEdgeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `EdgeCreated` event that occurs when an edge has been created.
     This event can be used to further customize the created edge.
  
     New edges are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, or in response
     to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder.successorsBinding}.
  
     @param listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#addEdgeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeEdgeCreatedListener(listener) {
    this.$graphBuilderHelper.removeEdgeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `EdgeUpdated` event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder.setEdgeCreatedListener EdgeCreated}.
  
     Edges are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} for items that haven't
     been added anew in {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder.successorsBinding} since the last call to {@link SimpleAdjacentNodesGraphBuilder.buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
  
     Depending on how the source data is structured, this event can be raised during
     {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, or multiple times for the same edge during
     {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
  
     @param listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeEdgeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  addEdgeUpdatedListener(listener) {
    this.$graphBuilderHelper.setEdgeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `EdgeUpdated` event that occurs when an edge has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder.setEdgeCreatedListener EdgeCreated}.
  
     Edges are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} for items that haven't
     been added anew in {@link SimpleAdjacentNodesGraphBuilder.predecessorsBinding} or {@link SimpleAdjacentNodesGraphBuilder.successorsBinding} since the last call to {@link SimpleAdjacentNodesGraphBuilder.buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
  
     Depending on how the source data is structured, this event can be raised during
     {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, or multiple times for the same edge during
     {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
  
     @param listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#addEdgeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#addEdgeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeEdgeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeEdgeUpdatedListener(listener)
  }

  /**
     Adds the given listener for the `GroupNodeCreated` event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
  
     New group nodes are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, or in
     response to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder.groupsSource}.
  
     @param listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#setGroupNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeGroupNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  setGroupNodeCreatedListener(listener) {
    this.$graphBuilderHelper.setGroupNodeCreatedListener(listener)
  }

  /**
     Removes the given listener for the `GroupNodeCreated` event that occurs when a group node has been created.
     This event can be used to further customize the created group node.
  
     New group nodes are created either in response to calling {@link SimpleAdjacentNodesGraphBuilder.buildGraph}, or in
     response to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} when there are new items in {@link SimpleAdjacentNodesGraphBuilder.groupsSource}.
  
     @param listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#setGroupNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder#setGroupNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeGroupNodeCreatedListener(listener) {
    this.$graphBuilderHelper.removeGroupNodeCreatedListener(listener)
  }

  /**
     Adds the given listener for the `GroupNodeUpdated` event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder.setGroupNodeCreatedListener GroupNodeCreated}.
  
     Group nodes are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} for items that
     haven't been added anew in {@link SimpleAdjacentNodesGraphBuilder.groupsSource} since the last call to {@link SimpleAdjacentNodesGraphBuilder.buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
  
     @param listener The listener to add.
     @see SimpleAdjacentNodesGraphBuilder#setGroupNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#removeGroupNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  setGroupNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.setGroupNodeUpdatedListener(listener)
  }

  /**
     Removes the given listener for the `GroupNodeUpdated` event that occurs when a group node has been updated.
     This event can be used to update customizations added in an event handler for
     {@link SimpleAdjacentNodesGraphBuilder.setGroupNodeCreatedListener GroupNodeCreated}.
  
     Group nodes are updated in response to calling {@link SimpleAdjacentNodesGraphBuilder.updateGraph} for items that
     haven't been added anew in {@link SimpleAdjacentNodesGraphBuilder.groupsSource} since the last call to {@link SimpleAdjacentNodesGraphBuilder.buildGraph} or
     {@link SimpleAdjacentNodesGraphBuilder.updateGraph}.
  
     @param listener The listener to remove.
     @see SimpleAdjacentNodesGraphBuilder#setGroupNodeCreatedListener
     @see SimpleAdjacentNodesGraphBuilder#setGroupNodeUpdatedListener
     @see SimpleAdjacentNodesGraphBuilder */
  removeGroupNodeUpdatedListener(listener) {
    this.$graphBuilderHelper.removeGroupNodeUpdatedListener(listener)
  }
}

class GraphBuilderHelper {
  $graph
  $eventSender
  $builderCreateNode
  $builderUpdateNode
  $builderCreateGroupNode
  $builderUpdateGroupNode
  $builderCreateEdge
  $builderUpdateEdge

  nodeLabelBinding
  locationXBinding
  locationYBinding
  groupBinding
  edgeLabelBinding
  groupIdBinding
  groupLabelBinding
  parentGroupBinding
  nodeIdBinding

  locationXProvider
  locationYProvider
  nodeLabelProvider
  groupLabelProvider
  edgeLabelProvider

  $edgeUpdatedListeners
  $nodeCreatedListeners
  $nodeUpdatedListeners
  $groupCreatedListeners
  $groupUpdatedListeners
  $edgeCreatedListeners

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

  createEdge(graph, source, target, labelData, edgeObject) {
    if (source == null || target == null) {
      // early exit if source or target node doesn't exist
      return null
    }
    const edge = graph.createEdge(source, target, graph.edgeDefaults.getStyleInstance(), edgeObject)
    if (labelData != null) {
      graph.addLabel({ owner: edge, text: labelData.toString(), tag: labelData })
    }
    return this.$onEdgeCreated(edge, edgeObject)
  }

  createGroupNode(graph, labelData, groupObject) {
    const nodeDefaults = graph.groupNodeDefaults
    const groupNode = graph.createGroupNode(
      null,
      new Rect(Point.ORIGIN, nodeDefaults.size),
      nodeDefaults.getStyleInstance(),
      groupObject
    )
    if (labelData != null) {
      this.$graph.addLabel({ owner: groupNode, text: labelData.toString(), tag: labelData })
    }
    return this.$onGroupCreated(groupNode, groupObject)
  }

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
        this.$graph.addLabel({ owner: node, text: labelData.toString(), tag: labelData })
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

  updateEdge(graph, edge, labelData, edgeObject) {
    if (edge.tag !== edgeObject) {
      edge.tag = edgeObject
    }
    GraphBuilderHelper.$updateLabels(graph, graph.edgeDefaults.labels, edge, labelData)
    this.$onEdgeUpdated(edge, edgeObject)
  }

  updateGroupNode(graph, groupNode, labelData, groupObject) {
    if (groupNode.tag !== groupObject) {
      groupNode.tag = groupObject
    }
    GraphBuilderHelper.$updateLabels(graph, graph.nodeDefaults.labels, groupNode, labelData)
    this.$onGroupUpdated(groupNode, groupObject)
  }

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

  static $updateLabels(graph, labelDefaults, item, labelData) {
    const labels = item.labels
    if (typeof labelData === 'undefined' || labelData === null) {
      while (labels.size > 0) {
        graph.remove(labels.get(labels.size - 1))
      }
    } else if (labels.size === 0) {
      graph.addLabel({
        owner: item,
        text: labelData.toString(),
        layoutParameter: labelDefaults.getLayoutParameterInstance(item),
        style: labelDefaults.getStyleInstance(item),
        tag: labelData
      })
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

  getBusinessObject(item) {
    return item.tag
  }

  getEdge(businessObject) {
    return this.$graph.edges.find((e) => e.tag === businessObject)
  }

  getGroup(groupObject) {
    return this.$graph.nodes.find((n) => n.tag === groupObject)
  }

  getNode(nodeObject) {
    return this.$graph.nodes.find((n) => n.tag === nodeObject)
  }

  static createIdProvider(binding) {
    if (binding === null || binding === undefined) {
      return null
    } else if (typeof binding === 'string') {
      return (dataItem) => dataItem[binding]
    } else {
      return binding
    }
  }

  static createBinding(binding) {
    if (binding === undefined || binding === null) {
      return null
    } else if (typeof binding === 'string') {
      return (dataItem) => dataItem[binding]
    } else {
      return binding
    }
  }

  createNodeCreator() {
    class SimpleGraphBuilderNodeCreator extends NodeCreator {
      $graphBuilder

      constructor(graphBuilder) {
        super()
        this.$graphBuilder = graphBuilder
      }

      createNode(graph, parent, dataItem) {
        const location = this.$getLocation(dataItem, Point.ORIGIN)
        const labelData = this.$getLabelData(dataItem)
        const nodeObject = this.$getNodeObject(dataItem)
        return this.$graphBuilder.$builderCreateNode(graph, parent, location, labelData, nodeObject)
      }

      updateNode(graph, node, parent, dataItem) {
        const location = this.$getLocation(dataItem, node.layout.topLeft)
        const labelData = this.$getLabelData(dataItem)
        const nodeObject = this.$getNodeObject(dataItem)
        this.$graphBuilder.$builderUpdateNode(graph, node, parent, location, labelData, nodeObject)
      }

      $getNodeObject(dataItem) {
        if (this.tagProvider) {
          return this.tagProvider(dataItem)
        }
        return dataItem
      }

      $getLabelData(dataItem) {
        return this.$graphBuilder.nodeLabelProvider
          ? this.$graphBuilder.nodeLabelProvider(dataItem)
          : null
      }

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

  createGroupCreator() {
    class SimpleGraphBuilderGroupCreator extends NodeCreator {
      $graphBuilder

      constructor(graphBuilder) {
        super()
        this.$graphBuilder = graphBuilder
      }

      createNode(graph, parent, dataItem) {
        const labelData = this.$getLabelData(dataItem)
        const nodeObject = this.$getNodeObject(dataItem)
        const node = this.$graphBuilder.$builderCreateGroupNode(graph, labelData, nodeObject)
        graph.setParent(node, parent)
        return node
      }

      updateNode(graph, node, parent, dataItem) {
        const labelData = this.$getLabelData(dataItem)
        const nodeObject = this.$getNodeObject(dataItem)
        this.$graphBuilder.$builderUpdateGroupNode(graph, node, labelData, nodeObject)
        if (graph.getParent(node) !== parent) {
          graph.setParent(node, parent)
        }
      }

      $getNodeObject(dataItem) {
        if (this.tagProvider) {
          return this.tagProvider(dataItem)
        }
        return dataItem
      }

      $getLabelData(dataItem) {
        return this.$graphBuilder.groupLabelProvider
          ? this.$graphBuilder.groupLabelProvider(dataItem)
          : null
      }
    }

    return new SimpleGraphBuilderGroupCreator(this)
  }

  createEdgeCreator(labelDataFromSourceAndTarget = false) {
    class SimpleGraphBuilderEdgeCreator extends EdgeCreator {
      $graphBuilder
      $labelDataFromSourceAndTarget

      constructor(graphBuilder, labelDataFromSourceAndTarget) {
        super()
        this.$graphBuilder = graphBuilder
        this.$labelDataFromSourceAndTarget = labelDataFromSourceAndTarget
      }

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

      updateEdge(graph, edge, dataItem) {
        const labelData = this.$getLabelData(dataItem, edge.sourceNode, edge.targetNode)
        const edgeObject = this.$getEdgeObject(dataItem)
        this.$graphBuilder.$builderUpdateEdge(graph, edge, labelData, edgeObject)
      }

      $getEdgeObject(dataItem) {
        if (this.tagProvider) {
          return this.tagProvider(dataItem)
        }
        return dataItem
      }

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

  static setEventListener(listeners, listener) {
    listeners.push(listener)
  }

  static $removeEventListener(listeners, listener) {
    const index = listeners.indexOf(listener)
    if (index >= 0) {
      listeners.splice(index, 1)
    }
  }

  $fireEvent(listeners, evt) {
    listeners.forEach((l) => l(this.$eventSender, evt))
  }

  $onNodeCreated(node, dataItem) {
    if (this.$nodeCreatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, node, dataItem)
      this.$fireEvent(this.$nodeCreatedListeners, evt)
      return evt.item
    }
    return node
  }

  $onNodeUpdated(node, dataItem) {
    if (this.$nodeUpdatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, node, dataItem)
      this.$fireEvent(this.$nodeUpdatedListeners, evt)
      return evt.item
    }
    return node
  }

  $onGroupCreated(group, dataItem) {
    if (this.$groupCreatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, group, dataItem)
      this.$fireEvent(this.$groupCreatedListeners, evt)
      return evt.item
    }
    return group
  }

  $onGroupUpdated(group, dataItem) {
    if (this.$groupUpdatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, group, dataItem)
      this.$fireEvent(this.$groupUpdatedListeners, evt)
      return evt.item
    }
    return group
  }

  $onEdgeCreated(edge, dataItem) {
    if (this.$edgeCreatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, edge, dataItem)
      this.$fireEvent(this.$edgeCreatedListeners, evt)
      return evt.item
    }
    return edge
  }

  $onEdgeUpdated(edge, dataItem) {
    if (this.$edgeUpdatedListeners.length > 0) {
      const evt = new SimpleGraphBuilderItemEventArgs(this.$graph, edge, dataItem)
      this.$fireEvent(this.$edgeUpdatedListeners, evt)
      return evt.item
    }
    return edge
  }

  setNodeCreatedListener(listener) {
    GraphBuilderHelper.setEventListener(this.$nodeCreatedListeners, listener)
  }

  removeNodeCreatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$nodeCreatedListeners, listener)
  }

  setNodeUpdatedListener(listener) {
    GraphBuilderHelper.setEventListener(this.$nodeUpdatedListeners, listener)
  }

  removeNodeUpdatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$nodeUpdatedListeners, listener)
  }

  setEdgeCreatedListener(listener) {
    GraphBuilderHelper.setEventListener(this.$edgeCreatedListeners, listener)
  }

  removeEdgeCreatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$edgeCreatedListeners, listener)
  }

  setEdgeUpdatedListener(listener) {
    GraphBuilderHelper.setEventListener(this.$edgeUpdatedListeners, listener)
  }

  removeEdgeUpdatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$edgeUpdatedListeners, listener)
  }

  setGroupNodeCreatedListener(listener) {
    GraphBuilderHelper.setEventListener(this.$groupCreatedListeners, listener)
  }

  removeGroupNodeCreatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$groupCreatedListeners, listener)
  }

  setGroupNodeUpdatedListener(listener) {
    GraphBuilderHelper.setEventListener(this.$groupUpdatedListeners, listener)
  }

  removeGroupNodeUpdatedListener(listener) {
    GraphBuilderHelper.$removeEventListener(this.$groupUpdatedListeners, listener)
  }
}

function compose(f1, f2) {
  if (f2 && f1) {
    return (a) => f1(f2(a))
  }
  return null
}
