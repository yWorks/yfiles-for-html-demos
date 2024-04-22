<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Algorithms Without a View

# Layout without View Demo

This demo shows how to create a graph, run a graph analysis algorithm and calculate a layout without using a view or the [IGraph](https://docs.yworks.com/yfileshtml/#/api/IGraph) API.

There is no interactivity in this demo. The code creates a graph in-memory with nodes and edges, adds placeholders for labels, creates and configures both a graph analysis algorithm and a layout algorithm and then runs both algorithms on the graph.

The results of the analysis and the layout as well as the resulting visual properties of the elements in the graph are then dumped as text to the text-area.

See the sources for details.
