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
# Metaball Groups Rendering Demo

# Metaball Groups Rendering Demo

This demo shows how to render metaball-like background visualizations to show how nodes can be associated with zero or more groups. In contrast to regular group nodes, a regular node may belong to multiple metaball groups. Note that these groups don't exist in the graph structure, but only on the visualization level and cannot be interacted with in this demo.

## Things to Try

- Select nodes and move them around to see how the metaball rendering changes.
- Press the "Change Layout" button to calculate a new layout with different compactness and edge lengths and see all the nodes move around at the same time.
- Create new nodes and edges interactively using copy, paste, duplicate, and the regular graph interaction mechanisms.
- Note that this demo requires WebGL for rendering the metaballs efficiently.
