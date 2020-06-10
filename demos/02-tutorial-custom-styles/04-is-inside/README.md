# IsInside - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step1.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/04-is-inside/index.html).

This step shows how to override `isInside()` and `getOutline()` of [NodeStyleBase](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase).

## Things to Try

- Take a look at `MySimpleNodeStyle.isInside()` and `MySimpleNodeStyle.getOutline()`.
- Move an edge around a node. It follows the outline of the node.
- Now, comment in the first line in `MySimpleNodeStyle.getOutline()` so that the implementation of the base class is called and do the same thing again. Now, the edge will follow a rectangle enclosing the node.
- Select an incoming edge and drag it's port outside the node. See how the behaviour of the edge changes when the port enters the node. That is an effect of the implementation of [NodeStyleBase#isInside](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isInside).
- Now, comment in the first line in `MySimpleNodeStyle.isInside` so that the implementation of the base class is called and do the same thing again. Now, the enclosing rectangle is used for port behaviour calculation.
- Please note that [NodeStyleBase#isInside](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isInside) as well as [NodeStyleBase#getIntersection](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getIntersection), which isn't demonstrated here, are just used to improve performance. If not implemented, [NodeStyleBase#getOutline](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getOutline) will be used to calculate exactly the same thing, with the difference that [NodeStyleBase#getOutline](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getOutline) needs first to build a [GeneralPath](https://docs.yworks.com/yfileshtml/#/api/GeneralPath), which is more expensive than an effective implementation as shown in [NodeStyleBase#isInside](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isInside).

## Left to Do

- Implement [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit), so that a node won't get selected when clicking on the bounding box but not on the node itself (this works already in this step, but can be implemented explicitly for performance reasons).
- Implement [NodeStyleBase#getBounds](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getBounds), so that the drop shadow will be included in the bounds of the node.
- Find a way to draw a well-performing drop shadow.
- Draw edges from nodes to their labels.
- Create a custom label style.
- Create a custom edge style.
- Create a custom port style for nodes.
- Create a custom group node style.
