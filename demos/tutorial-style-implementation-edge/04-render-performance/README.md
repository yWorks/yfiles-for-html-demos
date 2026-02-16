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
# 04 Render Performance - Tutorial: Edge Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-edge-render-performance.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-edge/04-render-performance/).

Until now, we have only implemented the [createVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#createVisual) method, which creates a new DOM element for each render frame. This is not an efficient approach and will result in performance issues for large graphs.

By overriding the [updateVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#updateVisual) method, we can optimize the rendering performance in case no visualization-relevant data of the edge has changed. For example, if the location of a bend changes, we have to update the path. This approach will greatly improve the rendering performance for gestures such as panning and zooming the viewport.

## Adjusting createVisual

To be able to update the visualization in [updateVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#updateVisual), we have to store the values with which the initial visualization was created. In this case, this is just the path of the edge. To get proper type-checking, we first declare the type of the data cache. This is where the yFiles' utility type [TaggedSvgVisual](https://docs.yworks.com/yfileshtml/api/TaggedSvgVisual) comes in handy:

```
// the values we use to render the graphics
type Cache = { generalPath: GeneralPath }

// the type of visual we create and update in CustomEdgeStyle
type CustomEdgeStyleVisual = TaggedSvgVisual<SVGGElement, Cache>
```

With this type declaration, we can augment the class declaration for our edge style. [EdgeStyleBase](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase) comes with an optional type argument which specifies the exact type for the visual returned by [createVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#createVisual). This type argument ensures that [updateVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#updateVisual) expects the type of visual that is created in [createVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#createVisual). Although this is not strictly necessary, it helps with the TypeScript implementation:

```
export class CustomEdgeStyle extends EdgeStyleBase<CustomEdgeStyleVisual> {
```

To properly implement the interface and store the cache value with the visual, we adjust the [createVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#createVisual) method, first.

```
protected createVisual(
  context: IRenderContext,
  edge: IEdge
): CustomEdgeStyleVisual {
  const generalPath = super.getPath(edge)!
  const croppedGeneralPath = super.cropPath(
    edge,
    IArrow.NONE,
    IArrow.NONE,
    generalPath
  )!

  const widePath = croppedGeneralPath.createSvgPath()
  widePath.setAttribute('fill', 'none')
  widePath.setAttribute('stroke', 'black')
  widePath.setAttribute('stroke-width', '4')

  const thinPath = croppedGeneralPath.createSvgPath()
  thinPath.setAttribute('fill', 'none')
  thinPath.setAttribute('stroke', 'white')
  thinPath.setAttribute('stroke-width', '2')

  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  group.append(widePath, thinPath)

  // we use the factory method to create a properly typed SvgVisual
  return SvgVisual.from(group, { generalPath })
```

## Implementing updateVisual

Finally, we are ready to add the [updateVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#updateVisual) implementation. Thanks to type parameter, we can let our IDE create the matching signature for the [updateVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#updateVisual) method. In the method, we update the data of both SVG paths and cache the new path if the edge’s path has changed. Otherwise, we return the old visual without changes.

```
protected updateVisual(
  context: IRenderContext,
  oldVisual: CustomEdgeStyleVisual,
  edge: IEdge
): CustomEdgeStyleVisual {
  const cache = oldVisual.tag
  const oldGeneralPath = cache.generalPath
  const newGeneralPath = super.getPath(edge)!

  if (!newGeneralPath.hasSameValue(oldGeneralPath)) {
    const croppedGeneralPath = super.cropPath(
      edge,
      IArrow.NONE,
      IArrow.NONE,
      newGeneralPath
    )!
    const pathData = croppedGeneralPath.createSvgPathData()

    const group = oldVisual.svgElement
    const widePath = group.children[0]
    const thinPath = group.children[1]

    widePath.setAttribute('d', pathData)
    thinPath.setAttribute('d', pathData)

    cache.generalPath = newGeneralPath
  }
  return oldVisual
}
```

Note

Although implementing [updateVisual](https://docs.yworks.com/yfileshtml/api/EdgeStyleBase#updateVisual) is technically optional, it is highly recommended for larger graphs. Refraining from an efficient implementation may result in low frame-rates during animations and interactive gestures.

[05 Making the Style Configurable](../../tutorial-style-implementation-edge/05-making-the-style-configurable/)
