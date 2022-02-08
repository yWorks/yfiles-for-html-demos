# Custom Group Style - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step25.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/25-custom-group-style/index.html).

Custom Styles Tutorial

# Custom Group Style

This step shows how to implement a special node style for group nodes. The style provides custom [INodeSizeConstraintProvider](https://docs.yworks.com/yfileshtml/#/api/INodeSizeConstraintProvider) and [INodeInsetsProvider](https://docs.yworks.com/yfileshtml/#/api/INodeInsetsProvider) implementations to customize the minimum size as well as the insets that are used to calculate the group node bounds.

The rendering of the tab visual on the group's top side depends on the node width. The tab text is not a label, but is rendered by the node style.

This sample also demonstrates how to customize the collapse and expand buttons by implementing a custom [CollapsibleNodeStyleDecoratorRenderer](https://docs.yworks.com/yfileshtml/#/api/CollapsibleNodeStyleDecoratorRenderer).

## Things to Try

- Move nodes around inside the group node to see how the group automatically adjusts its size while respecting the insets and minimum size.
- Resize a group to see how the tab visual adjusts to the node size.
- Take a look at the source code of `MyGroupNodeStyle` and `MyCollapsibleNodeStyleDecoratorRenderer`.

## Left to Do

- Include node labels in the group node bounds and find a way to specify insets for a collapse button.
- Render nodes with HTML5 canvas instead of SVG for improved performance, especially for large graphs.
- Add [bridge support](https://docs.yworks.com/yfileshtml/#/dguide/bridges-customizations) to the edge style.
