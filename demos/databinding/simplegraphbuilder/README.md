<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Simple Graph Builder Demo

<img src="../../../doc/demo-thumbnails/simple-graph-builder.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/databinding/simplegraphbuilder/).

This demo automatically builds a graph from business data using [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder), [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) or [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder).  
The business data is stored in arrays or in **JSON** format.

The nodes are visualized by a Lit node style instance that binds to the business data objects which [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder), [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) and [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder) store in the graph item's [ITagOwner#tag](https://docs.yworks.com/yfileshtml/#/api/ITagOwner#tag). See the [Lit Template Node Style Demo](../../style/lit-template-node-style/) for further information.

See the the Developer's Guide section on [creating a Graph from Business Data](https://docs.yworks.com/yfileshtml/#/dguide/graph_builder) for an in-depth explanation of the relevant concepts.

Each builder provides a specific set of methods that allow to configure the builder on the given data source.

### GraphBuilder

`createNodesSource`

Registers a data source that represents the nodes.

`createGroupNodesSource`

Registers a data source that represents the group nodes.

`createEdgesSource`

Registers a data source that represent the edges that connect the nodes.

`NodesSource.createChildNodesSource`

Registers a data source that represents the child nodes for a node in the NodesSource.

`NodesSource.createParentNodesSource`

Registers a data source that represents the group node for a node in the NodesSource.

### TreeBuilder

`createRootNodesSource`

Registers a data source that represents the root nodes.

`TreeNodesSource.createChildNodesSource`

Registers a data source as child entities of a [TreeNodesSource](https://docs.yworks.com/yfileshtml/#/api/TreeNodesSource).

`TreeNodesSource.addChildNodesSource`

Binds a collection of child data objects of a [TreeNodesSource](https://docs.yworks.com/yfileshtml/#/api/TreeNodesSource).

### AdjacencyGraphBuilder

`createNodesSource`

Registers a data source that represents the nodes.

`createGroupNodesSource`

Registers a data source that represents the group nodes.

`AdjacencyNodesSource.addPredecessorIds`

Registers a provider for source node IDs to which edges are created.

`AdjacencyNodesSource.addSuccessorIds`

Registers a provider for target node IDs to which edges are created.

### Input Data

The files

- `graph-builder-data.js`
- `graph-builder-with-grouping-data.js`
- `tree-builder-data-array.js`
- `tree-builder-data-json.js`
- `adjacent-builder-id-data-array.js`

show how the data can be specified for the different builders.
