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
# Logic Gates Demo

# Logic Gates Demo

This demo showcases yFiles for HTML to visualize a digital system with logic gates.

Each node has specific ports: incoming edges connect only to the left side of the target node, while outgoing edges go to the right side of the source node. [PortConstraint](https://docs.yworks.com/yfileshtml/#/api/PortConstraint) and [PortCandidate](https://docs.yworks.com/yfileshtml/#/api/PortCandidate) are used for this purpose.

## Graph Creation

A [Port-aware Graph Builder Demo](../../databinding/port-aware-graph-builder/) is used to create the graph, connecting the edges with specific ports defined in the business data.

## Things to Try

- Drag nodes from the palette and connect them with edges.
- Create a new edge: this highlights the possible end ports with green color.
- Hover over a node to see available input (reddish color) and output (bluish color) ports
- Re-assign a connection by dragging the endpoint of the edge.
- The ports remain unchanged when applying the selected layout algorithm.
