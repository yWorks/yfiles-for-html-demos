/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  './LayoutCoordinatesStage.js',
  'yfiles/view-folding',
  'yfiles/view-graphml',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, DemoStage) => {
  /**
   * This demo shows how to nicely expand and collapse sub-graphs organized in groups.
   */
  function run() {
    // initialize the GraphComponent and GraphOverviewComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    const overviewComponent = new yfiles.view.GraphOverviewComponent('overviewComponent')
    overviewComponent.graphComponent = graphComponent

    // initialize input mode
    initializeInputMode()

    // enable folding
    const foldingManager = new yfiles.graph.FoldingManager()
    const foldingView = foldingManager.createFoldingView()
    graphComponent.graph = foldingView.graph
    overviewComponent.graphVisualCreator = new DemoStyles.DemoStyleOverviewPaintable(
      graphComponent.graph
    )

    // create sample graph
    createSampleGraph()

    // initialize mappers
    alternativeGroupBounds = new yfiles.collections.Mapper()
    alternativeEdgePaths = new yfiles.collections.Mapper()

    // register toolbar commands
    registerCommands()

    // initialize the demo
    app.show(graphComponent, overviewComponent)
  }

  /**
   * Flag to prevent re-entrant layouts.
   * @type {boolean}
   */
  let runningLayout = false

  /**
   * The main component that contains the current graph.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The last group node that was collapsed/expanded.
   * @type {yfiles.graph.INode}
   */
  let changedGroupNode = null

  /**
   * A mapper containing alternative bounds for the collapsed/expanded group node.
   * @type {yfiles.collections.Mapper.<yfiles.graph.INode, yfiles.algorithms.YRectangle>}
   */
  let alternativeGroupBounds = null

  /**
   * A mapper containing alternative bounds for the collapsed/expanded group node.
   * @type {yfiles.collections.Mapper.<yfiles.graph.IEdge, yfiles.algorithms.YPointPath>}
   */
  let alternativeEdgePaths = null

  /**
   * Creates a viewer mode that allows navigating nested graphs and registers it as the
   * {@link yfiles.view.CanvasComponent#inputMode}.
   */
  function initializeInputMode() {
    const inputMode = new yfiles.input.GraphViewerInputMode()

    // Create an input mode and set a group node alignment policy that makes sure that the
    // expand/collapse button of the current group node keeps its location.
    // Note that the corresponding 'fix point policy' is used for the FixNodeLayoutStage in
    // the incremental layout calculation.
    inputMode.navigationInputMode.autoGroupNodeAlignmentPolicy =
      yfiles.input.NodeAlignmentPolicy.TOP_RIGHT

    // Allow group navigation.
    inputMode.navigationInputMode.allowCollapseGroup = true
    inputMode.navigationInputMode.allowExpandGroup = true
    // FitContent interferes with our view port animation setup
    inputMode.navigationInputMode.fitContentAfterGroupActions = false

    // Store alternative bounds and paths before expanding/collapsing a group node.
    inputMode.navigationInputMode.addGroupExpandingListener(beforeGroupExpanded)
    inputMode.navigationInputMode.addGroupCollapsingListener(beforeGroupCollapsed)

    // Run incremental layout after expanding/collapsing a group node.
    inputMode.navigationInputMode.addGroupExpandedListener(afterGroupStateChanged)
    inputMode.navigationInputMode.addGroupCollapsedListener(afterGroupStateChanged)

    graphComponent.inputMode = inputMode
  }

  /**
   * Event handler that is triggered before a group was expanded interactively.
   * This method stores the layout off the newly expanded group node and the paths of all adjacent edges.
   * @param {Object} sender The source of the event.
   * @param {yfiles.collections.ItemEventArgs.<yfiles.graph.INode>} e An object that contains the event data.
   */
  function beforeGroupExpanded(sender, e) {
    const graph = sender.graph
    const group = e.item
    const layout = group.layout

    // store the expanded group node
    changedGroupNode = group

    // store the group bounds of the expanded group node before layout
    alternativeGroupBounds.clear()
    alternativeGroupBounds.set(
      graph.foldingView.getMasterItem(group),
      new yfiles.algorithms.YRectangle(layout.x, layout.y, layout.width, layout.height)
    )

    // store all edge paths that connect to the expanded group before layout
    alternativeEdgePaths.clear()
    graph.edgesAt(group).forEach(edge => {
      const points = []
      const sourcePort = edge.sourcePort.location
      const targetPort = edge.targetPort.location
      points.push(new yfiles.algorithms.YPoint(sourcePort.x, sourcePort.y))
      edge.bends.forEach(bend => {
        points.push(new yfiles.algorithms.YPoint(bend.location.x, bend.location.y))
      })
      points.push(new yfiles.algorithms.YPoint(targetPort.x, targetPort.y))
      alternativeEdgePaths.set(
        graph.foldingView.getMasterItem(edge),
        new yfiles.algorithms.YPointPath(points)
      )
    })
  }

  /**
   * Event handler that is triggered before a group was closed/expanded interactively.
   * This method stores the layout off the newly collapsed group node
   * or the newly expanded group node and its descendants, respectively.
   * @param {Object} sender The source of the event.
   * @param {yfiles.collections.ItemEventArgs.<yfiles.graph.INode>} e An object that contains the event data.
   */
  function beforeGroupCollapsed(sender, e) {
    const graph = sender.graph
    const group = e.item
    const layout = group.layout

    // store the collapsed group node
    changedGroupNode = group

    // store the group bounds of the collapsed group node before layout
    alternativeGroupBounds.clear()
    alternativeGroupBounds.set(
      graph.foldingView.getMasterItem(group),
      new yfiles.algorithms.YRectangle(layout.x, layout.y, layout.width, layout.height)
    )

    // store all edge paths that connect to/into the collapsed group before layout
    alternativeEdgePaths.clear()
    getAffectedEdges(group, graph).forEach(edge => {
      const points = []
      const sourcePort = edge.sourcePort.location
      const targetPort = edge.targetPort.location
      points.push(new yfiles.algorithms.YPoint(sourcePort.x, sourcePort.y))
      edge.bends.forEach(bend => {
        points.push(new yfiles.algorithms.YPoint(bend.location.x, bend.location.y))
      })
      points.push(new yfiles.algorithms.YPoint(targetPort.x, targetPort.y))
      alternativeEdgePaths.set(
        graph.foldingView.getMasterItem(edge),
        new yfiles.algorithms.YPointPath(points)
      )
    })
  }

  /**
   * Retrieves the affected edges when a group node is collapsed.
   * Edges are affected when they connect to the group node directly or to a descendant of the group node.
   * @param {yfiles.graph.INode} group The group node which is collapsed.
   * @param {yfiles.graph.IGraph} graph The graph to which the group node belongs.
   * @return {Array} An array of all affected edges.
   */
  function getAffectedEdges(group, graph) {
    const crossingEdges = []

    // Collect all edges that connect to the group node.
    graph.edgesAt(group).forEach(edge => crossingEdges.push(edge))

    // Collect all edges that cross the group node's border.
    let groupingSupport = graph.groupingSupport
    if (groupingSupport === null) {
      groupingSupport = new yfiles.graph.GroupingSupport(graph)
    }
    const descendants = groupingSupport.getDescendants(group)
    const visitedEdges = new Set()
    descendants.forEach(descendant => {
      graph.edgesAt(descendant).forEach(edge => {
        if (!visitedEdges.has(edge)) {
          if (!groupingSupport.isDescendant(edge.opposite(descendant), group)) {
            crossingEdges.push(edge)
          }
          visitedEdges.add(edge)
        }
      })
    })

    return crossingEdges
  }

  /**
   * Performs an incremental layout on the graph after a group was closed/expanded interactively.
   * @param {Object} sender The source of the event.
   * @param {yfiles.collections.ItemEventArgs.<yfiles.graph.INode>} e An object that contains the event data.
   */
  function afterGroupStateChanged(sender, e) {
    const groupNode = e.item

    // store the current locations of nodes and edges to keep them for incremental layout
    const graph = graphComponent.graph
    const nodesCoordinates = graph.mapperRegistry.createMapper(
      yfiles.graph.INode.$class,
      yfiles.geometry.Point.$class,
      DemoStage.NODE_COORDINATES_DP_KEY
    )
    const edgesCoordinates = graph.mapperRegistry.createMapper(
      yfiles.graph.IEdge.$class,
      yfiles.collections.List.$class,
      DemoStage.EDGE_COORDINATES_DP_KEY
    )

    const groupingSupport = graph.groupingSupport
    if (graph.isGroupNode(groupNode)) {
      // reset the paths and the centers of the child nodes so that morphing looks smoother
      const descendants = groupingSupport.getDescendants(groupNode)
      const visitedEdges = new Set()
      descendants.forEach(childNode => {
        graph.edgesAt(childNode).forEach(edge => {
          // store path and clear bends afterwards
          if (!visitedEdges.has(edge)) {
            const bends = []
            edge.bends.forEach(bend => {
              bends.push(new yfiles.algorithms.YPoint(bend.location.x, bend.location.y))
            })
            edgesCoordinates.set(edge, new yfiles.algorithms.YPointPath(bends))
            graph.clearBends(edge)
            visitedEdges.add(edge)
          }
        })
        // store coordinates and center node afterwards
        nodesCoordinates.set(childNode, childNode.layout.topLeft)
        graph.setNodeCenter(childNode, groupNode.layout.center)
      })
    }

    // reset adjacent edge paths to get smoother layout transitions
    graph.edgesAt(groupNode).forEach(edge => {
      // store path and clear bends afterwards
      const bends = []
      edge.bends.forEach(bend => {
        bends.push(new yfiles.algorithms.YPoint(bend.location.x, bend.location.y))
      })
      edgesCoordinates.set(edge, new yfiles.algorithms.YPointPath(bends))
      graph.clearBends(edge)
    })

    applyIncrementalLayout(groupNode)
  }

  /**
   * Applies the incremental layout after each expanding and collapsing.
   */
  function applyIncrementalLayout() {
    // check if layout is currently running
    if (runningLayout) {
      return
    }

    // mark that layout is running now
    runningLayout = true

    // configure hierarchic layout for a most stable outcome
    let layout = new yfiles.hierarchic.HierarchicLayout()
    layout.recursiveGroupLayering = true
    layout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
    layout.edgeLayoutDescriptor.routingStyle = new yfiles.hierarchic.RoutingStyle(
      yfiles.hierarchic.EdgeRoutingStyle.ORTHOGONAL
    )
    layout.edgeLayoutDescriptor.recursiveEdgeStyle = yfiles.hierarchic.RecursiveEdgeStyle.DIRECTED

    // The FixNodeLayoutStage is used to make sure that the expanded/collapsed group stays at
    // their location.
    // Note that an input mode with the corresponding 'group node alignment policy' is used, too.
    layout = new yfiles.layout.FixNodeLayoutStage(layout)
    layout.fixPointPolicy = yfiles.layout.FixPointPolicy.UPPER_RIGHT

    // The LayoutCoordinatesStage will move the nodes to their previous locations
    // to be able to run an incremental layout although all nodes inside a group node were placed at the same location
    layout = new DemoStage.LayoutCoordinatesStage(layout)

    // Prepare graph so the layout will consider which node is fixed and what bounds to use for from-sketch placement
    const fixNodeLayoutData = new yfiles.layout.FixNodeLayoutData()
    fixNodeLayoutData.fixedNode.item = changedGroupNode
    const hierarchicLayoutData = new yfiles.hierarchic.HierarchicLayoutData()
    const graph = graphComponent.graph
    hierarchicLayoutData.alternativeGroupBounds.delegate = node => {
      const masterNode = graph.foldingView.getMasterItem(node)
      return alternativeGroupBounds.get(masterNode)
    }
    hierarchicLayoutData.alternativeEdgePath.delegate = edge => {
      const masterEdge = graph.foldingView.getMasterItem(edge)
      return alternativeEdgePaths.get(masterEdge)
    }
    // mark folder nodes to treat them differently than normal nodes during layout
    hierarchicLayoutData.folderNodes.delegate = node => !graph.foldingView.isExpanded(node)
    const layoutData = new yfiles.layout.CompositeLayoutData()
    layoutData.items = yfiles.collections.List.fromArray([hierarchicLayoutData, fixNodeLayoutData])

    // Run layout
    const layoutExecutor = new yfiles.layout.LayoutExecutor(graphComponent, layout)
    layoutExecutor.layoutData = layoutData
    layoutExecutor.animateViewport = false
    layoutExecutor.easedAnimation = true
    layoutExecutor.duration = '0.5s'
    layoutExecutor
      .start()
      .then(() => {
        runningLayout = false
      })
      .catch(error => {
        runningLayout = false
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Loads a nested sample graph.
   */
  function createSampleGraph() {
    const graph = graphComponent.graph

    // initialize the node and edge styles
    DemoStyles.initDemoStyles(graph)

    const defaultFolderNodeConverter = new yfiles.graph.DefaultFolderNodeConverter()
    defaultFolderNodeConverter.copyFirstLabel = true
    // set the preferred size for folders
    defaultFolderNodeConverter.folderNodeSize = new yfiles.geometry.Size(110, 60)
    graph.foldingView.manager.folderNodeConverter = defaultFolderNodeConverter

    // create the group nodes
    const group1 = graph.createGroupNode({ labels: ['group one'] })
    const group2 = graph.createGroupNode({
      parent: group1,
      labels: ['group two']
    })
    const group3 = graph.createGroupNode({
      parent: group2,
      labels: ['group three']
    })
    const group4 = graph.createGroupNode({
      parent: group3,
      labels: ['group four']
    })
    const group5 = graph.createGroupNode({
      parent: group1,
      labels: ['group five']
    })
    const group6 = graph.createGroupNode({
      parent: group5,
      labels: ['group six']
    })

    // create the normal nodes
    const node00 = graph.createNode()
    const node01 = graph.createNode()
    const node10 = graph.createNode({ parent: group1 })
    const node11 = graph.createNode({ parent: group1 })
    const node12 = graph.createNode({ parent: group1 })
    const node20 = graph.createNode({ parent: group2 })
    const node21 = graph.createNode({ parent: group2 })
    const node22 = graph.createNode({ parent: group2 })
    const node30 = graph.createNode({ parent: group3 })
    const node31 = graph.createNode({ parent: group3 })
    const node40 = graph.createNode({ parent: group4 })
    const node41 = graph.createNode({ parent: group4 })
    const node42 = graph.createNode({ parent: group4 })
    const node50 = graph.createNode({ parent: group5 })
    const node51 = graph.createNode({ parent: group5 })
    const node60 = graph.createNode({ parent: group6 })
    const node61 = graph.createNode({ parent: group6 })
    const node62 = graph.createNode({ parent: group6 })

    // create edges
    graph.createEdge(node00, node01)
    graph.createEdge(node01, node10)
    graph.createEdge(node10, node11)
    graph.createEdge(node10, node50)
    graph.createEdge(node10, node12)
    graph.createEdge(node11, node20)
    graph.createEdge(node20, node21)
    graph.createEdge(node20, node30)
    graph.createEdge(node21, node12)
    graph.createEdge(node22, node12)
    graph.createEdge(node30, node31)
    graph.createEdge(node30, node40)
    graph.createEdge(node31, node21)
    graph.createEdge(node40, node41)
    graph.createEdge(node40, node31)
    graph.createEdge(node41, node42)
    graph.createEdge(node42, node31)
    graph.createEdge(node50, node60)
    graph.createEdge(node50, node51)
    graph.createEdge(node51, node12)
    graph.createEdge(node60, node61)
    graph.createEdge(node60, node62)
    graph.createEdge(node61, node12)
    graph.createEdge(node62, node12)

    // apply a provisional layout to have initial locations for the graph elements
    let hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.edgeLayoutDescriptor.routingStyle = new yfiles.hierarchic.RoutingStyle(
      yfiles.hierarchic.EdgeRoutingStyle.ORTHOGONAL
    )
    graph.applyLayout(hierarchicLayout)

    // collapse some groups
    graph.foldingView.collapse(group6)
    graph.foldingView.collapse(group3)

    // we need to have a special layering in order to demonstrate the concept of recursive edges
    // so, we apply a layout and we stop after layering
    hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.stopAfterLayering = true

    let hierarchicLayoutData = new yfiles.hierarchic.HierarchicLayoutData()
    hierarchicLayoutData.layerIndices = new yfiles.collections.Mapper()
    graph.applyLayout(hierarchicLayout, hierarchicLayoutData)

    const layerMapper = new yfiles.collections.Mapper()
    graph.nodes.forEach(node => {
      if (hierarchicLayoutData.layerIndices.get(node)) {
        layerMapper.set(node, hierarchicLayoutData.layerIndices.get(node))
      } else {
        layerMapper.set(node, null)
      }
    })

    // we use the layering produced by the previous layout run
    hierarchicLayoutData = new yfiles.hierarchic.HierarchicLayoutData()
    hierarchicLayoutData.givenLayersLayererIds.mapper = layerMapper
    hierarchicLayoutData.folderNodes.delegate = node => !graph.foldingView.isExpanded(node)

    // create a recursive edge
    graph.createEdge(node20, node50)

    // we apply the layout with recursive edges
    hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.recursiveGroupLayering = true
    hierarchicLayout.fromScratchLayeringStrategy = yfiles.hierarchic.LayeringStrategy.USER_DEFINED
    hierarchicLayout.edgeLayoutDescriptor.routingStyle = new yfiles.hierarchic.RoutingStyle(
      yfiles.hierarchic.EdgeRoutingStyle.ORTHOGONAL
    )
    hierarchicLayout.edgeLayoutDescriptor.recursiveEdgeStyle =
      yfiles.hierarchic.RecursiveEdgeStyle.DIRECTED
    // apply a layout and move it to the top of the graph component
    graph.applyLayout(hierarchicLayout, hierarchicLayoutData)
    centerAtTop(graphComponent)
  }

  /**
   * Fits the graph into the component and moves it to the top.
   */
  function centerAtTop() {
    // first fit the graph bounds
    graphComponent.fitGraphBounds()

    // then move the graph upwards
    const viewport = graphComponent.viewport
    const contentRect = graphComponent.contentRect
    graphComponent.viewPoint = new yfiles.geometry.Point(viewport.x, contentRect.y - 20)
    graphComponent.invalidate()
  }

  /**
   * Binds the toolbar elements to commands and listeners to be able to react to interactive changes.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindAction("button[data-command='FitContent']", () => centerAtTop(graphComponent))
  }

  // run the demo
  run()
})
