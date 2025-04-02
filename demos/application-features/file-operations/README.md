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
# File Operations Demo

<img src="../../../doc/demo-thumbnails/file-operations.webp" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://www.yfiles.com/demos/application-features/file-operations/).

This demo shows various ways to open and save a graph.

## Things to Try

- Edit the graph and save it in JSON or GraphML format in one of the available ways.
- Open a previously saved graph.

## Open

Open a graph from file with a file chooser dialog. This is based on the [FileReader](https://developer.mozilla.org/docs/Web/API/FileReader) API.

## Save

### Download

Download the graph as file.

### New Tab

Show the file content in a new browser window.

## Local Storage

Open and save the graph using the [Storage](https://developer.mozilla.org/docs/Web/API/Storage) API.

## JSON data model

For JSON data handling, this demo uses types and functions defined in **json-model.d.ts**, **json-support.ts** and **json-writer.ts**.

These type definitions and functions provide simple and, for many use cases, complete functionality for processing graph data for a yFiles application.
