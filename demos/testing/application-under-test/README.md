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
# Simple Testable App Demo – yFiles for HTML

<img src="../../../doc/demo-thumbnails/application-under-test.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/testing/application-under-test/).

This demo is a simple app used as the test candidate in the following testing demos:

- [Cypress Demo](../../../demos-ts/testing/cypress/README.html)
- [Vitest Demo](../../../demos-ts/testing/vitest/README.html)
- [Playwright Demo](../../../demos-ts/testing/playwright/README.html)
- [WebdriverIO Demo](../../../demos-ts/testing/wdio/README.html)
- [Selenium WebDriver Demo](../../../demos-ts/testing/selenium-webdriver/README.html)
- [Jest Puppeteer Demo](../../../demos-ts/testing/jest-puppeteer/README.html)

Please refer to the README files in these demos for further guidance.

A simple way to make a yFiles App testable is making the [GraphComponent](https://docs.yworks.com/yfileshtml/api/GraphComponent) available to the testing framework. The [GraphComponent](https://docs.yworks.com/yfileshtml/api/GraphComponent) instance is accessed from its parent element through the `[data-this]` attribute.
