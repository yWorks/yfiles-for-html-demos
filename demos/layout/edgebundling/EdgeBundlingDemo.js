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

/* eslint-disable global-require */

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
  './DemoStyles.js',
  'utils/ContextMenu',
  'yfiles/layout-organic',
  'yfiles/layout-tree',
  'yfiles/layout-radial',
  'yfiles/router-other',
  'yfiles/view-layout-bridge',
  'yfiles/view-graphml',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, ContextMenu) => {
  /**
   * The GraphComponent
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Holds the component index for each node.
   * It is necessary for determining in circular layouts the circle id in graphs with more than one connected
   * components.
   * @type {yfiles.collections.Mapper}
   */
  const componentsMap = new yfiles.collections.Mapper()

  /**
   * Holds the edge bundle descriptors for each edge.
   * @type {yfiles.collections.Mapper}
   */
  const bundleDescriptorMap = new yfiles.collections.Mapper()

  const bundlesMap = new yfiles.collections.Mapper()

  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // create the input mode
    createInputMode()

    // set the default styles
    initializeGraph()

    // load the sample graph and run the layout
    onSampleChanged()

    // wire up the UI
    registerCommands()

    // initialize the demo
    app.show(graphComponent)
  }

  /**
   * Creates the input mode.
   */
  function createInputMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      focusableItems: yfiles.graph.GraphItemTypes.NONE,
      showHandleItems: yfiles.graph.GraphItemTypes.NONE,
      // disable node moving
      movableItems: yfiles.graph.GraphItemTypes.NONE
    })

    // disallow interactive bend creation
    mode.allowCreateBend = false

    // when an item is deleted, calculate the new components and apply the layout
    mode.addDeletedSelectionListener(() => {
      calculateConnectedComponents()
      applyLayout(false)
    })

    // when an edge is created, calculate the new components and apply the layout
    mode.createEdgeInputMode.addEdgeCreatedListener(() => {
      calculateConnectedComponents()
      applyLayout(false)
    })

    // when a node is created, calculate the new components
    mode.addNodeCreatedListener(() => {
      calculateConnectedComponents()
    })

    // when a drag operation has finished, apply a layout
    mode.moveInputMode.addDragFinishedListener(() => {
      applyLayout()
    })

    mode.itemHoverInputMode.hoverItems =
      yfiles.graph.GraphItemTypes.NODE | yfiles.graph.GraphItemTypes.EDGE
    mode.itemHoverInputMode.discardInvalidItems = false
    mode.itemHoverInputMode.hoverCursor = yfiles.view.Cursor.POINTER
    mode.itemHoverInputMode.addHoveredItemChangedListener((sender, args) => {
      const item = args.item
      const highlightIndicatorManager = graphComponent.highlightIndicatorManager
      highlightIndicatorManager.clearHighlights()
      if (item) {
        highlightIndicatorManager.addHighlight(item)
        if (yfiles.graph.INode.isInstance(item)) {
          graphComponent.graph.edgesAt(item).forEach(edge => {
            highlightIndicatorManager.addHighlight(edge)
          })
        } else if (yfiles.graph.IEdge.isInstance(item)) {
          highlightIndicatorManager.addHighlight(item.sourceNode)
          highlightIndicatorManager.addHighlight(item.targetNode)
        }
      }
    })

    // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
    // context menu widget as well. See the Context Menu demo for more details about working with context menus.
    const contextMenu = new ContextMenu(graphComponent)

    // Add event listeners to the various events that open the context menu. These listeners then
    // call the provided callback function which in turn asks the current ContextMenuInputMode if a
    // context menu should be shown at the current location.
    contextMenu.addOpeningEventListeners(graphComponent, location => {
      if (mode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
        contextMenu.show(location)
      }
    })

    // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
    // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
    mode.addPopulateItemContextMenuListener((sender, args) =>
      populateContextMenu(contextMenu, args)
    )

    // Add a listener that closes the menu when the input mode requests this
    mode.contextMenuInputMode.addCloseMenuListener(() => {
      contextMenu.close()
    })

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.onClosedCallback = () => {
      mode.contextMenuInputMode.menuClosed()
    }

    graphComponent.inputMode = mode
  }

  /**
   * Populates the context menu based on the item the mouse hovers over
   * @param {object} contextMenu The context menu.
   * @param {yfiles.input.PopulateItemContextMenuEventArgs} args The event args.
   */
  function populateContextMenu(contextMenu, args) {
    // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
    // for this item (or more generally, the location provided by the event args).
    // If you don't want to show a context menu for some locations, set 'false' in this cases.
    args.showMenu = true

    contextMenu.clearItems()

    // In this demo, we use the following custom hit testing to prefer nodes.
    const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

    // Check whether an edge was hit
    const hit = hits.firstOrDefault()

    if (yfiles.graph.IEdge.isInstance(hit) || yfiles.graph.INode.isInstance(hit)) {
      let selectedEdges

      if (yfiles.graph.IEdge.isInstance(hit)) {
        // update the hit edge and all other possible selected edges
        selectedEdges = graphComponent.selection.selectedEdges.toArray()
        selectedEdges.push(hit)
      } else {
        // update the hit node and all other possible selected nodes and update their adjacent edges
        const selectedNodes = graphComponent.selection.selectedNodes.toArray()
        selectedNodes.push(hit)

        selectedEdges = []
        selectedNodes.forEach(node => {
          if (graphComponent.graph.degree(node) > 0) {
            selectedEdges = selectedEdges.concat(graphComponent.graph.edgesAt(node).toArray())
          }
        })
      }

      const result = countBundledEdges(selectedEdges)
      if (result.countUnbundled > 0) {
        const text = yfiles.graph.IEdge.isInstance(hit)
          ? 'Bundle Selected Edges'
          : 'Bundle Edges At Selected Nodes'
        contextMenu.addMenuItem(text, () => updateBundlingForSelectedEdges(selectedEdges, true))
      }
      if (result.countBundled > 0) {
        const text = yfiles.graph.IEdge.isInstance(hit)
          ? 'Un-bundle Selected Edges'
          : 'Un-bundle Edges At Selected Nodes'
        contextMenu.addMenuItem(text, () => updateBundlingForSelectedEdges(selectedEdges, false))
      }
    } else {
      args.showMenu = false
    }
  }

  /**
   * Counts the number of bundled and unbundled edges of a given selection.
   * @param {Array} edges The selected edges
   * @return {Object} The number of bundled and unbundled edges as an object
   *
   */
  function countBundledEdges(edges) {
    let countBundled = 0
    let countUnbundled = 0

    edges.forEach(edge => {
      if (bundlesMap.get(edge)) {
        countBundled++
      }

      if (!bundlesMap.get(edge)) {
        countUnbundled++
      }
    })
    return {
      countBundled,
      countUnbundled
    }
  }

  /**
   * Enables or disables the edge bundling for the given edge.
   * @param {Array} edges The edges to update
   * @param {boolean} isBundled True if the edges should be bundled, false otherwise
   */
  function updateBundlingForSelectedEdges(edges, isBundled) {
    edges.forEach(edge => {
      bundlesMap.set(edge, isBundled)
      if (!isBundled) {
        const descriptor = new yfiles.layout.EdgeBundleDescriptor()
        descriptor.bundled = isBundled
        bundleDescriptorMap.set(edge, descriptor)
      } else {
        // if null is set, the default descriptor will be used
        bundleDescriptorMap.set(edge, null)
      }
    })
    applyLayout()
  }

  /**
   * Sets the default styles for the graph elements and initializes the highlight.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    // set the node and edge default styles
    graph.nodeDefaults.style = new DemoStyles.DemoNodeStyle()
    graph.edgeDefaults.style = new DemoStyles.DemoEdgeStyle()

    // hide the selection decorator
    graph.decorator.nodeDecorator.selectionDecorator.hideImplementation()
    graph.decorator.edgeDecorator.selectionDecorator.hideImplementation()

    // initialize the edge highlight manager
    graphComponent.highlightIndicatorManager = new DemoStyles.HighlightManager(graphComponent)

    // when a node is selected, select also the adjacent edges
    graphComponent.selection.addItemSelectionChangedListener((sender, args) => {
      const item = args.item
      const selection = graphComponent.selection
      if (yfiles.graph.INode.isInstance(item) && args.itemSelected) {
        selection.setSelected(item, true)
        graph.edgesAt(item).forEach(edge => {
          selection.setSelected(edge, true)
        })
      }
    })
  }

  /**
   * Called when the selected item in the graph chooser combo box has changed.
   */
  function onSampleChanged() {
    const samplesComboBox = document.getElementById('sample-combo-box')
    let fileName
    switch (samplesComboBox.selectedIndex) {
      default:
      case LayoutAlgorithm.SINGLE_CYCLE:
        fileName = 'circular'
        break
      case LayoutAlgorithm.CIRCULAR:
        fileName = 'bccCircular'
        break
      case LayoutAlgorithm.RADIAL:
        fileName = 'radial'
        break
      case LayoutAlgorithm.BALLOON:
        fileName = 'balloon'
        break
      case LayoutAlgorithm.TREE:
        fileName = 'tree'
        break
    }
    // clear the current graph
    graphComponent.graph.clear()
    // set the UI busy
    setBusy(true)

    // require the source file and load the graph
    require([`resources/${fileName}.js`], sampleData => {
      loadGraph(graphComponent.graph, sampleData)
      runLayout()
    })
  }

  /**
   * Parses the JSON and creates the graph elements.
   * @param {yfiles.graph.IGraph} graph The graph to populate with the items.
   * @param {string} graphData The JSON data
   */
  function loadGraph(graph, graphData) {
    setBusy(true)

    graph.clear()

    const builder = new yfiles.binding.GraphBuilder(graph)
    builder.nodesSource = graphData.nodes
    builder.edgesSource = graphData.edges
    builder.sourceNodeBinding = 'source'
    builder.targetNodeBinding = 'target'
    builder.nodeIdBinding = 'id'
    graph = builder.buildGraph()

    graph.edges.forEach(edge => {
      bundlesMap.set(edge, true)
    })

    // calculate the connected components of the new graph
    calculateConnectedComponents()
  }

  /**
   * Runs the layout.
   */
  function runLayout() {
    const selectedIndex = document.getElementById('sample-combo-box').selectedIndex
    let layoutAlgorithm
    let layoutData
    switch (selectedIndex) {
      default:
      case 0:
      case 1: {
        layoutAlgorithm = createCircularLayout(selectedIndex === 0)
        layoutData = new yfiles.circular.CircularLayoutData()
        layoutData.circleIds = new yfiles.collections.Mapper()
        layoutData.edgeBundleDescriptors.mapper = bundleDescriptorMap
        break
      }
      case 2: {
        layoutAlgorithm = createRadialLayout()
        layoutData = new yfiles.radial.RadialLayoutData()
        layoutData.edgeBundleDescriptors.mapper = bundleDescriptorMap
        break
      }
      case 3:
      case 4: {
        layoutAlgorithm = selectedIndex === 3 ? createBalloonLayout() : createTreeLayout()
        const treeReductionStageData = new yfiles.tree.TreeReductionStageData()
        treeReductionStageData.edgeBundleDescriptors.mapper = bundleDescriptorMap
        layoutData = new yfiles.layout.CompositeLayoutData()
        layoutData.items = yfiles.collections.List.fromArray([treeReductionStageData])
        break
      }
    }

    // to apply bezier fitting, append the CurveFittingLayoutStage to the layout algorithm
    // we could also enable the bezier fitting from the edge bundling descriptor but, we would like for this demo to
    // have small error
    const curveFittingStage = new yfiles.layout.CurveFittingLayoutStage()
    curveFittingStage.maximumError = 1
    layoutAlgorithm.prependStage(curveFittingStage)

    // run the layout
    graphComponent.morphLayout(layoutAlgorithm, '0.1s', layoutData).then(() => {
      setBusy(false)
      // if the selected algorithm is circular, change the node style to circular sectors
      if (
        selectedIndex === LayoutAlgorithm.SINGLE_CYCLE ||
        selectedIndex === LayoutAlgorithm.CIRCULAR
      ) {
        updateNodeInformation(layoutData)
      }
    })
  }

  /**
   * Creates and configures the circular layout algorithm.
   * @param {boolean} singleCycle True if the layout should be single-cycle, false otherwise
   * @return {yfiles.circular.CircularLayout} The configured circular layout algorithm
   */
  function createCircularLayout(singleCycle) {
    const circularLayout = new yfiles.circular.CircularLayout()
    if (singleCycle) {
      circularLayout.layoutStyle = yfiles.circular.LayoutStyle.SINGLE_CYCLE
      circularLayout.singleCycleLayout.minimumNodeDistance = 0
    }
    circularLayout.labelingEnabled = true
    configureEdgeBundling(circularLayout)
    return circularLayout
  }

  /**
   * Creates and configures the radial layout algorithm.
   * @return {yfiles.radial.RadialLayout} The configured radial layout algorithm
   */
  function createRadialLayout() {
    const radialLayout = new yfiles.radial.RadialLayout()
    radialLayout.labelingEnabled = true
    configureEdgeBundling(radialLayout)
    return radialLayout
  }

  /**
   * Creates and configures the balloon layout algorithm.
   * @return {yfiles.tree.BalloonLayout} The configured balloon layout algorithm
   */
  function createBalloonLayout() {
    const balloonLayout = new yfiles.tree.BalloonLayout()
    balloonLayout.integratedEdgeLabeling = true
    balloonLayout.integratedNodeLabeling = true
    const treeReductionStage = createTreeReductionStage()
    configureEdgeBundling(treeReductionStage)
    balloonLayout.prependStage(treeReductionStage)
    return balloonLayout
  }

  /**
   * Creates and configures the tree layout algorithm.
   * @return {yfiles.tree.ClassicTreeLayout} The configured tree layout algorithm
   */
  function createTreeLayout() {
    const treeLayout = new yfiles.tree.TreeLayout()
    treeLayout.defaultNodePlacer.routingStyle = yfiles.tree.RoutingStyle.STRAIGHT
    treeLayout.considerNodeLabels = true
    treeLayout.integratedEdgeLabeling = true
    const treeReductionStage = createTreeReductionStage()
    configureEdgeBundling(treeReductionStage)
    treeLayout.prependStage(treeReductionStage)
    return treeLayout
  }

  /**
   * Creates and configures the tree reduction stage.
   * @return {yfiles.tree.TreeReductionStage}
   */
  function createTreeReductionStage() {
    const treeReductionStage = new yfiles.tree.TreeReductionStage()
    treeReductionStage.nonTreeEdgeRouter = new yfiles.router.OrganicEdgeRouter()
    treeReductionStage.nonTreeEdgeSelectionKey =
      yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    const labelingAlgorithm = new yfiles.labeling.GenericLabeling()
    labelingAlgorithm.affectedLabelsDpKey = 'AFFECTED_LABELS'
    treeReductionStage.nonTreeEdgeLabelingAlgorithm = labelingAlgorithm
    treeReductionStage.nonTreeEdgeLabelSelectionKey = labelingAlgorithm.affectedLabelsDpKey
    return treeReductionStage
  }

  /**
   * Configures the edge bundling descriptor.
   * @param {yfiles.layout.ILayoutAlgorithm} layoutAlgorithm The layout algorithm to integrate the edge bundling
   */
  function configureEdgeBundling(layoutAlgorithm) {
    const bundlingDescriptor = new yfiles.layout.EdgeBundleDescriptor()
    bundlingDescriptor.bundled = true
    // we could either enable here the bezier fitting or append the CurveFittingLayoutStage to our layout algorithm
    // if we would like to adjust the approximation error
    // bundlingDescriptor.bezierFitting = true;
    const bundlingStrength = document.getElementById('bundling-strength-slider').value
    layoutAlgorithm.edgeBundling.bundlingStrength = parseFloat(bundlingStrength)
    layoutAlgorithm.edgeBundling.defaultBundleDescriptor = bundlingDescriptor
  }

  /**
   * Updates the circle information for each node.
   * @param {yfiles.circular.CircularLayoutData} layoutData The current layout data
   */
  function updateNodeInformation(layoutData) {
    const graph = graphComponent.graph
    const circleNodes = []
    const circleCenters = []

    // store the nodes that belong to each circle
    graph.nodes.forEach(node => {
      const circleId = layoutData.circleIds.get(node)
      const componentId = componentsMap.get(node)
      const id = circleId !== null ? `${circleId} ${componentId}` : -1
      if (!circleNodes[id]) {
        circleNodes[id] = []
      }
      circleNodes[id].push(node)
    })

    // calculate the center of each circle
    Object.keys(circleNodes).forEach(circleId => {
      if (!circleId.includes('-1') && circleNodes[circleId].length > 2) {
        circleCenters[circleId] = calculateCircleCenter(circleNodes[circleId])
      } else {
        circleCenters[circleId] = null
      }
    })

    // store to the node's tag the circle id, the center of the circle and the nodes that belong to the node's circle
    // this information is needed for the creation of the circular sector node style
    graph.nodes.forEach(node => {
      const circleId = layoutData.circleIds.get(node)
      const componentId = componentsMap.get(node)
      // add to the tag an id consisted of the component to which this node belongs plus the circle id
      const id = circleId !== null ? `${circleId} ${componentId}` : -1
      node.tag = {
        circleId: id,
        center: circleCenters[id],
        circleNodes: circleNodes[id]
      }
    })
  }

  /**
   * Calculates the coordinates of the circle formed by the given points
   * @param {Array} circleNodes An array containing the 3 points that form the circle
   * @return {yfiles.geometry.Point} The coordinates of the center of the circle
   */
  function calculateCircleCenter(circleNodes) {
    const p1 = circleNodes[0].layout.center
    const p2 = circleNodes[1].layout.center
    const p3 = circleNodes[2].layout.center

    const idet =
      2 * (p1.x * p2.y - p2.x * p1.y - p1.x * p3.y + p3.x * p1.y + p2.x * p3.y - p3.x * p2.y)
    const a = p1.x * p1.x + p1.y * p1.y
    const b = p2.x * p2.x + p2.y * p2.y
    const c = p3.x * p3.x + p3.y * p3.y
    const centerX = (a * (p2.y - p3.y) + b * (p3.y - p1.y) + c * (p1.y - p2.y)) / idet
    const centerY = (a * (p3.x - p2.x) + b * (p1.x - p3.x) + c * (p2.x - p1.x)) / idet
    return new yfiles.geometry.Point(centerX, centerY)
  }

  /**
   * Calculates the connected components of the current graph.
   */
  function calculateConnectedComponents() {
    const graph = graphComponent.graph
    const selectedIndex = document.getElementById('sample-combo-box').selectedIndex
    if (
      selectedIndex === LayoutAlgorithm.SINGLE_CYCLE ||
      selectedIndex === LayoutAlgorithm.CIRCULAR
    ) {
      const graphAdapter = new yfiles.layout.YGraphAdapter(graph)
      const components = graphAdapter.yGraph.createNodeMap()
      yfiles.algorithms.GraphConnectivity.connectedComponents(graphAdapter.yGraph, components)
      graph.nodes.forEach(node => {
        componentsMap.set(node, components.getInt(graphAdapter.getCopiedNode(node)))
      })
    }
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindAction("button[data-command='PreviousFile']", () => {
      const samplesComboBox = document.getElementById('sample-combo-box')
      const previousButton = document.getElementById('previous-sample-button')
      updateUIState()
      if (!previousButton.disabled) {
        samplesComboBox.selectedIndex--
        onSampleChanged()
      }
    })
    app.bindAction("button[data-command='NextFile']", () => {
      const samplesComboBox = document.getElementById('sample-combo-box')
      const nextButton = document.getElementById('next-sample-button')
      if (!nextButton.disabled) {
        samplesComboBox.selectedIndex++
        onSampleChanged()
      }
    })
    app.bindChangeListener("select[data-command='SampleSelectionChanged']", onSampleChanged)

    const bundlingStrength = document.getElementById('bundling-strength-slider')
    bundlingStrength.addEventListener(
      'change',
      evt => {
        document.getElementById(
          'bundling-strength-label'
        ).textContent = bundlingStrength.value.toString()
        applyLayout()
      },
      true
    )
  }

  /**
   * Updates the elements of the UI's state and checks whether the buttons should be enabled or not.
   */
  function updateUIState() {
    const samplesComboBox = document.getElementById('sample-combo-box')
    document.getElementById('previous-sample-button').disabled = samplesComboBox.selectedIndex === 0
    document.getElementById('next-sample-button').disabled =
      samplesComboBox.selectedIndex === samplesComboBox.childElementCount - 1
  }

  /**
   * Configures the busy indicator and runs the layout.
   */
  function applyLayout() {
    setBusy(true)
    // set some small time out to enable the busy indicator
    setTimeout(() => {
      runLayout()
    }, 2)
  }

  /**
   * Determines whether the UI is busy or not.
   * @param {boolean} isBusy True if the UI is busy, false otherwise
   */
  function setBusy(isBusy) {
    if (isBusy) {
      // adjust mouse cursor, disable user interaction and add loading indicator
      graphComponent.inputMode.enabled = false
      app.addClass(graphComponent.div, 'gc-busy')
      document.getElementById('loadingIndicator').style.display = 'block'
      setUIDisabled(true)
    } else {
      // restore mouse cursor and user interaction and remove loading indicator
      graphComponent.inputMode.enabled = true
      app.removeClass(graphComponent.div, 'gc-busy')
      document.getElementById('loadingIndicator').style.display = 'none'
      setUIDisabled(false)
      updateUIState()
    }
  }

  /**
   * Enables/disables the UI's elements.
   * @param {boolean} disabled True if the UI's elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.getElementById('sample-combo-box').disabled = disabled
    document.getElementById('previous-sample-button').disabled = disabled
    document.getElementById('next-sample-button').disabled = disabled
    document.getElementById('sample-combo-box').disabled = disabled
    document.getElementById('bundling-strength-slider').disabled = disabled
    document.getElementById('bundling-strength-label').disabled = disabled
  }

  const LayoutAlgorithm = yfiles.lang.Enum('LayoutAlgorithm', {
    SINGLE_CYCLE: 0,
    CIRCULAR: 1,
    RADIAL: 2,
    BALLOON: 3,
    TREE: 4
  })

  // runs the demo
  run()
})
