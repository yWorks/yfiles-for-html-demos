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
# SolidJS Demo

The SolidJS demo shows how to integrate yFiles in a [SolidJS](https://www.solidjs.com/) application with [TypeScript](https://www.typescriptlang.org/) in project bootstrapped with [Vite](https://vitejs.dev/).

To start the demo

1.  Go to the demo's directory `demos-ts/toolkit/solid/`
2.  Run `npm install`
3.  Run `npm run dev`

This will start the development server of the toolkit.

The integrated development server of the project will automatically update the application upon code changes.

# Deploying SolidJS with yFiles

There are no special caveats that you need to look out for when you load yFiles as NPM dependency as in this demo application. However, we recommend to include the [@yworks/optimizer](https://www.npmjs.com/package/@yworks/optimizer) when you deploy your app for production.

The optimizer will obfuscate the public API of the yFiles module files, as well as yFiles API usages in application sources.

We highly recommend obfuscating the yFiles for HTML library prior to deploying your application to a public web server to reduce the download size of the library for the end user. Note that, at the time of writing, you are not required to use obfuscation.
