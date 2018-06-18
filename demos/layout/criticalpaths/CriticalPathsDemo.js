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
  'resources/SampleData.js',
  './PriorityPanel.js',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'yfiles/layout-tree',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  SampleData,
  PriorityPanel
) => {
  /**
   * The graph component in which the graph is displayed.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * A popup panel to change the priority of edges.
   * @type {PriorityPanel}
   */
  let priorityPanel = null

  /**
   * Flag that prevents re-entrant layout runs.
   * @type {boolean}
   */
  let layoutRunning = false

  /**
   * The current layout algorithm.
   * @type {'hierarchic'|'tree'}
   */
  let layoutStyle = 'hierarchic'

  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    initializeInputMode()
    initializePriorityPanel()
    loadGraph(layoutStyle)
    registerCommands()

    app.show(graphComponent)
  }

  /**
   * Loads the sample graph which initially provides some priorities.
   * @param {'hierarchic'|'tree'} sample
   */
  function loadGraph(sample) {
    const graph = graphComponent.graph
    graph.nodeDefaults.style = new DemoStyles.DemoNodeStyle()
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle()
    graph.edgeDefaults.shareStyleInstance = false

    const data = SampleData[sample]

    const builder = new yfiles.binding.GraphBuilder(graph)
    builder.nodesSource = data.nodes
    builder.edgesSource = data.edges
    builder.sourceNodeBinding = 'source'
    builder.targetNodeBinding = 'target'
    builder.nodeIdBinding = 'id'

    builder.buildGraph()

    graph.edges.forEach(edge => setPriority(edge, edge.tag.priority || 0))

    graphComponent.fitGraphBounds()

    runLayout()
  }

  /**
   * Specifies the priority of the given edge.
   * @param {yfiles.graph.IEdge} edge
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
   * @return {yfiles.view.Stroke}
   */
  function getStroke(priority) {
    switch (priority) {
      case 1:
        return new yfiles.view.Stroke('gold', 3)
      case 2:
        return new yfiles.view.Stroke('orange', 3)
      case 3:
        return new yfiles.view.Stroke('darkorange', 3)
      case 4:
        return new yfiles.view.Stroke('orangered', 3)
      case 5:
        return new yfiles.view.Stroke('firebrick', 3)
      default:
        return new yfiles.view.Stroke(51, 102, 153, 255, 1)
    }
  }

  /**
   * Applies a hierarchic layout considering the edge priorities.
   */
  function runLayout() {
    if (layoutRunning) {
      return
    }
    layoutRunning = true

    const { layout, layoutData } =
      layoutStyle === 'hierarchic' ? configureHierarchicLayout() : configureTreeLayout()

    graphComponent.morphLayout(layout, '700ms', layoutData).then(() => {
      if (layoutStyle === 'tree') {
        graphComponent.graph.mapperRegistry.removeMapper(
          yfiles.tree.TreeLayout.CRITICAL_EDGE_DP_KEY
        )
      }
      layoutRunning = false
    })
  }

  /**
   * Returns a configured hierarchic layout considering the edge priorities.
   */
  function configureHierarchicLayout() {
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.orthogonalRouting = true
    layout.edgeLayoutDescriptor.minimumFirstSegmentLength = 30
    layout.edgeLayoutDescriptor.minimumLastSegmentLength = 30
    layout.nodePlacer.barycenterMode = true
    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    layoutData.criticalEdgePriorities.delegate = edge => {
      if (edge.tag) {
        return edge.tag.priority || 0
      }
      return 0
    }

    return {
      layout,
      layoutData
    }
  }

  /**
   * Returns a configured tree layout considering the edge priorities.
   */
  function configureTreeLayout() {
    const layout = new yfiles.tree.TreeLayout()
    const layeredNodePlacer = new yfiles.tree.LayeredNodePlacer()
    layeredNodePlacer.layerSpacing = 60
    layeredNodePlacer.spacing = 30
    layout.defaultNodePlacer = layeredNodePlacer

    graphComponent.graph.mapperRegistry.createDelegateMapper(
      yfiles.tree.TreeLayout.CRITICAL_EDGE_DP_KEY,
      edge => {
        if (edge.tag) {
          return edge.tag.priority || 0
        }
        return 0
      }
    )

    return {
      layout,
      layoutData: null
    }
  }

  /**
   * Marks random upstream paths from leaf nodes to generate random long paths.
   */
  function markRandomPredecessorsPaths() {
    if (layoutRunning) {
      return
    }

    const leafs = graphComponent.graph.nodes.filter(node => {
      return graphComponent.graph.outEdgesAt(node).size === 0
    })

    // clear priorities
    graphComponent.graph.edges.forEach(edge => {
      setPriority(edge, 0)
    })

    // mark the upstream path of random leaf nodes
    let randomNodeCount = Math.min(10, leafs.size)
    while (randomNodeCount > 0) {
      randomNodeCount--
      const rndNodeIdx = Math.floor(Math.random() * leafs.size)
      const rndPriority = Math.floor(Math.random() * 5) + 1
      markPredecessorsPath(leafs.elementAt(rndNodeIdx), rndPriority)
    }

    runLayout()
  }

  /**
   * Marks the upstream path from a given node.
   * @param {yfiles.graph.INode} node
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

  function initializeInputMode() {
    graphComponent.inputMode = new yfiles.input.GraphViewerInputMode({
      selectableItems: yfiles.graph.GraphItemTypes.EDGE | yfiles.graph.GraphItemTypes.NODE,
      toolTipItems: yfiles.graph.GraphItemTypes.EDGE
    })
    graphComponent.inputMode.addQueryItemToolTipListener((sender, event) => {
      if (!event.handled) {
        const node = event.item
        event.toolTip = `Priority: ${node.tag.priority || 0}`
        event.handled = true
      }
    })
  }

  function initializePriorityPanel() {
    priorityPanel = new PriorityPanel(graphComponent)
    priorityPanel.itemPriorityChanged = (item, newPriority) => {
      if (yfiles.graph.IEdge.isInstance(item)) {
        setPriority(item, newPriority)
      } else if (yfiles.graph.INode.isInstance(item)) {
        markPredecessorsPath(item, newPriority)
      }
      graphComponent.selection.clear()
    }
    priorityPanel.priorityChanged = () => {
      runLayout()
    }
    graphComponent.selection.addItemSelectionChangedListener((src, args) => {
      if (yfiles.graph.INode.isInstance(args.item)) {
        priorityPanel.currentItems = graphComponent.selection.selectedNodes.toArray()
      } else {
        priorityPanel.currentItems = graphComponent.selection.selectedEdges.toArray()
      }
    })
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindAction("button[data-command='RandomPredecessorsPaths']", markRandomPredecessorsPaths)
    app.bindAction("button[data-command='ClearPriorities']", clearPriorities)

    app.bindChangeListener("select[data-command='ChangeSample']", value => {
      layoutStyle = value === 'Hierarchic Layout' ? 'hierarchic' : 'tree'
      loadGraph(layoutStyle)
      runLayout()
    })
  }

  run()
})
