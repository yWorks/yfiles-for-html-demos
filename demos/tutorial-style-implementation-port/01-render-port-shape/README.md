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
# 01 Rendering the Port - Tutorial: Port Style Implementation

# Custom port visualizations

yFiles for HTML comes with a lot of predefined item visualizations and lots of different shapes for nodes, which can also be used to visualize ports using [NodeStylePortStyleAdapter](https://docs.yworks.com/yfileshtml/#/api/NodeStylePortStyleAdapter). However, in some cases, it is required to create fully custom visualizations based on SVG. This might be the case if you need shapes that are not available out-of-the-box, because they are domain-specific. Also, the rendering of custom visualizations can be optimized for performance-critical applications.

This tutorial will guide you through creating your own port visualizations for yFiles for HTML with SVG.

Note

Implementing a custom port style from scratch is an advanced concept. In a lot of cases, other approaches like template styles, or decorating built-in styles with custom elements are sufficient. For more information on the topic of styling graph items, please have a look at [Port Styles](https://docs.yworks.com/yfileshtml/#/dguide/styles-port_styles).

## Subclassing PortStyleBase

yFiles for HTML comes with an abstract base class which provides the basic functionality to create a custom port style. We start with a custom subclass of [PortStyleBase](https://docs.yworks.com/yfileshtml/#/api/PortStyleBase).

```
class CustomPortStyle extends PortStyleBase {
  protected createVisual(context: IRenderContext, port: IPort): Visual | null {
    return null // TODO - create the SVG element
  }

  protected getBounds(context: ICanvasContext, port: IPort): Rect {
    return Rect.EMPTY // TODO - calculate the port bounds
  }
}
```

This code will not produce anything visible, yet. We first have to implement the `createVisual` method. This method returns an SVG element, wrapped into an [SvgVisual](https://docs.yworks.com/yfileshtml/#/api/SvgVisual). Let’s render a circle with radius 3 to keep things simple. In your own implementation, you can create more complex SVG elements, of course.

```
protected createVisual(context: IRenderContext, port: IPort): Visual | null {
  const ellipseElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'ellipse'
  )
  const { x, y } = port.location
  ellipseElement.setAttribute('cx', String(x))
  ellipseElement.setAttribute('cy', String(y))
  ellipseElement.setAttribute('rx', '3')
  ellipseElement.setAttribute('ry', '3')
  ellipseElement.setAttribute('fill', '#6c9f44')
  ellipseElement.setAttribute('stroke', '#e6f8ff')
  ellipseElement.setAttribute('stroke-width', '1')
  return new SvgVisual(ellipseElement)
}
```

Note

The SVG element returned in `createVisual` does not necessarily have to be created using the JavaScript DOM API. You could also create it using any JavaScript UI framework or API like React, Vuejs, etc.

Note

It’s important that SvgVisual contains an SVG element in the 'http://www.w3.org/2000/svg' namespace. HTML elements are not supported.

In `getBounds`, we return a rectangle that defines the area in which the port visualization is rendered. This information is crucial for various functionalities related to the viewport, such as calculating the bounds of a graph during content fitting or displaying scrollbars.

```
protected getBounds(context: ICanvasContext, port: IPort): Rect {
  const { x, y } = port.location
  return new Rect(x - 3, y - 3, 6, 6)
}
```

[02 Port Size](../../tutorial-style-implementation-port/02-port-size/)
