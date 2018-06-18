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
  'TableStyles.js',
  'utils/ContextMenu',
  'utils/DndPanel',
  'yfiles/view-table',
  'yfiles/view-graphml',
  'yfiles/view-layout-bridge',
  'yfiles/layout-hierarchic',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  TableStyles,
  ContextMenu,
  DndPanel
) => {
  /** @type {yfiles.input.TableEditorInputMode} */
  let tableEditorInputMode = null

  /** @type {yfiles.input.GraphEditorInputMode} */
  let graphEditorInputMode = null

  /**
   * The default style for normal group nodes.
   * @type {yfiles.styles.ShapeNodeStyle}
   */
  let defaultGroupNodeStyle = null

  /**
   * The layout call is asynchronous. However, we only want one layout at a time.
   * @type {boolean}
   */
  let isLayoutRunning = false

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.graph.IGraph} */
  let graph = null

  /** The Drag and Drop Panel */
  let dndPanel = null

  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    graph = graphComponent.graph

    // bind toolbar commands
    registerCommands()

    // create the default group node style
    defaultGroupNodeStyle = new yfiles.styles.ShapeNodeStyle({
      shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
      fill: 'transparent',
      stroke: new yfiles.view.Stroke({
        dashStyle: yfiles.view.DashStyle.DASH_DOT,
        lineCap: yfiles.view.LineCap.SQUARE
      })
    })

    dndPanel = new DndPanel.DragAndDropPanel(
      document.getElementById('dndPanel'),
      app.passiveSupported
    )
    // Set the callback that starts the actual drag and drop operation
    dndPanel.beginDragCallback = (element, data) => {
      const dragPreview = element.cloneNode(true)
      dragPreview.style.margin = '0'
      let dragSource = null
      if (yfiles.graph.IStripe.isInstance(data)) {
        dragSource = yfiles.input.StripeDropInputMode.startDrag(
          element,
          data,
          yfiles.view.DragDropEffects.ALL,
          true,
          app.pointerEventsSupported ? dragPreview : null
        )
      } else {
        dragSource = yfiles.input.NodeDropInputMode.startDrag(
          element,
          data,
          yfiles.view.DragDropEffects.ALL,
          true,
          app.pointerEventsSupported ? dragPreview : null
        )
      }
      dragSource.addQueryContinueDragListener((src, args) => {
        if (args.dropTarget === null) {
          app.removeClass(dragPreview, 'hidden')
        } else {
          app.addClass(dragPreview, 'hidden')
        }
      })
    }
    dndPanel.maxItemWidth = 160
    dndPanel.populatePanel(createDndPanelNodes)

    // initialize the input mode
    configureInputModes()

    // initialize the graph
    const defaultNodeSize = new yfiles.geometry.Size(80, 50)
    graph.edgeDefaults.style = new DemoStyles.DemoEdgeStyle()
    graph.nodeDefaults.style = new DemoStyles.DemoNodeStyle()
    graph.nodeDefaults.size = defaultNodeSize
    graph.groupNodeDefaults.style = defaultGroupNodeStyle
    graph.groupNodeDefaults.size = defaultNodeSize

    // enable loading and saving, and load a sample graph
    const graphMLSupport = enableGraphML()
    app
      .readGraph(graphMLSupport.graphMLIOHandler, graphComponent.graph, 'resources/sample.graphml')
      .then(graphLoaded)

    // initialize the demo
    app.show(graphComponent)
  }

  /**
   * Configure the main input mode.
   * Creates a GraphEditorInputMode instance.
   */
  function configureInputModes() {
    const mode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true,
      orthogonalEdgeEditingContext: new yfiles.input.OrthogonalEdgeEditingContext(),
      allowCreateNode: false
    })
    // Register custom reparent handler that prevents reparenting of table nodes (i.e. they may only appear on root
    // level)
    mode.reparentNodeHandler = new MyReparentHandler(mode.reparentNodeHandler)
    mode.orthogonalEdgeEditingContext.enabled = true

    const nodeDropInputMode = new yfiles.input.NodeDropInputMode()
    nodeDropInputMode.showPreview = true
    nodeDropInputMode.enabled = true
    nodeDropInputMode.isGroupNodePredicate = draggedNode =>
      // tables and tagged nodes should be created as group nodes
      draggedNode.lookup(yfiles.graph.ITable.$class) !== null || draggedNode.tag === 'GroupNode'

    nodeDropInputMode.isValidParentPredicate = node => {
      const draggedNode = nodeDropInputMode.lastDragEventArgs.item.getData('yfiles.graph.INode')
      if (
        draggedNode.lookup(yfiles.graph.ITable.$class) !== null &&
        node !== null &&
        graph.isGroupNode(node)
      ) {
        // this node has a table associated - disallow dragging into a group node.
        return false
      }
      return graph.isGroupNode(node)
    }

    mode.nodeDropInputMode = nodeDropInputMode
    graphEditorInputMode = mode

    configureTableEditing()

    graphComponent.inputMode = graphEditorInputMode
  }

  /**
   * Configures table editing specific parts.
   */
  function configureTableEditing() {
    const reparentStripeHandler = new yfiles.input.ReparentStripeHandler()
    reparentStripeHandler.maxColumnLevel = 2
    reparentStripeHandler.maxRowLevel = 2

    // Create a new TEIM instance which also allows drag and drop
    const tableInputMode = new yfiles.input.TableEditorInputMode({
      reparentStripeHandler,
      // we set the priority higher than for the handle input mode so that handles win if both gestures are possible
      priority: graphEditorInputMode.handleInputMode.priority + 1
    })
    tableInputMode.stripeDropInputMode.enabled = true

    // Add to GEIM
    tableEditorInputMode = tableInputMode
    graphEditorInputMode.add(tableEditorInputMode)

    // Tooltip for tables. We show only tool tips for stripe headers in this demo.
    graphEditorInputMode.mouseHoverInputMode.addQueryToolTipListener((sender, args) => {
      if (!args.handled) {
        const stripe = getStripe(args.queryLocation)
        if (stripe !== null) {
          args.toolTip = stripe.stripe.toString()
          args.handled = true
        }
      }
    })

    // Context menu for tables
    graphEditorInputMode.contextMenuItems = yfiles.graph.GraphItemTypes.NODE

    // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
    // context menu widget as well. See the Context Menu demo for more details about working with context menus.
    const contextMenu = new ContextMenu(graphComponent)

    // Add event listeners to the various events that open the context menu. These listeners then
    // call the provided callback function which in turn asks the current ContextMenuInputMode if a
    // context menu should be shown at the current location.
    contextMenu.addOpeningEventListeners(graphComponent, location => {
      if (
        graphEditorInputMode.contextMenuInputMode.shouldOpenMenu(
          graphComponent.toWorldFromPage(location)
        )
      ) {
        contextMenu.show(location)
      }
    })

    // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
    // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
    graphEditorInputMode.addPopulateItemContextMenuListener((sender, args) =>
      populateContextMenu(contextMenu, args)
    )

    // Add a listener that closes the menu when the input mode requests this
    graphEditorInputMode.contextMenuInputMode.addCloseMenuListener(() => {
      contextMenu.close()
    })

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.onClosedCallback = () => {
      graphEditorInputMode.contextMenuInputMode.menuClosed()
    }

    // prevent re-parenting of tables into tables by copy & paste
    const clipboard = new yfiles.graph.GraphClipboard()
    clipboard.parentNodeDetection = yfiles.graph.ParentNodeDetectionModes.PREVIOUS_PARENT
    graphComponent.clipboard = clipboard
  }

  /**
   * Event handler for the context menu.
   * @param {Object} contextMenu
   * @param {yfiles.input.PopulateItemContextMenuEventArgs<IModelItem>} args
   */
  function populateContextMenu(contextMenu, args) {
    if (args.handled) {
      return
    }
    contextMenu.clearItems()
    const stripe = getStripe(args.queryLocation)
    if (stripe !== null) {
      contextMenu.addMenuItem(`Delete ${stripe.stripe}`, evt => {
        yfiles.input.ICommand.DELETE.execute(stripe.stripe, graphComponent)
      })

      contextMenu.addMenuItem(`Insert new stripe before ${stripe.stripe}`, evt => {
        const parent = stripe.stripe.parentStripe
        const index = stripe.stripe.index
        tableEditorInputMode.insertChild(parent, index)
      })
      contextMenu.addMenuItem(`Insert new stripe after ${stripe.stripe}`, evt => {
        const parent = stripe.stripe.parentStripe
        const index = stripe.stripe.index
        tableEditorInputMode.insertChild(parent, index + 1)
      })
      args.showMenu = true
      return
    }
    const tableNode = graphEditorInputMode.findItems(
      args.queryLocation,
      [yfiles.graph.GraphItemTypes.NODE],
      item => item.lookup(yfiles.graph.ITable.$class) !== null
    )
    if (tableNode !== null && tableNode.size > 0) {
      contextMenu.addMenuItem(`ContextMenu for ${tableNode.first()}`, null)
      args.showMenu = true
      return
    }
    args.showMenu = false
  }

  /**
   * Helper method that uses {@link yfiles.input.TableEditorInputMode#findStripe}
   * to retrieve a stripe at a certain location.
   * @param {yfiles.geometry.Point} location
   * @return {yfiles.input.StripeSubregion}
   */
  function getStripe(location) {
    return tableEditorInputMode.findStripe(
      location,
      yfiles.graph.StripeTypes.ALL,
      yfiles.input.StripeSubregionTypes.HEADER
    )
  }

  function graphLoaded() {
    graphComponent.fitGraphBounds()

    // Configure Undo...
    // Enable general undo support
    graph.undoEngineEnabled = true
    // Use the undo support from the graph also for all future table instances
    yfiles.graph.Table.installStaticUndoSupport(graph)

    // provide no candidates for edge creation at pool nodes - this effectively disables
    // edge creations for those nodes
    graph.decorator.nodeDecorator.portCandidateProviderDecorator.setImplementation(
      node => node.lookup(yfiles.graph.ITable.$class) !== null,
      yfiles.input.IPortCandidateProvider.NO_CANDIDATES
    )

    // customize marquee selection handling for pool nodes
    graph.decorator.nodeDecorator.marqueeTestableDecorator.setFactory(
      node => node.lookup(yfiles.graph.ITable.$class) !== null,
      node => new PoolNodeMarqueeTestable(node.layout)
    )
  }

  /**
   * Perform a hierarchic layout that also configures the tables.
   * Table support is automatically enabled in {@link yfiles.layout.LayoutExecutor}. The layout will:
   * - Arrange all leaf nodes in a hierarchic layout inside their respective table cells
   * - Resize all table cells to encompass their child nodes. Optionally,
   *   {@link yfiles.layout.TableLayoutConfigurator#compaction} allows to shrink table cells, otherwise, table cells
   *   can only grow.
   */
  function applyLayout() {
    const layout = new yfiles.hierarchic.HierarchicLayout()
    layout.componentLayoutEnabled = false
    layout.layoutOrientation = yfiles.layout.LayoutOrientation.LEFT_TO_RIGHT
    layout.orthogonalRouting = true
    layout.recursiveGroupLayering = false

    layout.nodePlacer.barycenterMode = true

    // We use Layout executor convenience method that already sets up the whole layout pipeline correctly
    const layoutExecutor = new yfiles.layout.LayoutExecutor(
      graphComponent,
      new yfiles.layout.MinimumNodeSizeStage(layout)
    )
    // Table layout is enabled by default already...
    layoutExecutor.configureTableLayout = true
    // Table cells may only grow by an automatic layout.
    layoutExecutor.tableLayoutConfigurator.compaction = false
    layoutExecutor.duration = '0.5s'
    layoutExecutor.animateViewport = true

    if (!isLayoutRunning) {
      // Do not start another layout if it is running already.
      isLayoutRunning = true
      setUIDisabled(true)
      layoutExecutor
        .start()
        .then(() => {
          isLayoutRunning = false
          setUIDisabled(false)
        })
        .catch(error => {
          setUIDisabled(false)
          if (typeof window.reportError === 'function') {
            window.reportError(error)
          }
        })
    }
  }

  /**
   * Disables the HTML elements of the UI and the input mode.
   *
   * @param disabled true if the elements should be disabled, false otherwise
   */
  function setUIDisabled(disabled) {
    document.getElementById('newButton').disabled = disabled
    document.getElementById('layoutButton').disabled = disabled
    graphComponent.inputMode.waiting = disabled
  }

  /**
   * Creates the nodes that provide the visualizations for the style panel.
   * @return {yfiles.graph.SimpleNode[]}
   */
  function createDndPanelNodes() {
    const nodeContainer = []

    // Dummy table that serves to hold only a sample row
    const rowSampleTable = new yfiles.graph.Table()
    // Dummy table that serves to hold only a sample column
    const columnSampleTable = new yfiles.graph.Table()

    // Configure the defaults for the row sample table
    // We use a node control style and pass the style specific instance b a custom messenger object (e.g.
    // StripeDescriptor)
    rowSampleTable.rowDefaults.style = new yfiles.styles.NodeStyleStripeStyleAdapter(
      new TableStyles.DemoStripeStyle()
    )

    // Create the sample row
    const rowSampleRow = rowSampleTable.createRow()
    // Create an invisible sample column in this table so that we will see something.
    const rowSampleColumn = rowSampleTable.createColumn(
      160,
      null,
      null,
      new yfiles.styles.NodeStyleStripeStyleAdapter(yfiles.styles.VoidNodeStyle.INSTANCE)
    )
    // The sample row uses empty insets
    rowSampleTable.setStripeInsets(rowSampleColumn, yfiles.geometry.Insets.EMPTY)
    const rowLabel = rowSampleTable.addLabel(rowSampleRow, 'Row')
    rowLabel.style.textFill = yfiles.view.Fill.WHITE

    const columnSampleRow = columnSampleTable.createRow(
      160,
      null,
      null,
      new yfiles.styles.NodeStyleStripeStyleAdapter(yfiles.styles.VoidNodeStyle.INSTANCE)
    )
    const columnSampleColumn = columnSampleTable.createColumn(
      160,
      null,
      null,
      new yfiles.styles.NodeStyleStripeStyleAdapter(new TableStyles.DemoStripeStyle())
    )
    columnSampleTable.setStripeInsets(columnSampleRow, yfiles.geometry.Insets.EMPTY)
    const columnLabel = columnSampleTable.addLabel(columnSampleColumn, 'Column')
    columnLabel.style.textFill = yfiles.view.Fill.WHITE

    // Table for a complete sample table node
    const sampleTable = new yfiles.graph.Table()
    sampleTable.insets = yfiles.geometry.Insets.EMPTY

    // Configure the defaults for the row sample table
    sampleTable.columnDefaults.minimumSize = sampleTable.rowDefaults.minimumSize = 50

    // Setup defaults for the complete sample table
    // We use a custom style that alternates the stripe colors and uses a special style for all parent stripes.
    sampleTable.rowDefaults.style = new yfiles.styles.NodeStyleStripeStyleAdapter(
      new TableStyles.DemoStripeStyle()
    )
    sampleTable.rowDefaults.labels.style.textFill = yfiles.view.Fill.WHITE

    // The style for the columns is simpler, we use a node control style that only points the header insets.
    sampleTable.columnDefaults.style = columnSampleTable.columnDefaults.style = new yfiles.styles.NodeStyleStripeStyleAdapter(
      new TableStyles.DemoStripeStyle()
    )
    sampleTable.columnDefaults.labels.style.textFill = yfiles.view.Fill.WHITE

    // Create a row and a column in the sample table
    sampleTable.createGrid(1, 1)
    // Use twice the default width for this sample column (looks nicer in the preview...)
    sampleTable.setSize(sampleTable.columns.first(), sampleTable.columns.first().actualSize * 2)
    // Bind the table to a dummy node which is used for drag & drop
    // Binding the table is performed through a TableNodeStyle instance.
    // Among other things, this also makes the table instance available in the node's lookup

    // Add the sample node for the table
    const sampleTableNode = new yfiles.graph.SimpleNode()
    sampleTableNode.layout = sampleTable.layout.toRect()
    sampleTableNode.style = new TableStyles.DemoTableStyle(sampleTable)
    nodeContainer.push(sampleTableNode)

    // Add sample rows and columns
    // We use dummy nodes to hold the associated stripe instances - this makes the style panel easier to use
    const columnSampleTableNode = new yfiles.graph.SimpleNode()
    columnSampleTableNode.layout = columnSampleTable.layout.toRect()
    columnSampleTableNode.style = new TableStyles.DemoTableStyle(columnSampleTable)
    columnSampleTableNode.tag = columnSampleTable.rootColumn.childColumns.first()
    nodeContainer.push(columnSampleTableNode)

    // Add sample rows and columns
    // We use dummy nodes to hold the associated stripe instances - this makes the style panel easier to use
    const rowSampleTableNode = new yfiles.graph.SimpleNode()
    rowSampleTableNode.layout = rowSampleTable.layout.toRect()
    rowSampleTableNode.style = new TableStyles.DemoTableStyle(rowSampleTable)
    rowSampleTableNode.tag = rowSampleTable.rootRow.childRows.first()
    nodeContainer.push(rowSampleTableNode)

    // Add normal sample leaf and group nodes
    const demoStyleNode = new yfiles.graph.SimpleNode()
    demoStyleNode.layout = new yfiles.geometry.Rect(0, 0, 80, 50)
    demoStyleNode.style = new DemoStyles.DemoNodeStyle()
    nodeContainer.push(demoStyleNode)

    const groupNode = new yfiles.graph.SimpleNode()
    groupNode.layout = new yfiles.geometry.Rect(0, 0, 120, 70)
    groupNode.style = defaultGroupNodeStyle
    groupNode.tag = 'GroupNode'
    nodeContainer.push(groupNode)

    return nodeContainer
  }

  /**
   * Wire up the UI.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindAction("button[data-command='New']", () => {
      graphComponent.graph.clear()
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    })
    app.bindCommand("button[data-command='Open']", iCommand.OPEN, graphComponent, null)
    app.bindCommand("button[data-command='Save']", iCommand.SAVE, graphComponent, null)

    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindAction("button[data-command='LayoutCommand']", applyLayout)
  }

  /**
   * Enables loading and saving the graph to GraphML.
   *
   * @returns {yfiles.graphml.GraphMLSupport} A GraphMLSupport instance
   */
  function enableGraphML() {
    const gs = new yfiles.graphml.GraphMLSupport({
      graphComponent,
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM,
      graphMLIOHandler: new yfiles.graphml.GraphMLIOHandler()
    })
    gs.graphMLIOHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoTableStyle/1.0',
      TableStyles
    )
    gs.graphMLIOHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    return gs
  }

  /**
   * The marquee testable for pool nodes. The pool node should only be selected by marquee, if the entire bounds are
   * within the marquee.
   */
  class PoolNodeMarqueeTestable extends yfiles.lang.Class(yfiles.input.IMarqueeTestable) {
    /**
     * Creates a new instance of PoolNodeMarqueeTestable.
     * @param {yfiles.geometry.Rect} rectangle
     */
    constructor(rectangle) {
      super()
      this.rectangle = rectangle
    }

    /**
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.geometry.Rect} box
     * @return {boolean}
     */
    isInBox(context, box) {
      return box.contains(this.rectangle.topLeft) && box.contains(this.rectangle.bottomRight)
    }
  }

  /**
   * Custom {@link yfiles.input.NodeDropInputMode} that disallows to reparent a table node.
   */
  class MyReparentHandler extends yfiles.lang.Class(yfiles.input.IReparentNodeHandler) {
    /**
     * Creates a new instance of MyReparentHandler.
     * @param {yfiles.input.IReparentNodeHandler} coreHandler
     */
    constructor(coreHandler) {
      super()
      this.coreHandler = coreHandler
    }

    /**
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.graph.INode} node
     * @return {boolean}
     */
    isReparentGesture(context, node) {
      return this.coreHandler.isReparentGesture(context, node)
    }

    /**
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.graph.INode} node
     * @return {boolean}
     */
    shouldReparent(context, node) {
      // Ok, this node has a table associated - disallow dragging into a group node.
      if (node.lookup(yfiles.graph.ITable.$class) !== null) {
        return false
      }
      return this.coreHandler.shouldReparent(context, node)
    }

    /**
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.graph.INode} node
     * @param {yfiles.graph.INode} newParent
     * @return {boolean}
     */
    isValidParent(context, node, newParent) {
      return this.coreHandler.isValidParent(context, node, newParent)
    }

    /**
     * @param {yfiles.input.IInputModeContext} context
     * @param {yfiles.graph.INode} node
     * @param {yfiles.graph.INode} newParent
     */
    reparent(context, node, newParent) {
      this.coreHandler.reparent(context, node, newParent)
    }
  }

  // run the demo
  run()
})
