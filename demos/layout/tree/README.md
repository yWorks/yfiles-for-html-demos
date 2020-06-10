# Tree Layout Demo

<img src="../../resources/image/treelayout.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/layout/tree/index.html).

Demonstrates the tree layout style and the different ways in which this layout can arrange a node and its children.

With tree layout, each node can have a separate [ITreeLayoutNodePlacer](https://docs.yworks.com/yfileshtml/#/api/ITreeLayoutNodePlacer) which is responsible for the arrangement of its children in a certain style.

## Configure the Node Placers

You can configure the node placer of the selected nodes in the right side panel. Changing an option in the panel immediately updates the layout of the graph. A preview demonstrates the chosen subtree style in a smaller context.

- Some node placers offer rotation and mirroring of the subtree.
- Toggle the _Assistant_ marking for a single node by _double-clicking_ on it. They will show their effect when their parent node has [AssistantNodePlacer](https://docs.yworks.com/yfileshtml/#/api/AssistantNodePlacer) assigned.
- [DefaultNodePlacer](https://docs.yworks.com/yfileshtml/#/api/DefaultNodePlacer) is used for nodes without an explicit assignment.

## Sample Graphs

- _Default Tree_ is a regular tree which is arranged using a combination of [LeftRightNodePlacer](https://docs.yworks.com/yfileshtml/#/api/LeftRightNodePlacer) and [DefaultNodePlacer](https://docs.yworks.com/yfileshtml/#/api/DefaultNodePlacer) for each subtree.
- _Wide Tree_ has the same structure as the _DefaultTree_ but is arranged only using [DefaultNodePlacer](https://docs.yworks.com/yfileshtml/#/api/DefaultNodePlacer).
- _Category Tree_ uses [DefaultNodePlacer](https://docs.yworks.com/yfileshtml/#/api/DefaultNodePlacer) to place the categories in columns and arranges the nodes of each category stacked left-right.
- _General Graph_ is not a tree and uses the [TreeReductionStage](https://docs.yworks.com/yfileshtml/#/api/TreeReductionStage) to prepare the graph for [TreeLayout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout). In this sample, non-tree edges are routed with organic style.
- _Large Tree_ uses [CompactNodePlacer](https://docs.yworks.com/yfileshtml/#/api/CompactNodePlacer) for some sub-trees to get a compact layout.

## Change the Graph

Changing the graph in this demo will keep its tree structure intact, and each change will trigger a layout calculation.

- Add nodes (and edges) by dragging from an unselected node.
- Removing selected nodes will remove their whole subtrees. The root node cannot be deleted.
- Resize nodes to see how the layout changes.
- Change the order of children by adding number labels using the `F2` key.
