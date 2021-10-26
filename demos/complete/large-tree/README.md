# Large Collapsible Tree Demo

<img src="../../resources/image/large-tree.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/complete/large-tree/index.html).

The Large Tree Demo uses [WebGL2](https://docs.yworks.com/yfileshtml/#/dguide/webgl2) as the rendering technique to display a large tree graph in order to optimize performance.

The graph can be manipulated by adding or removing layers. The child count of new layers can be changed with the slider control.

Adding and removing nodes is animated with layout and WebGL2 fade animations running in parallel.

The maximum graph size is limited to 250000 nodes.

### Things to Try

Use the controls to manipulate the graph:

- The layers determine the depth of the tree. Click the "+" and "-" buttons to add and remove layers.  
  The "+" button is disabled, if adding a layer with the current child count would exceed the maximum graph size of this demo. (In this case, try reducing the child count for less nodes in new layers.)
- The child count determines the number of children to be added to each leaf when a new layer is added.

### Graph information

Number of nodes:  
Number of edges:
