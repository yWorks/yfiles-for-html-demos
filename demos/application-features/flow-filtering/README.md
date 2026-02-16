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
# Flow Filtering

<img src="../../../doc/demo-thumbnails/flow-filtering.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/flow-filtering/).

This demo demonstrates how to dynamically show or hide items within the connecting upstream or downstream flows of a given node.

It uses the [Neighborhood](https://docs.yworks.com/yfileshtml/api/Neighborhood) algorithm to find the successors or predecessors of the given node.

## Things to Try

- Hover over a node to highlight items within the flow of the chosen direction.
- Select a node to hide its neighbors in the selected flow direction.
- Deselect the node by clicking on the empty canvas to show its neighbors again.
- Use the dropdown menu in the toolbar to set the direction for flow highlighting and filtering.

## Demos

- [Filtering Demo](../../application-features/filtering/)
- [Simple Highlight Decorator Demo](../../application-features/simple-highlight-decorator/)
- [Collapsible Trees Demo](../../view/collapse/)
- [Company Ownership Chart Demo](../../showcase/company-ownership/)
- [Neighborhood View Demo](../../showcase/neighborhood/)
- [Neighborhood Circles Demo](../../showcase/neighborhood-circles/)

## Documentation

- [Filtering](https://docs.yworks.com/yfileshtml/dguide/filtering)
- [Decorating graph components](https://docs.yworks.com/yfileshtml/dguide/customizing_graph-graph_decorator)
- [Neighborhood](https://docs.yworks.com/yfileshtml/api/Neighborhood)
- [FilteredGraphWrapper](https://docs.yworks.com/yfileshtml/api/FilteredGraphWrapper)
- [NodeStyleIndicatorRenderer](https://docs.yworks.com/yfileshtml/api/NodeStyleIndicatorRenderer)
