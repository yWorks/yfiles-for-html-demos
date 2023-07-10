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
# GraphML Demo

# GraphML Demo

This demo provides a live view of the graph's [GraphML](https://docs.yworks.com/yfileshtml/index.html#/dguide/customizing_io_graphml#customizing_io_graphml) representation. GraphML is the default serialization format for yFiles graphs.

## Things to Try

### GraphML Editor

- Select a node, edge, or label in the graph view: the corresponding serialization is highlighted in the GraphML panel.
- Select a node, edge, or label serialization in the GraphML panel: the corresponding graph item is selected in the graph view.
- Edit the graph (create/modify/remove nodes/edges/labels): The serialization in the GraphML panel is updated to reflect the changes.
- Edit the graph's GraphML representation: the GraphML is parsed and the view is updated accordingly. If the GraphML is not valid, the error message will be shown in the editor's output panel.

### Custom GraphML Data Panel

- Select a node with custom data (e.g. the movie node of the sample graph): the custom data is displayed in the data panel.
- Add a new key and value to the custom data panel (press enter to submit): The corresponding data is added to the GraphML representation. Note that a new `<key>` element will be added to the top of the GraphML file if the key did not exist yet.

Please note that custom complex data types are not written to the GraphML panel.

## Custom GraphML Data

### Graph Data

### Current Item Data
