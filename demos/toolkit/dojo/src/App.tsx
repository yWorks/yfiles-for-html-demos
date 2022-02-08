/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { tsx } from '@dojo/framework/core/vdom'
import WidgetBase from '@dojo/framework/core/WidgetBase'
import { DNode } from '@dojo/framework/core/interfaces'
import './App.css'
import DemoSidebar from './widgets/DemoSidebar'
import GraphWidget from './widgets/GraphWidget'

export default class App extends WidgetBase {
  protected render(): DNode {
    return (
      <div id="app">
        <aside class="demo-sidebar left">
          <DemoSidebar />
        </aside>

        <div class="demo-content">
          <div class="demo-header">
            <a href="https://www.yworks.com" target="_blank">
              {' '}
              <img src={require('./assets/ylogo.svg')} class="demo-y-logo" />{' '}
            </a>{' '}
            <a href="https://www.yworks.com" target="_blank">
              {' '}
              yFiles for HTML{' '}
            </a>{' '}
            <a href="../../../README.html" target="_blank" class="demo-title">
              {' '}
              Demos{' '}
            </a>{' '}
            <span class="demo-title">Dojo Demo</span>
          </div>

          <GraphWidget />
        </div>
      </div>
    )
  }
}
