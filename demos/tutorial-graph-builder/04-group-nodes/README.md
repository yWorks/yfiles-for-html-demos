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
# 04 Group Nodes - Tutorial: Graph Builder

<img src="../../../doc/demo-thumbnails/tutorial-graph-builder-group-nodes.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/tutorial-graph-builder/04-group-nodes/).

In this tutorial step, you will learn how to create group nodes to show hierarchy information within the business data.

Note

This step is optional when building a graph with [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder). If you do not have hierarchy information in your data, you can proceed with the next step.

To have the [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) build the hierarchy, we need to add information about which item belongs to which group.

In the example data, we added a property named `parentId` to specify the parent of a node. However, you can also use other existing properties as long as their values point to a group item. Group items are the same as node items, and they can also have a parent. So it is possible to create nested hierarchies. You can store them in separate data collections or separate them when creating the [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource).

```
const nodeData = [
  { id: 'item0' },
  { id: 'item1', parentId: 'group0' },
  { id: 'item2', parentId: 'group1' },
  { id: 'group0' },
  { id: 'group1', parentId: 'group0' }
]
```

As an alternative to having the type encoded in the `id`, you can also add another property which identifies the group items. In both cases, it is not necessary to mark the group items unless you want to treat them differently from other items, e.g. visualize them differently.

You can use `GraphBuilder.createGroupNodes` to import the group nodes data. Then, these nodes are automatically visualized with the default group node style.

```
const nodesSource = graphBuilder.createNodesSource({
  data: nodeData.filter((item) => item.id.startsWith('item')),
  id: (item) => item.id,
  parentId: (item) => item.parentId
})

const groupNodesSource = graphBuilder.createGroupNodesSource({
  data: nodeData.filter((item) => item.id.startsWith('group')),
  id: (item) => item.id,
  parentId: (item) => item.parentId
})
```

If no parent `id` is assigned to a node, it will appear top-level on the graph component.

Edges work the same way for group nodes as for other nodes. They can connect to the group node if its `id` is referenced in the source or target [id provider](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-property-idProvider).

Note

Please have a look in this tutorial step’s demo code in `create-group-nodes.ts` and play around with the hierarchical structure. For example, try to use a separate collection for group items.

[05 Implicit Grouping](../../tutorial-graph-builder/05-implicit-grouping/)
