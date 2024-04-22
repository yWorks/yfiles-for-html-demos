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
# Flowchart Demo

# Flowchart Demo

This demo provides a number of [INodeStyle](https://docs.yworks.com/yfileshtml/#/api/INodeStyle) s which are shaped as common flowchart symbols. To use those different styles, drag them from the palette to the main graph component.

## Flowchart Layout

There is an adjusted [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout) which considers some flowchart specialities.

- Incoming-edges are grouped if they are many and there are also some outgoing-edges.
- The direction of edges that represent positive ('yes') or negative ('branches') can be selected in the toolbar.
- Flatwise edges can be drawn entirely to one side or just attach at the side of a node.
- Long paths in the graph are aligned.

Try out the different styles on the set of sample graphs by selecting the directions and press the layout-button.
