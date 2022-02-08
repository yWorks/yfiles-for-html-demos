# Hit Test - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step1.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/05-hit-test/index.html).

Custom Styles Tutorial

# Hit Test

This step shows how to override `isHit()` and `isInBox()` of [NodeStyleBase](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase).

[NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit) is used for mouse click detection. It should return true if the tested point is inside the node. [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit) should take into account the imprecision radius specified by the [ICanvasContext#hitTestRadius](https://docs.yworks.com/yfileshtml/#/api/ICanvasContext#hitTestRadius) property.

[NodeStyleBase#isInBox](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isInBox) is used for marquee detection. It should return true if the node intersects with the "tested" box or lies completely inside. Also, it should be true if the "tested box" lies completely inside the node.

## Things to Try

- Take a look at [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit) and [NodeStyleBase#isInBox](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isInBox).
- Click inside/outside a node to see when it gets selected. Click near the node to watch the effects of the [ICanvasContext#hitTestRadius](https://docs.yworks.com/yfileshtml/#/api/ICanvasContext#hitTestRadius). Zooming out makes the [ICanvasContext#hitTestRadius](https://docs.yworks.com/yfileshtml/#/api/ICanvasContext#hitTestRadius) bigger.
- Drag a marquee box to select a node. If you drag it inside the surrounding box of a node, you will see that the node doesn't get selected. Drag it near the node to watch the effects of the [ICanvasContext#hitTestRadius](https://docs.yworks.com/yfileshtml/#/api/ICanvasContext#hitTestRadius).
- Comment in the first line in `MySimpleNodeStyle#isHit` and `MySimpleNodeStyle#isInBox` so the implementations in the base class are called and do the same thing again. The elliptical shape of the node won't be respected but the node will be treated as if it was rectangular.
- Please note that [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit) is just implemented for the sake of completeness and performance here. The base class implementation takes the result of [NodeStyleBase#getOutline](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getOutline) for hit testing which calculates exactly the same thing, with the difference that [NodeStyleBase#getOutline](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getOutline) needs first to build a [GeneralPath](https://docs.yworks.com/yfileshtml/#/api/GeneralPath), which is more expensive than an effective implementation as shown in [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit). If [NodeStyleBase#getOutline](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getOutline) is implemented correctly, [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit) will automatically return the correct result.

## Left to Do

- Implement [NodeStyleBase#getBounds](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getBounds), so that the drop shadow will be included in the bounds of the node.
- Find a way to draw a well-performing drop shadow.
- Draw edges from nodes to their labels.
- Create a custom label style.
- Create a custom edge style.
- Create a custom port style for nodes.
- Create a custom group node style.
