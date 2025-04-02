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
# Metabolic Pathways Demo

<img src="../../../doc/demo-thumbnails/metabolic-pathways.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout/metabolic-pathways/).

This demo shows how to configure the [organic layout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) for visualizing metabolic pathways.

A metabolic path way is a series of enzyme-catalyzed reactions that converts reactants or products into a final product. In this demo, nodes have different types based on their role in the pathway, i.e., products, reactants, reactions, co-reactants, enzymes and other.

Product

Reactant

Enzyme

Co-reactant

Other

Reaction

Based on the node types, the [organic layout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) is configured using constraints such that particular nodes are horizontally/vertically aligned, ordered or placed on a cycle.

## Things to try

Use the combo box in the toolbar to change the data-sample and observe the different node arrangements. In the first sample, i.e., the Pentose Phosphate Pathway, a series of nodes is vertically aligned while co-reactants are placed before their associated reaction and enzymes after it.

In the second sample, i.e., the Krebs Cycle, some nodes on the top part are vertically aligned, while the nodes that form a cycle are placed on the boundary of an actual circle. All other remaining nodes e.g., co-reactants, enzymes are forced to be placed either outside or inside the cycle.
