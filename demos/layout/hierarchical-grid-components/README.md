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
# Hierarchical Grid Components Demo

<img src="../../../doc/demo-thumbnails/hierarchical-grid-components.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/layout/hierarchical-grid-components/).

This demo shows how [grid components](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData#gridComponents) in the hierarchical layout can result in much more compact arrangements.

So-called grid components are related to edge grouping. A grid component consists of a root node and bus nodes that are directly connected to the root node. All edges connecting bus nodes of the same grid component have the same edge direction.

## Demo Presets

The demo offers different configuration presets alongside an option to customize it arbitrarily.

Balanced

Each grid component is assigned a default [GridComponentDescriptor](https://docs.yworks.com/yfileshtml/#/api/GridComponentDescriptor) with no further configuration.

Leaves

Each grid component uses a [GridComponentDescriptor](https://docs.yworks.com/yfileshtml/#/api/GridComponentDescriptor) where only one node is allowed before and after the common bus segment by setting `maximumNodesAfterBus` and `maximumNodesBeforeBus` to one.

Squares

The [GridComponentDescriptor](https://docs.yworks.com/yfileshtml/#/api/GridComponentDescriptor) for each grid component is configured separately such that its elements will be arranged in a square.

Left Aligned

Setting the `maximumNodesBeforeBus` to zero and allowing arbitrarily many nodes after the common bus segment, results in a left alignment.

Right Aligned

Setting the `maximumNodesAfterBus` to zero and allowing arbitrarily many nodes before the common bus segment, results in a right alignment.

Custom

In this mode, you can play around with the sliders that control the `maximumNodesAfterBus` and `maximumNodesBeforeBus` setting to see its effect.

## Things to Try

- Click _Toggle Grid Components_ to see the difference between the layout without grid components and the current grid component preset.
- Try the different grid component presets in the dropdown menu.
- Choose the _Custom_ preset of the dropdown and try different settings for `maximumNodesAfterBus` and `maximumNodesBeforeBus` with the sliders.
- Edit the graph and click the button to re-run the layout with the current settings.
