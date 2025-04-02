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
# Theming - Application Features

<img src="../../../doc/demo-thumbnails/simple-theming.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/theming/).

This demo shows how to define a custom theme for the graph component by changing the `--yfiles-theme` CSS variables. A theme affects the color and look of the input handles (e.g. the handles to resize nodes), the marquee, the snap-lines, label position candidates, the graph overview marquee and also the indicators to select, highlight or focus items. The [Theming](https://docs.yworks.com/yfileshtml/#/dguide/customizing_view_theming) section of the Developers Guide explains the effects of a custom Theme in detail.

The custom theme in this demo uses a _round_ theme variant and a scale of _2_ to increase the size of the handles. The primary color is almost white, the secondary color and background color are orange-like.

This is done by setting the following CSS variables:

```
.yfiles-canvascomponent {
  --yfiles-theme-primary: #fcfdfe;
  --yfiles-theme-secondary: #f69454;
  --yfiles-theme-background: #ee693f;
  --yfiles-theme-variant: round;
  --yfiles-theme-scale: 2;
}
```

## Things to Try

- Observe the round handles on the preselected node.
- Select, create or move graph elements to see the appearance of the handles and snapping lines.
- Drag a marquee selection and observe that it uses the orange color defined by the custom theme.
- Note that the viewport rectangle of the graph overview component on the top left is defined by the color of the custom theme as well.
- Switch between light and dark mode by using the toolbar buttons. When switching, the coloring of graph items is changed and the background color of the graph component is changed by adding a _CSS_ class.

See the sources for details.
