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
# Mouse Wheel Customization Demo

<img src="../../../doc/demo-thumbnails/mouse-wheel-customization.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/mousewheel-customization/).

This demo shows how to customize and enhance the default mouse wheel behavior.

The mouse wheel behavior can be configured to zoom or scroll the graph, or do both, with additional modifiers being pressed.

When scrolling, the scroll direction can be switched between vertical and horizontal scrolling using a modifier key (Shift by default, Ctrl for the alternative modifier scheme configured in this demo).

When both scrolling and zooming is enabled, switch from scrolling to zooming using the respective modifier (Ctrl by default, Alt for the alternative modifier scheme).

The _Modifiers_ dropdown lets you switch between the default and an alternative modifier scheme. In code, the modifiers, as well as other conditions, can be configured freely.

When the _Scroll, Zoom and Resize_ option is selected, a custom listener to the `Wheel` event of the [CanvasComponent](https://docs.yworks.com/yfileshtml/#/api/CanvasComponent) allows to resize the selected nodes by pressing both, Shift and Ctrl.

The settings _Wheel Zoom Factor_ and _Wheel Scroll Factor_ allow to adjust the amount that's zoomed or scrolled on each turn of the mouse wheel. Additionally, the system's mouse settings determine how far the graph is zoomed or scrolled.

## Things to Try

- Press Ctrl and turn the mouse wheel to scroll the graph vertically.
- Press Shift and turn the mouse wheel or press the mouse wheel sideways to scroll the graph horizontally.
- Turn the mouse wheel to zoom the graph.
- Press Shift and Ctrl and turn the mouse wheel to change the size of the selected nodes.
- Press Alt while zooming to zoom to the center of the view instead of the mouse location (when wheel behavior set to _zoom_).
- Change the default settings in the toolbar and play around with the mouse wheel and the different modifier keys.
