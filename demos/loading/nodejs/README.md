# NodeJS Demo

This demo shows how to run a yFiles layout algorithm in a _[Node.js®](https://nodejs.org/)_ environment. This makes it possible to run the layout calculation asynchronously, preventing it from blocking the UI.

To transfer the graph structure and layout between the _Node.js_ _[Express](https://expressjs.com/)_ server and the main page, a simple JSON format is used.

## Running the demo

First, install the required npm modules in the demo's `server` directory:

`> npm install`

Then start the _layout_ server with:

`> npm start`

Afterwards, open the `index.html` file via the standard demo server in a browser to start the demo.
