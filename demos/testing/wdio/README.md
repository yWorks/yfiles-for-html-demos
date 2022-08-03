<img src="../../resources/image/wdio.png" alt="demo-thumbnail" height="320"/>

# WebdriverIO Demo

The WebdriverIO demo shows how to use [WebdriverIO](https://webdriver.io/) for integration testing a yFiles for HTML web application.

To run the integration tests:

1.  Go to the demo's directory `demos-js/testing/wdio`.
2.  Run `npm install`.
3.  Run the integration tests with `npm run test`.

The demo starts with an empty graph, but graph items can be created interactively. The integration tests test this functionality by simulating node, edge and port creation gestures and verifying that the graph instance actually contains the newly created graph items.

Tests are run in both Firefox and Chrome in headless mode. If you want to see the gestures that are being tested, you can disable the "headless" options in `wdio.conf.js` and add an `await browser.debug()` [statement](https://webdriver.io/docs/api/browser/debug.html) at the end of a test in the spec file.

In order to obtain access to the yFiles API, in particular for access to the [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) instance through [CanvasComponent#getComponent](https://docs.yworks.com/yfileshtml/#/api/CanvasComponent#getComponent), the server used in this sample injects a variable that causes the application code to expose the yFiles API to the global scope.
