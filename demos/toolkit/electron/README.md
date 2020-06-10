<img src="../../resources/image/electron.png" alt="demo-thumbnail" height="320"/>

# Electron Demo

This demo shows how to integrate yFiles for HTML in a basic [Electron](https://electronjs.org/) desktop application. It uses [electron-webpack](https://github.com/electron-userland/electron-webpack) for support for ES module imports.

## Building the Demo

1.  Go to the demo's directory `demos-js/toolkit/electron`.
2.  Run `yarn install`.
3.  Run `yarn dev`.

This will start the development server of the Electron application which creates a desktop application with integrated hot reloading.

## Deployment

A binary of the application can be built with `yarn dist`. This will run the [electron-builder](https://github.com/electron-userland/electron-builder) that creates an executable in the `dist` directory.

yFiles modules and usages are obfuscated in the production build with the [yFiles for HTML Optimizer](https://www.npmjs.com/package/@yworks/optimizer).

## Things to Note

In order to load ES modules from external libraries such as yFiles, they must be whitelisted in the `electronWebpack` configuration, see also [White-listing Externals](https://webpack.electron.build/configuration.html#white-listing-externals):

```
"electronWebpack": {
  "whiteListedModules": [
    "yfiles"
  ],
  ...
}

```

Also, in order to use `*.ejs` templates, the [EJS](https://webpack.electron.build/add-ons#ejs) loader needs to be registered explicitly in an additional webpack configuration:

```
"electronWebpack": {
  ...
  "renderer": {
    "webpackConfig": "webpack.renderer.additions.js"
  }
}

```
