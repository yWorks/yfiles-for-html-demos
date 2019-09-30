import React, { Component } from 'react'
import './DemoDescription.css'

export default class DemoDescription extends Component {
  render() {
    return (
      <div>
        <h1 className="demo-sidebar-header">Description</h1>
        <div className="demo-sidebar-content">
          <p>
            This demo shows how to use <a href="https://jestjs.io/en/" rel="noopener noreferrer" target="_blank">Jest</a> for integration testing
            a <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a> application that uses yFiles for HTML.
          </p>

          <p>
            To start the demo and run the integration tests:
          </p>
          <ol>
            <li>
              Go to the demo's directory <code>demos/testing/jest-puppeteer</code>.
            </li>
            <li>
              <code>npm install</code>.
            </li>
            <li>
              Start the demo:<br/>
              <code>npm run start-test</code>.
            </li>
            <li>
              Run the integration tests:<br/>
              <code>npm run test:integration</code>.
            </li>
          </ol>

          <p>
            The demo starts with an empty graph, but graph items can be created interactively. The integration tests
            test this functionality by simulating node, edge and port creation gestures and verifying that the
            graph instance actually contains the newly created graph items.
          </p>

          <p>
            The tests run in a <a target="_blank" rel="noopener noreferrer" href="https://github.com/smooth-code/jest-puppeteer">puppeteer environment</a> instead
            of the default <a target="_blank" rel="noopener noreferrer" href="https://github.com/jsdom/jsdom">jsdom</a> environment, because yFiles for HTML needs a fully HTML5 compliant
            browser environment, which jsdom does not provide (in particular, jsdom lacks a complete SVG DOM implementation).
          </p><p>With puppeteer,
            the tests can run in a full Chrome headless environment instead.
          </p>

          <p>In order to obtain access to the yFiles API, in particular for access to the <code>GraphComponent</code> instance
            through <code>CanvasComponent#getComponent()</code>, this sample introduces an environment variable that causes
            the application code to expose the yFiles API to the global scope.</p>

        </div>
      </div>
    )
  }
}
