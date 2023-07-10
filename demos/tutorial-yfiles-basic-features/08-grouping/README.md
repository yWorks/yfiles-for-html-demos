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
# 08 Grouping - Basic Features Tutorial

# Grouped Graphs

This step shows how to configure [support for grouped or hierarchically organized graphs](https://docs.yworks.com/yfileshtml/#/dguide/interaction-support#interaction-grouping).

Note

Collapse/expand functionality is demonstrated in the [folding demo](./../../application-features/folding/index.html).

[GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) already provides default gestures for grouping/ungrouping. To use the gesture, we have to enable [allowGroupingOperations](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode#GraphEditorInputMode-property-allowGroupingOperations).

```
graphEditorInputMode.allowGroupingOperations = true
```

- Press Ctrl+G to group the currently selected nodes.

Group Selected Nodes

- Select a child node and press Ctrl+U to ungroup. Note that this does not automatically shrink the group node or remove it if it would become empty.

Ungroup Selected Nodes

- Press Shift+Ctrl+G to shrink a selected group node to its minimum size.
- Hold Shift when dragging nodes into or out of groups to change the graph hierarchy.

Group nodes can use special styles that are optimized to visualize a group with content. However, a group node can also use a normal node style like [ShapeNodeStyle](https://docs.yworks.com/yfileshtml/#/api/ShapeNodeStyle). In this example, we use [GroupNodeStyle](https://docs.yworks.com/yfileshtml/#/api/GroupNodeStyle).

```
graph.groupNodeDefaults.style = new GroupNodeStyle({
  tabFill: '#0b7189'
})

// Set a label style with right-aligned text
graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
  horizontalTextAlignment: 'right',
  textFill: 'white'
})

// Place the label inside the tab area of the group node
// GroupNodeLabelModel is usually the most appropriate label model for GroupNodeStyle
graph.groupNodeDefaults.labels.layoutParameter =
  new GroupNodeLabelModel().createDefaultParameter()
```

We create some nodes and group them.

```
const n1 = graph.createNodeAt([30, -200])
const n2 = graph.createNodeAt([170, -200])
const n3 = graph.createNodeAt([30, -100])
graph.createEdge(n1, n3)
// Create an edge that crosses the group node boundary
graph.createEdge(n3, graph.nodes.first())

// Create a group node that encloses n1, n2 and n3
const groupNode = graph.groupNodes([n1, n2, n3])

graph.addLabel(groupNode, 'Group Node')
// Edges starting from the group node itself are also allowed
const edgeFromGroup = graph.createEdge(groupNode, graph.nodes.at(1)!)
```

If the group content is changed in code, i.e. a child node is added or removed programmatically, the group node size is not adjusted automatically. Instead, we have to call [adjustGroupNodeLayout](https://docs.yworks.com/yfileshtml/#/api/IGraph#IGraph-defaultmethod-adjustGroupNodeLayout).

```
// Get a group node
const groupNode = graph.nodes.first(node => graph.isGroupNode(node))
// Create a child node that's outside the group bounds
graph.createNode({ parent: groupNode, layout: [100, -60, 30, 30] })
// Adjust the group node layout to contain the new child
graph.adjustGroupNodeLayout(groupNode)
```

Add New Node and Adjust Group Node Size

[09 Data Binding](../../tutorial-yfiles-basic-features/09-data-binding/index.html)
