/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  IGraph,
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
  PopulateItemContextMenuEventArgs,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  ShinyPlateNodeStyle,
  Size,
  SnapPanningBehaviors,
  SolidColorFill,
  Stroke,
  TouchEventArgs,
  TouchEventRecognizers
} from 'yfiles'

import { DragAndDropPanel } from '../../utils/DndPanel.js'
import NodePortCandidateProvider from './NodePortCandidateProvider.js'
import EdgeReconnectionPortCandidateProvider from './EdgeReconnectionPortCandidateProvider.js'
import WrappingHandle from './WrappingHandle.js'
import HandleTemplate from './HandleTemplate.js'
import DialContextMenu from './DialContextMenu.js'
import { DemoGroupStyle, DemoNodeStyle, initDemoStyles } from '../../resources/demo-styles.js'
import TouchHandleInputMode from './TouchHandleInputMode.js'
import { checkLicense, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import PortCandidateTemplate from './PortCandidateTemplate.js'
import { colorSets } from '../../resources/basic-demo-styles.js'

/** @type {GraphComponent} */
let graphComponent

const handleRadius = 15

/**
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.graph = createConfiguredGraph()

  // initialize the drag and drop panel
  initializeDnDPanel()

  // create the input mode
  const geim = createEditorMode()
  graphComponent.inputMode = geim
  // initialize the pan snapping selection box
  initializePanSnapping(geim)
  // configure the custom handles
  initializeCustomHandles(graphComponent)
  // configure the custom port candidates
  initializeCustomPortCandidates(graphComponent)
  // configure the selection decoration
  configureSelectionDecoration(graphComponent)
  // configure edge reconnection
  configurePortInteraction(graphComponent.graph)

  // create the initial graph
  populateGraph(graphComponent.graph)

  // enable undo and redo
  graphComponent.graph.foldingView.manager.masterGraph.undoEngineEnabled = true

  showApp(graphComponent)

  graphComponent.fitGraphBounds()
}

/**
 * Creates the default input mode for the <code>GraphControl</code>,
 * a {@link GraphEditorInputMode} and configures it.
 * @returns {!GraphEditorInputMode}
 */
function createEditorMode() {
  const geim = new GraphEditorInputMode()

  geim.contextMenuItems =
    GraphItemTypes.NODE | GraphItemTypes.EDGE | GraphItemTypes.LABEL | GraphItemTypes.BEND

  // disable direct item creation
  geim.allowCreateNode = false
  geim.allowCreateBend = false
  geim.allowCreateEdge = false

  // switch off default edge creation gesture
  geim.createEdgeInputMode.enabled = false
  // switch off marquee selection
  geim.marqueeSelectionInputMode.enabled = false

  // enable grouping
  geim.allowGroupingOperations = true

  geim.textEditorInputMode.autoCommitOnFocusLost = true

  geim.handleInputMode = new TouchHandleInputMode(handleRadius)

  geim.handleInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY
  geim.moveInputMode.pressedRecognizerTouch = TouchEventRecognizers.TOUCH_DOWN_PRIMARY

  // enable lasso selection
  geim.lassoSelectionInputMode.enabled = true

  configureLassoSelection(geim)

  // configure drag and drop
  const nodeDropInputMode = geim.nodeDropInputMode
  nodeDropInputMode.enabled = true
  nodeDropInputMode.isGroupNodePredicate = node =>
    node.style instanceof PanelNodeStyle || node.style instanceof DemoGroupStyle
  nodeDropInputMode.showPreview = true

  // configure input mode priorities
  geim.lassoSelectionInputMode.priority = geim.moveViewportInputMode.priority - 1
  geim.moveInputMode.priority = geim.moveViewportInputMode.priority - 2
  geim.handleInputMode.priority = geim.moveViewportInputMode.priority - 3

  initializeContextMenu(geim)
  addCancelButtonListeners(geim)

  return geim
}

/**
 * Customizes lasso selection start and finish gestures.
 * @param {!GraphEditorInputMode} geim
 */
function configureLassoSelection(geim) {
  // configure tap-down start gesture for lasso selection
  let lastTapLocation = Point.ORIGIN
  let lastTapTime = new Date()
  geim.tapInputMode.addTappedListener((sender, args) => {
    // remember the location and time of the last tap
    lastTapLocation = args.location
    lastTapTime = new Date()
  })
  geim.lassoSelectionInputMode.prepareRecognizerTouch = (sender, args) => {
    // check if the event was a touch down
    if (lastTapTime !== null && TouchEventRecognizers.TOUCH_DOWN_PRIMARY(sender, args)) {
      // check if it occurred within the valid double tap time and range
      const timeDelta = elapsedTime(lastTapTime, new Date())
      const distanceDelta = lastTapLocation.distanceTo(args.location)
      return (
        timeDelta < graphComponent.doubleTapTime.totalMilliseconds &&
        distanceDelta < graphComponent.doubleTapSize.width
      )
    }
    return false
  }
  // configure touch/mouse up as finish gesture for lasso selection
  geim.lassoSelectionInputMode.finishRecognizerTouch = TouchEventRecognizers.TOUCH_UP_PRIMARY
  geim.lassoSelectionInputMode.finishRecognizer = MouseEventRecognizers.UP
}

/**
 * Calculates the milliseconds that lie between the two given dates.
 * @param {!Date} before
 * @param {!Date} after
 * @returns {number}
 */
function elapsedTime(before, after) {
  const t1 = before.getTime()
  const t2 = after.getTime()
  return t2 - t1
}

/**
 * Registers the input mode listeners that show and hide the cancel button.
 * @param {!GraphEditorInputMode} geim
 */
function addCancelButtonListeners(geim) {
  const cancelButton = document.getElementById('cancelButton')

  const createEdgeButtonListener = () => {
    geim.createEdgeInputMode.cancel()
  }
  geim.createEdgeInputMode.addEdgeCreationStartedListener(() => {
    cancelButton.innerHTML = 'Cancel Edge Creation'
    cancelButton.className = 'demo-button-visible'
    cancelButton.addEventListener('click', createEdgeButtonListener)
  })
  geim.createEdgeInputMode.addGestureFinishedListener(() => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', createEdgeButtonListener)
  })
  geim.createEdgeInputMode.addGestureCanceledListener(() => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', createEdgeButtonListener)
  })

  const resizeNodeButtonListener = () => {
    geim.handleInputMode.cancel()
  }
  geim.handleInputMode.addDragStartedListener(() => {
    const handle = geim.handleInputMode.currentHandle
    const type = (handle ? handle.type : HandleTypes.MOVE) & HandleTypes.TYPE_MASK
    switch (type) {
      case HandleTypes.RESIZE:
        cancelButton.innerHTML = 'Cancel Resize'
        break
      default:
        cancelButton.innerHTML = 'Cancel Move'
        break
    }

    cancelButton.className = 'demo-button-visible'
    cancelButton.addEventListener('click', resizeNodeButtonListener)
    // register the touchend listener because click is not fired for the secondary pointer
    cancelButton.addEventListener('touchend', resizeNodeButtonListener)
  })
  geim.handleInputMode.addDragFinishedListener(() => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', resizeNodeButtonListener)
    cancelButton.removeEventListener('touchend', resizeNodeButtonListener)
  })
  geim.handleInputMode.addDragCanceledListener(() => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', resizeNodeButtonListener)
    cancelButton.removeEventListener('touchend', resizeNodeButtonListener)
  })

  const moveNodeButtonListener = () => {
    geim.moveInputMode.cancel()
  }
  geim.moveInputMode.addDragStartedListener(() => {
    cancelButton.innerHTML = 'Cancel Node Move'
    cancelButton.className = 'demo-button-visible'
    cancelButton.addEventListener('click', moveNodeButtonListener)
    // register the touchend listener because click is not fired for the secondary pointer
    cancelButton.addEventListener('touchend', moveNodeButtonListener)
  })
  geim.moveInputMode.addDragFinishedListener(() => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', moveNodeButtonListener)
    cancelButton.removeEventListener('touchend', moveNodeButtonListener)
  })
  geim.moveInputMode.addDragCanceledListener(() => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', moveNodeButtonListener)
    cancelButton.removeEventListener('touchend', moveNodeButtonListener)
  })
}

