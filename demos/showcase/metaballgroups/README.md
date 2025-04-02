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
# Metaball Groups Rendering Demo

<img src="../../../doc/demo-thumbnails/metaball-groups.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/showcase/metaballgroups/).

This demo shows how to render metaball-like background visualizations to show how nodes can be associated with zero or more groups. In contrast to regular group nodes, a regular node may belong to multiple metaball groups. Note that these groups don't exist in the graph structure, but only on the visualization level and cannot be interacted with in this demo.

## Things to Try

- Drag nodes around to see how the metaball rendering changes.
- Press the "Change Layout" button to calculate a new layout with different compactness and edge lengths and see all the nodes move around at the same time.
- Create new nodes and edges interactively using copy, paste, duplicate, and the regular graph interaction mechanisms.
- Note that this demo requires WebGL for rendering the metaballs efficiently.
