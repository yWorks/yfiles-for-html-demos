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
# Hierarchical Layout with Compact Groups

<img src="../../../doc/demo-thumbnails/layout-hierarchical-compact-groups.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-compact-groups/).

This demo shows how to configure the [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) and the corresponding [CoordinateAssigner](https://docs.yworks.com/yfileshtml/#/api/CoordinateAssigner) to draw compacter group nodes than default.

## Layer Compaction

The width of group nodes (for left-to-right layouts) can be reduced by enabling [recursive group layering with compaction](https://docs.yworks.com/yfileshtml/#/api/GroupLayeringPolicy#RECURSIVE_COMPACT). This minimizes the number of layers a group spans.

In this demo, you can observe the effect on 'Group 3', which shares its first layer with 'Group 2' when compaction is enabled.

## Vertical (Orthogonal) Compaction

To further compact groups in the direction orthogonal to the main layout flow (i.e., height for left-to-right layouts), adjust these properties:

- Enable [groupCompaction](https://docs.yworks.com/yfileshtml/#/api/CoordinateAssigner#groupCompaction).
- Disable [bendReduction](https://docs.yworks.com/yfileshtml/#/api/CoordinateAssigner#bendReduction) to prioritize compaction over reducing bends.

## Things to Try

Click the button in the toolbar to toggle between hierarchical layout with and without compact groups.

## Documentation

- [Hierarchical Layout](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout)
- [Hierarchical Layout with Groups](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout#hierarchical_layout-grouping)
- [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout)
