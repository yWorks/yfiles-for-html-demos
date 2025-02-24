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
# Web Worker Demo

<img src="../../../doc/demo-thumbnails/web-worker.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yworks.com/demos/loading/webworker/).

This demo shows how to run a layout algorithm in a Web Worker thread without blocking the UI or main thread.

Calculating the layout in a Web Worker keeps the UI responsive. Hence, the loading animation is able to continue while the layout algorithm is working.

See the sources for details.
