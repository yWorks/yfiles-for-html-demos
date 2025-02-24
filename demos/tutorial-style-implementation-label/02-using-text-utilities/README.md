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
# 02 Using Text Utilities - Tutorial: Label Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-label-using-text-utilities.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/tutorial-style-implementation-label/02-using-text-utilities/).

In the previous step, we’ve learned how to render the label text with the DOM api. In this step, we’ll use the utility class [TextRenderSupport](https://docs.yworks.com/yfileshtml/#/api/TextRenderSupport) to place text more conveniently.

Note

[TextRenderSupport](https://docs.yworks.com/yfileshtml/#/api/TextRenderSupport) adds important features that the SVG does not support out-of-the-box, like text measuring, wrapping and trimming. We’ll use more of these features later in this tutorial.

To be able to work with TextRenderSupport, we need a [Font](https://docs.yworks.com/yfileshtml/#/api/Font). We add a default font to the label style.

```
const font: Font = new Font({
  fontFamily: 'Arial',
  fontSize: 12
})
```

We can then use [TextRenderSupport.addText](https://docs.yworks.com/yfileshtml/#/api/TextRenderSupport#TextRenderSupport-method-addText) to place the label text in the `<text>` element.

```
TextRenderSupport.addText(textElement, label.text, font)
```

In this example, we want to give the text a small horizontal padding of 3.

```
textElement.setAttribute('transform', `translate(${padding} 0)`)
```

Since this code sets the transform of the text element, we have to wrap it in a `<g>` to still be able to apply the label layout transformation.

```
const gElement = document.createElementNS('http://www.w3.org/2000/svg', 'g')
gElement.appendChild(textElement)

// move text to label location
const transform = LabelStyleBase.createLayoutTransform(
  context,
  label.layout,
  true
)
transform.applyTo(gElement)

return new SvgVisual(gElement)
```

[03 Adding a Background Shape](../../tutorial-style-implementation-label/03-add-background-shape/)
