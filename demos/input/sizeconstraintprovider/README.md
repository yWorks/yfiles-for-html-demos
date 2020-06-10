# Size Constraint Provider Demo

[You can also run this demo online](https://live.yworks.com/demos/input/sizeconstraintprovider/index.html).

This demo shows how resizing of nodes can be restricted.

This is done with custom implementations of the interface [INodeSizeConstraintProvider](https://docs.yworks.com/yfileshtml/#/api/INodeSizeConstraintProvider) that are added to the lookup of the nodes.

## Things to Try

Select and resize the nodes.

## Node Types

- _Blue nodes_ cannot shrink. Additionally, neither side can become larger than three times its initial size in each resizing operation.
- The minimum size of a _green node_ is the size of its label. It gets never smaller than that.
- The _orange node_ must always encompass the black rectangle. Additionally, it has predefined minimum and maximum sizes.
