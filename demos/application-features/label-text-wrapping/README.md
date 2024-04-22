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
# Label Text Wrapping - Application Features

# Label Text Wrapping

This demo shows how to enable the text wrapping and trimming feature provided by the [DefaultLabelStyle](https://docs.yworks.com/yfileshtml/#/api/DefaultLabelStyle) class. The options include [wrapping](https://docs.yworks.com/yfileshtml/#/api/DefaultLabelStyle#wrapping) at character or at word bounds, both with or without ellipsis.

Aside from wrapping in rectangular shapes, the [textWrappingShape](https://docs.yworks.com/yfileshtml/#/api/DefaultLabelStyle#textWrappingShape) property allows for wrapping in many more shapes like triangle, hexagon or ellipse. This can be combined with [padding](https://docs.yworks.com/yfileshtml/#/api/DefaultLabelStyle#textWrappingPadding) and [insets](https://docs.yworks.com/yfileshtml/#/api/DefaultLabelStyle#insets) to fine-tune the wrapping.

## Things to Try

- Select and resize the nodes to see how the different wrapping types behave.
- New interactively added labels use word wrapping with ellipsis.
- Try the right to left text direction. This will rebuild the graph with Hebrew text labels.

See the sources for details.
