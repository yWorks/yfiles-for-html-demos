# PDF Export Demo

<img src="../../resources/image/pdfexport.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/view/pdfexport/index.html).

This demo shows how to export the whole diagram or a part of it to a PDF.

## Things to Try

- Resize and move the hatched rectangle to control the region which will be exported.
- _Export_ shows the exported drawing in an popup containing the PDF.
- Disable _Export Rectangle Contents_ to export the complete graph instead of the rectangle's region.
- Explore the settings for scale and margin.
- The client-side PDF export also supports custom fonts which is illustrated by the 'Custom Fonts' sample graph. To make use of custom fonts, they need to be preprocessed and registered at the [jsPDF](https://github.com/yWorks/jsPDF) instance. Please see the [readme](https://github.com/yWorks/jsPDF) for more details.

## Details

The demo shows an approach that completely runs in the client's browser, as well as an approach for a server-side export. The client-side export uses [svg2pdf](https://github.com/yWorks/svg2pdf.js) and a fork of [jsPDF](https://github.com/yWorks/jsPDF) where we contributed major changes and extensions. Please see its readme on [github.com](https://github.com/yWorks/jsPDF). Although our fork of [jsPDF](https://github.com/yWorks/jsPDF) adds many features like gradients and line style support, the actual export result may differ from the graph in the graph component.

### Server-side export

The server-side export is a minimal example of how to export the graph using an external service hosted on a server. It shows the export by a Java Servlet that uses the [Apache Batik SVG Toolkit](https://xmlgraphics.apache.org/batik/) well as the export via a Node.js express server using [headless Chrome/Puppeteer](https://developers.google.com/web/tools/puppeteer/).

Please be aware that the Java servlet does not support gradients, and prints only blank instead.

The server-side export button will be enabled, when either of the Node.js or Batik Servlet servers are alive on loading time of the demo. To run the servers, see their respective readme in [`./java-servlet/`](java-servlet/README.html) and [`./node-server/`](node-server/README.html).

Please be aware that PDF export via the java-servlet and batik does not support gradients. Therefore the exported icons won't display areas where a gradient was in place.

The Node.js/Puppeteer solution supports gradients.
