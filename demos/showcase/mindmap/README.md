<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Mind Map Demo

# Mind Map Demo

This demo shows an interactive mind map application used for organizing information and showing relations between items.

The layout is calculated by the tree layout algorithm, and makes use of port constraints and special node placers.

## Navigation

- Navigate between the nodes with the arrow keys.
- Click the collapse or expand button ![](resources/icons/arrow-right.svg) or press the '+' or '-' key to collapse or expand a node's subtree.
- Please note that the maximum zoom factor as well as the scrollable area are limited.

## Editing a Node

- Click a node and use the node menu to modify its state icon and color. Also, create children, cross-reference edges or remove the node.
- Edit a node label with a double click or press 'F2' on a selected node.

## Modifying the Mind Map Structure

- Change a node's parent by dragging the selected node near other nodes.
- Drag a node far away from the mind map to delete the node and its subtree.
- Change the order in a subtree by dragging a node below or above its siblings.
- Press 'Return' to add a sibling to a selected node.
- Add a child to a selected node by pressing 'Insert'.
- Remove a selected node and its subtree with the 'Delete' key.

## Cross-Reference Edges

- Start the creation of a cross-reference edge using the up-arrow in the node menu.
- Finish the edge creation by clicking another node or cancel with a right-click.
- Click a cross-reference edge to select it.
- Double click a cross-reference edge or press 'F2' to add a label or to edit an existing label.
- Drag the height handle of a selected cross-reference edge to change its height.
