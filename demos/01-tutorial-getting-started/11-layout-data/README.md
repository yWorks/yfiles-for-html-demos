# Layout Data - Getting Started Tutorial

<img src="../../resources/image/tutorial1step11.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/01-tutorial-getting-started/11-layout-data/index.html).

## Tutorial Demo 11

This step shows how to configure a layout algorithm using the information stored in the tag of the nodes.

In this demo, we saved for each node the preferred alignment within its layer (top, center or bottom) in its tag, and then, we used this value to configure the layout algorithm.

The layer alignment can take values between `0` and `1`, where `0` corresponds to top alignment, `0.5` to center alignment and `1.0` to bottom alignment.

The labels of the nodes indicate the desired layer alignment for each node as this is stored in the tag. Nodes with label text other than 'Top', 'Center' or 'Bottom' will be center-aligned. Group nodes will be aligned based on the alignment of their children.

- Select a different alignment for a node by changing its label text to 'Top', 'Center' or 'Bottom'. Then, click the 'Layout' button in the toolbar to run a new layout.
- Create new nodes and run a new layout. Newly created nodes will be center-aligned, unless otherwise specified by the user.

See the sources for details.
