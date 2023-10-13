<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Template Styles Demo

# Template Styles Demo

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

- [String Template Node Style Demo](../../style/string-template-node-style/)
- [Vue Template Node Style Demo](../../style/vue-template-node-style/)
- [React JSX Component Style Demo](../../style/react-template-node-style/)
- [Lit Template Node Style Demo](../../style/lit-template-node-style/)
