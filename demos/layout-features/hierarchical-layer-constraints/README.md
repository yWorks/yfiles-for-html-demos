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
# Hierarchical Layout with Layer Constraints

<img src="../../../doc/demo-thumbnails/layout-layer-constraints.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-layer-constraints/).

This demo shows how to customize the assignment of nodes to layers (layering) when using [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout).

## Layer constraints

- Node 9 is placed in the topmost layer with the [placeAtTop](https://docs.yworks.com/yfileshtml/#/api/LayerConstraintData#placeAtTop) method.
- Node 7 is placed in the bottommost layer with the [placeAtBottom](https://docs.yworks.com/yfileshtml/#/api/LayerConstraintData#placeAtBottom) method.
- Node 0 is placed at least one layer below node 9 with the [placeInOrder](https://docs.yworks.com/yfileshtml/#/api/LayerConstraintData#placeInOrder) method.
- Node 2 is placed in the same layer as node 0 with the [placeInSameLayer](https://docs.yworks.com/yfileshtml/#/api/LayerConstraintData#placeInSameLayer) method.

## Things to Try

Click the button in the toolbar to toggle between hierarchical layout with and without configured constraints.

## Demos

- [Layer Constraints Demo](../../layout/layerconstraints/)

## Documentation

- [Constrained Layer Assignment](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout-constrained_layer_assignment)
- [Constrained Node Sequencing](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout-constrained_node_sequencing)
- [LayerConstraintData](https://docs.yworks.com/yfileshtml/#/api/LayerConstraintData)
- [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData)
