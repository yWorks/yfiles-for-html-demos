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
# Hierarchical Layout with Node Alignment

<img src="../../../doc/demo-thumbnails/layout-hierarchical-node-alignment.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-node-alignment/).

This demo shows how to configure the [HierarchicalLayout](https://docs.yworks.com/yfileshtml/api/HierarchicalLayout) to align nodes connected by critical paths.

The priorities are passed to the layout algorithm through the [criticalEdgePriorities](https://docs.yworks.com/yfileshtml/api/HierarchicalLayoutData#criticalEdgePriorities) property, causing the connected nodes to be aligned.

In this demo, edges belonging to the longest path in the graph are designated as critical (see **pink edges**). Of course, any other criterion may be used to define the set of critical edges.

## Things to Try

- Observe how nodes connected by **critical edges** are vertically aligned.
- Notice that the critical edges in this demo are determined by finding the longest path.
- Consider how this technique could be used to highlight key relationships or workflows in your own hierarchical layouts.

## Demos

- [Critical Paths Demo](../../layout/criticalpaths/)

## Documentation

- [Emphasizing critical paths](https://docs.yworks.com/yfileshtml/dguide/hierarchical_layout#hierarchical_layout-emphasizing_critical_paths)
- [HierarchicalLayout](https://docs.yworks.com/yfileshtml/api/HierarchicalLayout)
- [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/api/HierarchicalLayoutData)
