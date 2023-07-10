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
# File Operations Demo

# File Operations Demo

This demo shows various ways to open and save a graph as GraphML.

## Things to Try

- Edit the graph and save it in GraphML format in one of the available ways.
- Open a previously saved GraphML.

## Open

Most open commands show a file chooser dialog. This is implemented using a hidden file input HTML element.

#### File (FileReader)

Open a file using the [FileReader API](https://caniuse.com/#search=filereader).

#### LocalStorage

Open the last graph that was saved using the [Storage feature](https://www.html5rocks.com/en/features/storage).

## Save

#### Download

Download the graph using the [File API](https://caniuse.com/#search=file).

#### New Tab

Show the GraphML content in a new browser window.

#### Local Storage

Save the graph using the [Storage feature](https://www.html5rocks.com/en/features/storage).
