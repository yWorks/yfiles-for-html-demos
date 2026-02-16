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
# Reshape Handle Provider Demo

<img src="../../../doc/demo-thumbnails/reshape-handle-provider.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/input/reshapehandleprovider/).

This demo shows how to implement a custom [IReshapeHandleProvider](https://docs.yworks.com/yfileshtml/api/IReshapeHandleProvider).

This _IReshapeHandleProvider_ is provided for ports to reshape their port visualization.

## Things to Try

- Select a _green_ or _blue_ port and see its reshape handles at its corners. Also note that there is a different handle at the center that was provided by the _IHandleProvider_ to change the port location.
- Drag one of the reshape handles to change the size of the port visualization. Note that the size can't be decreased below a specific minimum size.
- Press and hold the Shift key and see that further reshape handles appear on the left, right, top and bottom side of selected ports. These handles reshape the port either horizontally or vertically.
