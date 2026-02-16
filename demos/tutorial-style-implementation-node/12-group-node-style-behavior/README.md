<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
#

      12 Group Node Style Behavior - Tutorial: Node Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-node-group-node-style-behavior.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-node/12-group-node-style-behavior/).

In this step, we will set a minimum size for the node style and customize how the group size is calculated when adjusting to its content. Similar to [IGroupPaddingProvider](https://docs.yworks.com/yfileshtml/api/IGroupPaddingProvider) in the previous step, we return implementations for both customizations in the [lookup](https://docs.yworks.com/yfileshtml/api/NodeStyleBase#lookup) method.

If you reduce the size of _Group 1_, you will notice that it shrinks past the tab size, which is not desired. We will define a minimum size for the style by implementing the interface [INodeSizeConstraintProvider](https://docs.yworks.com/yfileshtml/api/INodeSizeConstraintProvider).

```
if (type === INodeSizeConstraintProvider) {
  // use a custom size constraint provider to make sure that the node doesn't get smaller than the tab
  return INodeSizeConstraintProvider.create({
    // returns the tab size plus a small margin
    getMinimumSize: (): Size => new Size(tabWidth + 20, tabHeight + 20),
    // don't limit the maximum size
    getMaximumSize: (): Size => Size.INFINITE,
    // don't constrain the area
    getMinimumEnclosedArea: (): Rect => Rect.EMPTY
  })
}
```

Try to resize _Group 2_, and you will notice that the node size is limited to the tab size.

Next, we will add an [IGroupBoundsCalculator](https://docs.yworks.com/yfileshtml/api/IGroupBoundsCalculator) implementation, which is shown with _Group 3_. Implementations of this interface are used for customizing the way the group node layout is calculated when adjusting to the group content. By default, only the child node boundaries and the group node padding are considered. In this example, we also include the child node labels.

```
if (type === IGroupBoundsCalculator) {
  // use a custom group bounds calculator that takes labels into account
  return IGroupBoundsCalculator.create((graph: IGraph): Rect => {
    let bounds: Rect = Rect.EMPTY
    const children = graph.getChildren(node)
    children.forEach((child: INode): void => {
      bounds = Rect.add(bounds, child.layout.toRect())
      child.labels.forEach((label: ILabel): void => {
        bounds = Rect.add(bounds, label.layout.bounds)
      })
    })

    // also consider the node insets
    const paddingProvider = node.lookup(IGroupPaddingProvider)
    return paddingProvider
      ? bounds.getEnlarged(paddingProvider.getPadding())
      : bounds
  })
}
```
