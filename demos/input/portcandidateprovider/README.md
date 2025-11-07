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
# Port Candidate Provider Demo

<img src="../../../doc/demo-thumbnails/port-candidate-provider.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/portcandidateprovider/).

This demo shows how edge creation can be customized by implementing the [IPortCandidateProvider](https://docs.yworks.com/yfileshtml/#/api/IPortCandidateProvider) interface.

Add the custom implementation as decoration to the edge decorator of the graph to use it.

## Things to Try

Start edge creation and observe which target port candidates are valid depending on the start port candidate.

## Node Types

- _Red nodes_ cannot have any edges. You cannot start or end an edge at them. A red port candidate highlights that these nodes are invalid targets.
- Only edges from other _green nodes_ can end at green nodes.
- _Blue nodes_ provide a set of predefined ports. Only one edge can be connected to each of these ports. Occupied ports are shown gray.
- _Orange nodes_ provide dynamic port candidates. Edges can start and end anywhere inside these nodes when the Ctrl key is pressed.
