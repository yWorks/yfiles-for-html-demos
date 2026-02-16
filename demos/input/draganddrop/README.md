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
# Drag and Drop Demo

<img src="../../../doc/demo-thumbnails/drag-and-drop.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/draganddrop/).

This demo shows how to enable drag and drop functionality for nodes using the classes [NodeDropInputMode](https://docs.yworks.com/yfileshtml/api/NodeDropInputMode), [LabelDropInputMode](https://docs.yworks.com/yfileshtml/api/LabelDropInputMode) and [PortDropInputMode](https://docs.yworks.com/yfileshtml/api/PortDropInputMode).

For dragging and dropping edges, the demo uses the custom class `EdgeDropInputMode`.

## Things to Try

- Drag a node from the palette panel onto the canvas to create a new node.
- Drag a port or label from the palette panel onto a node/edge to create a new label/port.
- Drag an item near a node to see snapping guidelines.
- Drag a node over a group node to see group node highlighting.  
  Additionally, hold the Ctrl key, if this node is not dragged from the palette panel.
- Drop a node over a group node to place it inside the group.  
  If this node is not dragged from the palette panel, additionally hold the Ctrl key.
- Drag an edge from the palette onto another node in the canvas to start edge creation from there.
- Drag an edge from the palette onto the empty canvas to create a new node with an edge creation in progress.
- Drag an edge from the palette onto another edge to just apply the style of the dragged edge.
- Toggle the preview snapping in the toolbar.

## Related Demos

- [Graph Drag and Drop Demo](../../input/graph-drag-and-drop/)
- [Drag From Component Demo](../../input/drag-from-component/)
- [Custom Drag and Drop Demo](../../input/custom-drag-and-drop/)
- [Component Drag and Drop Demo](../../input/componentdraganddrop/)
