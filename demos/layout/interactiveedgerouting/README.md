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
# Interactive Edge Routing Demo

<img src="../../../doc/demo-thumbnails/interactive-edge-routing.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/interactiveedgerouting/).

The Interactive Edge Routing demo showcases [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) 's ability to find and re-layout edge paths which are not yet ‘good’.

After each user interaction the edge router is applied with [EdgeRouterScope](https://docs.yworks.com/yfileshtml/#/api/EdgeRouterScope) set to either re-route entire edges or only necessary segments of edges. The edge router itself determines automatically which edges need a re-routing based on various criteria like intersections with other elements or routing style violations.

## Things to Try

- Move nodes with incident edges around to see how the edge paths are re-routed after the move gesture has been finished.
- Open/close group nodes with incident edges.
- Move nodes or create nodes in a way that they overlap existing edges.
- Create new edges and see how they are routed to match the other edges.
- Choose different routing scopes with the Routing Scope combo box.
