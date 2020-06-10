# Template Styles Demo

<img src="../../resources/image/templatestyles.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/style/templatestyles/index.html).

This demo shows how to create SVG templates for nodes, labels and ports. It also shows how to customize various aspects of template styles.

### Template Styles

Template Styles use SVG snippets ('templates'), defined in either HTML or a string argument, to create the visualization for nodes, labels, ports or table stripes.

### Data Binding

SVG attributes can be bound to graph item data or to contextual information, using a special binding syntax, e.g.  
`fill="{Binding myColor}"`  
The bound values can be manipulated and processed using converters. This makes it possible to set visual attributes based on the item data, e.g. you can link the background color of an employee node to the employee's business unit.

### Template Bindings

The binding context gives you information about the current state, e.g. the zoom level, the item size, the item's selection state, etc. Template bindings are written like this:  
`width="{TemplateBinding width}"`

### Automatic Property Changes

The interface `IPropertyObservable` gives you the ability to update bindings automatically when the item's business data changes. For this reason, the business data in this demo is wrapped by class `Employee`.
