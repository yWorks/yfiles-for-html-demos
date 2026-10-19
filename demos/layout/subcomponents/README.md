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
# Hierarchical Subcomponents Demo – yFiles for HTML

<img src="../../../doc/demo-thumbnails/hierarchical-subcomponents.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/subcomponents/).

This demo shows how hierarchical layout can arrange selected subcomponents of a graph with different layout styles.

Available styles are tree, organic, or orthogonal style, or a hierarchical style with different settings than the main layout.

The subcomponent placement policy defines how subcomponents are placed within the layout context of the remaining graph. If subcomponents are connected with a single node (light blue and green subcomponents) then the layout is able to place them to the left or right of this node.

## Things to Try

- Create a new subcomponent that gets an individual layout by selecting some nodes, choose a layout algorithm and style, and hit add\_circle. Then the new subcomponent is marked with a color and the layout is updated.
- Remove nodes from subcomponents. Select some nodes and press do\_not\_disturb\_on. Those nodes are removed from their subcomponents.
- Add nodes and edges to the graph and update the layout by clicking on the layout button in the toolbar. Note that the layout only changes if the graph was modified.
