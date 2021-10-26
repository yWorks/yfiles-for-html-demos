/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BendEventArgs,
  CanvasComponent,
  ClickEventArgs,
  DefaultLabelStyle,
  DragDropEffects,
  EdgeEventArgs,
  EventArgs,
  FoldingManager,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphViewerInputMode,
  HandleInputMode,
  HoveredItemChangedEventArgs,
  IBend,
  ICommand,
  IEdge,
  IEdgeReconnectionPortCandidateProvider,
  IEdgeStyle,
  IEnumerable,
  IFoldingView,
  IGraph,
  IInputMode,
  ILabel,
  ILabelModelParameter,
  ILabelStyle,
  IModelItem,
  INode,
  INodeStyle,
  InputModeEventArgs,
  IPort,
  IPortLocationModelParameter,
  IPortStyle,
  ItemChangedEventArgs,
  ItemClickedEventArgs,
  ItemCopiedEventArgs,
  ItemEventArgs,
  ItemSelectionChangedEventArgs,
  KeyEventArgs,
  LabelDropInputMode,
  LabelEventArgs,
  LabelTextValidatingEventArgs,
  License,
  MouseEventArgs,
  MoveInputMode,
  NodeDropInputMode,
  NodeEventArgs,
  NodeStylePortStyleAdapter,
  OrthogonalEdgeEditingContext,
  Point,
  PopulateItemContextMenuEventArgs,
  PopulateMenuEventArgs,
  PortDropInputMode,
  PortEventArgs,
  PrepareRenderContextEventArgs,
  PropertyChangedEventArgs,
  QueryItemToolTipEventArgs,
  QueryPositionHandlerEventArgs,
  Rect,
  SelectionEventArgs,
  ShapeNodeStyle,
  SimpleLabel,
  SimpleNode,
  SimplePort,
  Size,
  SvgExport,
  TapEventArgs,
  TextEventArgs,
  ToolTipQueryEventArgs,
  TouchEventArgs,
  VoidNodeStyle
} from 'yfiles'

import { initDemoStyles } from '../../resources/demo-styles'
import {
  addClass,
  bindAction,
  bindActions,
  bindCommand,
  checkLicense,
  removeClass,
  showApp
} from '../../resources/demo-app'
import { passiveSupported, pointerEventsSupported } from '../../utils/Workarounds'
import EventView from './EventView'
import loadJson from '../../resources/load-json'

/**
 * This demo shows how to register to the various events provided by the {@link IGraph graph},
 * the graph component} and the input modes.
 */
function run(licenseData: object): void {
  License.value = licenseData

  eventView = new EventView()

  // initialize the GraphComponent
  initializeGraphComponent()

  registerCommands()
  initializeInputModes()
  setupToolTips()
  setupContextMenu()

  registerInputModeEvents()
  registerNavigationInputModeEvents()

  enableFolding()

  initializeGraph()
  initializeDragAndDropPanel()

  createSampleGraph()
  graphComponent.fitGraphBounds()
  enableUndo()

  // initialize collapsible headings
  initOptionHeadings()

  showApp(graphComponent)
}

let eventView: EventView

let editorMode: GraphEditorInputMode

let viewerMode: GraphViewerInputMode

let manager: FoldingManager

let foldingView: IFoldingView

/**
 * Registers some keyboard events to the graphComponent.
 */
function registerGraphComponentKeyEvents(): void {
  graphComponent.addKeyDownListener(controlOnKeyDown)
  graphComponent.addKeyUpListener(controlOnKeyUp)
  graphComponent.addKeyPressListener(controlOnKeyPressed)
}

/**
 * Deregisters some keyboard events from the graphComponent.
 */
function deregisterGraphComponentKeyEvents(): void {
  graphComponent.removeKeyDownListener(controlOnKeyDown)
  graphComponent.removeKeyUpListener(controlOnKeyUp)
  graphComponent.removeKeyPressListener(controlOnKeyPressed)
}

/**
 * Registers the copy clipboard events to the graphComponent.
 */
