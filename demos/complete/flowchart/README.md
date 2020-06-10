# Flowchart Demo

<img src="../../resources/image/flowchart.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/complete/flowchart/index.html).

This demo provides a number of [INodeStyle](https://docs.yworks.com/yfileshtml/#/api/INodeStyle)s which are shaped as common flowchart symbols. To use those different styles, drag them from the palette to the main graph component.

## Flowchart Layout

There is an adjusted [HierarchicLayout](https://docs.yworks.com/yfileshtml/#/api/HierarchicLayout) which considers some flowchart specialities.

- Incoming-edges are grouped if they are many and there are also some outgoing-edges.
- The direction of edges that represent positive ('yes') or negative ('branches') can be selected in the toolbar.
- Flatwise edges can be drawn entirely to one side or just attach at the side of a node.
- Long paths in the graph are aligned.

Try out the different styles on the set of sample graphs by selecting the directions and press the layout-button.
