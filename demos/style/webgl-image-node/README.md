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
# WebGL Image Node Demo

<img src="../../../doc/demo-thumbnails/webgl-icon-node.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/style/webgl-image-node/).

This demo shows how to display images in nodes rendered with [WebGL](https://docs.yworks.com/yfileshtml/#/dguide/webgl2) using [WebGLImageNodeStyle](https://docs.yworks.com/yfileshtml/#/api/WebGLImageNodeStyle).

The images are pre-rendered and passed to the node style as [ImageData](https://developer.mozilla.org/docs/Web/API/ImageData) objects. This enables the developer to load images from arbitrary sources.

This demo shows how to use images from files (SVG, PNG) and data URIs. Also, it is demonstrated how to render an icon font ([FontAwesome](https://fontawesome.com/) in this case) and use it as a node image.

The images with fill color don't use the image's original color, but are filled with the "imageColor" specified in the node style. This allows creating icons with different coloring from the same image.

### Things to Try

- Select and resize the "Keep Aspect Ratio" nodes.
- Select and resize one of the other nodes to see how the image is stretched to the node layout.
- Select the "Large" sample to create a large graph with 100.000 nodes. Observe the rendering performance by panning and zooming the graph with the mouse.
- Take a look at the source code to see how the images are rendered and passed to the node style.
