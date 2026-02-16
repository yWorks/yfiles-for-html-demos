<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML.
 // Use is subject to license terms.
 //
 // Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Label Handle Provider Demo

<img src="../../../doc/demo-thumbnails/label-handle-provider.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/labelhandleprovider/).

This demo shows how to implement custom [IHandle](https://docs.yworks.com/yfileshtml/api/IHandle) s that allow interactive resizing and rotation of labels.

## Things to Try

- Select a node label or an edge label and change its size by dragging its resize handle.
- The _Free Node Label_ can also be rotated: Select that label and drag its rotate handle (the one above the label).
- Take a look at the source code, especially _LabelHandleProvider_, _LabelResizeHandle_, and _LabelRotateHandle_.

Note that the actual resize behavior depends on the label model parameter, since some parameters constrain the label's center to stay at the same position. For these parameters, the label is resized symmetrically in both directions.
