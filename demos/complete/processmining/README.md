# Process Mining Visualization Demo

<img src="../../resources/image/processmining.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/complete/processmining/index.html).

This Process Mining Visualization demo shows how to create an animated visualization of a process flow. The diagram shows the various steps in a processing pipeline and how entities move through the pipeline.

A heat map shows which elements in the graph are nearing their capacity limit. A custom node style for each process step shows the name of the process and the current load.

The visualization is able to render several thousand process entities at the same time in a smooth animation. It leverages WebGL for that purpose.

Note that due to missing platform support, the present implementation of the heat map visualization will not render in Safari and older versions of Internet Explorer and Edge.

## Things to Try

- Watch the animation
- Zoom into and out of the graph
- When the animation is finished, you can use the slider to rewind and inspect certain time snapshots
- Press the play button to restart the animation
