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
# 03 Managing Viewport - Basic Features Tutorial

# Managing the Viewport

## How to influence the viewport.

This step shows how to work with [the viewport of a GraphComponent](https://docs.yworks.com/yfileshtml/#/dguide/view_graphcontrol#view_graphcontrol_managing-the-view).

The graph in this example consists of four nodes, only three of which are visible in the initial viewport. The fourth node is initially outside of the viewport. Calling [fitGraphBounds](https://docs.yworks.com/yfileshtml/#/api/GraphComponent#GraphComponent-method-fitGraphBounds) adjusts the viewport of the [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) to contain the complete graph.

```
graphComponent.fitGraphBounds()
```

Fit Graph Bounds

The [zoom](https://docs.yworks.com/yfileshtml/#/api/CanvasComponent#CanvasComponent-property-zoom) and [viewPoint](https://docs.yworks.com/yfileshtml/#/api/CanvasComponent#CanvasComponent-property-viewPoint) can also be set manually. In this sample, we use both to reset the viewport to the initial state.

```
graphComponent.zoom = 1
graphComponent.viewPoint = Point.ORIGIN
```

Reset Viewport

Fitting the graph bounds actually consists of two operations, which are combined in [fitGraphBounds](https://docs.yworks.com/yfileshtml/#/api/GraphComponent#GraphComponent-method-fitGraphBounds). First, the [contentRect](https://docs.yworks.com/yfileshtml/#/api/CanvasComponent#CanvasComponent-property-contentRect) of the [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) is adjusted to the current graph size. Then, the content rect is fitted into the view using [fitContent](https://docs.yworks.com/yfileshtml/#/api/CanvasComponent#CanvasComponent-method-fitContent). Calling [fitGraphBounds](https://docs.yworks.com/yfileshtml/#/api/GraphComponent#GraphComponent-method-fitGraphBounds) has the same result as the following code:

```
graphComponent.updateContentRect()
graphComponent.fitContent()
```

Fitting the graph bounds can also be animated using the optional parameters of the [fitGraphBounds](https://docs.yworks.com/yfileshtml/#/api/GraphComponent#GraphComponent-method-fitGraphBounds) method.

```
await graphComponent.fitGraphBounds({ animated: true })
```

Animated Fit Graph Bounds

Note

Whether some of the default (keyboard) commands are animated can be configured with [animatedViewportChanges](https://docs.yworks.com/yfileshtml/#/api/CanvasComponent#CanvasComponent-property-animatedViewportChanges).

[04 Setting Styles](../../tutorial-yfiles-basic-features/04-setting-styles/index.html)
