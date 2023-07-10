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
# NodeJS Demo

This demo shows how to run a yFiles layout algorithm in a _[Node.js®](https://nodejs.org/)_ environment. This makes it possible to run the layout calculation asynchronously, preventing it from blocking the UI.

To transfer the graph structure and layout between the _Node.js_ _[Express](https://expressjs.com/)_ server and the main page, the LayoutExecutorAsync creates a serializable data object on the client-side and sends it to the _Node.js_ server.

On the server-side, the LayoutExecutorAsyncWorker parses this data object and provides a callback which allows to apply a layout on the parsed graph. This callback is executed by calling `process(data)` on the worker which resolves with a serializable result data object that is supposed to be sent back to the LayoutExecutorAsync.

On the client-side, the LayoutExecutorAsync waits for the response of the LayoutExecutorAsyncWorker and eventually applies the result to the graph.

## Running the demo

First, install the required npm modules in the demo's `server` directory:

`> npm install`

Then start the _layout_ server with:

`> npm start`

Afterwards, open the `index.html` file via the standard demo server in a browser to start the demo.
