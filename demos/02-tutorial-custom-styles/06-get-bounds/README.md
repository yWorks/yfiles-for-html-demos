# GetBounds - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step1.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/06-get-bounds/index.html).

This step shows how to override `getBounds()` of [NodeStyleBase](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase).

Also, [NodeStyleBase#getOutline](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getOutline) is implemented, so that implementations of [NodeStyleBase#getIntersection](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getIntersection), [NodeStyleBase#isInside](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isInside) and [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit) won't be necessary any more.

## Things to Try

- Take a look at `MySimpleNodeStyle.getBounds()`.
- Zoom in until the horizontal scrollbar appears. Scroll to the right end of the graph. You will notice that the shadow of the right node is completely visible.
- Now, comment in the first line in `MySimpleNodeStyle.getBounds()` so that the implementation of the base class is called and do the same thing again. Now, the viewport will end at the right side of the node without taking the shadow into account.

## Left to Do

- Find a way to draw a well-performing drop shadow.
- Draw edges from nodes to their labels.
- Create a custom label style.
- Create a custom edge style.
- Create a custom port style for nodes.
- Create a custom group node style.
