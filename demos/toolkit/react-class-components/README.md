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
<img src="../../../doc/demo-thumbnails/react-class-components.webp" alt="demo-thumbnail" height="320"/>

The React Class Components demo shows how to integrate yFiles in a [React](https://reactjs.org/) application with [TypeScript](https://www.typescriptlang.org/) in project bootstrapped with [Vite](https://vitejs.dev/).

This application integrates a yFiles `GraphComponent` as a class-based React component.

To start the demo

1.  Go to the demo's directory `demos-ts/toolkit/react`
2.  Run `npm install`
3.  Run `npm run dev`

This will start the development server of the toolkit.

The integrated development server of the project will automatically update the application upon code changes.

There are no special issues that you need to look out for when you load yFiles as NPM dependency as in this demo application. However, we recommend including the [@yworks/optimizer](https://www.npmjs.com/package/@yworks/optimizer) when you deploy your app for production.

The optimizer will obfuscate the public API of the yFiles library files, as well as yFiles API usages in application sources.

We highly recommend obfuscating the yFiles for HTML library prior to deploying your application to a public web server to reduce the download size of the library for the end user. Note that, at the time of writing, you are not required to use obfuscation.
