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
<img src="../../../doc/demo-thumbnails/webdriverio.webp" alt="demo-thumbnail" height="320"/>

The WebdriverIO demo shows how to use [WebdriverIO](https://webdriver.io/) for integration testing a yFiles for HTML web application.

To run the integration tests:

1.  Ensure that the demo server is running, see The Demo Server.
2.  Go to the demo's directory `demos-ts/testing/wdio`.
3.  Run `npm install`.
4.  Run the integration tests with `npm run test`.

The application under test is the [Simple Testable App](../application-under-test/index.html). To access yFiles via WebdriverIO, the GraphComponent is set as a global variable in that application.

The application starts with a graph with two nodes, but graph items can be created interactively. The integration tests check this functionality by simulating node, edge and port creation gestures and verifying that the graph instance actually contains the newly created graph items.

Tests are run in both Firefox and Chrome in headless mode. Please note that the tests will fail if the corresponding browser binaries cannot be found on your system. If you want to see the gestures that are being tested, you can disable the "headless" options in `wdio.conf.js` and add an `await browser.debug()` [statement](https://webdriver.io/docs/api/browser/debug.html) at the end of a test in the spec file.
