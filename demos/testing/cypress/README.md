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
<img src="../../../doc/demo-thumbnails/cypress.webp" alt="demo-thumbnail" height="320"/>

This demo shows how to use [Cypress](https://www.cypress.io) for testing a yFiles for HTML web application.

The application under test is the [Simple Testable App](../application-under-test/index.html).

To run the test:

1.  Start the Demo Server.
2.  Go to the demo's directory `demos-ts/testing/cypress`.
3.  Run `npm install`.
4.  Run the test with `npm run test` or Cypress' test UI with `npm run test-ui`.

After the test has completed, you can find a video in `cypress/videos`

Please note, that this demo assumes that the yFiles demo server is running. You can also change the url in `cypress/e2e/yfiles.cy.ts` to a running application.
