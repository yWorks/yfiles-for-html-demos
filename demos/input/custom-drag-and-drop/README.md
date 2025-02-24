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
# Custom Drag and Drop Demo

<img src="../../../doc/demo-thumbnails/custom-drag-and-drop.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/input/custom-drag-and-drop/).

This demo shows how to change the color of nodes and edges using drag and drop operations.

yFiles for HTML comes with predefined drag and drop support to create [nodes](https://docs.yworks.com/yfileshtml/#/api/NodeDropInputMode), [labels](https://docs.yworks.com/yfileshtml/#/api/LabelDropInputMode) and [ports](https://docs.yworks.com/yfileshtml/#/api/PortDropInputMode). Instead of creating new elements, this demo shows how you can modify existing elements using a drag and drop operation.

As an example, the demo uses an implementation of the [DropInputMode](https://docs.yworks.com/yfileshtml/#/api/DropInputMode), which changes the color of nodes and edges when dropping on them.

## Things to Try

- Drag a color from the palette onto the canvas. A preview is displayed under the mouse pointer.
- Drag the color around and see how the cursor changes, depending on whether or not a drop operation can be performed at the current mouse position.
- Drag the color over an item that has not the same color. The element is highlighted to show that the element can be recolored by the drop operation.
- Drop a the color on an valid element and observe how the element is recolored accordingly.
- Use the undo and redo buttons to revert the effect of a drag and drop recoloring operation.

## Related Demos

- [Drag and Drop Demo](../../input/draganddrop/)
- [Graph Drag and Drop Demo](../../input/graph-drag-and-drop/)
- [Drag From Component Demo](../../input/drag-from-component/)
- application-features-drag-and-drop
