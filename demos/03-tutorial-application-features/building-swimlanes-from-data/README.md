# Build Swimlanes from Data - Application Features Tutorial

<img src="../../resources/image/tutorial3step4.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/03-tutorial-application-features/building-swimlanes-from-data/index.html).

## Build Swimlanes from Data

This demo shows how to build a graph with swimlanes using the data stored in JSON-format.

- Note that some nodes have individual colors or sizes.
- Nodes are assigned to different swimlanes base on their center position.
- Move nodes to a different lane and press "Layout" to see how the automatic layout adheres to the manual swimlane assignment.
- See the edges connecting to normal nodes.

The input data structure itself is arbitrary. It just needs to contain all the necessary information to build the graph. This demo uses the following structure:

```
{
  "nodesSource" = [
    {"id": "0"},
    {"id": "1", "lane": "lane0"},
    ...
  ],
  "edgesSource": [
    {"from": "0", "to": "4"},
    ...
  ],
  "lanesSource": [
    {"id": "lane0", "label": "Lane 1"},
    ...
  ]
}

```

See the sources for details.
