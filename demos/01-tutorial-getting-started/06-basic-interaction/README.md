# Basic Interaction - Getting Started Tutorial

<img src="../../resources/image/tutorial1step6.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/01-tutorial-getting-started/06-basic-interaction/index.html).

Getting Started Tutorial - Step 6

# Basic Interaction

How to add basic interaction.

This step shows the [default interaction gestures](https://docs.yworks.com/yfileshtml/#/dguide/interaction) that are provided by class GraphEditorInputMode.

Interaction is handled by [IInputMode](https://docs.yworks.com/yfileshtml/#/api/IInputMode). [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) is the main input mode that already provides a large number of user interaction features, such as moving, deleting, creating, and resizing graph elements.

- Click a single element with the mouse to select it. SHIFT-Click the text to select the element's label. To select multiple elements, either extend an existing selection by pressing CTRL while clicking, or drag a selection rectangle over all graph elements that you want in your selection. CTRL-A selects all elements.
- Resize a node by dragging one of the handles that appear on selected nodes.
- Drag a selected node or bend to move it.
- Click and drag an edge at the desired bend location to create an edge bend.
- To create an edge, start dragging anywhere on the unselected source node and release the mouse button over the target node.
- To create a bend during edge creation, release the left mouse button anywhere on an empty spot the canvas while dragging. Click to create more bends.
- Nodes may specify multiple port locations (by default, there's only a single port at the node center). You can either create an edge directly between these ports, or later move the source or target to a different port (just select the edge and drag the edge's source or target handle). Note that custom port locations are not part of this tutorial step, but are introduced later.
- To create or edit a label, just press F2 when the owner is selected.
- To move a label, just drag it to the desired location.

See the sources for details.
