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
# Build Swimlanes from Data - Application Features

# Build Swimlanes from Data

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
