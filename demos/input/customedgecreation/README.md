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
# Custom Edge Creation Demo

<img src="../../../doc/demo-thumbnails/custom-edge-creation.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/customedgecreation/).

This demo shows how to provide directional [IPort](https://docs.yworks.com/yfileshtml/#/api/IPort)s and [PortCandidate](https://docs.yworks.com/yfileshtml/#/api/PortCandidate)s and demonstrates several customizations for the edge creation gesture.

## Ports and PortCandidates

Each node provides directional ports that are visualized with a circular [ShapePortStyle](https://docs.yworks.com/yfileshtml/#/api/ShapePortStyle).

This demo restricts edge creation to the provided [PortCandidate](https://docs.yworks.com/yfileshtml/#/api/PortCandidate)s. Therefore, the PortCandidates are also shown on the source on hover to indicate that edge creation may start there.

The **Show Ports** button in the toolbar toggles the visualization of the ports. Note how the PortCandidates are still visible on hover even if the ports are not visualized anymore.

## Edge Creation

The edge color of newly created edges is dynamically determined by the source node from which the edge creation gesture originates.

**Enable Target Node** toggles whether edge creation should create a target node as well. This enables users to end the creation gesture on the empty canvas.

## Interactive Edge Routing

This demo illustrates different approaches to interactive edge routing during edge creation:

- **Default Orthogonal**: Utilizes the [OrthogonalEdgeEditingContext](https://docs.yworks.com/yfileshtml/#/api/OrthogonalEdgeEditingContext) by enabling [orthogonal editing](https://docs.yworks.com/yfileshtml/#/api/PolylineEdgeStyle#orthogonalEditing) on the edge style which does not require a dedicated layout algorithm. It is the fastest approach but does not consider port directions or other nodes.
- **Edge Router (Quality)**: Applies the [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) with each move during the edge creation gesture. This is the most expensive approach but yields nicely routed edges.
- **Edge Router (Performance)**: Applies the [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) as well but sets its `stopDuration` to `0` such that a less performance heavy approach is used. This still routes around other nodes but sometimes yields less appealing results.
