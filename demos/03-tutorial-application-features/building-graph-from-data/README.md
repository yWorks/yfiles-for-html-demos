# Build Graph from Data - Application Features Tutorial

<img src="../../resources/image/tutorial3step3.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/03-tutorial-application-features/building-graph-from-data/index.html).

## Build Graph from Data

This demo shows how to build a graph using the data stored in JSON-format.

- Note that some nodes have individual colors or sizes.
- Look at the hierarchy of group nodes.
- See the edges connecting to normal nodes and group nodes.

The input data structure itself is arbitrary. It just needs to contain all the necessary information to build the graph. This demo uses the following structure:

```
{
  "nodesSource" = [
    {"id": "0", "label": "Source"},
    {"id": "1", "group": "group0"},
    ...
  ],
  "edgesSource": [
    {"from": "0", "to": "group0"},
    ...
  ],
  "groupsSource": [
    {"id": "group0", "label": "Group 1"},
    ...
  ]
}

```

See the sources for details.
