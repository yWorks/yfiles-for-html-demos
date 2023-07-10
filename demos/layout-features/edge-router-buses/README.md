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
# EdgeRouter with Bus-style Routing - Layout Features

# EdgeRouter with Bus-style Routing

This demo shows how to configure the EdgeRouter to generate orthogonal bus-style routes. A bus is a segment shared by multiple edges. The actual nodes are attached to the bus with shorter segments.

A bus is defined via the _add_ method of the [buses](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterData#buses) property. The method yields an object on which the set of edges can conveniently be defined, e.g., via a delegate.

The [EdgeRouterBusDescriptor](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterBusDescriptor) class provided to the _add_ method offers settings related to a bus.

This example showcases two buses which are defined differently.

### First Bus - Automatic Backbone

The first bus (orange graph) is defined using a default descriptor and with no further settings. This means that the algorithm automatically chooses backbone segments.

### Second Bus - Given Points

The second bus (blue graph) is defined by [manually providing](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterBusDescriptor#busPoints) the location of the backbone segments. The manually defined backbone consists of a vertical segment to the left of the nodes and two horizontal segments in-between the node rows.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/edge-router-buses/EdgeRouterBuses.ts).

### Demos

The [Bus Routing Demo](../../layout/busrouting/index.html) is a more complex demo that shows the bus-style routing feature. More features offered by the EdgeRouter algorithm are shown by the [Layout Styles Demo](../../showcase/layoutstyles/index.html?layout=edge-router&sample=edge-router).

### Documentation

The Developer's Guide provides more information about the concepts of the [Bus-style routing](https://docs.yworks.com/yfileshtml/#/dguide/polyline_router_bus_routing) feature of the EdgeRouter.
