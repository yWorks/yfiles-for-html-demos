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
  'utils/ContextMenu',
  'LayerVisual.js',
  'LayerPositionHandler.js',
  'PortConstraintBendHandle.js',
  'yfiles/view-graphml',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  ContextMenu,
  LayerVisual,
  LayerPositionHandler,
  PortConstraintBendHandle
) => {
  /**
   * Sample that interactively demonstrates the usage of {@link yfiles.hierarchic.HierarchicLayout}.
   * This demo shows how to incrementally add nodes and edges and dynamically assign port constraints.
   * Create new nodes and observe how they are inserted into the drawing near the place they have been created.
   * Create new edges and watch the routings being calculated immediately.
   * Drag the first and last bend of an edge to interactively assign or reset port constraints.
   * Use the context menu to reroute selected edges or optimize selected nodes locations.
   */
  function run() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    graph = graphComponent.graph

    layerVisual = new LayerVisual()
    newLayerMapper = new yfiles.collections.Mapper()
    incrementalNodes = new yfiles.collections.List()
    incrementalEdges = new yfiles.collections.List()

    // register toolbar button commands
    registerCommands()
    // initialize the input mode
    initializeInputModes()
    // initialize the graph
    initializeGraph()
    app.show(graphComponent)
  }

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.graph.IGraph} */
  let graph = null

  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
  }

  /**
   * Calls {@link #createEditorMode} and registers the result as the {@link yfiles.view.CanvasComponent#inputMode}.
   */
  function initializeInputModes() {
    // create the interaction mode
    graphComponent.inputMode = createEditorMode()

    // display the layers
    graphComponent.backgroundGroup.addChild(
      layerVisual,
      yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )
  }

  /**
   * Creates the default input mode for the {@link yfiles.view.GraphComponent} a
   * {@link yfiles.input.GraphEditorInputMode}.
   * @return {yfiles.input.IInputMode} a specialized GraphEditorInputMode instance
   */
  function createEditorMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true
    })
    // creating bends does not make sense because the routing is calculated
    // immediately after the creation.
    mode.createEdgeInputMode.allowCreateBend = false

    // register hooks whenever something is dragged or resized
    mode.handleInputMode.addDragFinishedListener((sender, args) => {
      updateLayout()
    })
    mode.moveInputMode.addDragFinishedListener((sender, args) => {
      updateLayout()
    })
    // ... and when new nodes are created interactively
    mode.addNodeCreatedListener((sender, args) => {
      const newLayer = layerVisual.getLayer(args.item.layout.center)
      newLayerMapper.set(args.item, newLayer)
      updateLayout()
    })
    // ... or edges
    mode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
      incrementalEdges.add(args.item)
      updateLayout()
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
    mode.addPopulateItemContextMenuListener((sender, args) => {
      contextMenu.clearItems()
      // see if it's a node but not a not empty group node
      const item = args.item
      if (yfiles.graph.INode.isInstance(item) && !graph.isGroupNode(item)) {
        // see if it's already selected
        const selectedNodes = graphComponent.selection.selectedNodes
        if (!selectedNodes.isSelected(item)) {
          // no - make it the only selected node
          selectedNodes.clear()
        }
        // make sure the node is selected
        selectedNodes.setSelected(item, true)
        graphComponent.currentItem = item
        // mark all selected nodes for incremental layout
        contextMenu.addMenuItem('Reinsert Incrementally', event => {
          incrementalNodes.addRange(selectedNodes)
          updateLayout()
        })
        args.handled = true
      }
      // if it's an edge...
      if (yfiles.graph.IEdge.isInstance(item)) {
        // update selection state
        const selectedEdges = graphComponent.selection.selectedEdges
        if (!selectedEdges.isSelected(item)) {
          selectedEdges.clear()
        }
        selectedEdges.setSelected(item, true)
        graphComponent.currentItem = item
        // and offer option to reroute selected edges
        contextMenu.addMenuItem('Reroute', event => {
          incrementalEdges.addRange(selectedEdges)
          updateLayout()
        })
        args.handled = true
      }
    })

    // Add a listener that closes the menu when the input mode requests this
    mode.contextMenuInputMode.addCloseMenuListener(() => {
      contextMenu.close()
    })

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.onClosedCallback = () => {
      mode.contextMenuInputMode.menuClosed()
    }
    return mode
  }

  /**
   * Core method that recalculates and updates the layout.
   */
  function updateLayout() {
    // make sure we are not re-entrant
    if (layouting) {
      return
    }
    layouting = true
    // disable the input mode during the layout calculation
    graphComponent.inputMode.enabled = false

    // update the layers for moved nodes
    updateMovedNodes()

    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.orthogonalRouting = true
    layout.recursiveGroupLayering = false
    layout.fixedElementsLayerer = new yfiles.hierarchic.GivenLayersLayerer()
    layout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
    // we need to add hints for incremental nodes and edges, so create a mapper that holds the hints
    const hintMapper = new yfiles.collections.Mapper()
    // and a factory for the hints
    const hintsFactory = layout.createIncrementalHintsFactory()
    // now mark incremental nodes with the corresponding hints
    incrementalNodes.forEach(incrementalNode => {
      hintMapper.set(incrementalNode, hintsFactory.createLayerIncrementallyHint(incrementalNode))
    })
    // and forget the nodes for the next run
    incrementalNodes.clear()

    // the same for edges
    incrementalEdges.forEach(incrementalEdge => {
      hintMapper.set(incrementalEdge, hintsFactory.createSequenceIncrementallyHint(incrementalEdge))
    })
    // reset...
    incrementalEdges.clear()

    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    layoutData.incrementalHints.mapper = hintMapper
    layoutData.givenLayersLayererIds.mapper = layerMapper
    layoutData.layerIndices = layerMapper

    // apply the layout
    graphComponent
      .morphLayout(new yfiles.layout.MinimumNodeSizeStage(layout), '1s', layoutData)
      .then(() => {
        layerVisual.updateLayers(graph, layerMapper)
        layouting = false
        graphComponent.inputMode.enabled = true
      })
      .catch(error => {
        graphComponent.inputMode.enabled = true
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Updates the layers for moved nodes.
   */
  function updateMovedNodes() {
    if (newLayerMapper.entries.getEnumerator().moveNext()) {
      // spread out existing layers
      graph.nodes.forEach(node => {
        layerMapper.set(node, layerMapper.get(node) * 2)
      })
      newLayerMapper.entries.forEach(pair => {
        const node = pair.key
        // if a node has been moved, reinsert the adjacent edges incrementally and not from sketch
        incrementalEdges.addRange(graph.edgesAt(node))
        const newLayerIndex = pair.value
        if (newLayerIndex === Number.MAX_SAFE_INTEGER) {
          // the node has been dragged outside - mark it as incremental
          incrementalNodes.add(node)
        } else if (newLayerIndex < 0) {
          const beforeLayer = -(newLayerIndex + 1)
          layerMapper.set(node, beforeLayer * 2 - 1)
        } else {
          layerMapper.set(node, newLayerIndex * 2)
        }
      })
      newLayerMapper.clear()
    }
  }

  /**
   * Initializes the graph instance setting default styles
   * and creating a small sample graph.
   */
  function initializeGraph() {
    graph.nodeDefaults.size = new yfiles.geometry.Size(60, 30)

    // set some nice defaults
    DemoStyles.initDemoStyles(graph)

    // register mappers for the layers
    const mapperRegistry = graph.mapperRegistry
    layerMapper = mapperRegistry.createMapper(yfiles.hierarchic.GivenLayersLayerer.LAYER_ID_DP_KEY)
    // and the port constraints
    sourcePortConstraints = mapperRegistry.createMapper(
      yfiles.layout.PortConstraintKeys.SOURCE_PORT_CONSTRAINT_DP_KEY
    )
    targetPortConstraints = mapperRegistry.createMapper(
      yfiles.layout.PortConstraintKeys.TARGET_PORT_CONSTRAINT_DP_KEY
    )

    // register a custom PositionHandler for the nodes.
    // this enables interactive layer reassignment with layer preview
    graph.decorator.nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
      node => !graph.groupingSupport.hasGroupNodes() || !graph.isGroupNode(node),
      (node, positionHandler) =>
        new LayerPositionHandler(positionHandler, layerVisual, node, newLayerMapper)
    )

    // register custom handles for the first and last bends of an edge
    // this enables interactive port constraint assignment.
    graph.decorator.bendDecorator.handleDecorator.setImplementationWrapper(
      bend =>
        bend.owner.bends.get(0) === bend ||
        bend.owner.bends.get(bend.owner.bends.size - 1) === bend,
      createBendHandle.bind(this)
    )

    // create a small sample graph with given layers
    createSampleGraph()

    // fit it into the view
    graphComponent.fitGraphBounds()
  }

  /**
   * Creates the sample graph.
   */
  function createSampleGraph() {
    graph.clear()
    const nodes = []
    for (let i = 0; i < 27; i++) {
      nodes[i] = graph.createNode()
    }

    graph.createEdge(nodes[3], nodes[7])
    graph.createEdge(nodes[0], nodes[1])
    graph.createEdge(nodes[0], nodes[4])
    graph.createEdge(nodes[1], nodes[2])
    graph.createEdge(nodes[0], nodes[9])
    graph.createEdge(nodes[6], nodes[10])
    graph.createEdge(nodes[11], nodes[12])
    graph.createEdge(nodes[11], nodes[13])
    graph.createEdge(nodes[8], nodes[11])
    graph.createEdge(nodes[15], nodes[16])
    graph.createEdge(nodes[16], nodes[17])
    graph.createEdge(nodes[18], nodes[19])
    graph.createEdge(nodes[20], nodes[21])
    graph.createEdge(nodes[7], nodes[17])
    graph.createEdge(nodes[9], nodes[22])
    graph.createEdge(nodes[22], nodes[3])
    graph.createEdge(nodes[19], nodes[0])
    graph.createEdge(nodes[8], nodes[4])
    graph.createEdge(nodes[18], nodes[25])
    graph.createEdge(nodes[24], nodes[8])
    graph.createEdge(nodes[26], nodes[25])
    graph.createEdge(nodes[10], nodes[20])
    graph.createEdge(nodes[5], nodes[23])
    graph.createEdge(nodes[25], nodes[15])
    graph.createEdge(nodes[10], nodes[15])
    graph.createEdge(nodes[21], nodes[17])
    graph.createEdge(nodes[26], nodes[6])
    graph.createEdge(nodes[13], nodes[12])
    graph.createEdge(nodes[12], nodes[14])
    graph.createEdge(nodes[14], nodes[11])
    graph.createEdge(nodes[21], nodes[5])
    graph.createEdge(nodes[5], nodes[6])
    graph.createEdge(nodes[9], nodes[7])
    graph.createEdge(nodes[19], nodes[24])

    // calculate the initial layout
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.orthogonalRouting = true
    layout.recursiveGroupLayering = false

    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    layoutData.layerIndices = layerMapper

    graph.applyLayout(layout, layoutData)

    // and update the layer visualization
    layerVisual.updateLayers(graph, layerMapper)
  }

  /**
   * Callback that creates the bend IHandle for the first and last bends.
   * @param {yfiles.graph.IBend} bend The bend.
   * @param {yfiles.input.IHandle} baseHandle The original implementation to delegate to.
   * @return {yfiles.input.IHandle} The new handle that allows for interactively assign the port constraints.
   */
  function createBendHandle(bend, baseHandle) {
    if (bend.owner.bends.get(0) === bend) {
      // decorate first bend
      baseHandle = new PortConstraintBendHandle(baseHandle, true, bend, sourcePortConstraints)
    }
    if (bend.owner.bends.get(bend.owner.bends.size - 1) === bend) {
      // decorate last bend - could be both first and last
      baseHandle = new PortConstraintBendHandle(baseHandle, false, bend, targetPortConstraints)
    }
    return baseHandle
  }

  /**
   * Visualizes the layers and manages layer regions and contains tests.
   * @type {LayerVisual}
   */
  let layerVisual = null

  /**
   * holds for each node the layer
   * @type {yfiles.collections.IMapper.<yfiles.graph.INode,number>}
   */
  let layerMapper = null

  /**
   * whether a layout is currently running
   * @type {boolean}
   */
  let layouting = false

  /**
   * holds temporary layer reassignments that will be assigned during the next layout
   * @type {yfiles.collections.Mapper.<yfiles.graph.INode,number>}
   */
  let newLayerMapper = null

  /**
   * holds for each edge a port constraint for the source end
   * @type {yfiles.collections.IMapper.<yfiles.graph.IEdge,yfiles.layout.PortConstraint>}
   */
  let sourcePortConstraints = null

  /**
   * holds for each edge a port constraint for the target end
   * @type {yfiles.collections.IMapper.<yfiles.graph.IEdge,yfiles.layout.PortConstraint>}
   */
  let targetPortConstraints = null

  /**
   * holds a list of nodes to insert incrementally during the next layout
   * @type {yfiles.collections.List.<yfiles.graph.INode>}
   */
  let incrementalNodes = null

  /**
   * holds a list of edges to reroute incrementally during the next layout
   * @type {yfiles.collections.List.<yfiles.graph.IEdge>}
   */
  let incrementalEdges = null

  // start demo
  run()
})
