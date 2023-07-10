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
# 08 Edge Cropping - Node Style Implementation Tutorial

# Cropping edges at the node outline

So far there have been no edges in the graph, but if we add one, we notice that the edge won’t start/end at the custom outline, but rather at the boundaries of the node itself.

To crop edges correctly at the node outline, we override `getOutline`, which returns a suitable [GeneralPath](https://docs.yworks.com/yfileshtml/#/api/GeneralPath) representing the node outline.

```
protected getOutline(node: INode): GeneralPath | null {
  // Use the node's layout, and enlarge it with
  // half the stroke width to ensure that the
  // arrow ends exactly at the outline
  const { x, y, width, height } = node.layout.toRect().getEnlarged(0.5)
  const path = new GeneralPath()
  path.moveTo(x, y)
  path.lineTo(x + tabWidth, y)
  path.lineTo(x + tabWidth, y + tabHeight)
  path.lineTo(x + width, y + tabHeight)
  path.lineTo(x + width, y + height)
  path.lineTo(x, y + height)
  path.close()
  return path
}
```

## Performance improvements

Note that this outline path is not cached and instead re-created multiple times for every single edge, which can be wasteful. If the node shape is simple enough so that it’s easy to check whether a point is inside or outside the shape, consider overriding `isInside` and `getIntersection` as an optimization. For this shape an implementation could look as follows.

`isInside` determines whether a given point lies inside the node shape. This is used for finding an edge segment that crosses the node outline.

```
protected isInside(node: INode, location: Point): boolean {
  // Check for bounding box
  if (!node.layout.contains(location)) {
    return false
  }
  const { x, y } = location
  const { y: ly } = node.layout

  // Check for the upper-right corner, which is empty
  if (x > x + tabWidth && y < ly + tabHeight) {
    return false
  }
  // all other points are either inside the tab
  // or the rest of the node
  return true
}
```

`getIntersection` calculates the intersection point between the node and the given line segment. This method is used to crop edges at the node outline.

```
protected getIntersection(
  node: INode,
  inner: Point,
  outer: Point
): Point | null {
  const layout = node.layout.toRect()

  const emptyRect = new Rect(
    layout.x + tabWidth,
    layout.y,
    layout.width - tabWidth,
    tabHeight
  )
  if (emptyRect.intersectsLine(inner, outer)) {
    // Intersection with the empty rectangle: find intersection with the actual segments of the outline
    const segment1: [Point, Point] = [
      new Point(layout.x + tabWidth, layout.y),
      new Point(layout.x + tabWidth, layout.y + tabHeight)
    ]
    const segment2: [Point, Point] = [
      new Point(layout.x + tabWidth, layout.y + tabHeight),
      new Point(layout.maxX, layout.y + tabHeight)
    ]
    const intersection1 = findLineIntersection(segment1, [inner, outer])
    const intersection2 = findLineIntersection(segment2, [inner, outer])

    if (intersection1 === null || intersection2 === null) {
      return intersection1 ?? intersection2
    }
  }

  return layout.findLineIntersection(inner, outer)
}
```

[09 Item Visibility](../../tutorial-style-implementation-node/09-visibility/index.html)
