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
# Hierarchical Nesting (Incremental) Demo

<img src="../../../doc/demo-thumbnails/hierarchical-nesting-incremental.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/hierarchical-nesting-incremental/).

This demo shows how to nicely lay out the newly loaded nodes when expanding folded groups in graph.

Each time a folded group is expanded for the first time, all of its child nodes are retrieved and then marked as incremental using [HierarchicalLayoutData.incrementalNodes](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#incrementalNodes). The [from sketch mode](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout#fromSketchMode) of the layout algorithm then ensures that the currently visible part of the graph is well-organized while remaining similar to the previous arrangement.

## Things to Try

- Expand or collapse a group node with the `+` or `-` button.

## Demos

See the [Hierarchical Nesting Demo](../../layout/hierarchical-nesting/) for a hierarchical nested graph built on a pre-defined set of nodes without subsequent node retrieval.
