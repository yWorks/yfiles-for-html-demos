/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
  ArrowNodeStyle,
  ArrowType,
  Color,
  EdgeStyleIndicatorRenderer,
  EventRecognizers,
  FoldingManager,
  FreeNodePortLocationModel,
  Graph,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GroupNodeStyle,
  HandleType,
  IBend,
  IBendCreator,
  IEdge,
  ILabel,
  INode,
  LabelStyle,
  License,
  Point,
  PolylineEdgeStyle,
  PortCandidate,
  PortRelocationHandleProvider,
  Rect,
  RectangleCornerStyle,
  RectangleNodeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  SnapPanningBehaviors,
  StretchNodeLabelModel,
  Stroke
} from '@yfiles/yfiles'

import { DragAndDropPanel } from '@yfiles/demo-utils/DragAndDropPanel'
import { NodePortCandidateProvider } from './NodePortCandidateProvider'
import { EdgeReconnectionPortCandidateProvider } from './EdgeReconnectionPortCandidateProvider'
import { WrappingHandle } from './WrappingHandle'
import { TouchHandlesRenderer } from './TouchHandlesRenderer'
import { createDialContextMenu } from './DialContextMenu'
import {
  colorSets,
  createDemoGroupStyle,
  createDemoNodeStyle,
  initDemoStyles
} from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import { PortCandidateRenderer } from './PortCandidateRenderer'

let graphComponent

async function run() {
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
  // initialize the pan start options selection box
  initializePanStart(geim)
  // configure the custom handles
  initializeCustomHandles(graphComponent)
  // configure the custom port candidates
  initializeCustomPortCandidates(graphComponent)
  // configure the selection indication
  configureSelectionIndication(graphComponent)
  // configure edge reconnection
  configurePortInteraction(graphComponent.graph)

  // create the initial graph
  populateGraph(graphComponent.graph)

  // enable undo and redo
  graphComponent.graph.foldingView.manager.masterGraph.undoEngineEnabled = true

  graphComponent.fitGraphBounds()
}

/**
 * Creates the default input mode for the {@link GraphComponent},
 * a {@link GraphEditorInputMode} and configures it.
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

  geim.editLabelInputMode.textEditorInputMode.autoCommitOnFocusLost = true

  geim.handleInputMode.beginRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DOWN
  geim.moveSelectedItemsInputMode.beginRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_DOWN

  // enable lasso selection
  geim.lassoSelectionInputMode.enabled = true

  configureLassoSelection(geim)

  // configure drag and drop
  const nodeDropInputMode = geim.nodeDropInputMode
  nodeDropInputMode.enabled = true
  nodeDropInputMode.isGroupNodePredicate = (node) => node.style instanceof GroupNodeStyle
  nodeDropInputMode.showPreview = true

  initializeContextMenu(geim)
  addCancelButtonListeners(geim)

  return geim
}

/**
 * Customizes lasso selection start and finish gestures.
 */
function configureLassoSelection(geim) {
  // configure touch/mouse up as finish gesture for lasso selection
  geim.lassoSelectionInputMode.finishRecognizerTouch = EventRecognizers.TOUCH_PRIMARY_UP
  geim.lassoSelectionInputMode.finishRecognizer = EventRecognizers.MOUSE_LEFT_UP
}

/**
 * Registers the input mode listeners that show and hide the cancel button.
 */
