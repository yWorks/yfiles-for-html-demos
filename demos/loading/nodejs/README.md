# NodeJS Demo

<img src="../../resources/image/nodejs.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/loading/nodejs/index.html).

This demo shows how to run a yFiles layout algorithm in a _[Node.js®](https://nodejs.org/)_ environment. This makes it possible to run the layout calculation asynchronously, preventing it from blocking the UI.

To transfer the graph structure and layout between the _Node.js_ _[Express](https://expressjs.com/)_ server and the main page, a simple JSON format is used.

Note that GraphML I/O won't work out of the box in a Node.js environment, as GraphML parsing requires the DOM API.

## Things to Try

Modify the graph structure by adding/removing nodes and edges, and re-run the _Node.js_ layout.

## Running the Node.js Layout Server

1.  Navigate to the `server` subdirectory of this demo's directory
2.  Install the required node modules:

    ```
    \> npm install
    ```

3.  Run the layout server:

    ```
    \> npm start
    ```

## Note

In Internet Explorer 9, this demo will not work unless client and server are running on the same domain due to cross domain policies and lacking support for cross-origin resource sharing (CORS).
