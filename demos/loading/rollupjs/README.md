<img src="../../resources/image/scriptloading.png" alt="demo-thumbnail" height="320"/>

# Rollup.js Demo

This demo shows how to bundle the yFiles library in a [rollup](https://rollupjs.org/) project.

The yFiles modules are imported in the demo sources, so rollup will add the yFiles modules to `bundle.js`.

The HTML file just references the single `bundle.js` file containing the demo code as well as all library code.

In addition to resolving the module imports and creating a browser-ready bundle, the Grunt build

- runs the yFiles optimizer before bundling to achieve a smaller, production ready bundle
- runs babel on the sources, so the resulting application can be run in older browsers like IE 11.

## Building the demo

Install the required npm packages and run the build script:

Install the required npm packages and run the build script

```
\> npm install
> npm run build

```

## Running the demo

The grunt build will place the output files in the `dist/` directory inside this demo's directory. To run the demo, open `./index.html` in a browser.
