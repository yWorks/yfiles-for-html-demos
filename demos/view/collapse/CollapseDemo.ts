/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BalloonLayout,
  CompositeLayoutData,
  DefaultGraph,
  ExteriorLabelModel,
  FilteredGraphWrapper,
  FixNodeLayoutStage,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicLayout,
  IGraph,
  ILayoutAlgorithm,
  INode,
  LayoutExecutor,
  License,
  MultiStageLayout,
  OrganicLayout,
  PlaceNodesAtBarycenterStage,
  Size,
  StringTemplateNodeStyle,
  TemplateNodeStyle,
  TreeLayout
} from 'yfiles'

import CollapseAndExpandNodes from './CollapseAndExpandNodes'
import { fetchLicense } from 'demo-resources/fetch-license'
import { createDemoEdgeStyle } from 'demo-resources/demo-styles'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'
import { innerNodeStyleTemplate, leafNodeStyleTemplate } from './style-templates'

/**
 * Utilities for collapsing and expanding nodes.
 */
let collapseAndExpandNodes: CollapseAndExpandNodes

/**
 * The demo's graph view.
 */
let graphComponent: GraphComponent

/**
 * Indicates whether a layout is currently in calculation.
 */
let runningLayout = false

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')

  collapseAndExpandNodes = new CollapseAndExpandNodes(graphComponent)

  configureUserInteraction()

  graphComponent.graph = createGraph()
  graphComponent.fitGraphBounds()

  initializeUI()

  runLayout(null, false)
}

/**
 * Creates a filtered graph that displays nodes depending on the corresponding nodeVisibility
 * of the demo's collapseAndExpandNodes utility.
 * @returns a filtered graph.
 */
function createGraph(): FilteredGraphWrapper {
  // create the graph instance that will hold the complete graph
  const completeGraph = new DefaultGraph()

  // create a new style that uses the specified svg snippet as a template for the node
  const leafNodeStyle = new StringTemplateNodeStyle(leafNodeStyleTemplate)

  // create a new style that uses the specified svg snippet as a template for the node
  const style = new StringTemplateNodeStyle(innerNodeStyleTemplate)
  style.styleTag = { collapsed: true }
  completeGraph.nodeDefaults.style = style
  completeGraph.nodeDefaults.size = new Size(60, 30)
  completeGraph.nodeDefaults.shareStyleInstance = false
  completeGraph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  // set the converters for the collapsible node styles
  TemplateNodeStyle.CONVERTERS.collapseDemo = {
    // converter function for node background
    backgroundConverter: (data: any) => (data && data.collapsed ? '#f26419' : '#01baff'),
    // converter function for node icon
    iconConverter: (data: any) => (data && data.collapsed ? '#expand_icon' : '#collapse_icon')
  }

  // set a default edge style
  completeGraph.edgeDefaults.style = createDemoEdgeStyle()

  buildTree(completeGraph, 5)

  for (const node of completeGraph.nodes) {
    // initially, 3 levels are expanded and thus, 4 levels are visible
    ;(node.style as TemplateNodeStyle).styleTag = { collapsed: node.tag.level > 2 }
    collapseAndExpandNodes.setCollapsed(node, node.tag.level > 2)
    collapseAndExpandNodes.setNodeVisibility(node, node.tag.level < 4)

    // set a different style to leaf nodes
    if (completeGraph.outDegree(node) === 0) {
      completeGraph.setStyle(node, leafNodeStyle)
    }
  }

  // Create a filtered graph of the original graph that contains only non-collapsed sub-parts.
  // The predicate methods specify which should be part of the filtered graph.
  return new FilteredGraphWrapper(
    completeGraph,
    node => collapseAndExpandNodes.getNodeVisibility(node),
    () => true
  )
}

/**
 * Configures user interaction for the demo.
 * Aside from a click listener for collapsing and expanding nodes, user interaction is restricted
 * to panning and zooming.
 */
