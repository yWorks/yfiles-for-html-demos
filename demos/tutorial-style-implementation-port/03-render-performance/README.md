<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# 03 Render Performance - Tutorial: Port Style Implementation

# Improving rendering performance

Until now, we have only implemented [createVisual](https://docs.yworks.com/yfileshtml/#/api/PortStyleBase#PortStyleBase-method-createVisual), which creates a new DOM element for each render frame. This is not an efficient approach and will result in performance issues for large graphs.

By overriding [updateVisual](https://docs.yworks.com/yfileshtml/#/api/PortStyleBase#PortStyleBase-method-updateVisual), we can optimize the rendering performance in case no visualization-relevant data of the port has changed. In our case, this means that we only update the location and radius of the circle if necessary. This approach will greatly improve the rendering performance for gestures such as panning and zooming the viewport as well as moving items.

## Adjusting createVisual

As a first step, we modify the [createVisual](https://docs.yworks.com/yfileshtml/#/api/PortStyleBase#PortStyleBase-method-createVisual) implementation. To be able to update the visualization in [updateVisual](https://docs.yworks.com/yfileshtml/#/api/PortStyleBase#PortStyleBase-method-updateVisual), we have to store the values that we needed for the construction of the port with the visual. In this case, this is just the port size. To get proper type-checking, we first declare the type of the data cache. This is where the yFiles' utility type [TaggedSvgVisual](https://docs.yworks.com/yfileshtml/#/api/TaggedSvgVisual) comes in handy:

```
// the values we use to render the graphics
type Cache = {
  size: number
}

// the type of visual we create and update in CustomPortStyle
type CustomPortStyleVisual = TaggedSvgVisual<SVGEllipseElement, Cache>
```

With this type declaration, we can augment the class declaration for our port style. [PortStyleBase](https://docs.yworks.com/yfileshtml/#/api/PortStyleBase) comes with an optional type argument which specifies the exact type for the visual returned by `createVisual`. This type argument ensures that `updateVisual` expects the type of visual that is created in `createVisual`. Although this is not strictly necessary, it helps with the TypeScript implementation:

```
export class CustomPortStyle extends PortStyleBase<CustomPortStyleVisual> {
```

To properly implement the interface and store the cache value with the visual, we adjust the `createVisual` method, first.

```
protected createVisual(
  context: IRenderContext,
  port: IPort
): CustomPortStyleVisual {
  const ellipseElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'ellipse'
  )
  const { x, y } = port.location
  ellipseElement.setAttribute('cx', String(x))
  ellipseElement.setAttribute('cy', String(y))
  const radius = this.size * 0.5
  ellipseElement.setAttribute('rx', String(radius))
  ellipseElement.setAttribute('ry', String(radius))
  ellipseElement.setAttribute('fill', '#6c9f44')
  ellipseElement.setAttribute('stroke', '#e6f8ff')
  ellipseElement.setAttribute('stroke-width', '1')

  const cache = { size: this.size }

  return SvgVisual.from(ellipseElement, cache)
}
```

## Implementing updateVisual

Now we are ready to add the [updateVisual](https://docs.yworks.com/yfileshtml/#/api/PortStyleBase#PortStyleBase-method-updateVisual) implementation. In case the size property has changed, we update the `rx` and `ry` attributes of the ellipse element. Also, we set the `cx` and `cy` attributes to update the location.

```
protected updateVisual(
  context: IRenderContext,
  oldVisual: CustomPortStyleVisual,
  port: IPort
): CustomPortStyleVisual {
  const { x, y } = port.location
  // get the ellipse element that needs updating from the old visual
  const ellipseElement = oldVisual.svgElement
  // get the cache object we stored in createVisual
  const cache = oldVisual.tag

  if (cache.size !== this.size) {
    const radius = this.size * 0.5
    ellipseElement.setAttribute('rx', String(radius))
    ellipseElement.setAttribute('ry', String(radius))
    cache.size = this.size
  }

  // move the visualization to the port location
  ellipseElement.setAttribute('cx', String(x))
  ellipseElement.setAttribute('cy', String(y))

  return oldVisual
}
```

This code re-uses the initial SVG element and only updates the necessary attributes.

When the style gets more complex, there may be a point where some updates are difficult to implement, or are not worth the effort. It is perfectly valid to give up at some point and call `createVisual` again if there are too many changes or the update code gets too complex.

Note

Although implementing [updateVisual](https://docs.yworks.com/yfileshtml/#/api/PortStyleBase#PortStyleBase-method-updateVisual) is technically optional, it is highly recommended for larger graphs. Refraining from an efficient implementation may result in low frame rates during animations and interactive gestures.

[04 Conditional Port Coloring](../../tutorial-style-implementation-port/04-conditional-coloring/)
