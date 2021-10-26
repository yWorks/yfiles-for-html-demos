# Component Drag and Drop Demo

<img src="../../resources/image/componentdraganddrop.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/complete/componentdraganddrop/index.html).

A demo that shows how to make space for components that you can drag from a palette onto the canvas.

If a component is dragged from the palette onto the canvas, the _ClearAreaLayout_ algorithm will push away the other elements so there is a free area for the component. This is also the case when dragging a component that is already part of the graph.

## Things to Try

- Drag a component from the palette onto the canvas and watch the graph give way to it.
- Drop the dragged component at the desired location.
- Press the ESC key while dragging to cancel the drag and drop operation.
- Select the button _Keep Components_ to prevent the components from being changed during the drag and drop operation.
- Select a component by clicking on a node, drag the component through the remaining graph, and watch how the graph changes to provide space for it.

## Related Demos

- [Drag and Drop](../../input/draganddrop)
- [Graph Drag and Drop](../../input/graph-drag-and-drop)
- [Custom Drag and Drop](../../input/custom-drag-and-drop)
- [Tutorial: Drag and Drop](../../03-tutorial-application-features/drag-and-drop/index.html)
