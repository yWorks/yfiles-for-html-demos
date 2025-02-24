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
import { GraphComponent, License } from '@yfiles/yfiles'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import { initializeSnapping } from './layout/initializeSnapping'
import { initializeGrid } from './layout/initializeGrid'
import { initializeToolbar } from './UI/initializeToolbar'
import { initializeDragAndDropPanel } from './UI/initializeDragAndDropPanel'
import { configureDragAndDrop } from './utils/configureDragAndDrop'
import { configureInputMode } from './inputMode/configureInputMode'
import { initializeTagExplorer } from './UI/initializeTagExplorer'
import { configureGraphEvents } from './utils/configureGraphEvents'
import { initializeTooltips } from './UI/initializeTooltips'
import { initializeContextMenu } from './UI/initializeContextMenu'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { configureFlowNodes } from './FlowNode/FlowNode'
import { configureFlowNodePorts } from './FlowNode/FlowNodePort'
import { configureFlowEdges } from './FlowEdge/FlowEdge'
import { importGraphData, initializeJsonIo } from './ImportExportManager/ImportExportManager'
import { SampleData } from './resources/weather-data'
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')
  configureInputMode(graphComponent)
  configureFlowNodePorts(graphComponent)
  initializeSnapping(graphComponent)
  configureDragAndDrop(graphComponent)
  initializeDragAndDropPanel()
  configureGraphEvents(graphComponent)
  initializeTagExplorer(graphComponent)
  initializeJsonIo(graphComponent)
  graphComponent.graph.undoEngineEnabled = true
  initializeToolbar(graphComponent, initializeGrid(graphComponent))
  initializeTooltips(graphComponent)
  initializeContextMenu(graphComponent)
  configureFlowNodes(graphComponent)
  configureFlowEdges(graphComponent)
  await importGraphData(graphComponent, SampleData)
  void graphComponent.fitGraphBounds()
  graphComponent.graph.undoEngine.clear()
}
void run().then(finishLoading)
