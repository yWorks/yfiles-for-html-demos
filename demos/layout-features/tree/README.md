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
# Basic Tree Layout

<img src="../../../doc/demo-thumbnails/layout-tree.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/tree/).

This demo showcases basic configuration options for the [TreeLayout](https://docs.yworks.com/yfileshtml/api/TreeLayout) algorithm.

It highlights the configuration of various aspects, including:

- Layout [orientation](https://docs.yworks.com/yfileshtml/api/TreeLayout#layoutOrientation) changed to left-to-right for horizontal flow
- [Subtree placer](https://docs.yworks.com/yfileshtml/api/TreeLayout#defaultSubtreePlacer) configuration for wide spacing between elements
- [Port assignment](https://docs.yworks.com/yfileshtml/api/TreeLayout#defaultPortAssigner) configured to distribute edges at node borders
- Edge ordering based on child node label text using [edge comparers](https://docs.yworks.com/yfileshtml/api/TreeLayoutData#childOrder)

## Demos

- [Tree Layout Demo](../../layout/tree/)
- [Layout Styles: Tree Demo](../../showcase/layoutstyles/index.html?layout=tree&sample=tree)

## Documentation

- [Tree layout algorithm](https://docs.yworks.com/yfileshtml/dguide/tree_layout)
- [TreeLayout](https://docs.yworks.com/yfileshtml/api/TreeLayout)
- [TreeLayoutData](https://docs.yworks.com/yfileshtml/api/TreeLayoutData)
