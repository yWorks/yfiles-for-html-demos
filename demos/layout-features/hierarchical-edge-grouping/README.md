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
# Hierarchical Layout with Edge Grouping

<img src="../../../doc/demo-thumbnails/layout-hierarchical-edge-grouping.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-edge-grouping/).

This demo shows how to customize the [HierarchicalLayout](https://docs.yworks.com/yfileshtml/api/HierarchicalLayout) to group edges at their source or target nodes.

An alternative: [automaticEdgeGrouping](https://docs.yworks.com/yfileshtml/api/HierarchicalLayout#automaticEdgeGrouping).

## Edge Grouping

The layout is configured such that:

- All edges starting from node 0 are grouped at their source side
- All edges ending at node 5 are grouped at their target side

The default hierarchical layout without edge grouping will place each edge individually.

## Things to Try

Click the button in the toolbar to toggle between hierarchical layout with and without edge grouping.

## Documentation

- [Edge Grouping](https://docs.yworks.com/yfileshtml/dguide/hierarchical_layout-edge_grouping)
- [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/api/HierarchicalLayoutData)
- [automaticEdgeGrouping](https://docs.yworks.com/yfileshtml/api/HierarchicalLayout#automaticEdgeGrouping)
