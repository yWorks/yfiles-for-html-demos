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
# Valid Begin Cursors Demo

<img src="../../../doc/demo-thumbnails/valid-begin-cursors.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/valid-begin-cursors/).

The demo exhibits a [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) where graph editing is configured to show different cursors depending on which gesture is valid to begin at the current location considering the currently pressed modifiers.

Some input modes were configured to only begin when a specific modifier is pressed to distinguish which gesture should start.

## Things to try

- **Move the viewport** by pressing Ctrl while hovering on an empty location on the canvas. Its valid beginning is indicated by [Cursor.GRAB](https://docs.yworks.com/yfileshtml/#/api/Cursor#GRAB)
- **Start lasso selection** by pressing Alt while hovering on an empty location on the canvas. Its valid beginning is indicated by a custom lasso cursor. Pressing Shift or Ctrl during the lasso gesture will switch between subtract- and extend-selection mode respectively, indicated by a '-' or '+' symbol on the cursor.
- **Start marquee selection** when neither Shift nor Ctrl is pressed while hovering on an empty location on the canvas. Its valid beginning is indicated by [Cursor.CROSSHAIR](https://docs.yworks.com/yfileshtml/#/api/Cursor#CROSSHAIR). Pressing Shift or Ctrl during the marquee gesture will switch between subtract- and extend-selection mode respectively, indicated by a '-' or '+' symbol on the cursor.
- **Create a new edge** by pressing Ctrl while hovering on an unselected node. Its valid beginning is indicated by a custom create-edge cursor.
- **Move a node** when Ctrl is **not** pressed while hovering on a selected or unselected node. Its valid beginning is indicated by [Cursor.MOVE](https://docs.yworks.com/yfileshtml/#/api/Cursor#MOVE).
- **Show tooltips** when hovering on an edge for a second. Hovering over a location where a tooltip may be displayed is indicated by [Cursor.HELP](https://docs.yworks.com/yfileshtml/#/api/Cursor#HELP).
