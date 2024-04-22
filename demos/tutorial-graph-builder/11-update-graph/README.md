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
# 11 Update Graph - Tutorial: Graph Builder

# Updating the graph

This tutorial step shows how to update the graph structure when the underlying business data has changed.

This is usually necessary after the app received or queried new data from a data source, e.g. a database or a webservice.

## Assigning new data and updating the graph structure

After the business data has changed, you can assign the new data to one or more nodes and/or edges sources. Then, it’s only a matter of calling [updateGraph](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder#GraphBuilder-method-updateGraph) to update the graph structure to the new data.

```
// assign the new data to the nodesSource
graphBuilder.setData(nodesSource, newData)
// tell GraphBuilder to update the graph structure
graphBuilder.updateGraph()
```

Note

When a new data item has the same `id` as an existing item as defined by the [id provider](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-property-idProvider), it is interpreted as being the same and the node or edge in the graph is re-used. Only the visualization and the data in the [tag](https://docs.yworks.com/yfileshtml/#/api/IModelItem#ITagOwner-property-tag) are updated.

## Updating the graph with dynamic data

In [Step 2](../02-create-nodes-sources/) of this tutorial, we’ve already learned how to create a graph using a dynamic generator function. In this example, we select the nodes to display in the graph using a set of node types.

```
nodeTypes = new Set(['Corporation', 'Trust'])

function* nodes(): Generator<EntityData, void, unknown> {
  for (const entity of data.nodesSource) {
    if (entity.type && nodeTypes.has(entity.type)) {
      yield entity as EntityData
    }
  }
}

// create nodes source from dynamic data
return graphBuilder.createNodesSource(nodes, 'id')
```

When using a dynamic data source, the graph structure can be updated without assigning new data. The following code removes corporations from the graph and adds `Branch` and `PE_Risk` nodes.

```
// update displayed node types
nodeTypes.delete('Corporation')
nodeTypes.add('Branch')
nodeTypes.add('PE_Risk')

// since the nodesSource uses a generator function,
// calling updateGraph is enough to update the graph structure
graphBuilder.updateGraph()
```

Note

Please have a look in this tutorial step’s demo code in `update-graph.ts` and try to change how the data is updated.

Use the buttons below to apply the changes from the sample code to the graph, and to revert the graph to its initial state.

Update the graph Reset the graph

[12 Adjacency Graph Builder](../../tutorial-graph-builder/12-adjacency-graph-builder/)
