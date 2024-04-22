<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Theming - Application Features

# Theming

This demo shows how to define a custom [Theme](https://docs.yworks.com/yfileshtml/#/api/Theme) for the graph component. A theme affects the color and look of the input handles (e.g. the handles to resize nodes), the marquee, the snap-lines, label position candidates, the graph overview marquee and also the indicators to select, highlight or focus items. The [Theming](https://docs.yworks.com/yfileshtml/#/dguide/customizing_view_theming) section of the Developers Guide explains the effects of a custom Theme in detail.

The custom theme in this demo uses a _round_ [ThemeVariant](https://docs.yworks.com/yfileshtml/#/api/ThemeVariant) and a scale of _2_ to increase the size of the handles. The primary color is almost white, the secondary color and background color are orange-like.

This demo also shows how to implement a simple switch between a _light_ and _dark_ application mode. The styles of the graph items are not affected by the theme. If you want to adapt the visualization of the graph items to the selected theme, then you can do that as shown here when switching between light and dark mode.

## Things to Try

- Observe the round handles on the preselected node.
- Select, create or move graph elements to see the appearance of the handles and snapping lines.
- Drag a marquee selection and observe that it uses the orange color defined by the custom theme.
- Note that the background color of the graph overview component on the top left is defined by the color of the custom theme as well.
- Switch between light and dark mode by using the toolbar buttons. Note that the theme is not affected by the mode. When switching, the coloring of graph items is changed and the background color of the graph component is changed by adding a _CSS_ class. Of course, in real-world applications, more elements could change appearance via _CSS_.

See the sources for details.
