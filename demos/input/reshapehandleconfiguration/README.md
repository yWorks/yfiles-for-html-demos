# Reshape Handle Provider Configuration Demo

[You can also run this demo online](https://live.yworks.com/demos/input/reshapehandleconfiguration/index.html).

This demo shows how resizing of nodes can be customized.

This is done with custom configurations of the default [IReshapeHandleProvider](https://docs.yworks.com/yfileshtml/#/api/IReshapeHandleProvider) that are added to the lookup of the nodes.

## Things to Try

- Select and resize the nodes.
- Hold Shift to keep the aspect ratio for any node.
- Hold Alt to resize around the node's center.

## Node Types

- _Red nodes_ cannot be resized. They don't display resize handles.
- _Green nodes_ show only four handles at the corners. During resizing, these handles always maintain the aspect ratio of the node.
- _Orange nodes_ cannot extend beyond the black rectangle. Note that orange nodes can only be resized so that the new bounding box stays withing the bounding black rectangle.
- _Blue nodes_ combine the behavior of the orange and green nodes.
