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
# Company Ownership Chart Demo

<img src="../../../doc/demo-thumbnails/company-ownership.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/showcase/company-ownership/).

This demo implements an interactive viewer for exploring company ownership hierarchies.

The diagram illustrates both the ownership (shareholders, investors, etc) and the management relationships among business entities.

Nodes can be shown in two different ways: Either as different shapes and colors per type, or as a table-like overview of the relevant properties.

The edges demonstrate either hierarchy/ownership (dark-gray edges) or a simple relationship (orange edges).

## Things to Try

- Click on the port to hide and show the descendants of a node. **Hide Children** by clicking on ![](resources/minus.svg) and **Show Children** by clicking on ![](resources/plus.svg). A node is considered to be visible if at least one of its parents defined by a hierarchy edge (i.e., the dark-gray-colored edges) is visible.
- **Switch style** between shapes and tables.
- **Click** on a company or a relationship in the chart and show the corresponding data in the Properties View.
- **Left-click** on an edge or an edge label zooms to the source/target location that is not in the viewport.
- **Hover** over a company node to highlight its adjacent relationships. **Hover** over a relationship to highlight its associated label.
