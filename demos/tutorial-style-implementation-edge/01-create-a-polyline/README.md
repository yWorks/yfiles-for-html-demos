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
# 01 Create a Polyline - Edge Style Implementation Tutorial

# Custom edge visualizations

yFiles for HTML comes with predefined edge visualizations. However, in some cases, it is required to create fully custom visualizations based on SVG. This might be the case if you need edge visualizations that are not available out-of-the-box, or domain-specific edge visualizations. Also, the rendering of custom visualizations can be optimized for performance-critical applications.

This tutorial will guide you through creating your own edge visualizations for yFiles for HTML with SVG.

Note

Implementing a custom edge style from scratch is an advanced concept. In a lot of cases, other approaches like template styles, or decorating built-in styles with custom elements are sufficient. For more information the topic of styling graph items, please have a look at [Edge Styles](https://docs.yworks.com/yfileshtml/#/dguide/styles-edge_styles).

## Subclassing EdgeStyleBase

yFiles for HTML provides an abstract base class which provides the basic functionality to create a custom edge style. We start with a custom subclass of [EdgeStyleBase](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleBase).

```
class CustomEdgeStyle extends EdgeStyleBase {
  protected createVisual(context: IRenderContext, edge: IEdge): Visual | null {
    return null // TODO - create the SVG element
  }
}
```

This code will not produce anything visible, yet. We first have to implement the `createVisual` method. This method returns an SVG element, wrapped into an [SvgVisual](https://docs.yworks.com/yfileshtml/#/api/SvgVisual). Let’s begin with a polyline, which connects two nodes via multiple line segments running through its bends. We will switch to a more complex visualization later on. We use a SVGPathElement to render the polyline:

```
protected createVisual(context: IRenderContext, edge: IEdge): Visual | null {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', this.createPathData(edge))
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', 'black')
  path.setAttribute('stroke-width', '1')
  return new SvgVisual(path)
}
```

Note

The SVG element returned in `createVisual` does not necessarily have to be created using the JavaScript DOM API. You could also create it using any JavaScript UI framework or API like React, Vuejs, etc.

The `createPathData` method generates the path data for the SVG path element using the locations of the ports and bends of the edge.

```
private createPathData(edge: IEdge): string {
  const points = IEdge.getPathPoints(edge).toArray()
  return 'M ' + points.map(point => `${point.x} ${point.y}`).join(' L ')
}
```

Note

It’s important that SvgVisual contains an SVG element in the 'http://www.w3.org/2000/svg' namespace. HTML elements are not supported.

[02 Crop the Polyline](../../tutorial-style-implementation-edge/02-crop-the-polyline/index.html)
