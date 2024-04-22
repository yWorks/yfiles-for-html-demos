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
# WebGL2 Animations Demo

# WebGL2 Animations Demo

In this demo you can try out the different WebGL2 animations and their settings. Animations can be used, for example, to highlight an interesting element or whole part of a graph.

In particular, this demo highlights the currently hovered or selected connected component with an animation of the chosen type and settings. Recall that a connected component consists of all nodes that can reach each other.

Note that the animated items all share the same [WebGL2Animation](https://docs.yworks.com/yfileshtml/#/api/WebGL2Animation) object.

## Things to Try

- Hover over a component, or select one, and observe the animation.
- Select different animations types for highlighting the current component:
  - For the component itself, "Pulse", "Scale", or "Shake" are fitting animations.
  - Use different "Fade" animations and hide or desaturate a component to bring this component to attention.
- Note that for fade animations, shorter animation durations are more noticeable.
- Experiment with other animation configurations to achieve the desired effect.
