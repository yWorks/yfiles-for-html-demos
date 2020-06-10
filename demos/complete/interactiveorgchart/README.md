# Interactive Organization Chart Demo

<img src="../../resources/image/interactiveorgchart.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/complete/interactiveorgchart/index.html).

This demo shows how to create an interactive organization chart from JSON data.

The source data is easily converted to a yFiles graph using class [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder).

The visualization of the employee is defined by an svg-template which is interpreted by the node style using the [Vue.js-framework](https://vuejs.org/v2/guide/index.html).

The demo also shows how a [FilteredGraphWrapper](https://docs.yworks.com/yfileshtml/#/api/FilteredGraphWrapper) can be used to display a subgraph of the model graph.

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

- Click on the port to hide and show the children, you can **Hide Children** by clicking on ![](resources/minus.svg) and you can **Show Children** by clicking on ![](resources/plus.svg).
- Make right click on the node to see the **Context Menu**, for the selected node you can:

- Hide Parent: hides the parent of the currently selected employee.
- Show Parent: shows the parent of the currently selected employee.
- Hide Children: hides the children of the currently selected employee.
- Show Children: Shows the children of the currently selected employee.
- Show All: show all employees

- In the Toolbar, you can **Show All** nodes by clicking on ![](../../resources/icons/star-16.svg).
