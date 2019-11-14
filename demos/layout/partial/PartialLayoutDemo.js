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
  'yfiles/view-editor',
  'resources/demo-app',
  'resources/demo-styles',
  'yfiles/view-graphml',
  'yfiles/view-folding',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'yfiles/layout-orthogonal',
  'yfiles/layout-organic',
  'yfiles/router-polyline',
  'yfiles/router-other',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles) => {
  let graphComponent = null

  let partialNodesMapper = null
  let partialEdgesMapper = null

  let partialNodeStyle = null
  let partialGroupStyle = null
  let partialEdgeStyle = null
  let fixedNodeStyle = null
  let fixedGroupNodeStyle = null
  let fixedEdgeStyle = null

  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // initialize default styles
    initializeGraph()

    // initialize interactive behavior
    initializeInputModes()

    // bind toolbar buttons to actions
    registerCommands()

    // load the first scenario
    loadScenario()

    app.show(graphComponent)
  }

  /**
   * Runs a partial layout considering all selected options and partial/fixed nodes.
   */
  function runLayout() {
    setUIDisabled(true)

    // configure layout
    const subgraphLayout = getSubgraphLayout()
    const partialLayout = new yfiles.partial.PartialLayout(subgraphLayout)
    partialLayout.componentAssignmentStrategy = getComponentAssignmentStrategy()
    partialLayout.subgraphPlacement = getSubgraphPlacement()
    partialLayout.edgeRoutingStrategy = getEdgeRoutingStrategy()
    partialLayout.layoutOrientation = getLayoutOrientation()
    const distance = Number.parseFloat(document.getElementById('node-distance').value)
    partialLayout.minimumNodeDistance = Number.isNaN(distance) ? 0 : distance
    partialLayout.allowMirroring = document.getElementById('mirroring').checked
    partialLayout.considerNodeAlignment = document.getElementById('snapping').checked

    // mark partial elements for the layout algorithm
    const partialLayoutData = new yfiles.partial.PartialLayoutData()
    partialLayoutData.affectedNodes.delegate = node => !isFixed(node)
    partialLayoutData.affectedEdges.delegate = edge => !isFixed(edge)

    // run layout algorithm
    graphComponent
      .morphLayout(partialLayout, '0.5s', partialLayoutData)
      .then(() => {
        setUIDisabled(false)
      })
      .catch(() => {
        setUIDisabled(false)
      })
  }

  /**
   * Retrieves the selected layout for partial components.
   * @return {yfiles.layout.ILayoutAlgorithm}
   */
  function getSubgraphLayout() {
    const distance = Number.parseFloat(document.getElementById('node-distance').value)
    const layout = document.getElementById('subgraph-layout').value
    switch (layout) {
      default:
      case 'Hierarchic': {
        const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
        hierarchicLayout.minimumLayerDistance = distance
        hierarchicLayout.minimumNodeDistance = distance
        return hierarchicLayout
      }
      case 'Orthogonal': {
        const orthogonalLayout = new yfiles.orthogonal.OrthogonalLayout()
        orthogonalLayout.gridSpacing = distance
        return orthogonalLayout
      }
      case 'Organic': {
        const organicLayout = new yfiles.organic.OrganicLayout()
        organicLayout.minimumNodeDistance = distance
        return organicLayout
      }
      case 'Circular': {
        const circularLayout = new yfiles.circular.CircularLayout()
        circularLayout.singleCycleLayout.minimumNodeDistance = distance
        circularLayout.balloonLayout.minimumNodeDistance = distance
        return circularLayout
      }
    }
  }

  /**
   * Retrieves the assignment strategy, either single nodes or components.
   * @return {yfiles.partial.ComponentAssignmentStrategy}
   */
  function getComponentAssignmentStrategy() {
    const componentAssignment = document.getElementById('component-assignment').value
    switch (componentAssignment) {
      default:
      case 'Single':
        return yfiles.partial.ComponentAssignmentStrategy.SINGLE
      case 'Connected':
        return yfiles.partial.ComponentAssignmentStrategy.CONNECTED
    }
  }

  /**
   * Retrieves the positioning strategy, either nodes are place close to the barycenter of their neighbors or their
   * initial location.
   * @return {yfiles.partial.SubgraphPlacement}
   */
  function getSubgraphPlacement() {
    const placement = document.getElementById('subgraph-positioning').value
    switch (placement) {
      default:
      case 'Barycenter':
        return yfiles.partial.SubgraphPlacement.BARYCENTER
      case 'From Sketch':
        return yfiles.partial.SubgraphPlacement.FROM_SKETCH
    }
  }

  /**
   * Retrieves the edge routing strategy for partial edges and edges connected to partial nodes.
   * @return {yfiles.partial.EdgeRoutingStrategy}
   */
  function getEdgeRoutingStrategy() {
    const edgeRouting = document.getElementById('edge-routing-style').value
    switch (edgeRouting) {
      default:
      case 'Automatic':
        return yfiles.partial.EdgeRoutingStrategy.AUTOMATIC
      case 'Orthogonal':
        return yfiles.partial.EdgeRoutingStrategy.ORTHOGONAL
      case 'Straightline':
        return yfiles.partial.EdgeRoutingStrategy.STRAIGHTLINE
      case 'Organic':
        return yfiles.partial.EdgeRoutingStrategy.ORGANIC
      case 'Octilinear':
        return yfiles.partial.EdgeRoutingStrategy.OCTILINEAR
    }
  }

  /**
   * Retrieves the layout orientation for partial components.
   * @return {yfiles.partial.LayoutOrientation}
   */
  function getLayoutOrientation() {
    const orientation = document.getElementById('layout-orientation').value
    switch (orientation) {
      default:
      case 'None':
        return yfiles.partial.LayoutOrientation.NONE
      case 'Auto-detect':
        return yfiles.partial.LayoutOrientation.AUTO_DETECT
      case 'Top to Bottom':
        return yfiles.partial.LayoutOrientation.TOP_TO_BOTTOM
      case 'Bottom to Top':
        return yfiles.partial.LayoutOrientation.BOTTOM_TO_TOP
      case 'Left to Right':
        return yfiles.partial.LayoutOrientation.LEFT_TO_RIGHT
      case 'Right to Left':
        return yfiles.partial.LayoutOrientation.RIGHT_TO_LEFT
    }
  }

  /**
   * Activates folding, sets the defaults for new graph elements and registers mappers
   */
  function initializeGraph() {
    const foldingManager = new yfiles.graph.FoldingManager()
    graphComponent.graph = foldingManager.createFoldingView().graph

    // initialize styles
    partialNodeStyle = new DemoStyles.DemoNodeStyle()
    partialGroupStyle = new DemoStyles.DemoGroupStyle()
    partialGroupStyle.isCollapsible = true
    partialEdgeStyle = new DemoStyles.DemoEdgeStyle()
    partialEdgeStyle.cssClass = 'partial-edge'
    fixedNodeStyle = new DemoStyles.DemoNodeStyle()
    fixedNodeStyle.cssClass = 'fixed-node'
    fixedGroupNodeStyle = new DemoStyles.DemoGroupStyle()
    fixedGroupNodeStyle.cssClass = 'fixed-group-node'
    fixedGroupNodeStyle.isCollapsible = true
    fixedEdgeStyle = new DemoStyles.DemoEdgeStyle()
    fixedEdgeStyle.cssClass = 'fixed-edge'

    const graph = graphComponent.graph
    graphComponent.navigationCommandsEnabled = true

    graph.nodeDefaults.size = new yfiles.geometry.Size(60, 30)
    graph.nodeDefaults.style = partialNodeStyle
    graph.edgeDefaults.style = partialEdgeStyle

    const labelModel = new yfiles.graph.InteriorStretchLabelModel({ insets: 4 })
    graph.groupNodeDefaults.labels.layoutParameter = labelModel.createParameter(
      yfiles.graph.InteriorStretchLabelModelPosition.NORTH
    )
    graph.groupNodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      horizontalTextAlignment: 'left',
      textFill: 'white'
    })
    graph.groupNodeDefaults.style = partialGroupStyle

    // Create and register mappers that specify partial graph elements
    partialNodesMapper = new yfiles.collections.Mapper({ defaultValue: true })
    partialEdgesMapper = new yfiles.collections.Mapper({ defaultValue: true })
  }

  /**
   * Configures input modes to interact with the graph structure.
   */
  function initializeInputModes() {
    const inputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true,
      allowEditLabel: false
    })
    inputMode.addItemDoubleClickedListener((sender, args) => {
      // a graph element was double clicked => toggle its fixed/partial state
      setFixed(args.item, !isFixed(args.item))
    })
    // add a label to newly created nodes and mark the node as non-fixed
    inputMode.addNodeCreatedListener((sender, args) => {
      const node = args.item
      const graph = graphComponent.graph
      if (graph.isGroupNode(node)) {
        graph.addLabel(node, 'Group')
      } else {
        graph.addLabel(node, graph.nodes.size.toString())
      }
      setFixed(node, false)
    })
    inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
      setFixed(args.item, false)
    })
    inputMode.navigationInputMode.addGroupCollapsedListener((sender, args) => {
      const group = args.item
      updateStyle(group, isFixed(group))
    })
    inputMode.navigationInputMode.addGroupExpandedListener((sender, args) => {
      const group = args.item
      updateStyle(group, isFixed(group))
    })
    graphComponent.inputMode = inputMode
  }

  /**
   * Sets the given item as fixed or movable and changes its color to indicate its new state.
   */
  function setFixed(item, fixed) {
    const masterItem = getMasterItem(item)
    if (yfiles.graph.INode.isInstance(item)) {
      partialNodesMapper.set(masterItem, !fixed)
      updateStyle(item, fixed)
    } else if (yfiles.graph.IEdge.isInstance(item)) {
      partialEdgesMapper.set(masterItem, !fixed)
      updateStyle(item, fixed)
    }
  }

  /**
   * Returns if a given item is considered fixed or shall be rearranged by the layout algorithm.
   * Note that an edge always gets rerouted if any of its end nodes may be moved.
   */
  function isFixed(item) {
    const masterItem = getMasterItem(item)
    if (yfiles.graph.INode.isInstance(item)) {
      return !partialNodesMapper.get(masterItem)
    } else if (yfiles.graph.IEdge.isInstance(item)) {
      return !partialEdgesMapper.get(masterItem)
    }
    return false
  }

  /**
   * Returns the master item for the given item.
   * Since folding is supported in this demo, partial/fixed states are stored for the master items to stay consistent
   * when expanding/collapsing group nodes.
   * @param {yfiles.graph.IModelItem} item
   * @return {yfiles.graph.IModelItem}
   */
  function getMasterItem(item) {
    const graph = graphComponent.graph
    if (graph.foldingView.manager.masterGraph.contains(item)) {
      return item
    }
    if (graph.contains(item)) {
      return graph.foldingView.getMasterItem(item)
    }
    return null
  }

  /**
   * Updates the style of the given item when the partial/fixed state has changed.
   * @param {yfiles.graph.IModelItem} item
   * @param {boolean} fixed
   */
  function updateStyle(item, fixed) {
    const graph = graphComponent.graph
    if (yfiles.graph.INode.isInstance(item)) {
      const masterGraph = graph.foldingView.manager.masterGraph
      if (masterGraph.isGroupNode(graph.foldingView.getMasterItem(item))) {
        graph.setStyle(item, fixed ? fixedGroupNodeStyle : partialGroupStyle)
      } else {
        graph.setStyle(item, fixed ? fixedNodeStyle : partialNodeStyle)
      }
    } else if (yfiles.graph.IEdge.isInstance(item)) {
      graph.setStyle(item, fixed ? fixedEdgeStyle : partialEdgeStyle)
    }
  }

  /**
   * Updates the partial/fixed state of all graph elements that are currently selected.
   * @param {boolean} fixed
   */
  function setSelectionFixed(fixed) {
    const selection = graphComponent.selection
    selection.selectedNodes.forEach(node => {
      setFixed(node, fixed)
    })
    selection.selectedEdges.forEach(edge => {
      setFixed(edge, fixed)
    })
  }

  /**
   * Binds commands to the buttons in the toolbar.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)

    app.bindAction("button[data-command='LockSelection']", () => {
      setSelectionFixed(true)
    })
    app.bindAction("button[data-command='UnlockSelection']", () => {
      setSelectionFixed(false)
    })
    app.bindAction("button[data-command='Layout']", runLayout)

    app.bindChangeListener("select[data-command='SelectSample']", loadScenario)
    app.bindAction("button[data-command='Refresh']", loadScenario)
  }

  /**
   * Loads one of four scenarios that come with a sample graph and a layout configuration.
   */
  function loadScenario() {
    partialNodesMapper.clear()
    partialEdgesMapper.clear()

    const ioHandler = new yfiles.graphml.GraphMLIOHandler()
    ioHandler.addInputMapper(
      yfiles.graph.INode.$class,
      yfiles.lang.Boolean.$class,
      yfiles.partial.PartialLayout.AFFECTED_NODES_DP_KEY.name,
      partialNodesMapper
    )
    ioHandler.addInputMapper(
      yfiles.graph.IEdge.$class,
      yfiles.lang.Boolean.$class,
      yfiles.partial.PartialLayout.AFFECTED_EDGES_DP_KEY.name,
      partialEdgesMapper
    )

    const sample = document
      .getElementById('select-sample')
      .value.substring(10)
      .toLowerCase()
    const path = `resources/${sample}.graphml`
    switch (sample) {
      default:
      case 'Hierarchic':
        setOptions(
          'Hierarchic',
          'Connected',
          'Barycenter',
          'Orthogonal',
          'Top to Bottom',
          5,
          true,
          true
        )
        break
      case 'Orthogonal':
        setOptions('Orthogonal', 'Single', 'Barycenter', 'Orthogonal', 'None', 20, false, true)
        break
      case 'Organic':
        setOptions('Organic', 'Single', 'Barycenter', 'Automatic', 'None', 30, true, false)
        break
      case 'Circular':
        setOptions('Circular', 'Connected', 'Barycenter', 'Automatic', 'None', 10, true, false)
        break
    }

    const graph = graphComponent.graph
    app.readGraph(ioHandler, graph, path).then(() => {
      graph.nodes.forEach(node => {
        const fixed = isFixed(node)
        updateStyle(node, fixed)
      })
      graph.edges.forEach(edge => {
        updateStyle(edge, isFixed(edge))
      })
      graphComponent.fitGraphBounds()
    })
  }

  /**
   * Update the options according to the current scenario.
   * @param {string} subgraphLayout
   * @param {string} componentAssignmentStrategy
   * @param {string} subgraphPlacement
   * @param {string} edgeRoutingStrategy
   * @param {string} layoutOrientation
   * @param {number} minimunNodeDistance
   * @param {boolean} allowMirroring
   * @param {boolean} nodeSnapping
   */
  function setOptions(
    subgraphLayout,
    componentAssignmentStrategy,
    subgraphPlacement,
    edgeRoutingStrategy,
    layoutOrientation,
    minimunNodeDistance,
    allowMirroring,
    nodeSnapping
  ) {
    app.setComboboxValue('subgraph-layout', subgraphLayout)
    app.setComboboxValue('component-assignment', componentAssignmentStrategy)
    app.setComboboxValue('subgraph-positioning', subgraphPlacement)
    app.setComboboxValue('edge-routing-style', edgeRoutingStrategy)
    app.setComboboxValue('layout-orientation', layoutOrientation)
    document.getElementById('node-distance').value = minimunNodeDistance
    document.getElementById('mirroring').value = allowMirroring
    document.getElementById('snapping').value = nodeSnapping
  }

  /**
   * Enables/disables the buttons in the toolbar and the input mode. This is used for managing the toolbar during
   * layout calculation.
   * @param {boolean} disabled
   */
  function setUIDisabled(disabled) {
    document.getElementById('lock-selection').disabled = disabled
    document.getElementById('unlock-selection').disabled = disabled
    document.getElementById('select-sample').disabled = disabled
    document.getElementById('refresh').disabled = disabled
    document.getElementById('layout').disabled = disabled
  }

  // run the demo
  run()
})
