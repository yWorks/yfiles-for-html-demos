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
# Maze Routing Demo

<img src="../../../doc/demo-thumbnails/maze-routing.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/mazerouting/).

This demo shows how the [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) can be used for finding routes through a maze. This algorithm tries to find the way with the fewest possible changes in direction trying to avoid possible obstacles.

The graph consists of the nodes that form the maze and the normal ones. The maze nodes are visible only during the layout and serve as obstacles for the algorithm. Also, a non-editable background visual is created by these maze nodes and is displayed inside the graph component.

## Things to Try

- Change the settings of the [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) from the toolbar and press the "Route Edges" button to see how the routing of the edges changes.
- Change the scope to 'Route Edges at Selected Nodes'. Select and move a node and observe that, only its incident edges have been rerouted.
- Modify the graph with one of the following operations to see how the affected edges are rerouted:
  - Create new edges.
  - Move nodes or edges.
  - Resize nodes.
