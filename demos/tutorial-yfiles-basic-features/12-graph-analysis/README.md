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
# 12 Analysis Algorithms - Tutorial: Basic Features

<img src="../../../doc/demo-thumbnails/tutorial-basic-features-graph-analysis.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-yfiles-basic-features/12-graph-analysis/).

## How to analyze the graph structure.

This step shows how to use the [graph analysis algorithms](https://docs.yworks.com/yfileshtml/#/dguide/analysis) in yFiles for HTML.

yFiles provides a wide range of graph analysis algorithms that can be used for all kinds of purposes. The result of an analysis run can be shown directly to the user, or the results can be used to drive third party systems. They can also be used as input for layout algorithm configurations. The purpose of this sample is to demonstrate how to build, configure, and execute graph analysis algorithms and how to interpret the results. For a more interactive and complete showcase of the available algorithms, please see the [Graph Analysis Demo](../../showcase/graphanalysis/), the [Clustering Algorithms Demo](../../analysis/clustering/), the [Network Flows Demo](../../analysis/networkflows/), the [Critical Path Analysis (CPA) Demo](../../analysis/criticalpathanalysis/), the [Intersection Detection Demo](../../analysis/intersection-detection/), and the [Transitivity Demo](../../analysis/transitivity/).

## Reachability

- Select one or more nodes and click 'Run Reachability' to run a reachability test. All nodes that can be reached from the currently selected nodes will be highlighted.

Run Reachability

```
// use the selected nodes as start nodes
const startNodes = graphComponent.selection.nodes

const reachability = new Reachability({
  startNodes: startNodes,
  directed: true // consider edge direction
})
const reachabilityResult = reachability.run(graphComponent.graph)

// highlight the reachable nodes
reachabilityResult.reachableNodes.forEach((n: INode): void => {
  graphComponent.highlights.add(n)
})
```

- Select two nodes by holding Ctrl and click 'Run Shortest Path' to calculate the shortest path. If a path is found, the nodes on the path and the edges will be highlighted. The distance to the target node will be shown as a tooltip on the target node.

Run Shortest Path

```
const shortestPath = new ShortestPath({
  source: sourceNode,
  sink: sinkNode,
  directed: false, // don't consider the edge direction
  // calculate the cost per edge as the distance between source and target node
  costs: (edge: IEdge): number =>
    edge.sourceNode.layout.center.subtract(edge.targetNode.layout.center)
      .vectorLength
})
const shortestPathResult = shortestPath.run(graph)
```

The shortest path result contains the distance, nodes and edges of the calculated path. We use this information to highlight the respective nodes and edges and to show a tooltip with the distance.

```
const pathDistance = shortestPathResult.distance
const pathNodes = shortestPathResult.path?.nodes ?? []
const endNode = shortestPathResult.path?.end
const pathEdges = shortestPathResult.edges
```
