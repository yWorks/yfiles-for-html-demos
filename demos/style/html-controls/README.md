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
# HTML Controls Demo

<img src="../../../doc/demo-thumbnails/html-controls.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/style/html-controls/).

This demo shows how a custom HTML-based node style can be used to create interactive nodes that use HTML input elements and benefit from CSS responsiveness.

Adapting the contents of the node visualization to varying node sizes can often be achieved much easier when using an HTML-based style instead of an SVG visualization.

See [HTML Rendering](https://docs.yworks.com/yfileshtml/#/dguide/advanced-html_rendering) for details about when to prefer HTML- or SVG-based visuals.

For rich components and data binding support, you can consider using a framework instead of plain HTML/JS. See the framework-specific demos linked below for examples.

## Things to Try

- Edit the avatar image, name, date, status, or description in a node. Click the apply button to commit your changes.
- Select a node to see the corresponding data below. Changes to the node data are reflected here.
- Resize a node and note how the HTML elements adapt according to the CSS rules.
- Export the graph to an SVG image. Note that due to the use of HTML this SVG image will not render in standalone image editors.

## Selected Node Data

```
Select a node to display the associated data.
```

## Related Demos

- [React Component Node Style Demo](../../../demos-ts/style/react-component-node-style/README.html)
- [Vue Component Node Style Demo](../../../demos-ts/style/vue-component-node-style/README.html)
- [Angular Component Node Style Demo](../../../demos-ts/style/angular-component-node-style/README.html)
- [HTML Label Style Demo](../../style/html-label-style/)
- [Data Table Demo](../../style/datatable/)
