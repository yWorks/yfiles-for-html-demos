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
# 02 Create Nodes Sources - Tutorial: Graph Builder

<img src="../../../doc/demo-thumbnails/tutorial-graph-builder-create-nodes-sources.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-graph-builder/02-create-nodes-sources/).

In this step, you will learn how to use different data sources for nodes.

[GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) can import data from multiple sources. All node sources that are presented in this step are combined in the graph on the right. Nodes that are retrieved from the same data source have the same color.

Note

Give data items a unique identifier. It will ensure the correct connection of edges as well as updating the graph correctly after changes in the business data. If `null` is set for an [id provider](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-property-idProvider), the item itself will be used as identifier.

In our examples, we add a property named `id` to the business data.

## Import nodes from an iterable

[GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) accepts different types of data collections. The most commonly used collection is probably the **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)**.

```
const nodeData = [{ id: '00' }, { id: '01' }, { id: '02' }]

// nodes source for the turquoise nodes
const nodesSource = graphBuilder.createNodesSource(
  nodeData,
  (item) => item.id
)
```

Another one is the **[IEnumerable<T>](https://docs.yworks.com/yfileshtml/#/api/IEnumerable)**. The [id provider](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-property-idProvider) function retrieves the identifiers for the nodes.

[IEnumerable<T>](https://docs.yworks.com/yfileshtml/#/api/IEnumerable) implements the iterable protocol, and therefore all yFiles for HTML collections are accepted, as well. Since they are live collections, they become useful when updating the graph with changing data.

```
const nodeData = IEnumerable.from([{ id: '10' }, { id: '11' }, { id: '12' }])

// nodes source for the blue nodes
const nodesSource = graphBuilder.createNodesSource(
  nodeData,
  (item) => item.id
)
```

If you have organized the data in a **[Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)** for easy and fast access by a `key`, you can pass it to [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) as is. The map key of an item is passed to the [id provider](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-property-idProvider) function as a second parameter and can be used as the identifier or a part of it.

```
const nodeData = new Map<string, { id: string }>()
nodeData.set('node1', { id: '30' })
nodeData.set('node2', { id: '31' })
nodeData.set('node3', { id: '32' })

// nodes source for the red nodes
const nodesSource = graphBuilder.createNodesSource(
  nodeData,
  (item, key) => item.id
)
```

Passing data in a **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** is handled similar to using a **[Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)**. Instead of the key, the property name is available in this case.

```
const nodeData = {
  node1: { id: '20' },
  node2: { id: '21' },
  node3: { id: '22' }
}

// nodes source for the orange nodes
const nodesSource = graphBuilder.createNodesSource(
  nodeData,
  (item, name) => item.id
)
```

## Import nodes from a generator function

Especially with dynamic data, generator functions can be very useful. If a [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource) is created from a generator function, it is very easy to update the data as it is described in the tutorial step about [updating the graph](../11-update-graph/). In the following example the limit might be variable and the [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource) will provide the data accordingly.

```
function* nodes(): Generator<{ id: string }> {
  for (let i = 0; i < limit; i++) {
    yield { id: `4${i}` }
  }
}

// nodes source for the brown nodes
const nodesSource = graphBuilder.createNodesSource(nodes, (item) => item.id)
```

Note

Please have a look in this tutorial step’s demo code in `create-nodes-sources.ts` and play around with the different ways to import business data.

[03 Create Edges Sources](../../tutorial-graph-builder/03-create-edges-sources/)
