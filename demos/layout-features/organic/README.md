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
# Organic Layout

<img src="../../../doc/demo-thumbnails/layout-organic.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/organic/).

This demo shows basic configuration options for the [OrganicLayout](https://docs.yworks.com/yfileshtml/api/OrganicLayout). The default behavior is modified in various ways, some of which are described below:

- The layout is configured to be [deterministic](https://docs.yworks.com/yfileshtml/api/OrganicLayout#deterministic), which causes the layout algorithm to produce identical results for identical input graph and settings.
- The [preferred edge length](https://docs.yworks.com/yfileshtml/api/OrganicLayoutData#preferredEdgeLengths) is increased.
- The [compactness factor](https://docs.yworks.com/yfileshtml/api/OrganicLayout#compactnessFactor) has been increased to yield a more compact layout. For small values, the resulting layout will use a lot of space and nodes tend to be far away from each other. Whereas values near 1.0 produce highly compact layouts.
- The [automatic overlap avoidance](https://docs.yworks.com/yfileshtml/api/OrganicLayout#allowNodeOverlaps) is disabled, so a manually chosen [minimum distances between nodes](https://docs.yworks.com/yfileshtml/api/OrganicLayoutData#minimumNodeDistances) is applied.
- A [shape restriction](https://docs.yworks.com/yfileshtml/api/OrganicLayout#shapeConstraint) is applied to constrain the result to be wider than tall.

## Demos

- [Layout Styles: Organic Demo](../../showcase/layoutstyles/index.html?layout=organic&sample=organic)

## Documentation

- [Organic Layout Algorithm](https://docs.yworks.com/yfileshtml/dguide/organic_layout)
- [OrganicLayout](https://docs.yworks.com/yfileshtml/api/OrganicLayout) class
- [OrganicLayoutData](https://docs.yworks.com/yfileshtml/api/OrganicLayoutData) class
