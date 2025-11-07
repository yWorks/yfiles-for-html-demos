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
# Template Node Style Demo

<img src="../../../doc/demo-thumbnails/template-node-style.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/style/template-node-style/).

This demo presents a node style implementation that leverages a simple data binding and templating engine to declaratively render SVG as node style.

The templating engine is based on an implementation that was previously available in yFiles for HTML versions 1.x and 2.x, but which has since been removed and is provided here as a source code demo implementation.

With this style, node visualizations are defined by a SVG templating language, similar to what is known in React, Vue, Angular, and similar frameworks. `TemplateNodeStyle`'s template language is a lot simpler and less powerful than the templating support in the aforementioned frameworks, but it is more lightweight and does not depend on third party software. It was modelled after the `XAML` templating language.

## Things to Try

Change the template of one or more nodes. Bind colors or text to properties in the tag. Then, apply the new template by pressing the button. Or modify the tag and see how the style changes.

## Related Documentation

- [Using Data Binding in Node Styles](https://docs.yworks.com/yfileshtml/#/dguide/custom-styles_data-binding-in-styles)

## Related Demos

- [Template Styles Demo](../../style/templatestyles/)
- [Vue Component Node Style Demo](../../../demos-ts/style/vue-component-node-style/README.html)
- [React Component Node Style Demo](../../../demos-ts/style/react-component-node-style/README.html)
- [Lit Template Node Style Demo](../../style/lit-template-node-style/)
