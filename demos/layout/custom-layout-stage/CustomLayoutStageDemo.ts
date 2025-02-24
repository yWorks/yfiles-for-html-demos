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
  GenericLayoutData,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IGraph,
  LayoutData,
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'

import MoveNodesAsideStage from './MoveNodesAsideStage'
import AlignmentStage from './AlignmentStage'
import ZigZagEdgesStage from './ZigZagEdgesStage'
import { createDemoNodeLabelStyle, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * The graph component in which the graph is displayed.
 */
let graphComponent: GraphComponent

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode()

  // Create the sample graph
  await createGraph(graphComponent.graph)

  // Finally, enable the undo engine. This prevents undoing of the graph creation
  graphComponent.graph.undoEngineEnabled = true

  // Bind the buttons to their actions
  initializeUI()
}

/**
 * Moves the nodes marked “aside” to the side of the graph.
 */
function runMoveAsideLayout(): Promise<any> {
  // Create the custom stage including core layout
  const layout = new MoveNodesAsideStage(createCoreLayout())

  // Execute the layout
  return new LayoutExecutor({
    graphComponent,
    layout,
    layoutData: createHierarchicalLayoutData(),
    animationDuration: '0.5s'
  }).start()
}

/**
 * Aligns the green nodes vertically in the graph.
 */
async function runAlignNodesLayout(): Promise<void> {
  // Create the custom stage including core layout
  const layout = new AlignmentStage(createCoreLayout())

  // create the layout data for the custom alignment stage
  let layoutData = createAlignmentStageLayoutData()
  // combine this with the layoutData of the hierarchical layout
  layoutData = layoutData.combineWith(createHierarchicalLayoutData())

  // Execute the layout
  await new LayoutExecutor({
    graphComponent,
    layout,
    layoutData,
    animationDuration: '0.5s'
  }).start()
}

/**
 * Changes edge paths to a zig-zag shape.
 */
async function runZigZagLayout(): Promise<void> {
  // Create the custom stage including core layout
  const layout = new ZigZagEdgesStage(createCoreLayout())

  // Execute the layout
  await new LayoutExecutor({
    graphComponent,
    layout,
    layoutData: createHierarchicalLayoutData(),
    animationDuration: '0.5s'
  }).start()
}

/**
 * Applies all custom layout stages at once. Typically, layout stages can be chained like this to
 * divide responsibilities for different parts of the layout customization into separate stages.
 */
async function runAllLayouts(): Promise<void> {
  // In this case, however, the custom alignment stage must come last, since it explicitly checks
  // for the core layout to be a hierarchical layout. In many cases, the order of stages matters, as
  // the graph is changed for the next stage, but some stages with changes that don't interfere with
  // each other can also be applied in any order.
  const layout = new ZigZagEdgesStage(
    new MoveNodesAsideStage(new AlignmentStage(createCoreLayout()))
  )

  // create the layout data for the custom alignment stage
  let layoutData = createAlignmentStageLayoutData()
  // combine this with the layoutData of the hierarchical layout
  layoutData = layoutData.combineWith(createHierarchicalLayoutData())

  await new LayoutExecutor({
    graphComponent,
    layout,
    layoutData,
    animationDuration: '0.5s'
  }).start()
}

/**
 * Creates custom layout data for the alignment stage.
 */
function createAlignmentStageLayoutData(): LayoutData {
  // GenericLayoutData offers a way to attach custom properties to graph items for
  // layout stages in a similar manner as the yFiles built-in layout algorithms
  const layoutData: GenericLayoutData = new GenericLayoutData()
  layoutData.addItemCollection(AlignmentStage.ALIGNED_NODES_DATA_KEY).predicate = (node) =>
    (node.style as ShapeNodeStyle).shape === ShapeNodeShape.ELLIPSE
  return layoutData
}

/**
 * Creates the layout data for the hierarchical layout algorithm. Sequence and layering
 * constraints are used to constrain the placement of the green nodes for this sample.
 */
function createHierarchicalLayoutData(): HierarchicalLayoutData {
  const layoutData = new HierarchicalLayoutData()
  for (const edge of graphComponent.graph.edges) {
    if (edge.tag?.horizontal) {
      layoutData.layerConstraints.placeInSameLayer(edge.sourceNode, edge.targetNode)
      layoutData.sequenceConstraints.placeNodeAtHead(edge.targetNode)
    }
  }
  return layoutData
}

