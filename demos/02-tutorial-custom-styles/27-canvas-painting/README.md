# Canvas Painting - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step27.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/27-canvas-painting/index.html).

Custom Styles Tutorial

# Canvas Painting

This step shows how to implement a zoom-dependent high-performance rendering using HTML5 Canvas painting for nodes. With the _High Performance_ button, you can switch between the normal SVG-based rendering and the Canvas painting.

## Description

To use Canvas painting, the style must create `Visuals` that extend [HtmlCanvasVisual](https://docs.yworks.com/yfileshtml/#/api/HtmlCanvasVisual). In this demo, the style which was developed in the earlier tutorial steps has been modified such that its methods `createVisual()` and `updateVisual()` return an `HtmlCanvasVisual` implementation at low zoom levels.

This, together with a very simplified visualization, enables very fast rendering, especially suited for a large number of nodes at a low zoom level.

## Things to Try

- Click "Start Animation" to see the performance of the SVG based node rendering.
- Turn on "High Performance" and click "Start Animation" to see the benefit of the zoom dependent canvas painting.
- Zoom in and out to see the automatic change between the two visualizations.
- Take a look at class `CircleVisual` and methods `MySimpleNodeStyle.createVisual()` and `MySimpleNodeStyle.updateVisual()`.
