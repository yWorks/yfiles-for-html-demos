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
import { GraphBuilder, GraphComponent, License } from '@yfiles/yfiles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { configureStyles, getData, initializeTutorialDefaults, runLayout } from '../common'
import { createDynamicNodesSource, resetGraph, updateGraph } from './update-graph'
License.value = await fetchLicense()
const graphComponent = new GraphComponent('#graphComponent')
const graph = graphComponent.graph
initializeTutorialDefaults(graphComponent)
const data = await getData()
const graphBuilder = new GraphBuilder(graph)
const nodesSource = await createDynamicNodesSource(graphBuilder, data)
nodesSource.nodeCreator.createLabelBinding('name')
graphBuilder.createEdgesSource(data.edgesSource, 'sourceId', 'targetId', 'id')
configureStyles([nodesSource])
graphBuilder.buildGraph()
await runLayout(graphComponent)
finishLoading()
document.querySelector('#updateGraphButton')?.addEventListener('click', async () => {
  updateGraph(graphBuilder)
  await runLayout(graphComponent, true)
})
document.querySelector('#resetGraphButton')?.addEventListener('click', async () => {
  resetGraph(graphBuilder)
  await runLayout(graphComponent, true)
})
