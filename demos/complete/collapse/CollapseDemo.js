/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ICommand,
  IGraph,
  INode,
  LayoutExecutor,
  LayoutOrientation,
  License,
  OrganicLayout,
  PlaceNodesAtBarycenterStage,
  Size,
  TemplateNodeStyle,
  TreeLayout
} from 'yfiles'

import { bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import CollapseAndExpandNodes from './CollapseAndExpandNodes.js'
import loadJson from '../../resources/load-json.js'

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  collapseAndExpandNodes = new CollapseAndExpandNodes(graphComponent)
  initializeLayouts()

  initializeInputModes()

  graphComponent.graph = initializeGraph()
  graphComponent.fitGraphBounds()
  registerCommands()
  runLayout()
  showApp(graphComponent)
}

/**
 * an Object from CollapseAndExpandNodes class which provides collapsing and expanding functions.
 * @type {CollapseAndExpandNodes}
 */
let collapseAndExpandNodes = null

/**
 * Map from layout names to layout algorithms. For keys of type string and other non-yFiles
 * types, the ES2015 Map is preferable other the HashMap.
 * @type {Map}
 */
const layoutAlgorithms = new Map()

/** @type {GraphComponent} */
let graphComponent = null

/**
 * Indicates whether a layout is currently in calculation.
 * @type {boolean}
 */
let runningLayout = false

/**
 * Initializes the graph instance, setting default styles and creating a small sample graph.
 *
 * @return {IGraph} The FilteredGraphWrapper instance that will be displayed in the graph component.
 */
function initializeGraph() {
  // Create the graph instance that will hold the complete graph.
  const completeGraph = new DefaultGraph()

  // Create a new style that uses the specified svg snippet as a template for the node.
  const leafNodeStyle = new TemplateNodeStyle('LeafNodeStyleTemplate')

  // Create a new style that uses the specified svg snippet as a template for the node.
  completeGraph.nodeDefaults.style = new TemplateNodeStyle('InnerNodeStyleTemplate')
  completeGraph.nodeDefaults.style.styleTag = { collapsed: true }
  completeGraph.nodeDefaults.size = new Size(60, 30)
  completeGraph.nodeDefaults.shareStyleInstance = false
  completeGraph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  // Set the converters for the collapsible node styles
  TemplateNodeStyle.CONVERTERS.collapseDemo = {
    // converter function for node background
    backgroundConverter: data => {
      return data && data.collapsed ? '#FF8C00' : '#68B0E3'
    },
    // converter function for node icon
    iconConverter: data => {
      return data && data.collapsed ? '#expand_icon' : '#collapse_icon'
    }
  }

  buildTree(completeGraph, 5)

  completeGraph.nodes.forEach(node => {
    // Initially, 3 levels are expanded and thus, 4 levels are visible
    node.style.styleTag = { collapsed: node.tag.level > 2 }
    collapseAndExpandNodes.setCollapsed(node, node.tag.level > 2)
    collapseAndExpandNodes.setNodeVisibility(node, node.tag.level < 4)

    // Set a different style to leaf nodes
    if (completeGraph.outDegree(node) === 0) {
      completeGraph.setStyle(node, leafNodeStyle)
    }
  })

  // Create a filtered graph of the original graph that contains only non-collapsed sub-parts.
  // The predicate methods specify which should be part of the filtered graph.
  return new FilteredGraphWrapper(
    completeGraph,
    node => collapseAndExpandNodes.getNodeVisibility(node),
    () => true
  )
}

/**
 * Creates a configured GraphViewerInputMode for this demo and registers it as the
 * inputMode of the GraphComponent.
 */
