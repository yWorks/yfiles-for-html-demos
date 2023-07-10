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
# Cactus Group Layout - Layout Features

# Cactus Group Layout

This demo shows how to create a beautiful layout of a grouped graph using the [CactusGroupLayout](https://docs.yworks.com/yfileshtml/#/api/CactusGroupLayout).

It arranges a hierarchically grouped graph so that children of a group are placed adjacent to the group along its circular border (thus, resembling the structure of a cactus). This way, the positions of the nodes implicitly represent the group hierarchy.

- To get good results using the cactus layout, the style of the nodes and group nodes should be round. In this demo, both use an elliptical [ShapeNodeStyle](https://docs.yworks.com/yfileshtml/#/api/ShapeNodeStyle) where group nodes are gray and leaf nodes are colored.
- Green leaf nodes have the [parent overlap ratio](https://docs.yworks.com/yfileshtml/#/api/CactusGroupLayoutData#parentOverlapRatio) set to 0.5, whereas red leaf nodes have it set to 0, meaning that they do not overlap with their parent group.
- The cactus algorithm supports [ray-like node labeling](https://docs.yworks.com/yfileshtml/#/api/NodeLabelingPolicy#RAY_LIKE_LEAVES), which is shown with an example label at each leaf node.
- The edges are drawn as bezier curves and using bundling in this demo. This can be configured via the [edge bundling property](https://docs.yworks.com/yfileshtml/#/api/CactusGroupLayout#edgeBundling).

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/cactus/Cactus.ts).

### Documentation

The Developer's Guide provides in-depth information about the [Cactus Group Layout](https://docs.yworks.com/yfileshtml/#/dguide/cactus_group_layout) and its features.
