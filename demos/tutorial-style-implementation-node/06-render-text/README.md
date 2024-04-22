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
# 06 Rendering Text - Tutorial: Node Style Implementation

# Rendering text

Not all visualisations consist of shapes and colors. Frequently, the business data stored in the `tag` property also contains textual content that should be rendered. Although yFiles for HTML offers labels for that purpose, text can also be rendered as part of the node visualization. This can be useful when users don’t need to interact with the text, or when the text should be integrated into the node visualization.

We add another property to the node `tag`s that contains the node title.

```
graph.createNode({
  layout: [0, 0, 100, 70],
  tag: { color: '#b91c3b', title: 'Title' }
})
graph.createNode({
  layout: [140, 0, 100, 70],
  tag: {
    color: '#9e7cb5',
    title: 'Long title',
    showBadge: true
  }
})
```

yFiles for HTML offers the [TextRenderSupport](https://docs.yworks.com/yfileshtml/#/api/TextRenderSupport) utility class to measure and render text. Compared with just a plain SVG `<text>` element it supports wrapping and trimming text based on a specified maximum size. In this example, we add text to the “tab” in a way that the text is cut off with an ellipsis if it doesn’t fit.

```
const title = node.tag?.title
if (title) {
  const text = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text'
  )
  text.setAttribute('fill', '#eee')
  SvgVisual.setTranslate(text, 10, 2)

  TextRenderSupport.addText({
    targetElement: text,
    text: node.tag.title,
    font: new Font('sans-serif', 10),
    wrapping: TextWrapping.CHARACTER_ELLIPSIS,
    maximumSize: new Size(tabWidth - 12, 15)
  })

  g.append(text)
}
```

[07 Hit-Testing](../../tutorial-style-implementation-node/07-hit-testing/)
