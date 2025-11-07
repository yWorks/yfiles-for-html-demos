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
# Hierarchical Layout with Given Layering

<img src="../../../doc/demo-thumbnails/layout-hierarchical-with-given-layering.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-given-layering/).

This demo shows how to customize the [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) to place nodes in a predefined layer.

## Given Layering

The layout is configured such that nodes with the same layer index are placed in the same layer.

In this demo, the layer indices are stored in the nodes' tags and also presented in the labels of the nodes.

## Things to Try

Click the button in the toolbar to toggle between hierarchical layout with and without given layering.

## Demos

- [Interactive Hierarchical Layout Demo](../../layout/interactive-hierarchical/)

## Documentation

- [Assigning Nodes to Layers](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout-layer_assignment)
- [givenLayersLayererIndices](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#givenLayersIndices)
- [fromScratchLayeringStrategy](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout#fromScratchLayeringStrategy)
