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
# WebGL Precompilation Demo

<img src="../../../doc/demo-thumbnails/webgl-precompilation.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/view/webgl-precompilation/).

This demo shows how to precompile the WebGL styles you want to use. By doing this, you can avoid seeing the fallback styles that are used to render the graph while the more elaborate and more expensive to compile styles are being loaded. Instead, a loading indicator is shown while the compilation takes place.

Initially, the standard SVG rendering is enabled on both graphs. When the "Enable WebGL" button in the toolbar is clicked, WebGL rendering is enabled immediately for the left graph. For the right graph, a loading screen is shown instead while the WebGL styles are precompiled. Once the compilation finishes, the loading screen is removed and WebGL rendering is enabled.

Note that WebGL compilation behavior is influenced by lots of factors that are out of the demo's control, such as different browsers, operating systems, graphics cards, and their drivers. Thus, you might see different outcomes when enabling WebGL rendering. Sometimes, the shaders are being cached by the browser/OS, so that you might not see the full effect of precompiling (as they compile instantly, basically).

### A note on Firefox

Firefox does not support asynchronous compilation of shader programs. When enabling WebGL, the UI will block until all shaders are compiled. Therefore one would usually use a loading indicator as shown in the right graph component to inform the user that the app is currently not available for interaction.

## Things to Try

- Click the "Enable WebGL" button to enable WebGL rendering.
- Left-click on a node, edge, or label to select it and see the selection style.
- Right-click on a node, edge, or label to highlight it and see the highlight style.
