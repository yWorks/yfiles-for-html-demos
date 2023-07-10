<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Organic Substructures Demo

# Organic Substructures Demo

This demo showcases how the [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) algorithm handles substructures and node types, see [Layout of Regular Substructures](https://docs.yworks.com/yfileshtml/#/dguide/organic_layout-substructures) for more information.

The organic layout algorithm is able to identify regular substructures in a graph, like, e.g., chains, stars, cycles, trees, and parallel structures and arrange them in an optimized manner depending on the kind of substructure and user preference. This makes them easily recognizable in the resulting layout. Furthermore, specified node types may influence both substructure detection and placement of elements within the structure.

## Things to Try

- Load an example graph with the combobox 'Sample'.
- In the 'Layout Settings' panel on the right, use the combobox of the specific substructures to try out the different styles supported by each of them. Selecting value 'Ignore' means that the respective structure is ignored and not handle differently.
- Use the checkbox 'Use Edge Grouping' to see how edge grouping changes the flavor of parallel and separated radial star substructures.
- Use the checkbox 'Consider Node Types' to see how considering node types changes substructure detection and layout.
- The simple example graphs also offer to change the node types (i.e. color) by clicking on the nodes. In addition, most of the samples allow structural changes of the graph (use the "Layout" button to calculate a new layout after modifying the graph structure).
