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
# Incremental Hierarchical Layout - Layout Features

<img src="../../../doc/demo-thumbnails/layout-hierarchical-incremental.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-incremental/).

This demo shows how to run the hierarchical layout algorithm on a predefined subset of nodes (and edges) in a graph.

To achieve this, two setup steps are necessary:

First, the algorithm has to be told to work on a subset only. To do so, [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout)'s [from sketch mode](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout#fromSketch) property has to be set to `true`.

Second, the algorithm has to be told which set of nodes (and edges) to rearrange. The class [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData) offers the property [incrementalNodes](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#incrementalNodes) and [incrementalEdges](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#incrementalEdges) for this purpose.

In this demo, the algorithm works on the subset of turquoise nodes only.

Click the button in the toolbar to run the layout and see the effect.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/hierarchical-incremental/HierarchicalIncremental.ts).

### Demos

You can also take a look at more extensive demos that take advantage of this feature:

- [Hierarchical Nesting Demo](../../layout/hierarchical-nesting/)
- [Hierarchical Nesting (Incremental) Demo](../../layout/hierarchical-nesting-incremental/)
- [Interactive Hierarchical Layout Demo](../../layout/interactive-hierarchical/)
- [Decision Tree Demo](../../showcase/decisiontree/)
- [Collapsible Trees Demo](../../view/collapse/)
- [Network Flows Demo](../../analysis/networkflows/)

### Documentation

The Developer's Guide has detailed information about the [hierarchical layout algorithm](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout) in general and about [how to run the algorithm on a subset of nodes](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout-incremental_layout) specifically.
