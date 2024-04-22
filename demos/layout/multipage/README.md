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
# Multi-page Layout Demo

# Multi-page Layout Demo

This demo shows the multi-page layout that divides a large graph into several smaller page graphs.

## About Multi-page Layout

[MultiPageLayout](https://docs.yworks.com/yfileshtml/#/api/MultiPageLayout) subdivides a large graph (called model graph) into a set of smaller graphs (called page graphs) such that the layout of each page graph fits a specified maximum page size. To guarantee that no information is lost when distributing the elements of the model over several pages, the algorithm introduces the following three kinds of auxiliary nodes.

## Auxiliary Nodes

Connector The layout algorithm replaces edges between nodes on different pages by so-called connector nodes. More precisely, for each edge between two nodes v and w that belong to different page graphs, there is a connector node attached to v that has the same label as node w. Similarly, there is a connector node attached to w that has the same label as node v. Click on a connector node to switch to the page graph that holds the related element.

Proxy The layout algorithm may also replicate a node as one or more proxy nodes, if the original node and its direct neighbors do not fit onto a single page. Proxy nodes have the same label as the node they replicate. Click on a proxy node to switch to the page graph that holds the replicated node.

Proxy Reference For each proxy node the layout algorithm creates a so-called proxy reference node in the page graph that holds the node which is replicated by the proxy. Proxy reference nodes are labeled with the number of the page graph that holds the referenced proxy node. Click on a proxy reference node to switch to the page graph that holds the referenced proxy node.
