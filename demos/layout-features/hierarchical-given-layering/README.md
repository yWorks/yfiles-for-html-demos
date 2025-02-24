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
# Hierarchical Layout with Given Layering - Layout Features

<img src="../../../doc/demo-thumbnails/layout-hierarchical-with-given-layering.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/layout-features/hierarchical-given-layering/).

## Hierarchical Layout with Given Layering

This demo shows how to configure the [Hierarchical Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) so that the nodes are placed in a layer which is defined by the user.

To achieve this, the user has to specify a layer index (number) for each node based on which the nodes will be sorted in layers. The smaller index represents the topmost layer. Nodes with the same index will be placed in the same layer.

The layer indices can be passed to the hierarchical layout algorithm through the [givenLayersLayererIds](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#givenLayersLayererIds) property. Also, the user has to set the [fromScratchLayeringStrategy](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout#fromScratchLayeringStrategy) property to [USER_DEFINED](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutLayeringStrategy#USER_DEFINED).

In this demo, the layer indices are stored in the nodes' tags and also presented in the labels of the nodes.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/hierarchical-given-layering/HierarchicalGivenLayering.ts).

### Demos

You can also take a look at the [Interactive Hierarchical Layout Demo](../../layout/interactive-hierarchical/) demo in which the user can drag and move the nodes from one layer to another.

### Documentation

The Developer's Guide provides more information about the concepts of the [hierarchical layout](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout) in general and especially about [assigning nodes to layers](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout-layer_assignment).