/**
 * Initializes the dial context menu.
 * @param {!GraphEditorInputMode} geim
 */
function initializeContextMenu(geim) {
  const contextMenu = new DialContextMenu(graphComponent)
  contextMenu.addEventListeners(graphComponent, location => {
    const worldLocation = graphComponent.toWorldCoordinates(graphComponent.toViewFromPage(location))
    const showMenu = geim.contextMenuInputMode.shouldOpenMenu(worldLocation)

    // Check whether showing the context menu is permitted
    if (showMenu) {
      contextMenu.show(location, document.body)
    }
  })

  // Add an event listener that populates the context menu according to the hit elements or cancels showing a menu.
  // In this demo, we add item-specific menu entries for nodes, edges, and the empty canvas
  geim.addPopulateItemContextMenuListener((sender, args) => populateContextMenu(contextMenu, args))

  // Add a listener that closes the menu when the input mode requests this
  geim.contextMenuInputMode.addCloseMenuListener(() => contextMenu.close())

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.setOnCloseCallback(() => geim.contextMenuInputMode.menuClosed())
}

/**
 * Populates the context menu with items.
 * @param {!DialContextMenu} contextMenu
 * @param {!PopulateItemContextMenuEventArgs.<IModelItem>} args
 */
function populateContextMenu(contextMenu, args) {
  args.showMenu = true
  contextMenu.clearItems()

  const item = args.item

  updateSelection(item)
  contextMenu.graphItem = item

  if (item instanceof INode) {
    addNodeActions(contextMenu, item)
  } else if (item instanceof IEdge) {
    addEdgeActions(contextMenu, item)
  } else if (item instanceof ILabel) {
    addLabelActions(contextMenu, item)
  } else if (item instanceof IBend) {
    addBendActions(contextMenu, item)
  } else if (!item) {
    addCanvasActions(contextMenu)
  } else {
    args.showMenu = false
  }
}

