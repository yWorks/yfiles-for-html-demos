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
# Neighborhood Circles Demo

<img src="../../../doc/demo-thumbnails/neighborhood-circles.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/showcase/neighborhood-circles/).

The Neighborhood Circles demo shows the neighborhood of selected nodes arranged on concentric circles. The concentric arrangement highlights how close the connection between a selected node and a neighbor node is.

The following neighborhood types are available:

- Predecessors
- Successors
- Both (predecessors and successors)
- Neighbors (independent of the edge direction)

## Things to Try

- Change the neighborhood type of the view.
- Change the depth parameter to change the scope of the neighborhood.
- Navigate the graph by clicking nodes in the neighborhood view.

## Demos

- [Neighborhood View Demo](../../showcase/neighborhood/)
- [Flow Filtering Demo](../../application-features/flow-filtering/)

## Remarks

- The neighborhood view is using [RadialLayout](https://docs.yworks.com/yfileshtml/api/RadialLayout) to arrange the neighbor nodes on concentric circles.
