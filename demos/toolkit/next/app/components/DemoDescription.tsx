/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
import React from 'react'
import './DemoDescription.css'

const reloadIcon = '/assets/reload-16.svg'
const yLogo = '/assets/ylogo-text.svg'

export default function DemoDescription() {
  return (
    <>
      <div className="demo-sidebar-header">
        <a href="https://www.yworks.com/products/yfiles">
          <img src={yLogo} alt="yWorks Logo" className="demo-left-logo" />
        </a>
      </div>
      <div className="demo-sidebar-content">
        <h1>Next.js Demo</h1>
        <p>
          This demo shows how to integrate yFiles in a{' '}
          <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">
            Next.js
          </a>{' '}
          application with{' '}
          <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
            TypeScript
          </a>{' '}
          .
        </p>
        <p>
          This application consists of separate React components for the different parts, i.e. the
          yFiles <code>GraphComponent</code>, the tooltips, the toolbar and the sidebars.
        </p>
        <p>
          The React component for the graph is populated by a given <code>graphData</code> JSON blob
          via its component properties. The JSON data is also displayed in the panel on the right
          hand side.
        </p>
        <p>
          With the help of the yFiles <code>GraphBuilder</code>, the diagram is automatically
          updated when the given <code>graphData</code> changes.
        </p>
        <p>
          The nodes are rendered via the <code>NodeTemplate</code> react component class and the
          edge labels via the <code>LabelTemplate</code> react component class.
        </p>
        <p>
          The node, edge and label tooltips are also dynamically rendered React components. In fact,
          they are reused components that are also rendered in the &apos;Graph Data&apos; sidebar.
        </p>
        <h2>Running the demo</h2>
        <p>The following steps are required to start it:</p>
        <code>
          &gt; npm install <br />
          &gt; npm run dev
        </code>
        <p>This will start the development server of the toolkit.</p>
        <h2>Things to Try</h2>
        <ul>
          <li>
            Clicking the buttons in the toolbar will execute certain actions in the React component
            for the diagram.
          </li>
          <li>
            The bound <code>graphData</code> can be changed with the panel on the right hand side.
            &apos;Add Node&apos; creates a random child node in the diagram and &apos;Remove
            Node&apos; removes a random node of the diagram.
          </li>
          <li>
            The graph is automatically updated when the attached <code>graphData</code> changes.
          </li>
          <li>
            After the graph has been changed, click{' '}
            <img
              style={{
                verticalAlign: 'middle'
              }}
              src={reloadIcon}
              alt="reload-icon"
            />{' '}
            to reload the initial sample graph.
          </li>
          <li>
            Next.js&apos;s development server automatically updates the application upon code
            changes.
          </li>
        </ul>
        <h2>App Generator</h2>
        <p>
          Use the{' '}
          <a
            href="https://www.yworks.com/products/app-generator"
            target="_blank"
            rel="noopener noreferrer"
          >
            App Generator
          </a>{' '}
          to create visualization prototypes – quickly and easily.
        </p>
      </div>
    </>
  )
}
