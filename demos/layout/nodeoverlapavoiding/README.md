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
# Node Overlap Avoiding Demo

# Node Overlap Avoiding Demo

A demo that shows how to interactively edit graphs without creating overlaps.

Every time a node is added, moved or resized interactively, [ClearAreaLayout](https://docs.yworks.com/yfileshtml/#/api/ClearAreaLayout) will push away the other elements so there is enough space for the changed node.

## Things to Try

- Drag a node to another location and watch the graph give way to it.
- Enlarge a node and see that the other nodes will move away to avoid overlaps.
- Create a new node beside an existing one, create a copy or duplicate a node without overlaps.
