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
  'utils/ContextMenu',
  'yfiles/view-folding',
  'yfiles/view-graphml',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, ContextMenu) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.view.GraphOverviewComponent} */
  let overviewComponent = null

  function run() {
    // initialize the GraphComponent and GraphOverviewComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    overviewComponent = new yfiles.view.GraphOverviewComponent('overviewComponent')
    overviewComponent.graphComponent = graphComponent

    const foldingManager = new yfiles.graph.FoldingManager()
    const foldingView = foldingManager.createFoldingView()
    foldingView.enqueueNavigationalUndoUnits = true

    const graph = foldingView.graph
    foldingManager.masterGraph.undoEngineEnabled = true

    graphComponent.graph = graph
    overviewComponent.graphVisualCreator = new DemoStyles.DemoStyleOverviewPaintable(graph)

    setDefaultStyles(graph)
    enableGraphML()

    graphComponent.inputMode = createEditorMode()

    createSampleGraph(graph)

    graphComponent.fitGraphBounds()

    registerCommands()

    app.show(graphComponent, overviewComponent)
  }

  /**
   * Creates the editor input mode for this demo.
   * @return {yfiles.input.GraphEditorInputMode}
   */
  function createEditorMode() {
    const mode = new yfiles.input.GraphEditorInputMode({
      snapContext: createGraphSnapContext(),
      labelSnapContext: createLabelSnapContext(),
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext(),
      allowGroupingOperations: true
    })
    mode.orthogonalEdgeEditingContext.enabled = false

    // Fix the top left location of a group node when toggling collapse/expand
    mode.navigationInputMode.autoGroupNodeAlignmentPolicy =
      yfiles.input.NodeAlignmentPolicy.TOP_RIGHT

    // Make bend creation more important than moving of selected edges.
    // As a result, dragging a selected edge (not its bends) will create a new bend instead of moving all bends.
    // This is especially nicer in conjunction with orthogonal edge editing because this would create additional bends
    // every time the edge is moved otherwise
    mode.createBendInputMode.priority = mode.moveInputMode.priority - 1

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

    return mode
  }

  /**
   * Creates a configured {@link yfiles.input.GraphSnapContext} for this demo.
   * @return {yfiles.input.GraphSnapContext}
   */
  function createGraphSnapContext() {
    const graphSnapContext = new yfiles.input.GraphSnapContext({
      enabled: false
    })
    return graphSnapContext
  }

  /**
   * Creates a configured {@link yfiles.input.LabelSnapContext} for this demo.
   * @return {yfiles.input.LabelSnapContext}
   */
  function createLabelSnapContext() {
    const labelSnapContext = new yfiles.input.LabelSnapContext({
      enabled: false,
      snapDistance: 15,
      snapLineExtension: 100
    })
    return labelSnapContext
  }

  /**
   * Enables loading and saving the graph to GraphML.
   */
  function enableGraphML() {
    const gs = new yfiles.graphml.GraphMLSupport({
      graphComponent,
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM,
      graphMLIOHandler: new yfiles.graphml.GraphMLIOHandler()
    })
    gs.graphMLIOHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
  }

  /**
   * Sets default styles to the graph.
   * @param {yfiles.graph.IGraph} graph The graph
   */
  function setDefaultStyles(graph) {
    // Assign the default demo styles
    DemoStyles.initDemoStyles(graphComponent.graph)

    // Set the default node label position to centered below the node with the FreeNodeLabelModel that supports label
    // snapping
    graph.nodeDefaults.labels.layoutParameter = yfiles.graph.FreeNodeLabelModel.INSTANCE.createParameter(
      [0.5, 1.0],
      [0, 10],
      [0.5, 0.0],
      [0, 0],
      0
    )

    // Set the default edge label position with the SmartEdgeLabelModel that supports label snapping
    graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.SmartEdgeLabelModel().createParameterFromSource(
      0,
      0,
      0.5
    )
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    })
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent, null)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent, null)

    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent, null)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent, null)

    app.bindCommand("button[data-command='Cut']", iCommand.CUT, graphComponent, null)
    app.bindCommand("button[data-command='Copy']", iCommand.COPY, graphComponent, null)
    app.bindCommand("button[data-command='Paste']", iCommand.PASTE, graphComponent, null)
    app.bindCommand("button[data-command='Delete']", iCommand.DELETE, graphComponent, null)

    app.bindCommand(
      "button[data-command='GroupSelection']",
      iCommand.GROUP_SELECTION,
      graphComponent,
      null
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      iCommand.UNGROUP_SELECTION,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='EnterGroup']", iCommand.ENTER_GROUP, graphComponent, null)
    app.bindCommand("button[data-command='ExitGroup']", iCommand.EXIT_GROUP, graphComponent, null)

    app.bindAction('#demo-snapping-button', () => {
      graphComponent.inputMode.snapContext.enabled = document.querySelector(
        '#demo-snapping-button'
      ).checked
      graphComponent.inputMode.labelSnapContext.enabled = document.querySelector(
        '#demo-snapping-button'
      ).checked
    })
    app.bindAction('#demo-orthogonal-editing-button', () => {
      graphComponent.inputMode.orthogonalEdgeEditingContext.enabled = document.querySelector(
        '#demo-orthogonal-editing-button'
      ).checked
    })
  }

  function selectAllEdges() {
    graphComponent.selection.clear()
    graphComponent.graph.edges.forEach(edge => graphComponent.selection.setSelected(edge, true))
  }

  function selectAllNodes() {
    graphComponent.selection.clear()
    graphComponent.graph.nodes.forEach(node => graphComponent.selection.setSelected(node, true))
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

    // Check whether a node was it. If it was, we prefer it over edges
    const hit = hits.find(item => yfiles.graph.INode.isInstance(item)) || hits.firstOrDefault()

    const graphSelection = graphComponent.selection
    if (yfiles.graph.INode.isInstance(hit)) {
      // if a node or an edge is hit: provide 'Select All Nodes' or 'Select All Edges', respectively
      // and select the hit item
      contextMenu.addMenuItem('Select All Nodes', selectAllNodes)
      if (!graphSelection.isSelected(hit)) {
        graphSelection.clear()
      }
      graphSelection.setSelected(hit, true)
    } else if (yfiles.graph.IEdge.isInstance(hit)) {
      contextMenu.addMenuItem('Select All Edges', selectAllEdges)
      if (!graphSelection.isSelected(hit)) {
        graphSelection.clear()
      }
      graphSelection.setSelected(hit, true)
    } else {
      // if another type of item or the empty canvas is hit: provide 'Select All'
      contextMenu.addMenuItem('Select All', () => {
        yfiles.input.ICommand.SELECT_ALL.execute(null, graphComponent)
      })
    }

    // if one or more nodes are selected: add options to cut and copy
    if (graphSelection.selectedNodes.size > 0) {
      contextMenu.addMenuItem('Cut', () => {
        yfiles.input.ICommand.CUT.execute(null, graphComponent)
      })
      contextMenu.addMenuItem('Copy', () => {
        yfiles.input.ICommand.COPY.execute(null, graphComponent)
      })
    }
    if (!graphComponent.clipboard.empty) {
      // clipboard is not empty: add option to paste
      contextMenu.addMenuItem('Paste', () => {
        yfiles.input.ICommand.PASTE.execute(args.queryLocation, graphComponent)
      })
    }
  }

  /**
   * Creates the initial graph.
   */
  function createSampleGraph(graph) {
    graph.clear()

    const n1 = graph.createNode(new yfiles.geometry.Rect(126, 0, 30, 30))
    const n2 = graph.createNode(new yfiles.geometry.Rect(126, 72, 30, 30))
    const n3 = graph.createNode(new yfiles.geometry.Rect(75, 147, 30, 30))
    const n4 = graph.createNode(new yfiles.geometry.Rect(177.5, 147, 30, 30))
    const n5 = graph.createNode(new yfiles.geometry.Rect(110, 249, 30, 30))
    const n6 = graph.createNode(new yfiles.geometry.Rect(177.5, 249, 30, 30))
    const n7 = graph.createNode(new yfiles.geometry.Rect(110, 299, 30, 30))
    const n8 = graph.createNode(new yfiles.geometry.Rect(177.5, 299, 30, 30))
    const n9 = graph.createNode(new yfiles.geometry.Rect(110, 359, 30, 30))
    const n10 = graph.createNode(new yfiles.geometry.Rect(47.5, 299, 30, 30))
    const n11 = graph.createNode(new yfiles.geometry.Rect(20, 440, 30, 30))
    const n12 = graph.createNode(new yfiles.geometry.Rect(110, 440, 30, 30))
    const n13 = graph.createNode(new yfiles.geometry.Rect(20, 515, 30, 30))
    const n14 = graph.createNode(new yfiles.geometry.Rect(80, 515, 30, 30))
    const n15 = graph.createNode(new yfiles.geometry.Rect(140, 515, 30, 30))
    const n16 = graph.createNode(new yfiles.geometry.Rect(20, 569, 30, 30))

    const group1 = graph.createGroupNode({
      layout: new yfiles.geometry.Rect(25, 45, 202.5, 353),
      labels: 'Group 1'
    })
    graph.groupNodes(group1, [n2, n3, n4, n9, n10])

    const group2 = graph.createGroupNode({
      parent: group1,
      layout: new yfiles.geometry.Rect(98, 222, 119.5, 116),
      labels: 'Group 2'
    })
    graph.groupNodes(group2, [n5, n6, n7, n8])

    const group3 = graph.createGroupNode({
      layout: new yfiles.geometry.Rect(10, 413, 170, 141),
      labels: 'Group 3'
    })
    graph.groupNodes(group3, [n11, n12, n13, n14, n15])

    graph.createEdge(n1, n2)
    graph.createEdge(n2, n3)
    graph.createEdge(n2, n4)
    graph.createEdge(n3, n5)
    graph.createEdge(n3, n10)
    graph.createEdge(n5, n7)
    graph.createEdge(n7, n9)
    graph.createEdge(n4, n6)
    graph.createEdge(n6, n8)
    graph.createEdge(n10, n11)
    graph.createEdge(n10, n12)
    graph.createEdge(n11, n13)
    graph.createEdge(n13, n16)
    graph.createEdge(n12, n14)
    graph.createEdge(n12, n15)

    // clear the undo engine
    graph.foldingView.manager.masterGraph.undoEngine.clear()
  }

  // Start the demo
  run()
})
