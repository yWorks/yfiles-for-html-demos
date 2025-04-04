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
# Interactive Aggregation Demo

<img src="../../../doc/demo-thumbnails/interactive-aggregation.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/interactiveaggregation/).

This demo shows how to analyze a graph by aggregating groups of nodes.

Via the context menu, groups of nodes of the same color or shape can be aggregated giving different insights about the graph.

For example, aggregating all nodes by _shape and color_ shows that there are no connections between rectangle shaped nodes of different color and no connections between octagonal green and purple nodes.

The demo makes use of the _AggregationGraphWrapper_ class, that allows for aggregating graph items by hiding items and adding new items to a wrapped graph.

## Things to Try

- Right click on a node to open a _context menu_ with the different aggregation and expansion options.
- Aggregate all nodes with the _same shape or color_ by selecting "Aggregate Nodes with Same ...".
- _Separate_ an aggregation node again by selecting "Separate".
- Right click on an empty location on the canvas and select "Aggregate All Nodes by ..." to _group all nodes_ by shape or color.
- Right click on an empty location on the canvas and select "Separate All" to show the whole graph again.
