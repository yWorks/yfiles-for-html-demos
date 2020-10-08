# File Operations Demo

<img src="../../resources/image/fileoperations.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/view/fileoperations/index.html).

This demo shows various ways to open and save a graph as GraphML.

## Things to Try

- Edit the graph and save it in GraphML format in one of the available ways.
- Open a previously saved GraphML.

Buttons of features that are not supported by the current browser are disabled.

## Open

Most open commands show a file chooser dialog. This is implemented using a hidden file input HTML element.

#### File (FileReader)

Open a file using the [HTML5 FileReader API](https://caniuse.com/#search=filereader). This technique provides a natural file open experience on all modern browsers. For IE 9, the [FileSystem Object](<https://docs.microsoft.com/en-us/previous-versions//z9ty6h50(v=vs.85)>) is a good workaround.

#### Server

Open a file via a dedicated server. This submits a form containing the file content to the server which returns an HTML document with the file's content. To keep this demo open in the current window, the response is targeted to an invisible `iframe`. See [Server Operations](#server-operations) for details on enabling server requests.

#### LocalStorage

Open the last graph that was saved using the [HTML5 Storage feature](https://www.html5rocks.com/en/features/storage).

## Save

#### Download

Download the graph using the [HTML5 File API](https://caniuse.com/#search=file) or the IE-specific [msSaveOrOpenBlob](<https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/samples/hh779016(v=vs.85)>) function. This provides a natural file download experience in IE 10+, Firefox 28+, Chrome 38+, Opera 25+, recent versions of the related mobile browsers and Android Browser 4.4.4. It doesn't work in Safari (neither Mac OS X nor iOS).

#### New Tab

Show the GraphML content in a new browser window.

#### Server

Download to a file via a dedicated server. The GraphML content is sub,itted to the server which responds with a download URL for the respective file. The handling of the download then depends on the user's browser settings. See [Server Operations](#server-operations) for details on enabling server requests.

#### Local Storage

Save the graph using the [HTML5 Storage feature](https://www.html5rocks.com/en/features/storage).

## Server Operations

To enable the open/save via server operations, a server that supports the file load/save requests of this demo has to be running. You can run the Node.js Express [Demo Server](../../demo-server/README.html) or the [sample Java web application](server-backend/java/README.html) contained in the `server-backend` directory of this demo to enable the server-based file operations.

### Server API

This demo uses the following server requests:

`http://localhost:4242/file/isAlive`

`GET` request to check whether a file load/save server is running (used to enable the corresponding actions if an "OK" (200) response code is received).

`http://localhost:4242/file/load`

`POST` request to upload a file from the filesystem and send the file contents to the client.

`http://localhost:4242/file/save`

`POST` request to send the current graph to the server and download it as a GraphML file.
