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
# Tree Map Demo

<img src="../../../doc/demo-thumbnails/tree-map.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/layout/treemap/).

Tree maps allow to visualize hierarchical data using nested rectangles, which in this case are represented by graph nodes. The size of leaf nodes in a tree map is proportional to a certain data value (i.e. weight).

The [TreeMapLayout](https://docs.yworks.com/yfileshtml/#/api/TreeMapLayout) algorithm arranges the nodes according to their weights and relations inside groups.

## Application

A common application for tree maps is the visualization of the file structure on a hard disk. This example shows a tree map of the source code directory of the _yFiles for HTML_ library. The node sizes are defined by the actual file size on disk in bytes.

### Navigate the file hierarchy

For less cluttered graphs, only the children and grandchildren of the current root are visible.

- Move down one hierarchy level by clicking a group/folder. This node becomes the new root and its children and grandchildren will become visible.
- Move up one hierarchy level by clicking the containing group. This parent of this node becomes the new root.
