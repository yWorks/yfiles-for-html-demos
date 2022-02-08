# Overview Styling Demo

<img src="../../resources/image/overview.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/view/overviewstyles/index.html).

# Overview Styling Demo

This demo shows different ways to render and style the overview:

- With HTML Canvas using a [GraphOverviewCanvasVisualCreator](https://docs.yworks.com/yfileshtml/#/api/GraphOverviewCanvasVisualCreator)
- With SVG using a [GraphOverviewSvgVisualCreator](https://docs.yworks.com/yfileshtml/#/api/GraphOverviewSvgVisualCreator)
- With WebGL using a [GraphOverviewWebGLVisualCreator](https://docs.yworks.com/yfileshtml/#/api/GraphOverviewWebGLVisualCreator) This options is disabled because your browser does not support WebGL
- With a [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) that uses [OverviewInputMode](https://docs.yworks.com/yfileshtml/#/api/OverviewInputMode)

## Things to Try

Select the rendering technique in the combobox in the toolbar.

## Details

Of the supported rendering modes, Canvas and WebGL offer the best performance. Using SVG can make sense if you need high fidelity or high detail rendering, especially for smaller graphs. For such use cases, using a `GraphComponent` with `OverviewInputMode` is an option, too.

Keep in mind that the overview usually displays the whole graph at once, and thus complex SVG visualizations can lead to performance issues.
