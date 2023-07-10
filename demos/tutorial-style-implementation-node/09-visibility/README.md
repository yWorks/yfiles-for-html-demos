<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# 09 Item Visibility - Node Style Implementation Tutorial

# Item visibility

yFiles for HTML will only render items that are considered visible in the viewport. Hence, performance usually only depends on the number of items that are in the visible part of the graph.

If the node visualization exceeds the node layout, it is considered invisible, even if the overflowing part of the visualization is in the viewport. yFiles for HTML will cause the item to disappear prematurely as it nears the borders of the viewport.

To make this more evident, the node visualization in this step has been augmented with a large circle that exceeds the node bounds. Observe the animation of the red nodes, which flicker when they reach the right or left border of the viewport. To prevent this, we have to implement `isVisible`. The blue nodes use an adjusted style and leave/enter the viewport smoothly.

```
protected isVisible(
  context: ICanvasContext,
  rectangle: Rect,
  node: INode
): boolean {
  // consider the circle, which is twice the size of the node
  const circleDiameter = Math.max(node.layout.height, node.layout.width) * 2
  const bounds = Rect.fromCenter(
    node.layout.center,
    new Size(circleDiameter, circleDiameter)
  )
  return rectangle.intersects(bounds)
}
```

Implementations for `isVisible` often delegate to `getBounds` since both concepts are related in that they act on the visible boundaries of the item.

Note

Since `isVisible` is called once for each item on every rendered frame, the implementation should be fast, even if this means to be inexact. If in doubt, prefer making the item visible.

[10 Render Boundaries](../../tutorial-style-implementation-node/10-bounds/index.html)
