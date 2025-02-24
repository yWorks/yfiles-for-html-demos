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
# Split Edges Demo

<img src="../../../doc/demo-thumbnails/split-edges.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/layout/splitedges/).

This demo shows how to use split ids to align edges outside with edges inside a group nodes in [RecursiveGroupLayout](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayout). In [RecursiveGroupLayout](https://docs.yworks.com/yfileshtml/#/api/RecursiveGroupLayout) the routing for inter-edges is sometimes not satisfactory. Inter-edges are edges that connect nodes outside of a group with nodes inside of this group. Since RecursiveGroupLayout routes these edges after the rest of the graph is arranged, they sometimes don't fit into the overall layout style.

In combination with [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout), inter-edges can be replaced with two edges that are aligned at the group node. [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) provides the option that an edge is routed directly from the border of a group nodes to a node inside of this group node instead of leaving the group node first.

## Things to Try

Change the graph and the split ids of the edges and see how the layout changes, too. Edges with split ids are colored different than black.

- Align edges that connect to the same group nodes from the outside and the inside. Select two or more edges that are connected a group and choose 'Align Selected Edges' from the context menu.
- Unalign edges to delete the split ids. Select at least one edge with a split id and choose 'Unalign Selected Edges' from the context menu.
- Select an inter-edge and split it into several edges that connect to the formerly crossed group using the context menu.
- Select an aligned edge and join it with all edges that have the same split id using the context menu.
- Split all inter-edges of a group node with the context menu of the group node.
- Join edges at a group node that share a split id with the context menu of a group node.
- Normal nodes and edges do not provide a context menu.
