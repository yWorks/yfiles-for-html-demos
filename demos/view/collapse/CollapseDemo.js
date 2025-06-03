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
  CompositeLayoutData,
  ExteriorNodeLabelModel,
  FilteredGraphWrapper,
  Graph,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicalLayout,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutAnchoringStage,
  LayoutExecutor,
  License,
  OrganicLayout,
  PlaceNodesAtBarycenterStage,
  RadialTreeLayout,
  Size,
  TreeLayout
} from '@yfiles/yfiles'
import { CollapseAndExpandNodes } from './CollapseAndExpandNodes'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { createDemoEdgeStyle } from '@yfiles/demo-resources/demo-styles'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import { initializeStyles } from './style-templates'
/**
 * Utilities for collapsing and expanding nodes.
 */
let collapseAndExpandNodes
/**
 * The demo's graph view.
 */
let graphComponent
/**
 * Indicates whether a layout is currently in calculation.
 */
let runningLayout = false
/**
 * Bootstraps the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  collapseAndExpandNodes = new CollapseAndExpandNodes(graphComponent)
  configureUserInteraction()
  graphComponent.graph = createGraph()
  void graphComponent.fitGraphBounds()
  initializeUI()
  runLayout(null, false)
}
/**
 * Creates a filtered graph that displays nodes depending on the corresponding nodeVisibility
 * of the demo's collapseAndExpandNodes utility.
 * @returns a filtered graph.
 */
function createGraph() {
  // create the graph instance that will hold the complete graph
  const completeGraph = new Graph()
  const { templateInnerNodeStyle, templateLeafNodeStyle } = initializeStyles(graphComponent)
  // create a new style for inner nodes
  completeGraph.nodeDefaults.style = templateInnerNodeStyle
  completeGraph.nodeDefaults.size = new Size(60, 30)
  completeGraph.nodeDefaults.shareStyleInstance = false
  completeGraph.nodeDefaults.labels.layoutParameter = ExteriorNodeLabelModel.BOTTOM
  // set a default edge style
  completeGraph.edgeDefaults.style = createDemoEdgeStyle()
  buildTree(completeGraph, 5)
  for (const node of completeGraph.nodes) {
    // initially, 3 levels are expanded and thus, 4 levels are visible
    node.tag = { ...node.tag, collapsed: node.tag.level > 2 }
    collapseAndExpandNodes.setCollapsed(node, node.tag.level > 2)
    collapseAndExpandNodes.setNodeVisibility(node, node.tag.level < 4)
    // set a different style to leaf nodes
    if (completeGraph.outDegree(node) === 0) {
      completeGraph.setStyle(node, templateLeafNodeStyle)
    }
  }
  // Create a filtered graph of the original graph that contains only non-collapsed sub-parts.
  // The predicate methods specify which should be part of the filtered graph.
  return new FilteredGraphWrapper(
    completeGraph,
    (node) => collapseAndExpandNodes.getNodeVisibility(node),
    () => true
  )
}
/**
 * Configures user interaction for the demo.
 * Aside from a click listener for collapsing and expanding nodes, user interaction is restricted
 * to panning and zooming.
 */
function configureUserInteraction() {
  const graphViewerInputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NONE,
    clickableItems: GraphItemTypes.NODE
  })
  // add an event listener that expands or collapses the clicked node
  graphViewerInputMode.addEventListener('item-clicked', async (evt) => {
    if (!(evt.item instanceof INode)) {
      return
    }
    const node = evt.item
    const filteredGraph = graphComponent.graph
    const canExpand = filteredGraph.outDegree(node) !== filteredGraph.wrappedGraph.outDegree(node)
    if (canExpand) {
      collapseAndExpandNodes.expand(node)
      filteredGraph.nodePredicateChanged()
      // Stores the collapsed state of the node in the tag in order to be able to bind to it
      // using a template binding.
      node.tag = { ...node.tag, collapsed: false }
      await runLayout(node, true)
    } else {
      collapseAndExpandNodes.collapse(node)
      await runLayout(node, false)
      filteredGraph.nodePredicateChanged()
      // Stores the collapsed state of the node in the tag in order to be able to bind to it
      // using a template binding.
      node.tag = { ...node.tag, collapsed: true }
    }
  })
  graphComponent.inputMode = graphViewerInputMode
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false
  graphComponent.highlightIndicatorManager.enabled = false
}
/**
 * Creates a new radial tree layout algorithm instance.
 */