/**
 * Adds actions for nodes to the given context menu.
 * @param {!DialContextMenu} contextMenu
 * @param {!INode} node
 */
function addNodeActions(contextMenu, node) {
  contextMenu
    .addContextMenuItem(
      (location, node) => {
        ICommand.EDIT_LABEL.execute(node, graphComponent)
      },
      'resources/edit.svg',
      'Edit Label',
      false
    )
    .addContextMenuItem(
      () => {
        ICommand.GROUP_SELECTION.execute(null, graphComponent)
      },
      'resources/group.svg',
      'Group Selected Nodes',
      false
    )
    .addContextMenuItem(deleteSelectedNodes, 'resources/delete.svg', 'Delete Selected Nodes', false)
    .addContextMenuItem(startEdgeCreation, 'resources/create-edge.svg', 'Create Edge', false)
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
}

/**
 * Adds actions for edges to the given context menu.
 * @param {!DialContextMenu} contextMenu
 * @param {!IEdge} edge
 */
function addEdgeActions(contextMenu, edge) {
  contextMenu
    .addContextMenuItem(
      (location, edge) => {
        ICommand.EDIT_LABEL.execute(edge, graphComponent)
      },
      'resources/edit.svg',
      'Edit Label',
      false
    )
    .addContextMenuItem(createBend, 'resources/create-bend.svg', 'Create Bend', false)
    .addContextMenuItem(deleteSelectedEdges, 'resources/delete.svg', 'Delete Selected Edges', false)
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
}

/**
 * Adds actions for bends to the given context menu.
 * @param {!DialContextMenu} contextMenu
 * @param {!IBend} bend
 */
function addBendActions(contextMenu, bend) {
  contextMenu.addContextMenuItem(
    deleteSelectedBends,
    'resources/delete.svg',
    'Delete Selected Bends',
    false
  )
}

/**
 * Adds actions for labels to the given context menu.
 * @param {!DialContextMenu} contextMenu
 * @param {!ILabel} label
 */
