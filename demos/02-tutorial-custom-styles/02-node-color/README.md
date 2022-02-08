# Node Color - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step2.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/02-node-color/index.html).

Custom Styles Tutorial

# Node Color

This step shows how to change the style of the nodes based on their [ITagOwner#tag](https://docs.yworks.com/yfileshtml/#/api/ITagOwner#tag).

In this case, the background color of the nodes can be set via the [ITagOwner#tag](https://docs.yworks.com/yfileshtml/#/api/ITagOwner#tag) property of the nodes.

## Things to Try

- Take a look at the methods `MySimpleNodeStyle.render()` and `SampleApplication.createSampleGraph()`.

## Left to Do

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
