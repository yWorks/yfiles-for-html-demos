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
# Hierarchical Layout with Node Port Candidates - Layout Features

<img src="../../../doc/demo-thumbnails/layout-hierarchical-node-port-candidates.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/layout-features/hierarchical-node-port-candidates/).

This demo shows how to use a set of [node port candidates](https://docs.yworks.com/yfileshtml/#/api/NodePortCandidates) for the [Hierarchical Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) to define the port locations for a node as well as control how many edges can be connected to each port.

For the turquoise node, a set of [node port candidates](https://docs.yworks.com/yfileshtml/#/api/NodePortCandidates) is used that contains four port candidates, one for each side of the node.

Each [LayoutPortCandidate](https://docs.yworks.com/yfileshtml/#/api/LayoutPortCandidate) only allows for one connecting edge, hence the four incoming edges are distributed to the four port candidates.

Click the button in the toolbar to toggle between [Hierarchical Layout](https://docs.yworks.com/yfileshtml/#/api/HierarchicalLayout) with and without a configured port candidate set.

### Code Snippet

You can copy the code snippet to configure the layout from [GitHub](https://github.com/yWorks/yfiles-for-html-demos/blob/master/demos/layout-features/hierarchical-node-port-candidates/HierarchicalNodePortCandidates.ts).

### Documentation

See the [Restricting Port Locations](https://docs.yworks.com/yfileshtml/#/dguide/layout-port_locations) section in the Developer's Guide for an in-depth discussion of the relevant concepts.
