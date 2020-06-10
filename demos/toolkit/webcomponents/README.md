# Web Components Integration Demo

<img src="../../resources/image/web_components.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/toolkit/webcomponents/index.html).

This demo shows how yFiles for HTML can be used with Web Components v1.

Please note that [Web Components](https://github.com/w3c/webcomponents) are currently not well supported by most browsers and require polyfills which have a significant impact on the application's performance. Also note that there are [browser issues](https://github.com/w3c/webcomponents/issues/179) besides unsupported features that should be considered before committing to the usage of Web Components.

This demo does not include polyfills for Web Components, which is why it might not work in your browser. Please visit [webcomponents.org](https://www.webcomponents.org/) and [caniuse.com](https://caniuse.com/#search=web%20components) for details on browser support for Web Components.

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

in your javascript code.

The zoom property of the GraphComponent is reflected to an attribute of the custom element. Thus, the zoom level can be changed by simply setting the zoom attribute to a new value.

### Shadow DOM Encapsulation

The GraphComponents canvas is inside the shadow root of the graph-component custom element. This encapsulates it from outside influences like user defined CSS styles.

Try changing this editable style element to see how it affects the svg rectangles underneath, where the right one is inside a shadow root while the left one is not:

svg rect { fill: green; }

No Shadow Root With Shadow Root

You can also uncheck the 'Use Shadow Root' option in the toolbar to see how the user defined CSS affects the graph visualization.
