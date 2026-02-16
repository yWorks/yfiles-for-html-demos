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
# Home Automation Demo

<img src="../../../doc/demo-thumbnails/home-automation.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/showcase/home-automation/).

This demo simulates a tool for visually programming a home automation network. The nodes represent various stages of data flow within the system. The graph features basic validation: output ports can only be connected to input ports, no edges can be duplicated, and nodes with required properties display an error indicator if some of those properties are missing.

### Things to Try

- Pan the graph horizontally by pressing the Shift key and scrolling the mouse wheel, or vertically by pressing the Ctrl key and scrolling the mouse wheel.  
  You can also pan the graph by clicking and holding the **middle** mouse button and moving the mouse.
- Add nodes by dragging and dropping them from the node palette on the right.
- Connect nodes. Note that the output port (right) of one node can only connect to the input port (left) of another node.
- Reconnect existing edges to other nodes.
- Select a node to highlight all of its connected edges.
- Move connected nodes around to see how edges dynamically change their shape.
- Apply automatic _Layout_ to arrange the graph hierarchically.
- Select a node to view and edit its properties in the right panel.
- Enter a long _label_ in the node properties to observe how the node size changes.
- Note that some node properties are required. If not set, the corresponding node will display an error indicator. Hover over a node to see a popup with more details about the missing properties.
- Save/load the current graph using JSON.
