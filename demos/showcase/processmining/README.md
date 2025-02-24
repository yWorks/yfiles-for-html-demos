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

[You can also run this demo online](https://www.yworks.com/demos/showcase/processmining/).

This demo shows how to extract a graph from an event log and create an animated visualization of a process flow. The diagram shows the various steps in a processing pipeline and how entities move through the pipeline.

A heat map shows which elements in the graph are nearing their capacity limit. A custom node style for each process step shows the name of the process and the current load.

The visualization is able to render several thousand process entities at the same time in a smooth animation. It leverages WebGL for that purpose.

The event log is created by a simulator and can be replaced with custom data in the demo code. Note that the event log needs to consist of certain type described in `event-log-types.ts`.

## Things to Try

- Watch the animation.
- Zoom into and out of the graph.
- When the animation is finished, you can use the slider to rewind and inspect certain time snapshots.
- Press the play button to restart the animation.
