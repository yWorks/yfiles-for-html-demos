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
# Edge Router - Layout Features

<img src="../../../doc/demo-thumbnails/layout-edgerouter.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/edge-router/).

This demo shows common configuration options for the (polyline) [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter).

- Basic distance settings like the [minimum node-edge distance](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter#inimumNodeToEdgeDistance) and the [minimum edge-edge distance](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterEdgeDescriptor#minimumEdgeDistance).
- [Scope](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter#scope): the orange edges are _not_ routed by the algorithm, they are so-called _fixed_ edges. All other edges are routed, thus, called _affected_ edges.
- [Routing Style](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterEdgeDescriptor#routingStyle): the default style in this example is orthogonal, but the blue edges are routed using the octilinear style.
- Grouping of edges: the pink edges are grouped at their target side.
- Restricting ports via [Port Candidates](https://docs.yworks.com/yfileshtml/#/api/PortCandidate): at node '5' and node '7', ports are restricted to be on the left or right side. For other nodes the port sides are not restricted.
- [Grid routing](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter#grid). Edges are routed on a 10x10 grid.

### Code Snippet

To experiment with the settings, you can copy the code snippet to configure the router from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/edge-router/EdgeRouter.ts).

### Demos

More features offered by the EdgeRouter algorithm are shown by the [Layout Styles Demo](../../showcase/layoutstyles/index.html?layout=edge-router&sample=edge-router).

### Documentation

The Developer's Guide provides more in-depth information about the available [Polyline Edge Routing](https://docs.yworks.com/yfileshtml/#/dguide/polyline_router_bus_routing) features.
