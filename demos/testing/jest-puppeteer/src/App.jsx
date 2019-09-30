import React, { Component } from 'react'
import './App.css'
import ReactGraphComponent from './components/ReactGraphComponent.jsx'
import DemoDescription from './components/DemoDescription.jsx'
import yLogo from './assets/ylogo.svg'

export default class App extends Component {

  render() {
    return (
      <div className="App">
        <aside className="demo-sidebar left">
          <DemoDescription />
        </aside>

        <div className="demo-content">
          <div className="demo-header">
            <a href="https://www.yworks.com" target="_blank" rel="noopener noreferrer">
              {' '}
              <img src={yLogo} className="demo-y-logo" alt="yWorks Logo" />{' '}
            </a>{' '}
            <a href="../../../README.html" target="_blank">
              yFiles for HTML
            </a>{' '}
            <span className="demo-title">Jest Puppeteer Demo [yFiles for HTML]</span>
          </div>

          <ReactGraphComponent/>
        </div>
      </div>
    )
  }
}
