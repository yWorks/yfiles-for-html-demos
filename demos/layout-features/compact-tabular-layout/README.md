<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Compact Tabular Layout - Layout Features

# Compact Tabular Layout

This demo shows how to configure the [TabularLayout](https://docs.yworks.com/yfileshtml/#/api/TabularLayout) to create compact drawings.

The algorithm tries to calculate an arrangement that minimizes edge lengths. Since tabular layout only supports straight-line edges, [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) is used to calculate the final edge paths.

If the _Preserve Aspect Ratio_ button in the toolbar is selected, the tabular layout algorithm will use [layout policy](https://docs.yworks.com/yfileshtml/#/api/TabularLayoutPolicy) `FIXED_SIZE` to arrange the graph with an aspect ratio close to the aspect ratio of the [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent). Otherwise, the algorithm will use layout policy `AUTO_SIZE` to get a result that is as compact as possible.

If layout policy `FIXED_SIZE` is used, the tabular layout algorithm requires a [PartitionGrid](https://docs.yworks.com/yfileshtml/#/api/PartitionGrid) that defines the columns and rows for the resulting tabular arrangement. A `PartitionGrid` is not necessary for layout policy `AUTO_SIZE`. However, an empty grid may be given to the algorithm to specify the distances between the automatically calculated columns and rows.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/compact-tabular-layout/CompactTabularLayout.ts).

### Documentation

The Developer's Guide provides more information about the [tabular layout algorithm](https://docs.yworks.com/yfileshtml/#/dguide/tabular_layout).
