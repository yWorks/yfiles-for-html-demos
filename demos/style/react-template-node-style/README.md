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
# React JSX Component Style Demo

<img src="../../../doc/demo-thumbnails/react-template-node-style.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/style/react-template-node-style/).

This demo presents the React Component node and label style that leverages JSX and the powerful data binding features of the [React framework](https://reactjs.org/).

With the React Component Style, node and label visualizations are defined by SVG or HTML component templates written with JSX, similar to the template styles that are included with the library. However, since the templates of this style can use JSX and the powerful data binding of React, complex requirements are more easy to realize.

Note that the implementation used here employs a runtime JSX compiler (Babel) that transforms the code to JavaScript which then gets evaluated for the purpose of the demo and interactivity. Real applications define the rendering function in JSX or TSX files and the compiler tool-chain performs the compilation at build time.

## Things to Try

Select nodes or labels in the view and inspect their templates and tag values in the text editors. Change the JSX code. Bind colors or text to properties in the tag. Then, apply the new template by pressing the button. Or modify the tag and see how the visualization changes.

## Related Demos

- [Template Styles Demo](../../style/templatestyles/)
- [Template Node Style Demo](../../style/template-node-style/)
- [Vue Template Node Style Demo](../../../demos-ts/style/vue-template-node-style/)
- [Lit Template Node Style Demo](../../style/lit-template-node-style/)
