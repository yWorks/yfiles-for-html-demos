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
#

      04 Making the Style Configurable - Tutorial: Node Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-node-making-the-style-configurable.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/tutorial-style-implementation-node/04-making-the-style-configurable/).

Frequently, the visualized nodes differ in visual properties like color, dash-style, or icons, while looking generally the same. In this case, the style can define properties that let you configure certain details of the visualization, while using the same node style class.

In this example, we add a `fillColor` property to the style, that defines the color which is used to fill the node shape. For this purpose, we add a constructor-defined property without an explicit getter or setter.

```
/**
 * Creates a new instance of this style using the given fill color.
 * @param fillColor The color used to fill nodes.
 */
constructor(public fillColor?: string) {
  super()
}
```

The property can now be used in `createVisual` to set the fill color.

```
const fillColor = this.fillColor ?? '#0b7189'
pathElement.setAttribute('fill', fillColor)
```

Now, we can create nodes with different colors. The color can either be passed into the constructor, or specified later using the `fillColor` property. The fill color can also be changed dynamically during runtime.

```
// the color can be specified in the constructor
const styleWithRedFill = new CustomNodeStyle('#b91c3b')

// the fill color can also be changed later using the property on the style class
const styleWithPurpleFill = new CustomNodeStyle('grey')
styleWithPurpleFill.fillColor = '#9e7cb5'

// not specifying the fill color will use the default color
const styleWithDefaultFill = new CustomNodeStyle()
```

Note

All styles that share the same style instance will be rendered with the same fill color. Thus, changing the fill color of one node’s style will also affect the fill color of all other nodes that share the same style instance.

[05 Data from Tag](../../tutorial-style-implementation-node/05-data-from-tag/)
