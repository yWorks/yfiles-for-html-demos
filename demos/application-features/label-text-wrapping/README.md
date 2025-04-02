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
# Label Text Wrapping - Application Features

<img src="../../../doc/demo-thumbnails/label-text-wrapping.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/label-text-wrapping/).

This demo shows how to enable the text wrapping and trimming feature provided by the [LabelStyle](https://docs.yworks.com/yfileshtml/#/api/LabelStyle) class. The options include [wrapping](https://docs.yworks.com/yfileshtml/#/api/LabelStyle#wrapping) at character or at word bounds, both with or without ellipsis.

Aside from wrapping in rectangular shapes, the [textWrappingShape](https://docs.yworks.com/yfileshtml/#/api/LabelStyle#textWrappingShape) property allows for wrapping in many more shapes like triangle, hexagon or ellipse. This can be combined with [padding](https://docs.yworks.com/yfileshtml/#/api/LabelStyle#textWrappingPadding) and [insets](https://docs.yworks.com/yfileshtml/#/api/LabelStyle#insets) to fine-tune the wrapping.

## Things to Try

- Select and resize the nodes to see how the different wrapping types behave.
- New interactively added labels use word wrapping with ellipsis.
- Try the right to left text direction. This will rebuild the graph with Hebrew text labels.
- Switch between SVG and WebGL rendering and observe that the styles are automatically converted. Note that in WebGL, the [textWrappingPadding](https://docs.yworks.com/yfileshtml/#/api/WebGLLabelStyle#textWrappingPadding) and [padding](https://docs.yworks.com/yfileshtml/#/api/WebGLLabelStyle#padding) properties are numbers, not of type [](https://docs.yworks.com/yfileshtml/#/api/Insets), like the corresponding properties of [](https://docs.yworks.com/yfileshtml/#/api/LabelStyle).

See the sources for details.
