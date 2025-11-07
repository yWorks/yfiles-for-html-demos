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
# Edge Router

<img src="../../../doc/demo-thumbnails/layout-edgerouter.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/edge-router/).

This demo shows common configuration options for the [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) algorithm.

It highlights the configuration of various aspects, including:

- Minimum distance settings like the [edge distance](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterEdgeDescriptor#minimumEdgeDistance) and the [node-to-edge distance](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter#minimumNodeToEdgeDistance).
- [Scope](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData#scope): the **orange edges** (fixed edges) are _not_ routed by the algorithm. All other edges (affected edges) are routed.
- [Routing style](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterEdgeDescriptor#routingStyle): the **blue edges** are routed using the octilinear style, the others routed orthogonally.
- Grouping: the **pink edges** are grouped at their [target side](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData#targetGroupIds).
- Restricting ports via [port candidates](https://docs.yworks.com/yfileshtml/#/api/PortCandidate): at nodes '5' and '7', ports are restricted to be on their left or right side.
- [Grid routing](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter#gridSpacing): edges are routed on a 10x10 grid.

## Demos

- [Layout Styles: Edge Router Demo](../../showcase/layoutstyles/index.html?layout=edge-router&sample=edge-router)

## Documentation

- [Polyline Edge Routing](https://docs.yworks.com/yfileshtml/#/dguide/polyline_router#polyline_router_edge_grouping)
- [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter)
- [EdgeRouterData](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData)