function registerClipboardCopierEvents(): void {
  graphComponent.clipboard.toClipboardCopier.addGraphCopiedListener(
    clipboardOnGraphCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.addNodeCopiedListener(clipboardOnNodeCopiedToClipboard)
  graphComponent.clipboard.toClipboardCopier.addEdgeCopiedListener(clipboardOnEdgeCopiedToClipboard)
  graphComponent.clipboard.toClipboardCopier.addPortCopiedListener(clipboardOnPortCopiedToClipboard)
  graphComponent.clipboard.toClipboardCopier.addLabelCopiedListener(
    clipboardOnLabelCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.addObjectCopiedListener(
    clipboardOnObjectCopiedToClipboard
  )

  graphComponent.clipboard.fromClipboardCopier.addGraphCopiedListener(
    clipboardOnGraphCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addNodeCopiedListener(
    clipboardOnNodeCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addEdgeCopiedListener(
    clipboardOnEdgeCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addPortCopiedListener(
    clipboardOnPortCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addLabelCopiedListener(
    clipboardOnLabelCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addObjectCopiedListener(
    clipboardOnObjectCopiedFromClipboard
  )

  graphComponent.clipboard.duplicateCopier.addGraphCopiedListener(clipboardOnGraphDuplicated)
  graphComponent.clipboard.duplicateCopier.addNodeCopiedListener(clipboardOnNodeDuplicated)
  graphComponent.clipboard.duplicateCopier.addEdgeCopiedListener(clipboardOnEdgeDuplicated)
  graphComponent.clipboard.duplicateCopier.addPortCopiedListener(clipboardOnPortDuplicated)
  graphComponent.clipboard.duplicateCopier.addLabelCopiedListener(clipboardOnLabelDuplicated)
  graphComponent.clipboard.duplicateCopier.addObjectCopiedListener(clipboardOnObjectDuplicated)
}

/**
 * Deregisters the copy clipboard events from the graphComponent.
 */
function deregisterClipboardCopierEvents(): void {
  graphComponent.clipboard.toClipboardCopier.removeGraphCopiedListener(
    clipboardOnGraphCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeNodeCopiedListener(
    clipboardOnNodeCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeEdgeCopiedListener(
    clipboardOnEdgeCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removePortCopiedListener(
    clipboardOnPortCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeLabelCopiedListener(
    clipboardOnLabelCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeObjectCopiedListener(
    clipboardOnObjectCopiedToClipboard
  )

  graphComponent.clipboard.fromClipboardCopier.removeGraphCopiedListener(
    clipboardOnGraphCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeNodeCopiedListener(
    clipboardOnNodeCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeEdgeCopiedListener(
    clipboardOnEdgeCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removePortCopiedListener(
    clipboardOnPortCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeLabelCopiedListener(
    clipboardOnLabelCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeObjectCopiedListener(
    clipboardOnObjectCopiedFromClipboard
  )

  graphComponent.clipboard.duplicateCopier.removeGraphCopiedListener(clipboardOnGraphDuplicated)
  graphComponent.clipboard.duplicateCopier.removeNodeCopiedListener(clipboardOnNodeDuplicated)
  graphComponent.clipboard.duplicateCopier.removeEdgeCopiedListener(clipboardOnEdgeDuplicated)
  graphComponent.clipboard.duplicateCopier.removePortCopiedListener(clipboardOnPortDuplicated)
  graphComponent.clipboard.duplicateCopier.removeLabelCopiedListener(clipboardOnLabelDuplicated)
  graphComponent.clipboard.duplicateCopier.removeObjectCopiedListener(clipboardOnObjectDuplicated)
}

/**
 * Registers the mouse events to the graphComponent.
 */
function registerGraphComponentMouseEvents(): void {
  graphComponent.addMouseClickListener(controlOnMouseClick)
  graphComponent.addMouseEnterListener(controlOnMouseEnter)
  graphComponent.addMouseLeaveListener(controlOnMouseLeave)
  graphComponent.addMouseLostCaptureListener(controlOnMouseLostCapture)
  graphComponent.addMouseDownListener(controlOnMouseDown)
  graphComponent.addMouseUpListener(controlOnMouseUp)
  graphComponent.addMouseWheelListener(controlOnMouseWheelTurned)
  graphComponent.addMouseDragListener(controlOnMouseDrag)
  graphComponent.addMouseMoveListener(controlOnMouseMove)
}

/**
 * Deregisters the mouse events from the graphComponent.
 */
function deregisterGraphComponentMouseEvents(): void {
  graphComponent.removeMouseClickListener(controlOnMouseClick)
  graphComponent.removeMouseEnterListener(controlOnMouseEnter)
  graphComponent.removeMouseLeaveListener(controlOnMouseLeave)
  graphComponent.removeMouseLostCaptureListener(controlOnMouseLostCapture)
  graphComponent.removeMouseDownListener(controlOnMouseDown)
  graphComponent.removeMouseUpListener(controlOnMouseUp)
  graphComponent.removeMouseWheelListener(controlOnMouseWheelTurned)
  graphComponent.removeMouseDragListener(controlOnMouseDrag)
  graphComponent.removeMouseMoveListener(controlOnMouseMove)
}

/**
 * Registers the touch events to the graphComponent.
 */
function registerGraphComponentTouchEvents(): void {
  graphComponent.addTouchDownListener(controlOnTouchDown)
  graphComponent.addTouchEnterListener(controlOnTouchEnter)
  graphComponent.addTouchLeaveListener(controlOnTouchLeave)
  graphComponent.addTouchLongPressListener(controlOnTouchLongPressed)
  graphComponent.addTouchLostCaptureListener(controlOnTouchLostCapture)
  graphComponent.addTouchClickListener(controlOnTouchClick)
  graphComponent.addTouchUpListener(controlOnTouchUp)
  graphComponent.addTouchMoveListener(controlOnTouchMove)
}

/**
 * Deregisters the touch events from the graphComponent.
 */
function deregisterGraphComponentTouchEvents(): void {
  graphComponent.removeTouchDownListener(controlOnTouchDown)
  graphComponent.removeTouchEnterListener(controlOnTouchEnter)
  graphComponent.removeTouchLeaveListener(controlOnTouchLeave)
  graphComponent.removeTouchLongPressListener(controlOnTouchLongPressed)
  graphComponent.removeTouchLostCaptureListener(controlOnTouchLostCapture)
  graphComponent.removeTouchClickListener(controlOnTouchClick)
  graphComponent.removeTouchUpListener(controlOnTouchUp)
  graphComponent.removeTouchMoveListener(controlOnTouchMove)
}

/**
 * Registers the rendering events to the graphComponent.
 */
function registerGraphComponentRenderEvents(): void {
  graphComponent.addPrepareRenderContextListener(controlOnPrepareRenderContext)
  graphComponent.addUpdatedVisualListener(controlOnUpdatedVisual)
  graphComponent.addUpdatingVisualListener(controlOnUpdatingVisual)
}

/**
 * Deregisters the rendering events from the graphComponent.
 */
function deregisterGraphComponentRenderEvents(): void {
  graphComponent.removePrepareRenderContextListener(controlOnPrepareRenderContext)
  graphComponent.removeUpdatedVisualListener(controlOnUpdatedVisual)
  graphComponent.removeUpdatingVisualListener(controlOnUpdatingVisual)
}

/**
 * Registers the viewport events to the graphComponent.
 */
function registerGraphComponentViewportEvents(): void {
  graphComponent.addViewportChangedListener(controlOnViewportChanged)
  graphComponent.addZoomChangedListener(controlOnZoomChanged)
}

/**
 * Deregisters the viewport events from the graphComponent.
 */
function deregisterGraphComponentViewportEvents(): void {
  graphComponent.removeViewportChangedListener(controlOnViewportChanged)
  graphComponent.removeZoomChangedListener(controlOnZoomChanged)
}

/**
 * Registers events regarding node changes to the graphComponent's graph.
 */
function registerNodeEvents(): void {
  graphComponent.graph.addNodeLayoutChangedListener(onNodeLayoutChanged)
  graphComponent.graph.addNodeStyleChangedListener(onNodeStyleChanged)
  graphComponent.graph.addNodeTagChangedListener(onNodeTagChanged)
  graphComponent.graph.addNodeCreatedListener(onNodeCreated)
  graphComponent.graph.addNodeRemovedListener(onNodeRemoved)
}

/**
 * Deregisters events regarding node changes from the graphComponent's graph.
 */
function deregisterNodeEvents(): void {
  graphComponent.graph.removeNodeLayoutChangedListener(onNodeLayoutChanged)
  graphComponent.graph.removeNodeStyleChangedListener(onNodeStyleChanged)
  graphComponent.graph.removeNodeTagChangedListener(onNodeTagChanged)
  graphComponent.graph.removeNodeCreatedListener(onNodeCreated)
  graphComponent.graph.removeNodeRemovedListener(onNodeRemoved)
}

/**
 * Registers events regarding edge changes to the graphComponent's graph.
 */
function registerEdgeEvents(): void {
  graphComponent.graph.addEdgePortsChangedListener(onEdgePortsChanged)
  graphComponent.graph.addEdgeStyleChangedListener(onEdgeStyleChanged)
  graphComponent.graph.addEdgeTagChangedListener(onEdgeTagChanged)
  graphComponent.graph.addEdgeCreatedListener(onEdgeCreated)
  graphComponent.graph.addEdgeRemovedListener(onEdgeRemoved)
}

/**
 * Deregisters events regarding edge changes from the graphComponent's graph.
 */
function deregisterEdgeEvents(): void {
  graphComponent.graph.removeEdgePortsChangedListener(onEdgePortsChanged)
  graphComponent.graph.removeEdgeStyleChangedListener(onEdgeStyleChanged)
  graphComponent.graph.removeEdgeTagChangedListener(onEdgeTagChanged)
  graphComponent.graph.removeEdgeCreatedListener(onEdgeCreated)
  graphComponent.graph.removeEdgeRemovedListener(onEdgeRemoved)
}

/**
 * Registers events regarding bend changes to the graphComponent's graph.
 */
function registerBendEvents(): void {
  graphComponent.graph.addBendAddedListener(onBendAdded)
  graphComponent.graph.addBendLocationChangedListener(onBendLocationChanged)
  graphComponent.graph.addBendTagChangedListener(onBendTagChanged)
  graphComponent.graph.addBendRemovedListener(onBendRemoved)
}

/**
 * Deregisters events regarding bend changes from the graphComponent's graph.
 */
function deregisterBendEvents(): void {
  graphComponent.graph.removeBendAddedListener(onBendAdded)
  graphComponent.graph.removeBendLocationChangedListener(onBendLocationChanged)
  graphComponent.graph.removeBendTagChangedListener(onBendTagChanged)
  graphComponent.graph.removeBendRemovedListener(onBendRemoved)
}

/**
 * Registers events regarding port changes to the graphComponent's graph.
 */
function registerPortEvents(): void {
  graphComponent.graph.addPortAddedListener(onPortAdded)
  graphComponent.graph.addPortLocationParameterChangedListener(onPortLocationParameterChanged)
  graphComponent.graph.addPortStyleChangedListener(onPortStyleChanged)
  graphComponent.graph.addPortTagChangedListener(onPortTagChanged)
  graphComponent.graph.addPortRemovedListener(onPortRemoved)
}

/**
 * Deregisters events regarding port changes from the graphComponent's graph.
 */
function deregisterPortEvents(): void {
  graphComponent.graph.removePortAddedListener(onPortAdded)
  graphComponent.graph.removePortLocationParameterChangedListener(onPortLocationParameterChanged)
  graphComponent.graph.removePortStyleChangedListener(onPortStyleChanged)
  graphComponent.graph.removePortTagChangedListener(onPortTagChanged)
  graphComponent.graph.removePortRemovedListener(onPortRemoved)
}

/**
 * Registers events regarding label changes to the graphComponent's graph.
 */
function registerLabelEvents(): void {
  graphComponent.graph.addLabelAddedListener(onLabelAdded)
  graphComponent.graph.addLabelPreferredSizeChangedListener(onLabelPreferredSizeChanged)
  graphComponent.graph.addLabelLayoutParameterChangedListener(onLabelLayoutParameterChanged)
  graphComponent.graph.addLabelStyleChangedListener(onLabelStyleChanged)
  graphComponent.graph.addLabelTagChangedListener(onLabelTagChanged)
  graphComponent.graph.addLabelTextChangedListener(onLabelTextChanged)
  graphComponent.graph.addLabelRemovedListener(onLabelRemoved)
}

/**
 * Deregisters events regarding label changes from the graphComponent's graph.
 */
function deregisterLabelEvents(): void {
  graphComponent.graph.removeLabelAddedListener(onLabelAdded)
  graphComponent.graph.removeLabelPreferredSizeChangedListener(onLabelPreferredSizeChanged)
  graphComponent.graph.removeLabelLayoutParameterChangedListener(onLabelLayoutParameterChanged)
  graphComponent.graph.removeLabelStyleChangedListener(onLabelStyleChanged)
  graphComponent.graph.removeLabelTagChangedListener(onLabelTagChanged)
  graphComponent.graph.removeLabelTextChangedListener(onLabelTextChanged)
  graphComponent.graph.removeLabelRemovedListener(onLabelRemoved)
}

/**
 * Registers events regarding hierarchy changes to the graphComponent's graph.
 */
function registerHierarchyEvents(): void {
  graphComponent.graph.addParentChangedListener(onParentChanged)
  graphComponent.graph.addIsGroupNodeChangedListener(onIsGroupNodeChanged)
}

/**
 * Deregisters events regarding hierarchy changes from the graphComponent's graph.
 */
function deregisterHierarchyEvents(): void {
  graphComponent.graph.removeParentChangedListener(onParentChanged)
  graphComponent.graph.removeIsGroupNodeChangedListener(onIsGroupNodeChanged)
}

/**
 * Registers events regarding folding changes to the folding view of the graphComponent.
 */
function registerFoldingEvents(): void {
  foldingView.addGroupCollapsedListener(onGroupCollapsed)
  foldingView.addGroupExpandedListener(onGroupExpanded)
  foldingView.addPropertyChangedListener(onPropertyChanged)
}

/**
 * Deregisters events regarding folding changes from the folding view of the graphComponent.
 */
function deregisterFoldingEvents(): void {
  foldingView.removeGroupCollapsedListener(onGroupCollapsed)
  foldingView.removeGroupExpandedListener(onGroupExpanded)
  foldingView.removePropertyChangedListener(onPropertyChanged)
}

/**
 * Registers events regarding updating the current display to the graphComponent's graph.
 */
function registerGraphRenderEvents(): void {
  graphComponent.graph.addDisplaysInvalidatedListener(onDisplaysInvalidated)
}

/**
 * Deregisters events regarding updating the current display from the graphComponent's graph.
 */
function deregisterGraphRenderEvents(): void {
  graphComponent.graph.removeDisplaysInvalidatedListener(onDisplaysInvalidated)
}

/**
 * Registers events to the graphComponent.
 */
function registerGraphComponentEvents(): void {
  graphComponent.addCurrentItemChangedListener(controlOnCurrentItemChanged)
  graphComponent.addGraphChangedListener(controlOnGraphChanged)
  graphComponent.addInputModeChangedListener(controlOnInputModeChanged)
}

/**
 * Deregisters events from the graphComponent.
 */
function deregisterGraphComponentEvents(): void {
  graphComponent.removeCurrentItemChangedListener(controlOnCurrentItemChanged)
  graphComponent.removeGraphChangedListener(controlOnGraphChanged)
  graphComponent.removeInputModeChangedListener(controlOnInputModeChanged)
}

/**
 * Registers events to the input mode.
 */
function registerInputModeEvents(): void {
  editorMode.addCanvasClickedListener(geimOnCanvasClicked)
  editorMode.addDeletedItemListener(geimOnDeletedItem)
  editorMode.addDeletedSelectionListener(geimOnDeletedSelection)
  editorMode.addDeletingSelectionListener(geimOnDeletingSelection)
  editorMode.addItemClickedListener(geimOnItemClicked)
  editorMode.addItemDoubleClickedListener(geimOnItemDoubleClicked)
  editorMode.addItemLeftClickedListener(geimOnItemLeftClicked)
  editorMode.addItemLeftDoubleClickedListener(geimOnItemLeftDoubleClicked)
  editorMode.addItemRightClickedListener(geimOnItemRightClicked)
  editorMode.addItemRightDoubleClickedListener(geimOnItemRightDoubleClicked)
  editorMode.addLabelAddedListener(geimOnLabelAdded)
  editorMode.addLabelTextChangedListener(geimOnLabelTextChanged)
  editorMode.addLabelTextEditingCanceledListener(geimOnLabelTextEditingCanceled)
  editorMode.addLabelTextEditingStartedListener(geimOnLabelTextEditingStarted)
  editorMode.addMultiSelectionFinishedListener(geimOnMultiSelectionFinished)
  editorMode.addMultiSelectionStartedListener(geimOnMultiSelectionStarted)
  editorMode.addNodeCreatedListener(geimOnNodeCreated)
  editorMode.addNodeReparentedListener(geimOnNodeReparented)
  editorMode.addEdgePortsChangedListener(geimOnEdgePortsChanged)
  editorMode.addPopulateItemContextMenuListener(geimOnPopulateItemContextMenu)
  editorMode.addQueryItemToolTipListener(geimOnQueryItemToolTip)
  editorMode.addValidateLabelTextListener(geimOnValidateLabelText)
  viewerMode.addCanvasClickedListener(gvimOnCanvasClicked)
  viewerMode.addItemClickedListener(gvimOnItemClicked)
  viewerMode.addItemDoubleClickedListener(gvimOnItemDoubleClicked)
  viewerMode.addItemLeftClickedListener(gvimOnItemLeftClicked)
  viewerMode.addItemLeftDoubleClickedListener(gvimOnItemLeftDoubleClicked)
  viewerMode.addItemRightClickedListener(gvimOnItemRightClicked)
  viewerMode.addItemRightDoubleClickedListener(gvimOnItemRightDoubleClicked)
  viewerMode.addMultiSelectionFinishedListener(gvimOnMultiSelectionFinished)
  viewerMode.addMultiSelectionStartedListener(gvimOnMultiSelectionStarted)
  viewerMode.addPopulateItemContextMenuListener(gvimOnPopulateItemContextMenu)
  viewerMode.addQueryItemToolTipListener(gvimOnQueryItemToolTip)
}

/**
 * Deregisters events from the input mode.
 */
function deregisterInputModeEvents(): void {
  editorMode.removeCanvasClickedListener(geimOnCanvasClicked)
  editorMode.removeDeletedItemListener(geimOnDeletedItem)
  editorMode.removeDeletedSelectionListener(geimOnDeletedSelection)
  editorMode.removeDeletingSelectionListener(geimOnDeletingSelection)
  editorMode.removeItemClickedListener(geimOnItemClicked)
  editorMode.removeItemDoubleClickedListener(geimOnItemDoubleClicked)
  editorMode.removeItemLeftClickedListener(geimOnItemLeftClicked)
  editorMode.removeItemLeftDoubleClickedListener(geimOnItemLeftDoubleClicked)
  editorMode.removeItemRightClickedListener(geimOnItemRightClicked)
  editorMode.removeItemRightDoubleClickedListener(geimOnItemRightDoubleClicked)
  editorMode.removeLabelAddedListener(geimOnLabelAdded)
  editorMode.removeLabelTextChangedListener(geimOnLabelTextChanged)
  editorMode.removeLabelTextEditingCanceledListener(geimOnLabelTextEditingCanceled)
  editorMode.removeLabelTextEditingStartedListener(geimOnLabelTextEditingStarted)
  editorMode.removeMultiSelectionFinishedListener(geimOnMultiSelectionFinished)
  editorMode.removeMultiSelectionStartedListener(geimOnMultiSelectionStarted)
  editorMode.removeNodeCreatedListener(geimOnNodeCreated)
  editorMode.removeNodeReparentedListener(geimOnNodeReparented)
  editorMode.removeEdgePortsChangedListener(geimOnEdgePortsChanged)
  editorMode.removePopulateItemContextMenuListener(geimOnPopulateItemContextMenu)
  editorMode.removeQueryItemToolTipListener(geimOnQueryItemToolTip)
  editorMode.removeValidateLabelTextListener(geimOnValidateLabelText)
  viewerMode.removeCanvasClickedListener(gvimOnCanvasClicked)
  viewerMode.removeItemClickedListener(gvimOnItemClicked)
  viewerMode.removeItemDoubleClickedListener(gvimOnItemDoubleClicked)
  viewerMode.removeItemLeftClickedListener(gvimOnItemLeftClicked)
  viewerMode.removeItemLeftDoubleClickedListener(gvimOnItemLeftDoubleClicked)
  viewerMode.removeItemRightClickedListener(gvimOnItemRightClicked)
  viewerMode.removeItemRightDoubleClickedListener(gvimOnItemRightDoubleClicked)
  viewerMode.removeMultiSelectionFinishedListener(gvimOnMultiSelectionFinished)
  viewerMode.removeMultiSelectionStartedListener(gvimOnMultiSelectionStarted)
  viewerMode.removePopulateItemContextMenuListener(gvimOnPopulateItemContextMenu)
  viewerMode.removeQueryItemToolTipListener(gvimOnQueryItemToolTip)
}

/**
 * Registers events to the move input mode.
 */
function registerMoveInputModeEvents(): void {
  editorMode.moveInputMode.addDragCanceledListener(moveInputModeOnDragCanceled)
  editorMode.moveInputMode.addDragCancelingListener(moveInputModeOnDragCanceling)
  editorMode.moveInputMode.addDragFinishedListener(moveInputModeOnDragFinished)
  editorMode.moveInputMode.addDragFinishingListener(moveInputModeOnDragFinishing)
  editorMode.moveInputMode.addDragStartedListener(moveInputModeOnDragStarted)
  editorMode.moveInputMode.addDragStartingListener(moveInputModeOnDragStarting)
  editorMode.moveInputMode.addDraggedListener(moveInputModeOnDragged)
  editorMode.moveInputMode.addDraggingListener(moveInputModeOnDragging)
  editorMode.moveInputMode.addQueryPositionHandlerListener(moveInputModeOnQueryPositionHandler)
}

/**
 * Deregisters events from the move input mode.
 */
function deregisterMoveInputModeEvents(): void {
  editorMode.moveInputMode.removeDragCanceledListener(moveInputModeOnDragCanceled)
  editorMode.moveInputMode.removeDragCancelingListener(moveInputModeOnDragCanceling)
  editorMode.moveInputMode.removeDragFinishedListener(moveInputModeOnDragFinished)
  editorMode.moveInputMode.removeDragFinishingListener(moveInputModeOnDragFinishing)
  editorMode.moveInputMode.removeDragStartedListener(moveInputModeOnDragStarted)
  editorMode.moveInputMode.removeDragStartingListener(moveInputModeOnDragStarting)
  editorMode.moveInputMode.removeDraggedListener(moveInputModeOnDragged)
  editorMode.moveInputMode.removeDraggingListener(moveInputModeOnDragging)
  editorMode.moveInputMode.removeQueryPositionHandlerListener(moveInputModeOnQueryPositionHandler)
}

/**
 * Registers events to the move input mode regarding labels.
 */
function registerMoveLabelInputModeEvents(): void {
  editorMode.moveLabelInputMode.addDragCanceledListener(moveLabelInputModeOnDragCanceled)
  editorMode.moveLabelInputMode.addDragCancelingListener(moveLabelInputModeOnDragCanceling)
  editorMode.moveLabelInputMode.addDragFinishedListener(moveLabelInputModeOnDragFinished)
  editorMode.moveLabelInputMode.addDragFinishingListener(moveLabelInputModeOnDragFinishing)
  editorMode.moveLabelInputMode.addDragStartedListener(moveLabelInputModeOnDragStarted)
  editorMode.moveLabelInputMode.addDragStartingListener(moveLabelInputModeOnDragStarting)
  editorMode.moveLabelInputMode.addDraggedListener(moveLabelInputModeOnDragged)
  editorMode.moveLabelInputMode.addDraggingListener(moveLabelInputModeOnDragging)
}

/**
 * Deregisters events from the move input mode regarding labels.
 */
function deregisterMoveLabelInputModeEvents(): void {
  editorMode.moveLabelInputMode.removeDragCanceledListener(moveLabelInputModeOnDragCanceled)
  editorMode.moveLabelInputMode.removeDragCancelingListener(moveLabelInputModeOnDragCanceling)
  editorMode.moveLabelInputMode.removeDragFinishedListener(moveLabelInputModeOnDragFinished)
  editorMode.moveLabelInputMode.removeDragFinishingListener(moveLabelInputModeOnDragFinishing)
  editorMode.moveLabelInputMode.removeDragStartedListener(moveLabelInputModeOnDragStarted)
  editorMode.moveLabelInputMode.removeDragStartingListener(moveLabelInputModeOnDragStarting)
  editorMode.moveLabelInputMode.removeDraggedListener(moveLabelInputModeOnDragged)
  editorMode.moveLabelInputMode.removeDraggingListener(moveLabelInputModeOnDragging)
}

/**
 * Registers events to the node drop input mode.
 */
function registerItemDropInputModeEvents(): void {
  editorMode.nodeDropInputMode.addDragDroppedListener(itemInputModeOnDragDropped)
  editorMode.nodeDropInputMode.addDragEnteredListener(itemInputModeOnDragEntered)
  editorMode.nodeDropInputMode.addDragLeftListener(itemInputModeOnDragLeft)
  editorMode.nodeDropInputMode.addDragOverListener(itemInputModeOnDragOver)
  editorMode.nodeDropInputMode.addItemCreatedListener(itemInputModeOnItemCreated)
  editorMode.labelDropInputMode.addDragDroppedListener(itemInputModeOnDragDropped)
  editorMode.labelDropInputMode.addDragEnteredListener(itemInputModeOnDragEntered)
  editorMode.labelDropInputMode.addDragLeftListener(itemInputModeOnDragLeft)
  editorMode.labelDropInputMode.addDragOverListener(itemInputModeOnDragOver)
  editorMode.labelDropInputMode.addItemCreatedListener(itemInputModeOnItemCreated)
  editorMode.portDropInputMode.addDragDroppedListener(itemInputModeOnDragDropped)
  editorMode.portDropInputMode.addDragEnteredListener(itemInputModeOnDragEntered)
  editorMode.portDropInputMode.addDragLeftListener(itemInputModeOnDragLeft)
  editorMode.portDropInputMode.addDragOverListener(itemInputModeOnDragOver)
  editorMode.portDropInputMode.addItemCreatedListener(itemInputModeOnItemCreated)
}

/**
 * Deregisters events from the node drop input mode.
 */
function deregisterItemDropInputModeEvents(): void {
  editorMode.nodeDropInputMode.removeDragDroppedListener(itemInputModeOnDragDropped)
  editorMode.nodeDropInputMode.removeDragEnteredListener(itemInputModeOnDragEntered)
  editorMode.nodeDropInputMode.removeDragLeftListener(itemInputModeOnDragLeft)
  editorMode.nodeDropInputMode.removeDragOverListener(itemInputModeOnDragOver)
  editorMode.nodeDropInputMode.removeItemCreatedListener(itemInputModeOnItemCreated)
  editorMode.labelDropInputMode.removeDragDroppedListener(itemInputModeOnDragDropped)
  editorMode.labelDropInputMode.removeDragEnteredListener(itemInputModeOnDragEntered)
  editorMode.labelDropInputMode.removeDragLeftListener(itemInputModeOnDragLeft)
  editorMode.labelDropInputMode.removeDragOverListener(itemInputModeOnDragOver)
  editorMode.labelDropInputMode.removeItemCreatedListener(itemInputModeOnItemCreated)
  editorMode.portDropInputMode.removeDragDroppedListener(itemInputModeOnDragDropped)
  editorMode.portDropInputMode.removeDragEnteredListener(itemInputModeOnDragEntered)
  editorMode.portDropInputMode.removeDragLeftListener(itemInputModeOnDragLeft)
  editorMode.portDropInputMode.removeDragOverListener(itemInputModeOnDragOver)
  editorMode.portDropInputMode.removeItemCreatedListener(itemInputModeOnItemCreated)
}

/**
 * Registers hover events to the input mode.
 */
function registerItemHoverInputModeEvents(): void {
  editorMode.itemHoverInputMode.addHoveredItemChangedListener(
    itemHoverInputModeOnHoveredItemChanged
  )
  viewerMode.itemHoverInputMode.addHoveredItemChangedListener(
    itemHoverInputModeOnHoveredItemChanged
  )
}

/**
 * Deregisters hover events from the input mode.
 */
function deregisterItemHoverInputModeEvents(): void {
  editorMode.itemHoverInputMode.removeHoveredItemChangedListener(
    itemHoverInputModeOnHoveredItemChanged
  )
  viewerMode.itemHoverInputMode.removeHoveredItemChangedListener(
    itemHoverInputModeOnHoveredItemChanged
  )
}

/**
 * Registers events to the bend input mode.
 */
function registerCreateBendInputModeEvents(): void {
  editorMode.createBendInputMode.addBendCreatedListener(createBendInputModeOnBendCreated)
  editorMode.createBendInputMode.addDragCanceledListener(createBendInputModeOnDragCanceled)
  editorMode.createBendInputMode.addDraggedListener(createBendInputModeOnDragged)
  editorMode.createBendInputMode.addDraggingListener(createBendInputModeOnDragging)
}

/**
 * Deregisters events from the bend input mode.
 */
function deregisterCreateBendInputModeEvents(): void {
  editorMode.createBendInputMode.removeBendCreatedListener(createBendInputModeOnBendCreated)
  editorMode.createBendInputMode.removeDragCanceledListener(createBendInputModeOnDragCanceled)
  editorMode.createBendInputMode.removeDraggedListener(createBendInputModeOnDragged)
  editorMode.createBendInputMode.removeDraggingListener(createBendInputModeOnDragging)
}

/**
 * "Simulate" a context menu, so the various context menu events are fired.
 * Please see the ContextMenu demo for details about wiring a context menu implementation
 * to the input modes. See the Dojo and jQuery toolkit demos about using a third-party
 * context menu widget with yFiles.
 */
function onContextMenu(): void {
  editorMode.contextMenuInputMode.shouldOpenMenu(Point.ORIGIN)
  viewerMode.contextMenuInputMode.shouldOpenMenu(Point.ORIGIN)
}

/**
 * Registers events related to the context menu.
 */
function registerContextMenuInputModeEvents(): void {
  editorMode.contextMenuInputMode.addPopulateMenuListener(contextMenuInputModeOnPopulateMenu)
  viewerMode.contextMenuInputMode.addPopulateMenuListener(contextMenuInputModeOnPopulateMenu)
}

/**
 * Deregisters events related to the context menu.
 */
function deregisterContextMenuInputModeEvents(): void {
  editorMode.contextMenuInputMode.removePopulateMenuListener(contextMenuInputModeOnPopulateMenu)
  viewerMode.contextMenuInputMode.removePopulateMenuListener(contextMenuInputModeOnPopulateMenu)
}

/**
 * Registers events related to the tap input mode.
 */
function registerTapInputModeEvents(): void {
  editorMode.tapInputMode.addDoubleTappedListener(tapInputModeOnDoubleTapped)
  editorMode.tapInputMode.addTappedListener(tapInputModeOnTapped)
  viewerMode.tapInputMode.addDoubleTappedListener(tapInputModeOnDoubleTapped)
  viewerMode.tapInputMode.addTappedListener(tapInputModeOnTapped)
}

/**
 * Deregisters events related from the tap input mode.
 */
function deregisterTapInputModeEvents(): void {
  editorMode.tapInputMode.removeDoubleTappedListener(tapInputModeOnDoubleTapped)
  editorMode.tapInputMode.removeTappedListener(tapInputModeOnTapped)
  viewerMode.tapInputMode.removeDoubleTappedListener(tapInputModeOnDoubleTapped)
  viewerMode.tapInputMode.removeTappedListener(tapInputModeOnTapped)
}

/**
 * Registers events related to the text editor mode.
 */
function registerTextEditorInputModeEvents(): void {
  editorMode.textEditorInputMode.addEditingCanceledListener(textEditorInputModeOnEditingCanceled)
  editorMode.textEditorInputMode.addEditingStartedListener(textEditorInputModeOnEditingStarted)
  editorMode.textEditorInputMode.addTextEditedListener(textEditorInputModeOnTextEdited)
}

/**
 * Deregisters events related from the text editor mode.
 */
function deregisterTextEditorInputModeEvents(): void {
  editorMode.textEditorInputMode.removeEditingCanceledListener(textEditorInputModeOnEditingCanceled)
  editorMode.textEditorInputMode.removeEditingStartedListener(textEditorInputModeOnEditingStarted)
  editorMode.textEditorInputMode.removeTextEditedListener(textEditorInputModeOnTextEdited)
}

/**
 * Registers events related to mouse hovering to the input mode.
 */
function registerMouseHoverInputModeEvents(): void {
  editorMode.mouseHoverInputMode.addQueryToolTipListener(mouseHoverInputModeOnQueryToolTip)
  viewerMode.mouseHoverInputMode.addQueryToolTipListener(mouseHoverInputModeOnQueryToolTip)
}

/**
 * Registers events related to mouse hovering from the input mode.
 */
function deregisterMouseHoverInputModeEvents(): void {
  editorMode.mouseHoverInputMode.removeQueryToolTipListener(mouseHoverInputModeOnQueryToolTip)
  viewerMode.mouseHoverInputMode.removeQueryToolTipListener(mouseHoverInputModeOnQueryToolTip)
}

/**
 * Registers events related to mouse hovering to the navigation input mode.
 */
function registerNavigationInputModeEvents(): void {
  editorMode.navigationInputMode.addGroupCollapsedListener(navigationInputModeOnGroupCollapsed)
  editorMode.navigationInputMode.addGroupCollapsingListener(navigationInputModeOnGroupCollapsing)
  editorMode.navigationInputMode.addGroupEnteredListener(navigationInputModeOnGroupEntered)
  editorMode.navigationInputMode.addGroupEnteringListener(navigationInputModeOnGroupEntering)
  editorMode.navigationInputMode.addGroupExitedListener(navigationInputModeOnGroupExited)
  editorMode.navigationInputMode.addGroupExitingListener(navigationInputModeOnGroupExiting)
  editorMode.navigationInputMode.addGroupExpandedListener(navigationInputModeOnGroupExpanded)
  editorMode.navigationInputMode.addGroupExpandingListener(navigationInputModeOnGroupExpanding)

  viewerMode.navigationInputMode.addGroupCollapsedListener(navigationInputModeOnGroupCollapsed)
  viewerMode.navigationInputMode.addGroupCollapsingListener(navigationInputModeOnGroupCollapsing)
  viewerMode.navigationInputMode.addGroupEnteredListener(navigationInputModeOnGroupEntered)
  viewerMode.navigationInputMode.addGroupEnteringListener(navigationInputModeOnGroupEntering)
  viewerMode.navigationInputMode.addGroupExitedListener(navigationInputModeOnGroupExited)
  viewerMode.navigationInputMode.addGroupExitingListener(navigationInputModeOnGroupExiting)
  viewerMode.navigationInputMode.addGroupExpandedListener(navigationInputModeOnGroupExpanded)
  viewerMode.navigationInputMode.addGroupExpandingListener(navigationInputModeOnGroupExpanding)
}

/**
 * Deregisters events related to mouse hovering from the navigation input mode.
 */
function deregisterNavigationInputModeEvents(): void {
  editorMode.navigationInputMode.removeGroupCollapsedListener(navigationInputModeOnGroupCollapsed)
  editorMode.navigationInputMode.removeGroupCollapsingListener(navigationInputModeOnGroupCollapsing)
  editorMode.navigationInputMode.removeGroupEnteredListener(navigationInputModeOnGroupEntered)
  editorMode.navigationInputMode.removeGroupEnteringListener(navigationInputModeOnGroupEntering)
  editorMode.navigationInputMode.removeGroupExitedListener(navigationInputModeOnGroupExited)
  editorMode.navigationInputMode.removeGroupExitingListener(navigationInputModeOnGroupExiting)
  editorMode.navigationInputMode.removeGroupExpandedListener(navigationInputModeOnGroupExpanded)
  editorMode.navigationInputMode.removeGroupExpandingListener(navigationInputModeOnGroupExpanding)

  viewerMode.navigationInputMode.removeGroupCollapsedListener(navigationInputModeOnGroupCollapsed)
  viewerMode.navigationInputMode.removeGroupCollapsingListener(navigationInputModeOnGroupCollapsing)
  viewerMode.navigationInputMode.removeGroupEnteredListener(navigationInputModeOnGroupEntered)
  viewerMode.navigationInputMode.removeGroupEnteringListener(navigationInputModeOnGroupEntering)
  viewerMode.navigationInputMode.removeGroupExitedListener(navigationInputModeOnGroupExited)
  viewerMode.navigationInputMode.removeGroupExitingListener(navigationInputModeOnGroupExiting)
  viewerMode.navigationInputMode.removeGroupExpandedListener(navigationInputModeOnGroupExpanded)
  viewerMode.navigationInputMode.removeGroupExpandingListener(navigationInputModeOnGroupExpanding)
}

/**
 * Registers events to the click input mode.
 */
function registerClickInputModeEvents(): void {
  editorMode.clickInputMode.addClickedListener(clickInputModeOnClicked)
  editorMode.clickInputMode.addDoubleClickedListener(clickInputModeOnDoubleClicked)
  editorMode.clickInputMode.addLeftClickedListener(clickInputModeOnLeftClicked)
  editorMode.clickInputMode.addLeftDoubleClickedListener(clickInputModeOnLeftDoubleClicked)
  editorMode.clickInputMode.addRightClickedListener(clickInputModeOnRightClicked)
  editorMode.clickInputMode.addRightDoubleClickedListener(clickInputModeOnRightDoubleClicked)

  viewerMode.clickInputMode.addClickedListener(clickInputModeOnClicked)
  viewerMode.clickInputMode.addDoubleClickedListener(clickInputModeOnDoubleClicked)
  viewerMode.clickInputMode.addLeftClickedListener(clickInputModeOnLeftClicked)
  viewerMode.clickInputMode.addLeftDoubleClickedListener(clickInputModeOnLeftDoubleClicked)
  viewerMode.clickInputMode.addRightClickedListener(clickInputModeOnRightClicked)
  viewerMode.clickInputMode.addRightDoubleClickedListener(clickInputModeOnRightDoubleClicked)
}

/**
 * Deregisters events from the click input mode.
 */
function deregisterClickInputModeEvents(): void {
  editorMode.clickInputMode.removeClickedListener(clickInputModeOnClicked)
  editorMode.clickInputMode.removeDoubleClickedListener(clickInputModeOnDoubleClicked)
  editorMode.clickInputMode.removeLeftClickedListener(clickInputModeOnLeftClicked)
  editorMode.clickInputMode.removeLeftDoubleClickedListener(clickInputModeOnLeftDoubleClicked)
  editorMode.clickInputMode.removeRightClickedListener(clickInputModeOnRightClicked)
  editorMode.clickInputMode.removeRightDoubleClickedListener(clickInputModeOnRightDoubleClicked)

  viewerMode.clickInputMode.removeClickedListener(clickInputModeOnClicked)
  viewerMode.clickInputMode.removeDoubleClickedListener(clickInputModeOnDoubleClicked)
  viewerMode.clickInputMode.removeLeftClickedListener(clickInputModeOnLeftClicked)
  viewerMode.clickInputMode.removeLeftDoubleClickedListener(clickInputModeOnLeftDoubleClicked)
  viewerMode.clickInputMode.removeRightClickedListener(clickInputModeOnRightClicked)
  viewerMode.clickInputMode.removeRightDoubleClickedListener(clickInputModeOnRightDoubleClicked)
}

/**
 * Registers events to the click input mode.
 */
function registerHandleInputModeEvents(): void {
  editorMode.handleInputMode.addDragCanceledListener(handleInputModeOnDragCanceled)
  editorMode.handleInputMode.addDragCancelingListener(handleInputModeOnDragCanceling)
  editorMode.handleInputMode.addDragFinishedListener(handleInputModeOnDragFinished)
  editorMode.handleInputMode.addDragFinishingListener(handleInputModeOnDragFinishing)
  editorMode.handleInputMode.addDragStartedListener(handleInputModeOnDragStarted)
  editorMode.handleInputMode.addDragStartingListener(handleInputModeOnDragStarting)
  editorMode.handleInputMode.addDraggedListener(handleInputModeOnDragged)
  editorMode.handleInputMode.addDraggingListener(handleInputModeOnDragging)
}

/**
 * Deregisters events from the handle input mode.
 */
function deregisterHandleInputModeEvents(): void {
  editorMode.handleInputMode.removeDragCanceledListener(handleInputModeOnDragCanceled)
  editorMode.handleInputMode.removeDragCancelingListener(handleInputModeOnDragCanceling)
  editorMode.handleInputMode.removeDragFinishedListener(handleInputModeOnDragFinished)
  editorMode.handleInputMode.removeDragFinishingListener(handleInputModeOnDragFinishing)
  editorMode.handleInputMode.removeDragStartedListener(handleInputModeOnDragStarted)
  editorMode.handleInputMode.removeDragStartingListener(handleInputModeOnDragStarting)
  editorMode.handleInputMode.removeDraggedListener(handleInputModeOnDragged)
  editorMode.handleInputMode.removeDraggingListener(handleInputModeOnDragging)
}

/**
 * Registers events to the move viewport input mode.
 */
function registerMoveViewportInputModeEvents(): void {
  editorMode.moveViewportInputMode.addDragCanceledListener(moveViewportInputModeOnDragCanceled)
  editorMode.moveViewportInputMode.addDragCancelingListener(moveViewportInputModeOnDragCanceling)
  editorMode.moveViewportInputMode.addDragFinishedListener(moveViewportInputModeOnDragFinished)
  editorMode.moveViewportInputMode.addDragFinishingListener(moveViewportInputModeOnDragFinishing)
  editorMode.moveViewportInputMode.addDragStartedListener(moveViewportInputModeOnDragStarted)
  editorMode.moveViewportInputMode.addDragStartingListener(moveViewportInputModeOnDragStarting)
  editorMode.moveViewportInputMode.addDraggedListener(moveViewportInputModeOnDragged)
  editorMode.moveViewportInputMode.addDraggingListener(moveViewportInputModeOnDragging)

  viewerMode.moveViewportInputMode.addDragCanceledListener(moveViewportInputModeOnDragCanceled)
  viewerMode.moveViewportInputMode.addDragCancelingListener(moveViewportInputModeOnDragCanceling)
  viewerMode.moveViewportInputMode.addDragFinishedListener(moveViewportInputModeOnDragFinished)
  viewerMode.moveViewportInputMode.addDragFinishingListener(moveViewportInputModeOnDragFinishing)
  viewerMode.moveViewportInputMode.addDragStartedListener(moveViewportInputModeOnDragStarted)
  viewerMode.moveViewportInputMode.addDragStartingListener(moveViewportInputModeOnDragStarting)
  viewerMode.moveViewportInputMode.addDraggedListener(moveViewportInputModeOnDragged)
  viewerMode.moveViewportInputMode.addDraggingListener(moveViewportInputModeOnDragging)
}

/**
 * Deregisters events from the move viewport input mode.
 */
function deregisterMoveViewportInputModeEvents(): void {
  editorMode.moveViewportInputMode.removeDragCanceledListener(moveViewportInputModeOnDragCanceled)
  editorMode.moveViewportInputMode.removeDragCancelingListener(moveViewportInputModeOnDragCanceling)
  editorMode.moveViewportInputMode.removeDragFinishedListener(moveViewportInputModeOnDragFinished)
  editorMode.moveViewportInputMode.removeDragFinishingListener(moveViewportInputModeOnDragFinishing)
  editorMode.moveViewportInputMode.removeDragStartedListener(moveViewportInputModeOnDragStarted)
  editorMode.moveViewportInputMode.removeDragStartingListener(moveViewportInputModeOnDragStarting)
  editorMode.moveViewportInputMode.removeDraggedListener(moveViewportInputModeOnDragged)
  editorMode.moveViewportInputMode.removeDraggingListener(moveViewportInputModeOnDragging)

  viewerMode.moveViewportInputMode.removeDragCanceledListener(moveViewportInputModeOnDragCanceled)
  viewerMode.moveViewportInputMode.removeDragCancelingListener(moveViewportInputModeOnDragCanceling)
  viewerMode.moveViewportInputMode.removeDragFinishedListener(moveViewportInputModeOnDragFinished)
  viewerMode.moveViewportInputMode.removeDragFinishingListener(moveViewportInputModeOnDragFinishing)
  viewerMode.moveViewportInputMode.removeDragStartedListener(moveViewportInputModeOnDragStarted)
  viewerMode.moveViewportInputMode.removeDragStartingListener(moveViewportInputModeOnDragStarting)
  viewerMode.moveViewportInputMode.removeDraggedListener(moveViewportInputModeOnDragged)
  viewerMode.moveViewportInputMode.removeDraggingListener(moveViewportInputModeOnDragging)
}

/**
 * Registers events to the create edge input mode.
 */
function registerCreateEdgeInputModeEvents(): void {
  editorMode.createEdgeInputMode.addEdgeCreatedListener(createEdgeInputModeOnEdgeCreated)
  editorMode.createEdgeInputMode.addEdgeCreationStartedListener(
    createEdgeInputModeOnEdgeCreationStarted
  )
  editorMode.createEdgeInputMode.addGestureCanceledListener(createEdgeInputModeOnGestureCanceled)
  editorMode.createEdgeInputMode.addGestureCancelingListener(createEdgeInputModeOnGestureCanceling)
  editorMode.createEdgeInputMode.addGestureFinishedListener(createEdgeInputModeOnGestureFinished)
  editorMode.createEdgeInputMode.addGestureFinishingListener(createEdgeInputModeOnGestureFinishing)
  editorMode.createEdgeInputMode.addGestureStartedListener(createEdgeInputModeOnGestureStarted)
  editorMode.createEdgeInputMode.addGestureStartingListener(createEdgeInputModeOnGestureStarting)
  editorMode.createEdgeInputMode.addMovedListener(createEdgeInputModeOnMoved)
  editorMode.createEdgeInputMode.addMovingListener(createEdgeInputModeOnMoving)
  editorMode.createEdgeInputMode.addPortAddedListener(createEdgeInputModeOnPortAdded)
}

/**
 * Deregisters events from the create edge input mode.
 */
function deregisterCreateEdgeInputModeEvents(): void {
  editorMode.createEdgeInputMode.removeEdgeCreatedListener(createEdgeInputModeOnEdgeCreated)
  editorMode.createEdgeInputMode.removeEdgeCreationStartedListener(
    createEdgeInputModeOnEdgeCreationStarted
  )
  editorMode.createEdgeInputMode.removeGestureCanceledListener(createEdgeInputModeOnGestureCanceled)
  editorMode.createEdgeInputMode.removeGestureCancelingListener(
    createEdgeInputModeOnGestureCanceling
  )
  editorMode.createEdgeInputMode.removeGestureFinishedListener(createEdgeInputModeOnGestureFinished)
  editorMode.createEdgeInputMode.removeGestureFinishingListener(
    createEdgeInputModeOnGestureFinishing
  )
  editorMode.createEdgeInputMode.removeGestureStartedListener(createEdgeInputModeOnGestureStarted)
  editorMode.createEdgeInputMode.removeGestureStartingListener(createEdgeInputModeOnGestureStarting)
  editorMode.createEdgeInputMode.removeMovedListener(createEdgeInputModeOnMoved)
  editorMode.createEdgeInputMode.removeMovingListener(createEdgeInputModeOnMoving)
  editorMode.createEdgeInputMode.removePortAddedListener(createEdgeInputModeOnPortAdded)
}

/**
 * Registers selection events to the graphComponent.
 */
function registerSelectionEvents(): void {
  graphComponent.selection.addItemSelectionChangedListener(onItemSelectionChanged)
}

/**
 * Deregisters selection events from the graphComponent.
 */
function deregisterSelectionEvents(): void {
  graphComponent.selection.removeItemSelectionChangedListener(onItemSelectionChanged)
}

const eventRegistration: Record<string, () => void> = {
  registerGraphComponentKeyEvents,
  deregisterGraphComponentKeyEvents,
  registerClipboardCopierEvents,
  deregisterClipboardCopierEvents,
  registerGraphComponentMouseEvents,
  deregisterGraphComponentMouseEvents,
  registerGraphComponentTouchEvents,
  deregisterGraphComponentTouchEvents,
  registerGraphComponentRenderEvents,
  deregisterGraphComponentRenderEvents,
  registerGraphComponentViewportEvents,
  deregisterGraphComponentViewportEvents,
  registerNodeEvents,
  deregisterNodeEvents,
  registerEdgeEvents,
  deregisterEdgeEvents,
  registerBendEvents,
  deregisterBendEvents,
  registerPortEvents,
  deregisterPortEvents,
  registerLabelEvents,
  deregisterLabelEvents,
  registerHierarchyEvents,
  deregisterHierarchyEvents,
  registerFoldingEvents,
  deregisterFoldingEvents,
  registerGraphRenderEvents,
  deregisterGraphRenderEvents,
  registerGraphComponentEvents,
  deregisterGraphComponentEvents,
  registerInputModeEvents,
  deregisterInputModeEvents,
  registerMoveInputModeEvents,
  deregisterMoveInputModeEvents,
  registerMoveLabelInputModeEvents,
  deregisterMoveLabelInputModeEvents,
  registerItemDropInputModeEvents,
  deregisterItemDropInputModeEvents,
  registerItemHoverInputModeEvents,
  deregisterItemHoverInputModeEvents,
  registerCreateBendInputModeEvents,
  deregisterCreateBendInputModeEvents,
  registerContextMenuInputModeEvents,
  deregisterContextMenuInputModeEvents,
  registerTapInputModeEvents,
  deregisterTapInputModeEvents,
  registerTextEditorInputModeEvents,
  deregisterTextEditorInputModeEvents,
  registerMouseHoverInputModeEvents,
  deregisterMouseHoverInputModeEvents,
  registerNavigationInputModeEvents,
  deregisterNavigationInputModeEvents,
  registerClickInputModeEvents,
  deregisterClickInputModeEvents,
  registerHandleInputModeEvents,
  deregisterHandleInputModeEvents,
  registerMoveViewportInputModeEvents,
  deregisterMoveViewportInputModeEvents,
  registerCreateEdgeInputModeEvents,
  deregisterCreateEdgeInputModeEvents,
  registerSelectionEvents,
  deregisterSelectionEvents
}

/**
 * Invoked when the display has to be invalidated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onDisplaysInvalidated(sender: object, args: EventArgs): void {
  log(sender, 'Displays Invalidated')
}

/**
 * Invoked when the port of an edge changes.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onEdgePortsChanged(sender: object, args: EdgeEventArgs): void {
  logWithType(sender, `Edge Ports Changed: ${args.item}`, 'EdgePortsChanged')
}

/**
 * Invoked when the style of an edge changes.
 * @param sender The source of the event
 * @param args An object that
 *   contains the event data
 */
function onEdgeStyleChanged(sender: object, args: ItemChangedEventArgs<IEdge, IEdgeStyle>): void {
  logWithType(sender, `Edge Style Changed: ${args.item}`, 'EdgeStyleChanged')
}

/**
 * Invoked when the tag of an edge changes.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onEdgeTagChanged(sender: object, args: ItemChangedEventArgs<IEdge, any>): void {
  logWithType(sender, `Edge Tag Changed: ${args.item}`, 'EdgeTagChanged')
}

/**
 * Invoked when an edge has been created.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onEdgeCreated(sender: IGraph, args: ItemEventArgs<IEdge>): void {
  logWithType(sender, `Edge Created: ${args.item}`, 'EdgeCreated')
}

/**
 * Invoked when an edge has been removed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onEdgeRemoved(sender: object, args: EdgeEventArgs): void {
  logWithType(sender, `Edge Removed: ${args.item}`, 'EdgeRemoved')
}

/**
 * Invoked when a label has been added.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onLabelAdded(sender: object, args: ItemEventArgs<ILabel>): void {
  logWithType(sender, `Label Added: ${args.item}`, 'LabelAdded')
}

/**
 * Invoked when a label has been added.
 * @param sender The source of the event
 * @param args An object that contains
 *   the event data
 */
function onLabelPreferredSizeChanged(
  sender: object,
  args: ItemChangedEventArgs<ILabel, Size>
): void {
  logWithType(sender, `Label Preferred Size Changed: ${args.item}`, 'LabelPreferredSizeChanged')
}

/**
 * Invoked when the parameter of a label has changed.
 * @param sender The source of the event
 * @param args An object
 *   that contains the event data
 */
function onLabelLayoutParameterChanged(
  sender: object,
  args: ItemChangedEventArgs<ILabel, ILabelModelParameter>
): void {
  logWithType(sender, `Label Layout Parameter Changed: ${args.item}`, 'LabelLayoutParameterChanged')
}

/**
 * Invoked when the style of a label has changed.
 * @param sender The source of the event
 * @param args An object that
 *   contains the event data
 */
function onLabelStyleChanged(
  sender: object,
  args: ItemChangedEventArgs<ILabel, ILabelStyle>
): void {
  logWithType(sender, `Label Style Changed: ${args.item}`, 'LabelStyleChanged')
}

/**
 * Invoked when the tag of a label has changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onLabelTagChanged(sender: object, args: ItemChangedEventArgs<ILabel, any>): void {
  logWithType(sender, `Label Tag Changed: ${args.item}`, 'LabelTagChanged')
}

/**
 * Invoked when the text of a label has changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onLabelTextChanged(sender: object, args: ItemChangedEventArgs<ILabel, string>): void {
  logWithType(sender, `Label Text Changed: ${args.item}`, 'LabelTextChanged')
}

/**
 * Invoked when the text of a label has been removed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onLabelRemoved(sender: object, args: LabelEventArgs): void {
  logWithType(sender, `Label Removed: ${args.item}`, 'LabelRemoved')
}

/**
 * Invoked when the layout of a node has changed.
 * @param sender The source of the event
 * @param node The given node
 */
function onNodeLayoutChanged(sender: object, node: INode): void {
  logWithType(sender, `Node Layout Changed: ${node}`, 'NodeLayoutChanged')
}

/**
 * Invoked when the style of a node has changed.
 * @param sender The source of the event
 * @param args An object that
 *   contains the event data
 */
function onNodeStyleChanged(sender: object, args: ItemChangedEventArgs<INode, INodeStyle>): void {
  logWithType(sender, `Node Style Changed: ${args.item}`, 'NodeStyleChanged')
}

/**
 * Invoked when the tag of a node has changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onNodeTagChanged(sender: object, args: ItemChangedEventArgs<INode, any>): void {
  logWithType(sender, `Node Tag Changed: ${args.item}`, 'NodeTagChanged')
}

/**
 * Invoked when a node has been created.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onNodeCreated(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `Node Created: ${args.item}`, 'NodeCreated')
}

/**
 * Invoked when a node has been removed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onNodeRemoved(sender: object, args: NodeEventArgs): void {
  logWithType(sender, `Node Removed: ${args.item}`, 'NodeRemoved')
}

/**
 * Invoked when a port has been added.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onPortAdded(sender: object, args: ItemEventArgs<IPort>): void {
  logWithType(sender, `Port Added: ${args.item}`, 'PortAdded')
}

/**
 * Invoked when the location parameter of a port has changed.
 * @param sender The source of the event
 * @param args An
 *   object that contains the event data
 */
function onPortLocationParameterChanged(
  sender: object,
  args: ItemChangedEventArgs<IPort, IPortLocationModelParameter>
): void {
  logWithType(
    sender,
    `Port Location Parameter Changed: ${args.item}`,
    'PortLocationParameterChanged'
  )
}

/**
 * Invoked when the style of a port has changed.
 * @param sender The source of the event
 * @param args An object that
 *   contains the event data
 */
function onPortStyleChanged(sender: object, args: ItemChangedEventArgs<IPort, IPortStyle>): void {
  logWithType(sender, `Port Style Changed: ${args.item}`, 'PortStyleChanged')
}

/**
 * Invoked when the tag of a port has changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onPortTagChanged(sender: object, args: ItemChangedEventArgs<IPort, any>): void {
  logWithType(sender, `Port Tag Changed: ${args.item}`, 'PortTagChanged')
}

/**
 * Invoked when a port has been removed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onPortRemoved(sender: object, args: PortEventArgs): void {
  logWithType(sender, `Port Removed: ${args.item}`, 'PortRemoved')
}

/**
 * Invoked when a bend has been added.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onBendAdded(sender: object, args: ItemEventArgs<IBend>): void {
  logWithType(sender, `Bend Added: ${args.item}`, 'BendAdded')
}

/**
 * Invoked when the location of a bend has changed.
 * @param sender The source of the event
 * @param bend The bend whose location has changed
 */
function onBendLocationChanged(sender: object, bend: IBend): void {
  logWithType(sender, `Bend Location Changed: ${bend}`, 'BendLocationChanged')
}

/**
 * Invoked when the tag of a bend has changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onBendTagChanged(sender: object, args: ItemChangedEventArgs<IBend, any>): void {
  logWithType(sender, `Bend Tag Changed: ${args.item}`, 'BendTagChanged')
}

/**
 * Invoked when a bend has been removed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onBendRemoved(sender: object, args: BendEventArgs): void {
  logWithType(sender, `Bend Removed: ${args.item}`, 'BendRemoved')
}

/**
 * Invoked when the parent of a node has changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onParentChanged(sender: object, args: NodeEventArgs): void {
  logWithType(
    sender,
    `Parent Changed: ${args.parent} -> ${graphComponent.graph.getParent(args.item)}`,
    'ParentChanged'
  )
}

/**
 * Invoked when the group node status of a node has changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onIsGroupNodeChanged(sender: object, args: NodeEventArgs): void {
  logWithType(sender, `Group State Changed: ${args.isGroupNode}`, 'IsGroupNodeChanged')
}

/**
 * Invoked when a group has been collapsed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onGroupCollapsed(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `Group Collapsed: ${args.item}`, 'GroupCollapsed')
}

/**
 * Invoked when a group has been expanded.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onGroupExpanded(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `Group Expanded: ${args.item}`, 'GroupExpanded')
}

/**
 * Invoked when a property has changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onPropertyChanged(sender: object, args: PropertyChangedEventArgs): void {
  logWithType(sender, `Property Changed: ${args.propertyName}`, 'PropertyChanged')
}

/**
 * Invoked when the entire graph has been copied to clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnGraphCopiedToClipboard(
  sender: object,
  args: ItemCopiedEventArgs<IGraph>
): void {
  log(sender, 'Graph copied to Clipboard')
}

/**
 * Invoked when a node has been copied to clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnNodeCopiedToClipboard(sender: object, args: ItemCopiedEventArgs<INode>): void {
  log(sender, 'Graph Item copied to Clipboard')
}

/**
 * Invoked when an edge has been copied to clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnEdgeCopiedToClipboard(sender: object, args: ItemCopiedEventArgs<IEdge>): void {
  log(sender, 'Graph Item copied to Clipboard')
}

/**
 * Invoked when a port has been copied to clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnPortCopiedToClipboard(sender: object, args: ItemCopiedEventArgs<IPort>): void {
  log(sender, 'Graph Item copied to Clipboard')
}

/**
 * Invoked when a label has been copied to clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnLabelCopiedToClipboard(
  sender: object,
  args: ItemCopiedEventArgs<ILabel>
): void {
  log(sender, 'Graph Item copied to Clipboard')
}

/**
 * Invoked when a style has been copied to clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnObjectCopiedToClipboard(sender: object, args: ItemCopiedEventArgs<any>): void {
  log(sender, 'Object copied to Clipboard')
}

/**
 * Invoked when the entire graph has been copied from clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnGraphCopiedFromClipboard(
  sender: object,
  args: ItemCopiedEventArgs<IGraph>
): void {
  log(sender, 'Graph copied from Clipboard')
}

/**
 * Invoked when a node has been copied from clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnNodeCopiedFromClipboard(
  sender: object,
  args: ItemCopiedEventArgs<INode>
): void {
  log(sender, 'Graph Item copied to Clipboard')
}

/**
 * Invoked when an edge has been copied from clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnEdgeCopiedFromClipboard(
  sender: object,
  args: ItemCopiedEventArgs<IEdge>
): void {
  log(sender, 'Graph Item copied to Clipboard')
}

/**
 * Invoked when a port has been copied from clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnPortCopiedFromClipboard(
  sender: object,
  args: ItemCopiedEventArgs<IPort>
): void {
  log(sender, 'Graph Item copied to Clipboard')
}

/**
 * Invoked when a label has been copied from clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnLabelCopiedFromClipboard(
  sender: object,
  args: ItemCopiedEventArgs<ILabel>
): void {
  log(sender, 'Graph Item copied to Clipboard')
}

/**
 * Invoked when a style has been copied from clipboard.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnObjectCopiedFromClipboard(
  sender: object,
  args: ItemCopiedEventArgs<any>
): void {
  log(sender, 'Object copied from Clipboard')
}

/**
 * Invoked when the entire graph has been duplicated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnGraphDuplicated(sender: object, args: ItemCopiedEventArgs<IGraph>): void {
  log(sender, 'Graph duplicated.')
}

/**
 * Invoked when a node has been duplicated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnNodeDuplicated(sender: object, args: ItemCopiedEventArgs<INode>): void {
  log(sender, 'Graph Item duplicated')
}

/**
 * Invoked when an edge has been duplicated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnEdgeDuplicated(sender: object, args: ItemCopiedEventArgs<IEdge>): void {
  log(sender, 'Graph Item duplicated')
}

/**
 * Invoked when a port has been duplicated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnPortDuplicated(sender: object, args: ItemCopiedEventArgs<IPort>): void {
  log(sender, 'Graph Item duplicated')
}

/**
 * Invoked when a label has been duplicated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnLabelDuplicated(sender: object, args: ItemCopiedEventArgs<ILabel>): void {
  log(sender, 'Graph Item duplicated')
}

/**
 * Invoked when a style has been duplicated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clipboardOnObjectDuplicated(sender: object, args: ItemCopiedEventArgs<ILabel>): void {
  log(sender, 'Object duplicated')
}

/**
 * Invoked when the currentItem property has changed its value
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnCurrentItemChanged(sender: object, args: PropertyChangedEventArgs): void {
  log(sender, 'GraphComponent CurrentItemChanged')
}

/**
 * Invoked when the graph property has been changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnGraphChanged(sender: object, args: ItemEventArgs<IGraph>): void {
  log(sender, 'GraphComponent GraphChanged')
}

/**
 * Invoked when the inputMode property has been changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnInputModeChanged(sender: object, args: EventArgs): void {
  log(sender, 'GraphComponent InputModeChanged')
}

/**
 * Invoked when keys are being pressed, i.e. keydown.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnKeyDown(sender: object, args: KeyEventArgs): void {
  logWithType(sender, `GraphComponent KeyDown: ${args.key}`, 'GraphComponentKeyDown')
}

/**
 * Invoked when keys are being released, i.e. keyup.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnKeyUp(sender: object, args: KeyEventArgs): void {
  logWithType(sender, `GraphComponent KeyUp: ${args.key}`, 'GraphComponentKeyUp')
}

/**
 * Invoked when keys are being typed, i.e. keypress.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnKeyPressed(sender: object, args: KeyEventArgs): void {
  logWithType(sender, `GraphComponent KeyPress: ${args.key}`, 'GraphComponentKeyPress')
}

/**
 * Invoked when the user clicked the mouse.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseClick(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseClick')
}

/**
 * Invoked when the mouse is being moved while at least one of the mouse buttons is pressed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseDrag(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseDrag')
}

/**
 * Invoked when the mouse has entered the canvas.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseEnter(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseEnter')
}

/**
 * Invoked when the mouse has exited the canvas.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseLeave(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseLeave')
}

/**
 * Invoked when the mouse capture has been lost.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseLostCapture(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseLostCapture')
}

/**
 * Invoked when the mouse has been moved in world coordinates.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseMove(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseMove')
}

/**
 * Invoked when a mouse button has been pressed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseDown(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseDown')
}

/**
 * Invoked when the mouse button has been released.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseUp(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseUp')
}

/**
 * Invoked when the mouse wheel has turned.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnMouseWheelTurned(sender: object, args: MouseEventArgs): void {
  log(sender, 'GraphComponent MouseWheelTurned')
}

/**
 * Invoked when a finger has been put on the touch screen.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnTouchDown(sender: object, args: TouchEventArgs): void {
  log(sender, 'GraphComponent TouchDown')
}

/**
 * Invoked when a finger on the touch screen has entered the canvas.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnTouchEnter(sender: object, args: TouchEventArgs): void {
  log(sender, 'GraphComponent TouchEnter')
}

/**
 * Invoked when a finger on the touch screen has exited the canvas.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnTouchLeave(sender: object, args: TouchEventArgs): void {
  log(sender, 'GraphComponent TouchLeave')
}

/**
 * Invoked when the user performed a long press gesture with a finger on the touch screen.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnTouchLongPressed(sender: object, args: TouchEventArgs): void {
  log(sender, 'GraphComponent TouchLongPressed')
}

/**
 * Invoked when the touch capture has been lost
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnTouchLostCapture(sender: object, args: TouchEventArgs): void {
  log(sender, 'GraphComponent TouchLostCapture')
}

/**
 * Invoked when a finger has been moved on the touch screen.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnTouchMove(sender: object, args: TouchEventArgs): void {
  log(sender, 'GraphComponent TouchMove')
}

/**
 * Invoked when the user performed a tap gesture with a finger on the touch screen.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnTouchClick(sender: object, args: TouchEventArgs): void {
  log(sender, 'GraphComponent TouchClick')
}

/**
 * Invoked when a finger has been removed from the touch screen.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnTouchUp(sender: object, args: TouchEventArgs): void {
  log(sender, 'GraphComponent TouchUp')
}

/**
 * Invoked before the visual tree is painted.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnPrepareRenderContext(sender: object, args: PrepareRenderContextEventArgs): void {
  log(sender, 'GraphComponent PrepareRenderContext')
}

/**
 * Invoked after the visual tree has been updated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnUpdatedVisual(sender: object, args: EventArgs): void {
  log(sender, 'GraphComponent UpdatedVisual')
}

/**
 * Invoked before the visual tree is updated.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnUpdatingVisual(sender: object, args: EventArgs): void {
  log(sender, 'GraphComponent UpdatingVisual')
}

/**
 * Invoked when the viewport property has been changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnViewportChanged(sender: object, args: PropertyChangedEventArgs): void {
  log(sender, 'GraphComponent ViewportChanged')
}

/**
 * Invoked when the value of the zoom property has been changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function controlOnZoomChanged(sender: object, args: EventArgs): void {
  log(sender, 'GraphComponent ZoomChanged')
}

/**
 * Invoked when the empty canvas area has been clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnCanvasClicked(sender: object, args: ClickEventArgs): void {
  log(sender, 'GraphEditorInputMode CanvasClicked')
}

/**
 * Invoked when an item has been deleted interactively by this mode.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnDeletedItem(sender: object, args: ItemEventArgs<IModelItem>): void {
  log(sender, 'GraphEditorInputMode DeletedItem')
}

/**
 * Invoked just before the deleteSelection method has deleted the selection after all selected items have been
 * removed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnDeletedSelection(sender: object, args: SelectionEventArgs<IModelItem>): void {
  log(sender, 'GraphEditorInputMode DeletedSelection')
}

/**
 * Invoked just before the deleteSelection method starts its work and will be followed by any number of DeletedItem
 * events and finalized by a DeletedSelection event.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnDeletingSelection(sender: object, args: SelectionEventArgs<IModelItem>): void {
  log(sender, 'GraphEditorInputMode DeletingSelection')
}

/**
 * Invoked when an item has been clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnItemClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, `GraphEditorInputMode ItemClicked ${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when an item has been double clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnItemDoubleClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, `GraphEditorInputMode ItemDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when an item has been left-clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnItemLeftClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, `GraphEditorInputMode ItemLeftClicked${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when an item has been left double-clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnItemLeftDoubleClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(
    sender,
    `GraphEditorInputMode ItemLeftDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`
  )
}

/**
 * Invoked when an item has been right clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnItemRightClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, `GraphEditorInputMode ItemRightClicked${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when an item has been right double-clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnItemRightDoubleClicked(
  sender: object,
  args: ItemClickedEventArgs<IModelItem>
): void {
  log(
    sender,
    `GraphEditorInputMode ItemRightDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`
  )
}

/**
 * Invoked when a label has been added.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnLabelAdded(sender: object, args: ItemEventArgs<ILabel>): void {
  log(sender, 'GraphEditorInputMode LabelAdded')
}

/**
 * Invoked when the label text has been changed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnLabelTextChanged(sender: object, args: ItemEventArgs<ILabel>): void {
  log(sender, 'GraphEditorInputMode LabelTextChanged')
}

/**
 * Invoked when the actual label editing process is about to start.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnLabelTextEditingStarted(sender: object, args: LabelEventArgs): void {
  log(sender, 'GraphEditorInputMode LabelTextEditingStarted')
}

/**
 * Invoked when the actual label editing process is canceled
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnLabelTextEditingCanceled(sender: object, args: LabelEventArgs): void {
  log(sender, 'GraphEditorInputMode LabelTextEditingCanceled')
}

/**
 * Invoked when a single or multi select operation has been finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnMultiSelectionFinished(sender: object, args: SelectionEventArgs<IModelItem>): void {
  log(sender, 'GraphEditorInputMode MultiSelectionFinished')
}

/**
 * Invoked when a single or multi select operation has been started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnMultiSelectionStarted(sender: object, args: SelectionEventArgs<IModelItem>): void {
  log(sender, 'GraphEditorInputMode MultiSelectionStarted')
}

/**
 * Invoked when this mode has created a node in response to user interaction.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnNodeCreated(sender: object, args: ItemEventArgs<INode>): void {
  log(sender, 'GraphEditorInputMode NodeCreated')
}

/**
 * Invoked when a node has been reparented interactively.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnNodeReparented(sender: object, args: NodeEventArgs): void {
  log(sender, 'GraphEditorInputMode NodeReparented')
}

/**
 * Invoked after an edge's source and/or target ports have been changed as the result of an input gesture.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnEdgePortsChanged(sender: object, args: EdgeEventArgs): void {
  log(
    sender,
    `GraphEditorInputMode Edge ${args.item} Ports Changed from ${args.sourcePort}->${args.targetPort}` +
      ` to ${args.item.sourcePort}->${args.item.targetPort}`
  )
}

/**
 * Invoked when the context menu over an item is about to be opened to determine the contents of the Menu.
 * @param sender The source of the event
 * @param args An object that contains the
 *   event data
 */
function geimOnPopulateItemContextMenu(
  sender: object,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  log(
    sender,
    `GraphEditorInputMode PopulateItemContextMenu${args.handled ? '(Handled)' : '(Unhandled)'}`
  )
}

/**
 * Invoked when the mouse is hovering over an item to determine the tool tip to display.
 * @param sender The source of the event
 * @param args An object that contains the event
 *   data
 */
function geimOnQueryItemToolTip(sender: object, args: QueryItemToolTipEventArgs<IModelItem>): void {
  log(sender, `GraphEditorInputMode QueryItemToolTip${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when a label that is about to be added or edited.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function geimOnValidateLabelText(sender: object, args: LabelTextValidatingEventArgs): void {
  log(sender, 'GraphEditorInputMode ValidateLabelText')
}

/**
 * Invoked when the empty canvas area has been clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnCanvasClicked(sender: object, args: ClickEventArgs): void {
  log(sender, 'GraphViewerInputMode CanvasClicked')
}

/**
 * Invoked when an item has been clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnItemClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, 'GraphViewerInputMode ItemClicked')
}

/**
 * Invoked when an item has been double-clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnItemDoubleClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, 'GraphViewerInputMode ItemDoubleClicked')
}

/**
 * Invoked when an item has been left-clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnItemLeftClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, 'GraphViewerInputMode ItemLeftClicked')
}

/**
 * Invoked when an item has been left double-clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnItemLeftDoubleClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, 'GraphViewerInputMode ItemLeftDoubleClicked')
}

/**
 * Invoked when an item has been right-clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnItemRightClicked(sender: object, args: ItemClickedEventArgs<IModelItem>): void {
  log(sender, 'GraphViewerInputMode ItemRightClicked')
}

/**
 * Invoked when an item has been right double-clicked.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnItemRightDoubleClicked(
  sender: object,
  args: ItemClickedEventArgs<IModelItem>
): void {
  log(sender, 'GraphViewerInputMode ItemRightDoubleClicked')
}

/**
 * Invoked when a single or multi select operation has been finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnMultiSelectionFinished(sender: object, args: SelectionEventArgs<IModelItem>): void {
  log(sender, 'GraphViewerInputMode MultiSelectionFinished')
}

/**
 * Invoked when a single or multi select operation has been started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function gvimOnMultiSelectionStarted(sender: object, args: SelectionEventArgs<IModelItem>): void {
  log(sender, 'GraphViewerInputMode MultiSelectionStarted')
}

/**
 * Invoked when the context menu over an item is about to be opened to determine the contents of the Menu.
 * @param sender The source of the event
 * @param args An object that contains the
 *   event data
 */
function gvimOnPopulateItemContextMenu(
  sender: object,
  args: PopulateItemContextMenuEventArgs<IModelItem>
): void {
  log(sender, 'GraphViewerInputMode PopulateItemContextMenu')
}

/**
 * Invoked when the mouse is hovering over an item to determine the tool tip to display.
 * @param sender The source of the event
 * @param args An object that contains the event
 *   data
 */
function gvimOnQueryItemToolTip(sender: object, args: QueryItemToolTipEventArgs<IModelItem>): void {
  log(sender, 'GraphViewerInputMode QueryItemToolTip')
}

/**
 * Invoked when the drag has been canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnDragCanceled(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked before the drag will be canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnDragCanceling(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveInputMode DragCanceling', 'DragCanceling')
}

/**
 * Invoked once the drag has been finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnDragFinished(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveInputMode DragFinished', 'DragFinished')
}

/**
 * Invoked before the drag will be finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnDragFinishing(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, `MoveInputMode DragFinishing${getAffectedItems(sender)}`, 'DragFinishing')
}

/**
 * Invoked at the end of every drag.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnDragged(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnDragging(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveInputMode Dragging', 'Dragging')
}

/**
 * Invoked once the drag is initialized and has started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnDragStarted(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, `MoveInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
}

/**
 * Invoked once the drag is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnDragStarting(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveInputMode DragStarting', 'DragStarting')
}

/**
 * Invoked when a drag is recognized for MoveInputMode.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveInputModeOnQueryPositionHandler(
  sender: object,
  args: QueryPositionHandlerEventArgs
): void {
  log(sender, 'MoveInputMode QueryPositionHandler')
}

/**
 * Invoked when the drag has been canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveLabelInputModeOnDragCanceled(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveLabelInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked before the drag will be canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveLabelInputModeOnDragCanceling(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveLabelInputMode DragCanceling', 'DragCanceling')
}

/**
 * Invoked once the drag has been finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveLabelInputModeOnDragFinished(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveLabelInputMode DragFinished', 'DragFinished')
}

/**
 * Invoked before the drag will be finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveLabelInputModeOnDragFinishing(sender: object, args: InputModeEventArgs): void {
  logWithType(
    sender,
    `MoveLabelInputMode DragFinishing${getAffectedItems(sender)}`,
    'DragFinishing'
  )
}

/**
 * Invoked at the end of every drag.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveLabelInputModeOnDragged(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveLabelInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveLabelInputModeOnDragging(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveLabelInputMode Dragging', 'Dragging')
}

/**
 * Invoked once the drag is initialized and has started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveLabelInputModeOnDragStarted(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, `MoveLabelInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
}

/**
 * Invoked once the drag is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveLabelInputModeOnDragStarting(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveLabelInputMode DragStarting', 'DragStarting')
}

/**
 * Invoked when the drag operation is dropped.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function itemInputModeOnDragDropped(sender: object, args: InputModeEventArgs): void {
  let inputMode = 'NodeDropInputMode'
  if (sender instanceof LabelDropInputMode) {
    inputMode = 'LabelDropInputMode'
  } else if (sender instanceof PortDropInputMode) {
    inputMode = 'PortDropInputMode'
  }
  logWithType(sender, `${inputMode} DragDropped`, 'DragDropped')
}

/**
 * Invoked when the drag operation enters the CanvasComponent.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function itemInputModeOnDragEntered(sender: object, args: InputModeEventArgs): void {
  let inputMode = 'NodeDropInputMode'
  if (sender instanceof LabelDropInputMode) {
    inputMode = 'LabelDropInputMode'
  } else if (sender instanceof PortDropInputMode) {
    inputMode = 'PortDropInputMode'
  }
  logWithType(sender, `${inputMode} DragEntered`, 'DragEntered')
}

/**
 * Invoked when the drag operation leaves the CanvasComponent.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function itemInputModeOnDragLeft(sender: object, args: InputModeEventArgs): void {
  let inputMode = 'NodeDropInputMode'
  if (sender instanceof LabelDropInputMode) {
    inputMode = 'LabelDropInputMode'
  } else if (sender instanceof PortDropInputMode) {
    inputMode = 'PortDropInputMode'
  }
  logWithType(sender, `${inputMode} DragLeft`, 'DragLeft')
}

/**
 * Invoked when the drag operation drags over the CanvasComponent.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function itemInputModeOnDragOver(sender: object, args: InputModeEventArgs): void {
  let inputMode = 'NodeDropInputMode'
  if (sender instanceof LabelDropInputMode) {
    inputMode = 'LabelDropInputMode'
  } else if (sender instanceof PortDropInputMode) {
    inputMode = 'PortDropInputMode'
  }
  logWithType(sender, `${inputMode} DragOver`, 'DragOver')
}

/**
 * Invoked when a new item gets created by the drag operation.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function itemInputModeOnItemCreated(sender: object, args: ItemEventArgs<any>): void {
  let inputMode = 'NodeDropInputMode'
  if (sender instanceof LabelDropInputMode) {
    inputMode = 'LabelDropInputMode'
  } else if (sender instanceof PortDropInputMode) {
    inputMode = 'PortDropInputMode'
  }
  logWithType(sender, `${inputMode} ItemCreated`, 'ItemCreated')
}

/**
 * Invoked when the item that is being hovered over with the mouse changes.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function itemHoverInputModeOnHoveredItemChanged(
  sender: object,
  args: HoveredItemChangedEventArgs
): void {
  logWithType(
    sender,
    `HoverInputMode Item changed from ${args.oldItem} to ${
      args.item !== null ? args.item.toString() : 'null'
    }`,
    'HoveredItemChanged'
  )
}

/**
 * Invoked once a bend creation gesture has been recognized.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createBendInputModeOnBendCreated(sender: object, args: BendEventArgs): void {
  log(sender, 'CreateBendInputMode Bend Created')
}

/**
 * Invoked when the drag on a bend has been canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createBendInputModeOnDragCanceled(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'CreateBendInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked at the end of every drag on a bend.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createBendInputModeOnDragged(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'CreateBendInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag on a bend is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createBendInputModeOnDragging(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'CreateBendInputMode Dragging', 'Dragging')
}

/**
 * Invoked when the context menu is about to be shown.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function contextMenuInputModeOnPopulateMenu(sender: object, args: PopulateMenuEventArgs): void {
  // as we just "simulated" a context menu by calling contextMenuInputMode.shouldOpenMenu
  // we should either fill and show a menu or - as in this case - set showMenu to 'false'
  args.showMenu = false
  log(sender, 'ContextMenuInputMode Populate Context Menu')
}

/**
 * Invoked once a double-tap has been detected.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function tapInputModeOnDoubleTapped(sender: object, args: TapEventArgs): void {
  log(sender, 'TapInputMode Double Tapped')
}

/**
 * Invoked once a tap has been detected.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function tapInputModeOnTapped(sender: object, args: TapEventArgs): void {
  log(sender, 'TapInputMode Tapped')
}

/**
 * Invoked if the editing has not been finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function textEditorInputModeOnEditingCanceled(sender: object, args: TextEventArgs): void {
  log(sender, 'TextEditorInputMode Editing Canceled')
}

/**
 * Invoked if the editing when text editing is started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function textEditorInputModeOnEditingStarted(sender: object, args: TextEventArgs): void {
  log(sender, 'TextEditorInputMode Editing Started')
}

/**
 * Invoked once the text has been edited.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function textEditorInputModeOnTextEdited(sender: object, args: TextEventArgs): void {
  log(sender, 'TextEditorInputMode Text Edited')
}

/**
 * Invoked when this mode queries the tool tip for a certain query location.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function mouseHoverInputModeOnQueryToolTip(sender: object, args: ToolTipQueryEventArgs): void {
  log(sender, 'MouseHoverInputMode QueryToolTip')
}

/**
 * Invoked once a click has been detected.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clickInputModeOnClicked(sender: object, args: ClickEventArgs): void {
  log(sender, 'ClickInputMode Clicked')
}

/**
 * Invoked once a double-click has been detected.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clickInputModeOnDoubleClicked(sender: object, args: ClickEventArgs): void {
  log(sender, 'ClickInputMode Double Clicked')
}

/**
 * Invoked once a left-click has been detected.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clickInputModeOnLeftClicked(sender: object, args: ClickEventArgs): void {
  log(sender, 'ClickInputMode Left Clicked')
}

/**
 * Invoked once a left double-click has been detected.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clickInputModeOnLeftDoubleClicked(sender: object, args: ClickEventArgs): void {
  log(sender, 'ClickInputMode Left Double Clicked')
}

/**
 * Invoked once a right-click has been detected.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clickInputModeOnRightClicked(sender: object, args: ClickEventArgs): void {
  log(sender, 'ClickInputMode Right Clicked')
}

/**
 * Invoked once a right double-click has been detected.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function clickInputModeOnRightDoubleClicked(sender: object, args: ClickEventArgs): void {
  log(sender, 'ClickInputMode Right Double Clicked')
}

/**
 * Invoked when the drag has been canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function handleInputModeOnDragCanceled(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'HandleInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked before the drag will be canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function handleInputModeOnDragCanceling(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'HandleInputMode DragCanceling', 'DragCanceling')
}

/**
 * Invoked once the drag has been finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function handleInputModeOnDragFinished(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'HandleInputMode DragFinished', 'DragFinished')
}

/**
 * Invoked before the drag will be finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function handleInputModeOnDragFinishing(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, `HandleInputMode DragFinishing${getAffectedItems(sender)}`, 'DragFinishing')
}

/**
 * Invoked at the end of every drag.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function handleInputModeOnDragged(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'HandleInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function handleInputModeOnDragging(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'HandleInputMode Dragging', 'Dragging')
}

/**
 * Invoked once the drag is initialized and has started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function handleInputModeOnDragStarted(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, `HandleInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
}

/**
 * Invoked once the drag is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function handleInputModeOnDragStarting(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'HandleInputMode DragStarting', 'DragStarting')
}

/**
 * Invoked when the drag has been canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveViewportInputModeOnDragCanceled(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveViewportInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked before the drag will be canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveViewportInputModeOnDragCanceling(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveViewportInputMode DragCanceling', 'DragCanceling')
}

/**
 * Invoked once the drag has been finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveViewportInputModeOnDragFinished(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveViewportInputMode DragFinished', 'DragFinished')
}

/**
 * Invoked before the drag will be finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveViewportInputModeOnDragFinishing(sender: object, args: InputModeEventArgs): void {
  logWithType(
    sender,
    `MoveViewportInputMode DragFinishing${getAffectedItems(sender)}`,
    'DragFinishing'
  )
}

/**
 * Invoked at the end of every drag.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveViewportInputModeOnDragged(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveViewportInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveViewportInputModeOnDragging(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveViewportInputMode Dragging', 'Dragging')
}

/**
 * Invoked once the drag is initialized and has started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveViewportInputModeOnDragStarted(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, `MoveViewportInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
}

/**
 * Invoked once the drag is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function moveViewportInputModeOnDragStarting(sender: object, args: InputModeEventArgs): void {
  logWithType(sender, 'MoveViewportInputMode DragStarting', 'DragStarting')
}

/**
 * Invoked whenever a group has been collapsed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function navigationInputModeOnGroupCollapsed(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `NavigationInputMode Group Collapsed: ${args.item}`, 'GroupCollapsed')
}

/**
 * Invoked before a group will be collapsed.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function navigationInputModeOnGroupCollapsing(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `NavigationInputMode Group Collapsing: ${args.item}`, 'Group Collapsing')
}

/**
 * Invoked whenever a group has been entered.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function navigationInputModeOnGroupEntered(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `NavigationInputMode Group Entered: ${args.item}`, 'Group Entered')
}

/**
 * Invoked before a group will be entered.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function navigationInputModeOnGroupEntering(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `NavigationInputMode Group Entering: ${args.item}`, 'Group Entering')
}

/**
 * Invoked whenever a group has been exited.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function navigationInputModeOnGroupExited(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `NavigationInputMode Group Exited: ${args.item}`, 'Group Exited')
}

/**
 * Invoked before a group will be exited.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function navigationInputModeOnGroupExiting(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `NavigationInputMode Group Exiting: ${args.item}`, 'Group Exiting')
}

/**
 * Invoked when a group has been expanded.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function navigationInputModeOnGroupExpanded(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `NavigationInputMode Group Expanded: ${args.item}`, 'Group Expanded')
}

/**
 * Invoked before a group has been expanded.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function navigationInputModeOnGroupExpanding(sender: object, args: ItemEventArgs<INode>): void {
  logWithType(sender, `NavigationInputMode Group Expanding: ${args.item}`, 'Group Expanding')
}

/**
 * Invoked after an edge has been created by this mode.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnEdgeCreated(sender: object, args: EdgeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Edge Created')
}

/**
 * Invoked when the edge creation has started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnEdgeCreationStarted(sender: object, args: EdgeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Edge Creation Started')
}

/**
 * Invoked when the edge creation gesture has been canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnGestureCanceled(sender: object, args: InputModeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Gesture Canceled')
}

/**
 * Invoked before the gesture will be canceled.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnGestureCanceling(sender: object, args: InputModeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Gesture Canceling')
}

/**
 * Invoked once the gesture has been finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnGestureFinished(sender: object, args: InputModeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Gesture Finished')
}

/**
 * Invoked before the gesture will be finished.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnGestureFinishing(sender: object, args: InputModeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Gesture Finishing')
}

/**
 * Invoked once the gesture is initialized and has started.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnGestureStarted(sender: object, args: InputModeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Gesture Started')
}

/**
 * Invoked once the gesture is starting.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnGestureStarting(sender: object, args: InputModeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Gesture Starting')
}

/**
 * Invoked at the end of every drag or move.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnMoved(sender: object, args: InputModeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Moved')
}

/**
 * Invoked at the start of every drag or move.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnMoving(sender: object, args: InputModeEventArgs): void {
  log(sender, 'CreateEdgeInputMode Moving')
}

/**
 * Invoked when this instance adds a port to the source or target node during completion of the edge creation gesture.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function createEdgeInputModeOnPortAdded(sender: object, args: ItemEventArgs<IPort>): void {
  log(sender, 'CreateEdgeInputMode Port Added')
}

/**
 * Invoked when an item changed its selection state from selected to unselected or vice versa.
 * @param sender The source of the event
 * @param args An object that contains the event data
 */
function onItemSelectionChanged(sender: object, args: ItemSelectionChangedEventArgs<any>): void {
  log(sender, 'GraphComponent Item Selection Changed')
}

function clearButtonClick(): any {
  eventView.clear()
}

/**
 * Creates the log message without type.
 * @param sender The source of the event
 * @param message The given message
 */
function log(sender: object, message: any): void {
  logWithType(sender, message, null)
}

/**
 * Creates the log message with the given type.
 * @param sender The source of the event
 * @param message The given message
 * @param type The type of the event
 */
function logWithType(sender: object, message: string, type: string | null): void {
  if (!type) {
    type = message
  }

  let category = 'Unknown'
  if (sender instanceof IInputMode) {
    category = 'InputMode'
  } else if (sender instanceof CanvasComponent) {
    category = 'GraphComponent'
  } else if (
    sender instanceof IModelItem ||
    sender instanceof IGraph ||
    sender instanceof IFoldingView
  ) {
    category = 'Graph'
  }

  eventView.addMessage(message, type, category)
}

function initializeGraphComponent(): void {
  graphComponent = new GraphComponent('graphComponent')
}

function initializeInputModes(): void {
  const orthogonalEdgeEditingContext = new OrthogonalEdgeEditingContext({
    movePorts: true,
    enabled: false
  })
  editorMode = new GraphEditorInputMode({
    orthogonalEdgeEditingContext,
    allowGroupingOperations: true
  })
  editorMode.itemHoverInputMode.hoverItems = GraphItemTypes.ALL
  editorMode.nodeDropInputMode.enabled = true
  editorMode.labelDropInputMode.enabled = true
  editorMode.portDropInputMode.enabled = true

  viewerMode = new GraphViewerInputMode()
  viewerMode.itemHoverInputMode.hoverItems = GraphItemTypes.ALL

  // "Simulate" a context menu, so the various context menu events are fired.
  graphComponent.div.addEventListener('contextmenu', onContextMenu, true)

  graphComponent.inputMode = editorMode
}

function initializeGraph(): void {
  const graph = graphComponent.graph
  initDemoStyles(graph)
  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: 'white',
    insets: [3, 5, 3, 5]
  })
}

function initializeDragAndDropPanel(): void {
  const panel = document.getElementById('drag-and-drop-panel')!
  panel.appendChild(createDraggableNode())
  panel.appendChild(createDraggableLabel())
  panel.appendChild(createDraggablePort())
}

function createDraggableNode(): HTMLElement {
  // create the node visual
  const exportComponent = new GraphComponent()
  exportComponent.graph.createNode(new Rect(0, 0, 30, 30), graphComponent.graph.nodeDefaults.style)
  exportComponent.updateContentRect()
  const svgExport = new SvgExport(exportComponent.contentRect)
  const dataUrl = SvgExport.encodeSvgDataUrl(
    SvgExport.exportSvgString(svgExport.exportSvg(exportComponent))
  )
  const div = document.createElement('div')
  div.setAttribute('style', 'width: 30px; height: 30px; margin: 0 10px;')
  div.setAttribute('title', 'Draggable Node')
  const img = document.createElement('img')
  img.setAttribute('style', 'width: auto; height: auto;')
  img.setAttribute('src', dataUrl)
  div.appendChild(img)

  // register the startDrag listener
  const startDrag = (): void => {
    const simpleNode = new SimpleNode()
    simpleNode.layout = new Rect(0, 0, 30, 30)
    simpleNode.style = graphComponent.graph.nodeDefaults.style.clone()
    const dragPreview = document.createElement('div')
    dragPreview.appendChild(img.cloneNode(true))
    const dragSource = NodeDropInputMode.startDrag(
      div,
      simpleNode,
      DragDropEffects.ALL,
      true,
      pointerEventsSupported ? dragPreview : null
    )
    dragSource.addQueryContinueDragListener((src, args) => {
      if (args.dropTarget === null) {
        removeClass(dragPreview, 'hidden')
      } else {
        addClass(dragPreview, 'hidden')
      }
    })
  }

  img.addEventListener(
    'mousedown',
    event => {
      startDrag()
      event.preventDefault()
    },
    false
  )

  img.addEventListener(
    'touchstart',
    event => {
      startDrag()
      event.preventDefault()
    },
    passiveSupported ? { passive: false } : false
  )

  return div
}

function createDraggableLabel(): HTMLDivElement {
  // create the label visual
  const defaultLabelParameter = graphComponent.graph.nodeDefaults.labels.layoutParameter
  const defaultLabelStyle = graphComponent.graph.nodeDefaults.labels.style
  const exportComponent = new GraphComponent()
  const dummyNode = exportComponent.graph.createNode(new Rect(0, 0, 30, 30), VoidNodeStyle.INSTANCE)
  exportComponent.graph.addLabel(dummyNode, 'Label', defaultLabelParameter, defaultLabelStyle)
  exportComponent.contentRect = new Rect(0, 0, 30, 30)
  const svgExport = new SvgExport(exportComponent.contentRect)
  const dataUrl = SvgExport.encodeSvgDataUrl(
    SvgExport.exportSvgString(svgExport.exportSvg(exportComponent))
  )
  const div = document.createElement('div')
  div.setAttribute('style', 'width: 30px; height: 30px; margin: 0 10px;')
  div.setAttribute('title', 'Draggable Label')
  const img = document.createElement('img')
  img.setAttribute('style', 'width: auto; height: auto;')
  img.setAttribute('src', dataUrl)
  div.appendChild(img)

  // register the startDrag listener
  const startDrag = (): void => {
    const simpleNode = new SimpleNode()
    simpleNode.layout = new Rect(0, 0, 40, 40)
    const simpleLabel = new SimpleLabel(simpleNode, 'Label', defaultLabelParameter)
    simpleLabel.preferredSize = defaultLabelStyle.renderer.getPreferredSize(
      simpleLabel,
      defaultLabelStyle
    )
    simpleLabel.style = defaultLabelStyle
    const dragPreview = document.createElement('div')
    dragPreview.appendChild(img.cloneNode(true))
    const dragSource = LabelDropInputMode.startDrag(
      div,
      simpleLabel,
      DragDropEffects.ALL,
      true,
      pointerEventsSupported ? dragPreview : null
    )
    dragSource.addQueryContinueDragListener((src, args) => {
      if (args.dropTarget === null) {
        removeClass(dragPreview, 'hidden')
      } else {
        addClass(dragPreview, 'hidden')
      }
    })
  }

  img.addEventListener(
    'mousedown',
    event => {
      startDrag()
      event.preventDefault()
    },
    false
  )

  img.addEventListener(
    'touchstart',
    event => {
      startDrag()
      event.preventDefault()
    },
    passiveSupported ? { passive: false } : false
  )

  return div
}

function createDraggablePort(): HTMLDivElement {
  // create the port visual
  const locationParameter = FreeNodePortLocationModel.NODE_CENTER_ANCHORED
  const portStyle = new NodeStylePortStyleAdapter({
    nodeStyle: new ShapeNodeStyle({
      fill: 'rgb(51, 102, 153)',
      stroke: null,
      shape: 'ellipse'
    })
  })
  const exportComponent = new GraphComponent()
  const dummyNode = exportComponent.graph.createNode(new Rect(0, 0, 30, 30), VoidNodeStyle.INSTANCE)
  exportComponent.graph.addPort(dummyNode, locationParameter, portStyle)
  exportComponent.contentRect = new Rect(0, 0, 30, 30)
  const svgExport = new SvgExport(exportComponent.contentRect)
  const dataUrl = SvgExport.encodeSvgDataUrl(
    SvgExport.exportSvgString(svgExport.exportSvg(exportComponent))
  )
  const div = document.createElement('div')
  div.setAttribute('style', 'width: 30px; height: 30px; margin: 0 10px;')
  div.setAttribute('title', 'Draggable Port')
  const img = document.createElement('img')
  img.setAttribute('style', 'width: auto; height: auto;')
  img.setAttribute('src', dataUrl)
  div.appendChild(img)

  // register the startDrag listener
  const startDrag = (): void => {
    const simpleNode = new SimpleNode()
    simpleNode.layout = new Rect(0, 0, 30, 30)
    const simplePort = new SimplePort(simpleNode, locationParameter)
    simplePort.style = portStyle
    const dragPreview = document.createElement('div')
    dragPreview.appendChild(img.cloneNode(true))
    const dragSource = PortDropInputMode.startDrag(
      div,
      simplePort,
      DragDropEffects.ALL,
      true,
      pointerEventsSupported ? dragPreview : null
    )
    dragSource.addQueryContinueDragListener((src, args) => {
      if (args.dropTarget === null) {
        removeClass(dragPreview, 'hidden')
      } else {
        addClass(dragPreview, 'hidden')
      }
    })
  }

  img.addEventListener(
    'mousedown',
    event => {
      startDrag()
      event.preventDefault()
    },
    false
  )

  img.addEventListener(
    'touchstart',
    event => {
      startDrag()
      event.preventDefault()
    },
    passiveSupported ? { passive: false } : false
  )

  return div
}

function setupToolTips(): void {
  editorMode.toolTipItems = GraphItemTypes.NODE
  editorMode.addQueryItemToolTipListener((sender, args) => {
    args.toolTip = `ToolTip for ${args.item}`
    args.handled = true
  })

  viewerMode.toolTipItems = GraphItemTypes.NODE
  viewerMode.addQueryItemToolTipListener((sender, args) => {
    args.toolTip = `ToolTip for ${args.item}`
    args.handled = true
  })
}

function setupContextMenu(): void {
  editorMode.contextMenuItems = GraphItemTypes.NODE
  editorMode.addPopulateItemContextMenuListener((sender, args) => {
    args.showMenu = false
    args.handled = true
  })

  viewerMode.contextMenuItems = GraphItemTypes.NODE
  viewerMode.addPopulateItemContextMenuListener((sender, args) => {
    args.showMenu = false
    args.handled = true
  })
}

function enableFolding(): void {
  const graph = graphComponent.graph

  // enabled changing ports
  const decorator = graph.decorator.edgeDecorator.edgeReconnectionPortCandidateProviderDecorator
  decorator.setImplementation(IEdgeReconnectionPortCandidateProvider.ALL_NODE_AND_EDGE_CANDIDATES)

  manager = new FoldingManager(graph)
  foldingView = manager.createFoldingView()
  graphComponent.graph = foldingView.graph
}

function enableUndo(): void {
  const defaultGraph = manager.masterGraph
  if (defaultGraph !== null) {
    defaultGraph.undoEngineEnabled = true
  }
}

function createSampleGraph(): void {
  const graph = graphComponent.graph

  const root = graph.createNodeAt(new Point(0, 0))
  graph.addLabel(root, 'N1')
  const n11 = graph.createNodeAt(new Point(0, 100))
  graph.addLabel(n11, 'N2')
  const n12 = graph.createNodeAt(new Point(100, 100))
  graph.addLabel(n12, 'N3')
  const n21 = graph.createNodeAt(new Point(100, 175))
  graph.addLabel(n21, 'N4')
  const n31 = graph.createNodeAt(new Point(0, 250))
  graph.addLabel(n31, 'N5')

  const eRootN11 = graph.createEdge(root, n11)
  graph.addLabel(eRootN11, 'E1')
  const eRootN12 = graph.createEdge(root, n12)
  graph.addLabel(eRootN12, 'E2')
  const eN11N31 = graph.createEdge(n11, n31)
  graph.addLabel(eN11N31, 'E3')
  const eN12N21 = graph.createEdge(n12, n21)
  graph.addLabel(eN12N21, 'E4')
  const eN21N31 = graph.createEdge(n21, n31)
  graph.addLabel(eN21N31, 'E5')

  graph.addBend(eRootN12, new Point(100, 0), 0)
  graph.addBend(eN21N31, new Point(100, 250), 100)

  const groupNode = graph.createGroupNode()
  graph.addLabel(groupNode, 'GN1')
  graph.setParent(n12, groupNode)
  graph.setParent(n21, groupNode)
  graph.adjustGroupNodeLayout(groupNode)
}

function registerCommands(): void {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent, null)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent, null)

  bindAction("input[data-command='ToggleEditing']", () => {
    if (graphComponent.inputMode === editorMode) {
      graphComponent.inputMode = viewerMode
    } else {
      graphComponent.inputMode = editorMode
    }
  })

  bindAction('#demo-orthogonal-editing-button', () => {
    const orthogonalEditingButton = document.querySelector(
      '#demo-orthogonal-editing-button'
    ) as HTMLInputElement
    editorMode.orthogonalEdgeEditingContext!.enabled = orthogonalEditingButton.checked
  })

  bindAction("button[data-command='ClearLog']", () => clearButtonClick())

  bindActions("input[data-command='ToggleEvents']", event => {
    const element = event.target as HTMLInputElement
    const eventKind = element.getAttribute('data-event-kind')
    if (eventKind) {
      const enable = element.checked
      const fn = enable
        ? (eventRegistration as any)[`register${eventKind}Events`]
        : (eventRegistration as any)[`deregister${eventKind}Events`]
      if (typeof fn === 'function') {
        fn()
      } else if (typeof window.console !== 'undefined') {
        console.log(`NOT FOUND: ${eventKind}`)
      }
    }
  })

  bindAction("input[data-command='ToggleLogGrouping']", () => {
    eventView.groupEvents = (
      document.getElementById('toggle-log-grouping') as HTMLInputElement
    ).checked
  })
}

/**
 * The GraphComponent
 */
let graphComponent: GraphComponent

/**
 * Returns the number of affected items as string.
 * @param sender The source of the event
 */
function getAffectedItems(sender: object): string {
  let items: IEnumerable<IModelItem> | null = null

  const mim = sender instanceof MoveInputMode ? sender : null
  if (mim) {
    items = mim.affectedItems
  }

  const him = sender instanceof HandleInputMode ? sender : null
  if (him) {
    items = him.affectedItems
  }

  if (items) {
    const nodeCount = items.ofType(INode.$class).size
    const edgeCount = items.ofType(IEdge.$class).size
    const bendCount = items.ofType(IBend.$class).size
    const labelCount = items.ofType(ILabel.$class).size
    const portCount = items.ofType(IPort.$class).size
    return (
      `(${items.size} items: ${nodeCount} nodes, ${bendCount} bends, ${edgeCount} edges,` +
      ` ${labelCount} labels, ${portCount} ports)`
    )
  }
  return ''
}

/**
 * Initialize expand-collapse behavior for option headings.
 */
function initOptionHeadings(): void {
  const optionsHeadings = document.getElementsByClassName('event-options-heading')
  for (let i = 0; i < optionsHeadings.length; i++) {
    const heading = optionsHeadings[i]
    optionsHeadings[i].addEventListener('click', e => {
      e.preventDefault()
      const parentNode = heading.parentNode as Element
      const optionsElements = parentNode.getElementsByClassName(
        'event-options-content'
      ) as HTMLCollectionOf<HTMLDivElement>
      if (optionsElements.length > 0) {
        const style = optionsElements[0].style
        if (style.display !== 'none') {
          style.display = 'none'
          heading.className = heading.className.replace('expanded', 'collapsed')
        } else {
          style.display = 'block'
          heading.className = heading.className.replace('collapsed', 'expanded')
        }
      }
      return false
    })
  }

  const headings = document.getElementsByClassName('event-options-heading')
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    heading.addEventListener('click', evt => {
      if (evt.target instanceof HTMLDivElement) {
        evt.target.scrollIntoView()
      }
    })
  }
}

// Start the demo
loadJson().then(checkLicense).then(run)
