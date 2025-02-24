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
# WebGL Animations Demo

<img src="../../../doc/demo-thumbnails/webgl-animations.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/style/webgl-animations/).

In this demo you can try out the different WebGL animations and their settings. Animations can be used, for example, to highlight an interesting element or whole part of a graph.

In particular, this demo highlights the currently hovered or selected connected component with an animation of the chosen type and settings. Recall that a connected component consists of all nodes that can reach each other.

Note that the animated items all share the same [WebGLAnimation](https://docs.yworks.com/yfileshtml/#/api/WebGLAnimation) object.

## Things to Try

- Hover over a component, or select one, and observe the animation.
- Select different animations types for highlighting the current component:
  - For the component itself, "Pulse", "Scale", or "Shake" are fitting animations.
  - Use different "Fade" animations and hide or desaturate a component to bring this component to attention.
- Note that for fade animations, shorter animation durations are more noticeable.
- Experiment with other animation configurations to achieve the desired effect.
