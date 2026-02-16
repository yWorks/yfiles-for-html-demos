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
# Shape Port Style Demo

<img src="../../../doc/demo-thumbnails/shape-port-style.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/style/shape-port-style/).

This demo shows the main features of the [ShapePortStyle](https://docs.yworks.com/yfileshtml/api/ShapePortStyle) class, most notably its supported [shapes](https://docs.yworks.com/yfileshtml/api/ShapeNodeShape). The exact shape of each node port is displayed in the node label.

Besides shapes, the _color_, _size_, _outline_, _offset_ and _aspect ratio_ of ports can also be customized with ShapePortStyle.

One can also create fully custom port visualizations by extending the [PortStyleBase](https://docs.yworks.com/yfileshtml/api/PortStyleBase) class. See [Tutorial: Port Style Implementation](../../tutorial-style-implementation-port/01-render-port-shape/) for detailed tutorials.

## Things to Try

- Drag from one unselected port to another to create new connections.
- Drag a selected port to position it elsewhere.
- Drag a node around or resize it to see how its ports move accordingly.