function addCancelButtonListeners(geim) {
  const cancelButton = document.getElementById('cancel-button')

  const createEdgeButtonListener = () => {
    geim.createEdgeInputMode.cancel()
  }
  geim.createEdgeInputMode.addEventListener('edge-creation-started', () => {
    cancelButton.innerHTML = 'Cancel Edge Creation'
    cancelButton.className = 'demo-button-visible'
    cancelButton.addEventListener('click', createEdgeButtonListener)
  })
  geim.createEdgeInputMode.addEventListener('gesture-finished', () => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', createEdgeButtonListener)
  })
  geim.createEdgeInputMode.addEventListener('gesture-canceled', () => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', createEdgeButtonListener)
  })

  const resizeNodeButtonListener = () => {
    geim.handleInputMode.cancel()
  }
  geim.handleInputMode.addEventListener('drag-started', () => {
    const handle = geim.handleInputMode.currentHandle
    const type = handle ? handle.type : HandleType.MOVE
    switch (type) {
      case HandleType.RESIZE:
      case HandleType.RESIZE_TOP_LEFT:
      case HandleType.RESIZE_TOP:
      case HandleType.RESIZE_TOP_RIGHT:
      case HandleType.RESIZE_LEFT:
      case HandleType.RESIZE_RIGHT:
      case HandleType.RESIZE_BOTTOM_LEFT:
      case HandleType.RESIZE_BOTTOM:
      case HandleType.RESIZE_BOTTOM_RIGHT:
        cancelButton.innerHTML = 'Cancel Resize'
        break
      case HandleType.MOVE:
      case HandleType.MOVE2:
      case HandleType.MOVE3:
      default:
        cancelButton.innerHTML = 'Cancel Move'
        break
    }

    cancelButton.className = 'demo-button-visible'
    cancelButton.addEventListener('click', resizeNodeButtonListener)
    // register the touchend listener because click is not fired for the secondary pointer
    cancelButton.addEventListener('touchend', resizeNodeButtonListener)
  })
  geim.handleInputMode.addEventListener('drag-finished', () => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', resizeNodeButtonListener)
    cancelButton.removeEventListener('touchend', resizeNodeButtonListener)
  })
  geim.handleInputMode.addEventListener('drag-canceled', () => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', resizeNodeButtonListener)
    cancelButton.removeEventListener('touchend', resizeNodeButtonListener)
  })

  const moveNodeButtonListener = () => {
    geim.moveSelectedItemsInputMode.cancel()
  }
  geim.moveSelectedItemsInputMode.addEventListener('drag-started', () => {
    cancelButton.innerHTML = 'Cancel Node Move'
    cancelButton.className = 'demo-button-visible'
    cancelButton.addEventListener('click', moveNodeButtonListener)
    // register the touchend listener because click is not fired for the secondary pointer
    cancelButton.addEventListener('touchend', moveNodeButtonListener)
  })
  geim.moveSelectedItemsInputMode.addEventListener('drag-finished', () => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', moveNodeButtonListener)
    cancelButton.removeEventListener('touchend', moveNodeButtonListener)
  })
  geim.moveSelectedItemsInputMode.addEventListener('drag-canceled', () => {
    cancelButton.className = 'demo-button-invisible'
    cancelButton.removeEventListener('click', moveNodeButtonListener)
    cancelButton.removeEventListener('touchend', moveNodeButtonListener)
  })
}

/**
 * Initializes the dial context menu.
 */
function initializeContextMenu(geim) {
  // Add an event listener that populates the context menu according to the hit elements or cancels showing a menu.
  // In this demo, we add item-specific menu entries for nodes, edges, and the empty canvas
  geim.addEventListener('populate-item-context-menu', (evt) => populateContextMenu(evt))
}

/**
 * Populates the context menu with items.
 */
function populateContextMenu(evt) {
  if (evt.handled) {
    return
  }

  const item = evt.item

  updateSelection(item)

  let actions
  if (item instanceof INode) {
    actions = getNodeActions(item)
  } else if (item instanceof IEdge) {
    actions = getEdgeActions(item)
  } else if (item instanceof ILabel) {
    actions = getLabelActions(item)
  } else if (item instanceof IBend) {
    actions = getBendActions(item)
  } else if (!item) {
    actions = getCanvasActions()
  } else {
    actions = []
  }

  if (actions.length > 0) {
    evt.contextMenu = createDialContextMenu(
      actions,
      evt.queryLocation,
      evt.context.canvasComponent,
      item ?? undefined
    )
  }
}

/**
 * Gets actions for nodes to the given context menu.
 */
