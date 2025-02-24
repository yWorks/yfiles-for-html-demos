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
<img src="../../../doc/demo-thumbnails/jest.webp" alt="demo-thumbnail" height="320"/>

The Jest demo shows how to use [Jest](https://jestjs.io/) for unit testing a yFiles for HTML application.

To run the unit tests:

1.  Go to the demo's directory `demos-js/testing/jest`.
2.  Run `npm install`.
3.  Run the unit tests with `npm run test`.

## yFiles and Jest

While modern JavaScript (or TypeScript) applications usually use JavaScript modules, Jest's support for native JavaScript modules is still experimental. For this reason, JavaScript modules code is transpiled. Due to its size, transpiling the yFiles JavaScript modules library is rather slow.

Some parts of yFiles require a complete DOM implementation, which Jest's JSDOM environment does not provide. To still be able to test code that uses yFiles API that require a DOM, it is necessary to mock yFiles. See the `tests/ItemFactoryWithMock.test.js` file for details.
