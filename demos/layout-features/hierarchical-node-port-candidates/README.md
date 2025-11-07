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
# Hierarchical Layout with Node Port Candidates

<img src="../../../doc/demo-thumbnails/layout-hierarchical-node-port-candidates.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/hierarchical-node-port-candidates/).

This demo shows how to use [NodePortCandidates](https://docs.yworks.com/yfileshtml/#/api/NodePortCandidates) to define the port locations and limit the number of edges per port in [HierarchicalLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout).

**Node 5** uses four port candidates, one for each side of the node.

Each [LayoutPortCandidate](https://docs.yworks.com/yfileshtml/#/api/LayoutPortCandidate) only allows for one connecting edge, hence the four incoming edges are distributed to the four port candidates.

## Things to Try

Click the button in the toolbar to toggle between hierarchical layout with and without a configured port candidate set.

### Documentation

- [Restricting Port Locations](https://docs.yworks.com/yfileshtml/#/dguide/layout-port_locations)
- [NodePortCandidates](https://docs.yworks.com/yfileshtml/#/api/NodePortCandidates)
- [HierarchicalLayoutData](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayoutData)
