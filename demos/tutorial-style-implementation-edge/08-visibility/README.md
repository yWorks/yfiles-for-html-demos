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
# 08 Item Visibility - Tutorial: Edge Style Implementation

# Item visibility

yFiles for HTML will only render items that are considered visible in the viewport. Hence, performance usually only depends on the number of items that are in the visible part of the graph.

If the edge visualization exceeds the edge path, it is considered invisible, even if the overflowing part of the visualization is in the viewport. yFiles for HTML will cause the item to disappear prematurely as it nears the borders of the viewport. This is the case if the edge is rendered with a thick stroke, for example.

To make this more evident, the edge visualization in this step has been augmented with a large circle that exceeds the edge path. We create an SVG circle and add it to the center of the edge path:

```
const circleLocation = generalPath.getPoint(0.5)
const circleElement = document.createElementNS(
  'http://www.w3.org/2000/svg',
  'circle'
)
circleElement.setAttribute('r', String(circleRadius))
circleElement.setAttribute('cx', String(circleLocation.x))
circleElement.setAttribute('cy', String(circleLocation.y))
circleElement.setAttribute('fill', '#0b7189')
circleElement.setAttribute('fill-opacity', '0.3')
group.append(circleElement)
```

Observe the animation of the red edges, which flicker when they reach the right or left border of the viewport. To prevent this, we have to implement `isVisible`. The blue edges use an adjusted style and leave/enter the viewport smoothly.

```
protected isVisible(
  context: ICanvasContext,
  rectangle: Rect,
  edge: IEdge
): boolean {
  const path = super.getPath(edge)!
  const thickness = this.distance + 2

  // check the edge path bounds, considering the edge thickness
  const edgeBounds = path.getBounds().getEnlarged(thickness * 0.5)
  if (rectangle.intersects(edgeBounds)) {
    return true
  }

  // check the circle bounds
  const circleBounds = Rect.fromCenter(
    path.getPoint(0.5),
    new Size(circleRadius * 2, circleRadius * 2)
  )
  return rectangle.intersects(circleBounds)
}
```

Implementations for `isVisible` often delegate to `getBounds` since both concepts are related in that they act on the visible boundaries of the item.

Note

Since `isVisible` is called once for each item on every rendered frame, the implementation should be fast, even if this means to be inexact. If in doubt, prefer making the item visible.

[09 Render Boundaries](../../tutorial-style-implementation-edge/09-bounds/)
