<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Incremental Edge Router - Layout Features

# Incremental Edge Router

This demo shows how to run the edge router algorithm on a predefined subset of edges in a graph.

To achieve this, two setup steps are necessary:

First, the algorithm has to be told to work on a subset only. To do so, [Edge Router](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter)'s [scope](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter#scope) property has to be set to [ROUTE_AFFECTED_EDGES](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterScope#ROUTE_AFFECTED_EDGES).

And second, the algorithm has to be told which set of edges to route. The class [EdgeRouterData](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData) offers the property [affectedEdges](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData#affectedEdges) for this purpose.

In this demo, the algorithm works on the subset of blue edges only.

Click the button in the toolbar to run the routing algorithm.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/edge-router-incremental/EdgeRouterIncremental.ts).

### Demos

You can also take a look at the [Maze Routing Demo](../../layout/mazerouting/) for a more elaborate application of edge routing.

### Documentation

The Developer's Guide has detailed information about the [edge router algorithm](https://docs.yworks.com/yfileshtml/#/dguide/polyline_router) in general and about [how to run the algorithm on a subset of edges](https://docs.yworks.com/yfileshtml/#/dguide/polyline_router#polyline_router_incremental) specifically.
