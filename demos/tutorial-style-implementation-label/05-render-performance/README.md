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
# 05 Render Performance - Tutorial: Label Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-label-render-performance.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-label/05-render-performance/).

Until now, we have only implemented [createVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#LabelStyleBase-method-createVisual), which creates a new DOM element for each render frame. This is not an efficient approach and will result in performance issues for large graphs.

By overriding [updateVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#LabelStyleBase-method-updateVisual), we can optimize the rendering performance in case no visualization-relevant data of the node has changed. If the label text or size changes, we have to update the text and the background path data. This approach will greatly improve the rendering performance for gestures such as panning and zooming the viewport as well as moving nodes.

## Adjusting createVisual

To be able to update the visualization in [updateVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#LabelStyleBase-method-updateVisual), we have to store the the values with which the initial visualization was created. In this case, this is the label text and size. To get proper type-checking, we first declare the type of the data cache. This is where the yFiles' utility type [TaggedSvgVisual](https://docs.yworks.com/yfileshtml/#/api/TaggedSvgVisual) comes in handy:

```
// the values we use to render the graphics
type Cache = { width: number; height: number; text: string }

// the type of visual we create and update in CustomLabelStyle
type CustomLabelStyleVisual = TaggedSvgVisual<SVGGElement, Cache>
```

With this type declaration, we can augment the class declaration for our label style. [LabelStyleBase](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase) comes with an optional type argument which specifies the exact type for the visual returned by `createVisual`. This type argument ensures that `updateVisual` expects the type of visual that is created in `createVisual`. Although this is not strictly necessary, it helps with the TypeScript implementation:

```
export class CustomLabelStyle extends LabelStyleBase<CustomLabelStyleVisual> {
```

To properly implement the interface and store the cache value with the visual, we adjust the `createVisual` method, first.

```
protected createVisual(
  context: IRenderContext,
  label: ILabel
): CustomLabelStyleVisual {
  // create an SVG text element that displays the label text
  const textElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text'
  )

  const labelSize = label.layout.toSize()
  TextRenderSupport.addText(textElement, label.text, font)

  textElement.setAttribute('transform', `translate(${padding} ${padding})`)

  // add a background shape
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

  const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  gElement.appendChild(backgroundPathElement)
  gElement.appendChild(textElement)

  // move text to label location
  const transform = LabelStyleBase.createLayoutTransform(
    context,
    label.layout,
    true
  )
  transform.applyTo(gElement)

  const cache = {
    width: labelSize.width,
    height: labelSize.height,
    text: label.text
  }
  return SvgVisual.from(gElement, cache)
```

## Implementing updateVisual

Now, we are ready to add the [updateVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#LabelStyleBase-method-updateVisual) implementation. Thanks to type parameter, we can let our IDE create the matching signature for the `updateVisual` method. In case the label text or size has changed, we update the text content and the background path data and the cache data. Finally, we update the label transform to move the label to the correct location.

```
protected updateVisual(
  context: IRenderContext,
  oldVisual: CustomLabelStyleVisual,
  label: ILabel
): CustomLabelStyleVisual {
  const gElement = oldVisual.svgElement
  const labelSize = label.layout.toSize()
  // get the cache object we stored in createVisual
  const cache = oldVisual.tag

  // check if the label size or text has changed
  if (
    labelSize.width !== cache.width ||
    labelSize.height !== cache.height ||
    label.text !== cache.text
  ) {
    // get the path and text element
    const backgroundPath = gElement.children.item(0)
    const textElement = gElement.children.item(1)
    if (backgroundPath) {
      backgroundPath.setAttribute(
        'd',
        this.createBackgroundShapeData(labelSize)
      )
    }
    if (textElement instanceof SVGTextElement) {
      TextRenderSupport.addText(textElement, label.text, font)
    }

    // update the cache with the new values
    cache.width = labelSize.width
    cache.height = labelSize.height
    cache.text = label.text
  }

  // move text to label location
  const transform = LabelStyleBase.createLayoutTransform(
    context,
    label.layout,
    true
  )
  transform.applyTo(gElement)

  return oldVisual
}
```

This code re-uses the initial SVG elements and only updates the necessary attributes.

When the style gets more complex, there may be a point where some updates are difficult to implement, or are not worth the effort. It is perfectly valid to give up at some point and call `createVisual` again if there are too many changes or the update code gets too complex.

Note

Although implementing [updateVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#LabelStyleBase-method-updateVisual) is technically optional, it is highly recommended for larger graphs. Refraining from an efficient implementation may result in low frame-rates during animations and interactive gestures.

[06 Text Alignment](../../tutorial-style-implementation-label/06-text-alignment/)
