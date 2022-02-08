# Reparent Handler Demo

<img src="../../resources/image/reparenthandler.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/input/reparenthandler/index.html).

# Reparent Handler Demo

This demo shows how reparenting of nodes can be customized.

This is done with a custom implementation of the interface [IReparentNodeHandler](https://docs.yworks.com/yfileshtml/#/api/IReparentNodeHandler) that is set as default reparent handler of the input mode of the graph component.

## Things to Try

Select and move a node. While dragging, press the `Shift` key to add or remove a node from a group. Angled indicators are shown at the group's corners if adding or removing is possible.

## Node Types

- _Red nodes_ cannot be added to any group.
- _Green nodes_ and _blue nodes_ can be added only to groups of the same color.
- _Green nodes_ can be reparented without pressing the `Shift` key.
