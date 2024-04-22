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
# 04 Setting Styles - Tutorial: Basic Features

# Customizing Styles

## How to influence visual appearance.

This step shows how to [configure the visual appearance of graph elements using styles](https://docs.yworks.com/yfileshtml/#/dguide/getting_started-application#getting_started-setting_styles).

Note

yFiles for HTML offers a set of predefined and configurable item styles for various use-cases. The [Style Implementation tutorials](../../tutorial-style-implementation-node/01-create-a-rectangle/) show in detail how to create a custom style from scratch.

## Default Styles

Default styles are used for elements that are created without an explicit style. Default styles can be configured separately for nodes, edges, ports, node and edge labels. The default node size can also be configured in a similar way.

```
graph.nodeDefaults.style = new ShapeNodeStyle({
  shape: 'round-rectangle',
  fill: '#ff6c00',
  stroke: '1.5px #662f01'
})
// Also assign the default node size
graph.nodeDefaults.size = new Size(40, 40)
```

```
graph.edgeDefaults.style = new PolylineEdgeStyle({
  stroke: '1.5px #662f01',
  targetArrow: '#662f01 small triangle'
})
```

```
const defaultLabelStyle = new DefaultLabelStyle({
  font: '12px Tahoma',
  textFill: 'black',
  backgroundFill: '#8fff',
  shape: 'round-rectangle',
  insets: [2, 5]
})

// Set the defined style as the default for both edge and node labels
graph.edgeDefaults.labels.style = defaultLabelStyle
graph.nodeDefaults.labels.style = defaultLabelStyle
```

## Creating items with a specific style

Styles can be defined as parameters during the creation of an item, if the created item should use a style different from the default style.

Create Graph Items with Specific Styles

```
const node = graph.createNodeAt({
  location: new Point(30, 215),
  style: new ImageNodeStyle('resources/star-16.svg')
})
graph.createEdge({
  source: sourceNode,
  target: node,
  style: new PolylineEdgeStyle({
    targetArrow: '#224556 medium triangle',
    stroke: '2px #224556'
  })
})
graph.addLabel({
  text: 'New Label',
  owner: node,
  style: new DefaultLabelStyle({ backgroundFill: '#a6a6c0' })
})
```

## Changing the style of a graph item

The styles of graph items can be changed at runtime, after the items have been created. Click the button below to change the styles of some graph items.

Change Styles

This sample shows how to change the styles of nodes:

```
const nodeStyle1 = new ShapeNodeStyle({
  shape: 'ellipse',
  fill: '#a37ab3',
  stroke: '2px #433449'
})
graph.setStyle(node1, nodeStyle1)

const nodeStyle2 = new RectangleNodeStyle({
  fill: '#46a8d5',
  stroke: '2px #224556',
  cornerStyle: RectangleCornerStyle.CUT
})
graph.setStyle(node2, nodeStyle2)
```

This sample shows how to change the styles of edges:

```
const edgeStyle = new PolylineEdgeStyle({
  stroke: '2px dashed #224556',
  sourceArrow: '#224556 medium circle',
  targetArrow: '#224556 medium short'
})

graph.setStyle(edge, edgeStyle)
```

This sample shows how to change the styles of labels:

```
const labelStyle = new DefaultLabelStyle({
  backgroundStroke: '2px #46A8D5',
  backgroundFill: '#b4dbed',
  insets: [3, 5, 3, 5]
})

graph.setStyle(label, labelStyle)
```

[05 Label Placement](../../tutorial-yfiles-basic-features/05-label-placement/)
