# Custom Node Style - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step1.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/01-custom-node-style/index.html).

Custom Styles Tutorial

# Custom Node Style

This step shows how to create a custom node style.

## Things to Try

- Resize a node and make it bigger.
- Move it around to feel the rendering performance of this initial implementation.
- Zoom in using the mouse wheel and move it around again.
- While moving the node observe how the edges are cropped at the node's bounding box and how the bounding box doesn't include the drop shadow.

## Left to Do

- Use node's [ITagOwner#tag](https://docs.yworks.com/yfileshtml/#/api/ITagOwner#tag) as background color.
- Implement high-performance rendering of nodes.
- Implement [NodeStyleBase#isInside](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isInside) and [NodeStyleBase#getOutline](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getOutline), so that the edges end at the node instead of the node's bounding box.
- Implement [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit), so that a node won't get selected when clicking on its bounding box but, not on the node itself.
- Implement [NodeStyleBase#getBounds](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getBounds), so that the drop shadow will be included in the bounds of the node.
- Find a way to draw a well-performing drop shadow.
- Draw edges from nodes to their labels.
- Create a custom label style.
- Create a custom edge style.
- Create a custom port style for nodes.
- Create a custom group node style.
