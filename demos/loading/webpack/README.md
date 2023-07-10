<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Webpack ES Modules Demo

This demo shows how to integrate the yFiles library in a [webpack](https://webpack.js.org/) project.

Two fundamental concepts for webpack projects are demonstrated:

- [Code Splitting](https://webpack.js.org/guides/code-splitting/)
- Separate webpack configurations for development and [production](https://webpack.js.org/guides/production-build/)

## Running the demo

First, install the required npm modules in the demo directory:

`> npm install`

### Development

For development, the [webpack dev server](https://github.com/webpack/docs/wiki/webpack-dev-server) offers convenient live reloading support to minimize turnaround times.

The dev server will serve the webpack bundles from memory (no bundles will be created on disc), update the app bundle and refresh the page when changes are made to the source files.

To run the dev server:

`> npm start`

The webpack dev server will create the bundles in memory and launch the [generated index file](http://localhost:9003/) in a browser.

Note that the npm start script will run webpack once before starting the webpack dev server, so the generated index.html file already exists when the browser first tries to access it.

When the server runs, try making changes to `src/webpack-demo.js` and see how the app will be updated in the browser immediately.

Debugging of application files in the browser's developer tools should work fine, as source maps are enabled using webpack's " [SourceMapDevToolPlugin](https://webpack.js.org/plugins/source-map-dev-tool-plugin/) ".

### Production

The following build steps are specific to the production configuration:

- Append a content-based hash to the bundle filename to enable long-term caching.
- [Minify](https://webpack.js.org/guides/production-build/#minification) the bundles using webpack's minification plugin.

To run the production build:

`> npm run production`

Note that the final minification step of the production build may take some time (the first "done" message is misleading).
