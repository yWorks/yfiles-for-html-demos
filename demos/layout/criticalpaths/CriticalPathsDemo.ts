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
import {
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicLayout,
  HierarchicLayoutData,
  ICommand,
  IEdge,
  INode,
  LayeredNodePlacer,
  License,
  PolylineEdgeStyle,
  SimplexNodePlacer,
  Stroke,
  TreeLayout,
  TreeLayoutData
} from 'yfiles'

import PriorityPanel from './PriorityPanel'
import * as SampleData from './resources/SampleData'
import { DemoNodeStyle } from '../../resources/demo-styles'
import {
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

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
let layoutStyle: 'hierarchic' | 'tree' = 'hierarchic'

function run(licenseData: any): void {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  initializeInputMode()
  initializePriorityPanel()
  loadGraph(layoutStyle)
  registerCommands()

  showApp(graphComponent)
}

/**
 * Loads the sample graph which initially provides some priorities.
 */
function loadGraph(sample: 'hierarchic' | 'tree'): void {
  const graph = graphComponent.graph
  graph.clear()
  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.edgeDefaults.style = new PolylineEdgeStyle()
  graph.edgeDefaults.shareStyleInstance = false

  const data = SampleData[sample]

  const builder = new GraphBuilder(graph)
  builder.createNodesSource(data.nodes, 'id')
  builder.createEdgesSource(data.edges, 'source', 'target')

  builder.buildGraph()

  graph.edges.forEach(edge => setPriority(edge, edge.tag.priority || 0))

  graphComponent.fitGraphBounds()

  runLayout()
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
      return new Stroke('gold', 3)
    case 2:
      return new Stroke('orange', 3)
    case 3:
      return new Stroke('darkorange', 3)
    case 4:
      return new Stroke('orangered', 3)
    case 5:
      return new Stroke('firebrick', 3)
    default:
      return new Stroke(51, 102, 153, 255, 1)
  }
}

/**
 * Applies a hierarchic layout considering the edge priorities.
 */
async function runLayout(): Promise<void> {
  if (layoutRunning) {
    return
  }
  layoutRunning = true

  const { layout, layoutData } =
    layoutStyle === 'hierarchic' ? configureHierarchicLayout() : configureTreeLayout()

  await graphComponent.morphLayout(layout, '700ms', layoutData)
  layoutRunning = false
}

/**
 * Returns a configured hierarchic layout considering the edge priorities.
 */
function configureHierarchicLayout(): {
  layout: HierarchicLayout
  layoutData: HierarchicLayoutData
} {
  const layout = new HierarchicLayout()
  layout.orthogonalRouting = true
  layout.edgeLayoutDescriptor.minimumFirstSegmentLength = 30
  layout.edgeLayoutDescriptor.minimumLastSegmentLength = 30
  ;(layout.nodePlacer as SimplexNodePlacer).barycenterMode = true

  const layoutData = new HierarchicLayoutData({
    // Define priorities for edges on critical paths
    criticalEdgePriorities: edge => (edge.tag ? edge.tag.priority || 0 : 0),

    // Use the edge crossing costs to avoid crossings of different critical paths,
    // when the priority of the edge is high then the probability of crossing is low.
    edgeCrossingCosts: edge => (edge.tag ? (edge.tag.priority as number) + 1 || 1 : 1)
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
  layout.defaultNodePlacer = new LayeredNodePlacer({
    layerSpacing: 60,
    spacing: 30
  })

  const layoutData = new TreeLayoutData({
    // Define priorities for edges on critical paths
    criticalEdgePriorities: edge => (edge.tag ? edge.tag.priority || 0 : 0)
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Marks random upstream paths from leaf nodes to generate random long paths.
 */
function markRandomPredecessorsPaths(): void {
  if (layoutRunning) {
    return
  }

  const leaves = graphComponent.graph.nodes.filter(
    node => graphComponent.graph.outEdgesAt(node).size === 0
  )

  // clear priorities
  graphComponent.graph.edges.forEach(edge => {
    setPriority(edge, 0)
  })

  // mark the upstream path of random leaf nodes
  let randomNodeCount: number = Math.min(10, leaves.size)
  while (randomNodeCount > 0) {
    randomNodeCount--
    const rndNodeIdx = Math.floor(Math.random() * leaves.size)
    const rndPriority = Math.floor(Math.random() * 5) + 1
    markPredecessorsPath(leaves.elementAt(rndNodeIdx), rndPriority)
  }

  runLayout()
}

/**
 * Marks the upstream path from a given node.
 */
function markPredecessorsPath(node: INode, priority: number): void {
  let incomingEdges = graphComponent.graph.inEdgesAt(node)
  while (incomingEdges.size > 0) {
    const edge = incomingEdges.first()
    if (edge.tag.priority > priority) {
      // stop upstream path when a higher priority is found
      break
    }
    setPriority(edge, priority)
    incomingEdges = graphComponent.graph.inEdgesAt(edge.sourceNode!)
  }
}

/**
 * Clears all edge priorities and reapplies the layout.
 */
function clearPriorities(): void {
  graphComponent.graph.edges.forEach(edge => {
    setPriority(edge, 0)
  })

  runLayout()
}

/**
 * Initializes a {@link GraphViewerInputMode} that enables element selection and tool tips.
 */
function initializeInputMode(): void {
  const gvim = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.EDGE | GraphItemTypes.NODE,
    toolTipItems: GraphItemTypes.EDGE
  })
  gvim.addQueryItemToolTipListener((sender, event) => {
    if (!event.handled) {
      const node = event.item
      if (node) {
        event.toolTip = `Priority: ${node.tag.priority || 0}`
        event.handled = true
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

  graphComponent.selection.addItemSelectionChangedListener((src, args) => {
    if (args.item instanceof INode) {
      priorityPanel.currentItems = graphComponent.selection.selectedNodes.toArray()
    } else {
      priorityPanel.currentItems = graphComponent.selection.selectedEdges.toArray()
    }
  })
}

function registerCommands(): void {
  bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='RandomPredecessorsPaths']", markRandomPredecessorsPaths)
  bindAction("button[data-command='ClearPriorities']", clearPriorities)

  bindChangeListener("select[data-command='ChangeSample']", value => {
    layoutStyle = value === 'Hierarchic Layout' ? 'hierarchic' : 'tree'
    loadGraph(layoutStyle)
    runLayout()
  })
}

loadJson().then(checkLicense).then(run)
