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
# 01 Create A Rectangle - Tutorial: Node Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-node.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-node/01-create-a-rectangle/).

yFiles for HTML comes with a lot of predefined item visualizations and lots of different shapes for nodes. However, in some cases, it is required to create fully custom visualizations based on SVG. This might be the case if you need shapes that are not available out-of-the-box or domain-specific node visualizations. Also, the rendering of custom visualizations can be optimized for performance-critical applications.

This tutorial will guide you through creating your own node visualizations for yFiles for HTML with SVG.

Note

Implementing a custom node style from scratch is an advanced concept. In a lot of cases, other approaches like template styles or decorating built-in styles with custom elements are enough. For more information on the topic of styling graph items, please have a look at [Node Styles](https://docs.yworks.com/yfileshtml/#/dguide/styles-node_styles).

## Subclassing NodeStyleBase

yFiles for HTML provides an abstract base class which provides the basic functionality to create a custom node style. We start with a custom subclass of [NodeStyleBase](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase).

```
export class CustomNodeStyle extends NodeStyleBase {
  protected createVisual(context: IRenderContext, node: INode): Visual | null {
    return null // TODO - create the SVG element
  }
}
```

This code will not produce anything visible, yet. We first have to implement the `createVisual` method. This method returns an SVG element, wrapped into an [SvgVisual](https://docs.yworks.com/yfileshtml/#/api/SvgVisual). Let’s start with a simple rectangle for now to keep things simple. We will switch to a more complex visualization later on.

```
protected createVisual(context: IRenderContext, node: INode): Visual | null {
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  const { x, y, width, height } = node.layout
  rect.setAttribute('x', String(x))
  rect.setAttribute('y', String(y))
  rect.setAttribute('width', String(width))
  rect.setAttribute('height', String(height))
  rect.setAttribute('fill', '#0b7189')
  rect.setAttribute('stroke', '#042d37')
  return new SvgVisual(rect)
}
```

Note

The SVG element returned in `createVisual` does not necessarily have to be created using the JavaScript DOM API. You could also create it using any JavaScript UI framework or API like React, Vue, etc.

Creating a visualization in SVG often includes a lot of SVG DOM manipulation. The code above uses [setAttribute](https://developer.mozilla.org/docs/Web/API/Element/setAttribute) to move and resize the visualization according to the position and the size of the node. There are alternatives, such as modifying those values directly via the JavaScript API for certain SVG elements. Not all attributes can be set that way and, e.g., colors will still require `setAttribute` calls:

```
rect.x.baseVal.value = x
rect.y.baseVal.value = y
rect.width.baseVal.value = width
rect.height.baseVal.value = height
```

Besides [SvgVisual](https://docs.yworks.com/yfileshtml/#/api/SvgVisual), which can contain only an SVG element, there are other visuals as well, for example [HtmlVisual](https://docs.yworks.com/yfileshtml/#/api/HtmlVisual) for HTML elements.

[02 Create A Custom Shape](../../tutorial-style-implementation-node/02-create-a-custom-shape/)
