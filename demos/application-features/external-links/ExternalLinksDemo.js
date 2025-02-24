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
  EdgePathLabelModel,
  EdgeSides,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  IEdge,
  IGraph,
  ILabel,
  INode,
  LayoutExecutor,
  License,
  ModifierKeys,
  Size
} from '@yfiles/yfiles'
import LinkItemHoverInputMode from './LinkItemHoverInputMode'
import { initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import graphData from './graph-data.json'
let graphComponent
/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  const inputMode = new GraphEditorInputMode()
  graphComponent.inputMode = inputMode
  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)
  // then build the graph with the given data set
  buildGraph(graphComponent.graph, graphData)
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new HierarchicalLayout({
      minimumLayerDistance: 35
    })
  )
  await graphComponent.fitGraphBounds()
  // Finally, enable the undo engine. This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true
  // the click listener for labels that represent external links
  initializeLinkListener()
  // an optional custom ItemHoverInputMode which highlights clickable links by underlining the text
  inputMode.add(new LinkItemHoverInputMode())
}
/**
 * Creates nodes and edges from to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)
  graphBuilder
    .createNodesSource({
      data: graphData.nodeList.filter((item) => !item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)
  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
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
function initializeLinkListener() {
  graphComponent.inputMode.addEventListener('item-left-clicked', (evt) => {
    if (evt.modifiers !== ModifierKeys.CONTROL) {
      // this listener should only handle CTRL+click to open external links
      return
    }
    const clickedItem = evt.item
    let url = ''
    if (clickedItem instanceof ILabel) {
      const label = clickedItem
      url = label.text.startsWith('www.') || label.text.startsWith('http') ? label.text : ''
    } else if (clickedItem instanceof INode || clickedItem instanceof IEdge) {
      // if a node or edge was clicked, we see whether it has any label that resembles a link
      clickedItem.labels.forEach((label) => {
        const text = label.text
        if (text.startsWith('www.') || text.startsWith('http')) {
          url = text
        }
      })
    }
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
      evt.handled = true
    }
  })
}
/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph) {
  // set styles for this demo
  initDemoStyles(graph)
  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.layoutParameter = new ExteriorNodeLabelModel({
    margins: 5
  }).createParameter('bottom')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}
run().then(finishLoading)
