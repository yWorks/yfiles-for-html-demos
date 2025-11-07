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
# Tree Builder Demo

<img src="../../../doc/demo-thumbnails/tree-graph-builder.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/databinding/treebuilder/).

This demo interactively builds and modifies a graph from **JSON** business data using class [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder).

See the Developer's Guide section on the [TreeBuilder](https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-TreeBuilder) for an in-depth explanation of the involved concepts.

See also the [Step Tutorial: Graph Builder](../../tutorial-graph-builder/01-create-graph/) for a step-by-step guide on configuring the [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) class, loading data, and customizing graph visualizations.

The demo allows to define nodes sources and edges bindings using the schema graph component on the right.

## Things to Try

- Select a sample in the combo box and inspect its data and sources on the right.
- Double click on a node in the schema graph and edit the schema nodes' business data.
- Octagonal schema nodes represent root nodes sources that provide business data for the result graph structure and the visual configuration of the root nodes.
- Circular schema nodes represent child nodes sources that provide data for the visual representation of the child nodes.
- The schema graph edges and labels define the result graph edge bindings.
- Click on an edge or its label to edit the edge binding.
- Enter an empty edge label content to remove the edge and thus the result graph edge binding.
- Click into the empty space of the schema graph to create a new schema graph node.
- Drag from an existing schema graph node and drop on the empty space to create a new node connected to it.
- Connect existing schema graph nodes by dragging and dropping between them.
- Build a graph from your own data and bindings.

Since this demo evaluates the complete data source texts every time a source is edited, _Update Graph_ works as expected only for node data items of primitive type or if the node id binding resolves to primitive ids. Note that this restriction applies only to the demo, not the class [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder).
