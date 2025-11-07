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
# Hierarchical Layout with Edge Labeling

<img src="../../../doc/demo-thumbnails/layout-hierarchical-edge-labeling.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-edge-labeling/).

This demo shows how to configure the [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) for automatic edge label placements.

## Label Placement

[Label models](https://docs.yworks.com/yfileshtml/#/api/ILabelModel) and their [parameters](https://docs.yworks.com/yfileshtml/#/api/ILabelModelParameter) control where labels appear. For manual placement, it's common to use models that limit possible positions. However, for automatic layout, it's best to use unrestricted models like [FreeEdgeLabelModel](https://docs.yworks.com/yfileshtml/#/api/FreeEdgeLabelModel) for maximum flexibility.

You can further guide label placement using [EdgeLabelPreferredPlacement](https://docs.yworks.com/yfileshtml/#/api/EdgeLabelPreferredPlacement), which specifies preferences such as placing labels near the edge's source or target, on a particular side, or with a specific rotation.

In this demo, each label is placed according to its text. Note that the default [prevention of upside-down labels](https://docs.yworks.com/yfileshtml/#/api/LabelStyle#autoFlip) is turned off to enable rotation of _Upside down_ and _Upwards_ labels.

## Things to Try

- Observe how "Close to Source" label appear near the edge’s source node.
- Observe "Close to Target" label near the target node.
- Notice "Parallel" labels aligned with the edge direction.
- Check the "Rotated" label, rotated by a fixed angle.
- Examine "Upside down" and "Upwards" labels which showcase special rotation configurations.

## Demos

- [Edge Label Placement Demo](../../layout/edgelabelplacement/)

## Documentation

- [Labeling](https://docs.yworks.com/yfileshtml/#/dguide/hierarchical_layout#_labeling_2)
- [Automatic Label Placement](https://docs.yworks.com/yfileshtml/#/dguide/label_placement)
- [EdgeLabelPreferredPlacement](https://docs.yworks.com/yfileshtml/#/api/EdgeLabelPreferredPlacement) class
- [FreeEdgeLabelModel](https://docs.yworks.com/yfileshtml/#/api/FreeEdgeLabelModel) class
- [LabelStyle.autoFlip](https://docs.yworks.com/yfileshtml/#/api/LabelStyle#autoFlip) property
