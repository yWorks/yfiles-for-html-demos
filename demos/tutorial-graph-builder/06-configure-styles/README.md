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
# 06 Configure Styles - Tutorial: Graph Builder

<img src="../../../doc/demo-thumbnails/tutorial-graph-builder-configure-styles.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-graph-builder/06-configure-styles/).

[GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) supports various approaches for styling the graph elements. They range from simple default visualizations to accessing the business data for defining specific styles.

We will now style the nodes and edges in the graph using a simple company ownership diagram with the following types.

```
type EntityData = {
  id: string
  type: 'Trust' | 'Corporation' | 'Branch' | 'PE_Risk'
  currency: 'USD' | 'EUR'
}

type ConnectionData = {
  sourceId: string
  targetId: string
  ownership: number
}
```

## Node styling

There are basically three ways to style nodes using GraphBuilder: Specifically, you can set _default styles_, _style_ _bindings_ and _style_ _providers_ on the [NodeCreator](<https://docs.yworks.com/yfileshtml/#/api/NodeCreator(TDataItem)>).

### Default styles

A default style will apply to all nodes of the NodesSource for which no other style is specified. In this example, as a default, we set the size, shape and fill as follows:

```
nodesSource.nodeCreator.defaults.size = new Size(150, 90)
nodesSource.nodeCreator.defaults.style = new ShapeNodeStyle({
  shape: 'ellipse',
  fill: blue
})
```

### Style bindings

To style specific attributes of the default style defined above using business data, use _style_ _bindings._ In this example, we bind the stroke and thickness of the [ShapeNodeStyle](https://docs.yworks.com/yfileshtml/#/api/ShapeNodeStyle) to the `currency` property of the displayed data item.

Note

When using _style bindings_, it is important that the default styles are not shared. Otherwise, the same style is going to be used for all nodes.

```
// disable sharing of styles
nodesSource.nodeCreator.defaults.shareStyleInstance = false

nodesSource.nodeCreator.styleBindings.addBinding(
  'stroke',
  (entityData: EntityData) => {
    return new Stroke({
      fill: entityData.currency === 'EUR' ? darkBlue : red,
      thickness: 3
    })
  }
)
```

### Style providers

In contrast to a style _binding_, a _style provider_ returns complete [INodeStyle](https://docs.yworks.com/yfileshtml/#/api/INodeStyle)s, usually involving some calculations with the provided node data. In this example, different [ShapeNodeStyle](https://docs.yworks.com/yfileshtml/#/api/ShapeNodeStyle)s are returned depending on the `type` of entity represented by the node:

```
nodesSource.nodeCreator.styleProvider = (
  entityData: EntityData
): ShapeNodeStyle | undefined => {
  if (entityData.type === 'Branch') {
    return new ShapeNodeStyle({
      shape: 'round-rectangle',
      fill: gold
    })
  } else if (entityData.type === 'Corporation') {
    return new ShapeNodeStyle({
      shape: 'octagon',
      fill: green
    })
  }
}
```

## Edge styling

For edge styling, default styles, bindings and providers work the same way as for node styling. In this example we only use an edge style _provider_ that styles ownership edges with more than 50% `ownership` in red and edges without ownership data in grey with a dashed stroke:

```
edgesSource.edgeCreator.styleProvider = (
  connectionData: ConnectionData
): PolylineEdgeStyle => {
  if (connectionData.ownership) {
    return new PolylineEdgeStyle({
      stroke: new Stroke({
        fill: connectionData.ownership > 50 ? red : 'black',
        thickness: 3
      })
    })
  } else {
    return new PolylineEdgeStyle({
      stroke: new Stroke({
        fill: gray,
        thickness: 3,
        dashStyle: 'dash'
      })
    })
  }
}
```

Note

Please have a look in this tutorial step’s demo code in `configure-styles.ts` and play around with the different ways to style the nodes.

[07 Create Labels Sources](../../tutorial-graph-builder/07-create-labels-sources/)
