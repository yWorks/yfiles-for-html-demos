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
# Tree Layout with Subtree Placers - Layout Features

<img src="../../../doc/demo-thumbnails/layout-tree-node-placers.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/tree-node-placers/).

This demo shows how to use [subtree placers](https://docs.yworks.com/yfileshtml/#/api/ISubtreePlacer) with the [Tree Layout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout). A subtree placer is responsible for the arrangement of a local root node and all of its subtrees.

yFiles comes with predefined subtree placers that provide a variety of subtree arrangement schemes. This example uses three of them:

- Node 1 uses a [LayeredSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/LayeredSubtreePlacer), that places child nodes with the same depth in the tree in the same horizontal layer.
- Node 2 uses a [LeftRightSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/LeftRightSubtreePlacer), that places child nodes left and right of a single vertical bus.
- Node 6 uses a [DoubleLineSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/DoubleLineSubtreePlacer), that places child nodes in two horizontal lines.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/tree-node-placers/SubtreePlacers.ts).

### Demos

See the [Tree Layout Demo](../../layout/tree/) for mode extensive examples of subtree placers.

### Documentation

See the [Tree Layout](https://docs.yworks.com/yfileshtml/#/dguide/tree_layout) section in the Developer's Guide for an in-depth discussion of the relevant concepts.
