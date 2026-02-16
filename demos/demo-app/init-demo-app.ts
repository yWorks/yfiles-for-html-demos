/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
import { GraphComponent, LayoutExecutor, License } from '@yfiles/yfiles'
import licenseData from '../../lib/license.json'
import { finishLoading } from './demo-ui/finish-loading'
import { initializeBasicDemoStyles } from '@yfiles/demo-utils/sample-graph'
import { DefaultApp } from './app/default-app'
import type { DemoApp } from './app/demo-app'

License.value = licenseData
const graphComponent = new GraphComponent('#graphComponent')
graphComponent.maximumZoom = 5
graphComponent.minimumZoom = 0.2
initializeBasicDemoStyles(graphComponent.graph)

const toolbarFactory = () => document.querySelector<HTMLDivElement>('.demo-page__toolbar')!

const sidebarFactory = () => {
  const sidebarDiv = document.createElement('aside')
  sidebarDiv.className = 'demo-main__sidebar'
  document.querySelector<HTMLDivElement>('.demo-page__main')!.appendChild(sidebarDiv)

  const sidebarContent = document.createElement('div')
  sidebarContent.className = 'demo-sidebar__content'
  sidebarDiv.appendChild(sidebarContent)

  const propertyPanel = document.createElement('div')
  propertyPanel.className = 'yplay__graph-sidebar'
  sidebarContent.append(propertyPanel)

  return propertyPanel
}

const demoApp: DemoApp = new DefaultApp(
  toolbarFactory,
  sidebarFactory,
  document.querySelector<HTMLDivElement>('.yplay__message-host'),
  graphComponent
)

const graph = graphComponent.graph

finishLoading()

LayoutExecutor.ensure()

export { graphComponent, graph, demoApp }
