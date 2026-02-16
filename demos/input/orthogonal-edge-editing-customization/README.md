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
# Orthogonal Edge Editing Customization Demo

<img src="../../../doc/demo-thumbnails/orthogonal-edge-editing-customization.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/orthogonal-edge-editing-customization/).

This demo shows how to customize orthogonal edge editing.

Using the [GraphDecorator](https://docs.yworks.com/yfileshtml/api/GraphDecorator), the edge is decorated with custom implementations of the [IOrthogonalEdgeHelper](https://docs.yworks.com/yfileshtml/api/IOrthogonalEdgeHelper) interface.

## Things to Try

Drag segments and bends of the edges and observe the different characteristics.

## Edge Types

- _Red edge_: Orthogonal edge editing is disabled. The segments are straight lines with arbitrary slope. Dragging an unselected segment creates a new bend.
- _Green edge_: Orthogonal edge editing is enabled. While dragging, all segments stay orthogonal and new bends are created as needed.
- _Purple edge_: Same behavior as the green edge. In addition, the locations of the source port and target port are constraint to the given port candidates of the nodes.
- _Orange edge_: Same behavior as the green edge. In addition, the source port and the target port can be placed at any location inside the node since they use dynamic port candidates.
- _Yellow edge_: Same behavior as the green edge. In addition, dragging the first (or last) segment of the edge will create only one new bend instead of two.
- _Blue edge_: Orthogonal edge editing is enabled for the inner segments but the first and the last segment can have an arbitrary slope. If a new bend is added to one of these two segments, the newly created inner segment becomes orthogonal immediately.
