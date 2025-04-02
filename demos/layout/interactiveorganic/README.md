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
# Interactive Organic Layout Demo

<img src="../../../doc/demo-thumbnails/interactive-organic-layout.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/interactiveorganic/).

This demo shows the Interactive Organic layout algorithm. This variant of the general Organic layout algorithm calculates continuous updates for a changing diagram. The Organic layout is a force-directed layout style for multiple purposes.

The layout calculations run in a separate web worker thread so the UI remains reactive.

The node style and the edge style in this demo use canvas rendering for performance reasons.

## Things to Try

- Select nodes by clicking them or with the marquee selection.
- Drag one or more selected nodes.
- The organic layout algorithm is automatically applied while dragging and continuously updates the layout.
- Create nodes by clicking on the canvas.
- Connect nodes by dragging from one port candidate (green highlight on node hover) to another.
- Delete selected nodes using the Delete key.
