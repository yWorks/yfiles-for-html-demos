<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Folding - Application Features

# Folding

This step shows how to enable[collapsing and expanding of group nodes](https://docs.yworks.com/yfileshtml/#/dguide/folding). This is provided through class [FoldingManager](https://docs.yworks.com/yfileshtml/#/api/FoldingManager) and its support classes.

[GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) provides the following default gestures for collapse/expand:

- Press CTRL+Numpad + or click the expand-button on the node's top left corner to open (expand) a closed group node.
- Press CTRL+Numpad - or click the collapse-button on the node's top left corner to close (collapse) an open group node.
- Press CTRL+Return to enter (navigate into) a group node.
- Press CTRL+Backspace to exit (navigate out of) a group node.

See the sources for details.