function addLabelActions(contextMenu, label) {
  contextMenu
    .addContextMenuItem(
      (location, label) => {
        ICommand.EDIT_LABEL.execute(label, graphComponent)
      },
      'resources/edit.svg',
      'Edit Label',
      false
    )
    .addContextMenuItem(
      deleteSelectedLabels,
      'resources/delete.svg',
      'Delete Selected Labels',
      false
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
}

/**
 * Adds application actions to the given context menu.
 * Application actions are actions that are available when "the context" is not a graph element.
 * @param {!DialContextMenu} contextMenu
 */
function addCanvasActions(contextMenu) {
  contextMenu
    .addContextMenuItem(
      () => ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent),
      'resources/fit-content.svg',
      'Fit Content',
      false
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
      'Create Node',
      false
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
}

/**
 * Helper method that updates the selection state when the context menu is opened on a graph item.
 * @param {?IModelItem} item The item or <code>null</code>.
 */
function updateSelection(item) {
  if (
    item instanceof INode ||
    item instanceof IEdge ||
    item instanceof ILabel ||
    item instanceof IBend
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
 * @param {!GraphComponent} graphComponent
 */
function initializeCustomHandles(graphComponent) {
  // create the handle templates
  const handleTemplateDefault = newHandleTemplate(handleRadius, 'demo-handle-default')
  const handleTemplateMove = newHandleTemplate(handleRadius, 'demo-handle-move')
  const handleTemplateMoveBend = newHandleTemplate(handleRadius, 'demo-handle-move-bend')
  const handleTemplateResize = newHandleTemplate(handleRadius, 'demo-handle-resize')

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
    (bend, handle) =>
      handle ? new WrappingHandle(handle, HandleTypes.MOVE | HandleTypes.VARIANT2, null) : null
  )
}

/**
 * Creates a template string for resize and move handles.
 * @param {number} radius
 * @param {!string} cssClass
 * @returns {!string}
 */
function newHandleTemplate(radius, cssClass) {
  return `<ellipse cx='${handleRadius}' cy='${handleRadius}' rx='${handleRadius}' ry='${handleRadius}' class='demo-handle ${cssClass}'></ellipse>`
}

/**
 * Installs custom port candidate visualizations for interactive edge creation.
 * @param {!GraphComponent} graphComponent
 */
function initializeCustomPortCandidates(graphComponent) {
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
 * @param {!GraphComponent} graphComponent
 */
function configureSelectionDecoration(graphComponent) {
  const decorator = graphComponent.graph.decorator

  decorator.nodeDecorator.selectionDecorator.hideImplementation()
  decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()

  // edge selection
  decorator.edgeDecorator.selectionDecorator.setImplementation(
    new EdgeStyleDecorationInstaller({
      edgeStyle: new PolylineEdgeStyle({
        stroke: '4px #2C4B52'
      })
    })
  )

  graphComponent.selection.addItemSelectionChangedListener((sender, args) => {
    const item = args.item
    if (args.itemSelected && item instanceof IEdge) {
      for (const bend of item.bends) {
        sender.setSelected(bend, true)
      }
    }
  })
}

/**
 * Makes it possible to reconnect edges to other nodes.
 * Also adds port candidates for each side of a node.
 * @param {!IGraph} graph
 */
function configurePortInteraction(graph) {
  const decorator = graph.decorator
  decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator.setFactory(
    edge => new EdgeReconnectionPortCandidateProvider(edge)
  )
  decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    node => new NodePortCandidateProvider(node)
  )
}

/**
 * Initializes the graph instance and set default styles.
 * @returns {!IGraph}
 */
function createConfiguredGraph() {
  // Enable folding
  const foldingManager = new FoldingManager()
  const foldingView = foldingManager.createFoldingView()
  const graph = foldingView.graph

  graph.nodeDefaults.size = new Size(100, 60)

  initDemoStyles(graph)

  const fill = '#662b00'
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: new Stroke(fill, 4),
    targetArrow: new Arrow({
      fill,
      type: ArrowType.TRIANGLE,
      scale: 2
    })
  })

  return graph
}

/**
 * Deletes all selected nodes.
 */
function deleteSelectedNodes() {
  const nodesToRemove = graphComponent.selection.selectedNodes.toArray()
  nodesToRemove.forEach(node => graphComponent.graph.remove(node))
}

/**
 * Deletes all selected edges.
 */
