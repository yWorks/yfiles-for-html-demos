<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# 05 Implicit Grouping - Graph Builder Tutorial

# Grouping nodes in the graph

In this tutorial step, you will learn an alternative approach to create group nodes to show hierarchy information within the business data.

Note

This step is optional when building a graph with [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder). If you do not have hierarchy information in your data, you can proceed with the next step.

In a previous step, we have demonstrated how to use [createGroupNodesSource](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder#GraphBuilder-method-createGroupNodesSource) to build the hierarchy.

The downside of this approach is that the objects representing the group nodes need to be known in advance. While this is fine for many scenarios, sometimes the information is only provided implicitly in the data, and it can be difficult or very inefficient to extract all objects representing the group nodes. This is especially true for dynamic scenarios where a lot of information is just provided as part of a query.

A related problem can occur when you want to navigate from group nodes to their contents. If the business data is already present as a hierarchical data structure, it is often much easier just to query an entity for their content than to extract descendants in advance, especially if there are many hierarchy levels involved.

To address these use cases, the [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource) provides two closely related APIs that allow you to [Create group nodes from implicit node data](#graph-builder-tutorial-05-createParentNodesSource) or [Create group node contents from implicit node data](#graph-builder-tutorial-05-createChildNodesSource) without the need for an explicit group node source.

## The data

In the example data, we start from an initial set of entities. Each one has a property `children` that can contain a (potentially empty) list of child entities and a `path` property that describes a hierarchical path structure how this entity can be reached, similar to a file system path.

```
export type ItemData = {
  id: string
  path: string
  children?: ChildData[]
}
```

Each child item can optionally have a further list of its own child items:

```
export type ChildData = {
  id: string
  children?: ChildData[]
}
```

The initial items as well as the child entities carry an additional `id` attribute to make it easier to define relations between them.

```
[
  { id: 'item0', path: '/root/dir1/dir1' },
  {
    id: 'item1',
    path: '/root/dir1/dir2',
    children: [
      {
        id: 'child1',
        children: [
          {
            id: 'child11',
            children: [{ id: 'child14' }, { id: 'child15' }]
          },
          { id: 'child12' }
        ]
      },
      { id: 'child2', children: [{ id: 'child13' }] }
    ]
  },
```

## Create group nodes from implicit node data

If you want to create group nodes automatically from data that is present in the items in your node source, you can use [NodesSource.createParentNodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-method-createParentNodesSource). This method uses the existing NodesSource to group its items from scratch. The mandatory `parentDataProvider` parameter describes how to retrieve a parent object for each item in the NodesSource. The optional `idProvider` parameter can be used to uniquely identify parent objects even if they are not referentially equal.

This method creates a new [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource) which can then be configured as usual, e.g. by providing label bindings or custom styles.

You can additionally **augment** the newly created parent node source with additional data with [NodesSource.addParentNodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-method-addParentNodesSource), e.g. to recursively process parent data for that same source and thereby building a whole hierarchy.

We start by defining the initial set of nodes via a [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource):

```
const idProvider = (item: ChildData | ItemData): string => item.id
const nodesSource = graphBuilder.createNodesSource({
  data: nodeData,
  id: idProvider
})
```

In the next step, we describe how to navigate from an entity to its path container

```
const parentsSource = nodesSource.createParentNodesSource(item => item.path)
```

To ascend further in the hierarchy, we add another parent source on top and enable recursion by augmenting that source. For the higher levels, we strip the last path entry from the existing path and terminate when we don’t have any further levels to ascend to.

```
const parentDataProvider = (path: string | null): string | null => {
  const separator = path!.lastIndexOf('/')
  return separator === 0 ? null : path!.substring(0, separator)
}
const ancestorSource =
  parentsSource.createParentNodesSource(parentDataProvider)
// Enable recursive processing higher up in the container hierarchy
ancestorSource.addParentNodesSource(parentDataProvider, ancestorSource)
```

## Create group node contents from implicit node data

If you want to create the content of group nodes automatically from data that is present in the items in your node source, you can use [NodesSource.createChildNodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-method-createChildNodesSource). This method uses the existing NodesSource to populate its nodes. The mandatory `childDataProvider` parameter describes how to retrieve a collection of child objects for each item in the NodesSource. The optional `idProvider` parameter can be used to uniquely identify child objects even if they are not referentially equal.

This method creates a new [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource) which can then be configured as usual, e.g. by providing label bindings or custom styles.

You can additionally **augment** the newly created child node source with additional data with [NodesSource.addChildNodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-method-addChildNodesSource), e.g. to recursively process descendant data for that same source and thereby building a whole hierarchy.

Note

It is possible to combine both approaches, thereby automatically building a hierarchy in both directions from an initial set of node items.

Populating the nodes in the original nodes source and descending further in the hierarchy can be implemented in an analogous way to [recursive parents](#graph-builder-tutorial-05-recursiveParentNodesSource): we just have to create corresponding **Child Nodes Sources** and declare how to retrieve the **content** of each item:

```
// Enable processing of the contents of the nodes in the NodeData
const childDataProvider = (item: ChildData | ItemData): ChildData[] =>
  item.children ?? []
const childNodesSource = nodesSource.createChildNodesSource(
  childDataProvider,
  idProvider
)
// Enable processing of the contents of the child nodes
const descendantsSource = childNodesSource.createChildNodesSource(
  childDataProvider,
  idProvider
)
// Enable recursive processing of the contents
descendantsSource.addChildNodesSource(childDataProvider, descendantsSource)
```

Edges can connect to any of the nodes, whether they are in the "core" nodes source or any of the derived ones, as long as their `id` is referenced in the source or target [id provider](https://docs.yworks.com/yfileshtml/#/api/NodesSource#NodesSource-property-idProvider).

Note

Please have a look in this tutorial step’s demo code in `implicit-group-nodes.ts` and play around with the hierarchic structure. For example, try to change the definition of the group nodes.

[06 Configure Styles](../../tutorial-graph-builder/06-configure-styles/index.html)
