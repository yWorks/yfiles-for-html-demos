# Graph Builder Demo

<img src="../../resources/image/graphbuilder.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/databinding/graphbuilder/index.html).

This demo uses the class [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) to interactively build and modify a graph from business data.

See the the Developer's Guide section on the [GraphBuilder](https://docs.yworks.com/yfileshtml/#/dguide/graph_builder-GraphBuilder) for an in-depth explanation of the relevant concepts.

The demo allows to define multiple nodes and edges sources from different data and with different data bindings and styles.

Per default, [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder) stores the business data object of each node in the node's [ITagOwner#tag](https://docs.yworks.com/yfileshtml/#/api/ITagOwner#tag) property. Thus, the properties of a node's [TemplateNodeStyle](https://docs.yworks.com/yfileshtml/#/api/TemplateNodeStyle) can be bound to this object.

## Things to Try

- Select a sample in the combo box and inspect its data and sources on the right.
- Click the "Add Source" buttons to add another nodes or edges source.
- Click the "Edit" buttons to modify a source's data, bindings and style.
- Build a graph from your own data and bindings.

## Graph Builder Settings

- While _New Graph_ creates a new graph from the given data, _Update Graph_ adjusts the graph to changed data and keeps nodes and edges whose source objects are still present.
- _Nodes Sources_ contains the data that specifies the graph's nodes sources. You can edit and remove existing nodes sources as well as add new ones.  
  The nodes source can either be an array or another object containing the nodes business data.  
  The nodes visual appearance is configured in the template field. See [Using SVG Templates in Styles](https://docs.yworks.com/yfileshtml/#/dguide/custom-styles_template-styles) for further information.
- _Edges Sources_ contains the data that specifies the graph's edges sources. You can edit and remove existing edges sources as well as add new ones.

Since this demo evaluates the complete data source texts every time a source is edited, _Update Graph_ works as expected only for node data items of primitive type or if the node id binding resolves to primitive ids. Note that this restriction applies only to the demo, not the class [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder).
