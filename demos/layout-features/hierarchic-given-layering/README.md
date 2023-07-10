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
# Hierarchic Layout with Given Layering - Layout Features

# Hierarchic Layout with Given Layering

## Hierarchic Layout with Given Layering

This demo shows how to configure the [Hierarchic Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout) so that the nodes are placed in a layer which is defined by the user.

To achieve this, the user has to specify a layer index (number) for each node based on which the nodes will be sorted in layers. The smaller index represents the topmost layer. Nodes with the same index will be placed in the same layer.

The layer indices can be passed to the hierarchic layout algorithm through the [givenLayersLayererIds](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutData#givenLayersLayererIds) property. Also, the user has to set the [fromScratchLayeringStrategy](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout#fromScratchLayeringStrategy) property to [USER_DEFINED](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutLayeringStrategy#USER_DEFINED).

In this demo, the layer indices are stored in the nodes' tags and also presented in the labels of the nodes.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/hierarchic-given-layering/HierarchicGivenLayering.ts).

### Demos

You can also take a look at the [Incremental Hierarchic Layout](../../layout/incrementalhierarchic/index.html) demo in which the user can drag and move the nodes from one layer to another.

### Documentation

The Developer's Guide provides more information about the concepts of the [hierarchical layout](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout) in general and especially about [assigning nodes to layers](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout-layer_assignment).
