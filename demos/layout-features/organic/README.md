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
# Organic Layout - Layout Features

<img src="../../../doc/demo-thumbnails/layout-organic.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/organic/).

This demo shows basic configuration options for the [Organic Layout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout). The default behavior is modified in various ways, some of which are described below:

- The layout is [configured to be deterministic](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData#deterministic), which causes the layout algorithm to produce identical results for identical input graphs and identical settings.
- The [preferred edge length](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout#preferredEdgeLength) is increased.
- The [compactness factor](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData#compactnessFactor) has been increased to yield a more compact layout. For small values, the resulting layout will use a lot of space and nodes tend to be far away from each other. Whereas values near 1.0 produce highly compact layouts.
- To prevent labels from overlapping, the [node label awareness](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData#considerNodeLabels) is enabled.
- The [automatic overlap avoidance](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData#nodeOverlapsAllowed) is disabled, so a manually chosen [minimum distances between nodes](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData#minimumNodeDistance) is applied.
- An [output restriction](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutData#outPutRestriction) is applied to create a result that is wider than tall.

### Code Snippet

A quick glance at the source for the configuration can be taken at [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/organic/Organic.ts).

### Demos

The [Layout Styles: Organic Demo](../../showcase/layoutstyles/index.html?layout=organic&sample=organic) showcases even more configuration options for the [organic layout algorithm](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout).

### Documentation

The Developer's Guide provides in-depth information about [Organic Layout](https://docs.yworks.com/yfileshtml/#/dguide/organic_layout) and its features.
