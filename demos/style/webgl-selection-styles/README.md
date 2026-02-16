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
# WebGL Selection Styles Demo

<img src="../../../doc/demo-thumbnails/webgl-selection-styles.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/style/webgl-selection-styles/).

This demo shows the available _selection_ styles for nodes, edges, and labels in WebGL rendering.

In WebGL, selections can be configured in various ways: There are multiple patterns to choose from, and colors, thickness, and margins are configurable. Additionally, selections can be activated and deactivated using animated transitions, and for the appropriate selection styles, a "marching ants" animation is available, too.

## Things to Try

- Configure the basic pattern used.
- Experiment with the primary and secondary color and how they are used in the various selection styles.
- Tweak the thickness and margin of the selection style.
- Activate transitions, select and deselect various graph elements.
- Activate the dash animation and select various graph elements.
- Observe that only styles with repeating patterns along the selection visualization are animated.
- Change the zoom policy and observe how the rendering of the selection is modified in the corresponding coordinate system.

In this demo, the same selection style is used for all graph elements. This is only a configuration in the demo, since with the API the styles for the different element types can be configured individually. See the _updateSelectionStyles_ function in the demo source code.
