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
# Edge Bundling Demo

<img src="../../../doc/demo-thumbnails/edge-bundling.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/edgebundling/).

This demo shows how edge bundling can be applied for reducing visual cluttering in dense graphs.

The edge curves are drawn using piecewise cubic bezier curves with gradient colors from dark-blue (that starts from the source node) to light-blue (that leads to the target node of the edge). For the approximation of the edge curves, a [CurveFittingLayoutStage](https://docs.yworks.com/yfileshtml/#/api/CurveFittingLayoutStage) is applied.

For circular layouts, a circular-sector style is used for the visualization of the nodes.

## Things to Try

- Select one of the layout algorithms that support edge bundling using the combo-box in the toolbar.
- Modify the strength of the bundles using the slider in the toolbar and notice how this change influences the shape of the curves of the bundled edges. Values close to `1` lead to tight bundles, while values close to `0` lead to straight-line non-bundled edges. Values larger than `0.85` are recommended.
- Hover over an edge to highlight its path and its source and target nodes. The edges are highlighted also with gradient colors from red (source node) to gold (target node).
- Hover over a node to highlight its adjacent edges.
- Right-click on a node to open a popup-menu and determine whether the edges adjacent to the particular node or to all other currently selected nodes should be bundled or not.
- Right-click on an edge to open a popup-menu and determine whether the particular edge or all other currently edges should be bundled or not.