function newRadialTreeLayout() {
  return new RadialTreeLayout({
    childOrderingPolicy: 'from-sketch',
    allowOverlaps: true
  })
}
/**
 * Creates a new organic layout algorithm instance.
 */
function newOrganicLayout() {
  return new OrganicLayout({
    defaultMinimumNodeDistance: 100,
    defaultPreferredEdgeLength: 80,
    deterministic: true,
    allowNodeOverlaps: true
  })
}
/**
 * Creates a new tree layout algorithm instance.
 */
function newTreeLayout() {
  return new TreeLayout()
}
/**
 * Creates a new hierarchical layout algorithm instance.
 */
function newHierarchicalLayout() {
  return new HierarchicalLayout()
}
/**
 * Creates a new layout algorithm instance.
 * @param algorithmName the name of the layout algorithm that will be created.
 */
function newLayoutAlgorithm(algorithmName) {
  let algorithm
  switch (algorithmName) {
    default:
    case 'tree':
      algorithm = newTreeLayout()
      break
    case 'radial-tree':
      algorithm = newRadialTreeLayout()
      break
    case 'organic':
      algorithm = newOrganicLayout()
      break
    case 'hierarchical':
      algorithm = newHierarchicalLayout()
      break
  }
  // For a nice layout animation, we use PlaceNodesAtBarycenterStage to make sure new nodes
  // appear at the position of their parent
  algorithm.layoutStages.prepend(new PlaceNodesAtBarycenterStage())
  algorithm.layoutStages.prepend(new LayoutAnchoringStage())
  return algorithm
}
/**
 * Applies a new layout to the current graph.
 * @param toggledNode The children of this node are laid out as incremental items.
 * Without a toggled node, a 'from scratch' layout is calculated.
 * @param expand Whether this is part of an expand or a collapse action.
 */
async function runLayout(toggledNode, expand) {
  if (runningLayout) {
    return Promise.resolve()
  }
  runningLayout = true
  const layoutComboBox = document.querySelector('#layout-combo-box')
  layoutComboBox.disabled = true
  const currentLayout = newLayoutAlgorithm(layoutComboBox.value)
  const currentLayoutData = new CompositeLayoutData()
  collapseAndExpandNodes.configureLayout(toggledNode, expand, currentLayoutData, currentLayout)
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: currentLayout,
    layoutData: currentLayoutData,
    animationDuration: '0.3s',
    animateViewport: toggledNode == null
  })
  try {
    await layoutExecutor.start()
  } finally {
    runningLayout = false
    layoutComboBox.disabled = false
  }
}
/**
 * Builds a sample tree graph.
 */
function buildTree(graph, levelCount) {
  const root = graph.createNode({
    tag: { level: 0, collapsed: true }
  })
  addChildren(graph, root, 3, levelCount)
}
/**
 * Adds children to the given root node.
 */
function addChildren(graph, root, childrenCount, levelCount) {
  const level = root.tag.level + 1
  if (level >= levelCount) {
    return
  }
  for (let i = 0; i < childrenCount; ++i) {
    const child = graph.createNode({
      tag: { level: level, collapsed: true }
    })
    graph.createEdge(root, child)
    addChildren(graph, child, Math.floor(4 * Math.random() + 1), levelCount)
  }
}
/**
 * Binds actions to the buttons in the demo's toolbar.
 */
function initializeUI() {
  addNavigationButtons(document.querySelector('#layout-combo-box')).addEventListener(
    'change',
    () => {
      void runLayout(null, false)
    }
  )
}
run().then(finishLoading)
