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
<img src="../../../doc/demo-thumbnails/vitest.webp" alt="demo-thumbnail" height="320"/>

This demo shows how to use [Vitest](https://vitest.dev) for testing a yFiles for HTML web application. For interaction with the web browser it uses [Playwright](https://playwright.dev/).

To run the test:

1.  Go to the demo's directory `demos-ts/testing/vitest`.
2.  Run `npm install`.
3.  Run the test with `npm run test`.
4.  Run the test UI with `npm run test-ui`.

The test is run in Chromium in headless mode.

The application under test is the [Simple Testable App](../application-under-test/index.html). To access yFiles in Vitest, the GraphComponent is set as a global variable in that application.