function getNodeActions(_node) {
  const inputMode = graphComponent.inputMode
  return [
    {
      callback: async (_, item) => {
        const node = item
        if (node.labels.size > 0) {
          await inputMode.editLabelInputMode.startLabelEditing(node.labels.at(0))
        } else {
          await inputMode.editLabelInputMode.startLabelAddition(node)
        }
      },
      icon: 'resources/edit.svg',
      title: 'Edit Label',
      disabled: false,
      element: null
    },
    {
      callback: () => {
        graphComponent.inputMode.groupSelection()
      },
      icon: 'resources/group.svg',
      title: 'Group Selected Nodes',
      disabled: false,
      element: null
    },
    {
      callback: deleteSelectedNodes,
      icon: 'resources/delete.svg',
      title: 'Delete Selected Nodes',
      disabled: false,
      element: null
    },
    {
      callback: startEdgeCreation,
      icon: 'resources/create-edge.svg',
      title: 'Create Edge',
      disabled: false,
      element: null
    },
    {
      callback: () => inputMode.copy(),
      icon: 'resources/copy.svg',
      title: 'Copy Selection',
      disabled: graphComponent.selection.size === 0,
      element: null
    },
    {
      callback: () => inputMode.cut(),
      icon: 'resources/cut.svg',
      title: 'Cut Selection',
      disabled: graphComponent.selection.size === 0,
      element: null
    },

    {
      callback: (location) => inputMode.pasteAtLocation(location),
      icon: 'resources/paste.svg',
      title: 'Paste',
      disabled: graphComponent.clipboard.isEmpty,
      element: null
    }
  ]
}

/**
 * Gets actions for edges to the given context menu.
 */
function getEdgeActions(_edge) {
  const inputMode = graphComponent.inputMode
  return [
    {
      callback: async (location, item) => {
        const edge = item
        if (edge.labels.size > 0) {
          await inputMode.editLabelInputMode.startLabelEditing(edge.labels.at(0))
        } else {
          await inputMode.editLabelInputMode.startLabelAddition(edge)
        }
      },
      icon: 'resources/edit.svg',
      title: 'Edit Label',
      disabled: false,
      element: null
    },
    {
      callback: createBend,
      icon: 'resources/create-bend.svg',
      title: 'Create Bend',
      disabled: false,
      element: null
    },
    {
      callback: deleteSelectedEdges,
      icon: 'resources/delete.svg',
      title: 'Delete Selected Edges',
      disabled: false,
      element: null
    },
    {
      callback: () => inputMode.copy(),
      icon: 'resources/copy.svg',
      title: 'Copy Selection',
      disabled: graphComponent.selection.size === 0,
      element: null
    },
    {
      callback: () => inputMode.cut(),
      icon: 'resources/cut.svg',
      title: 'Cut Selection',
      disabled: graphComponent.selection.size === 0,
      element: null
    },
    {
      callback: (location) => inputMode.pasteAtLocation(location),
      icon: 'resources/paste.svg',
      title: 'Paste',
      disabled: graphComponent.clipboard.isEmpty,
      element: null
    }
  ]
}

/**
 * Gets actions for bends to the given context menu.
 */
function getBendActions(_bend) {
  return [
    {
      callback: deleteSelectedBends,
      icon: 'resources/delete.svg',
      title: 'Delete Selected Bends',
      disabled: false,
      element: null
    }
  ]
}

/**
 * Gets actions for labels to the given context menu.
 */
function getLabelActions(_label) {
  const inputMode = graphComponent.inputMode
  return [
    {
      callback: (_, label) => {
        void inputMode.startLabelEditing(label)
      },
      icon: 'resources/edit.svg',
      title: 'Edit Label',
      disabled: false,
      element: null
    },
    {
      callback: deleteSelectedLabels,
      icon: 'resources/delete.svg',
      title: 'Delete Selected Labels',
      disabled: false,
      element: null
    },
    {
      callback: () => inputMode.copy(),
      icon: 'resources/copy.svg',
      title: 'Copy Selection',
      disabled: graphComponent.selection.size === 0,
      element: null
    },
    {
      callback: () => inputMode.cut(),
      icon: 'resources/cut.svg',
      title: 'Cut Selection',
      disabled: graphComponent.selection.size === 0,
      element: null
    }
  ]
}

