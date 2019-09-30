/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
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
import {
  Arrow,
  ArrowType,
  BevelNodeStyle,
  Color,
  ContextMenuInputMode,
  DefaultGraph,
  DefaultLabelStyle,
  DefaultPortCandidateDescriptor,
  DragDropEffects,
  EdgeStyleDecorationInstaller,
  Fill,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HandleInputMode,
  HandleTypes,
  IBend,
  IBendCreator,
  ICommand,
  IEdge,
  ILabel,
  IModelItem,
  INode,
  Insets,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  License,
  MouseEventRecognizers,
  NodeDropInputMode,
  PanelNodeStyle,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  ShinyPlateNodeStyle,
  Size,
  SnapPanningBehaviors,
  SolidColorFill,
  Stroke,
  TouchEventRecognizers
} from 'yfiles'

import { DragAndDropPanel } from '../../utils/DndPanel.js'
import NodePortCandidateProvider from './NodePortCandidateProvider.js'
import EdgeReconnectionPortCandidateProvider from './EdgeReconnectionPortCandidateProvider.js'
import WrappingHandle from './WrappingHandle.js'
import HandleTemplate from './HandleTemplate.js'
import DialContextMenu from './DialContextMenu.js'
import { DemoGroupStyle, initDemoStyles, DemoNodeStyle } from '../../resources/demo-styles.js'
import TouchHandleInputMode from './TouchHandleInputMode.js'
import { showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import PortCandidateTemplate from './PortCandidateTemplate.js'

/** @type {GraphComponent} */
let graphComponent = null

const handleRadius = 15

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
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
  // configure the custom port candidates
  initializeCustomPortCandidates()
  // configure the selection decoration
  configureSelectionDecoration()
  // configure edge reconnection
  configurePortInteraction()

  // create the initial graph
  populateGraph()
  // clear the undo engine
  graphComponent.graph.foldingView.manager.masterGraph.undoEngine.clear()

  showApp(graphComponent)

  graphComponent.fitGraphBounds()
}

/**
 * Creates the default input mode for the <code>GraphControl</code>,
 * a {@link GraphEditorInputMode} and configures it.
 */
