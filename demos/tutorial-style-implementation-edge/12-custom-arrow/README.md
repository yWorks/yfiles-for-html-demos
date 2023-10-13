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
# 12 Custom Arrow - Tutorial: Edge Style Implementation

# Custom arrow visualization

This step shows how to implement a visualization of a custom arrow that fits the "parallel line" edge style.

Custom arrow implementations are based on the [IArrow](https://docs.yworks.com/yfileshtml/#/api/IArrow) interface. [IArrow](https://docs.yworks.com/yfileshtml/#/api/IArrow) defines the two methods `getVisualCreator` and `getBoundsProvider`, which return the implementations that create the visualization and specify the bounds of the arrow. In this sample, we implement all three interfaces in a single class.

## Implementing IArrow

In the `getVisualCreator` method, we store the anchor and direction of the arrow. Then, we simply return `this`, since out class itself will implement the \`IVisualCreator\`interface.

```
getVisualCreator(
  edge: IEdge,
  atSource: boolean,
  anchor: Point,
  direction: Point
): IVisualCreator {
  this.anchor = anchor
  this.direction = direction
  return this
}
```

In the `getBoundsProvider` method, we do the same before we return `this`.

```
getBoundsProvider(
  edge: IEdge,
  atSource: boolean,
  anchor: Point,
  direction: Point
): IBoundsProvider {
  this.anchor = anchor
  this.direction = direction
  return this
}
```

In the last tutorial step, we used the methods `addArrows` and `updateArrows` to add the arrow visualizations to the edge visualization. These methods need the length of the arrow to shorten the edge path accordingly and the crop length to position the arrow exactly at the node. To achieve this, we implement the according properties in the [IArrow](https://docs.yworks.com/yfileshtml/#/api/IArrow) interface.

```
get length(): number {
  return this.distance * 2
}

get cropLength(): number {
  return 1
}
```

## Implementing IVisualCreator

In order to create an arrow visualization, we have to implement the [IVisualCreator](https://docs.yworks.com/yfileshtml/#/api/IVisualCreator) interface.

We create the visualization for the arrow in `createVisual`. If it is called for the first time, we generate a path for the arrowhead. This path must point from the right side to the origin (0/0).

```
createArrowPath(dist: number): GeneralPath {
  const path = new GeneralPath()
  path.moveTo(new Point(dist * 2 + 1, dist * 0.5))
  path.lineTo(new Point(dist * 2 + 1, dist + 1))
  path.lineTo(new Point(0, 0))
  path.lineTo(new Point(dist * 2 + 1, -dist - 1))
  path.lineTo(new Point(dist * 2 + 1, -dist * 0.5))
  return path
}
```

Using the anchor and direction, we place the arrow at the correct position with the appropriate orientation.

```
createVisual(context: IRenderContext): SvgVisual {
  if (this.arrowPath === null) {
    this.arrowPath = this.createArrowPath(this.distance)
  }

  const path = this.arrowPath.createSvgPath()
  path.setAttribute('fill', 'white')
  path.setAttribute('stroke', 'black')
  path.setAttribute('stroke-width', '1')
  path.setAttribute(
    'transform',
    `matrix(
      ${-this.direction.x}
      ${-this.direction.y}
      ${this.direction.y}
      ${-this.direction.x}
      ${this.anchor.x}
      ${this.anchor.y}
    )`
  )

  const svgVisual: Cache = new SvgVisual(path)
  svgVisual.cache = {
    distance: this.distance
  }
  return svgVisual
}
```

We update the visualization in `updateVisual` by applying the current anchor, direction and distance, if modified.

```
updateVisual(context: IRenderContext, oldVisual: Visual): SvgVisual {
  const svgVisual = oldVisual as SvgVisual & Cache
  const cache = svgVisual.cache!
  const path = svgVisual.svgElement as SVGPathElement

  if (this.distance !== cache.distance) {
    const arrowPath = this.createArrowPath(this.distance)
    path.setAttribute('d', arrowPath.createSvgPathData())
    cache.distance = this.distance
  }

  path.setAttribute(
    'transform',
    `matrix(
      ${-this.direction.x}
      ${-this.direction.y}
      ${this.direction.y}
      ${-this.direction.x}
      ${this.anchor.x}
      ${this.anchor.y}
    )`
  )
  return svgVisual
}
```

## Implementing IBoundsProvider

In order to calculate the arrow bounds, we have to implement the [IBoundsProvider](https://docs.yworks.com/yfileshtml/#/api/IBoundsProvider) interface.

Note

The edge style can consider the arrow bounds in its own bounds calculation. You could adjust the `getBounds` method of the edge style accordingly. However, this is outside the scope of this tutorial.

In `getBounds` we use the stored values to calculate the arrow’s bounds.

```
getBounds(context: ICanvasContext): Rect {
  return this.createArrowPath(this.distance)
    .getBounds()
    .getTransformed(
      new Matrix(
        -this.direction.x,
        -this.direction.y,
        this.direction.y,
        -this.direction.x,
        this.anchor.x,
        this.anchor.y
      )
    )
}
```
