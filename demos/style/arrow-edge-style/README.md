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
# Arrow Edge Style Demo

<img src="../../../doc/demo-thumbnails/arrow-edge-style.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/style/arrow-edge-style/).

The [ArrowEdgeStyle](https://docs.yworks.com/yfileshtml/#/api/ArrowEdgeStyle) provides several properties to customize its shape. There are five basic [shapes](https://docs.yworks.com/yfileshtml/#/api/ArrowEdgeStyle#shape) provided.

For the [Arrow](https://docs.yworks.com/yfileshtml/#/api/ArrowStyleShape#ARROW), [Double Arrow](https://docs.yworks.com/yfileshtml/#/api/ArrowStyleShape#DOUBLE_ARROW) and [Notched Arrow](https://docs.yworks.com/yfileshtml/#/api/ArrowStyleShape#NOTCHED_ARROW) shapes, the thickness of the arrow shaft can be defined as a [shaft ratio](https://docs.yworks.com/yfileshtml/#/api/ArrowEdgeStyle#shaftRatio) of the edge size.

For all shapes, the [angle](https://docs.yworks.com/yfileshtml/#/api/ArrowEdgeStyle#angle) of the arrow tip can be defined. It is the angle between an arrow blade and the perpendicular to which the arrow is pointing.

The edge style supports separate cropping values for the [source](https://docs.yworks.com/yfileshtml/#/api/ArrowEdgeStyle#sourceCropping) and [target](https://docs.yworks.com/yfileshtml/#/api/ArrowEdgeStyle#targetCropping) end to specify the distance that the tip of the arrow shape should stay away from the intersection with its source / target shape. This demo provides a single slider to adjust both, source and target cropping, simultaneously.

## Things to try

- Select an edge and see its style settings in the property panel on the right-hand side.
- Change some of the settings while an edge is selected and see how it affects the selected edge.
- Move a node and observe how the shapes of the connected edges change.
- Create new edges between nodes using the style settings of the property panel.
