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
# Basic Tree Layout - Layout Features

<img src="../../../doc/demo-thumbnails/layout-tree.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/layout-features/tree/).

This demo shows basic configuration options for the [Tree Layout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout).

- The global [layout orientation](https://docs.yworks.com/yfileshtml/#/api/TreeLayout#layoutOrientation) is changed to left-to-right to get a horizontal tree layout.
- A [DefaultSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/DefaultSubtreePlacer) is specified as placer for the tree nodes, its distance settings are configured to get a rather wide spacing between elements.
- The [port assignment](https://docs.yworks.com/yfileshtml/#/api/TreeLayout#defaultPortAssignmer) is configured such that the edges are distributed at the node border and the segments are forced to keep some distance in this example (via [minimumChannelSegmentDistance](https://docs.yworks.com/yfileshtml/#/api/DefaultSubtreePlacer#minimumChannelSegmentDistance)). By default, the tree layout groups the edge segments and places the ports in the node center.
- Edges from the parent to the child nodes are ordered with respect to the label text of the child nodes by defining an appropriate [edge comparer](https://docs.yworks.com/yfileshtml/#/api/TreeLayoutData#outEdgeComparers) function.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/tree/Tree.ts).

### Demos

- The [Tree Layout Demo](../../layout/tree/) shows complex configurations of [ISubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/ISubtreePlacer) instances to further customize the node placement.
- More features of the tree layout and supported use cases are shown in the [Layout Styles: Tree Demo](../../showcase/layoutstyles/index.html?layout=tree&sample=tree).

### Documentation

The Developer's Guide provides more in-depth information about the [Tree Layout](https://docs.yworks.com/yfileshtml/#/dguide/tree_layout) provided by yFiles.
