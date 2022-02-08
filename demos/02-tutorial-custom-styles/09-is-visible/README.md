# IsVisible - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step1.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/09-is-visible/index.html).

Custom Styles Tutorial

# IsVisible

This step shows how to override the method `isVisible()` of [NodeStyleBase](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase).

## Things to Try

- Take a look at `MySimpleNodeStyle.isVisible()`.
- If you scroll the view so that the node with the label lies completely outside the viewport, but the edge to the label is still inside, the edge is still visible. If you uncomment the first line of `isVisible()` such that the base implementation is used and do the same thing you will notice the edge disappears as soon as the node is outside of the viewport.

## Left to Do

- Create a custom label style.
- Create a custom edge style.
- Create a custom port style for nodes.
- Use the decorator pattern to add label edges to the nodes.
- Create a custom group node style.
