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
# Web Worker UMD Demo

# Web Worker Demo (UMD)

This demo shows how to run a yFiles layout algorithm in a [Web Worker](https://html.spec.whatwg.org/multipage/workers.html) task in order to prevent the layout calculation from blocking the UI.

This demo loads yFiles using the AMD loader require.js

The graph, layout, and layout data are configured in the main thread and transferred to the web worker using class [LayoutExecutorAsync](https://docs.yworks.com/yfileshtml/#/api/LayoutExecutorAsync). The actual layout calculation is performed in _WorkerLayout.js_ with class [LayoutExecutorAsyncWorker](https://docs.yworks.com/yfileshtml/#/api/LayoutExecutorAsyncWorker) on the web worker thread.

## Things to Try

- Modify the graph structure by adding/removing nodes and edges, and re-run the web worker layout.
- Observe the loading animation which continues while the layout algorithm is working. Calculating the layout in a Web Worker keeps the UI responsive.
