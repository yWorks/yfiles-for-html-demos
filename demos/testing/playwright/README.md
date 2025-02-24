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
<img src="../../../doc/demo-thumbnails/playwright.webp" alt="demo-thumbnail" height="320"/>

This demo shows how to use [Playwright](https://playwright.dev/) for testing a yFiles for HTML web application.

The application under test is the [Simple Testable App](../application-under-test/index.html).

To run the test:

1.  Start the Demo Server.
2.  Go to the demo's directory `demos-ts/testing/playwright`.
3.  Run `npm install`.
4.  Run the test with `npm run test` or Playwright's test UI with `npm run test-ui`.

The test is run in Chrome, Firefox, and Webkit in headless mode.

After running the test, Playwright automatically creates a directory `test-results` and stores its result there. Run `npm run show-report` to view a summary of the results.
