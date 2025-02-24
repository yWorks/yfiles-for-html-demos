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
# Build Graph from Data - Application Features

<img src="../../../doc/demo-thumbnails/building-graph-from-data.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/application-features/building-graph-from-data/).

This demo shows how to build a graph using the data stored in JSON-format.

This demo utilizes the [IGraph](https://docs.yworks.com/yfileshtml/#/api/IGraph) API to create graph elements, which can be useful for handling special cases. However, for general use cases, we recommend using the [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) for creating graphs from data. The GraphBuilder simplifies the process and is the recommended approach for most scenarios.

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
