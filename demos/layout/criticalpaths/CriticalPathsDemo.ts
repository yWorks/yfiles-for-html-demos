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
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IEdge,
  INode,
  LayoutExecutor,
  LevelAlignedSubtreePlacer,
  License,
  PolylineEdgeStyle,
  Stroke,
  TreeLayout,
  TreeLayoutData
} from '@yfiles/yfiles'

import PriorityPanel from './PriorityPanel'
import * as SampleData from './resources/SampleData'
import { createDemoNodeStyle } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'

/**
 * The graph component in which the graph is displayed.
 */
let graphComponent: GraphComponent

/**
 * A popup panel to change the priority of edges.
 */
let priorityPanel: PriorityPanel

/**
 * Flag that prevents re-entrant layout runs.
 */
let layoutRunning = false

/**
 * The current layout algorithm.
 */
let layoutStyle: 'hierarchical' | 'tree' = 'hierarchical'

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  initializeInputMode()
  initializePriorityPanel()
  loadGraph(layoutStyle)
  initializeUI()
}

/**
 * Loads the sample graph which initially provides some priorities.
 */
function loadGraph(sample: 'hierarchical' | 'tree'): void {
  const graph = graphComponent.graph
  graph.clear()
  graph.nodeDefaults.style = createDemoNodeStyle('demo-palette-44')
  graph.edgeDefaults.style = new PolylineEdgeStyle()
  graph.edgeDefaults.shareStyleInstance = false

  const data = SampleData[sample]

  const builder = new GraphBuilder(graph)
  builder.createNodesSource(data.nodes, 'id')
  builder.createEdgesSource(data.edges, 'source', 'target')

  builder.buildGraph()

  graph.edges.forEach((edge) => setPriority(edge, edge.tag.priority || 0))

  void graphComponent.fitGraphBounds()

  void runLayout()
}

/**
 * Specifies the priority of the given edge.
 */
function setPriority(edge: IEdge, priority: number): void {
  if (edge.tag) {
    edge.tag.priority = priority
  } else {
    edge.tag = { priority }
  }
  ;(edge.style as PolylineEdgeStyle).stroke = getStroke(priority)
}

/**
 * Updates the stroke color and thickness according to the given priority.
 */
function getStroke(priority: number): Stroke {
  switch (priority) {
    case 1:
      return new Stroke('#336699', 3)
    case 2:
      return new Stroke('#56926E', 3)
    case 3:
      return new Stroke('#F0C808', 3)
    case 4:
      return new Stroke('#FF6C00', 3)
    case 5:
      return new Stroke('#DB3A34', 3)
    default:
      return new Stroke('#C7C7A6', 1)
  }
}

/**
 * Applies a hierarchical layout considering the edge priorities.
 */
async function runLayout(): Promise<void> {
  if (layoutRunning) {
    return
  }
  layoutRunning = true

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  const { layout, layoutData } =
    layoutStyle === 'hierarchical' ? configureHierarchicalLayout() : configureTreeLayout()

  await graphComponent.applyLayoutAnimated(layout, '700ms', layoutData)
  layoutRunning = false
}

/**
 * Returns a configured hierarchical layout considering the edge priorities.
 */
