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
# Flowchart Demo

<img src="../../../doc/demo-thumbnails/flowchart-editor.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/showcase/flowchart/).

This demo provides a number of [INodeStyle](https://docs.yworks.com/yfileshtml/#/api/INodeStyle) s which are shaped as common flowchart symbols. To use those different styles, drag them from the palette to the main graph component.

## Flowchart Layout

There is an adjusted [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) which considers some flowchart specialities.

- Incoming-edges are grouped if they are many and there are also some outgoing-edges.
- The direction of edges that represent positive ('yes') or negative ('branches') can be selected in the toolbar.
- Flatwise edges can be drawn entirely to one side or just attach at the side of a node.
- Long paths in the graph are aligned.

Try out the different styles on the set of sample graphs by selecting the directions and press the layout-button.
