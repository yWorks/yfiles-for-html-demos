# Neighborhood View Demo

<img src="../../resources/image/neighborhoodview.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/complete/neighborhood/index.html).

# Neighborhood View Demo

The Neighborhood demo shows the neighborhood of the currently selected node alongside the graph. The neighborhood view is a filtered copy of the original graph. There are different modes for the neighborhood computation. The currently selected node is highlighted inside the neighborhood view.

The following neighborhood types are available:

- Predecessors
- Successors
- Neighbors (predecessors and successors)
- Folder (content of a folder node, independently from its collapse/expand state)

## Things to Try

- Choose a graph using the select box
- Change the neighborhood type of the view
- Change the max-depth parameter to limit the neighborhood computation up to a certain depth
- Navigate the graph by clicking nodes in the neighborhood view

## Remarks

- The neighborhood view is using a [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout) on the filtered graph.
