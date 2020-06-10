# Organization Chart Viewer Demo

<img src="../../resources/image/orgchart.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/complete/orgchartviewer/index.html).

This demo shows how to create an interactive organization chart from JSON data.

The source data is easily converted to a yFiles graph using class [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder).

The employees are visualized using a custom node style that renders different levels of detail based on the zoom level.

## Automatic Layout

The organization chart is layouted automatically with the [TreeLayout](https://docs.yworks.com/yfileshtml/#/api/TreeLayout) and the [CompactNodePlacer](https://docs.yworks.com/yfileshtml/#/api/CompactNodePlacer) which determines the best arrangement strategy for each node in order to achieve a compact and clear layout.

## Organization Chart View

Mouse Wheel

Changes the zoom level of the view.

Click on Employee

Selects the employee in the chart and shows the corresponding data in the Properties View.

## Properties View

Click on a superior, subordinate, or colleague link to select and zoom to the corresponding node in the organization chart.

## Things to Try

Write something in the search box to search for an employee.
