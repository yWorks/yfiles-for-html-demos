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
# Simple Adjacency Graph Builder With Ids

<img src="../../../doc/demo-thumbnails/simple-adjacency-graph-builder-with-ids.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/databinding/simple-adjacency-graph-builder-with-ids/).

This demo automatically builds a graph from business data using [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/api/AdjacencyGraphBuilder). The business data is stored in **JSON** format. Each object that represents a node has a unique id.

See the Developer's Guide section on [creating a Graph from Business Data](https://docs.yworks.com/yfileshtml/dguide/graph_builder) and especially [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/dguide/graph_builder-AdjacencyGraphBuilder) for an in-depth explanation of the relevant concepts.

See also the [GraphBuilder Tutorial](../../tutorial-graph-builder/01-create-graph/) for a step-by-step guide on configuring the [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/api/AdjacencyGraphBuilder) class, loading data, and customizing graph visualizations.

[AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/api/AdjacencyGraphBuilder) provides a specific set of methods that allow to configure the builder on the given data source.

`createNodesSource`

Registers a data source that represents the nodes.

`createGroupNodesSource`

Registers a data source that represents the group nodes.

`AdjacencyNodesSource.addPredecessorIds`

Registers a provider for source node IDs to which edges are created.

`AdjacencyNodesSource.addSuccessorIds`

Registers a provider for target node IDs to which edges are created.
