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
<img src="../../../doc/demo-thumbnails/webdriverio.webp" alt="demo-thumbnail" height="320"/>

The WebdriverIO demo shows how to use [WebdriverIO](https://webdriver.io/) for integration testing a yFiles for HTML web application.

To run the integration tests:

1.  Ensure that the demo server is running, see The Demo Server.
2.  Go to the demo's directory `demos-ts/testing/wdio`.
3.  Run `npm install`.
4.  Run the integration tests with `npm run test`.

The demo starts with an empty graph, but graph items can be created interactively. The integration tests test this functionality by simulating node, edge and port creation gestures and verifying that the graph instance actually contains the newly created graph items.

Tests are run in both Firefox and Chrome in headless mode. Please note that the tests will fail if the corresponding browser binaries cannot be found on your system. If you want to see the gestures that are being tested, you can disable the "headless" options in `wdio.conf.js` and add an `await browser.debug()` [statement](https://webdriver.io/docs/api/browser/debug.html) at the end of a test in the spec file.

In order to obtain access to the yFiles API, in particular for access to the GraphComponent instance through CanvasComponent.getComponent, the yFiles API is exposed globally when the application runs in the test environment.
