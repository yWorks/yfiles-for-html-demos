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
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  HierarchicalLayoutEdgeDescriptor,
  HierarchicalLayoutNodeDescriptor,
  HierarchicalLayoutRoutingStyle,
  LayoutExecutor,
  LayoutOrientation,
  LayoutStageBase,
  License,
  PolylineEdgeStyle,
  PortData,
  RoutingStyleDescriptor,
  ShapeNodeStyle,
  Stroke
} from '@yfiles/yfiles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { colorSets } from '@yfiles/demo-app/demo-colors'
import data from './resources/sample.json'

let graphComponent
let layoutRunning = false
const togglePortAlignment = document.querySelector('#toggle-port-alignment')
const toggleMinimumDistance = document.querySelector('#minimum-port-distance')

async function run() {
  License.value = licenseData

  // initialize the graph component and input mode
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()

  // create nodes and edges of the graph
  buildGraph()

  // ensure that the LayoutExecutor class is not removed by build optimizers
  LayoutExecutor.ensure()

  // apply the hierarchical layout with port alignment
  await runLayout()
  await graphComponent.fitGraphBounds()

  initializeUI()
}

/**
 * Create and configure port data for port alignment
 */
function configurePortAlignmnent(layoutData) {
  if (togglePortAlignment.checked) {
    // align source and target ports with their edge paths
    const portData = new PortData()
    portData.sourcePortAlignmentIds = (edge) => edge.tag.path
    portData.targetPortAlignmentIds = (edge) => edge.tag.path
    // apply the configured port data
    layoutData.ports = portData
  }
}

/**
 * Arranges the demo's graph with {@link HierarchicalLayout}.
 */
async function runLayout() {
  if (layoutRunning) {
    return Promise.resolve()
  }
  layoutRunning = true
  disableUI(true)

  const layout = new HierarchicalLayout()
  layout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
  layout.minimumLayerDistance = 250
  // apply default node size
  layout.layoutStages.prepend(new NodeResizeStage(30, 50))

  const layoutData = new HierarchicalLayoutData()
  layoutData.edgeDescriptors = new HierarchicalLayoutEdgeDescriptor({
    routingStyleDescriptor: new RoutingStyleDescriptor(HierarchicalLayoutRoutingStyle.CURVED)
  })

  const pathThickness = data.pathThickness
  layoutData.edgeThickness.mapperFunction = (edge) => pathThickness[edge.tag.path]

  // configure port alignment
  configurePortAlignmnent(layoutData)

  // configure minimum port distance
  // nodes will be automatically enlarged to meet the specified port distance if necessary
  layoutData.nodeDescriptors = new HierarchicalLayoutNodeDescriptor({
    minimumPortDistance: parseInt(toggleMinimumDistance.value)
  })

  try {
    await graphComponent.applyLayoutAnimated({ layout, layoutData, animationDuration: '700ms' })
  } finally {
    layoutRunning = false
    disableUI(false)
  }
}

/**
 * Binds commands and actions to the demo's UI controls.
 */
function initializeUI() {
  togglePortAlignment.addEventListener('click', async () => {
    await runLayout()
  })
  toggleMinimumDistance.addEventListener('change', async () => {
    await runLayout()
  })
}

/**
 * Create nodes and edges according to the given data.
 * Apply the same color to edges that belong to the same path.
 */
export function buildGraph() {
  const graph = graphComponent.graph

  // apply node style
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: 'rectangle',
    fill: '#e0d5cc',
    stroke: null
  })

  // define node and edge sources
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({ data: data.nodeList, id: 'id' })
  const edgesSource = builder.createEdgesSource({
    data: data.edgeList,
    id: 'id',
    sourceId: 'source',
    targetId: 'target'
  })

  const pathThickness = data.pathThickness

  // different colors for different edge paths
  const colorSetNames = [
    'demo-orange',
    'demo-blue',
    'demo-red',
    'demo-green',
    'demo-purple',
    'demo-lightblue',
    'demo-palette-14'
  ]

  // apply colors to edges depending on the paths they belong to
  const edgeCreator = edgesSource.edgeCreator
  edgeCreator.styleProvider = (data) =>
    new PolylineEdgeStyle({
      stroke: new Stroke({
        fill: colorSets[colorSetNames[data.path]].fill,
        thickness: pathThickness[data.path]
      })
    })

  builder.buildGraph()
}

/**
 * Helper class to resize nodes during layout.
 */
class NodeResizeStage extends LayoutStageBase {
  height
  width

  constructor(width, height) {
    super()
    this.width = width
    this.height = height
  }

  applyLayoutImpl(graph) {
    graph.nodes.forEach((node) => {
      node.layout.width = this.width
      node.layout.height = this.height
    })

    this.coreLayout?.applyLayout(graph)
  }
}

/**
 * Helper function to disable UI during layout animation
 */
function disableUI(disabled) {
  togglePortAlignment.disabled = disabled
  toggleMinimumDistance.disabled = disabled
}

run().then(finishLoading)
