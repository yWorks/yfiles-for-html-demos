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
# Radial Group Layout

<img src="../../../doc/demo-thumbnails/layout-radial-group-layout.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/radial-group/).

This demo demonstrates the [RadialGroupLayout](https://docs.yworks.com/yfileshtml/api/RadialGroupLayout) algorithm for arranging grouped graphs.

Child nodes are positioned around their parent group's border, visually representing group hierarchy.

It highlights the configuration of various aspects:

- [Node Styles](https://docs.yworks.com/yfileshtml/api/ShapeNodeStyle): Both group and leaf nodes are [ellipse](https://docs.yworks.com/yfileshtml/api/ShapeNodeShape#ELLIPSE) for optimal radial group layout results. Groups are gray while leaf nodes are colored.
- [Parent Overlap Ratio](https://docs.yworks.com/yfileshtml/api/RadialGroupLayoutData#parentOverlapRatios): Blue nodes have a ratio of 0.5, overlapping slightly with their parent. Orange nodes have a ratio of 0, with no overlap.
- [Label Placement](https://docs.yworks.com/yfileshtml/api/RadialGroupLayout#nodeLabelPlacement): The algorithm supports [RAY_LIKE_LEAVES](https://docs.yworks.com/yfileshtml/api/RadialNodeLabelPlacement#RAY_LIKE_LEAVES) ray-like label placement.
- [Edge Bundling](https://docs.yworks.com/yfileshtml/api/RadialGroupLayout#edgeBundling): Edges are drawn as bundled Bezier curves.

## Demos

- [Layout Styles: Radial Demo](../../showcase/layoutstyles/index.html?layout=radial&sample=radial)
- [Large Graph Aggregation Demo](../../showcase/largegraphaggregation/)

## Documentation

- [Radial Group Layout](https://docs.yworks.com/yfileshtml/dguide/cactus_group_layout)
- [RadialGroupLayout](https://docs.yworks.com/yfileshtml/api/RadialGroupLayout)
- [RadialGroupLayoutData](https://docs.yworks.com/yfileshtml/api/RadialGroupLayoutData)
- [RadialNodeLabelPlacement](https://docs.yworks.com/yfileshtml/api/RadialNodeLabelPlacement)
