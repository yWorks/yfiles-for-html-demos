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
# Simple Highlight Decorator

<img src="../../../doc/demo-thumbnails/simple-highlight.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/simple-highlight-decorator/).

This demo shows how to highlight a node or an edge when the mouse hovers over the said node or edge.

## Highlight Decoration

The demo uses the [NodeStyleIndicatorRenderer](https://docs.yworks.com/yfileshtml/#/api/NodeStyleIndicatorRenderer) and [EdgeStyleIndicatorRenderer](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleIndicatorRenderer) classes to define custom highlight visualizations for nodes and edges.

These renderers are registered with the graph's [decorator](https://docs.yworks.com/yfileshtml/#/api/IGraph#decorator) to customize the appearance of highlighted graph elements.

## Things to Try

Hover over any node or edge to observe the custom highlight effect.

## Documentation

- [Decorating graph components](https://docs.yworks.com/yfileshtml/#/dguide/customizing_graph-graph_decorator)
- [NodeStyleIndicatorRenderer](https://docs.yworks.com/yfileshtml/#/api/NodeStyleIndicatorRenderer)
- [EdgeStyleIndicatorRenderer](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleIndicatorRenderer)
