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
# Circular Snapping Demo

<img src="../../../doc/demo-thumbnails/circle-snapping.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/input/circle-snapping/).

This demo shows how to use the **snapping feature** to support editing a radial tree layout.

The snapping feature provides snap circles for all children around their parent and snap lines for the most important angles. There are also some snap lines to align sibling nodes on a circle.

Snap circles and lines will only appear for the direct parent and siblings of the moved node.

## Things to Try

- Move a leaf node and place it anywhere on the same radius. A snap circle will appear for visual support.
- Move a node to the top, left, bottom, and center and snap it to the predefined angles and on the circle.
- Move a node opposite to one of its siblings and align both nodes.
- Move a node between two of its siblings and place it centered between them.

See the sources for details.
