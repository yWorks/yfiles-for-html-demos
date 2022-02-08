# UpdateVisual and RenderDataCache - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step3.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/03-update-visual-and-render-data-cache/index.html).

Custom Styles Tutorial

# UpdateVisual and RenderDataCache

This step shows how to implement high-performance rendering of nodes.

To achieve this, you need to implement [NodeStyleBase#updateVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#updateVisual) which is called when the container decides to update the visual representation of a node. In contrast to [NodeStyleBase#createVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#createVisual), we try to re-use the old visual instead of creating a new one.

Method `createRenderDataCache()` saves the relevant data for creating a visual. [NodeStyleBase#updateVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#updateVisual) checks whether this data has changed. If it hasn't changed, the old visual can be returned, otherwise the whole or part of the visual has to be re-rendered.

With the "High Performance" button, you can switch between the custom implementation of `updateVisual()` and the base implementation which simply calls [NodeStyleBase#createVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#createVisual).

## Things to Try

- Click "Animate Nodes" to see the performance of [NodeStyleBase#createVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#createVisual).
- Turn on "High Performance" and click "Start Animation" to see the benefit of implementing [NodeStyleBase#updateVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#updateVisual).
- Take a look at the methods `updateVisual()` and `createRenderDataCache()` of class `MySimpleNodeStyle`.

## Left to Do

- Implement [NodeStyleBase#isInside](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isInside) and [NodeStyleBase#getOutline](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getOutline), so that the edges end at the node instead of the node's bounding box.
- Implement [NodeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#isHit), so that a node won't get selected when clicking on its bounding box but, not on the node itself.
- Implement [NodeStyleBase#getBounds](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#getBounds), so that the drop shadow will be included in the bounds of the node.
- Find a way to draw a well-performing drop shadow.
- Draw edges from nodes to their labels.
- Create a custom label style.
- Create a custom edge style.
- Create a custom port style for nodes.
- Create a custom group node style.
