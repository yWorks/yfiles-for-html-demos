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
# Incremental Organic Layout

<img src="../../../doc/demo-thumbnails/layout-organic-incremental.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/organic-incremental/).

This demo shows how to run the [OrganicLayout](https://docs.yworks.com/yfileshtml/api/OrganicLayout) algorithm on a predefined subset of nodes in a graph.

To achieve this, two setup steps are necessary:

- The algorithm has to know which set of nodes to work on. Class [OrganicLayoutData](https://docs.yworks.com/yfileshtml/api/OrganicLayoutData) offers the property [scope](https://docs.yworks.com/yfileshtml/api/OrganicLayoutData#scope), in which the set of [nodes](https://docs.yworks.com/yfileshtml/api/OrganicScopeData#nodes) can be specified.
- The layout algorithm has to be told whether a node and its surrounding nodes could possibly be laid out. To do so, the [scopeModes](https://docs.yworks.com/yfileshtml/api/OrganicScopeData#scopeModes) property can be set to the following scope modes: [AFFECTED](https://docs.yworks.com/yfileshtml/api/OrganicScope#AFFECTED), [FIXED](https://docs.yworks.com/yfileshtml/api/OrganicScope#FIXED), [INCLUDE_CLOSE_NODES](https://docs.yworks.com/yfileshtml/api/OrganicScope#INCLUDE_CLOSE_NODES) or [INCLUDE_EXTENDED_NEIGHBORHOOD](https://docs.yworks.com/yfileshtml/api/OrganicScope#INCLUDE_EXTENDED_NEIGHBORHOOD).

In this demo, the layout algorithm is only applied to the **orange nodes** — for which there is no predefined layout information in the JSON sample data — and their surrounding nodes.

## Documentation

- [Run organic layout on a subset of nodes](https://docs.yworks.com/yfileshtml/dguide/organic_layout#organic_layout-incremental)
- [OrganicLayout](https://docs.yworks.com/yfileshtml/api/OrganicLayout)
- [OrganicScopeData](https://docs.yworks.com/yfileshtml/api/OrganicScopeData)
- [OrganicScope](https://docs.yworks.com/yfileshtml/api/OrganicScope)
