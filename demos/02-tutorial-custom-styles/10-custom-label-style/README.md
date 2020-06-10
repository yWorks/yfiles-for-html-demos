# Custom Label Style - Custom Styles Tutorial

<img src="../../resources/image/tutorial2step10.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/10-custom-label-style/index.html).

This step shows how a custom label style.

## Things to Try

- Take a look at `MySimpleLabelStyle`.
- Select a label and open the label editor using "F2" to edit the label's text. Inserts line breaks with "Ctrl-Return". The size of the label doesn't adjust to the size of the text. If you move the node label from North to East, for example, this results in an overlap.
- Create a label using "Shift+F2" when a node or an edge is selected.

## Left to Do

- Make the label size adjust to its text.
- Override [LabelStyleBase#updateVisual](https://docs.yworks.com/yfileshtml/#/api/LabelStyleBase#updateVisual) to get high-performance rendering.
- Implement a button to open the label editor.
- Allow to change the background color of labels.
- Create a custom edge style.
- Create a custom port style for nodes.
- Use the decorator pattern to add label edges to the nodes.
- Create a custom group node style.
