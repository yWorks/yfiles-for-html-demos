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
# Selenium WebDriver Testing Demo

This demo shows how to use [Selenium WebDriver](https://www.selenium.dev/documentation/webdriver/) for testing a yFiles for HTML web application.

The application under test is the [Simple Testable App](../application-under-test/index.html).

To run the test:

1.  Start the Demo Server.
2.  Go to the demo's directory `demos-ts/testing/selenium-webdriver`.
3.  Run `npm install`.
4.  Run the test with `npm run test`.

The test is run in Chrome and Firefox in headless mode. Please note that the tests will fail if the corresponding browser binaries cannot be found on your system.

Selenium WebDriver is a general-purpose browser automation framework that does not come with a framework for running integration tests or unit tests. Therefore, this demo uses the [Mocha](https://mochajs.org/) test runner and the [Chai](https://www.chaijs.com/) assertion framework. However, Selenium WebDriver may be used with any other testing framework, too.
