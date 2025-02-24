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
  CircularLayout,
  ExteriorNodeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphOverviewComponent,
  GraphSnapContext,
  IEdge,
  type IGraph,
  ILabel,
  type IModelItem,
  INode,
  IPort,
  LabelStyle,
  LayoutExecutor,
  License
} from '@yfiles/yfiles'
import { createDemoEdgeStyle, createDemoNodeStyle } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
import CSS3NodeStyleWrapper from './CSS3NodeStyleWrapper'
import type { JSONGraph } from '@yfiles/demo-utils/json-model'
import graphData from './graph-data.json'
import GraphOverviewRenderer from './GraphOverviewRenderer'

let graphComponent: GraphComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  const overviewComponent = new GraphOverviewComponent('overviewComponent', graphComponent)
  // add a custom visualization for the elements in the overview
  overviewComponent.graphOverviewRenderer = new GraphOverviewRenderer()

  configureInputMode()
  initializeGraph(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  const circularLayout = new CircularLayout({
    partitioningPolicy: 'single-cycle',
    nodeLabelPlacement: 'ray-like',
    componentLayout: {
      enabled: false
    }
  })
  graphComponent.graph.applyLayout(circularLayout)
  await graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({
      data: graphData.nodeList,
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((data) => data.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 * Configures an input mode to allow the operations which use the templates that were styled with CSS.
 */
function configureInputMode(): void {
  const graphEditorInputMode = new GraphEditorInputMode({
    // enable snapping
    snapContext: new GraphSnapContext({
      snapDistance: 10,
      visualizeSnapResults: true
    }),
    // allow focusing all graph elements
    focusableItems: GraphItemTypes.ALL
  })

  // allow hovering of all graph elements
  graphEditorInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.ALL

  // enable tooltips
  const toolTipInputMode = graphEditorInputMode.toolTipInputMode
  toolTipInputMode.toolTipLocationOffset = [15, 15]
  toolTipInputMode.delay = '500ms'
  toolTipInputMode.duration = '5s'

  // add a tooltip for hovered items
  graphEditorInputMode.addEventListener('query-item-tool-tip', (evt) => {
    if (evt.handled) {
      return
    }
    evt.toolTip = createTooltipContent(evt.item!)
    evt.handled = true
  })

  // add a highlight for hovered items
  graphEditorInputMode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    const highlights = graphComponent.highlights
    if (evt.oldItem) {
      highlights.remove(evt.oldItem)
    }
    if (evt.item) {
      highlights.add(evt.item)
    }
  })

  // whenever the user creates a node, we set a created flag on its tag data object, which will then be used
  // by the custom node style to set the appropriate CSS classes
  graphEditorInputMode.addEventListener('node-created', (evt) => {
    const node = evt.item
    node.tag = { created: true }
  })

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Creates a tooltip text depending on the class of the item.
 */
function createTooltipContent(item: IModelItem): string | null {
  if (item instanceof INode) {
    return 'Node Tooltip'
  } else if (item instanceof IEdge) {
    return 'Edge Tooltip'
  } else if (item instanceof IPort) {
    return 'Port Tooltip'
  } else if (item instanceof ILabel) {
    return 'Label Tooltip'
  }
  return null
}

/**
 * Initializes the defaults for the styling in this demo.
 */
function initializeGraph(graph: IGraph): void {
  const demoNodeStyle = createDemoNodeStyle()
  demoNodeStyle.stroke = '1.5px #3c4253'
  demoNodeStyle.fill = 'white'

  const demoEdgeStyle = createDemoEdgeStyle({ showTargetArrow: false })
  demoEdgeStyle.stroke = '1.5px white'

  const demoLabelStyle = new LabelStyle({
    textFill: 'white',
    padding: [3, 5, 3, 5],
    backgroundFill: 'rgba(60, 66, 83, 0.5)'
  })

  graph.nodeDefaults.style = new CSS3NodeStyleWrapper(demoNodeStyle)
  graph.edgeDefaults.style = demoEdgeStyle
  graph.nodeDefaults.labels.style = demoLabelStyle
  graph.edgeDefaults.labels.style = demoLabelStyle
  graph.nodeDefaults.labels.layoutParameter = ExteriorNodeLabelModel.BOTTOM
}

void run().then(finishLoading)
