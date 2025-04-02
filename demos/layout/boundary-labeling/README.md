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
# Boundary Labeling

<img src="../../../doc/demo-thumbnails/boundary-labeling.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/boundary-labeling/).

This demo shows how to configure the [Organic Layout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) algorithm for annotating a set of points on a diagram (map, technical drawing, etc.).

The labeling approach followed in this demo is known as "boundary labeling" and the goal is to place the labels outside the boundary of the drawing.

The dataset of this demo consists of points and some text that is associated with each point. For each of these points a label node is created that displays the information associated with the point.

This demo defines constraints for the [Organic Layout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) algorithm to make sure that each label is placed on the correct side of the drawing based on the point's position, i.e., left/right or top/bottom. It also defines constraints for the vertical alignment of the label nodes.

## Things to try

Change the font size of the labels using the slider in the toolbar and observe how the algorithm re-arranges the labels.
