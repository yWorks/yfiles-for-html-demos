<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Single Selection

<img src="../../../doc/demo-thumbnails/single-selection.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/single-selection/).

This demo shows how to configure [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/api/GraphEditorInputMode) for single selection mode. In this mode, only one graph item can be selected at a time.

## Things to Try

- **Toggle Single Selection Mode:** Use the checkbox to switch between single selection and regular selection modes.
- **Toggle Selection State:** Select a single node and toggle its selection state by pressing Ctrl + Space. This works in both single selection and regular mode due to a custom command binding.
- **Move Node Focus:** Move the node focus (indicated by a thin dashed line) by holding down Ctrl and pressing an arrow key. Toggle the selection state of the focused item by pressing Ctrl + Space.

## Features of Single Selection Mode

- **Disabled Marquee Selection:** Try to drag the mouse over a set of nodes to select them - this won't work in single selection mode.
- **Disabled Multi-Selection:** Try to extend the selection by holding the Ctrl key while clicking another node - this won't work in single selection mode.
- **Disabled Select All:** Try to select all nodes by pressing Ctrl + A - this won't work in single selection mode.
