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
# Tree Layout Demo

<img src="../../../doc/demo-thumbnails/tree-layout.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/tree/).

Demonstrates the tree layout style and the different ways in which this layout can arrange a node and its children.

With tree layout, each node can have a separate [ISubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/ISubtreePlacer) which is responsible for the arrangement of its children in a certain style.

## Configure the Subtree Placers

You can configure the subtree placer of the selected nodes in the right side panel. Changing an option in the panel immediately updates the layout of the graph. A preview demonstrates the chosen subtree style in a smaller context.

- Some subtree placers offer rotation and mirroring of the subtree.
- Toggle the _Assistant_ marking for a single node by _double-clicking_ on it. They will show their effect when their parent node has [AssistantSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/AssistantSubtreePlacer) assigned.
- [SingleLayerSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/SingleLayerSubtreePlacer) is used for nodes without an explicit assignment.

## Sample Graphs

- _Default Tree_ is a regular tree which is arranged using a combination of [LeftRightSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/LeftRightSubtreePlacer) and [SingleLayerSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/SingleLayerSubtreePlacer) for each subtree.
- _Wide Tree_ has the same structure as the _DefaultTree_ but is arranged only using [SingleLayerSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/SingleLayerSubtreePlacer).
- _Category Tree_ uses [SingleLayerSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/SingleLayerSubtreePlacer) to place the categories in columns and arranges the nodes of each category stacked left-right.
- _General Graph_ is not a tree and uses the [TreeReductionStage](https://docs.yworks.com/yfileshtml/#/api/TreeReductionStage) to prepare the graph for [TreeLayout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout). In this sample, non-tree edges are routed with organic style.
- _Large Tree_ uses [CompactSubtreePlacer](https://docs.yworks.com/yfileshtml/#/api/CompactSubtreePlacer) for some subtrees to get a compact layout.

## Change the Graph

Changing the graph in this demo will keep its tree structure intact, and each change will trigger a layout calculation.

- Add nodes (and edges) by dragging from an unselected node.
- Removing selected nodes will remove their whole subtrees. The root node cannot be deleted.
- Resize nodes to see how the layout changes.
- Change the order of children by adding number labels using the F2 key.
