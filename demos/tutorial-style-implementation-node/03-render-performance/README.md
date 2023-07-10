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
# 03 Render Performance - Node Style Implementation Tutorial

# Improving rendering performance

Until now, we have only implemented [createVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#NodeStyleBase-method-createVisual), which creates a new DOM element for each render frame. This is not an efficient approach and will result in performance issues for large graphs.

By overriding [updateVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#NodeStyleBase-method-updateVisual), we can optimize the rendering performance in case no visualization-relevant data of the node has changed. For example, if the node size changes, we have to update the path data to fit the node. This approach will greatly improve the rendering performance for gestures such as panning and zooming the viewport as well as moving nodes.

## Adjusting createVisual

As a first step, we modify the [createVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#NodeStyleBase-method-createVisual) implementation. Instead of using the node’s `x`\- and `y`\-position in the path, we create the path at (0,0). We then use [setTranslate](https://docs.yworks.com/yfileshtml/#/api/SvgVisual#SvgVisual-defaultmethod-setTranslate) to set a transform that moves the path to the node location.

```
// we render the path at 0,0 and translate the visual to it's final location
pathElement.setAttribute('d', createPathData(0, 0, width, height))
SvgVisual.setTranslate(pathElement, x, y)
```

To be able to efficiently update the visualization in [updateVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#NodeStyleBase-method-updateVisual), we have to store the values that we needed for the construction of the node with the visual. In this case this is just the size. In order to get proper type-checking, we first declare the type of the data cache. This is where the yFiles' utility type [TaggedSvgVisual](https://docs.yworks.com/yfileshtml/#/api/TaggedSvgVisual) comes in handy:

```
// the values we use to render the graphics
type Cache = {
  width: number
  height: number
}

// the type of visual we create and update in CustomNodeStyle
type CustomNodeStyleVisual = TaggedSvgVisual<SVGPathElement, Cache>
```

With this type declaration we can augment the class declaration for our node style. [NodeStyleBase](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase) comes with an optional type argument which specifies the exact type for the visual returned by `createVisual`. Using this type argument, we can ensure that `updateVisual` gets the same type of visual that have been created in `createVisual`. Although this is not strictly necessary, it helps with the TypeScript implementation:

```
export class CustomNodeStyle extends NodeStyleBase<CustomNodeStyleVisual> {
```

To properly implement the interface and store the cache value with the visual, we adjust the `createVisual` method, first.

```
protected createVisual(
  context: IRenderContext,
  node: INode
): CustomNodeStyleVisual {
  const { x, y, width, height } = node.layout

  const pathElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  )
  // we render the path at 0,0 and translate the visual to it's final location
  pathElement.setAttribute('d', createPathData(0, 0, width, height))
  SvgVisual.setTranslate(pathElement, x, y)

  pathElement.setAttribute('fill', '#0b7189')
  pathElement.setAttribute('stroke', '#042d37')

  // we use the factory method to create a properly typed SvgVisual
  return SvgVisual.from(pathElement, { width, height })
}
```

## Implementing updateVisual

Now we are ready to add the [updateVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#NodeStyleBase-method-updateVisual) implementation. With the type parameter, we can let our IDE create the matching signature for the `updateVisual` method. In the method, in case the node size has changed, we update the path layout and the cache data. Finally, we call [setTranslate](https://docs.yworks.com/yfileshtml/#/api/SvgVisual#SvgVisual-defaultmethod-setTranslate) to update the location.

```
protected updateVisual(
  context: IRenderContext,
  oldVisual: CustomNodeStyleVisual,
  node: INode
): CustomNodeStyleVisual {
  const { x, y, width, height } = node.layout
  // get the path element that needs updating from the old visual
  const pathElement = oldVisual.svgElement
  // get the cache object we stored in createVisual
  const cache = oldVisual.tag

  if (width !== cache.width || height !== cache.height) {
    // update the path data to fit the new width and height
    pathElement.setAttribute('d', createPathData(0, 0, width, height))
    oldVisual.tag = { width, height }
  }

  SvgVisual.setTranslate(pathElement, x, y)
  return oldVisual
}
```

This code re-uses the initial SVG element and only updates the necessary attributes.

When the style gets more complex, there may be a point where some updates are difficult to implement, or are not worth the effort. It’s perfectly valid to give up at some point and call `createVisual` again when too much changes at once, or the update code gets too complex.

Note

Although implementing [updateVisual](https://docs.yworks.com/yfileshtml/#/api/NodeStyleBase#NodeStyleBase-method-updateVisual) is technically optional, it is highly recommended for larger graphs. Refraining from an efficient implementation may result in low frame-rates during animations and interactive gestures.

[04 Making the Style Configurable](../../tutorial-style-implementation-node/04-making-the-style-configurable/index.html)
