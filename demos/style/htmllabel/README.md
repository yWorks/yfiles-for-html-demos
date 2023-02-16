# HTML Label Style Demo

<img src="../../resources/image/htmllabel.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/style/htmllabel/index.html).

# HTML Label Style Demo

This demo shows how HTML can be used for rendering labels with a custom label style.

The custom style uses the [SVG <foreignObject>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) element to embed HTML elements in the default SVG rendering of the diagram.

Note that the <foreignObject> element [is supported](https://caniuse.com/mdn-svg_elements_foreignobject) by all modern browsers but not Internet Explorer nor Edge Legacy.

## HTML Label Editor

#### Creating and Editing Labels

- Press the F2 key while an element or connection is selected.
- Insert **HTML** text into the editor, i.e. `<strong>Hello World</strong>`

#### Styling Labels with CSS

The stylesheet for labels _html-label.css_ shows how the label texts are styled.

## Related Demos

- [Default Label Style](../default-label-style/index.html)
- [Markdown Label](../markdownlabel/index.html)
- [Rich Text Label](../richtextlabel/index.html)
- [Tutorial: Custom Label Style](../../02-tutorial-custom-styles/10-custom-label-style/index.html)
