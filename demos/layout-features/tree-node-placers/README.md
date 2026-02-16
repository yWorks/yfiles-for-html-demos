<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Tree Layout with Subtree Placers

<img src="../../../doc/demo-thumbnails/layout-tree-node-placers.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/tree-node-placers/).

This demo shows how to use [subtree placers](https://docs.yworks.com/yfileshtml/api/ISubtreePlacer) with the [TreeLayout](https://docs.yworks.com/yfileshtml/api/TreeLayout). A subtree placer is responsible for the arrangement of a local root node and all of its subtrees.

yFiles comes with predefined subtree placers that provide a variety of subtree arrangement schemes. This example uses three of them:

- Node 1 uses a [LevelAlignedSubtreePlacer](https://docs.yworks.com/yfileshtml/api/LevelAlignedSubtreePlacer), that places child nodes with the same depth in the tree in the same horizontal layer.
- Node 2 uses a [LeftRightSubtreePlacer](https://docs.yworks.com/yfileshtml/api/LeftRightSubtreePlacer), that places child nodes left and right of a single vertical bus.
- Node 6 uses a [DoubleLayerSubtreePlacer](https://docs.yworks.com/yfileshtml/api/DoubleLayerSubtreePlacer), that places child nodes in two horizontal lines.

## Demos

- [Tree Layout Demo](../../layout/tree/)
- [Layout Styles: Tree Demo](../../showcase/layoutstyles/index.html?layout=tree&sample=tree)

## Documentation

- [Tree layout algorithm](https://docs.yworks.com/yfileshtml/dguide/tree_layout)
- [TreeLayoutData](https://docs.yworks.com/yfileshtml/api/TreeLayoutData)
- [ISubtreePlacer](https://docs.yworks.com/yfileshtml/api/ISubtreePlacer)
