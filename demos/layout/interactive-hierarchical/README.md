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
# Interactive Hierarchical Layout Demo

<img src="../../../doc/demo-thumbnails/interactive-hierarchical-layout.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/interactive-hierarchical/).

This demo shows the [from sketch mode](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout#fromSketch) of the hierarchical layout. Each user action triggers a run of this layout style to ensure that the current state of the graph is always well-organized but remains still similar to the previous arrangement.

The layers of the layout are visualized in the background of the graph.

## Things to Try

- Move and resize nodes and watch the layout update. During moves the target layer is indicated.
- Create edges and see the routes being recalculated immediately.
- Create new nodes and observe how they are inserted into the drawing near the place they have been created.
- Drag the first and last bend (or create one) of an edge to interactively assign or reset port candidates.
- Use the context menu to reroute selected edges or optimize selected node locations.
