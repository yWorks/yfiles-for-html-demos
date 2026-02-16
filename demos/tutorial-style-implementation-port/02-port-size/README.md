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
# 02 Port Size - Tutorial: Port Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-port-port-size.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-port/02-port-size/).

Unlike nodes, ports do not possess an intrinsic size. A port is defined merely by a point. The port style can define how large the port should be rendered. In the previous step, we used fix values that resulted in a circle with a diameter of 6. In this sample, we will add a property to the port style that allows us to customize the size of the circle.

First, we add a constructor that defines a size property with a default value of 6.

```
constructor(size: number = 6) {
  super()
  this.size = size
}
```

Now we can use this value in [createVisual](https://docs.yworks.com/yfileshtml/api/PortStyleBase#createVisual) to configure the size of the circle.

```
const radius = this.size * 0.5
ellipseElement.setAttribute('rx', String(radius))
ellipseElement.setAttribute('ry', String(radius))
```

We also adjust [getBounds](https://docs.yworks.com/yfileshtml/api/PortStyleBase#getBounds) to consider the size property.

```
protected getBounds(context: ICanvasContext, port: IPort): Rect {
  const { x, y } = port.location
  const radius = this.size * 0.5
  return new Rect(x - radius, y - radius, this.size, this.size)
}
```

Note

A port does not have to be visualized as a circle, of course. Any shape is possible. In this tutorial, we use a circle for simplicity.

Now, we can create multiple style instances that use different sizes.

```
const defaultPortStyle = new CustomPortStyle()
const largePortStyle = new CustomPortStyle(10)
const smallPortStyle = new CustomPortStyle(4)

graph.addPort({
  owner: owner,
  locationParameter: FreeNodePortLocationModel.CENTER,
  style: smallPortStyle
})
```

[03 Render Performance](../../tutorial-style-implementation-port/03-render-performance/)
