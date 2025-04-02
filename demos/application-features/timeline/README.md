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
# Timeline - Application Features

<img src="../../../doc/demo-thumbnails/timeline.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/timeline/).

This demo shows how to add a timeline component to the graph.

- Consists of a _main graph_ component that displays the graph and a _timeline_ component that displays the timeline.
- Hover/select bars of the timeline to highlight corresponding nodes in the main graph.
- The height of the bars in the timeline is determined by the number of node creation/removal events at each time point.
- The timeline component in this demo does _not_ include a timeframe rectangle or a play button, but they are _by default_ included in the `Timeline` class. Make use of them by initializing a default Timeline instance and register event listeners for filter change.

The input data structure can be arbitrary, but it needs to contain information about the start and end time for each node.
