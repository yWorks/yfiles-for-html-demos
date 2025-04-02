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
# Hierarchical Layout with Node Alignment - Layout Features

<img src="../../../doc/demo-thumbnails/layout-hierarchical-node-alignment.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-node-alignment/).

This demo shows how to configure the [Hierarchical Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) so that nodes on different layers that are connected by a critical (important) edge are aligned.

To achieve this, the user has to specify a priority value for each edge that should be considered as important. This value has to be a number greater than zero.

The critical edge priorities can be passed to the [Hierarchical Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) algorithm through the [criticalEdgePriorities](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#criticalEdgePriorities) property.

In this demo, we consider as critical the edges that belong to the longest path of the graph (refer to the pink edges). After the execution of the algorithm, the nodes that are connected with the critical edges are vertically aligned. Of course any other criterion may be used to define the set of critical edges and, thus, the aligned nodes.

_Note_: The nodes are horizontally aligned when using a horizontal layout orientation (i.e. left-to-right).

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/hierarchical-node-alignment/HierarchicalNodeAlignment.ts).

### Demos

You can also take a look at the more involved [Critical Paths Demo](../../layout/criticalpaths/) which shows how important paths can be emphasised by the hierarchical layout.

### Documentation

The Developer's Guide provides more information about the concepts of the [hierarchical layout](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout) in general and especially about [how to align a set of given nodes](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout#hierarchical_layout-emphasizing_critical_paths).
