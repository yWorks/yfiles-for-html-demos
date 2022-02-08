# Clear Rectangle Area Demo

<img src="../../resources/image/clearrectanglearea.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/layout/clearrectanglearea/index.html).

# Clear Rectangle Area Demo

A demo that shows how to interactively move graph elements around a rectangle in a given graph so that the modifications in the graph are minimal. The rectangle can be freely moved or resized.

Every time the rectangular area is moved or resized interactively, [ClearAreaLayout](https://docs.yworks.com/yfileshtml/#/api/ClearAreaLayout) will push away the other elements so there is a free area for the rectangle.

You can choose between different strategies for clearing the area:

- **Local:** Tries to change the layout rather locally.
- **LocalUniform:** Tries to change the layout rather locally but moving all necessary nodes by a uniform offset.
- **PreserveShapes:** Tries to preserve the shape of the existing edge paths.
- **PreserveShapesUniform:** Globally partitions the graph into two parts and moves them apart.
- **Global:** Divides the graph into two partitions somewhere along the area and moves them horizontally or vertically.

You can choose between different strategies for assigning nodes to components whose elements should preferably not be separated:

- **Single:** Each node is a separate component.
- **Connected:** Components are defined by the connected components.
- **Clustering:** Components are defined by edge betweenness clustering.

## Things to Try

- Drag the rectangle over the canvas and watch the graph give way to it.
- Change the size of the rectangle and observe how the graph adapts to the new situation.
- Select another strategy for clearing the rectangular area.
- Select another strategy for assigning nodes to components.
- Change the setting whether orthogonal edges should be considered or not.
- Hold down the Shift key while dragging to freeze the current graph layout. If you new release the Shift key when the mouse is hovering a group node, the rectangular area within the group node is kept free.
