# WebGL2 Icon Node Demo

<img src="../../resources/image/webgl-icon-node.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/style/webgl-icon-node/index.html).

This demo shows how to display icons in nodes rendered with [WebGL2](https://docs.yworks.com/yfileshtml/#/dguide/webgl2) using [WebGL2IconNodeStyle](https://docs.yworks.com/yfileshtml/#/api/WebGL2IconNodeStyle).

The icons are pre-rendered and passed to the node style as [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) objects. This enables the developer to load icons from arbitrary sources.

This demo shows how to use icons from image files (SVG, PNG) and data URIs. Also, it's demonstrated how to render an icon font ([FontAwesome](https://fontawesome.com/) in this case) and use it as a node icon.

The icons with fill color don't use the icon's original color, but are filled with the "iconColor" specified in the node style. This allows to create icons with different coloring from the same image.

### Things to Try

- Select and resize the "Keep Aspect Ratio" nodes.
- Select and resize one of the other nodes to see how the icon is stretched to the node layout.
- Select the "Large" sample to create a large graph with 100.000 nodes. Observe the rendering performance by panning and zooming the graph with the mouse.
- Take a look at the source code to see how the icons are rendered and passed to the node style.
