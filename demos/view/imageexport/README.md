<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This file is part of yFiles for HTML 2.6.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Image Export Demo

# Image Export Demo

This demo shows how to export the whole diagram or a part of it to a PNG image.

## Things to Try

- Press _Export_ and export the graph as PNG image.
- Enable _Export Rectangle Contents_ to export only the rectangle's region instead of whole graph. Resize and move rectangle to control the region which will be exported.
- Explore the settings for scale and margin.
- Try to export the image using a Node.js server.

## Details

The demo shows an approach that completely runs in the client's browser, as well as an approach for a server-side export. The client-side export is supported by the latest versions of all major browsers.

### Server-side export

The server-side export is a minimal example of how to export the graph using an external service hosted on a server. It shows the export via a Node.js express server using [headless Chrome/Puppeteer](https://developers.google.com/web/tools/puppeteer/).

The server-side export button will be enabled, when the Node.js server is alive on loading time of the demo. To run the server, see the respective readme in [`./node-server/`](node-server/README.html).
