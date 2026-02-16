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
# Valid Begin Cursors

<img src="../../../doc/demo-thumbnails/valid-begin-cursors.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/valid-begin-cursors/).

This demo illustrates how the mouse cursor dynamically changes within a [GraphComponent](https://docs.yworks.com/yfileshtml/api/GraphComponent) to signal which interactive action (e.g., move, select, create) can be initiated at the current pointer location.

## Things to Try

- **Move the Viewport:** Press Ctrl while hovering over an empty canvas area. The cursor changes to [GRAB](https://docs.yworks.com/yfileshtml/api/Cursor#GRAB).
- **Lasso Select:** Begin a lasso selection by holding Alt over an empty area. The cursor becomes a custom lasso icon. During selection, Shift or Ctrl modifies the cursor to include + (add to selection) or \- (subtract from selection), respectively.
- **Marquee Select:** Perform a rectangular selection by dragging over an empty area _without_ Ctrl or Alt held. The cursor displays as [CROSSHAIR](https://docs.yworks.com/yfileshtml/api/Cursor#CROSSHAIR). Similar to lasso, Shift and Ctrl modify the cursor for + (add) or \- (subtract) selection.
- **Create Edge:** Hold Ctrl and hover over an unselected node. The cursor indicates valid edge creation with a custom icon.
- **Move Node:** Hover over any node _without_ Ctrl pressed. The cursor changes to [MOVE](https://docs.yworks.com/yfileshtml/api/Cursor#MOVE), indicating you can drag the node.
- **Show Tooltip:** Hover over an edge for a second. The cursor changes to [HELP](https://docs.yworks.com/yfileshtml/api/Cursor#HELP) to indicate that a tooltip can be displayed.
