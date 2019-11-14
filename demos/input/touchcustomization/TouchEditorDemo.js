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
  'DialContextMenu.js',
  'HandleTemplate.js',
  'TouchHandleInputMode.js',
  'WrappingHandle.js',
  'EdgeReconnectionPortCandidateProvider.js',
  'NodePortCandidateProvider.js',
  'utils/DndPanel',
  'resources/license',
  'yfiles/view-folding'
], (
  yfiles,
  app,
  DemoStyles,
  ContextMenu,
  DialContextMenu,
  HandleTemplate,
  TouchHandleInputMode,
  WrappingHandle,
  EdgeReconnectionPortCandidateProvider,
  NodePortCandidateProvider,
  DndPanel
) => {
  let graphComponent = null
  const handleRadius = 15

  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    initializeGraph()

    // initialize the drag and drop panel
    initializeDnDPanel()

    // create the input mode
    const inputMode = createEditorMode()
    graphComponent.inputMode = inputMode
    // initialize the pan snapping selection box
    initializePanSnapping(inputMode)
    // configure the custom handles
    initializeCustomHandles()
    // configure the selection decoration
    configureSelectionDecoration()
    // configure edge reconnection
    configurePortInteraction()

    // create the initial graph
    populateGraph()
    // clear the undo engine
    graphComponent.graph.foldingView.manager.masterGraph.undoEngine.clear()

    app.show(graphComponent)

    graphComponent.fitGraphBounds()
  }

  /**
   * Creates the default input mode for the <code>GraphControl</code>,
   * a {@link yfiles.input.GraphEditorInputMode} and configures it.
   */
  function createEditorMode() {
    const mode = new yfiles.input.GraphEditorInputMode()

    mode.contextMenuItems =
      yfiles.graph.GraphItemTypes.NODE |
      yfiles.graph.GraphItemTypes.EDGE |
      yfiles.graph.GraphItemTypes.LABEL |
      yfiles.graph.GraphItemTypes.BEND

    // disable direct item creation
    mode.allowCreateNode = false
    mode.allowCreateBend = false
    mode.allowCreateEdge = false

    // switch off default edge creation gesture
    mode.createEdgeInputMode.enabled = false
    // switch off marquee selection
    mode.marqueeSelectionInputMode.enabled = false

    // enable grouping
    mode.allowGroupingOperations = true

    mode.textEditorInputMode.autoCommitOnFocusLost = true

    mode.handleInputMode = new TouchHandleInputMode(handleRadius)

    mode.handleInputMode.pressedRecognizerTouch =
      yfiles.input.TouchEventRecognizers.TOUCH_DOWN_PRIMARY
    mode.moveInputMode.pressedRecognizerTouch =
      yfiles.input.TouchEventRecognizers.TOUCH_DOWN_PRIMARY

    // enable lasso selection
    mode.lassoSelectionInputMode.enabled = true

    configureLassoSelection(mode)

    // configure drag and drop
    const nodeDropInputMode = mode.nodeDropInputMode
    nodeDropInputMode.enabled = true
    nodeDropInputMode.isGroupNodePredicate = node =>
      node.style instanceof yfiles.styles.PanelNodeStyle ||
      node.style instanceof DemoStyles.DemoGroupStyle
    nodeDropInputMode.showPreview = true

    // configure input mode priorities
    mode.lassoSelectionInputMode.priority = mode.moveViewportInputMode.priority - 1
    mode.moveInputMode.priority = mode.moveViewportInputMode.priority - 2
    mode.handleInputMode.priority = mode.moveViewportInputMode.priority - 3

    initializeContextMenu(mode)
    addCancelButtonListeners(mode)

    return mode
  }

  /**
   * Customizes lasso selection start and finish gestures.
   */
  function configureLassoSelection(mode) {
    // configure tap-down start gesture for lasso selection
    let lastTapLocation = null
    let lastTapTime = null
    mode.tapInputMode.addTappedListener((sender, args) => {
      // remember the location and time of the last tap
      lastTapLocation = args.location
      lastTapTime = new Date()
    })
    mode.lassoSelectionInputMode.prepareRecognizerTouch = (sender, args) => {
      // check if the event was a touch down
      if (
        lastTapTime !== null &&
        yfiles.input.TouchEventRecognizers.TOUCH_DOWN_PRIMARY(sender, args)
      ) {
        // check if it occured within the valid double tap time and range
        const timeDelta = new Date() - lastTapTime
        const distanceDelta = lastTapLocation.distanceTo(args.location)
        return (
          timeDelta < graphComponent.doubleTapTime.totalMilliseconds &&
          distanceDelta < graphComponent.doubleTapSize.width
        )
      }
      return false
    }
    // configure touch/mouse up as finish gesture for lasso selection
    mode.lassoSelectionInputMode.finishRecognizerTouch =
      yfiles.input.TouchEventRecognizers.TOUCH_UP_PRIMARY
    mode.lassoSelectionInputMode.finishRecognizer = yfiles.input.MouseEventRecognizers.UP
  }

  /**
   * Registers the input mode listeners that show and hide the cancel button.
   */
  function addCancelButtonListeners(mode) {
    const cancelButton = document.getElementById('cancelButton')

    const createEdgeButtonListener = evt => {
      mode.createEdgeInputMode.cancel()
    }
    mode.createEdgeInputMode.addEdgeCreationStartedListener(() => {
      cancelButton.innerHTML = 'Cancel Edge Creation'
      cancelButton.className = 'demo-button-visible'
      cancelButton.addEventListener('click', createEdgeButtonListener)
    })
    mode.createEdgeInputMode.addGestureFinishedListener(() => {
      cancelButton.className = 'demo-button-invisible'
      cancelButton.removeEventListener('click', createEdgeButtonListener)
    })
    mode.createEdgeInputMode.addGestureCanceledListener(() => {
      cancelButton.className = 'demo-button-invisible'
      cancelButton.removeEventListener('click', createEdgeButtonListener)
    })

    const resizeNodeButtonListener = evt => {
      mode.handleInputMode.cancel()
    }
    mode.handleInputMode.addDragStartedListener(() => {
      const type = mode.handleInputMode.currentHandle.type & yfiles.input.HandleTypes.TYPE_MASK
      switch (type) {
        case yfiles.input.HandleTypes.RESIZE:
          cancelButton.innerHTML = 'Cancel Resize'
          break
        default:
        case yfiles.input.HandleTypes.MOVE:
          cancelButton.innerHTML = 'Cancel Move'
      }

      cancelButton.className = 'demo-button-visible'
      cancelButton.addEventListener('click', resizeNodeButtonListener)
      // register the touchend listener because click is not fired for the secondary pointer
      cancelButton.addEventListener('touchend', resizeNodeButtonListener)
    })
    mode.handleInputMode.addDragFinishedListener(() => {
      cancelButton.className = 'demo-button-invisible'
      cancelButton.removeEventListener('click', resizeNodeButtonListener)
      cancelButton.removeEventListener('touchend', resizeNodeButtonListener)
    })
    mode.handleInputMode.addDragCanceledListener(() => {
      cancelButton.className = 'demo-button-invisible'
      cancelButton.removeEventListener('click', resizeNodeButtonListener)
      cancelButton.removeEventListener('touchend', resizeNodeButtonListener)
    })

    const moveNodeButtonListener = evt => {
      mode.moveInputMode.cancel()
    }
    mode.moveInputMode.addDragStartedListener(() => {
      cancelButton.innerHTML = 'Cancel Node Move'
      cancelButton.className = 'demo-button-visible'
      cancelButton.addEventListener('click', moveNodeButtonListener)
      // register the touchend listener because click is not fired for the secondary pointer
      cancelButton.addEventListener('touchend', moveNodeButtonListener)
    })
    mode.moveInputMode.addDragFinishedListener(() => {
      cancelButton.className = 'demo-button-invisible'
      cancelButton.removeEventListener('click', moveNodeButtonListener)
      cancelButton.removeEventListener('touchend', moveNodeButtonListener)
    })
    mode.moveInputMode.addDragCanceledListener(() => {
      cancelButton.className = 'demo-button-invisible'
      cancelButton.removeEventListener('click', moveNodeButtonListener)
      cancelButton.removeEventListener('touchend', moveNodeButtonListener)
    })
  }

  /**
   * Initializes the dial context menu.
   * @param mode
   */
  function initializeContextMenu(mode) {
    const contextMenu = new DialContextMenu(graphComponent)
    contextMenu.addEventListeners(graphComponent, handleContextMenuTrigger)

    /**
     * This listener function informs the ContextMenuInputMode that a context menu should be opened. If that is
     * permitted by ContextMenuInputMode, this method actually makes the HTML elements of the menu visible.
     * @param {yfiles.geometry.Point} location
     */
    function handleContextMenuTrigger(location) {
      const worldLocation = graphComponent.toWorldCoordinates(
        graphComponent.toViewFromPage(location)
      )
      const showMenu = mode.contextMenuInputMode.shouldOpenMenu(worldLocation)

      // Check whether showing the context menu is permitted
      if (showMenu) {
        contextMenu.show(location, document.body)
      }
    }

    // Add an event listener that populates the context menu according to the hit elements or cancels showing a menu.
    // In this demo, we add item-specific menu entries for nodes, edges, and the empty canvas
    mode.addPopulateItemContextMenuListener((sender, args) =>
      populateContextMenu(contextMenu, args)
    )

    // Add a listener that closes the menu when the input mode requests this
    mode.contextMenuInputMode.addCloseMenuListener(() => contextMenu.close())

    // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
    contextMenu.setOnCloseCallback(() => mode.contextMenuInputMode.menuClosed())
  }

  /**
   * Populates the context menu with items.
   */
  function populateContextMenu(contextMenu, args) {
    args.showMenu = true
    contextMenu.clearItems()

    const item = args.item

    updateSelection(item)
    contextMenu.graphItem = item
    if (yfiles.graph.INode.isInstance(item)) {
      // configure node context menu
      contextMenu
        .addContextMenuItem(
          (location, node) => {
            yfiles.input.ICommand.EDIT_LABEL.execute(node, graphComponent)
          },
          'resources/edit.svg',
          'Edit Label'
        )
        .addContextMenuItem(
          () => {
            yfiles.input.ICommand.GROUP_SELECTION.execute(null, graphComponent)
          },
          'resources/group.svg',
          'Group Selected Nodes'
        )
        .addContextMenuItem(deleteSelectedNodes, 'resources/delete.svg', 'Delete Selected Nodes')
        .addContextMenuItem(startEdgeCreation, 'resources/create-edge.svg', 'Create Edge')
        .addContextMenuItem(
          () => yfiles.input.ICommand.COPY.execute(null, graphComponent),
          'resources/copy.svg',
          'Copy Selection',
          graphComponent.selection.size === 0
        )
        .addContextMenuItem(
          () => yfiles.input.ICommand.CUT.execute(null, graphComponent),
          'resources/cut.svg',
          'Cut Selection',
          graphComponent.selection.size === 0
        )
        .addContextMenuItem(
          location => yfiles.input.ICommand.PASTE.execute(location, graphComponent),
          'resources/paste.svg',
          'Paste',
          graphComponent.clipboard.empty
        )
    } else if (yfiles.graph.IEdge.isInstance(item)) {
      // configure edge context menu
      contextMenu
        .addContextMenuItem(
          (location, edge) => {
            yfiles.input.ICommand.EDIT_LABEL.execute(edge, graphComponent)
          },
          'resources/edit.svg',
          'Edit Label'
        )
        .addContextMenuItem(createBend, 'resources/create-bend.svg', 'Create Bend')
        .addContextMenuItem(deleteSelectedEdges, 'resources/delete.svg', 'Delete Selected Edges')
        .addContextMenuItem(
          () => yfiles.input.ICommand.COPY.execute(null, graphComponent),
          'resources/copy.svg',
          'Copy Selection',
          graphComponent.selection.size === 0
        )
        .addContextMenuItem(
          () => yfiles.input.ICommand.CUT.execute(null, graphComponent),
          'resources/cut.svg',
          'Cut Selection',
          graphComponent.selection.size === 0
        )
        .addContextMenuItem(
          location => yfiles.input.ICommand.PASTE.execute(location, graphComponent),
          'resources/paste.svg',
          'Paste',
          graphComponent.clipboard.empty
        )
    } else if (yfiles.graph.ILabel.isInstance(item)) {
      // configure label context menu
      contextMenu
        .addContextMenuItem(
          (location, label) => {
            yfiles.input.ICommand.EDIT_LABEL.execute(label, graphComponent)
          },
          'resources/edit.svg',
          'Edit Label'
        )
        .addContextMenuItem(deleteSelectedLabels, 'resources/delete.svg', 'Delete Selected Labels')
        .addContextMenuItem(
          () => yfiles.input.ICommand.COPY.execute(null, graphComponent),
          'resources/copy.svg',
          'Copy Selection',
          graphComponent.selection.size === 0
        )
        .addContextMenuItem(
          () => yfiles.input.ICommand.CUT.execute(null, graphComponent),
          'resources/cut.svg',
          'Cut Selection',
          graphComponent.selection.size === 0
        )
    } else if (yfiles.graph.IBend.isInstance(item)) {
      contextMenu.addContextMenuItem(
        deleteSelectedBends,
        'resources/delete.svg',
        'Delete Selected Bends'
      )
      // configure bend context menu
    } else if (item === null) {
      // configure background context menu
      contextMenu
        .addContextMenuItem(
          () => yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent),
          'resources/fit-content.svg',
          'Fit Content'
        )
        .addContextMenuItem(
          () => yfiles.input.ICommand.UNDO.execute(null, graphComponent),
          'resources/backward.svg',
          'Undo',
          !yfiles.input.ICommand.UNDO.canExecute(null, graphComponent)
        )
        .addContextMenuItem(
          () => yfiles.input.ICommand.REDO.execute(null, graphComponent),
          'resources/forward.svg',
          'Redo',
          !yfiles.input.ICommand.REDO.canExecute(null, graphComponent)
        )
        .addContextMenuItem(
          location => {
            graphComponent.graph.createNodeAt(location)
          },
          'resources/create-node.svg',
          'Create Node'
        )
        .addContextMenuItem(
          () => yfiles.input.ICommand.COPY.execute(null, graphComponent),
          'resources/copy.svg',
          'Copy Selection',
          graphComponent.selection.size === 0
        )
        .addContextMenuItem(
          () => yfiles.input.ICommand.CUT.execute(null, graphComponent),
          'resources/cut.svg',
          'Cut Selection',
          graphComponent.selection.size === 0
        )
        .addContextMenuItem(
          location => yfiles.input.ICommand.PASTE.execute(location, graphComponent),
          'resources/paste.svg',
          'Paste',
          graphComponent.clipboard.empty
        )
    } else {
      args.showMenu = false
    }
  }

  /**
   * Helper method that updates the selection state when the context menu is opened on a graph item.
   * @param {yfiles.graph.IModelItem} item The item or <code>null</code>.
   */
  function updateSelection(item) {
    if (
      yfiles.graph.INode.isInstance(item) ||
      yfiles.graph.IEdge.isInstance(item) ||
      yfiles.graph.ILabel.isInstance(item) ||
      yfiles.graph.IBend.isInstance(item)
    ) {
      if (!graphComponent.selection.isSelected(item)) {
        graphComponent.selection.clear()
        graphComponent.selection.setSelected(item, true)
        graphComponent.currentItem = item
      }
    } else {
      graphComponent.selection.clear()
    }
  }

  /**
   * Installs custom handle visualizations for resize and move handles.
   */
  function initializeCustomHandles() {
    // create the handle templates
    const handleTemplateDefault = `<ellipse cx='${handleRadius}' cy='${handleRadius}' rx='${handleRadius}' ry='${handleRadius}' class='demo-handle demo-handle-default'></ellipse>`
    const handleTemplateMove = `<ellipse cx='${handleRadius}' cy='${handleRadius}' rx='${handleRadius}' ry='${handleRadius}' class='demo-handle demo-handle-move'></ellipse>`
    const handleTemplateMoveBend = `<ellipse cx='${handleRadius}' cy='${handleRadius}' rx='${handleRadius}' ry='${handleRadius}' class='demo-handle demo-handle-move-bend'></ellipse>`
    const handleTemplateResize = `<ellipse cx='${handleRadius}' cy='${handleRadius}' rx='${handleRadius}' ry='${handleRadius}' class='demo-handle demo-handle-resize'></ellipse>`

    // put the custom handles in the resources
    const handleSize = new yfiles.geometry.Size(handleRadius * 2, handleRadius * 2)
    graphComponent.resources.set(
      yfiles.input.HandleInputMode.HANDLE_DRAWING_DEFAULT_KEY,
      new HandleTemplate(handleTemplateDefault, handleSize)
    )
    graphComponent.resources.set(
      yfiles.input.HandleInputMode.HANDLE_DRAWING_MOVE_KEY,
      new HandleTemplate(handleTemplateMove, handleSize)
    )
    graphComponent.resources.set(
      yfiles.input.HandleInputMode.HANDLE_DRAWING_MOVE_VARIANT2_KEY,
      new HandleTemplate(handleTemplateMoveBend, handleSize)
    )
    graphComponent.resources.set(
      yfiles.input.HandleInputMode.HANDLE_DRAWING_RESIZE_KEY,
      new HandleTemplate(handleTemplateResize, handleSize)
    )

    // use variant 2 of move handle for bends
    graphComponent.graph.decorator.bendDecorator.handleDecorator.setImplementationWrapper(
      (bend, handle) =>
        new WrappingHandle(
          handle,
          yfiles.input.HandleTypes.MOVE | yfiles.input.HandleTypes.VARIANT2
        )
    )
  }

  /**
   * Customizes the selection visualization.
   */
  function configureSelectionDecoration() {
    const fill = new yfiles.view.SolidColorFill(86, 143, 195, 255)

    const decorator = graphComponent.graph.decorator

    decorator.nodeDecorator.selectionDecorator.hideImplementation()
    decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()

    // edge selection
    const edgeDecorationInstaller = new yfiles.view.EdgeStyleDecorationInstaller()
    const stroke = new yfiles.view.Stroke(fill, 4)
    edgeDecorationInstaller.edgeStyle = new yfiles.styles.PolylineEdgeStyle({
      stroke
    })

    decorator.edgeDecorator.selectionDecorator.setImplementation(edgeDecorationInstaller)

    graphComponent.selection.addItemSelectionChangedListener((sender, args) => {
      const item = args.item
      if (args.itemSelected && yfiles.graph.IEdge.isInstance(item)) {
        const edge = item
        edge.bends.forEach(bend => {
          graphComponent.selection.setSelected(bend, true)
        })
      }
    })
  }

  /**
   * Makes it possible to reconnect edges to other nodes.
   * Also adds port candidates for each side of a node.
   */
  function configurePortInteraction() {
    const decorator = graphComponent.graph.foldingView.manager.masterGraph.decorator
    decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setFactory(
      edge => new EdgeReconnectionPortCandidateProvider(edge)
    )
    decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
      node => new NodePortCandidateProvider(node)
    )
  }

  /**
   * Initializes the graph instance and set default styles.
   */
  function initializeGraph() {
    // Enable folding
    const foldingManager = new yfiles.graph.FoldingManager()
    const foldingView = foldingManager.createFoldingView()
    graphComponent.graph = foldingView.graph

    foldingManager.masterGraph.undoEngineEnabled = true

    graphComponent.graph.nodeDefaults.size = new yfiles.geometry.Size(100, 60)

    DemoStyles.initDemoStyles(graphComponent.graph)

    const fill = new yfiles.view.SolidColorFill(51, 102, 153, 255)
    const stroke = new yfiles.view.Stroke(fill, 4)
    graphComponent.graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke,
      targetArrow: new yfiles.styles.Arrow({
        fill,
        type: yfiles.styles.ArrowType.TRIANGLE,
        scale: 2
      })
    })
  }

  /**
   * Deletes all selected nodes.
   */
  function deleteSelectedNodes() {
    const nodesToRemove = graphComponent.selection.selectedNodes.toArray()
    nodesToRemove.forEach(node => {
      graphComponent.graph.remove(node)
    })
  }

  /**
   * Deletes all selected edges.
   */
  function deleteSelectedEdges() {
    const edgesToRemove = graphComponent.selection.selectedEdges.toArray()
    edgesToRemove.forEach(edge => {
      graphComponent.graph.remove(edge)
    })
  }

  /**
   * Deletes all selected labels.
   */
  function deleteSelectedLabels() {
    const labelsToRemove = graphComponent.selection.selectedLabels.toArray()
    labelsToRemove.forEach(label => {
      graphComponent.graph.remove(label)
    })
  }

  /**
   * Deletes all selected bends.
   */
  function deleteSelectedBends() {
    const bendsToRemove = graphComponent.selection.selectedBends.toArray()
    bendsToRemove.forEach(bend => {
      graphComponent.graph.remove(bend)
    })
  }

  /**
   * Starts edge creation at the given node.
   */
  function startEdgeCreation(location, node) {
    setTimeout(() => {
      graphComponent.inputMode.createEdgeInputMode.enabled = true
      yfiles.input.ICommand.BEGIN_EDGE_CREATION.execute(node, graphComponent)
      const listener = () => {
        graphComponent.inputMode.createEdgeInputMode.enabled = false
        graphComponent.inputMode.createEdgeInputMode.removeGestureFinishedListener(listener)
        graphComponent.inputMode.createEdgeInputMode.removeGestureCanceledListener(listener)
      }
      graphComponent.inputMode.createEdgeInputMode.addGestureFinishedListener(listener)
      graphComponent.inputMode.createEdgeInputMode.addGestureCanceledListener(listener)
    }, 0)
  }

  /**
   * Creates a bend at the given location for the specified edge.
   */
  function createBend(location, edge) {
    const bendCreator = edge.lookup(yfiles.input.IBendCreator.$class)
    let bend = null
    if (bendCreator) {
      const bendIndex = bendCreator.createBend(
        graphComponent.inputMode.inputModeContext,
        graphComponent.graph,
        edge,
        location
      )
      bend = edge.bends.elementAt(bendIndex)
    } else {
      bend = graphComponent.graph.addBend(edge, location)
    }
    graphComponent.selection.clear()
    graphComponent.selection.setSelected(bend, true)
  }

  /**
   * Initializes the drag and drop panel.
   */
  function initializeDnDPanel() {
    const dndPanel = new DndPanel.DragAndDropPanel(document.getElementById('dndPanel'))
    // Set the callback that starts the actual drag and drop operation
    dndPanel.beginDragCallback = (element, data) =>
      yfiles.input.NodeDropInputMode.startDrag(element, data, yfiles.view.DragDropEffects.ALL)
    dndPanel.maxItemWidth = 160
    dndPanel.populatePanel(createDnDPanelNodes)
  }

  /**
   * Initializes the snap panning selection box.
   */
  function initializePanSnapping(inputMode) {
    const select = document.querySelector('#snapPanningBox>select')
    select.addEventListener('change', evt => {
      const item = select[select.selectedIndex]
      switch (item.value) {
        case 'horizontal':
          inputMode.moveViewportInputMode.snapPanning = yfiles.input.SnapPanningBehaviors.HORIZONTAL
          break
        case 'vertical':
          inputMode.moveViewportInputMode.snapPanning = yfiles.input.SnapPanningBehaviors.VERTICAL
          break
        case 'both':
          inputMode.moveViewportInputMode.snapPanning = yfiles.input.SnapPanningBehaviors.BOTH
          break
        default:
          inputMode.moveViewportInputMode.snapPanning = yfiles.input.SnapPanningBehaviors.NONE
      }
    })
  }

  /**
   * Creates the nodes that provide the visualizations for the drag and drop panel.
   */
  function createDnDPanelNodes() {
    // Create a new temporary graph for the nodes
    const nodeContainer = new yfiles.graph.DefaultGraph()

    // Create some nodes
    const groupStyle = new DemoStyles.DemoGroupStyle()
    groupStyle.isCollapsible = true
    groupStyle.solidHitTest = true
    const groupNodeStyle = groupStyle

    // A label model with insets for the expand/collapse button
    const groupLabelModel = new yfiles.graph.InteriorStretchLabelModel()
    groupLabelModel.insets = new yfiles.geometry.Insets(4, 4, 4, 4)

    const groupLabelStyle = new yfiles.styles.DefaultLabelStyle({
      textFill: yfiles.view.Fill.WHITE
    })

    const node = nodeContainer.createNode(new yfiles.geometry.Rect(0, 0, 120, 120), groupNodeStyle)
    nodeContainer.addLabel(
      node,
      'Group Node',
      groupLabelModel.createParameter(yfiles.graph.InteriorStretchLabelModelPosition.NORTH),
      groupLabelStyle
    )

    const nodeColor = new yfiles.view.Color(255, 140, 0, 255)
    const orangeFill = new yfiles.view.SolidColorFill(nodeColor)
    orangeFill.freeze()
    nodeContainer.createNode(
      new yfiles.geometry.Rect(0, 0, 100, 60),
      new DemoStyles.DemoNodeStyle()
    )

    const shapeNodeStyle = new yfiles.styles.ShapeNodeStyle({
      shape: yfiles.styles.ShapeNodeShape.ROUND_RECTANGLE,
      stroke: new yfiles.view.Stroke(orangeFill),
      fill: orangeFill
    })
    nodeContainer.createNode(new yfiles.geometry.Rect(0, 0, 100, 60), shapeNodeStyle)
    nodeContainer.createNode(
      new yfiles.geometry.Rect(0, 0, 100, 60),
      new yfiles.styles.BevelNodeStyle({ color: nodeColor })
    )

    const shinyPlateNodeStyle = new yfiles.styles.ShinyPlateNodeStyle({
      fill: new yfiles.view.SolidColorFill(nodeColor),
      drawShadow: false
    })
    nodeContainer.createNode(new yfiles.geometry.Rect(0, 0, 100, 60), shinyPlateNodeStyle)

    return nodeContainer.nodes.toArray()
  }

  /**
   * Creates a sample graph.
   */
  function populateGraph() {
    const graph = graphComponent.graph

    const node1 = graph.createNodeAt(new yfiles.geometry.Point(30, 30))
    const node2 = graph.createNodeAt(new yfiles.geometry.Point(30, 250))

    graph.createEdge(node1, node2)
    const e = graph.createEdge(node1, node2)
    graph.addBend(e, new yfiles.geometry.Point(200, 30))
    graph.addBend(e, new yfiles.geometry.Point(200, 250))
  }

  run()
})
