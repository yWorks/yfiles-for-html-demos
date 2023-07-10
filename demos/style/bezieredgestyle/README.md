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
# Bezier Edge Style Demo

# Bezier Edge Style Demo

[BezierEdgeStyle](https://docs.yworks.com/yfileshtml/#/api/BezierEdgeStyle) allows for smooth curved edge routes. This demo shows how to use this style and interactively edit the bezier curves.

### Creating Edges

Start dragging at an unselected node and click on the canvas to add bends or control points for the bezier curve.

When _Smooth Editing_ is enabled, the edge path will consist of only smooth curves, otherwise there will occur sharp bends every other spline.

### Label Handling

Labels can also be arranged at the curved splines. They can be aligned with different orientations.

Select an edge and press `F2` to add a label or use the sample _Graph with Labels_ which provides labels with varying settings.

- _Auto Rotation_ will rotate the label according to its position at the curved path.
- _Auto Snapping_ moves the label as close to the edge path as possible.
- The _Angle_ rotates the label. If _Auto Rotation_ is enabled, the angle will be added to the rotation resulting from the curved path.