/**
 * Get application actions to the given context menu.
 * Application actions are actions that are available when "the context" is not a graph element.
 */
function getCanvasActions() {
  const inputMode = graphComponent.inputMode
  return [
    {
      callback: () => graphComponent.fitGraphBounds(),
      icon: 'resources/fit-content.svg',
      title: 'Fit Content',
      disabled: false,
      element: null
    },
    {
      callback: () => graphComponent.graph.undoEngine?.undo(),
      icon: 'resources/backward.svg',
      title: 'Undo',
      disabled: !graphComponent.graph.undoEngine?.canUndo(),
      element: null
    },
    {
      callback: () => graphComponent.graph.undoEngine?.redo(),
      icon: 'resources/forward.svg',
      title: 'Redo',
      disabled: !graphComponent.graph.undoEngine?.canRedo(),
      element: null
    },
    {
      callback: (location) => {
        graphComponent.graph.createNodeAt(location)
      },
      icon: 'resources/create-node.svg',
      title: 'Create Node',
      disabled: false,
      element: null
    },
    {
      callback: () => inputMode.copy(),
      icon: 'resources/copy.svg',
      title: 'Copy Selection',
      disabled: graphComponent.selection.size === 0,
      element: null
    },
    {
      callback: () => inputMode.cut(),
      icon: 'resources/cut.svg',
      title: 'Cut Selection',
      disabled: graphComponent.selection.size === 0,
      element: null
    },
    {
      callback: (location) => inputMode.pasteAtLocation(location),
      icon: 'resources/paste.svg',
      title: 'Paste',
      disabled: graphComponent.clipboard.isEmpty,
      element: null
    }
  ]
}

/**
 * Helper method that updates the selection state when the context menu is opened on a graph item.
 * @param item The item or `null`.
 */
function updateSelection(item) {
  if (
    item instanceof INode ||
    item instanceof IEdge ||
    item instanceof ILabel ||
    item instanceof IBend
  ) {
    if (!graphComponent.selection.includes(item)) {
      graphComponent.selection.clear()
      graphComponent.selection.add(item)
      graphComponent.currentItem = item
    }
  } else {
    graphComponent.selection.clear()
  }
}

/**
 * Installs custom handle visualizations for resize and move handles.
 */
function initializeCustomHandles(graphComponent) {
  graphComponent.inputMode.handleInputMode.handlesRenderer = new TouchHandlesRenderer()

  // use variant 2 of move handle for bends
  graphComponent.graph.decorator.bends.handle.addWrapperFactory((_bend, handle) =>
    handle != null ? new WrappingHandle(handle, HandleType.MOVE, null) : null
  )
}

/**
 * Installs custom port candidate visualizations for interactive edge creation.
 */
function initializeCustomPortCandidates(graphComponent) {
  const geim = graphComponent.inputMode
  geim.createEdgeInputMode.portCandidateRenderer = new PortCandidateRenderer()

  const graph = graphComponent.graph
  graph.decorator.edges.portHandleProvider.addFactory((edge) => {
    const portRelocationHandleProvider = new PortRelocationHandleProvider(graph, edge)
    portRelocationHandleProvider.portCandidateRenderer = new PortCandidateRenderer()
    return portRelocationHandleProvider
  })
}

/**
 * Customizes the selection visualization.
 */
function configureSelectionIndication(graphComponent) {
  graphComponent.graph.decorator.nodes.focusRenderer.hide()
  graphComponent.graph.decorator.nodes.highlightRenderer.hide()
  graphComponent.graph.decorator.edges.highlightRenderer.addConstant(
    new EdgeStyleIndicatorRenderer({ edgeStyle: new PolylineEdgeStyle({ stroke: '4px #2C4B52' }) })
  )

  graphComponent.selection.addEventListener('item-added', (evt, selectionSender) => {
    const item = evt.item
    if (item instanceof IEdge) {
      for (const bend of item.bends) {
        selectionSender.add(bend)
      }
    }
  })
}

