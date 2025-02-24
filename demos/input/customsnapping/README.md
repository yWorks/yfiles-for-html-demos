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
# Snapping Demo

<img src="../../../doc/demo-thumbnails/custom-snapping.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/input/customsnapping/).

This demo shows how the snapping feature can be customized.

In addition to the default snapping features, it adds extra snap lines to the bounds of labels, lets the outline of the star shaped nodes snap to grid points, and uses free additional snap lines nodes can snap to.

## Things to Try

- Move the topmost _orange node_ and one of the _star shaped nodes_ around and compare their _different grid snapping behavior_.

  While an orange node only snaps to grid points with its center, a star shaped node snaps with all points of its outline, but then again only to the grid points, not in between.

- Move the _unconnected orange node_ close to an orthogonal node or edge label to snap it to the label's bounds.
- Move an _edge label_ to a non-orthogonal edge segment to disable node snapping for this label. Nodes cannot snap to non-orthogonal labels.
- Move _node and and edge labels_ along their owner's border/path to snap them to other particular positions relative to the owner.
- Move a node close to the _red snap lines_ to snap it to these non-graph elements.
- _Position of a red snap line_ by dragging it around.
