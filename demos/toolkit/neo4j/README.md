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
# Neo4j Integration Demo

<img src="../../../doc/demo-thumbnails/neo4j.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/toolkit/neo4j/).

This demo shows how to load data from a Neo4j database and display it with yFiles for HTML.

First, connect to a Neo4j database by entering a URL, a username, and a password into the corresponding form fields, then click the _Connect_ button.

After establishing a connection, a small set of data from the database will be displayed.

## Things to Try

- Explore the data: Change the viewport by dragging the canvas with the mouse and change the zoom level by using the mouse wheel.
- Click on a node to select it, which will show its labels and properties in the properties view on the right.
- Double click on a node to load more nodes that are connected to it, if any are available.
- Hover over a node to highlight the adjacent edges. Hover over an edge to highlight the adjacent nodes.
- Toggle the display of edge labels using the "Show Edge Labels" checkbox.
- Move the sliders for the maximum node count and label diversity and then click the _Reload Data_ button to query the database for a new set of data.  
  **Warning:** Retrieving data with the sliders set to _high_ might take a _really_ long time (2 minutes and more) or might yield no results at all, depending on the database.
- Enter a custom Cypher query into the editor in the right, then click the "Run Cypher Query" button. Every node and relationship that is returned by that query will be visualized as a graph and will replace the current visualization.

## Details

This demo uses the [Neo4j driver for JavaScript](https://neo4j.com/docs/javascript-manual/current/) to connect to a Neo4j database and query it for data.

The query results are then used by a [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) with a custom configuration to construct a graph from the data, while assigning different node styles to nodes with different labels.

The maximum node count setting limits the number of nodes that are queried from the database, while the label diversity setting determines the length of the distinct node label sequences that is searched for.

The graph layout is achieved by using [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) with substructures enabled.
