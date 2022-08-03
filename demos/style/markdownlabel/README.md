# Markdown Label Demo

<img src="../../resources/image/markdownlabel.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/style/markdownlabel/index.html).

# Markdown Label Demo

This demo shows how to create labels using markdown syntax.

The label style implementation `MarkdownLabelStyle` uses [markdown-it](https://github.com/markdown-it/markdown-it) to transpile markdown text into HTML. The actual rendering of the HTML text is done by `MarkupLabelStyle`.

## Label Editor

#### Creating and Editing Labels

- Press the F2 key while an element or connection is selected.
- Insert markdown text into the editor, i.e. `**Hello World**`
- Press `Ctrl-Return` to enter a newline

#### Supported Markdown

The markdown elements supported by this style labels are

- \# Headings
- \*emphasis\* and \*\*strong\*\* text
- ~~strikethrough~~ text
- \`code\` and  
  \`\`\`  
  code blocks  
  \`\`\`
- Newlines, with trailing backslash\\
- Paragraphs, using two subsequent newlines

#### Styling Labels with CSS

Since the markdown label style delegates to `MarkupLabelStyle` for rendering, elements can be styled with CSS classes.

The stylesheet for labels _markdown-label.css_ shows how the label texts are styled with external CSS.

#### Text Wrapping

Markdown labels can use line wrapping. In this demo application, the labels use word wrapping with ellipsis. Select and resize a node to observe the interactive text wrapping. Markdown labels can also be wrapped at character boundaries.

## Related Demos

- [Default Label Style](../default-label-style/index.html)
- [HTML Label](../htmllabel/index.html)
- [Rich Text Label](../richtextlabel/index.html)
- [Tutorial: Custom Label Style](../../02-tutorial-custom-styles/10-custom-label-style/index.html)
