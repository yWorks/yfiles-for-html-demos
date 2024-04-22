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
# Hierarchic Subcomponents Demo

# Hierarchic Subcomponents Demo

This demo shows how hierarchic layout can arrange selected subcomponents of a graph with different layout styles.

Available styles are tree, organic, or orthogonal style, or a hierarchic style with different settings than the main layout.

The subcomponent placement policy defines how subcomponents are placed within the layout context of the remaining graph. If subcomponents are connected with a single node (light blue and green subcomponents) then the layout is able to place them to the left or right of this node.

## Things to Try

- Create a new subcomponent that gets an individual layout by selecting some nodes, choose a layout algorithm and style, and hit ![](../../resources/icons/plus2-16.svg). Then the new subcomponent is marked with a color and the layout is updated.
- Remove nodes from subcomponents. Select some nodes and press ![](../../resources/icons/minus2-16.svg). Those nodes are removed from their subcomponents.
- Add nodes and edges to the graph and update the layout by clicking on the layout button in the toolbar. Note that the layout only changes if the graph was modified.
