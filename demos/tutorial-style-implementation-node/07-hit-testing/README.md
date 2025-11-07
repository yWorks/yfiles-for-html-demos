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
# 07 Hit-Testing - Tutorial: Node Style Implementation

<img src="../../../doc/demo-thumbnails/tutorial-style-implementation-node-hit-testing.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-style-implementation-node/07-hit-testing/).

Styles not only provide a visual representation for graph items. They also offer crucial parts for interacting with said items. Hit-testing determines whether a particular item is at a given point in the canvas. It happens all the time during interaction, e.g., when selecting items, moving nodes, or creating edges.

The default implementation in the `NodeStyleBase` class only considers the node layout when hit-testing. When nodes have shapes that deviate from the rectangular node layout, hit-testing has to be adjusted by providing a different implementation for the `isHit` method.

In this example, we have to exclude the upper-right corner for the hit-test. We also take the hit-test radius into account. This radius enables a bit of fuzziness when hit-testing the item, so you can still hit it when you’re slightly outside.

```
protected isHit(
  context: IInputModeContext,
  location: Point,
  node: INode
): boolean {
  // Check for bounding box
  if (!node.layout.toRect().contains(location, context.hitTestRadius)) {
    return false
  }
  const { x, y } = location
  const { x: layoutX, y: layoutY } = node.layout

  // Check for the upper-right corner, which is empty
  if (
    x > layoutX + tabWidth + context.hitTestRadius &&
    y < layoutY + tabHeight - context.hitTestRadius
  ) {
    return false
  }
  // all other points are either inside the tab or the rest of the node
  return true
}
```

Note

Try this implementation by hovering both nodes. Notice that the red node, which uses the default hit-test, also detects hits in the upper right, empty corner. The blue node uses the adjusted hit-test code.

[08 Edge Cropping](../../tutorial-style-implementation-node/08-edge-cropping/)
