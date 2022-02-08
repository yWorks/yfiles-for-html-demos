# WebGL2 Styles Demo

<img src="../../resources/image/webgl-styles.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/style/webgl-styles/index.html).

# WebGL2 Styles Demo

This demo shows the available styles for nodes, edges and labels in WebGL2 rendering.

For nodes there are eight shapes with three node effects available, edges can have three edge styles with four arrow types, and finally labels can have any of three label styles.

The initial graph displays the various node shapes in the columns and the node effects, edge and arrow types in the rows.

Rows are grouped together in a group node which can be collapsed and expanded. When expanding a group node, the previously set style is re-applied to the children. For the sake of brevity saving and restoring styles has been omitted for labels and edges and the group node itself.

Every node has two labels, one using the [WebGL2DefaultLabelStyle](https://docs.yworks.com/yfileshtml/#/api/WebGL2DefaultLabelStyle) and one using the [WebGL2IconLabelStyle](https://docs.yworks.com/yfileshtml/#/api/WebGL2IconLabelStyle).

Every row also has an edge style with a distinct arrow type for the source and target arrows.

## Things to Try

You can configure the styles for newly created nodes, edges and labels. Note that labels are automatically added to new nodes according to the current label style configuration.

You can also apply the configured styles to all or the selected graph elements by clicking the "Apply Styles" button.

Group nodes can be collapsed and expanded by clicking on it's IconLabel.

### Note on Firefox

Firefox currently has a problem generating images from the Font Awesome glyphs used as image labels for the nodes. Please reload the demo to properly show the image labels.
