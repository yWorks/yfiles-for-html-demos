<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Adjacency Graph Builder Demo

# Adjacency Graph Builder Demo

This demo interactively builds and modifies a graph from **JSON** business data using class [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder).

See the the Developer's Guide section on the [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-AdjacencyGraphBuilder) for an in-depth explanation of the relevant concepts.

The demo allows to define nodes sources and edges bindings using the schema graph component on the right. The schema nodes represent nodes sources. The schema edges represent the edge bindings between the nodes sources. The edge arrows indicate the type of the edge. An arrow pointing away from a node indicates outgoing edges to successor nodes. An arrow pointing towards a node indicates incoming edges from predecessor nodes.

## Things to Try

- Select a sample in the combo box and inspect its data and sources on the right.
- Double click on a node in the schema graph and edit the schema nodes' business data.
- Octagonal schema nodes represent nodes sources that provide business data for the result graph structure.
- Circular schema nodes represent nodes sources without own data, that receive data via the edge bindings.
- The schema graph edges and labels define the result graph edge bindings.
- Click on an edge or its label to edit the edge binding.
- Right-click on a schema edge to invert its neighbor type via its context menu.
- Enter an empty edge label content to remove the edge and thus the result graph edge binding.
- Click into the empty space of the schema graph to create a new schema graph node.
- Drag from an existing schema graph node and drop on the empty space to create a new node connected to it.
- Connect existing schema graph nodes by dragging and dropping between them.
- Build a graph from your own data and bindings.

**Note:** This demo shows only parts of the [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder) API. In addition to the functionality available in this demo, the AdjacencyGraphBuilder allows to reference nodes by their ids and edges may be defined by their own edge data items.

Since this demo evaluates the complete data source texts every time a source is edited, _Update Graph_ works as expected only for node data items of primitive type or if the node id binding resolves to primitive ids. Note that this restriction applies only to the demo, not the class [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder).
