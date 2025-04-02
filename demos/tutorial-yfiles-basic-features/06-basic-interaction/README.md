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
# 06 Basic Interaction - Tutorial: Basic Features

<img src="../../../doc/demo-thumbnails/tutorial-basic-features-basic-interaction.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-yfiles-basic-features/06-basic-interaction/).

## How to add basic interaction.

This step shows the [default interaction gestures](https://docs.yworks.com/yfileshtml/#/dguide/interaction) that are provided by class [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode).

Interaction is handled by interface [IInputMode](https://docs.yworks.com/yfileshtml/#/api/IInputMode). [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) is the main input mode that already provides a large number of user interaction features, such as moving, deleting, creating, and resizing graph elements. See the [API documentation](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) for the various configuration options.

```
graphComponent.inputMode = new GraphEditorInputMode()
```

- Click a single element with the mouse to select it. Shift+click the text to select the element’s label. To select multiple elements, either extend an existing selection by pressing Ctrl while clicking, or drag a selection rectangle over all graph elements that you want in your selection. Ctrl+Α selects all nodes and bends.
- Resize a node by dragging one of the handles that appear on selected nodes.
- Drag a node or an edge bend to move it.
- Drag an edge at the desired bend location to create an edge bend.
- To create an edge, hover over the source node with the mouse to show all available ports (by default, there is only a single port at the node center). Start dragging from the port and release the mouse button over the target node.
- To create a bend during edge creation, release the left mouse button anywhere on an empty spot of the canvas while dragging, and click there to leave a bend. This can be repeated many times to create more bends.
- Nodes may specify multiple port locations. You can either create an edge directly between these ports, or later move the source or target to a different port (just select the edge and drag the edge’s source or target handle). Note that custom port locations are not part of this tutorial step, but are introduced later.
- To create or edit a label, select a node or an edge and press F2, or double click on a node or an edge.
- Drag a selected label to move it to another location.
- Click anywhere on an empty spot of canvas to create a new node.
- Press Delete or Backspace to delete the selected nodes or edges. When a node is deleted, all edges that connect to it are also deleted.

[07 Undo Clipboard Support](../../tutorial-yfiles-basic-features/07-undo-clipboard-support/)
