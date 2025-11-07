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
# Process Mining Visualization Demo

<img src="../../../doc/demo-thumbnails/process-mining.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/showcase/processmining/).

This demo shows how to extract a graph from an event log and create an animated visualization of a process flow. The diagram shows the various steps in a processing pipeline (e.g., stages in a user story life cycle) and how entities (e.g., user stories) move through the pipeline.

The heat map shows which elements in the graph are nearing their capacity limit. A custom node style for each process step shows the name of the process as well as the current load.

The visualization is capable to render several thousand process entities at the same time in a smooth animation. It leverages WebGL for that purpose.

The event log is created by a simulator and can be replaced with custom data in the demo code. Note that the event data needs to be typed a certain way, see `event-log-types.ts` for details.

## Things to Try

- Watch the animation.
- Zoom into and out of the graph.
- When the animation is finished, use the slider to rewind and inspect certain time snapshots.
- Select one of the moving entities to open a details popup.
- Restart the animation.
- Enable the infinite loop to restart the animation automatically after every finish.

## Known Issue in Safari

The heat map is currently not visible in Safari. It uses the [filter property of the Canvas 2D API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter), which is still an experimental feature in Safari and must be explicitly enabled in the settings.
