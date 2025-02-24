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
# Node Alignment Demo

<img src="../../../doc/demo-thumbnails/node-alignment.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/layout/node-alignment/).

This demo shows how to automatically align nodes in rows and columns using the [AlignmentStage](https://docs.yworks.com/yfileshtml/#/api/AlignmentStage) layout algorithm.

The [AlignmentStage](https://docs.yworks.com/yfileshtml/#/api/AlignmentStage) assigns nodes to rows and columns and places all nodes in a column/row centered on a vertical/horizontal line. Two nodes belong to the same column/row, if the horizontal/vertical distance between the centers of said nodes is less than or equal to the value of the [AlignmentStage.snapDistance](https://docs.yworks.com/yfileshtml/#/api/AlignmentStage#snapDistance) property.

When aligning nodes, the horizontal distance between nodes in a shared row and the vertical distance between nodes in a shared column can only increase. As a result, reducing the [minimumNodeDistance](https://docs.yworks.com/yfileshtml/#/api/AlignmentStage#minimumNodeDistance) will not move existing rows and columns closer together.

## Things to Try

- Drag a node template from the demo's palette into the demo's graph component. While dragging the template over the graph component, gray columns and rows are shown in the background. These stripes represent the snap distance to the vertical and horizontal lines of alignment for the existing rows. Dragging the mouse into one of these stripe will turn the corresponding stripe into a darker shade of gray. Dropping the template inside a darkened stripe will force the new node and the existing nodes in that stripe to be aligned.
- Click on free space to create a new node or move a node to another position. If the center of this node is close enough to an existing node, the nodes in the graph will be aligned automatically.
- Change one of the property values in the _Settings_ panel and observe how the graph is re-aligned. Since [AlignmentStage](https://docs.yworks.com/yfileshtml/#/api/AlignmentStage) only increases distances between nodes, decreasing the _Minimum Node Distance_ will have no immediate effect.
