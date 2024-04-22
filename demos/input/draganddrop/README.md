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
# Drag and Drop Demo

# Drag and Drop Demo

This demo shows how to enable drag and drop functionality for nodes using the classes [NodeDropInputMode](https://docs.yworks.com/yfileshtml/#/api/NodeDropInputMode), [LabelDropInputMode](https://docs.yworks.com/yfileshtml/#/api/LabelDropInputMode) and [PortDropInputMode](https://docs.yworks.com/yfileshtml/#/api/PortDropInputMode). The demo features two drag and drop panels: the left one uses yFiles drag and drop and the right one uses the browser-native drag and drop.

The difference between the two mechanisms is the way a drag is started. The left panel starts a drag with e.g. [NodeDropInputMode.startDrag](https://docs.yworks.com/yfileshtml/#/api/NodeDropInputMode#startDrag). The right panel uses the native "dragstart" event to start a drag. The drop input modes are able to react to the native drag events. Unfortunately, snapping is not supported for elements dragged from this palette. Note that the right palette only works with mouse events. Native drag and drop currently cannot handle touch or pen events.

For dragging and dropping edges, the demo uses the custom class `EdgeDropInputMode`.

## Things to Try

- Drag a node from the palette panels onto the canvas to create a new node.
- Drag a port or label from the palette panels onto a node/edge to create a new label/port.
- Drag an item near a node to see snapping guide lines.
- Drag a node over a group node to see group node highlighting.  
  Additionally hold the 'Shift' key, if this node is not dragged from the palette panel.
- Drop a node over a group node to place it inside the group.  
  If this node is not dragged from the palette panel, additionally hold the 'Shift' key.
- Drag an edge from the palette onto another node in the canvas to start edge creation from there.
- Drag an edge from the palette onto the empty canvas to create a new node with an edge creation in progress.
- Drag an edge from the palette onto another edge to just apply the style of the dragged edge.
- Toggle the preview snapping in the toolbar.

## Related Demos

- [Graph Drag and Drop Demo](../../input/graph-drag-and-drop/)
- [Drag From Component Demo](../../input/drag-from-component/)
- [Custom Drag and Drop Demo](../../input/custom-drag-and-drop/)
- [Simple Drag And Drop Demo](../../application-features/drag-and-drop/)
