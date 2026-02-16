<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Edge Reconnection Port Candidate Provider Demo

<img src="../../../doc/demo-thumbnails/edge-reconnection.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/edgereconnection/).

This demo shows how the reconnection of edge ports can be customized and restricted.

This is done with custom implementations of [IEdgeReconnectionPortCandidateProvider](https://docs.yworks.com/yfileshtml/api/IEdgeReconnectionPortCandidateProvider) that are added to the lookup of the edges.

## Things to Try

Select an edge and drag one of its port handles to another node. When over a node, green indicators highlight valid new locations for the port.

## Edge Types

- _Red edges_ cannot be moved to another port.
- _Orange edges_ connect to other orange nodes, but you cannot create self-loops.
- _Blue edges_ connect to all other ports (black and white dots). Note that the blue edge will reuse existing port locations.
- _Green edges_ connect to any location inside of other green nodes when the Ctrl key is pressed.
