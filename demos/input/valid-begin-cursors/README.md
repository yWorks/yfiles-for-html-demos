# Valid Begin Cursors Demo

<img src="../../resources/image/valid-begin-cursors.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/input/valid-begin-cursors/index.html).

# Valid Begin Cursor Demo

The demo exhibits a [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) where graph editing is configured to show different cursors depending on which gesture is valid to begin at the current location considering the currently pressed modifiers.

Some input modes were configured to only begin when a specific modifier is pressed to distinguish which gesture should start.

The following gestures have been adjusted:

#### Moving The Viewport

Moving the viewport may begin when Ctrl is pressed while hovering on an empty location on the canvas. Its valid beginning is indicated by [Cursor.GRAB](https://docs.yworks.com/yfileshtml/#/api/Cursor#GRAB).

#### Starting Lasso Selection

Lasso selection may begin when Shift is pressed while hovering on an empty location on the canvas. Its valid beginning is indicated by a custom lasso cursor.

#### Starting Marquee Selection

Marquee selection may begin when neither Shift nor Ctrl is pressed while hovering on an empty location on the canvas. Its valid beginning is indicated by [Cursor.CROSSHAIR](https://docs.yworks.com/yfileshtml/#/api/Cursor#CROSSHAIR).

#### Creating Edges

Edge creation may begin when Ctrl is pressed while hovering on an unselected node. Its valid beginning is indicated by a custom create-edge cursor.

#### Moving Nodes

Moving a node may begin when Ctrl is **not** pressed while hovering on a selected or unselected node. Its valid beginning is indicated by [Cursor.MOVE](https://docs.yworks.com/yfileshtml/#/api/Cursor#MOVE).

#### Show Tooltip

Tooltips are displayed when hovering on an edge for a second. Hovering over a location where a tooltip may be displayed is indicated by [Cursor.HELP](https://docs.yworks.com/yfileshtml/#/api/Cursor#HELP).