/**
 * Makes it possible to reconnect edges to other nodes.
 * Also adds port candidates for each side of a node.
 */
function configurePortInteraction(graph) {
  const decorator = graph.decorator
  decorator.edges.reconnectionPortCandidateProvider.addFactory(
    (edge) => new EdgeReconnectionPortCandidateProvider(edge)
  )
  decorator.nodes.portCandidateProvider.addFactory((node) => new NodePortCandidateProvider(node))
}

/**
 * Initializes the graph instance and set default styles.
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
    targetArrow: new Arrow({ fill, type: ArrowType.TRIANGLE, lengthScale: 2, widthScale: 2 })
  })

  return graph
}

/**
 * Deletes all selected nodes.
 */
function deleteSelectedNodes() {
  const nodesToRemove = graphComponent.selection.nodes.toArray()
  nodesToRemove.forEach((node) => graphComponent.graph.remove(node))
}

/**
 * Deletes all selected edges.
 */
function deleteSelectedEdges() {
  const edgesToRemove = graphComponent.selection.edges.toArray()
  edgesToRemove.forEach((edge) => graphComponent.graph.remove(edge))
}

/**
 * Deletes all selected labels.
 */
function deleteSelectedLabels() {
  const labelsToRemove = graphComponent.selection.labels.toArray()
  labelsToRemove.forEach((label) => graphComponent.graph.remove(label))
}

/**
 * Deletes all selected bends.
 */
function deleteSelectedBends() {
  const bendsToRemove = graphComponent.selection.bends.toArray()
  bendsToRemove.forEach((bend) => graphComponent.graph.remove(bend))
}

/**
 * Starts edge creation at the given node.
 */
function startEdgeCreation(_location, item) {
  setTimeout(async () => {
    const geim = graphComponent.inputMode
    geim.createEdgeInputMode.enabled = true
    const owner = item
    await geim.createEdgeInputMode.startEdgeCreation(
      new PortCandidate(owner, FreeNodePortLocationModel.CENTER)
    )

    const listener = () => {
      geim.createEdgeInputMode.enabled = false
      geim.createEdgeInputMode.removeEventListener('gesture-finished', listener)
      geim.createEdgeInputMode.removeEventListener('gesture-canceled', listener)
    }
    geim.createEdgeInputMode.addEventListener('gesture-finished', listener)
    geim.createEdgeInputMode.addEventListener('gesture-canceled', listener)
  }, 0)
}

/**
 * Creates a bend at the given location for the given edge.
 */
function createBend(location, item) {
  const edge = item
  const bendCreator = edge.lookup(IBendCreator)
  let bend
  if (bendCreator) {
    const bendIndex = bendCreator.createBend(
      graphComponent.inputModeContext,
      graphComponent.graph,
      location
    )
    bend = edge.bends.at(bendIndex)
  } else {
    bend = graphComponent.graph.addBend(edge, location)
  }
  graphComponent.selection.clear()
  graphComponent.selection.add(bend)
}

/**
 * Initializes the drag and drop panel.
 */
function initializeDnDPanel() {
  const dndPanel = new DragAndDropPanel(document.getElementById('dnd-panel'))
  // Set the callback that starts the actual drag and drop operation
  dndPanel.maxItemWidth = 160
  dndPanel.populatePanel(createDnDPanelNodes())
}

/**
 * Initializes the snap panning selection box.
 */
