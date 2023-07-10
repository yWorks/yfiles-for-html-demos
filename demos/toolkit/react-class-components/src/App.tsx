/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { Component } from 'react'
import './App.css'
import ReactGraphComponent from './components/ReactGraphComponent'
import DemoDescription from './components/DemoDescription'
import yLogo from './assets/ylogo.svg'

export default class App extends Component {
  render() {
    return (
      <div className="app">
        <aside className="demo-sidebar left demo-page__description">
          <DemoDescription />
        </aside>

        <div className="demo-header">
          <a
            href="https://www.yworks.com/products/yfiles"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={yLogo} className="demo-y-logo" alt="yWorks Logo" />
          </a>
          <a
            href="https://www.yworks.com/products/yfiles"
            target="_blank"
            rel="noopener noreferrer"
          >
            yFiles for HTML
          </a>
          <a
            href="../../../README.html"
            target="_blank"
            className={'demo-title'}
            rel="noopener noreferrer"
          >
            Demos
          </a>
          <span className="demo-title">React Class Components</span>
        </div>

        <ReactGraphComponent />
      </div>
    )
  }
}
