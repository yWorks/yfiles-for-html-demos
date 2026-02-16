<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Hierarchical Layout with Constraints

<img src="../../../doc/demo-thumbnails/layout-constraints.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-constraints/).

This demo shows how to customize the assignment of the nodes to the layers (layering) and the order of the nodes in a layer (sequencing) when using [HierarchicalLayout](https://docs.yworks.com/yfileshtml/api/HierarchicalLayout).

## Layer Constraints

The layout is configured such that node 4 and node 5 are placed on the same layer.

The default hierarchical layout without constraints will place node 5 on the next layer.

## Sequence Constraints

The layout is configured such that node 5 follows after node 4.

## Things to Try

Click the button in the toolbar to toggle between hierarchical layout with and without configured constraints.

## Demos

- [Layer Constraints Demo](../../layout/layerconstraints/)
- [Sequence Constraints Demo](../../layout/sequenceconstraints/)

## Documentation

- [Constrained Layer Assignment](https://docs.yworks.com/yfileshtml/dguide/hierarchical_layout-constrained_layer_assignment)
- [Constrained Node Sequencing](https://docs.yworks.com/yfileshtml/dguide/hierarchical_layout-constrained_node_sequencing)
- [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/api/HierarchicalLayoutData)
