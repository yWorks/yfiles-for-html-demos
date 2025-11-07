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
# Folding

<img src="../../../doc/demo-thumbnails/folding.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/folding/).

This demo shows how to enable collapsing and expanding of group nodes, the so-called [Folding](https://docs.yworks.com/yfileshtml/#/dguide/folding) feature. This is provided through the [FoldingManager](https://docs.yworks.com/yfileshtml/#/api/FoldingManager) class and its support classes.

The [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) class provides the following interactive gestures for collapsing and expanding groups:

- Close (collapse) a selected open group node by pressing Alt + ← or clicking the expand icon in the group's top left corner.
- Open (expand) a selected closed group node by pressing Alt + → or clicking the collapse icon in the node's top left corner.
- Enter (navigate into) a selected group node by pressing Alt + ↓.
- Exit (navigate out of) a selected group node by pressing Alt + ↑.

## Demos

- [Folding With Merged Edges Demo](../../application-features/folding-with-merged-edges/)
- [Folding With Layout Demo](../../layout/foldingwithlayout/)
- [Filtering With Folding Demo](../../application-features/filtering-with-folding/)
- [Hierarchical Nesting Demo](../../layout/hierarchical-nesting/)
- [Hierarchical Nesting (Incremental) Demo](../../layout/hierarchical-nesting-incremental/)

## Documentation

- [Folding](https://docs.yworks.com/yfileshtml/#/dguide/folding)
- [FoldingManager](https://docs.yworks.com/yfileshtml/#/api/FoldingManager) class