function createEditorMode() {
  const mode = new GraphEditorInputMode()

  mode.contextMenuItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL | GraphItemTypes.BEND

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

  mode.handleInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
  mode.moveInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY

  // enable lasso selection
  mode.lassoSelectionInputMode.enabled = true

  configureLassoSelection(mode)

  // configure drag and drop
  const nodeDropInputMode = mode.nodeDropInputMode
  nodeDropInputMode.enabled = true
  nodeDropInputMode.isGroupNodePredicate = node =>
    node.style instanceof PanelNodeStyle || node.style instanceof DemoGroupStyle
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
    if (lastTapTime !== null && TouchEventRecognizers.TOUCH_DOWN_PRIMARY(sender, args)) {
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
  mode.lassoSelectionInputMode.finishRecognizerTouch = TouchEventRecognizers.TOUCH_UP_PRIMARY
  mode.lassoSelectionInputMode.finishRecognizer = MouseEventRecognizers.UP
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
    const type = mode.handleInputMode.currentHandle.type & HandleTypes.TYPE_MASK
    switch (type) {
      case HandleTypes.RESIZE:
        cancelButton.innerHTML = 'Cancel Resize'
        break
      default:
      case HandleTypes.MOVE:
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
   * This listener function informs the {@link ContextMenuInputMode} that a context menu should be opened. If that is
   * permitted by {@link ContextMenuInputMode}, this method actually makes the HTML elements of the menu visible.
   * @param {Point} location
   */
  function handleContextMenuTrigger(location) {
    const worldLocation = graphComponent.toWorldCoordinates(graphComponent.toViewFromPage(location))
    const showMenu = mode.contextMenuInputMode.shouldOpenMenu(worldLocation)

    // Check whether showing the context menu is permitted
    if (showMenu) {
      contextMenu.show(location, document.body)
    }
  }

  // Add an event listener that populates the context menu according to the hit elements or cancels showing a menu.
  // In this demo, we add item-specific menu entries for nodes, edges, and the empty canvas
  mode.addPopulateItemContextMenuListener((sender, args) => populateContextMenu(contextMenu, args))

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
  if (INode.isInstance(item)) {
    // configure node context menu
    contextMenu
      .addContextMenuItem(
        (location, node) => {
          ICommand.EDIT_LABEL.execute(node, graphComponent)
        },
        'resources/edit.svg',
        'Edit Label'
      )
      .addContextMenuItem(
        () => {
          ICommand.GROUP_SELECTION.execute(null, graphComponent)
        },
        'resources/group.svg',
        'Group Selected Nodes'
      )
      .addContextMenuItem(deleteSelectedNodes, 'resources/delete.svg', 'Delete Selected Nodes')
      .addContextMenuItem(startEdgeCreation, 'resources/create-edge.svg', 'Create Edge')
      .addContextMenuItem(
        () => ICommand.COPY.execute(null, graphComponent),
        'resources/copy.svg',
        'Copy Selection',
        graphComponent.selection.size === 0
      )
      .addContextMenuItem(
        () => ICommand.CUT.execute(null, graphComponent),
        'resources/cut.svg',
        'Cut Selection',
        graphComponent.selection.size === 0
      )
      .addContextMenuItem(
        location => ICommand.PASTE.execute(location, graphComponent),
        'resources/paste.svg',
        'Paste',
        graphComponent.clipboard.empty
      )
  } else if (IEdge.isInstance(item)) {
    // configure edge context menu
    contextMenu
      .addContextMenuItem(
        (location, edge) => {
          ICommand.EDIT_LABEL.execute(edge, graphComponent)
        },
        'resources/edit.svg',
        'Edit Label'
      )
      .addContextMenuItem(createBend, 'resources/create-bend.svg', 'Create Bend')
      .addContextMenuItem(deleteSelectedEdges, 'resources/delete.svg', 'Delete Selected Edges')
      .addContextMenuItem(
        () => ICommand.COPY.execute(null, graphComponent),
        'resources/copy.svg',
        'Copy Selection',
        graphComponent.selection.size === 0
      )
      .addContextMenuItem(
        () => ICommand.CUT.execute(null, graphComponent),
        'resources/cut.svg',
        'Cut Selection',
        graphComponent.selection.size === 0
      )
      .addContextMenuItem(
        location => ICommand.PASTE.execute(location, graphComponent),
        'resources/paste.svg',
        'Paste',
        graphComponent.clipboard.empty
      )
  } else if (ILabel.isInstance(item)) {
    // configure label context menu
    contextMenu
      .addContextMenuItem(
        (location, label) => {
          ICommand.EDIT_LABEL.execute(label, graphComponent)
        },
        'resources/edit.svg',
        'Edit Label'
      )
      .addContextMenuItem(deleteSelectedLabels, 'resources/delete.svg', 'Delete Selected Labels')
      .addContextMenuItem(
        () => ICommand.COPY.execute(null, graphComponent),
        'resources/copy.svg',
        'Copy Selection',
        graphComponent.selection.size === 0
      )
      .addContextMenuItem(
        () => ICommand.CUT.execute(null, graphComponent),
        'resources/cut.svg',
        'Cut Selection',
        graphComponent.selection.size === 0
      )
  } else if (IBend.isInstance(item)) {
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
        () => ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent),
        'resources/fit-content.svg',
        'Fit Content'
      )
      .addContextMenuItem(
        () => ICommand.UNDO.execute(null, graphComponent),
        'resources/backward.svg',
        'Undo',
        !ICommand.UNDO.canExecute(null, graphComponent)
      )
      .addContextMenuItem(
        () => ICommand.REDO.execute(null, graphComponent),
        'resources/forward.svg',
        'Redo',
        !ICommand.REDO.canExecute(null, graphComponent)
      )
      .addContextMenuItem(
        location => {
          graphComponent.graph.createNodeAt(location)
        },
        'resources/create-node.svg',
        'Create Node'
      )
      .addContextMenuItem(
        () => ICommand.COPY.execute(null, graphComponent),
        'resources/copy.svg',
        'Copy Selection',
        graphComponent.selection.size === 0
      )
      .addContextMenuItem(
        () => ICommand.CUT.execute(null, graphComponent),
        'resources/cut.svg',
        'Cut Selection',
        graphComponent.selection.size === 0
      )
      .addContextMenuItem(
        location => ICommand.PASTE.execute(location, graphComponent),
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
 * @param {IModelItem} item The item or <code>null</code>.
 */
function updateSelection(item) {
  if (
    INode.isInstance(item) ||
    IEdge.isInstance(item) ||
    ILabel.isInstance(item) ||
    IBend.isInstance(item)
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
  const handleSize = new Size(handleRadius * 2, handleRadius * 2)
  graphComponent.resources.set(
    HandleInputMode.HANDLE_DRAWING_DEFAULT_KEY,
    new HandleTemplate(handleTemplateDefault, handleSize)
  )
  graphComponent.resources.set(
    HandleInputMode.HANDLE_DRAWING_MOVE_KEY,
    new HandleTemplate(handleTemplateMove, handleSize)
  )
  graphComponent.resources.set(
    HandleInputMode.HANDLE_DRAWING_MOVE_VARIANT2_KEY,
    new HandleTemplate(handleTemplateMoveBend, handleSize)
  )
  graphComponent.resources.set(
    HandleInputMode.HANDLE_DRAWING_RESIZE_KEY,
    new HandleTemplate(handleTemplateResize, handleSize)
  )

  // use variant 2 of move handle for bends
  graphComponent.graph.decorator.bendDecorator.handleDecorator.setImplementationWrapper(
    (bend, handle) => new WrappingHandle(handle, HandleTypes.MOVE | HandleTypes.VARIANT2)
  )
}

/**
 * Installs custom port candidate visualizations for interactive edge creation.
 */
function initializeCustomPortCandidates() {
  const validFocusedStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'rgba(11, 85, 23, 0.9)',
    stroke: 'rgba(255, 255, 255, 0.7)'
  })
  const validNonFocusedStyle = new ShapeNodeStyle({
    shape: 'ellipse',
    fill: 'rgba(11, 85, 23, 0.5)',
    stroke: 'rgba(255, 255, 255, 0.3)'
  })

  // use adapter class with the ShapeNodeStyle instances to style the port candidates
  graphComponent.resources.set(
    DefaultPortCandidateDescriptor.CANDIDATE_DRAWING_VALID_FOCUSED_KEY,
    new PortCandidateTemplate(validFocusedStyle)
  )
  graphComponent.resources.set(
    DefaultPortCandidateDescriptor.CANDIDATE_DRAWING_VALID_NON_FOCUSED_KEY,
    new PortCandidateTemplate(validNonFocusedStyle)
  )
}

/**
 * Customizes the selection visualization.
 */
function configureSelectionDecoration() {
  const fill = new SolidColorFill(86, 143, 195, 255)

  const decorator = graphComponent.graph.decorator

  decorator.nodeDecorator.selectionDecorator.hideImplementation()
  decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()

  // edge selection
  const edgeDecorationInstaller = new EdgeStyleDecorationInstaller()
  const stroke = new Stroke(fill, 4)
  edgeDecorationInstaller.edgeStyle = new PolylineEdgeStyle({
    stroke
  })

  decorator.edgeDecorator.selectionDecorator.setImplementation(edgeDecorationInstaller)

  graphComponent.selection.addItemSelectionChangedListener((sender, args) => {
    const item = args.item
    if (args.itemSelected && IEdge.isInstance(item)) {
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
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  graphComponent.graph = foldingView.graph

  foldingManager.masterGraph.undoEngineEnabled = true

  graphComponent.graph.nodeDefaults.size = new Size(100, 60)

  initDemoStyles(graphComponent.graph)

  const fill = new SolidColorFill(51, 102, 153, 255)
  const stroke = new Stroke(fill, 4)
  graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke,
    targetArrow: new Arrow({
      fill,
      type: ArrowType.TRIANGLE,
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
    ICommand.BEGIN_EDGE_CREATION.execute(node, graphComponent)
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
  const bendCreator = edge.lookup(IBendCreator.$class)
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
  const dndPanel = new DragAndDropPanel(document.getElementById('dndPanel'))
  // Set the callback that starts the actual drag and drop operation
  dndPanel.beginDragCallback = (element, data) =>
    NodeDropInputMode.startDrag(element, data, DragDropEffects.ALL)
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
        inputMode.moveViewportInputMode.snapPanning = SnapPanningBehaviors.HORIZONTAL
        break
      case 'vertical':
        inputMode.moveViewportInputMode.snapPanning = SnapPanningBehaviors.VERTICAL
        break
      case 'both':
        inputMode.moveViewportInputMode.snapPanning = SnapPanningBehaviors.BOTH
        break
      default:
        inputMode.moveViewportInputMode.snapPanning = SnapPanningBehaviors.NONE
    }
  })
}

/**
 * Creates the nodes that provide the visualizations for the drag and drop panel.
 */
function createDnDPanelNodes() {
  // Create a new temporary graph for the nodes
  const nodeContainer = new DefaultGraph()

  // Create some nodes
  const groupStyle = new DemoGroupStyle()
  groupStyle.isCollapsible = true
  groupStyle.solidHitTest = true
  const groupNodeStyle = groupStyle

  // A label model with insets for the expand/collapse button
  const groupLabelModel = new InteriorStretchLabelModel({ insets: new Insets(4, 4, 4, 4) })

  const groupLabelStyle = new DefaultLabelStyle({
    textFill: Fill.WHITE
  })

  const node = nodeContainer.createNode(new Rect(0, 0, 120, 120), groupNodeStyle)
  nodeContainer.addLabel(
    node,
    'Group Node',
    groupLabelModel.createParameter(InteriorStretchLabelModelPosition.NORTH),
    groupLabelStyle
  )

  const nodeColor = new Color(255, 140, 0, 255)
  const orangeFill = new SolidColorFill(nodeColor)
  orangeFill.freeze()
  nodeContainer.createNode(new Rect(0, 0, 100, 60), new DemoNodeStyle())

  const shapeNodeStyle = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    stroke: new Stroke(orangeFill),
    fill: orangeFill
  })
  nodeContainer.createNode(new Rect(0, 0, 100, 60), shapeNodeStyle)
  nodeContainer.createNode(new Rect(0, 0, 100, 60), new BevelNodeStyle({ color: nodeColor }))

  const shinyPlateNodeStyle = new ShinyPlateNodeStyle({
    fill: new SolidColorFill(nodeColor),
    drawShadow: false
  })
  nodeContainer.createNode(new Rect(0, 0, 100, 60), shinyPlateNodeStyle)

  return nodeContainer.nodes.toArray()
}

/**
 * Creates a sample graph.
 */
function populateGraph() {
  const graph = graphComponent.graph

  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNodeAt(new Point(30, 250))

  graph.createEdge(node1, node2)
  const e = graph.createEdge(node1, node2)
  graph.addBend(e, new Point(200, 30))
  graph.addBend(e, new Point(200, 250))
}

loadJson().then(run)
