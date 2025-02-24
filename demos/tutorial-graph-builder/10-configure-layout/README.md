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
# 10 Configure Layout - Tutorial: Graph Builder

<img src="../../../doc/demo-thumbnails/tutorial-graph-builder-configure-layout.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/tutorial-graph-builder/10-configure-layout/).

In this tutorial step we will learn how to configure [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) to arrange the graph elements and/or adjust their size using the information stored in the dataset.

Note

This step is optional when building a graph with [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder). If your data does not contain layout information, you can proceed with the next step.

## Loading node layout information

Layout information can be stored in different formats. In this step, we assume that the dataset looks like the one below where the layout information for each node is stored in a `layout` property.

```
const nodeData: NodeLayoutData[] = [
  {
    id: '00',
    layout: { x: 110, y: 20, width: 30, height: 30 }
  },
  {
    id: '01',
    layout: { x: 145, y: 95, width: 30, height: 30 }
  },
  {
    id: '02',
    layout: { x: 75, y: 95, width: 30, height: 30 }
  }
]
```

A [layout provider](https://docs.yworks.com/yfileshtml/#/api/NodeCreator#NodeCreator-property-layoutProvider) will use this information to create a rectangle at a specific location for each node. These rectangles will be set as the nodes' [layout](https://docs.yworks.com/yfileshtml/#/api/INode#INode-property-layout).

If no layout information is provided, the [default size](https://docs.yworks.com/yfileshtml/#/api/NodeDefaults#NodeDefaults-property-size) will be used and the node will be located at the origin.

```
// configure the layout provider that returns the layout information
nodeSource.nodeCreator.layoutProvider = (data) => data.layout
```

Consider, for example, the dataset below. It only contains a property for the y-coordinate of the location.

```
const nodeData: { id: string; locationY: number }[] = [
  { id: '03', locationY: 20 },
  { id: '04', locationY: 95 }
]
```

To use this y-coordinate and assign the same x-coordinate to all nodes, use a layout binding. We also specify a custom width and height for the nodes.

```
// create some binding for the x, y, width and height properties of the layout
nodeSources.nodeCreator.layoutBindings.addBinding('x', () => 250)
nodeSources.nodeCreator.layoutBindings.addBinding(
  'y',
  (data) => data.locationY
)
nodeSources.nodeCreator.layoutBindings.addBinding('width', () => 50)
nodeSources.nodeCreator.layoutBindings.addBinding('height', () => 30)
```

Note that it is not necessary to create bindings for all properties of the node layout. For example, you can just add bindings for `width` and `height` and let a layout algorithm position the nodes.

## Loading the bend information

Assume now that our dataset contains information about the bend positions of the edges that has to be transferred to the graph:

```
const edgeData: EdgeLayoutData[] = [
  {
    sourceId: '00',
    targetId: '01',
    bends: [
      { x: 125, y: 68 },
      { x: 160, y: 68 }
    ]
  },
  {
    sourceId: '00',
    targetId: '02',
    bends: [
      { x: 125, y: 68 },
      { x: 90, y: 68 }
    ]
  }
]
```

Transfer the bend information to the [edge layout](https://docs.yworks.com/yfileshtml/#/api/IEdge#IEdge-property-bends) using a [bend provider](https://docs.yworks.com/yfileshtml/#/api/EdgeCreator#EdgeCreator-property-bendsProvider).

```
// configure the bend provider to return the location of each bend point
edgeSources.edgeCreator.bendsProvider = (data) => data.bends
```

Note

Please have a look in this tutorial step’s demo code in `configure-layout.ts` and try different locations, sizes, and bends.

[11 Update Graph](../../tutorial-graph-builder/11-update-graph/)
