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
# Move Unselected Nodes Demo

<img src="../../../doc/demo-thumbnails/move-unselected-nodes.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/input/moveunselectednodes/).

This demo shows a special input mode that allows you to move nodes without selecting them first.

This is done by enabling the [GraphEditorInputMode#moveUnselectedItemsInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode#moveUnselectedItemsInputMode).

## Things to Try

- Move a node around by dragging the top without selecting the node first. Note that the cursor indicates that the node can be moved.
- Try the different modes provided by the _Move Unselected Nodes_ combo box.
- Try setting the _Edge Creation Mode_ to _At Port Candidates_ and see how it works in conjunction with moving unselected nodes.
- Disable _Move Selected Nodes_ which is the out of the box [MoveInputMode](https://docs.yworks.com/yfileshtml/#/api/MoveInputMode) to move selected nodes. When disabled, only the current _Move Unselected Nodes_ setting is considered, therefore selected nodes may not be draggable.  
  Note that both, the standard and the special move input mode, can be enabled at the same time.

## Move Unselected Settings

The _Move Unselected Nodes_ combo box provides different modes which determine whether a node can be moved.

Always

Nodes can always be moved by dragging them without selecting them first. This is the standard behavior of the special move input mode.

Shift Not Pressed

Nodes cannot be moved if the Shift key is held down while dragging. Instead, this gesture may start edge creation if the _Edge Creation Mode_ is set to default.

Top of Node

Nodes can only be moved when dragged at their top. Note how the cursor changes when you hover over different areas of the node.

If Move Enabled

Nodes can only be moved if the _Move Enabled_ button is activated.

Never

Unselected nodes cannot be moved.

## Edge Creation Settings

The _Edge Creation Mode_ combo box provides different behaviors for the edge creation gesture.

Default

The default edge creation behavior. When this is set, users may not be able to create edges because the node may be moved instead.

At Port Candidates

This allows edge creation to start at distinct port candidates which also works in conjunction with moving unselected nodes.
