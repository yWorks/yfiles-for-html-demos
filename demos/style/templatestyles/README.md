<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Template Styles Demo

<img src="../../../doc/demo-thumbnails/template-styles.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/style/templatestyles/).

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

## Related Demos

- [Template Node Style Demo](../../style/template-node-style/)
- [Vue Component Node Style Demo](../../../demos-ts/style/vue-component-node-style/README.html)
- [Vue Template Node Style Demo](../../../demos-ts/style/vue-template-node-style/README.html)
- [React Component Node Style Demo](../../../demos-ts/style/react-component-node-style/README.html)
- [React JSX Component Style Demo](../../../demos-ts/style/react-template-node-style/README.html)
- [Lit Template Node Style Demo](../../style/lit-template-node-style/)
