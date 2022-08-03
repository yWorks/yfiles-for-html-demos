<img src="../../resources/image/react.png" alt="demo-thumbnail" height="320"/>

# React Demo

The React demo shows how to integrate yFiles in a basic [React](https://reactjs.org/) application based on [Create React App](https://facebook.github.io/create-react-app/).

To start the demo

1.  Go to the demo's directory `demos-js/toolkit/react`.
2.  Run `npm install`.
3.  Run `npm run start`.

This will start the development server of the toolkit.

The integrated development server of the project will automatically update the application upon code changes.

Note: The `/.env/` file with `SKIP_PREFLIGHT_CHECK=true` is only necessary due to the version mismatch of eslint for the react-scripts and the yFiles demo package. If you use the source code of this application outside of the yFiles demo package tree, this file won't be necessary.

# Deploying React with yFiles

There are no special caveats that you need to look out for when you load yFiles as NPM dependency as in this demo application. However, we recommend to include the [@yworks/optimizer](https://www.npmjs.com/package/@yworks/optimizer) when you deploy your app for production.

The optimizer will obfuscate the public API of the yFiles module files, as well as yFiles API usages in application sources.

We highly recommend obfuscating the yFiles for HTML library prior to deploying your application to a public web server to reduce the download size of the library for the end user. Note that, at the time of writing, you are not required to use obfuscation.

Here is how you can include the `@yworks/optimizer` in this application that was built with the [Create React App](https://facebook.github.io/create-react-app/) toolkit.

1.  Run `npm run eject` to gain the full control over the deployment of this application. See also [npm run eject](https://facebook.github.io/create-react-app/docs/available-scripts#npm-run-eject).
2.  Then install the dependencies that are necessary to build JSX files, i.e.  
    `npm install --save @babel/plugin-transform-react-jsx @babel/plugin-transform-react-jsx-source`  
    Now, the application can be started and built with either `npm run start` or `npm run build`.
3.  Then we need the `@yworks/optimizer` dependency, which you can install with:  
    `npm install --save-dev @yworks/optimizer`
4.  To include the `@yworks/optimizer` in the build process for production builds, prepend the following plugin in `/config/webpack.config.js`:

    ```
    plugins: [
      isEnvProduction && new yWorksOptimizer({
        blacklist: ['render', 'Component', 'nodesSource', 'edgesSource']
      }),
      ...
    ]

    ```

    Don't forget to require it first:  
    `const yWorksOptimizer = require('@yworks/optimizer/webpack-plugin')`

5.  That's it. When you now build for production with `npm run build`, the optimizer will do its job and the bundle will be obfuscated.
