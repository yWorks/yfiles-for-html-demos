<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
#

      12 Group Node Style Behavior - Tutorial: Node Style Implementation

# Customizing the group node behavior

In this step, we will set a minimum size for the node style and customize how the group size is calculated when adjusting to its content. Similar to `INodeInsetsProvider` in the previous step, we return implementations for both customizations in the `lookup` method.

If you reduce the size of _Group 1_, you will notice that it shrinks past the tab size, which is not desired. We will define a minimum size for the style by implementing the interface [INodeSizeConstraintProvider](https://docs.yworks.com/yfileshtml/#/api/INodeSizeConstraintProvider).

```
if (type === INodeSizeConstraintProvider.$class) {
  // use a custom size constraint provider to make sure that the node doesn't get smaller than the tab
  return INodeSizeConstraintProvider.create({
    // returns the tab size plus a small margin
    getMinimumSize: (item: INode): Size =>
      new Size(tabWidth + 20, tabHeight + 20),
    // don't limit the maximum size
    getMaximumSize: (item: INode): Size => Size.INFINITE,
    // don't constrain the area
    getMinimumEnclosedArea: (item: INode): Rect => Rect.EMPTY
  })
}
```

Try to resize _Group 2_, and you will notice that the node size is limited to the tab size.

Next, we will add an [IGroupBoundsCalculator](https://docs.yworks.com/yfileshtml/#/api/IGroupBoundsCalculator) implementation, which is shown with _Group 3_. Implementations of this interface are used for customizing the way the group node layout is calculated when adjusting to the group content. By default, only the child node boundaries and the group node insets are considered. In this example, we also include the child node labels.

```
if (type === IGroupBoundsCalculator.$class) {
  // use a custom group bounds calculator that takes labels into account
  return IGroupBoundsCalculator.create(
    (graph: IGraph, groupNode: INode): Rect => {
      let bounds: Rect = Rect.EMPTY
      const children = graph.getChildren(groupNode)
      children.forEach((child: INode): void => {
        bounds = Rect.add(bounds, child.layout.toRect())
        child.labels.forEach((label: ILabel): void => {
          bounds = Rect.add(bounds, label.layout.bounds)
        })
      })

      // also consider the node insets
      const insetsProvider = groupNode.lookup(INodeInsetsProvider.$class)
      return insetsProvider
        ? bounds.getEnlarged(insetsProvider.getInsets(groupNode))
        : bounds
    }
  )
}
```
