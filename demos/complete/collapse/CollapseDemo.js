/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
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
'use strict'

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-component',
  'resources/demo-app',
  'yfiles/layout-hierarchic',
  'yfiles/layout-organic',
  'yfiles/layout-tree',
  'yfiles/view-layout-bridge',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app) => {
  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeLayouts()

    initializeInputModes()

    graphComponent.graph = initializeGraph()
    graphComponent.fitGraphBounds()
    registerCommands()

    runLayout()
    app.show()
  }

  /**
   * Map that stores whether a node is collapsed.
   */
  const nodeCollapsedMap = new yfiles.collections.Map()

  /**
   * Map that stores the node visibility.
   */
  const nodeVisibility = new yfiles.collections.Map()

  /**
   * Map from layout names to layout algorithms. For keys of type string and other non-yFiles
   * types, the ES6 Map is preferable other the yfiles.collections.Map.
   * @type {Map}
   */
  const layoutAlgorithms = new Map()

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /**
   * Indicates whether a layout is currently in calculation.
   * @type {boolean}
   */
  let runningLayout = false

  /**
   * Show the children of a collapsed node.
   * @param {yfiles.graph.INode} node The node that should be expanded
   */
  function expand(node) {
    // Stores the collapsed state of the node in the style tag in order
    // to be able to bind to it using a template binding.
    node.style.styleTag = { collapsed: false }
    nodeCollapsedMap.set(node, false)

    const filteredGraph = graphComponent.graph
    getDescendants(filteredGraph.wrappedGraph, node, succ => nodeCollapsedMap.get(succ)).forEach(
      succ => {
        nodeVisibility.set(succ, true)
      }
    )

    filteredGraph.nodePredicateChanged()
    runLayout(node, true)
  }

  /**
   * Hide the children of a expanded node.
   * @param {yfiles.graph.INode} node The node that should be collapsed
   */
  function collapse(node) {
    node.style.styleTag = { collapsed: true }
    nodeCollapsedMap.set(node, true)

    const filteredGraph = graphComponent.graph
    getDescendants(filteredGraph.wrappedGraph, node, succ => nodeCollapsedMap.get(succ)).forEach(
      succ => {
        nodeVisibility.set(succ, false)
      }
    )

    runLayout(node, false).then(() => {
      filteredGraph.nodePredicateChanged()
    })
  }

  /**
   * Initializes the graph instance, setting default styles and creating a small sample graph.
   *
   * @return {yfiles.graph.IGraph} The FilteredGraphWrapper instance that will be displayed in the graph component.
   */
  function initializeGraph() {
    // Create the graph instance that will hold the complete graph.
    const completeGraph = new yfiles.graph.DefaultGraph()

    // Create a new style that uses the specified svg snippet as a template for the node.
    const leafNodeStyle = new yfiles.styles.TemplateNodeStyle('LeafNodeStyleTemplate')

    // Create a new style that uses the specified svg snippet as a template for the node.
    completeGraph.nodeDefaults.style = new yfiles.styles.TemplateNodeStyle('InnerNodeStyleTemplate')
    completeGraph.nodeDefaults.style.styleTag = { collapsed: true }
    completeGraph.nodeDefaults.size = new yfiles.geometry.Size(60, 30)
    completeGraph.nodeDefaults.shareStyleInstance = false
    completeGraph.nodeDefaults.labels.layoutParameter = yfiles.graph.ExteriorLabelModel.SOUTH

    // Set the converters for the collapsible node styles
    yfiles.styles.TemplateNodeStyle.CONVERTERS.collapseDemo = {
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
      nodeCollapsedMap.set(node, node.tag.level > 2)
      nodeVisibility.set(node, node.tag.level < 4)

      // Set a different style to leaf nodes
      if (completeGraph.outDegree(node) === 0) {
        completeGraph.setStyle(node, leafNodeStyle)
      }
    })

    // Create a filtered graph of the original graph that contains only non-collapsed sub-parts.
    // The predicate methods specify which should be part of the filtered graph.
    return new yfiles.graph.FilteredGraphWrapper(
      completeGraph,
      node => !!nodeVisibility.get(node),
      () => true
    )
  }

  /**
   * Creates a configured GraphViewerInputMode for this demo and registers it as the
   * inputMode of the GraphComponent.
   */
  function initializeInputModes() {
    const graphViewerInputMode = new yfiles.input.GraphViewerInputMode({
      selectableItems: yfiles.graph.GraphItemTypes.NONE,
      clickableItems: yfiles.graph.GraphItemTypes.NODE
    })

    // Add an event listener that expands or collapses the clicked node.
    graphViewerInputMode.addItemClickedListener((sender, args) => {
      if (!yfiles.graph.INode.isInstance(args.item)) {
        return
      }
      const node = args.item
      const filteredGraph = graphComponent.graph
      const canExpand = filteredGraph.outDegree(node) !== filteredGraph.wrappedGraph.outDegree(node)
      if (canExpand) {
        expand(node)
      } else {
        collapse(node)
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
    const balloonLayout = new yfiles.tree.BalloonLayout()
    balloonLayout.fromSketchMode = true
    balloonLayout.compactnessFactor = 1.0
    balloonLayout.allowOverlaps = true
    layoutAlgorithms.set('Balloon', balloonLayout)

    const organicLayout = new yfiles.organic.OrganicLayout()
    organicLayout.minimumNodeDistance = 100
    organicLayout.preferredEdgeLength = 80
    organicLayout.deterministic = true
    organicLayout.nodeOverlapsAllowed = true
    layoutAlgorithms.set('Organic', organicLayout)

    layoutAlgorithms.set('Tree', new yfiles.tree.TreeLayout())

    const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.layoutOrientation = yfiles.layout.LayoutOrientation.TOP_TO_BOTTOM
    hierarchicLayout.nodePlacer.barycenterMode = true
    layoutAlgorithms.set('Hierarchic', hierarchicLayout)

    // For a nice layout animation, we use PlaceNodesAtBarycenterStage to make sure new nodes
    // appear at the position of their parent and FixNodeLayoutStage to keep the clicked node
    // at its current location. StraightLineEdgeRouter will remove the bends.
    layoutAlgorithms.forEach(layout => {
      const edgeRouter = new yfiles.router.StraightLineEdgeRouter()
      edgeRouter.scope = yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES
      layout.prependStage(new yfiles.layout.PlaceNodesAtBarycenterStage())
      layout.prependStage(edgeRouter)
      layout.prependStage(new yfiles.layout.FixNodeLayoutStage())
    })
  }

  /**
   * Applies a new layout to the current graph.
   *
   * @param {yfiles.graph.INode?} toggledNode An optional toggled node. The children of this node are laid out as
   *   incremental items. Without affected node, a 'from scratch' layout is calculated.
   * @param {boolean?} expand Whether this is part of an expand or a collapse action.
   */
  function runLayout(toggledNode, expand) {
    if (runningLayout) {
      return Promise.resolve()
    }
    runningLayout = true

    const layoutComboBox = document.getElementById('layoutComboBox')
    layoutComboBox.disabled = true

    const graph = graphComponent.graph
    const currentLayout = layoutAlgorithms.get(layoutComboBox.value)
    const layoutExecutor = new yfiles.layout.LayoutExecutor(graphComponent, currentLayout)
    layoutExecutor.layoutData = new yfiles.layout.CompositeLayoutData()

    if (toggledNode) {
      // Keep the clicked node at its location
      const fixNodeLayoutData = new yfiles.layout.FixNodeLayoutData()
      fixNodeLayoutData.fixedNode.item = toggledNode
      layoutExecutor.layoutData.items.add(fixNodeLayoutData)

      const incrementalNodes = getDescendants(graph, toggledNode)
      const incrementalMap = new yfiles.collections.Map()
      incrementalNodes.forEach(node => {
        incrementalMap.set(node, true)
      })

      if (expand) {
        // move the incremental nodes between their neighbors before expanding for a smooth animation
        prepareSmoothExpandLayoutAnimation(incrementalMap)
      } else {
        // configure StraightLineEdgeRouter and PlaceNodesAtBarycenterStage for a smooth animation
        const straightLineEdgeRouterData = new yfiles.router.StraightLineEdgeRouterData()
        straightLineEdgeRouterData.affectedNodes.delegate = node => incrementalMap.has(node)
        layoutExecutor.layoutData.items.add(straightLineEdgeRouterData)
        const placeNodesAtBarycenterStageData = new yfiles.layout.PlaceNodesAtBarycenterStageData()
        placeNodesAtBarycenterStageData.affectedNodes.delegate = node => incrementalMap.has(node)
        layoutExecutor.layoutData.items.add(placeNodesAtBarycenterStageData)
      }

      if (currentLayout instanceof yfiles.organic.OrganicLayout) {
        currentLayout.scope = yfiles.organic.Scope.MAINLY_SUBSET

        const layoutData = new yfiles.organic.OrganicLayoutData()
        layoutData.affectedNodes.source = graph.nodes.toList()
        layoutExecutor.layoutData.items.add(layoutData)
      } else if (currentLayout instanceof yfiles.hierarchic.HierarchicLayout) {
        currentLayout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL

        const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
        layoutData.incrementalHints.incrementalLayeringNodes.source = incrementalNodes
        layoutExecutor.layoutData.items.add(layoutData)
      }
    } else {
      if (currentLayout instanceof yfiles.organic.OrganicLayout) {
        currentLayout.scope = yfiles.organic.Scope.ALL
      } else if (currentLayout instanceof yfiles.hierarchic.HierarchicLayout) {
        currentLayout.layoutMode = yfiles.hierarchic.LayoutMode.FROM_SCRATCH
      }
    }

    layoutExecutor.animateViewport = toggledNode == null
    layoutExecutor.duration = '0.3s'
    return layoutExecutor
      .start()
      .then(() => {
        runningLayout = false
        layoutComboBox.disabled = false
      })
      .catch(error => {
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Moves incremental nodes between their neighbors before expanding for a smooth animation.
   * @param {yfiles.collections.Map} incrementalMap
   */
  function prepareSmoothExpandLayoutAnimation(incrementalMap) {
    const graph = graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const straightLineEdgeRouterData = new yfiles.router.StraightLineEdgeRouterData()
    straightLineEdgeRouterData.affectedNodes.delegate = node => incrementalMap.has(node)
    const placeNodesAtBarycenterStageData = new yfiles.layout.PlaceNodesAtBarycenterStageData()
    placeNodesAtBarycenterStageData.affectedNodes.delegate = node => incrementalMap.has(node)
    const layoutData = new yfiles.layout.CompositeLayoutData()
    layoutData.items = [straightLineEdgeRouterData, placeNodesAtBarycenterStageData]

    const layout = new yfiles.layout.SequentialLayout()
    const edgeRouter = new yfiles.router.StraightLineEdgeRouter()
    edgeRouter.scope = yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES
    layout.appendLayout(edgeRouter)
    layout.appendLayout(new yfiles.layout.PlaceNodesAtBarycenterStage())

    graph.applyLayout(layout, layoutData)
  }

  /**
   * Returns the descendants of the given node.
   *
   * @param {yfiles.graph.IGraph} graph The graph.
   * @param {yfiles.graph.INode} node The node.
   * @param {function(yfiles.graph.INode):boolean?} recursionFilter An optional node predicate that specifies whether
   *   the recursion should continue for the given node.
   * @return {yfiles.collections.IList.<yfiles.graph.INode>} The descendants of the given node.
   */
  function getDescendants(graph, node, recursionFilter) {
    const visited = new yfiles.collections.Map()
    const descendants = new yfiles.collections.List()
    const nodes = [node]
    while (nodes.length > 0) {
      graph.successors(nodes.pop()).forEach(s => {
        if (!visited.get(s)) {
          visited.set(s, true)
          descendants.add(s)
          if (recursionFilter == null || !recursionFilter(s)) {
            nodes.push(s)
          }
        }
      })
    }
    return descendants
  }

  /**
   * Builds a random sample graph.
   *
   * @param {yfiles.graph.IGraph} graph
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
   * @param {yfiles.graph.IGraph} graph
   * @param {yfiles.graph.INode} root
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
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindChangeListener("select[data-command='SelectLayout']", () => {
      runLayout()
    })
  }

  // run the demo
  run()
})
