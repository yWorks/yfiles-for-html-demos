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
# Simple Partition Grid Demo

# Simple Partition Grid Demo

This demo shows how to create a simple [PartitionGrid](https://docs.yworks.com/yfileshtml/#/api/PartitionGrid) that will be used by the hierarchic layout algorithm.

The information about the desired position of a node in the partition grid is stored in its tag and also appears in its label. The first digit represents the row index and the second the column index.

The layout algorithm will calculate the positions of the nodes based on this information such that the nodes are assigned to the correct cell of the partition grid.
