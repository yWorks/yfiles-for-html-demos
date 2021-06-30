/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import WidgetBase from '@dojo/framework/core/WidgetBase'
import { DNode } from '@dojo/framework/core/interfaces'
import { tsx } from '@dojo/framework/core/vdom'
import './styles/DemoSidebar.css'

export default class DemoSidebar extends WidgetBase {
  protected render(): DNode {
    return (
      <div>
        <h1 class="demo-sidebar-header">Description</h1>
        <div class="demo-sidebar-content">
          <p>
            This demo shows how to integrate yFiles in a basic{' '}
            <a href="https://dojo.io/" target="_blank" rel="noreferrer">
              Dojo
            </a>{' '}
            application based on the Dojo <code>cli-create-app</code>.
          </p>
          <p>
            The application is separated into different widgets utilizing both the Virtual DOM
            approach for creating the <a href="https://docs.yworks.com/yfileshtml/#/api/GraphComponent" target="_blank">GraphComponent</a> as well as the JSX support to create
            this description sidebar.
          </p>
          <h2>Building the Demo</h2>
          <p>
            The demo is using <code>Dojo CLI</code>, thus the following steps are required to start
            it:
          </p>
          <code>
            {' '}
            &gt; npm install <br />
            &gt; npm run dev{' '}
          </code>
          <p>This will start the development server of the Dojo application.</p>

          <h2>Things to Try</h2>

          <ul>
            <li>Toggle editing support using the &apos;Toggle Editing&apos; button.</li>
            <li>
              After the graph has been edited, click{' '}
              <img style="vertical-align: middle" src={require('../assets/reload-16.svg')} /> to
              reload the initial sample graph.
            </li>
            <li>
              The integrated development server of the Dojo CLI project will automatically update
              the application upon code changes.
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