function configureUserInteraction(): void {
  const graphViewerInputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NONE,
    clickableItems: GraphItemTypes.NODE
  })

  // add an event listener that expands or collapses the clicked node
  graphViewerInputMode.addItemClickedListener(async (_, evt) => {
    if (!(evt.item instanceof INode)) {
      return
    }
    const node = evt.item
    const filteredGraph = graphComponent.graph as FilteredGraphWrapper
    const canExpand = filteredGraph.outDegree(node) !== filteredGraph.wrappedGraph!.outDegree(node)
    if (canExpand) {
      collapseAndExpandNodes.expand(node)
      filteredGraph.nodePredicateChanged()
      // Stores the collapsed state of the node in the style tag in order to be able to bind to it
      // using a template binding.
      ;(node.style as TemplateNodeStyle).styleTag = { collapsed: false }

      await runLayout(node, true)
    } else {
      collapseAndExpandNodes.collapse(node)
      await runLayout(node, false)
      filteredGraph.nodePredicateChanged()
      // Stores the collapsed state of the node in the style tag in order to be able to bind to it
      // using a template binding.
      ;(node.style as TemplateNodeStyle).styleTag = { collapsed: true }
    }
  })

  graphComponent.inputMode = graphViewerInputMode
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false
  graphComponent.highlightIndicatorManager.enabled = false
}

/**
 * Creates a new balloon layout algorithm instance.
 */
function newBalloonLayout(): BalloonLayout {
  const balloonLayout = new BalloonLayout()
  balloonLayout.fromSketchMode = true
  balloonLayout.compactnessFactor = 1.0
  balloonLayout.allowOverlaps = true
  return balloonLayout
}

/**
 * Creates a new organic layout algorithm instance.
 */
function newOrganicLayout(): OrganicLayout {
  const organicLayout = new OrganicLayout()
  organicLayout.minimumNodeDistance = 100
  organicLayout.preferredEdgeLength = 80
  organicLayout.deterministic = true
  organicLayout.nodeOverlapsAllowed = true
  return organicLayout
}

/**
 * Creates a new tree layout algorithm instance.
 */
function newTreeLayout(): TreeLayout {
  return new TreeLayout()
}

/**
 * Creates a new hierarchic layout algorithm instance.
 */
function newHierarchicLayout(): HierarchicLayout {
  return new HierarchicLayout()
}

/**
 * Creates a new layout algorithm instance.
 * @param algorithmName the name of the layout algorithm that will be created.
 */
function newLayoutAlgorithm(algorithmName: string): ILayoutAlgorithm {
  let algorithm: MultiStageLayout
  switch (algorithmName) {
    case 'tree':
      algorithm = newTreeLayout()
      break
    case 'balloon':
      algorithm = newBalloonLayout()
      break
    case 'organic':
      algorithm = newOrganicLayout()
      break
    case 'hierarchic':
      algorithm = newHierarchicLayout()
      break
    default:
      algorithm = newTreeLayout()
      break
  }

  // For a nice layout animation, we use PlaceNodesAtBarycenterStage to make sure new nodes
  // appear at the position of their parent and FixNodeLayoutStage to keep the clicked node
  // at its current location.
  algorithm.prependStage(new PlaceNodesAtBarycenterStage())
  algorithm.prependStage(new FixNodeLayoutStage())
  return algorithm
}

/**
 * Applies a new layout to the current graph.
 * @param toggledNode The children of this node are laid out as incremental items.
 * Without a toggled node, a 'from scratch' layout is calculated.
 * @param expand Whether this is part of an expand or a collapse action.
 */
async function runLayout(toggledNode: INode | null, expand: boolean): Promise<void> {
  if (runningLayout) {
    return Promise.resolve()
  }
  runningLayout = true

  const layoutComboBox = document.querySelector<HTMLSelectElement>('#layout-combo-box')!
  layoutComboBox.disabled = true
  const currentLayout = newLayoutAlgorithm(layoutComboBox.value)
  const currentLayoutData = new CompositeLayoutData()

  collapseAndExpandNodes.configureLayout(toggledNode, expand, currentLayoutData, currentLayout)

  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: currentLayout,
    layoutData: currentLayoutData,
    duration: '0.3s',
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
function buildTree(graph: IGraph, levelCount: number): void {
  const root = graph.createNode({
    tag: { level: 0 }
  })
  addChildren(graph, root, 3, levelCount)
}

/**
 * Adds children to the given root node.
 */
function addChildren(graph: IGraph, root: INode, childrenCount: number, levelCount: number): void {
  const level = (root.tag as { level: number }).level + 1
  if (level >= levelCount) {
    return
  }
  for (let i = 0; i < childrenCount; ++i) {
    const child = graph.createNode({
      tag: { level: level }
    })
    graph.createEdge(root, child)
    addChildren(graph, child, Math.floor(4 * Math.random() + 1), levelCount)
  }
}

/**
 * Binds actions to the buttons in the demo's toolbar.
 */
function initializeUI(): void {
  addNavigationButtons(
    document.querySelector<HTMLSelectElement>('#layout-combo-box')!
  ).addEventListener('change', () => {
    runLayout(null, false)
  })
}

run().then(finishLoading)
