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
# Graph Editor Demo

<img src="../../../doc/demo-thumbnails/graph-editor.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/view/grapheditor/).

The Simple Editor demo exhibits a [GraphComponent](https://docs.yworks.com/yfileshtml/api/GraphComponent) which enables graph editing via the default [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/api/GraphEditorInputMode).

#### Creating Elements (Nodes / Vertices)

Click on an empty location on the canvas.

#### Creating Connections (Edges / Links)

To begin creating an edge, hover over the source node to show the ports (by default, there is only a single port at the node center). Press the left mouse button on the displayed port, and start dragging. Complete the edge creation by releasing the mouse button over a target node. Abort edge creation by pressing the Esc key.

#### Creating Control Points (Bends)

You can create control points during edge creation. While dragging from the source node, release the mouse button and click on an empty spot of the canvas to create a control point there. Undo control point creation with right-click.

Control points can also be added to existing edges. Drag an edge at the desired location to create a bend there.

#### Creating and Editing Labels

Press the F2 key while an element or connection is selected, or double click on an element or connection.

#### Panning and Zooming

- Scroll the graph horizontally by scrolling the mouse wheel with the Shift key held down.
- Scroll the graph vertically by scrolling the mouse wheel with the Ctrl key held down.
- Move the diagram view by dragging the mouse with the Ctrl key held down. Start dragging on an empty location on the canvas.
- Change the zoom factor with the mouse wheel or the buttons in the toolbar. Display the entire diagram using the button in the toolbar.

#### Selection

- Select all objects by pressing Ctrl + A.
- Select a single object by clicking on it.
- Select multiple objects by dragging the mouse over the canvas and enclosing all desired elements within the selection rectangle. Or use the Ctrl key when clicking on a node to add it to an existing selection.
- Deselect all items by clicking on an empty part of the canvas.

#### Moving Items

- Drag an item to move it to a new location.
- To move multiple objects at once, first select all of them and then drag.

#### Removing Items

Press the Delete key to remove all currently-selected items, or use the button in the toolbar.

#### Resizing Elements

Select a node, then drag one of the resizing handles to change the size.

- Hold Shift to keep the aspect ratio for any node.
- Hold Alt to resize around the node's center.

#### Clipboard

- Cut selected elements by pressing Ctrl + X.
- Copy selected elements to the clipboard by pressing Ctrl + C.
- Paste the clipboard's contents into the diagram by pressing Ctrl + V.

There are also buttons in the toolbar for clipboard operations.

#### Undo/Redo

- Undo edit operations by pressing Ctrl + Z.
- Redo undone operations by pressing Ctrl + Y.

There are also undo and redo buttons in the toolbar.

#### Grouping

- Group selected nodes into a group node by pressing Ctrl + G. A group node sized to the initial contents is created.
- Add or remove a node from the group node by dragging it with the Ctrl key held down. The group which will be the node's parent is indicated by highlighted corners.
- Deleting a group node removes the group node but not its children.

There are also group and ungroup buttons in the toolbar.

#### Collapsing and Expanding Groups

- Collapse an expanded group node by selecting it and pressing Alt + LeftArrow, or by clicking on the '-' button in its top left corner.
- Expand a collapsed group node by selecting it and pressing Alt + RightArrow. or by clicking on the '+' button in its top left corner.

#### Entering and Exiting Groups

- Enter a selected group node by pressing Alt + DownArrow.
- Exit a group node by pressing Alt + UpArrow.

There are also enter group and exit group buttons in the toolbar.

#### Orthogonal Edge Creation

- Switch orthogonal edges on/off using the button in the toolbar.
- Change the outgoing node side by pressing Space while creating an orthogonal edge (before creating a bend).

#### Snapping

- Switch snapping on/off using the button in the toolbar. Drag nodes, edges, and bends near other graph elements to make them snap.
- When snapping is enabled, orthogonal edge segments snap to other graph elements during edge creation.
