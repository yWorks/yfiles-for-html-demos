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
# Restricted Editing Demo

# Restricted Editing Demo

This demos shows how to restrict interactive editing while still using [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) for its non-editing features like, e.g., click-selecting items.

More precisely, this demo shows how to

- disable all interactive editing operations,
- disable interactive editing operations except for moving items,
- enable all interactive editing operations.

While the above editing schemes are fairly coarse-grained, GraphEditorInputMode actually provides properties to enable or disable individual editing operations. Please see the [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) API documentation for a complete list of configuration options.

## Editing Operations

Choose one of the available editing schemes `None`,`Moving Items`, and`All`.

None

All interactive editing operations are disabled, i.e., it is not possible to interactively modify the graph in any way: no node movement, no edge creation, no label editing, etc. However, clicking on an item will still select the clicked item.

Moving Items

Interactive editing is disabled except for moving items, i.e.m it is possible to move selected nodes, edges, or bends to new positions.

All

All interactive editing operations are enabled.
