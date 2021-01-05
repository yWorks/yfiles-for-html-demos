<img src="../../resources/image/jest.png" alt="demo-thumbnail" height="320"/>

# Jest Demo

The Jest demo shows how to use [Jest](https://jestjs.io/) for unit testing a yFiles for HTML application.

To run the unit tests:

1.  Go to the demo's directory `demos-js/testing/jest`.
2.  Run `npm install`.
3.  Run the unit tests with `npm run test`.

## yFiles and Jest

While modern JavaScript (or TypeScript) applications usually use es-modules, Jest's support for native es-modules is still experimental. For this reason, es-modules code is transpiled. Due to its size, transpiling the yFiles es-modules library is rather slow. As workaround, it is possible to map the es-modules variant of yFiles to its UMD variant, which does not need to be transpiled. This can be achieved with Jest's `moduleNameMapper` configuration option.

Some parts of yFiles require a complete DOM implementation, which Jest's JSDOM environment does not provide. To still be able to test code that uses yFiles API that require a DOM, it is necessary to mock yFiles. See the `src/ItemFactoryWithMock.test.js` file for details.