function initializeInputModes() {
  const graphViewerInputMode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NONE,
    clickableItems: GraphItemTypes.NODE
  })

  // Add an event listener that expands or collapses the clicked node.
  graphViewerInputMode.addItemClickedListener(async (sender, args) => {
    if (!INode.isInstance(args.item)) {
      return
    }
    const node = args.item
    const filteredGraph = graphComponent.graph
    const canExpand = filteredGraph.outDegree(node) !== filteredGraph.wrappedGraph.outDegree(node)
    if (canExpand) {
      collapseAndExpandNodes.expand(node)
      filteredGraph.nodePredicateChanged()
      await runLayout(node, true)
    } else {
      collapseAndExpandNodes.collapse(node)
      await runLayout(node, false)
      filteredGraph.nodePredicateChanged()
    }
  })

  graphComponent.inputMode = graphViewerInputMode
  graphComponent.selectionIndicatorManager.enabled = false
  graphComponent.focusIndicatorManager.enabled = false
  graphComponent.highlightIndicatorManager.enabled = false
}

/**
 * Creates the configured layout algorithms of this demo.
 */
function initializeLayouts() {
  const balloonLayout = new BalloonLayout()
  balloonLayout.fromSketchMode = true
  balloonLayout.compactnessFactor = 1.0
  balloonLayout.allowOverlaps = true
  layoutAlgorithms.set('Balloon', balloonLayout)

  const organicLayout = new OrganicLayout()
  organicLayout.minimumNodeDistance = 100
  organicLayout.preferredEdgeLength = 80
  organicLayout.deterministic = true
  organicLayout.nodeOverlapsAllowed = true
  layoutAlgorithms.set('Organic', organicLayout)

  layoutAlgorithms.set('Tree', new TreeLayout())

  const hierarchicLayout = new HierarchicLayout()
  hierarchicLayout.layoutOrientation = LayoutOrientation.TOP_TO_BOTTOM
  hierarchicLayout.nodePlacer.barycenterMode = true
  layoutAlgorithms.set('Hierarchic', hierarchicLayout)

  // For a nice layout animation, we use PlaceNodesAtBarycenterStage to make sure new nodes
  // appear at the position of their parent and FixNodeLayoutStage to keep the clicked node
  // at its current location.
  layoutAlgorithms.forEach(layout => {
    layout.prependStage(new PlaceNodesAtBarycenterStage())
    layout.prependStage(new FixNodeLayoutStage())
  })
}

/**
 * Applies a new layout to the current graph.
 *
 * @param {INode} toggledNode An optional toggled node. The children of this node are laid out as
 *   incremental items. Without affected node, a 'from scratch' layout is calculated.
 * @param {boolean} expand Whether this is part of an expand or a collapse action.
 */
async function runLayout(toggledNode, expand) {
  if (runningLayout) {
    return Promise.resolve()
  }
  runningLayout = true

  const layoutComboBox = document.getElementById('layoutComboBox')
  layoutComboBox.disabled = true
  const currentLayout = layoutAlgorithms.get(layoutComboBox.value)
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
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  } finally {
    runningLayout = false
    layoutComboBox.disabled = false
  }
}

/**
 * Builds a random sample graph.
 *
 * @param {IGraph} graph
 * @param {number} levelCount
 */
function buildTree(graph, levelCount) {
  const root = graph.createNode({
    tag: { level: 0 }
  })
  addChildren(graph, root, 3, levelCount)
}

/**
 * Recursively add children to the given root node.
 *
 * @param {IGraph} graph
 * @param {INode} root
 * @param {number} childrenCount
 * @param {number} levelCount
 */
function addChildren(graph, root, childrenCount, levelCount) {
  const level = root.tag.level + 1
  if (level >= levelCount) {
    return
  }
  for (let i = 0; i < childrenCount; i++) {
    const child = graph.createNode({
      tag: { level: level }
    })
    graph.createEdge(root, child)
    addChildren(graph, child, Math.floor(4 * Math.random() + 1), levelCount)
  }
}

/**
 * Registers zoom commands for the toolbar buttons.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener("select[data-command='SelectLayout']", () => {
    runLayout()
  })
}

// run the demo
loadJson().then(run)
