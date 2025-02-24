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
# Lasso Selection Demo

<img src="../../../doc/demo-thumbnails/lasso-selection.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/input/lassoselection/).

This demo shows how to configure [LassoSelectionInputMode](https://docs.yworks.com/yfileshtml/#/api/LassoSelectionInputMode) for lasso selection mode. In this mode, graph items can be selected by dragging a lasso line around them.

## Things to Try

- Switch between the selection styles:
  - Free-hand lasso selection will create a curved line while dragging and select the items when releasing the mouse button
  - Polyline lasso selection will start a segment while dragging and create a bend when releasing the mouse button. The selection is finished when the mouse button is released within the radius around the start point or on double-click.
  - Marquee selection is the default selection style in _yFiles for HTML_. It is used as a reference here.
- Adjust the finish radius: When the mouse-button is released at the start point, the selection is finished. The finish radius determines how close to the start point this must happen.
- Select different conditions to select nodes:
  - Select Intersected Nodes: Nodes will end up in the selection if the lasso contains or at least intersects with their layout.
  - Select Complete Nodes: Nodes will only be selected if the lasso completely contains them.
  - Select Node's Center: The selection will only contain nodes whose center is inside the lasso line.

Note that on touch devices the selection gesture starts with a long press.
