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
<img src="../../../doc/demo-thumbnails/vite-lazy-yfiles.webp" alt="demo-thumbnail" height="320"/>

This demo shows how to lazy load yFiles with [Vite](https://vitejs.dev/)'s [dynamic import](https://vite.dev/guide/features#dynamic-import/) feature.

By default, vite automatically performs tree-shaking and only includes the necessary modules for production builds.

Often, the diagram component is not needed for the initial startup of the application or can be loaded lazily in general to provide a better user experience. Thus, in this case, yFiles is only loaded when the diagram component of this application is requested.

The demo loads yFiles only if users click the 'Lazy Load yFiles' button.

## Dynamic Imports with yFiles

There are two possible approaches:

- Create a separate diagram component that imports from the `yfiles` meta module.  
  This separate diagram component with yFiles can then be loaded dynamically on demand which is demonstrated in this application.
- yFiles can also be split up further, such that only specific [yFiles ES modules](https://docs.yworks.com/yfileshtml/#/dguide/yfiles-modules#es-modules) are loaded when needed, e.g., initially only load the yFiles view, but lazy load the yFiles layout if needed.

## Running the demo

1.  Go to the demo's directory `demos-ts/loading/vite-lazy-yfiles`.
2.  Run `npm install`.
3.  Run `npm run dev`.
