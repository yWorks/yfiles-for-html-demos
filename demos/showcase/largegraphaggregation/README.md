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
# Large Graph Aggregation Demo

<img src="../../../doc/demo-thumbnails/large-graph-aggregation.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/showcase/largegraphaggregation/).

This demo shows how to use the smart [NodeAggregation](https://docs.yworks.com/yfileshtml/#/api/NodeAggregation) algorithm for drill down exploration of a large graph.

The [NodeAggregation](https://docs.yworks.com/yfileshtml/#/api/NodeAggregation) algorithms consolidates nodes of a graph and thus creates cluster of nodes based on user-specified constraints.

The demo shows aggregated nodes in a gray style, while original nodes of the data are represented as colored nodes.

The configuration panel provides access to the most important settings of the aggregation algorithm.

The _Aggregation Mode_ determines if nodes are combined in clusters based on the structure of the graph or based on their geometric locations.

## Things to Try

- Switch between the **two layout styles** offered for visualizing the aggregated graph (i.e. [RadialTreeLayout](https://docs.yworks.com/yfileshtml/#/api/RadialTreeLayout) and [RadialGroupLayout](https://docs.yworks.com/yfileshtml/#/api/RadialGroupLayout)). This re-runs the aggregation as well.
- Click on an aggregated node to **show** its children in the aggregation hierarchy.
- Click on a separated node to **hide** its children in the aggregation hierarchy.
- Explore the **configuration options** of the aggregation algorithm.
- Run the aggregation algorithm with the selected settings by pressing the **Run** button.
- Click **Switch To Filtered View** to hide the aggregation nodes and only show the actual nodes of the graph that are currently explored.
- Navigate to a node outside the viewport by clicking an edge whose source or target node is not visible at the moment.
