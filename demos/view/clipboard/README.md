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
# Clipboard Demo

# Clipboard Demo

The Clipboard demo shows different ways of using [GraphClipboard](https://docs.yworks.com/yfileshtml/#/api/GraphClipboard) for Copy & Paste operations.

The main goal of this demo is to show custom clipboard functionality. Regular clipboard operations like copying nodes, edges and labels are available out-of-the-box.

## Things to Try

- Cut, copy and paste elements with the usual keyboard shortcuts.
- Cut, copy and paste elements from one canvas to the other.
- Create new elements in the canvas with the usual gestures. Click to focus a canvas, then click it again to create a node.

## Remarks

- Note how both paste variants update the labels of the copied nodes.
- _Paste Special_ only pastes nodes and node labels, even if edges have been also copied or cut.
- The nodes have a "business object" associated with the elements reflected in the nodes' titles (the text which is displayed inside the node). Editing the `name` property of a node's business object via the "Edit name" button changes the node's title, too, as it is bound to the name of the business object.  
  See class `ClipboardBusinessObject` which is associated via the node's [ITagOwner#tag](https://docs.yworks.com/yfileshtml/#/api/ITagOwner#tag).
- The two nodes which are linked with the "Shared Object" edge share the same business object. Editing the name of one of the nodes will also change the name of the other object. Note that, the referential identity between them is maintained across clipboard operations: For instance, copy and paste both nodes and edit the name of one of the new nodes to see that the names of the associated nodes also change.
