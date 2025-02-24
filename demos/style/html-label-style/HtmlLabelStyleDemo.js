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
import {
  Font,
  SmartEdgeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  LayoutExecutor,
  License,
  ShapeNodeStyle,
  Size,
  StretchNodeLabelModel
} from '@yfiles/yfiles'
import { HtmlLabelStyle } from './HtmlLabelStyle'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
/**
 * Simple demo that shows how to create a custom style that uses HTML for rendering the labels.
 */
async function run() {
  License.value = await fetchLicense()
  const graphComponent = new GraphComponent('graphComponent')
  // Disable node creation since they wouldn't have an HTML label anyway
  graphComponent.inputMode = new GraphEditorInputMode({
    allowCreateNode: false
  })
  // Apply default styling
  const graph = graphComponent.graph
  initDemoStyles(graph)
  graph.nodeDefaults.size = new Size(300, 230)
  graph.nodeDefaults.style = new ShapeNodeStyle({ stroke: null, fill: null })
  graph.nodeDefaults.labels.layoutParameter = StretchNodeLabelModel.CENTER
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(0)
  graphComponent.focusIndicatorManager.enabled = false
  // Labels get the HTML label style
  const font = new Font('Montserrat,sans-serif', 14)
  graph.nodeDefaults.labels.style = new HtmlLabelStyle(font)
  graph.edgeDefaults.labels.style = new HtmlLabelStyle(font)
  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)
  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new HierarchicalLayout({
      defaultEdgeDescriptor: {
        minimumFirstSegmentLength: 30,
        minimumLastSegmentLength: 30
      }
    })
  )
  await graphComponent.fitGraphBounds()
  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}
/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder
    .createNodesSource({
      data: graphData.nodeList,
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)
  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })
  graphBuilder.buildGraph()
}
void run().then(finishLoading)
