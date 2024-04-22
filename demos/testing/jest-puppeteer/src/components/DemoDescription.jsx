/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import React, { Component } from 'react'
import './DemoDescription.css'

export default class DemoDescription extends Component {
  render() {
    return (
      <div>
        <div className="demo-description__header">
          {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
          <a href="https://www.yworks.com/products/yfiles" className="demo-description__logo" />
        </div>
        <div className="demo-description__content">
          <h1>Jest Puppeteer Demo</h1>
          <p>
            This demo shows how to use{' '}
            <a href="https://jestjs.io/en/" rel="noopener noreferrer" target="_blank">
              Jest
            </a>{' '}
            for integration testing a{' '}
            <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">
              React
            </a>{' '}
            application that uses yFiles for HTML.
          </p>
          <p>To start the demo and run the integration tests:</p>
          <ol>
            <li>
              Go to the demo&apos;s directory <code>demos-js/testing/jest-puppeteer</code>.
            </li>
            <li>
              Run: <code>npm install</code>
            </li>
            <li>
              Start the demo:
              <br />
              <code>npm run start-test</code>
            </li>
            <li>
              Run the integration tests:
              <br />
              <code>npm run test:integration</code>
            </li>
          </ol>

          <p>
            The demo starts with an empty graph, but graph items can be created interactively. The
            integration tests check this functionality by simulating node, edge and port creation
            gestures and verifying that the graph instance actually contains the newly created graph
            items.
          </p>

          <p>
            The tests run in a{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/smooth-code/jest-puppeteer"
            >
              puppeteer environment
            </a>{' '}
            instead of the default{' '}
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/jsdom/jsdom">
              jsdom
            </a>{' '}
            environment, because yFiles for HTML needs a fully HTML5 compliant browser environment,
            which jsdom does not provide (in particular, jsdom lacks a complete SVG DOM
            implementation).
          </p>
          <p>With puppeteer, the tests can run in a full Chrome headless environment instead.</p>

          <p>
            In order to obtain access to the yFiles API, in particular for access to the{' '}
            <code>GraphComponent</code> instance through <code>CanvasComponent#getComponent()</code>
            , this sample introduces an environment variable that causes the application code to
            expose the yFiles API to the global scope.
          </p>
        </div>
      </div>
    )
  }
}
