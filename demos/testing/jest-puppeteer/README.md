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
<img src="../../../doc/demo-thumbnails/jest-puppeteer.webp" alt="demo-thumbnail" height="320"/>

The Jest Puppeteer demo shows how to use [Jest](https://jestjs.io/en/) for integration testing a [React](https://reactjs.org/) application that uses yFiles for HTML.

To start the demo and run the integration tests:

1.  Go to the demo's directory `demos-js/testing/jest-puppeteer`.
2.  Run `npm install`.
3.  Start the demo: Run `npm run start-test`.
4.  Run the integration tests: `npm run test:integration`.

The demo starts with an empty graph, but graph items can be created interactively. The integration tests check this functionality by simulating node, edge and port creation gestures and verifying that the graph instance actually contains the newly created graph items.

The tests run in a [puppeteer environment](https://github.com/smooth-code/jest-puppeteer) instead of the default [jsdom](https://github.com/jsdom/jsdom) environment, because yFiles for HTML needs a common, standards-compliant browser environment, which jsdom does not provide (in particular, jsdom lacks a complete SVG DOM implementation).

With puppeteer, the tests can run in a full Chrome headless environment instead.

In order to obtain access to the yFiles API, in particular for access to the GraphComponent instance through CanvasComponent.getComponent, this sample introduces an environment variable that causes the application code to expose the yFiles API to the global scope.
