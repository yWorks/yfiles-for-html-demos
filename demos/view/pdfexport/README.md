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
# PDF Export Demo

# PDF Export Demo

This demo shows how to export the whole diagram or a part of it to a PDF.

## Things to Try

- Press _Export_ and export the graph as PDF image.
- Enable _Export Rectangle Contents_ to export only the rectangle's region instead of whole graph. Resize and move rectangle to control the region which will be exported.
- Explore the settings for page size, scale, and margin. Note that the scale option only has an effect if page size is set to `Automatic`.
- Try to export the image using a Node.js server.

## Details

The demo shows two approaches, one that completely runs in the client's browser and a server-side export. The client-side export uses the open source [svg2pdf](https://github.com/yWorks/svg2pdf.js) and [jsPDF](https://github.com/MrRio/jsPDF) libraries, to which we contributed major improvements and bug fixes.

The client-side PDF export also supports custom fonts which is illustrated by the node labels with custom fonts. To make use of custom fonts, they need to be preprocessed and registered at the [jsPDF](https://github.com/MrRio/jsPDF) instance.

### Server-side export

The server-side export is a minimal example of how to export the graph using an external service hosted on a server. It shows the export via a Node.js express server using [headless Chrome/Puppeteer](https://developers.google.com/web/tools/puppeteer/) .

The server-side export button will be enabled when the Node.js is alive on loading time of the demo. To run the server, see the respective readme in [`./node-server/`](node-server/README.html).
