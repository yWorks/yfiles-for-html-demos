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
# Layer Constraints Demo

# Layer Constraints Demo

Shows how to use layer constraints to restrict the node layering in [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout) .

The layer is determined by the model data.

A _weight_ property determines the position of the node. Higher weights will force a placement closer to the bottom. The weight is indicated by the number on the node and its background color. A darker color indicates a low weight, a brighter color a high weight. Red and green indicate that the node will be forced at the first or last position, respectively.

The weight can be changed using the buttons on each node.

A _weighted_ property, controlled by the **Constraints** button, determines whether the node should be constrained at all.

## Things to Try

- Change the weight of the nodes using the buttons on the each node.
- Disable the layer constraints for a node by unchecking the constraints button.
- Run a layout to see how the layer constraints affect the layout.
- Create a new random graph with the _New Graph_ button.
- Clicking on ![](../../resources/icons/star-16.svg) activates the constraints for each node.
- Clicking on ![](../../resources/icons/delete2-16.svg) in the toolbar removes all constraints from the nodes. In this case, integral values between 1 and 100 can be assigned as labels to the edges using the _F2_ key. These values will be interpreted as edge weights during the assignment of the layers. Higher values indicate higher importance. The algorithm tries to minimize the lengths of important edges. Thus, assigning higher edge label values will lead to the adjacent nodes coming closer together with respect to their layering. Although it is possible to assign weights to edges between nodes that have active constraints, constraints always have priority and thus, the result won't be visible as easy.
