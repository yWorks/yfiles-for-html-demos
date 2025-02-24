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
<img src="../../../doc/demo-thumbnails/web-worker-webpack.webp" alt="demo-thumbnail" height="320"/>

This demo shows how to run a yFiles layout algorithm in a [Web Worker](https://html.spec.whatwg.org/multipage/workers.html) task in order to prevent the layout calculation from blocking the UI.

The graph, layout, and layout data are configured in the main thread and transferred to the web worker using class LayoutExecutorAsync. The actual layout calculation is performed in _WorkerLayout.ts_ with class LayoutExecutorAsyncWorker on the web worker thread.

## Build

Install the required npm packages and run the build script

```
\> npm install
> npm run build

```

## Run

The output files will be placed in the `dist/` directory inside this demo's directory. To run the demo, open `dist/index.html` in a browser with

```
\> npm run serve

```
