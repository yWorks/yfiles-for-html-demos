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
# Map Demo

<img src="../../../doc/demo-thumbnails/map.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/showcase/map/).

This demo shows how to integrate a [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) with [Leaflet](https://leafletjs.com/).

The `GraphComponent` is included in a custom Leaflet Layer. The placement of the nodes uses geo-coordinates to get the correct locations on the map.

## Things to Try

- Drag the map and see how the graph moves along.
- Zoom into the map using the mouse-wheel or the controls in the upper-left corner of the map. The nodes mark the location of the airports and will keep their geolocation. Some of them are only visible on larger zoom levels.
- Click on two nodes to highlight the shortest path between those nodes.
