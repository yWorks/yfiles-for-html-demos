<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Large Graphs Demo

# Large Graphs Demo

This demo shows how to display large graphs with both good performance and high quality. For this, the demo uses _[WebGL2](https://docs.yworks.com/yfileshtml/#/dguide/webgl2)_ rendering on small zoom levels and switches to high quality _SVG_ rendering when the user zoomed-in above a certain threshold.

Due to its vector graphics, SVG is very well suited for high-quality rendering with lots of details and crisp text. If a large number of graphical elements needs to be displayed at the same time, the browser's rendering engine reaches its limits and the rendering starts to lag.

Rendering a large number of elements which are not too detailed is where WebGL2 rendering shines. Therefore, this demo relies on this rendering method when elements on the screen get smaller and details are less recognizable anyway.

Depending on the desired item visualization, using WebGL2 rendering for all zoom values is a valid option, too. You can disable SVG rendering completely in the toolbar.

## Hierarchic sample

The node styles for both SVG and WebGL2 are instantiated with the same image data so that the transition between the rendering methods is as smooth as possible.

## Things to try

- Zoom in and out of the graph and observe the rendering method switch at the zoom threshold.
- Adjust the zoom threshold to a high value and zoom in to observe the fidelity difference between WebGL and SVG rendering.
- Adjust the zoom threshold to a small value to observe the performance difference between WebGL and SVG rendering.

In WebGL2 rendering, the node visualization only matches the color and shape of the SVG rendering but omits details like label text.

With SVG rendering, the nodes show additional information depending on the zoom level.

## Things to try

- Zoom in and out of the graph and observe the rendering method switch at the zoom threshold.
- Keep on zooming in above the zoom threshold and observe the display of additional information in the nodes.

## Graph information

Number of nodes:  
Number of edges:

## Display information

Rendering technique:  
Zoom level: **%**

## Troubleshooting

When encountering rendering issues or low frame rates, please refer to the _[WebGL2 Troubleshooting](https://docs.yworks.com/yfileshtml/#/dguide/webgl2_troubleshooting)_ section in the Developer's guide.
