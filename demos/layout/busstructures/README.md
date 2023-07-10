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
# Hierarchic Bus Structures Demo

# Hierarchic Bus Structures Demo

This demo shows how bus structures in the hierarchic layout can result in much more compact arrangements.

So-called bus structures are related to edge grouping. A bus structure consists of a root node and bus nodes that are directly connected to the root node. All edges connecting bus nodes of the same structure have the same edge direction.

## Demo Presets

The demo offers different configuration presets alongside an option to customize it arbitrarily.

Balanced

Each bus is assigned a default [HierarchicLayoutBusDescriptor](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutBusDescriptor) with no further configuration.

Leaves

Each bus uses a [HierarchicLayoutBusDescriptor](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutBusDescriptor) where only one node is allowed before and after the bus by setting `maximumNodesAfterBus` and `maximumNodesBeforeBus` to one.

Squares

The [HierarchicLayoutBusDescriptor](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayoutBusDescriptor) for each bus is configured separately such that its elements will be arranged in a square.

Left Aligned

Setting the `maximumNodesBeforeBus` to zero and allowing arbitrarily many nodes after the bus, results in a left alignment.

Right Aligned

Setting the `maximumNodesAfterBus` to zero and allowing arbitrarily many nodes before the bus, results in a right alignment.

Custom

In this mode, you can play around with the sliders that control the `maximumNodesAfterBus` and `maximumNodesBeforeBus` setting to see its effect.

## Things to Try

- Click _Toggle Bus Structures_ to see the difference between the layout without bus structures and the current bus structure preset.
- Try the different bus structure presets in the dropdown menu.
- Choose the _Custom_ preset of the dropdown and try different settings for `maximumNodesAfterBus` and `maximumNodesBeforeBus` with the sliders.
- Edit the graph and click the button to re-run the layout with the current settings.
