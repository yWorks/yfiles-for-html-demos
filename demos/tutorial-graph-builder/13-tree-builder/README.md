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
# 13 Tree Builder - Tutorial: Graph Builder

# Building a graph with TreeBuilder

In this tutorial step we show how to use [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) to build a graph from data, where nodes and their children are already available in a tree-like format.

## The data

Consider the following data object, which represents a basic organization chart:

```
{
  position: 'Chief Executive Officer',
  name: 'Eric Joplin',
  colleagues: [
    {
      position: 'Chief Executive Assistant',
      name: 'Gary Roberts',
      colleagues: [
        {
          position: 'Senior Executive Assistant',
          name: 'Alexander Burns'
        },
        {
          position: 'Junior Executive Assistant',
          name: 'Linda Newland'
        }
      ]
    },
    {
      position: 'Vice President of Production',
      name: 'Amy Kain',
      colleagues: [
        {
          position: 'Production Supervisor',
          name: 'Kathy Maxwell'
        }
      ]
    }
  ]
}
```

Every data object can have an _optional_ `colleagues` property. The `colleagues` property, if available, contains a list of the object’s children _as_ _data_. The colleagues are of the same type as the data object itself:

```
export type OrgChartEntry = {
  position: string
  name: string
  colleagues?: OrgChartEntry[]
}
```

## Building the graph

In the first step, we instantiate [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) and configure a [TreeNodesSource](https://docs.yworks.com/yfileshtml/#/api/TreeNodesSource):

```
const treeBuilder = new TreeBuilder(graph)

const rootNodesSource = treeBuilder.createRootNodesSource(nodesData)
```

In the second step, we configure a child [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource) on the [TreeNodesSource](https://docs.yworks.com/yfileshtml/#/api/TreeNodesSource):

```
// the childDataProvider identifies the property of a node object that contains its child nodes
rootNodesSource.addChildNodesSource(data => data.colleagues, rootNodesSource)
```

Note that we have used the `rootNodesSource` as the source for the colleagues _recursively._ The [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) makes sure no nodes or edges with the same `id` are created twice.

Finally, we add labels to the graph building process by providing a label binding for the [NodesSource](https://docs.yworks.com/yfileshtml/#/api/NodesSource)'s [NodeCreator](https://docs.yworks.com/yfileshtml/#/api/NodeCreator).

```
rootNodesSource.nodeCreator.createLabelBinding({
  text: dataItem => dataItem.name
})
```

Note

[TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) supports the same labeling functionality as the [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder).

See the [TreeBuilder Developer’s Guide](https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-TreeBuilder) for a deeper discussion of the [TreeBuilder’s](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) functionalities.

Note

Please have a look in this tutorial step’s demo code in `tree-graph-building.ts` and play around with the different ways to import business data.
