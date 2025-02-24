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

<img src="../../../doc/demo-thumbnails/folding-with-merged-edges.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/application-features/folding-with-merged-edges/).

This demo shows how to enable [collapsing and expanding of group nodes](https://docs.yworks.com/yfileshtml/#/dguide/folding). This is provided through class [FoldingManager](https://docs.yworks.com/yfileshtml/#/api/FoldingManager) and its support classes. Additionally, a [MergingFoldingEdgeConverter](https://docs.yworks.com/yfileshtml/#/api/MergingFoldingEdgeConverter) is used to merge edges between group nodes.

### Things to Try

- Collapse one or more groups. The [MergingFoldingEdgeConverter](https://docs.yworks.com/yfileshtml/#/api/MergingFoldingEdgeConverter) will merge the edges such that only one edge connects any node connected to the folder node. The label on the edge indicates how many edges were merged.
- Add additional nodes to the groups by entering the respective group. Add edges between nodes of separate group nodes and see the incrementing edge count.
- Add new groups and edges between child nodes.

[GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) provides the following default gestures for collapse/expand:

- Press Alt + LeftArrow or click the expand-button on the node's top left corner to close (collapse) an open group node.
- Press Alt + RightArrow or click the collapse-button on the node's top left corner to open (expand) a closed group node.
- Press Alt + DownArrow to enter (navigate into) a group node.
- Press Alt + UpArrow to exit (navigate out of) a group node.

See the sources for details.