function deleteSelectedEdges() {
  const edgesToRemove = graphComponent.selection.selectedEdges.toArray()
  edgesToRemove.forEach(edge => graphComponent.graph.remove(edge))
}

/**
 * Deletes all selected labels.
 */
function deleteSelectedLabels() {
  const labelsToRemove = graphComponent.selection.selectedLabels.toArray()
  labelsToRemove.forEach(label => graphComponent.graph.remove(label))
}

/**
 * Deletes all selected bends.
 */
function deleteSelectedBends() {
  const bendsToRemove = graphComponent.selection.selectedBends.toArray()
  bendsToRemove.forEach(bend => graphComponent.graph.remove(bend))
}

/**
 * Starts edge creation at the given node.
 * @param {!Point} location
 * @param {!IModelItem} item
 */
function startEdgeCreation(location, item) {
  setTimeout(() => {
    const geim = graphComponent.inputMode
    geim.createEdgeInputMode.enabled = true
    ICommand.BEGIN_EDGE_CREATION.execute(item, graphComponent)
    const listener = () => {
      geim.createEdgeInputMode.enabled = false
      geim.createEdgeInputMode.removeGestureFinishedListener(listener)
      geim.createEdgeInputMode.removeGestureCanceledListener(listener)
    }
    geim.createEdgeInputMode.addGestureFinishedListener(listener)
    geim.createEdgeInputMode.addGestureCanceledListener(listener)
  }, 0)
}

/**
 * Creates a bend at the given location for the given edge.
 * @param {!Point} location
 * @param {!IModelItem} item
 */
function createBend(location, item) {
  const edge = item
  const bendCreator = edge.lookup(IBendCreator.$class)
  let bend
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
 * @param {!GraphEditorInputMode} geim
 */
function initializePanSnapping(geim) {
  const select = document.querySelector('#snapPanningBox>select')
  select.addEventListener('change', () => {
    const item = select[select.selectedIndex]
    switch (item.value) {
      case 'horizontal':
        geim.moveViewportInputMode.snapPanning = SnapPanningBehaviors.HORIZONTAL
        break
      case 'vertical':
        geim.moveViewportInputMode.snapPanning = SnapPanningBehaviors.VERTICAL
        break
      case 'both':
        geim.moveViewportInputMode.snapPanning = SnapPanningBehaviors.BOTH
        break
      default:
        geim.moveViewportInputMode.snapPanning = SnapPanningBehaviors.NONE
        break
    }
  })
}

/**
 * Creates the nodes that provide the visualizations for the drag and drop panel.
 * @returns {!Array.<INode>}
 */
function createDnDPanelNodes() {
  // Create a new temporary graph for the nodes
  const nodeContainer = new DefaultGraph()

  // Create a group node
  const groupNodeStyle = new DemoGroupStyle()
  groupNodeStyle.isCollapsible = true
  groupNodeStyle.solidHitTest = true

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

  // create a node with standard demo node styling
  nodeContainer.createNode(new Rect(0, 0, 100, 60), new DemoNodeStyle('demo-palette-13'))

  // create a shape style node
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    stroke: new Stroke(colorSets['demo-palette-14'].stroke),
    fill: new SolidColorFill(colorSets['demo-palette-14'].fill)
  })
  nodeContainer.createNode(new Rect(0, 0, 100, 60), shapeNodeStyle)

  // create a bevel style node
  nodeContainer.createNode(
    new Rect(0, 0, 100, 60),
    new BevelNodeStyle({ color: colorSets['demo-palette-15'].fill })
  )

  // create a shiny plate style node
  const shinyPlateNodeStyle = new ShinyPlateNodeStyle({
    fill: colorSets['demo-palette-11'].fill,
    drawShadow: false
  })
  nodeContainer.createNode(new Rect(0, 0, 100, 60), shinyPlateNodeStyle)

  return nodeContainer.nodes.toArray()
}

/**
 * Creates a sample graph.
 * @param {!IGraph} graph
 */
function populateGraph(graph) {
  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNodeAt(new Point(30, 250))

  graph.createEdge(node1, node2)
  const e = graph.createEdge(node1, node2)
  graph.addBend(e, new Point(200, 30))
  graph.addBend(e, new Point(200, 250))
}

loadJson().then(checkLicense).then(run)
