<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# 02 Create A Custom Shape - Tutorial: Node Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-node-create-a-custom-shape.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-node/02-create-a-custom-shape/).

Currently, the custom node style renders a rectangle. This is something yFiles for HTML already offers out-of-the box with [ShapeNodeStyle](https://docs.yworks.com/yfileshtml/#/api/ShapeNodeStyle) and [RectangleNodeStyle](https://docs.yworks.com/yfileshtml/#/api/RectangleNodeStyle). So let’s use something a little more interesting, for example a typical card shape with a tab in the top left corner.

```
protected createVisual(context: IRenderContext, node: INode): Visual | null {
  const { x, y, width, height } = node.layout

  const pathElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  )
  pathElement.setAttribute('d', createPathData(x, y, width, height))
  pathElement.setAttribute('fill', '#0b7189')
  pathElement.setAttribute('stroke', '#042d37')

  // wrap the SVG path into an SvgVisual
  return new SvgVisual(pathElement)
}
```

Note

The [createVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#NodeStyleBase-method-createVisual) method can return anything SVG supports. You are not limited to `<rect>` or `<path>` here. This tutorial focuses on how yFiles for HTML works, so we try to keep it simple. For more information about the capabilities of SVG, take a look at [the SVG specification](https://www.w3.org/TR/SVG2/).

The path data is created by a separate function that takes the node’s location and size into account:

```
const tabWidth = 50
const tabHeight = 10

/**
 * Creates the path data for the SVG path element.
 */
function createPathData(
  x: number,
  y: number,
  width: number,
  height: number
): string {
  return (
    `M ${x} ${y} ` +
    `h ${tabWidth} ` +
    `v ${tabHeight} ` +
    `h ${width - tabWidth} ` +
    `v ${height - tabHeight} ` +
    `h ${-width} z`
  )
}
```

[03 Render Performance](../../tutorial-style-implementation-node/03-render-performance/)
