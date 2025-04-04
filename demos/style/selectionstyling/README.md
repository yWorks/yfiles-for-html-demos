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
# Selection Styling Demo

<img src="../../../doc/demo-thumbnails/selection-styling.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/style/selectionstyling/).

The Selection Styling demo shows customized selection painting of nodes, edges and labels by decorating these items with a corresponding style.

Customizing the painting of the focus indicator and the highlighting is possible as well but not shown in this demo.

## Things to Try

- Switch between the default visualization and the _Custom Selection Decoration_ of nodes, edges and labels with the toolbar buttons.
- Test the different _Zoom Modes_ for the custom selection rendering.

## Zoom Mode

Specifies how the zoom level affects the custom selecting painting.

Zoom with graph

The visual is rendered in the world coordinate space and scales with the zoom level like a regular graph item visualization, for example a node style.

Always the same size

The visual is rendered in the view coordinate space and doesn't scale with the zoom level, similar to the default node resize handles, for example.

Mixed

Uses world coordinates for zoom level ≥ 1 and view coordinates for zoom level < 1.

No downscaling

Uses world coordinates for zoom level ≥ 1 and view coordinates for zoom level < 1, but in the latter case, the visual does not scale down below its initial size.
