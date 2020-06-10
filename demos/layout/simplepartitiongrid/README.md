# Simple Partition Grid Demo

<img src="../../resources/image/simplePartitionGrid.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/layout/simplepartitiongrid/index.html).

This demo shows how to create a simple [PartitionGrid](https://docs.yworks.com/yfileshtml/#/api/PartitionGrid) that will be used by the hierarchic layout algorithm.

The information about the desired position of a node in the partition grid is stored in its tag and also appears in its label. The first digit represents the row index and the second the column index.

The layout algorithm will calculate the positions of the nodes based on this information such that the nodes are assigned to the correct cell of the partition grid.
