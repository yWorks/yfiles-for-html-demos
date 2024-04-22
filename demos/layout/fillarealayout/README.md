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
# Fill Area Layout Demo

# Fill Area Layout Demo

A demo that shows how to fill free space after deleting nodes.

When nodes are deleted interactively, the _FillAreaLayout_ algorithm tries to fill free space with graph elements by moving nearby elements towards it, with the goal to make the existing layout more compact and not changing it too much.

You can choose between different strategies for assigning nodes to components whose elements should preferably not be separated:

- _Single:_ Each node is a separate component.
- _Connected:_ Components are defined by the connected components.
- _Clustering:_ Components are defined by edge betweenness clustering.

## Things to Try

- Select some nodes using marquee selection and press the Delete key.
- Select another strategy for assigning nodes to components.
