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
# Basic Tree Layout - Layout Features

# Basic Tree Layout

This demo shows basic configuration options for the [Tree Layout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout).

- The global [layout orientation](https://docs.yworks.com/yfileshtml/#/api/TreeLayout#layoutOrientation) is changed to left-to-right to get a horizontal tree layout.
- A [DefaultNodePlacer](https://docs.yworks.com/yfileshtml/#/api/DefaultNodePlacer) is specified as placer for the tree nodes, its distance settings are configured to get a rather wide spacing between elements.
- The [port assignment](https://docs.yworks.com/yfileshtml/#/api/TreeLayout#defaultPortAssignment) is configured such that the edges are distributed at the node border and the segments are forced to keep some distance in this example (via [minimumChannelSegmentDistance](https://docs.yworks.com/yfileshtml/#/api/DefaultNodePlacer#minimumChannelSegmentDistance)). By default, the tree layout groups the edge segments and places the ports in the node center.
- Edges from the parent to the child nodes are ordered with respect to the label text of the child nodes by defining an appropriate [edge comparer](https://docs.yworks.com/yfileshtml/#/api/TreeLayoutData#outEdgeComparers) function.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/tree/Tree.ts).

### Demos

- The [Tree Layout Demo](../../layout/tree/index.html) shows complex configurations of [NodePlacer](https://docs.yworks.com/yfileshtml/#/api/NodePlacer) instances to further customize the node placement.
- More features of the tree layout and supported use cases are shown in the [Layout Styles: Tree Demo](../../showcase/layoutstyles/index.html?layout=tree&sample=tree).

### Documentation

The Developer's Guide provides more in-depth information about the [Tree Layout](https://docs.yworks.com/yfileshtml/#/dguide/tree_layout) provided by yFiles.
