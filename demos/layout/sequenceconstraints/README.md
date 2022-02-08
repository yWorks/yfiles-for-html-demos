# Sequence Constraints Demo

<img src="../../resources/image/sequenceconstraints.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/layout/sequenceconstraints/index.html).

# Sequence Constraints Demo

Shows how to use sequence constraints to restrict the node sequencing in [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout).

The sequence is determined by the model data.

A _weight_ property determines the position of the node. Higher weights will force a placement more on the right. The weight is indicated by the number on the node and its background color. A darker color indicates a low weight, a brighter color a high weight. Red and green indicate that the node will be forced at the first or last position, respectively.

The weight can be changed using the buttons on each node.

A _weighted_ property, controlled by the **Constraints** button, determines whether the node should be constrained at all.

## Things to Try

- Change the weight of the nodes using the buttons on the each node.
- Disable the sequence constraints for a node by unchecking the constraints button.
- Run a layout to see how the sequence constraints affect the layout.
- Create a new random graph with the _New Graph_ button.
- Clicking on ![](../../resources/icons/delete2-16.svg) in the toolbar will remove all constraints from the nodes, while clicking on ![](../../resources/icons/star-16.svg) activates the constraints for each node.
