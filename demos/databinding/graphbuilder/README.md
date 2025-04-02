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
# Graph Builder Demo

<img src="../../../doc/demo-thumbnails/graph-builder.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/databinding/graphbuilder/).

This demo interactively builds and modifies a graph from **JSON** business data using class [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder).

See the the Developer's Guide section on the [GraphBuilder](https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-GraphBuilder) for an in-depth explanation of the relevant concepts.

The demo allows to define multiple nodes and edges sources from different data and with different data bindings and styles.

Per default, [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) stores the business data object of each node in the node's [ITagOwner#tag](https://docs.yworks.com/yfileshtml/#/api/ITagOwner#tag) property. Using the LitNodeStyle, the properties can be bound and visualized.

## Things to Try

- Select a sample in the combo box and inspect its data and sources on the right.
- Click the "Add Source" buttons to add another nodes or edges source.
- Click the "Edit" buttons to modify a source's data, bindings and style.
- Build a graph from your own data and bindings.

## Graph Builder Settings

- While _New Graph_ creates a new graph from the given data, _Update Graph_ adjusts the graph to changed data and keeps nodes and edges whose source objects are still present.
- _Nodes Sources_ contains the data that specifies the graph's nodes sources. You can edit and remove existing nodes sources as well as add new ones.  
  The nodes source can either be an array or another object containing the nodes business data.  
  The nodes visual appearance is configured in the template field and realized using the Lit template node style. See the [Lit Template Node Style Demo](../../style/lit-template-node-style/) for further information.
- _Edges Sources_ contains the data that specifies the graph's edges sources. You can edit and remove existing edges sources as well as add new ones.

Since this demo evaluates the complete data source texts every time a source is edited, _Update Graph_ works as expected only for node data items of primitive type or if the node id binding resolves to primitive ids. Note that this restriction applies only to the demo, not the class [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder).
