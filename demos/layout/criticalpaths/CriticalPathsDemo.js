/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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

import PriorityPanel from './PriorityPanel.js'
import * as SampleData from './resources/SampleData.js'
import { DemoNodeStyle } from '../../resources/demo-styles.js'
import {
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * The graph component in which the graph is displayed.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * A popup panel to change the priority of edges.
 * @type {PriorityPanel}
 */
let priorityPanel

/**
 * Flag that prevents re-entrant layout runs.
 * @type {boolean}
 */
let layoutRunning = false

/**
 * The current layout algorithm.
 * @type {'hierarchic'}
 */
let layoutStyle = 'hierarchic'

/**
 * @param {*} licenseData
 */
function run(licenseData) {
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
 * @param {!('hierarchic'|'tree')} sample
 */
function loadGraph(sample) {
  const graph = graphComponent.graph
  graph.clear()
  graph.nodeDefaults.style = new DemoNodeStyle('demo-palette-44')
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
 * @param {!IEdge} edge
 * @param {number} priority
 */
function setPriority(edge, priority) {
  if (edge.tag) {
    edge.tag.priority = priority
  } else {
    edge.tag = { priority }
  }
  edge.style.stroke = getStroke(priority)
}

/**
 * Updates the stroke color and thickness according to the given priority.
 * @param {number} priority
 * @returns {!Stroke}
 */
function getStroke(priority) {
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
 * Applies a hierarchic layout considering the edge priorities.
 * @returns {!Promise}
 */
async function runLayout() {
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
 * @returns {!object}
 */
function configureHierarchicLayout() {
  const layout = new HierarchicLayout()
  layout.orthogonalRouting = true
  layout.edgeLayoutDescriptor.minimumFirstSegmentLength = 30
  layout.edgeLayoutDescriptor.minimumLastSegmentLength = 30
  layout.nodePlacer.barycenterMode = true

  const layoutData = new HierarchicLayoutData({
    // Define priorities for edges on critical paths
    criticalEdgePriorities: edge => (edge.tag ? edge.tag.priority || 0 : 0),

    // Use the edge crossing costs to avoid crossings of different critical paths,
    // when the priority of the edge is high then the probability of crossing is low.
    edgeCrossingCosts: edge => (edge.tag ? edge.tag.priority + 1 || 1 : 1)
  })

  return {
    layout,
    layoutData
  }
}

/**
 * Returns a configured tree layout considering the edge priorities.
 * @returns {!object}
 */
function configureTreeLayout() {
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
function markRandomPredecessorsPaths() {
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
  let randomNodeCount = Math.min(10, leaves.size)
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
 * @param {!INode} node
 * @param {number} priority
 */
function markPredecessorsPath(node, priority) {
  let incomingEdges = graphComponent.graph.inEdgesAt(node)
  while (incomingEdges.size > 0) {
    const edge = incomingEdges.first()
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
function clearPriorities() {
  graphComponent.graph.edges.forEach(edge => {
    setPriority(edge, 0)
  })

  runLayout()
}

/**
 * Initializes a {@link GraphViewerInputMode} that enables element selection and tool tips.
 */
function initializeInputMode() {
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
function initializePriorityPanel() {
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

function registerCommands() {
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
  const samples = document.querySelector("select[data-command='ChangeSample']")
  addNavigationButtons(samples)
}

loadJson().then(checkLicense).then(run)
