# Fill Area Layout Demo

<img src="../../resources/image/fillarealayout.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/layout/fillarealayout/index.html).

A demo that shows how to fill free space after deleting nodes.

When nodes are deleted interactively, the _FillAreaLayout_ algorithm tries to fill free space with graph elements by moving nearby elements towards it, with the goal to make the existing layout more compact and not changing it too much.

You can choose between different strategies for assigning nodes to components whose elements should preferably not be separated:

- _Single:_ Each node is a separate component.
- _Connected:_ Components are defined by the connected components.
- _Clustering:_ Components are defined by edge betweenness clustering.

## Things to Try

- Select some nodes using marquee selection and press the Delete key.
- Select another strategy for assigning nodes to components.
