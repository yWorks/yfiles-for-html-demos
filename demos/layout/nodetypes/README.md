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
# Node Types Demo

<img src="../../../doc/demo-thumbnails/node-types.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/nodetypes/).

This demo shows how different layout algorithms handle nodes that are associated with some specific types, see the Developer's Guide section on [Layout with Custom Node Types](https://docs.yworks.com/yfileshtml/#/dguide/node_types). In this example application, nodes with same color are considered to be of the same type.

The type is generally treated as a secondary, subordinate optimization criterion. Thus, nodes of the same type are usually not simply clustered together. The type is only considered when some free choice is available after considering other constraints relevant to the specific layout algorithm (like minimizing the number of crossings or considering the hierarchical grouping structure).

## Things to Try

- Use the combo box to choose a specific layout algorithm. This automatically loads a suitable example graph. The graph is arranged twice with and without considering node types to show how different the algorithm behaves when node types are considered.
- Modify the graph by adding new elements or changing the type of existing nodes via the context menu and observe the effect on the layout. The context menu can be accessed by clicking on a node.