/**
 * Creates the core layout for all the other layouts: A simple hierarchical layout with orthogonal
 * edges and a slightly increased layer distance.
 */
function createCoreLayout(): HierarchicalLayout {
  return new HierarchicalLayout({
    minimumLayerDistance: 50
  })
}

/**
 * Creates an initial sample graph.
 *
 * @param graph The graph.
 */
async function createGraph(graph: IGraph): Promise<void> {
  graph.nodeDefaults.size = new Size(40, 40)
  initDemoStyles(graph, { shape: ShapeNodeShape.ROUND_RECTANGLE })
  graph.edgeDefaults.shareStyleInstance = false
  graph.nodeDefaults.labels.style = createDemoNodeLabelStyle('demo-palette-21')

  const nodeLocations: [number, number][] = [
    [150, 0],
    [100, 50],
    [200, 50],
    [75, 100],
    [125, 100],
    [175, 100],
    [225, 100],
    [75, 150],
    [225, 150],
    [100, 0],
    [50, 50],
    [25, 100]
  ]
  const nodes = nodeLocations.map((location) => graph.createNodeAt(location))

  // We have a few special nodes in this sample
  const greenNodeStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: '#76B041',
    stroke: '1.5px #586a48'
  })
  graph.setStyle(nodes[9], greenNodeStyle)
  graph.setStyle(nodes[10], greenNodeStyle)
  graph.setStyle(nodes[11], greenNodeStyle)

  const blueNodeStyle = new ShapeNodeStyle({
    fill: '#17BEBB',
    stroke: '1.5px #407271'
  })
  graph.setStyle(nodes[7], blueNodeStyle)
  graph.setStyle(nodes[8], blueNodeStyle)
  nodes[7].tag = nodes[8].tag = { moveAside: true }
  graph.addLabel(nodes[7], 'Aside')
  graph.addLabel(nodes[8], 'Aside')

  graph.createEdge(nodes[0], nodes[1])
  graph.createEdge(nodes[0], nodes[2])
  graph.createEdge(nodes[1], nodes[3])
  graph.createEdge(nodes[1], nodes[4])
  graph.createEdge(nodes[2], nodes[5])
  graph.createEdge(nodes[2], nodes[6])
  graph.createEdge(nodes[3], nodes[7])
  graph.createEdge(nodes[6], nodes[8])
  const dashedEdgeStyle = new PolylineEdgeStyle({
    stroke: '1.5px dashed darkgray'
  })
  const e1 = graph.createEdge(nodes[0], nodes[9], dashedEdgeStyle)
  const e2 = graph.createEdge(nodes[1], nodes[10], dashedEdgeStyle)
  const e3 = graph.createEdge(nodes[3], nodes[11], dashedEdgeStyle)
  e1.tag = e2.tag = e3.tag = { horizontal: true }

  graphComponent.graph.applyLayout(createCoreLayout(), createHierarchicalLayoutData())
  await graphComponent.fitGraphBounds()
}

/**
 * Binds actions to the buttons in the tutorial's toolbar.
 */
function initializeUI(): void {
  function flipDisableButtons() {
    document.querySelectorAll<HTMLButtonElement>('button[data-action]').forEach((btn) => {
      btn.disabled = !btn.disabled
    })
  }

  document.querySelectorAll("button[data-action='RunStage1']").forEach((btn) => {
    btn.addEventListener('click', async () => {
      flipDisableButtons()
      await runMoveAsideLayout()
      flipDisableButtons()
    })
  })
  document.querySelectorAll("button[data-action='RunStage2']").forEach((btn) => {
    btn.addEventListener('click', async () => {
      flipDisableButtons()
      await runAlignNodesLayout()
      flipDisableButtons()
    })
  })
  document.querySelectorAll("button[data-action='RunStage3']").forEach((btn) => {
    btn.addEventListener('click', async () => {
      flipDisableButtons()
      await runZigZagLayout()
      flipDisableButtons()
    })
  })
  document.querySelectorAll("button[data-action='RunAllStages']").forEach((btn) => {
    btn.addEventListener('click', async () => {
      flipDisableButtons()
      await runAllLayouts()
      flipDisableButtons()
    })
  })
}

run().then(finishLoading)