function initializePanSnapping(geim) {
  const select = document.querySelector('#snap-panning-box>select')
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
 * Configures the starting gestures for the minor input modes of the given GraphEditorInputMode
 * so that they either start with a long press (holding the finger for a short amount of time)
 * or immediately on finger down. The latter works best if you do not allow panning with a single
 * finger and vice versa.
 * @param geim The input mode to configure.
 * @param useLongPress Whether to configure the input mode for long presses.
 */
function configureTouchStartGestures(geim, useLongPress) {
  const recognizerTouch = useLongPress
    ? EventRecognizers.TOUCH_PRIMARY_LONG_PRESS
    : EventRecognizers.TOUCH_PRIMARY_DOWN
  geim.moveSelectedItemsInputMode.beginRecognizerTouch = recognizerTouch
  geim.createEdgeInputMode.beginRecognizerTouch = recognizerTouch
  geim.createBendInputMode.beginRecognizerTouch = recognizerTouch
  geim.handleInputMode.beginRecognizerTouch = recognizerTouch
  geim.marqueeSelectionInputMode.beginRecognizerTouch = recognizerTouch
  geim.moveUnselectedItemsInputMode.beginRecognizerTouch = recognizerTouch
}

/**
 * Initializes the snap panning selection box.
 */
function initializePanStart(geim) {
  // initialize the demo with two-finger panning
  configurePanStartGesture(geim, 'two')
  // listen for behavior switch
  const select = document.querySelector('#start-panning-box>select')
  select.addEventListener('change', () => {
    const item = select[select.selectedIndex]
    configurePanStartGesture(geim, item.value)
  })
}

/**
 * Configures the panning behavior and edit gestures of the demo.
 */
function configurePanStartGesture(inputMode, panningMode) {
  switch (panningMode) {
    case 'one':
      //Enable start panning with ONE and TWO fingers
      inputMode.moveViewportInputMode.allowSinglePointerMovement = true
      // With one finger panning, you typically want to start editing with a long press
      configureTouchStartGestures(inputMode, true)
      break
    case 'two':
      //Enable start panning with TWO fingers, only
      inputMode.moveViewportInputMode.allowSinglePointerMovement = false
      // This allows us to use one finger gestures for most of the other edits
      configureTouchStartGestures(inputMode, false)
  }
}

/**
 * Creates the nodes that provide the visualizations for the drag and drop panel.
 */
function createDnDPanelNodes() {
  // Create a new temporary graph for the nodes
  const nodeContainer = new Graph()

  // Create a group node
  const groupNodeStyle = createDemoGroupStyle({ foldingEnabled: true })
  groupNodeStyle.hitTransparentContentArea = false

  // A label model with insets for the expand/collapse button
  const groupLabelModel = new StretchNodeLabelModel({ padding: 4 })

  const groupLabelStyle = new LabelStyle({ textFill: Color.WHITE })

  const node = nodeContainer.createNode(new Rect(0, 0, 120, 120), groupNodeStyle)
  nodeContainer.addLabel(
    node,
    'Group Node',
    groupLabelModel.createParameter('top'),
    groupLabelStyle
  )

  // create a node with standard demo node styling
  nodeContainer.createNode(new Rect(0, 0, 100, 60), createDemoNodeStyle())

  // create a shape style node
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    stroke: new Stroke(colorSets['demo-palette-14'].stroke),
    fill: colorSets['demo-palette-14'].fill
  })
  nodeContainer.createNode(new Rect(0, 0, 100, 60), shapeNodeStyle)

  // create a bevel style node
  nodeContainer.createNode(
    new Rect(0, 0, 100, 60),
    new ArrowNodeStyle({ fill: colorSets['demo-palette-15'].fill })
  )

  // create a node that has a rectangle with cut corners as style
  const rectangleNodeStyle = new RectangleNodeStyle({
    fill: colorSets['demo-palette-11'].fill,
    cornerStyle: RectangleCornerStyle.CUT
  })
  nodeContainer.createNode(new Rect(0, 0, 100, 60), rectangleNodeStyle)

  return nodeContainer.nodes.toArray()
}

/**
 * Creates a sample graph.
 */
function populateGraph(graph) {
  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNodeAt(new Point(30, 250))

  graph.createEdge(node1, node2)
  const e = graph.createEdge(node1, node2)
  graph.addBend(e, new Point(200, 30))
  graph.addBend(e, new Point(200, 250))
}

run().then(finishLoading)
