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
# Circular Substructures Demo

# Circular Substructures Demo

This demo showcases how the [CircularLayout](https://docs.yworks.com/yfileshtml/#/api/CircularLayout) algorithm handles substructures and node types.

The circular layout algorithm is able to identify star substructures in a graph and arrange these stars in an optimized manner. This makes them easily recognizable in the resulting layout. Furthermore, specified node types may influence both substructure detection and placement of elements within the structure.

## Things to Try

- Load an example graph with the combobox 'Sample'.
- In the 'Substructure Layout' panel on the right, use the combobox to try out different arrangement styles for stars. Selecting value 'Ignore' means that the algorithm will neither try to detect stars nor optimize their arrangement.
- Use the checkbox 'Consider Node Types' to see how considering node types changes substructure detection and layout.
- The example graphs also offer to change the node types (i.e. color) by clicking on the nodes. Additionally, the samples allow structural changes of the graph (use the "Layout" button to calculate a new layout after modifying the graph structure).
