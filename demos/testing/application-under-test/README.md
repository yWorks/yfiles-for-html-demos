<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Simple Testable App

# Simple Testable App

This demo is a simple app that is used as the test candidate in the following testing demos:

- [Cypress Demo](../../../demos-ts/testing/cypress/README.html)
- [Playwright Demo](../../../demos-ts/testing/playwright/README.html)
- [Selenium WebDriver Demo](../../../demos-ts/testing/selenium-webdriver/README.html)

Please refer to the README files in the aforementioned demos for further guidance.

A simple way to make a yFiles App testable is making the [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) available to the testing framework. In this app, this is achieved by setting the instantiated [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) as a property of the `Window` object.
