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
# Layout Grid Demo

<img src="../../../doc/demo-thumbnails/layout-grid.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/layoutgrid/).

This demo application lets you experience the usage of a [LayoutGrid](https://docs.yworks.com/yfileshtml/api/LayoutGrid) for hierarchical and organic layout calculations.

Nodes are assigned to columns/rows by their fill color (gray nodes are unassigned) and the calculated layout grid is visualized after a layout run to show the effect of the node assignment to the layout.

## Things to Try

- Click the Hierarchical or Organic button of the toolbar to trigger the corresponding layout algorithm based on the current node assignment. Note that, the Organic layout does not support stretching of a group node if it contains child nodes assigned to different rows or columns. In this case, the Organic layout button will be disabled.
- Change the layout cell of a (non-gray) node by moving it to a different layout cell. For the gray nodes that do not have currently active restrictions, select the desired ones and press the ![](resources/grid-16.svg) -button from the toolbar to add restrictions based on their current location. Then, move them to other layout cells, if desired. Nodes that are positioned outside the layout grid do not receive a restriction.
- Add/remove active restrictions to/from the selected nodes, using buttons ![](resources/grid-16.svg) or ![](../../demo-app/icons/delete2-16.svg) of the toolbar.
- Configure the layout grid using the settings panel on the right.
- Remove a row/column from the layout grid, by right-clicking on a cell that belongs to the desired row/column and use the "Delete Row" or "Delete Column" of the settings panel on the right.
