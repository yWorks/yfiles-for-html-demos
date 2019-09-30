import React, { Component } from 'react'
import reloadIcon from '../assets/reload-16.svg'
import './DemoDescription.css'

export default class DemoDescription extends Component {
  render() {
    const iconStyle = {
      verticalAlign: 'middle'
    }
    return (
      <div>
        <h1 className="demo-sidebar-header">Description</h1>
        <div className="demo-sidebar-content">
          <p>
            This demo shows how to integrate yFiles in a{' '}
            <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">
              React
            </a>{' '}
            application based on the{' '}
            <a
              href="https://facebook.github.io/create-react-app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create React App
            </a>{' '}
            toolkit.
          </p>
          <p>
            This application consists of separate React components for the different parts, i.e. the
            yFiles <code>GraphComponent</code>, the tooltips, the toolbar and the sidebars.
          </p>
          <p>
            The React component for the graph is populated by a given <code>graphData</code> JSON
            blob via its component properties. The JSON data is also displayed in the panel on the
            right hand side.
          </p>
          <p>
            With the help of the yFiles <code>GraphBuilder</code>, the diagram is automatically
            updated when the given <code>graphData</code> changes.
          </p>
          <p>
            The node and edge tooltips are also dynamically rendered React components. In fact, they
            are reused components that are also rendered in the 'Graph Data' sidebar.
          </p>
          <h2>Running the demo</h2>
          <p>
            The demo is using the <code>Create React App</code> toolkit, thus the following steps
            are required to start it:
          </p>
          <code>
            {' '}
            > npm install <br />> npm run start{' '}
          </code>
          <p>This will start the development server of the toolkit.</p>

          <h2>Things to Try</h2>

          <ul>
            <li>
              Clicking the buttons in the toolbar will execute certain actions in the React
              component for the diagram.
            </li>
            <li>
              The bound <code>graphData</code> can be changed with the panel on the right hand side.
              'Add Node' creates a random child node in the diagram and 'Remove Node' removes a
              random node of the diagram.
            </li>
            <li>
              The graph is automatically updated when the attached <code>graphData</code> changes.
            </li>
            <li>
              After the graph has been changed, click{' '}
              <img style={iconStyle} src={reloadIcon} alt="reload-icon" /> to reload the initial
              sample graph.
            </li>
            <li>
              The integrated development server of the <code>Create React App</code> project will
              automatically update the application upon code changes.
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
