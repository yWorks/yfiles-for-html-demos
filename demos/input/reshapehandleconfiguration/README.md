<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Reshape Handle Provider Configuration Demo

# Reshape Handle Provider Configuration Demo

This demo shows how resizing of nodes can be customized.

This is done with custom configurations of the default [IReshapeHandleProvider](https://docs.yworks.com/yfileshtml/#/api/IReshapeHandleProvider) that are added to the lookup of the nodes.

## Things to Try

- Select and resize the nodes.
- Hold Shift to keep the aspect ratio for any node.
- Hold Alt to resize around the node's center.

## Node Types

- _Red nodes_ cannot be resized. They don't display resize handles.
- _Green nodes_ show only four handles at the corners. During resizing, these handles always maintain the aspect ratio of the node.
- _Dark blue nodes_ show only one handle in the bottom right corner. During resizing, this handle always maintains the center of the node.
- _Purple nodes_ show four handles at the corners and four different handles at the sides. During resizing, the corner handles always maintain the aspect ratio of the node while the border handles don't.
- _Orange nodes_ cannot extend beyond the black rectangle. Note that orange nodes can only be resized so that the new bounding box stays withing the bounding black rectangle.
- _Light blue nodes_ combine the behavior of the orange and green nodes.
- _Golden nodes_ maintain their aspect ratio depending on some application state. This state can be toggled by clicking one of the handles of a golden node.
