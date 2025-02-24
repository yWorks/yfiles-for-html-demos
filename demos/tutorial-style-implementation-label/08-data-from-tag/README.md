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
# 08 Data From Tag - Tutorial: Label Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-label-data-from-tag.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/tutorial-style-implementation-label/08-data-from-tag/).

In the last two steps, we’ve added properties to the style to configure how the style renders a label. Now, we want to be even more versatile and change the visualization based on the data of each visualized label.

Note

yFiles for HTML provides a tag property for all graph items, which is frequently used to bind business objects to nodes, edges and labels. The style can make use of this data and translate it to a visual representation.

In this example, we adjust the style implementation to use an icon url stored in the label’s tag to add an icon next to the label text. Also, we will add an option to set the background color of the label. First, we add labels with different tag objects. Each tag can have an `iconUrl` and a `backgroundColor`.

```
graph.addLabel({
  owner: node3,
  text: 'Label with background color and icon',
  tag: {
    iconUrl: 'resources/settings-16.svg',
    backgroundColor: '#9DC6D0'
  }
})
```

We add an `iconSize` variable to our style that defines how big the icon should be.

```
const iconSize = 16
```

Since we want to display the icon next to the text, we have to adjust the `getPreferredSize` to include the icon size, if necessary.

```
if (label.tag?.iconUrl) {
  size = new Size(
    size.width + iconSize + padding,
    Math.max(size.height, iconSize + padding + padding)
  )
}
```

Then, we can modify `createVisual` to add an SVG `<image>` to the visualization, that displays the icon referenced in the tag.

```
const iconUrl = label.tag?.iconUrl
let imageElement: SVGImageElement | undefined
if (iconUrl) {
  imageElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'image'
  )
  imageElement.setAttribute('href', iconUrl)
  imageElement.setAttribute('width', String(iconSize))
  imageElement.setAttribute('height', String(iconSize))
  const translateX = labelSize.width - iconSize - padding
  imageElement.setAttribute(
    'transform',
    `translate(${translateX} ${padding})`
  )
}
```

Finally, we add the image to the `<g>` element.

```
if (imageElement) {
  gElement.appendChild(imageElement)
}
```

In order to apply the background color, we have to change how the `fill` property of the background path is applied.

```
backgroundPathElement.setAttribute(
  'fill',
  label.tag?.backgroundColor || '#fffecd'
)
```

Note

If the style uses the tag data to customize the visualization, it is possible to share a single style instance between multiple items. Using this pattern, the style can create different visualizations depending on the business data.

[09 Hit-Testing](../../tutorial-style-implementation-label/09-hit-testing/)
