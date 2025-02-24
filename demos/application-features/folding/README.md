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
# Folding - Application Features

<img src="../../../doc/demo-thumbnails/folding.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/application-features/folding/).

This step shows how to enable [collapsing and expanding of group nodes](https://docs.yworks.com/yfileshtml/#/dguide/folding). This is provided through class [FoldingManager](https://docs.yworks.com/yfileshtml/#/api/FoldingManager) and its support classes.

[GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) provides the following default gestures for collapse/expand:

- Press Alt + LeftArrow or click the expand-button on the node's top left corner to close (collapse) an open group node.
- Press Alt + RightArrow or click the collapse-button on the node's top left corner to open (expand) a closed group node.
- Press Alt + DownArrow to enter (navigate into) a group node.
- Press Alt + UpArrow to exit (navigate out of) a group node.

See the sources for details.
