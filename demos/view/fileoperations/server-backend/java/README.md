Note that the server load/save operations are also supported by the [Node.js Demo Server](../../../../demo-server/README.html).

## Deployment

Create a web application that contains the compiled `com.yworks.demo.SimpleLoadSaveServlet` in the `WEB-INF/classes` directory, and that uses the `web/WEB-INF/web.xml` file as deployment descriptor.

The deployment descriptor (web.xml) maps the `com.yworks.demo.SimpleLoadSaveServlet` to the `/isAlive, /load,` and `/save` url patterns. Therefore, to properly handle the demo requests (e.g. `http://localhost:4242/file/isAlive`), the web application should be deployed with **`/file` as the application context**, and the servlet container should **listen on `localhost:4242`**.

## Demo Requests

The File Operations Demo uses the following requests:

`http://localhost:4242/file/isAlive`

`GET` request to check whether a file load/save server is running (used to enable the corresponding actions if an "OK" (200) response code is received).

`http://localhost:4242/file/load`

`POST` request to upload a file from the filesystem and send the file contents to the client.

`http://localhost:4242/file/save`

`POST` request to send the current graph to the server and download it as a GraphML file.
