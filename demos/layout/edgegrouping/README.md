# Edge Grouping Demo

<img src="../../resources/image/edgegrouping.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/layout/edgegrouping/index.html).

This demo shows the possibilities of edge and port grouping using the example of [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout). Edge groups lead to edges sharing some segments while port groups will combine the edges only in their first segment.

## Things to Try

- Use the combo-box in the toolbar to toggle between edge grouping and port grouping.
- Customize the grouping information in the graph using the context menu. You can either:
  - Right-Click on the canvas and group/ungroup all edges at the same time
  - Right-Click on an edge or selection of edges and group/ungroup the incident edges
  - Right-Click on a node or selection of nodes and group/ungroup the incident edges
- Apply a complete layout from scratch by pressing the Layout-Button in the toolbar. Setting incremental edge or port groups can lead to uncommon routings, thus it may be necessary to calculate a new layout.
- Reset the graph and start again with the initial sample.

## Grouping Types

![](resources/legend.svg)
