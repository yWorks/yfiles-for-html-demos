# Port-aware Adjacency Graph Builder Demo

<img src="../../resources/image/port-aware-adjacency-graph-builder.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/databinding/port-aware-adjacency-graph-builder/index.html).

# Port-aware Adjacency Graph Builder Demo

This demo automatically builds a graph from business data using [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder).  
The business data is stored in **JSON** format.

By default, a [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-AdjacencyGraphBuilder) connects the graph elements directly. It does not support further specification of the connection points (ports). The [Adjacency Graph Builder](../adjacencygraphbuilder/index.html) demo shows such an unmodified AdjacencyGraphBuilder.

In this sample the AdjacencyGraphBuilder is modified to support ports. These ports are created based on the node data. Edges are connected to these specific ports.

Additionally, the demo shows how to update a graph built with AdjacencyGraphBuilder when the corresponding business data changes. See the source code for details.

## Things to Try

- Use the "Update" button to change the business data and update the graph. Note that existing elements are kept stable.
- Inspect the source code to see how the [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder) can be modified to support ports.
