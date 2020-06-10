# Maze Routing Demo

<img src="../../resources/image/mazerouting.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/layout/mazerouting/index.html).

This demo shows how the [EdgeRouter](https://docs.yworks.com/yfileshtml/#/api/EdgeRouter) can be used for finding routes through a maze. This algorithm tries to find the way with the fewest possible changes in direction trying to avoid possible obstacles.

The graph consists of the nodes that form the maze and the normal ones. The maze nodes are visible only during the layout and serve as obstacles for the algorithm. Also, a non-editable background visual is created from these maze nodes and is displayed inside the graph component.

## Things to try

- Change the settings of the `EdgeRouter` from the configuration panel on the right to see how the routing of the edges changes.
- Modify the graph with one of the following operations to see how the affected edges are rerouted:
  - Create new edges.
  - Move nodes or edges.
  - Resize nodes.
