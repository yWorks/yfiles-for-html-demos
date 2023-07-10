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
# Single Selection Demo

# Single Selection Demo

This demo shows how to configure [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) for single selection mode. In this mode, only one graph item can be selected at a time.

## Things to Try

- Toggle single selection mode and examine the differences.
- Select a single node and toggle its selection state by pressing `Ctrl-Space`. This works in both single selection and regular mode due to a custom command binding.
- Move the node focus (indicated by a thin dashed line) by holding down `Ctrl` and pressing an arrow key. Toggle the selection state of the focused item by pressing `Ctrl-Space`.
- Take a look at the source code, especially method _enableSingleSelection_.

## Features of Single Selection Mode

- Marquee selection is disabled. Try to drag the mouse over a set of nodes to select them.
- Click-selecting multiple nodes is disabled. Try to extend the selection by holding the `Ctrl` key while clicking another node.
- _Select All_ is disabled. Try to select all nodes by pressing `Ctrl-A`.
