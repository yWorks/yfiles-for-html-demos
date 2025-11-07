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
# 03 Create Edges Sources - Tutorial: Graph Builder

<img src="../../../doc/demo-thumbnails/tutorial-graph-builder-create-edges-sources.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-graph-builder/03-create-edges-sources/).

In this tutorial step, you will learn how to load edges from business data.

To connect the edges to the correct nodes, we need the information about their source and target nodes. Therefore, we add some provider functions for the `id`s of the source and target nodes.

In this example, we have added the properties `sourceId` and `targetId` to the business data. Of course, you can use different names in the data and use a different [id provider](https://docs.yworks.com/yfileshtml/#/api/NodesSource#idProvider).

## Importing edges from a data collection

As for [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource)s, [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) supports different data collections for [EdgesSource](https://docs.yworks.com/yfileshtml/#/api/EdgesSource)s. Here, we will only discuss importing the edge data from an array. For other options, please go back to the [Create Nodes Sources](../02-create-nodes-sources/) or have a look at the API documentation of [GraphBuilder.createEdgesSource](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder#createEdgesSource).

The most important part for edges is declaring the `id`s of the source and target. These have to match their `id`s in the node data. Then, the resulting edges will connect to the correct nodes.

```
// add node data including ids
const nodeData = [{ id: 0 }, { id: 1 }, { id: 2 }]
graphBuilder.createNodesSource(nodeData, 'id')

// data for some edges that connect to the nodes using their ids
const edgeData = [
  { id: '0', sourceId: '0', targetId: '1' },
  { id: '1', sourceId: '0', targetId: '2' }
]

// create an edges source with id providers for sources and targets
const edgesSource = graphBuilder.createEdgesSource({
  data: edgeData,
  id: (item) => item.id,
  sourceId: (item) => item.sourceId,
  targetId: (item) => item.targetId
})
```

Note

Please have a look in this tutorial step’s demo code at `create-edges-sources.ts` and play around with the different ways to import business data.

[04 Group Nodes](../../tutorial-graph-builder/04-group-nodes/)
