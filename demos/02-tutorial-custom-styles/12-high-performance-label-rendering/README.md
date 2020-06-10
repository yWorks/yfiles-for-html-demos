# High Performance Rendering of Label - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step11.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/12-high-performance-label-rendering/index.html).

This step shows how to implement high-performance rendering for labels.

To do this, you need to implement [LabelStyleBase#updateVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#updateVisual) which is called when the container decides to update the visual representation of a label. In contrast to [LabelStyleBase#createVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#createVisual), we try to re-use the old visual instead of creating a new one.

Method `createRenderDataCache()` saves the relevant data for creating a visual. [LabelStyleBase#updateVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#updateVisual) checks whether this data has changed. If it hasn't changed, the old visual can be returned, otherwise the whole or part of the visual has to be re-rendered.

## Things to Try

- Take a look at the methods `updateVisual()` and `createRenderDataCache()` of class `MySimpleLabelStyle`.

## Left to Do

- Implement a button to open the label editor.
- Allow to change the background color of labels.
- Create a custom edge style.
- Create a custom port style for nodes.
- Use the decorator pattern to add label edges to the nodes.
- Create a custom group node style.
