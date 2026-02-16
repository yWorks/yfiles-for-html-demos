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
# 09 Item Visibility - Tutorial: Node Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-node-visibility.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-node/09-visibility/).

yFiles for HTML will only render items that are considered visible in the viewport. Hence, performance usually only depends on the number of items that are in the visible part of the graph.

If the node visualization exceeds the node layout, it is considered invisible, even if the overflowing part of the visualization is in the viewport. yFiles for HTML will cause the item to disappear prematurely as it nears the borders of the viewport.

To make this more evident, the node visualization in this step has been augmented with a large circle that exceeds the node bounds. Observe the animation of the red nodes, which flicker when they reach the right or left border of the viewport. To prevent this, we have to implement [isVisible](https://docs.yworks.com/yfileshtml/api/NodeStyleBase#isVisible). The blue nodes use an adjusted style and leave/enter the viewport smoothly.

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

Implementations for [isVisible](https://docs.yworks.com/yfileshtml/api/NodeStyleBase#isVisible) often delegate to [getBounds](https://docs.yworks.com/yfileshtml/api/NodeStyleBase#getBounds) since both concepts are related in that they act on the visible boundaries of the item.

Note

Since [isVisible](https://docs.yworks.com/yfileshtml/api/NodeStyleBase#isVisible) is called once for each item on every rendered frame, the implementation should be fast, even if this means to be inexact. If in doubt, prefer making the item visible.

[10 Render Boundaries](../../tutorial-style-implementation-node/10-bounds/)
