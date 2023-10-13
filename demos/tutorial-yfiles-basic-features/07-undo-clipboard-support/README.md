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
# 07 Undo Clipboard Support - Tutorial: Basic Features

# Undo and Clipboard Support

## How to activate undo and clipboard.

This step shows how to use the [undo](https://docs.yworks.com/yfileshtml/#/dguide/interaction-support#interaction-undo) and [clipboard](https://docs.yworks.com/yfileshtml/#/dguide/customizing_interaction_clipboard) features.

### Undo

You can enable undo functionality for a [graph](https://docs.yworks.com/yfileshtml/#/api/IGraph) as follows:

```
graph.undoEngineEnabled = true
```

By enabling the undo functionality, the graph will store any edits made and allow for the use of undo/redo commands. This ensures that the following functionality is now available.

```
if (
  graph.undoEngineEnabled &&
  graph.undoEngine &&
  graph.undoEngine.canUndo()
) {
  graph.undoEngine.undo()
}
```

```
if (
  graph.undoEngineEnabled &&
  graph.undoEngine &&
  graph.undoEngine.canRedo()
) {
  graph.undoEngine.redo()
}
```

```
if (graph.undoEngineEnabled && graph.undoEngine) {
  graph.undoEngine.clear()
}
```

To test the functionality mentioned above, modify the graph (e.g. move, create, delete, resize nodes).

- Press Ctrl+Z to undo changes, or click the _Undo_ button.
- Press Ctrl+Y to redo changes, or click the _Redo_ button.
- Click the _Clear Undo Queue_ button to clear any stored undo entries.

Undo Redo Clear Undo Queue

### Clipboard

Clipboard functionality is enabled by default. It is available interactively with short-cuts via [GraphEditorInputMode](https://docs.yworks.com/yfileshtml/#/api/GraphEditorInputMode) if [allowClipboardOperations](https://docs.yworks.com/yfileshtml/#/api/GraphInputMode#GraphInputMode-property-allowClipboardOperations) is enabled.

This means that the following functionality is available by default:

- Select items in the graph using the mouse or keyboard
- Copy items by pressing Ctrl+C
- Cut items by pressing Ctrl+X
- Paste items by pressing Ctrl+V
- Duplicate items by pressing Ctrl+D

Cut Copy Paste Duplicate

Note

The following code is for illustrative purposes only.

```
graphEditorInputMode.allowClipboardOperations = true // this is the default, already
```

```
// programmatically copy the selected graph items
if (graphComponent.selection.selectedNodes.size > 0) {
  graphEditorInputMode.copy()
}
```

```
// programmatically paste and clear the clipboard content
if (!graphComponent.clipboard.empty) {
  graphEditorInputMode.paste()
  graphComponent.clipboard.clear()
}
```

[08 Grouping](../../tutorial-yfiles-basic-features/08-grouping/)
