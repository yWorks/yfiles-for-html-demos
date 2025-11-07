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
# Organic Layout with Substructures

<img src="../../../doc/demo-thumbnails/layout-organic-substructures.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/layout-features/organic-substructures/).

This demo shows the ability of [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout) to consider substructures in the graph.

## Substructure Configuration

The graph contains three substructures: a cycle, a star and a chain, each substructure type is configured with a special style:

- The cycle with [CIRCULAR](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutCycleSubstructureStyle#CIRCULAR) style.
- The star with [RADIAL](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutStarSubstructureStyle#RADIAL) style.
- The chain with [RECTANGULAR](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutChainSubstructureStyle#RECTANGULAR) style.

## Things to Try

- Observe how the organic layout algorithm recognizes and arranges the different substructures according to its specific style configuration.
- Try modifying the substructure style settings to see how they affect the layout.

## Demos

- [Organic Substructures Demo](../../layout/organic-substructures/)

## Documentation

- [Layout of Regular Substructures](https://docs.yworks.com/yfileshtml/#/dguide/organic_layout-substructures)
- [OrganicLayout](https://docs.yworks.com/yfileshtml/#/api/OrganicLayout)
- [OrganicLayoutCycleSubstructureStyle](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutCycleSubstructureStyle)
- [OrganicLayoutStarSubstructureStyle](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutStarSubstructureStyle)
- [OrganicLayoutChainSubstructureStyle](https://docs.yworks.com/yfileshtml/#/api/OrganicLayoutChainSubstructureStyle)
