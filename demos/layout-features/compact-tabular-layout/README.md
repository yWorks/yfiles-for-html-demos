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
# Compact Tabular Layout

<img src="../../../doc/demo-thumbnails/layout-compact-tabular-layout.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/compact-tabular-layout/).

This demo shows how to configure the [TabularLayout](https://docs.yworks.com/yfileshtml/#/api/TabularLayout) to create compact drawings.

The algorithm tries to calculate an arrangement that minimizes edge lengths. Since tabular layout only supports straight-line edges, [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) is used to calculate the final edge paths.

Selecting the _Preserve Aspect Ratio_ button in the toolbar switches the layout mode to [FIXED_SIZE](https://docs.yworks.com/yfileshtml/#/api/TabularLayoutMode#FIXED_SIZE), maintaining a layout aspect ratio similar to that of the [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent). In contrast, deselecting it uses [AUTO_SIZE](https://docs.yworks.com/yfileshtml/#/api/TabularLayoutMode#AUTO_SIZE) mode for maximum compactness.

In `FIXED_SIZE` mode, the layout algorithm requires a [LayoutGrid](https://docs.yworks.com/yfileshtml/#/api/LayoutGrid) to define the layout's columns and rows. In `AUTO_SIZE` mode, a grid is optional, though it can be used to specify spacing between auto-calculated columns and rows.

## Things to Try

- Click the button in the toolbar to observe the effect.

## Documentation

- [Tabular layout algorithm](https://docs.yworks.com/yfileshtml/#/dguide/tabular_layout)
- [TabularLayout](https://docs.yworks.com/yfileshtml/#/api/TabularLayout) class
- [TabularLayoutData](https://docs.yworks.com/yfileshtml/#/api/TabularLayoutData) class
