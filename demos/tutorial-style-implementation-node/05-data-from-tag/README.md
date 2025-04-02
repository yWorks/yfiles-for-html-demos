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
# 05 Data from Tag - Tutorial: Node Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-node-data-from-tag.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-node/05-data-from-tag/).

In the last step, we added a property to the style to change the visualization. Now, we want to be even more versatile and change the visualization based on the data of each visualized node.

Note

yFiles for HTML provides a `tag` property for all graph items, which is frequently used to bind business objects to nodes and edges. The style can make use of this data and translate it to a visual representation.

In this example, we adjust the style implementation to use the `color` stored in the node’s `tag` instead of using the color from a style property. First, we add two nodes with different `tag` objects.

```
graph.createNode({
  layout: [0, 0, 100, 70],
  tag: { color: '#b91c3b' },
  labels: ['Red']
})
graph.createNode({
  layout: [140, 0, 100, 70],
  tag: { color: '#9e7cb5', showBadge: true },
  labels: ['Purple with badge']
})
```

Then we adjust the style accordingly. The tag’s `color` property will become the background color of the shape we created earlier.

```
const fillColor = node.tag?.color ?? '#0b7189'
pathElement.setAttribute('fill', fillColor)
```

Of course, you are not limited to only changing colors in this manner. Earlier, one node’s tag includes a `showBadge` property, which we can use to add another element to the visualization.

Since there are now two SVG elements, we can no longer just return the path. Instead, we have to wrap both the path and the badge in a `<g>` element to group them together. We will also move the `setTranslate` call to translate the group instead of just the path:

```
const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
SvgVisual.setTranslate(g, x, y)

g.append(pathElement)

const showBadge = node.tag?.showBadge
if (showBadge) {
  const badge = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'circle'
  )
  badge.setAttribute('r', '8')
  badge.setAttribute('fill', '#6c9f44')
  badge.setAttribute('stroke', '#496c2e')
  g.append(badge)
}

return SvgVisual.from(g, {
  width,
  height,
  fillColor,
  showBadge
})
```

Note

If the style uses the tag data to customize the visualization, it is possible to share a single style instance between multiple items. Using this pattern, the style can create different visualizations depending on the business data.

[06 Rendering Text](../../tutorial-style-implementation-node/06-render-text/)
