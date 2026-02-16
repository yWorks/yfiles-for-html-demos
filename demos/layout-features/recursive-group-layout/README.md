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
# Recursive Group Layout

<img src="../../../doc/demo-thumbnails/layout-recursive-group-layout.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/recursive-group-layout/).

This demo shows how to use the [RecursiveGroupLayout](https://docs.yworks.com/yfileshtml/api/RecursiveGroupLayout) algorithm to apply a specific layout algorithm to the contents (direct children) of each group node.

In this demo, [a different layout algorithm](https://docs.yworks.com/yfileshtml/api/RecursiveGroupLayoutData#groupNodeLayouts) is used for each group node:

- [HierarchicalLayout](https://docs.yworks.com/yfileshtml/api/HierarchicalLayout) for group 1
- [OrganicLayout](https://docs.yworks.com/yfileshtml/api/OrganicLayout) for group 2
- [RadialLayout](https://docs.yworks.com/yfileshtml/api/RadialLayout) for group 3
- [No layout](https://docs.yworks.com/yfileshtml/api/RecursiveGroupLayout#FIX_CONTENT_LAYOUT) for group 4

As the child nodes of group node 4 already have predefined layout values in the graph data, [FIX_CONTENT_LAYOUT](https://docs.yworks.com/yfileshtml/api/RecursiveGroupLayout#FIX_CONTENT_LAYOUT) is used, which only calculates the size of the group node itself and does not alter the layout of its children.

The top-level hierarchy as well as groups without an assigned layout algorithm are arranged with the core layout algorithm.

## Documentation

- [groupNodeLayouts](https://docs.yworks.com/yfileshtml/api/RecursiveGroupLayoutData#groupNodeLayouts)
- [RecursiveGroupLayout](https://docs.yworks.com/yfileshtml/api/RecursiveGroupLayout)
- [RecursiveGroupLayoutData](https://docs.yworks.com/yfileshtml/api/RecursiveGroupLayoutData)
