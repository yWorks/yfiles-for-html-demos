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
#

      03 Adding a Background Shape - Tutorial: Label Style Implementation

# Adding a background shape

In many cases, it’s required to add a background to the label text. This is useful to improve contrast, add a meaningful shape or color, or simply to make the style look nicer.

In this tutorial step, we will add a simple "speech balloon" shape to the style.

```
const backgroundPathElement = document.createElementNS(
  'http://www.w3.org/2000/svg',
  'path'
)
backgroundPathElement.setAttribute(
  'd',
  this.createBackgroundShapeData(labelSize)
)
backgroundPathElement.setAttribute('stroke', '#aaa')
backgroundPathElement.setAttribute('fill', '#fffecd')
```

The path data is assembled in a separate function.

```
private createBackgroundShapeData(labelSize: Size): string {
  const { width: w, height: h } = labelSize
  return `M 0 0 h ${w} v ${h} h -${w * 0.5 - 5} l -5 5 v -5 h -${w * 0.5} z`
}
```

We add the path to the `<g>` element before the `<text>`.

```
const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
gElement.appendChild(backgroundPathElement)
gElement.appendChild(textElement)
```

Note

The "tail" of the speech balloon is rendered outside the label bounds. We’ll deal with this later in this tutorial.

[04 Preferred Label Size](../../tutorial-style-implementation-label/04-preferred-size/)
