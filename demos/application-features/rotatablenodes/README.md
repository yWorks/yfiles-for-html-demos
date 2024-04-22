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
# Rotatable Nodes

# Rotatable Nodes

This demo shows how support for rotated node visualizations can be implemented on top of the yFiles library. A custom [INodeStyle](https://docs.yworks.com/yfileshtml/#/api/INodeStyle) implementation is used to encapsulate most of the added functionality.

## Things to Try

- Select a node by clicking it and note the additional rotation handle.
- Rotate a node by dragging the rotation handle.
- Enable snapping to snap the rotation to the coordinate axis and other rotated nodes. You can hold Shift to prevent snapping.
- Create edges between nodes. Note that port candidates are rotated with the node, as are ports.
- Add a label to a node and rotate the node. Observe how the label rotates with the node. Try moving the label to see how possible label positions are also affected by the node's rotation.
- Run a layout. Observe how rotated nodes fit naturally into the computed layout.
- Load your own graph and rotated its nodes. Note that the contained styles need to be from the library or demos. Keep attention when saving this graph because the GraphML output is changed due to the additional rotation style and information.
