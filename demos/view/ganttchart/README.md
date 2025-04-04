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
# Gantt Chart Demo

<img src="../../../doc/demo-thumbnails/gantt-chart.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/view/ganttchart/).

The Gantt Chart demo shows how to create a Gantt component from JSON data.

The data consists of tasks which define the horizontal lanes and activities, each of which is assigned to a task.

An activity has a start and an end date, and optionally a lead and/or a follow-up time. Also, an activity can optionally depend on other activities.

The activity duration is rendered as a solid area. The lead and follow-up times are rendered with a hatch pattern.

The activity dependencies are modeled as edges between the activity nodes.

## Things to Try

- Scroll the tasks using the mouse wheel.
- Scroll the timeline horizontally using Shift + mouse wheel.
- Hover over an activity to highlight its dependencies.
- Hover over a dependency edge to highlight its source and target.
- Select an activity to display the activity information.
- Grab and drag an activity to change the start and end time, or to assign an activity to a different task.
- Grab the left or right side of the solid area of an activity and drag to change the duration.
- Select an activity and drag one of the round handles on the left or right to change the lead or follow-up time.
- Select an activity and press F2 to change its name.
- Drag an activity so it overlaps with other activities in the same task lane. The activities are placed below each other so they don't overlap.
- Drag the mouse on an empty part of a task lane to create a new activity.
- Shift\-drag from a node to create a new dependency edge.
