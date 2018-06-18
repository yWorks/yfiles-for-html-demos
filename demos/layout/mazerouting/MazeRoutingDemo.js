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
  'resources/demo-styles',
  'resources/maze.js',
  'PolylineEdgeRouterConfig.js',
  'resources/demo-option-editor',
  'yfiles/view-layout-bridge',
  'yfiles/router-polyline',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, Maze) => {
  const demo = yfiles.module('demo')

  /**
   * The GraphComponent.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Holds whether a layout is current running.
   * @type {boolean}
   */
  let inLayout = false

  /**
   * The option editor that stores the currently selected layout configuration.
   * @type {demo.options.OptionEditor}
   */
  let optionEditor = null

  /**
   * Holds the filtered graph. The graph consists of the maze graph nodes which are the ones that form the maze and
   * the normal graph nodes. The maze nodes are visible only during the layout to simulate the maze.
   * @type {yfiles.graph.FilteredGraphWrapper}
   */
  let filteredGraph = null

  /**
   * Starts the demo.
   */
  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // initialize the side option editor
    initializeOptionEditor()

    // initialize the graph
    initializeGraph()

    // create the input mode
    createEditorInputMode()

    // create the sample graph
    createSampleGraph()

    // wire up the UI
    registerCommands()

    // initialize the demo
    app.show(graphComponent)
  }

  /**
   * Initializes the side option editor that will display the routing algorithms settings.
   */
  function initializeOptionEditor() {
    const editorElement = window.document.getElementById('data-editor')
    optionEditor = new demo.options.OptionEditor(editorElement)
    optionEditor.config = new demo.PolylineEdgeRouterConfig()
  }

  /**
   * Initializes the graph instance and sets the default styles.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    // enable the undo engine and merge undo units that occur within a specific time window (e.g. 2 seconds)
    graph.undoEngineEnabled = true
    graph.undoEngine.mergeUnits = true

    // set some defaults styles
    DemoStyles.initDemoStyles(graph)
  }

  /**
   * Initializes the input mode.
   */
  function createEditorInputMode() {
    const inputMode = new yfiles.input.GraphEditorInputMode()

    inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
      const selectedEdges = new yfiles.collections.List()
      selectedEdges.add(args.item)
      routeAffectedEdges(selectedEdges)
    })

    inputMode.moveInputMode.addDragFinishedListener(() => {
      const graphSelection = graphComponent.selection
      if (graphSelection.size === graphSelection.selectedNodes.size) {
        // only nodes are selected
        routeEdgesAtAffectedNodes(graphSelection.selectedNodes.toList())
      } else if (graphSelection.size === graphSelection.selectedEdges.size) {
        // only edges are selected
        routeAffectedEdges(graphSelection.selectedEdges.toList())
      } else {
        const affectedEdges = new yfiles.collections.List()
        // nodes and edges are selected
        graphSelection.selectedNodes.forEach(node => {
          // add all edges adjacent to the selected nodes to the affected edges' list
          graphComponent.graph.edgesAt(node).forEach(edge => {
            affectedEdges.add(edge)
          })
        })
        // add all selected edges to the affected edges' list
        graphSelection.selectedEdges.forEach(edge => {
          affectedEdges.add(edge)
        })
        // route the affected edges
        routeAffectedEdges(affectedEdges)
      }
    })

    inputMode.handleInputMode.addDragFinishedListener(() => {
      const affectedEdges = new yfiles.collections.List()
      const graphSelection = graphComponent.selection
      graphSelection.selectedNodes.forEach(node => {
        // add all edges adjacent to the selected nodes to the affected edges' list
        graphComponent.graph.edgesAt(node).forEach(edge => {
          affectedEdges.add(edge)
        })
      })
      // add bend owners to the affected edges' list
      graphSelection.selectedBends.forEach(bend => {
        affectedEdges.add(bend.owner)
      })
      // route the affected edges
      routeAffectedEdges(affectedEdges)
    })

    graphComponent.inputMode = inputMode
  }

  /**
   * Wires up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent)

    app.bindAction("button[data-command='RouteEdgesCommand']", routeAll)

    app.bindAction("button[data-command='ResetConfigCommand']", () => {
      optionEditor.config = new demo.PolylineEdgeRouterConfig()
    })
  }

  /**
   * Applies the routing algorithm.
   * @param {boolean} clearUndo True if the undo engine should be cleared, false otherwise
   * @return {Promise} A promise which resolves after the layout is applied without errors.
   */
  function route(clearUndo) {
    const config = optionEditor.config
    const graph = graphComponent.graph
    // prevent starting another layout calculation
    inLayout = true
    setUIDisabled(true)
    const layoutEdit = graph.beginEdit('layout', 'layout')

    // call to nodePredicateChanged() to insert the nodes of the maze
    filteredGraph.nodePredicateChanged()
    // don't draw maze nodes on top of the other nodes
    graph.nodes.forEach(node => {
      if (node.tag && node.tag.maze) {
        graphComponent.graphModelManager.getCanvasObject(node).toBack()
      }
    })

    return config
      .apply(graphComponent)
      .then(() => {
        inLayout = false
        // call to nodePredicateChanged() to remove the nodes of the maze
        filteredGraph.nodePredicateChanged()
        layoutEdit.commit()
        if (clearUndo) {
          graph.undoEngine.clear()
        }
        setUIDisabled(false)
      })
      .catch(ignored => {
        layoutEdit.cancel()
        if (clearUndo) {
          graph.undoEngine.clear()
        }
      })
  }

  /**
   * Routes all graph edges.
   * @param {boolean} clearUndo True if the undo engine should be cleared, false otherwise
   * @return {Promise} A promise which resolves after the layout is applied without errors.
   */
  function routeAll(clearUndo) {
    if (inLayout) {
      return Promise.reject()
    }
    // configure the routing algorithm
    optionEditor.config.createConfiguredLayout(graphComponent)
    return route(clearUndo)
  }

  /**
   * Routes only the affected edges.
   * @param {yfiles.collections.List} affectedEdges The list of edges to be routed
   * @return {Promise} A promise which resolves after the layout is applied without errors.
   */
  function routeAffectedEdges(affectedEdges) {
    if (inLayout) {
      return Promise.reject()
    }
    const config = optionEditor.config
    const oldScope = config.scopeItem
    config.scopeItem = yfiles.router.Scope.ROUTE_AFFECTED_EDGES
    const layoutData = config.createConfiguration(graphComponent)
    // overwrite the default implementation that uses only the selected edges
    layoutData.affectedEdges.delegate = edge => affectedEdges.includes(edge)
    return route(false)
      .then(() => {
        config.scopeItem = oldScope
      })
      .catch(() => {
        config.scopeItem = oldScope
      })
  }

  /**
   * Routes only the edges adjacent to affected nodes.
   * @param {yfiles.collections.List} affectedNodes The list of nodes whose edges will be routed
   * @return {Promise} A promise which resolves after the layout is applied without errors.
   */
  function routeEdgesAtAffectedNodes(affectedNodes) {
    if (inLayout) {
      return Promise.reject()
    }
    const config = optionEditor.config
    const oldScope = config.scopeItem
    config.scopeItem = yfiles.router.Scope.ROUTE_EDGES_AT_AFFECTED_NODES
    const layoutData = config.createConfiguration(graphComponent)
    // overwrite the default implementation that routes the edges only from the selected nodes
    layoutData.affectedEdges.delegate = node => affectedNodes.includes(node)
    return route(false)
      .then(() => {
        config.scopeItem = oldScope
      })
      .catch(() => {
        config.scopeItem = oldScope
      })
  }

  /**
   * Enables/disables the UI elements.
   * @param {boolean} disabled True if the elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.getElementById('route-edges-button').disabled = disabled
    document.getElementById('reset-button').disabled = disabled
    // enable/disable input so that no use interactions occur on the graphComponent when a layout is running
    graphComponent.inputMode.waiting = disabled
  }

  /**
   * Creates the sample graph. The graph consists of the maze graph nodes which are the ones that form the maze and
   * the normal graph nodes. The maze nodes are visible only during the layout to simulate the maze.
   */
  function createSampleGraph() {
    let graph = graphComponent.graph
    const builder = new yfiles.binding.GraphBuilder(graph)
    builder.nodesSource = Maze.nodes
    builder.edgesSource = Maze.edges
    builder.nodeIdBinding = 'id'
    builder.sourceNodeBinding = 'from'
    builder.targetNodeBinding = 'to'
    builder.locationXBinding = 'x'
    builder.locationYBinding = 'y'

    graph = builder.buildGraph()

    const mazeNodeStyle = new yfiles.styles.ShapeNodeStyle({
      fill: 'rgb(102, 153, 204)',
      stroke: null
    })

    const mazeNodes = []
    graph.nodes.forEach(node => {
      if (node.tag.maze) {
        graph.setNodeLayout(
          node,
          new yfiles.geometry.Rect(node.layout.x, node.layout.y, node.tag.width, node.tag.height)
        )
        graph.setStyle(node, mazeNodeStyle)
        mazeNodes.push(node)
      }
      node.tag = { maze: node.tag.maze }
    })

    graph.edges.forEach(edge => {
      if (edge.tag.sourcePort) {
        graph.setPortLocation(
          edge.sourcePort,
          new yfiles.geometry.Point(edge.tag.sourcePort.x, edge.tag.sourcePort.y)
        )
        graph.setPortLocation(
          edge.targetPort,
          new yfiles.geometry.Point(edge.tag.targetPort.x, edge.tag.targetPort.y)
        )
      }

      const bends = edge.tag.bends
      bends.forEach(bend => {
        graph.addBend(edge, new yfiles.geometry.Point(bend.x, bend.y))
      })
    })

    // adds the maze visual
    const mazeVisual = new MazeVisual(mazeNodes)
    graphComponent.backgroundGroup.addChild(
      mazeVisual,
      yfiles.view.ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
    )

    graphComponent.fitGraphBounds()

    filteredGraph = new yfiles.graph.FilteredGraphWrapper(
      graphComponent.graph,
      node => inLayout || !node.tag || !node.tag.maze,
      edge => true
    )
    graphComponent.graph = filteredGraph

    // route all edges and clear the undo engine
    routeAll(true)
  }

  /**
   * This class implements the Maze Visual based on the nodes that form the maze.
   */
  class MazeVisual extends yfiles.lang.Class(yfiles.view.IVisualCreator) {
    /**
     * Creates a new instance of MazeVisual.
     * @param {Array} nodes
     */
    constructor(nodes) {
      super()
      this.nodes = nodes
    }

    /**
     * Creates the maze visual.
     * @param {yfiles.view.IRenderContext} context The render context
     * @return {yfiles.view.SvgVisual} The maze visual
     */
    createVisual(context) {
      const visualGroup = new yfiles.view.SvgVisualGroup()
      this.nodes.forEach(node => {
        const nodeVisual = node.style.renderer
          .getVisualCreator(node, node.style)
          .createVisual(context)
        visualGroup.add(nodeVisual)
      })
      return visualGroup
    }

    /**
     * Updates the maze visual. As the maze cannot be changed in this demo, the old visual is returned.
     * @param {yfiles.view.IRenderContext} context The render context
     * @param {yfiles.view.SvgVisual} oldVisual The old visual
     * @return {yfiles.view.SvgVisual} The updated visual
     */
    updateVisual(context, oldVisual) {
      return oldVisual
    }
  }

  // runs the demo
  run()
})
