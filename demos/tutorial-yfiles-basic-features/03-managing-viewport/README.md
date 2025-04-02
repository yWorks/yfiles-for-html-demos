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
# 03 Managing Viewport - Tutorial: Basic Features

<img src="../../../doc/demo-thumbnails/tutorial-basic-features-managing-viewport.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/tutorial-yfiles-basic-features/03-managing-viewport/).

## How to influence the viewport.

This step shows how to work with [the viewport of a GraphComponent](https://docs.yworks.com/yfileshtml/#/dguide/view_graphcontrol#view_graphcontrol_managing-the-view).

The graph in this example consists of four nodes, only three of which are visible in the initial viewport. The fourth node is initially outside of the viewport. Calling [fitGraphBounds](https://docs.yworks.com/yfileshtml/#/api/GraphComponent#GraphComponent-method-fitGraphBounds) adjusts the viewport of the [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) to contain the complete graph.

```
void graphComponent.fitGraphBounds()
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
graphComponent.updateContentBounds()
graphComponent.fitContent()
```

Fitting the graph bounds can also be animated using the optional parameters of the [fitGraphBounds](https://docs.yworks.com/yfileshtml/#/api/GraphComponent#GraphComponent-method-fitGraphBounds) method.

```
await graphComponent.fitGraphBounds({ animated: true })
```

Animated Fit Graph Bounds

Note

Whether some of the default (keyboard) commands are animated can be configured with [animatedViewportChanges](https://docs.yworks.com/yfileshtml/#/api/CanvasComponent#CanvasComponent-property-animatedViewportChanges).

[04 Setting Styles](../../tutorial-yfiles-basic-features/04-setting-styles/)
