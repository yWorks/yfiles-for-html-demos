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
# Edge To Edge Demo

<img src="../../../doc/demo-thumbnails/edge-to-edge.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/view/edgetoedge/).

This demo shows edge-to-edge connections. The input mode of this demo is configured to allow edges to connect not only to nodes but also to edges.

This application also demonstrates how to provide port candidates at edges to allow interactive creation of edge-to-edge connections. Please take a look at the code behind to observe some of the customization possibilities.

## Things to Try

- Create a connection between a node and an edge by pressing the left mouse button on an unselected node and dragging the edge onto another edge.
- Create a connection between two edges by dragging the mouse from an edge onto another edge.
- Hold down the Ctrl modifier when moving the endpoints of an edge across another edge to create dynamic port candidates that best match the mouse location.
- Start dragging the mouse from various positions on an edge to observe that the best available port location is chosen for the source port.
- Re-connect an existing edge by selecting it and dragging the source or target onto another node or edge.
- Try to re-connect an edge's source or target to itself or another edge that connects to the edge that is being re-connected. There will be no port candidates since connecting an edge to itself or creating a mutual dependency is forbidden in this demo.

Please note that the bend creation gesture has been customized in this demo. Press the Shift key and drag the mouse on an unselected edge to create a bend.
