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
# Build Graph from Data - Application Features

# Build Graph from Data

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