function configureHierarchicalLayout(): {
  layout: HierarchicalLayout
  layoutData: HierarchicalLayoutData
} {
  const layout = new HierarchicalLayout({
    defaultEdgeDescriptor: {
      minimumFirstSegmentLength: 30,
      minimumLastSegmentLength: 30
    }
  })

  const layoutData = new HierarchicalLayoutData({
    // Define priorities for edges on critical paths
    criticalEdgePriorities: (edge) => (edge.tag ? edge.tag.priority || 0 : 0),

    // Use the edge crossing costs to avoid crossings of different critical paths,
    // when the priority of the edge is high then the probability of crossing is low.
    edgeCrossingCosts: (edge) => (edge.tag ? (edge.tag.priority as number) + 1 || 1 : 1)
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Returns a configured tree layout considering the edge priorities.
 */
function configureTreeLayout(): { layout: TreeLayout; layoutData: TreeLayoutData } {
  const layout = new TreeLayout()
  const levelAlignedSubtreePlacer = new LevelAlignedSubtreePlacer()
  levelAlignedSubtreePlacer.layerSpacing = 60
  levelAlignedSubtreePlacer.spacing = 30
  layout.defaultSubtreePlacer = levelAlignedSubtreePlacer

  const layoutData = new TreeLayoutData({
    // Define priorities for edges on critical paths
    criticalEdgePriorities: (edge) => (edge.tag ? edge.tag.priority || 0 : 0)
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Marks random upstream paths from leaf nodes to generate random long paths.
 */
async function markRandomPredecessorsPaths(): Promise<void> {
  if (layoutRunning) {
    return
  }

  const leaves = graphComponent.graph.nodes.filter(
    (node) => graphComponent.graph.outEdgesAt(node).size === 0
  )

  // clear priorities
  graphComponent.graph.edges.forEach((edge) => {
    setPriority(edge, 0)
  })

  // mark the upstream path of random leaf nodes
  let randomNodeCount: number = Math.min(10, leaves.size)
  while (randomNodeCount > 0) {
    randomNodeCount--
    const rndNodeIdx = Math.floor(Math.random() * leaves.size)
    const rndPriority = Math.floor(Math.random() * 5) + 1
    markPredecessorsPath(leaves.at(rndNodeIdx)!, rndPriority)
  }

  await runLayout()
}

/**
 * Marks the upstream path from a given node.
 */
function markPredecessorsPath(node: INode, priority: number): void {
  let incomingEdges = graphComponent.graph.inEdgesAt(node)
  while (incomingEdges.size > 0) {
    const edge = incomingEdges.first()!
    if (edge.tag.priority > priority) {
      // stop upstream path when a higher priority is found
      break
    }
    setPriority(edge, priority)
    incomingEdges = graphComponent.graph.inEdgesAt(edge.sourceNode)
  }
}

/**
 * Clears all edge priorities and reapplies the layout.
 */
async function clearPriorities(): Promise<void> {
  graphComponent.graph.edges.forEach((edge) => {
    setPriority(edge, 0)
  })

  await runLayout()
}

/**
 * Initializes a {@link GraphViewerInputMode} that enables element selection and tool tips.
 */
function initializeInputMode(): void {
  const gvim = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.EDGE | GraphItemTypes.NODE,
    toolTipItems: GraphItemTypes.EDGE
  })
  gvim.addEventListener('query-item-tool-tip', (evt) => {
    if (!evt.handled) {
      const node = evt.item
      if (node) {
        evt.toolTip = `Priority: ${node.tag.priority || 0}`
        evt.handled = true
      }
    }
  })
  graphComponent.inputMode = gvim
}

/**
 * Initializes the {@link PriorityPanel}.
 */
function initializePriorityPanel(): void {
  priorityPanel = new PriorityPanel(graphComponent)
  priorityPanel.itemPriorityChanged = (item, newPriority) => {
    if (item instanceof IEdge) {
      setPriority(item, newPriority)
    } else if (item instanceof INode) {
      markPredecessorsPath(item, newPriority)
    }
    graphComponent.selection.clear()
  }

  priorityPanel.priorityChanged = () => runLayout()

  graphComponent.selection.addEventListener('item-added', (evt) => {
    if (evt.item instanceof INode) {
      priorityPanel.currentItems = graphComponent.selection.nodes.toArray()
    } else {
      priorityPanel.currentItems = graphComponent.selection.edges.toArray()
    }
  })
}

function initializeUI(): void {
  document
    .querySelector<HTMLButtonElement>('#random-predecessors-paths')!
    .addEventListener('click', markRandomPredecessorsPaths)
  document
    .querySelector<HTMLButtonElement>('#clear-priorities')!
    .addEventListener('click', clearPriorities)

  addNavigationButtons(
    document.querySelector<HTMLSelectElement>('#change-sample')!
  ).addEventListener('change', async (evt) => {
    const value = (evt.target as HTMLSelectElement).value
    layoutStyle = value === 'Hierarchical Layout' ? 'hierarchical' : 'tree'
    loadGraph(layoutStyle)
    await runLayout()
  })
}

run().then(finishLoading)
