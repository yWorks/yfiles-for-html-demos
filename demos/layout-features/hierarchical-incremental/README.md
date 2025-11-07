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
# Incremental Hierarchical Layout

<img src="../../../doc/demo-thumbnails/layout-hierarchical-incremental.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-incremental/).

This demo shows how to run the [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) algorithm on a predefined subset of nodes in a graph.

To achieve this, two setup steps are necessary:

- The algorithm has to be told to work on a subset only. To do so, hierarchical layout's [from sketch mode](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout#fromSketchMode) property has to be set to `true`.
- The algorithm has to know which set of nodes (and edges) to rearrange. The class [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData) offers the [incrementalNodes](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#incrementalNodes)
- and [incrementalEdges](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#incrementalEdges) properties for this purpose.

In this demo, the algorithm is only applied to the **orange nodes**.

## Things to Try

Click the button in the toolbar to run the incremental layout and observe the effect.

## Demos

More demos that make use of this feature:

- [Hierarchical Nesting Demo](../../layout/hierarchical-nesting/)
- [Hierarchical Nesting (Incremental) Demo](../../layout/hierarchical-nesting-incremental/)
- [Interactive Hierarchical Layout Demo](../../layout/interactive-hierarchical/)
- [Decision Tree Demo](../../showcase/decisiontree/)
- [Collapsible Trees Demo](../../view/collapse/)
- [Network Flows Demo](../../analysis/networkflows/)

## Documentation

- [Run hierarchical layout on a subset of nodes](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout-incremental_layout)
- [Hierarchical layout algorithm](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout)
- [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) class
- [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData) class
