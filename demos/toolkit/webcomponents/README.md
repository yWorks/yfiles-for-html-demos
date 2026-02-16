<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Web Components Integration Demo

<img src="../../../doc/demo-thumbnails/web-components.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/toolkit/webcomponents/).

This demo shows how yFiles for HTML can be used with Web Components.

[Web_Components](https://developer.mozilla.org/docs/Web/api/Web_Components) are supported by all modern browsers.

## Things to See

### Custom Graph Component Element

The GraphComponent is wrapped in a custom element. It can be used by writing

```
<graph-component></graph-component>
```

in your HTML markup, or by calling

```
document.createElement('graph-component')
```

in your JavaScript code.

The zoom property of the GraphComponent is reflected to an attribute of the custom element. Thus, the zoom level can be changed by simply setting the zoom attribute to a new value.

### Shadow DOM Encapsulation

The GraphComponents canvas is inside the shadow root of the graph-component custom element, encapsulating it from outside influences like user-defined CSS styles.

Try changing this editable style element to see how it affects the svg rectangles underneath, where the right one is inside a shadow root while the left one is not:

svg rect { fill: green; }

No Shadow Root With Shadow Root

You can also uncheck the 'Use Shadow Root' option in the toolbar to see how the user defined CSS affects the graph visualization.
