# Mindmap Demo

<img src="../../resources/image/mindmap.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/complete/mindmap/index.html).

This demo shows an interactive Mindmap application.

The layout is calculated by the tree layout algorithm, and makes use of port constraints and special node placers.

The application-specific diagram visualization is created with custom node and edge styles, node style decorators and HTML overlays. The overview uses custom item visualizations, too.

A [FilteredGraphWrapper](https://docs.yworks.com/yfileshtml/#/api/FilteredGraphWrapper) is used to collapse subtrees.

A custom [IPositionHandler](https://docs.yworks.com/yfileshtml/#/api/IPositionHandler) takes care of subtree moving and relocation.

View the source code for details.

## Navigation

- Navigate between the nodes with the arrow keys.
- Click the collapse or expand button ![](resources/arrowRight.svg) or press the '+' or '-' key to collapse or expand a node's subtree.
- Default functions like open, save, zoom, undo and redo are available in the toolbar.
- Please note that the maximum zoom factor as well as the scrollable area are limited.

## Editing a Node

- Click a node to select it and open the node menu.
- Edit a node label with a double click or press 'F2' on a selected node.

## Node Menu

- The smiley button ![](resources/smiley-happy-24.svg) decorates the node with a state icon or removes the current icon.
- The color button ![](resources/colors-24.svg) selects the node color.
- The blue arrow button ![](resources/crossref-24.svg) starts the creation of a cross reference edge.
- The plus icon ![](resources/plus-24.svg) adds a new child.
- The minus icon ![](resources/minus-24.svg) removes the node and its subtree.

## Modifying the Mindmap Structure

- Change a node's parent by dragging the selected node near other nodes.
- Drag a selected node far away from the mindmap to delete the node and its subtree.
- Change the order in a subtree by dragging a selected node below or above its siblings.
- Press 'Return' to add a sibling to a selected node.
- Add a child to a selected node by pressing 'Insert'.
- Remove a selected node and its subtree with the 'Delete' key.

## Cross Reference Edges

- Start the creation of a cross reference edge ![](resources/crossref-24.svg) in the node menu.
- Finish the edge creation by clicking another node or cancel with a right click.
- Click a cross reference edge to select it.
- Double click a cross reference edge or press F2 to add a label or to edit an existing label.
- Drag the height handle of a selected cross reference edge to change its height.
