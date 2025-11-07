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
  CanvasComponent,
  DragDropEffects,
  FoldingManager,
  GraphBuilder,
  GraphClipboard,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutEdgeDescriptor,
  IBend,
  IEdge,
  IEdgeReconnectionPortCandidateProvider,
  IFoldingView,
  IGraph,
  IInputMode,
  ILabel,
  IModelItem,
  INode,
  INodeStyle,
  IPort,
  LabelDropInputMode,
  LabelStyle,
  LayoutExecutor,
  License,
  NodeDropInputMode,
  PointerButtons,
  Rect,
  SimpleLabel,
  SimpleNode,
  Size,
  SvgExport,
  UndoEngine
} from '@yfiles/yfiles'

import { initDemoStyles } from '@yfiles/demo-app/demo-styles'
import { EventView } from './EventView'
import licenseData from '../../../lib/license.json'
import { configureTwoPointerPanning } from '@yfiles/demo-utils/configure-two-pointer-panning'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import graphData from './graph-data.json'

/**
 * This demo shows how to register to the various events provided by the {@link IGraph graph},
 * the graph component} and the input modes.
 */
async function run() {
  License.value = licenseData

  eventView = new EventView()

  // initialize the GraphComponent
  initializeGraphComponent()

  initializeUI()
  initializeInputModes()
  setupToolTips()
  setupContextMenu()

  registerInputModeEvents()
  registerNavigationInputModeEvents()

  enableFolding()

  initializeGraph()
  initializeDragAndDropPanel()

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  LayoutExecutor.ensure()
  graphComponent.graph.applyLayout(
    new HierarchicalLayout({
      defaultEdgeDescriptor: new HierarchicalLayoutEdgeDescriptor({
        minimumFirstSegmentLength: 50,
        minimumLastSegmentLength: 50
      }),
      minimumLayerDistance: 70
    })
  )
  await graphComponent.fitGraphBounds()

  enableUndo()

  // initialize collapsible headings
  initOptionHeadings()
}

let eventView

let editorMode

let viewerMode

let manager

let foldingView

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph, graphData) {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder
    .createNodesSource({
      data: graphData.nodeList.filter((item) => !item.isGroup),
      id: (item) => item.id,
      parentId: (item) => item.parentId
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder
    .createEdgesSource({
      data: graphData.edgeList,
      sourceId: (item) => item.source,
      targetId: (item) => item.target
    })
    .edgeCreator.createLabelBinding((item) => item.label)

  graphBuilder.buildGraph()
}

/**
 * Registers some keyboard events to the graphComponent.
 */
function registerGraphComponentKeyEvents() {
  graphComponent.addEventListener('key-down', componentOnKeyDown)
  graphComponent.addEventListener('key-up', componentOnKeyUp)
}

/**
 * Unregisters some keyboard events from the graphComponent.
 */
function unregisterGraphComponentKeyEvents() {
  graphComponent.removeEventListener('key-down', componentOnKeyDown)
  graphComponent.removeEventListener('key-up', componentOnKeyUp)
}

/**
 * Registers the copy clipboard events to the graphComponent.
 */
function registerClipboardCopierEvents() {
  graphComponent.clipboard.addEventListener('items-cutting', clipboardOnItemsCutting)
  graphComponent.clipboard.addEventListener('items-cut', clipboardOnItemsCut)
  graphComponent.clipboard.addEventListener('items-copying', clipboardOnItemsCopying)
  graphComponent.clipboard.addEventListener('items-copied', clipboardOnItemsCopied)
  graphComponent.clipboard.addEventListener('items-pasting', clipboardOnItemsPasting)
  graphComponent.clipboard.addEventListener('items-pasted', clipboardOnItemsPasted)
  graphComponent.clipboard.addEventListener('items-duplicating', clipboardOnItemsDuplicating)
  graphComponent.clipboard.addEventListener('items-duplicated', clipboardOnItemsDuplicated)

  graphComponent.clipboard.toClipboardCopier.addEventListener(
    'graph-copied',
    clipboardOnGraphCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.addEventListener(
    'node-copied',
    clipboardOnNodeCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.addEventListener(
    'edge-copied',
    clipboardOnEdgeCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.addEventListener(
    'port-copied',
    clipboardOnPortCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.addEventListener(
    'label-copied',
    clipboardOnLabelCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.addEventListener(
    'object-copied',
    clipboardOnObjectCopiedToClipboard
  )

  graphComponent.clipboard.fromClipboardCopier.addEventListener(
    'graph-copied',
    clipboardOnGraphCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addEventListener(
    'node-copied',
    clipboardOnNodeCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addEventListener(
    'edge-copied',
    clipboardOnEdgeCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addEventListener(
    'port-copied',
    clipboardOnPortCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addEventListener(
    'label-copied',
    clipboardOnLabelCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.addEventListener(
    'object-copied',
    clipboardOnObjectCopiedFromClipboard
  )

  graphComponent.clipboard.duplicateCopier.addEventListener(
    'graph-copied',
    clipboardOnGraphDuplicated
  )
  graphComponent.clipboard.duplicateCopier.addEventListener(
    'node-copied',
    clipboardOnNodeDuplicated
  )
  graphComponent.clipboard.duplicateCopier.addEventListener(
    'edge-copied',
    clipboardOnEdgeDuplicated
  )
  graphComponent.clipboard.duplicateCopier.addEventListener(
    'port-copied',
    clipboardOnPortDuplicated
  )
  graphComponent.clipboard.duplicateCopier.addEventListener(
    'label-copied',
    clipboardOnLabelDuplicated
  )
  graphComponent.clipboard.duplicateCopier.addEventListener(
    'object-copied',
    clipboardOnObjectDuplicated
  )
}

/**
 * Unregisters the copy clipboard events from the graphComponent.
 */
function unregisterClipboardCopierEvents() {
  graphComponent.clipboard.removeEventListener('items-cutting', clipboardOnItemsCutting)
  graphComponent.clipboard.removeEventListener('items-cut', clipboardOnItemsCut)
  graphComponent.clipboard.removeEventListener('items-copying', clipboardOnItemsCopying)
  graphComponent.clipboard.removeEventListener('items-copied', clipboardOnItemsCopied)
  graphComponent.clipboard.removeEventListener('items-pasting', clipboardOnItemsPasting)
  graphComponent.clipboard.removeEventListener('items-pasted', clipboardOnItemsPasted)
  graphComponent.clipboard.removeEventListener('items-duplicating', clipboardOnItemsDuplicating)
  graphComponent.clipboard.removeEventListener('items-duplicated', clipboardOnItemsDuplicated)

  graphComponent.clipboard.toClipboardCopier.removeEventListener(
    'graph-copied',
    clipboardOnGraphCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeEventListener(
    'node-copied',
    clipboardOnNodeCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeEventListener(
    'edge-copied',
    clipboardOnEdgeCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeEventListener(
    'port-copied',
    clipboardOnPortCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeEventListener(
    'label-copied',
    clipboardOnLabelCopiedToClipboard
  )
  graphComponent.clipboard.toClipboardCopier.removeEventListener(
    'object-copied',
    clipboardOnObjectCopiedToClipboard
  )

  graphComponent.clipboard.fromClipboardCopier.removeEventListener(
    'graph-copied',
    clipboardOnGraphCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeEventListener(
    'node-copied',
    clipboardOnNodeCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeEventListener(
    'edge-copied',
    clipboardOnEdgeCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeEventListener(
    'port-copied',
    clipboardOnPortCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeEventListener(
    'label-copied',
    clipboardOnLabelCopiedFromClipboard
  )
  graphComponent.clipboard.fromClipboardCopier.removeEventListener(
    'object-copied',
    clipboardOnObjectCopiedFromClipboard
  )

  graphComponent.clipboard.duplicateCopier.removeEventListener(
    'graph-copied',
    clipboardOnGraphDuplicated
  )
  graphComponent.clipboard.duplicateCopier.removeEventListener(
    'node-copied',
    clipboardOnNodeDuplicated
  )
  graphComponent.clipboard.duplicateCopier.removeEventListener(
    'edge-copied',
    clipboardOnEdgeDuplicated
  )
  graphComponent.clipboard.duplicateCopier.removeEventListener(
    'port-copied',
    clipboardOnPortDuplicated
  )
  graphComponent.clipboard.duplicateCopier.removeEventListener(
    'label-copied',
    clipboardOnLabelDuplicated
  )
  graphComponent.clipboard.duplicateCopier.removeEventListener(
    'object-copied',
    clipboardOnObjectDuplicated
  )
}

/**
 * Registers the pointer events to the graphComponent.
 */
function registerGraphComponentPointerEvents() {
  graphComponent.addEventListener('pointer-click', componentOnPointerClick)
  graphComponent.addEventListener('pointer-enter', componentOnPointerEnter)
  graphComponent.addEventListener('pointer-leave', componentOnPointerLeave)
  graphComponent.addEventListener('lost-pointer-capture', componentOnPointerLostCapture)
  graphComponent.addEventListener('pointer-down', componentOnPointerDown)
  graphComponent.addEventListener('pointer-up', componentOnPointerUp)
  graphComponent.addEventListener('pointer-drag', componentOnPointerDrag)
  graphComponent.addEventListener('pointer-move', componentOnPointerMove)
  graphComponent.addEventListener('pointer-cancel', componentOnPointerCancel)
  graphComponent.addEventListener('pointer-long-rest', componentOnPointerLongRest)
  graphComponent.addEventListener('wheel', componentOnMouseWheelTurned)
  graphComponent.addEventListener('pointer-long-press', componentOnPointerLongPress)
  graphComponent.addEventListener('pointer-long-rest', componentOnPointerLongRest)
}

/**
 * Unregisters the pointer events from the graphComponent.
 */
function unregisterGraphComponentPointerEvents() {
  graphComponent.removeEventListener('pointer-click', componentOnPointerClick)
  graphComponent.removeEventListener('pointer-enter', componentOnPointerEnter)
  graphComponent.removeEventListener('pointer-leave', componentOnPointerLeave)
  graphComponent.removeEventListener('lost-pointer-capture', componentOnPointerLostCapture)
  graphComponent.removeEventListener('pointer-down', componentOnPointerDown)
  graphComponent.removeEventListener('pointer-up', componentOnPointerUp)
  graphComponent.removeEventListener('pointer-drag', componentOnPointerDrag)
  graphComponent.removeEventListener('pointer-move', componentOnPointerMove)
  graphComponent.removeEventListener('pointer-cancel', componentOnPointerCancel)
  graphComponent.removeEventListener('pointer-long-rest', componentOnPointerLongRest)
  graphComponent.removeEventListener('wheel', componentOnMouseWheelTurned)
  graphComponent.removeEventListener('pointer-long-press', componentOnPointerLongPress)
  graphComponent.removeEventListener('pointer-long-rest', componentOnPointerLongRest)
}

/**
 * Registers the rendering events to the graphComponent.
 */
function registerGraphComponentRenderEvents() {
  graphComponent.addEventListener('prepare-render-context', componentOnPrepareRenderContext)
  graphComponent.addEventListener('updated-visual', componentOnUpdatedVisual)
  graphComponent.addEventListener('updating-visual', componentOnUpdatingVisual)
}

/**
 * Unregisters the rendering events from the graphComponent.
 */
function unregisterGraphComponentRenderEvents() {
  graphComponent.removeEventListener('prepare-render-context', componentOnPrepareRenderContext)
  graphComponent.removeEventListener('updated-visual', componentOnUpdatedVisual)
  graphComponent.removeEventListener('updating-visual', componentOnUpdatingVisual)
}

/**
 * Registers the viewport events to the graphComponent.
 */
function registerGraphComponentViewportEvents() {
  graphComponent.addEventListener('viewport-changed', componentOnViewportChanged)
  graphComponent.addEventListener('zoom-changed', componentOnZoomChanged)
}

/**
 * Unregisters the viewport events from the graphComponent.
 */
function unregisterGraphComponentViewportEvents() {
  graphComponent.removeEventListener('viewport-changed', componentOnViewportChanged)
  graphComponent.removeEventListener('zoom-changed', componentOnZoomChanged)
}

/**
 * Registers events regarding node changes to the graphComponent's graph.
 */
function registerNodeEvents() {
  graphComponent.graph.addEventListener('node-layout-changed', onNodeLayoutChanged)
  graphComponent.graph.addEventListener('node-style-changed', onNodeStyleChanged)
  graphComponent.graph.addEventListener('node-tag-changed', onNodeTagChanged)
  graphComponent.graph.addEventListener('node-created', onNodeCreated)
  graphComponent.graph.addEventListener('node-removed', onNodeRemoved)
}

/**
 * Unregisters events regarding node changes from the graphComponent's graph.
 */
function unregisterNodeEvents() {
  graphComponent.graph.removeEventListener('node-layout-changed', onNodeLayoutChanged)
  graphComponent.graph.removeEventListener('node-style-changed', onNodeStyleChanged)
  graphComponent.graph.removeEventListener('node-tag-changed', onNodeTagChanged)
  graphComponent.graph.removeEventListener('node-created', onNodeCreated)
  graphComponent.graph.removeEventListener('node-removed', onNodeRemoved)
}

/**
 * Registers events regarding edge changes to the graphComponent's graph.
 */
function registerEdgeEvents() {
  graphComponent.graph.addEventListener('edge-ports-changed', onEdgePortsChanged)
  graphComponent.graph.addEventListener('edge-style-changed', onEdgeStyleChanged)
  graphComponent.graph.addEventListener('edge-tag-changed', onEdgeTagChanged)
  graphComponent.graph.addEventListener('edge-created', onEdgeCreated)
  graphComponent.graph.addEventListener('edge-removed', onEdgeRemoved)
}

/**
 * Unregisters events regarding edge changes from the graphComponent's graph.
 */
function unregisterEdgeEvents() {
  graphComponent.graph.removeEventListener('edge-ports-changed', onEdgePortsChanged)
  graphComponent.graph.removeEventListener('edge-style-changed', onEdgeStyleChanged)
  graphComponent.graph.removeEventListener('edge-tag-changed', onEdgeTagChanged)
  graphComponent.graph.removeEventListener('edge-created', onEdgeCreated)
  graphComponent.graph.removeEventListener('edge-removed', onEdgeRemoved)
}

/**
 * Registers events regarding bend changes to the graphComponent's graph.
 */
function registerBendEvents() {
  graphComponent.graph.addEventListener('bend-added', onBendAdded)
  graphComponent.graph.addEventListener('bend-location-changed', onBendLocationChanged)
  graphComponent.graph.addEventListener('bend-tag-changed', onBendTagChanged)
  graphComponent.graph.addEventListener('bend-removed', onBendRemoved)
}

/**
 * Unregisters events regarding bend changes from the graphComponent's graph.
 */
function unregisterBendEvents() {
  graphComponent.graph.removeEventListener('bend-added', onBendAdded)
  graphComponent.graph.removeEventListener('bend-location-changed', onBendLocationChanged)
  graphComponent.graph.removeEventListener('bend-tag-changed', onBendTagChanged)
  graphComponent.graph.removeEventListener('bend-removed', onBendRemoved)
}

/**
 * Registers events regarding port changes to the graphComponent's graph.
 */
function registerPortEvents() {
  graphComponent.graph.addEventListener('port-added', onPortAdded)
  graphComponent.graph.addEventListener(
    'port-location-parameter-changed',
    onPortLocationParameterChanged
  )
  graphComponent.graph.addEventListener('port-style-changed', onPortStyleChanged)
  graphComponent.graph.addEventListener('port-tag-changed', onPortTagChanged)
  graphComponent.graph.addEventListener('port-removed', onPortRemoved)
}

/**
 * Unregisters events regarding port changes from the graphComponent's graph.
 */
function unregisterPortEvents() {
  graphComponent.graph.removeEventListener('port-added', onPortAdded)
  graphComponent.graph.removeEventListener(
    'port-location-parameter-changed',
    onPortLocationParameterChanged
  )
  graphComponent.graph.removeEventListener('port-style-changed', onPortStyleChanged)
  graphComponent.graph.removeEventListener('port-tag-changed', onPortTagChanged)
  graphComponent.graph.removeEventListener('port-removed', onPortRemoved)
}

/**
 * Registers events regarding label changes to the graphComponent's graph.
 */
function registerLabelEvents() {
  graphComponent.graph.addEventListener('label-added', onLabelAdded)
  graphComponent.graph.addEventListener('label-preferred-size-changed', onLabelPreferredSizeChanged)
  graphComponent.graph.addEventListener(
    'label-layout-parameter-changed',
    onLabelLayoutParameterChanged
  )
  graphComponent.graph.addEventListener('label-style-changed', onLabelStyleChanged)
  graphComponent.graph.addEventListener('label-tag-changed', onLabelTagChanged)
  graphComponent.graph.addEventListener('label-text-changed', onLabelTextChanged)
  graphComponent.graph.addEventListener('label-removed', onLabelRemoved)
}

/**
 * Unregisters events regarding label changes from the graphComponent's graph.
 */
function unregisterLabelEvents() {
  graphComponent.graph.removeEventListener('label-added', onLabelAdded)
  graphComponent.graph.removeEventListener(
    'label-preferred-size-changed',
    onLabelPreferredSizeChanged
  )
  graphComponent.graph.removeEventListener(
    'label-layout-parameter-changed',
    onLabelLayoutParameterChanged
  )
  graphComponent.graph.removeEventListener('label-style-changed', onLabelStyleChanged)
  graphComponent.graph.removeEventListener('label-tag-changed', onLabelTagChanged)
  graphComponent.graph.removeEventListener('label-text-changed', onLabelTextChanged)
  graphComponent.graph.removeEventListener('label-removed', onLabelRemoved)
}

/**
 * Registers events regarding hierarchy changes to the graphComponent's graph.
 */
function registerHierarchyEvents() {
  graphComponent.graph.addEventListener('parent-changed', onParentChanged)
  graphComponent.graph.addEventListener('is-group-node-changed', onIsGroupNodeChanged)
}

/**
 * Unregisters events regarding hierarchy changes from the graphComponent's graph.
 */
function unregisterHierarchyEvents() {
  graphComponent.graph.removeEventListener('parent-changed', onParentChanged)
  graphComponent.graph.removeEventListener('is-group-node-changed', onIsGroupNodeChanged)
}

/**
 * Registers events regarding folding changes to the folding view of the graphComponent.
 */
function registerFoldingEvents() {
  foldingView.addEventListener('group-collapsed', onGroupCollapsed)
  foldingView.addEventListener('group-expanded', onGroupExpanded)
  foldingView.addEventListener('property-changed', onPropertyChanged)
}

/**
 * Unregisters events regarding folding changes from the folding view of the graphComponent.
 */
function unregisterFoldingEvents() {
  foldingView.removeEventListener('group-collapsed', onGroupCollapsed)
  foldingView.removeEventListener('group-expanded', onGroupExpanded)
  foldingView.removeEventListener('property-changed', onPropertyChanged)
}

/**
 * Registers events regarding updating the current display to the graphComponent's graph.
 */
function registerGraphRenderEvents() {
  graphComponent.graph.addEventListener('displays-invalidated', onDisplaysInvalidated)
}

/**
 * Unregisters events regarding updating the current display from the graphComponent's graph.
 */
function unregisterGraphRenderEvents() {
  graphComponent.graph.removeEventListener('displays-invalidated', onDisplaysInvalidated)
}

/**
 * Registers events to the graphComponent.
 */
function registerGraphComponentEvents() {
  graphComponent.addEventListener('current-item-changed', componentOnCurrentItemChanged)
}

/**
 * Unregisters events from the graphComponent.
 */
function unregisterGraphComponentEvents() {
  graphComponent.removeEventListener('current-item-changed', componentOnCurrentItemChanged)
}

/**
 * Registers events to the input mode.
 */
function registerInputModeEvents() {
  editorMode.addEventListener('canvas-clicked', geimOnCanvasClicked)
  editorMode.addEventListener('deleted-item', geimOnDeletedItem)
  editorMode.addEventListener('deleted-selection', geimOnDeletedSelection)
  editorMode.addEventListener('deleting-selection', geimOnDeletingSelection)
  editorMode.addEventListener('item-clicked', geimOnItemClicked)
  editorMode.addEventListener('item-double-clicked', geimOnItemDoubleClicked)
  editorMode.addEventListener('item-left-clicked', geimOnItemLeftClicked)
  editorMode.addEventListener('item-left-double-clicked', geimOnItemLeftDoubleClicked)
  editorMode.addEventListener('item-right-clicked', geimOnItemRightClicked)
  editorMode.addEventListener('item-right-double-clicked', geimOnItemRightDoubleClicked)
  editorMode.addEventListener('multi-selection-finished', geimOnMultiSelectionFinished)
  editorMode.addEventListener('multi-selection-started', geimOnMultiSelectionStarted)
  editorMode.addEventListener('node-created', geimOnNodeCreated)
  editorMode.addEventListener('node-reparented', geimOnNodeReparented)
  editorMode.addEventListener('edge-ports-changed', geimOnEdgePortsChanged)
  editorMode.addEventListener('populate-item-context-menu', geimOnPopulateItemContextMenu)
  editorMode.addEventListener('query-item-tool-tip', geimOnQueryItemToolTip)
  editorMode.addEventListener('label-added', geimOnLabelAdded)
  editorMode.addEventListener('label-edited', geimOnLabelEdited)

  viewerMode.addEventListener('canvas-clicked', gvimOnCanvasClicked)
  viewerMode.addEventListener('item-clicked', gvimOnItemClicked)
  viewerMode.addEventListener('item-double-clicked', gvimOnItemDoubleClicked)
  viewerMode.addEventListener('item-left-clicked', gvimOnItemLeftClicked)
  viewerMode.addEventListener('item-left-double-clicked', gvimOnItemLeftDoubleClicked)
  viewerMode.addEventListener('item-right-clicked', gvimOnItemRightClicked)
  viewerMode.addEventListener('item-right-double-clicked', gvimOnItemRightDoubleClicked)
  viewerMode.addEventListener('multi-selection-finished', gvimOnMultiSelectionFinished)
  viewerMode.addEventListener('multi-selection-started', gvimOnMultiSelectionStarted)
  viewerMode.addEventListener('populate-item-context-menu', gvimOnPopulateItemContextMenu)
  viewerMode.addEventListener('query-item-tool-tip', gvimOnQueryItemToolTip)
}

/**
 * Unregisters events from the input mode.
 */
function unregisterInputModeEvents() {
  editorMode.removeEventListener('canvas-clicked', geimOnCanvasClicked)
  editorMode.removeEventListener('deleted-item', geimOnDeletedItem)
  editorMode.removeEventListener('deleted-selection', geimOnDeletedSelection)
  editorMode.removeEventListener('deleting-selection', geimOnDeletingSelection)
  editorMode.removeEventListener('item-clicked', geimOnItemClicked)
  editorMode.removeEventListener('item-double-clicked', geimOnItemDoubleClicked)
  editorMode.removeEventListener('item-left-clicked', geimOnItemLeftClicked)
  editorMode.removeEventListener('item-left-double-clicked', geimOnItemLeftDoubleClicked)
  editorMode.removeEventListener('item-right-clicked', geimOnItemRightClicked)
  editorMode.removeEventListener('item-right-double-clicked', geimOnItemRightDoubleClicked)
  editorMode.removeEventListener('multi-selection-finished', geimOnMultiSelectionFinished)
  editorMode.removeEventListener('multi-selection-started', geimOnMultiSelectionStarted)
  editorMode.removeEventListener('node-created', geimOnNodeCreated)
  editorMode.removeEventListener('node-reparented', geimOnNodeReparented)
  editorMode.removeEventListener('edge-ports-changed', geimOnEdgePortsChanged)
  editorMode.removeEventListener('populate-item-context-menu', geimOnPopulateItemContextMenu)
  editorMode.removeEventListener('query-item-tool-tip', geimOnQueryItemToolTip)
  viewerMode.removeEventListener('canvas-clicked', gvimOnCanvasClicked)
  viewerMode.removeEventListener('item-clicked', gvimOnItemClicked)
  viewerMode.removeEventListener('item-double-clicked', gvimOnItemDoubleClicked)
  viewerMode.removeEventListener('item-left-clicked', gvimOnItemLeftClicked)
  viewerMode.removeEventListener('item-left-double-clicked', gvimOnItemLeftDoubleClicked)
  viewerMode.removeEventListener('item-right-clicked', gvimOnItemRightClicked)
  viewerMode.removeEventListener('item-right-double-clicked', gvimOnItemRightDoubleClicked)
  viewerMode.removeEventListener('multi-selection-finished', gvimOnMultiSelectionFinished)
  viewerMode.removeEventListener('multi-selection-started', gvimOnMultiSelectionStarted)
  viewerMode.removeEventListener('populate-item-context-menu', gvimOnPopulateItemContextMenu)
  viewerMode.removeEventListener('query-item-tool-tip', gvimOnQueryItemToolTip)
}

/**
 * Registers events to the move input mode.
 */
function registerMoveInputModeEvents() {
  editorMode.moveSelectedItemsInputMode.addEventListener(
    'drag-canceled',
    moveInputModeOnDragCanceled
  )
  editorMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-canceled',
    moveInputModeOnDragCanceled
  )
  editorMode.moveSelectedItemsInputMode.addEventListener(
    'drag-canceling',
    moveInputModeOnDragCanceling
  )
  editorMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-canceling',
    moveInputModeOnDragCanceling
  )
  editorMode.moveSelectedItemsInputMode.addEventListener(
    'drag-finished',
    moveInputModeOnDragFinished
  )
  editorMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-finished',
    moveInputModeOnDragFinished
  )
  editorMode.moveSelectedItemsInputMode.addEventListener(
    'drag-finishing',
    moveInputModeOnDragFinishing
  )
  editorMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-finishing',
    moveInputModeOnDragFinishing
  )
  editorMode.moveSelectedItemsInputMode.addEventListener('drag-started', moveInputModeOnDragStarted)
  editorMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-started',
    moveInputModeOnDragStarted
  )
  editorMode.moveSelectedItemsInputMode.addEventListener(
    'drag-starting',
    moveInputModeOnDragStarting
  )
  editorMode.moveUnselectedItemsInputMode.addEventListener(
    'drag-starting',
    moveInputModeOnDragStarting
  )
  editorMode.moveSelectedItemsInputMode.addEventListener('dragged', moveInputModeOnDragged)
  editorMode.moveUnselectedItemsInputMode.addEventListener('dragged', moveInputModeOnDragged)
  editorMode.moveSelectedItemsInputMode.addEventListener('dragging', moveInputModeOnDragging)
  editorMode.moveUnselectedItemsInputMode.addEventListener('dragging', moveInputModeOnDragging)
  editorMode.moveSelectedItemsInputMode.addEventListener(
    'query-position-handler',
    moveInputModeOnQueryPositionHandler
  )
  editorMode.moveUnselectedItemsInputMode.addEventListener(
    'query-position-handler',
    moveInputModeOnQueryPositionHandler
  )
}

/**
 * Unregisters events from the move input mode.
 */
function unregisterMoveInputModeEvents() {
  editorMode.moveSelectedItemsInputMode.removeEventListener(
    'drag-canceled',
    moveInputModeOnDragCanceled
  )
  editorMode.moveUnselectedItemsInputMode.removeEventListener(
    'drag-canceled',
    moveInputModeOnDragCanceled
  )
  editorMode.moveSelectedItemsInputMode.removeEventListener(
    'drag-canceling',
    moveInputModeOnDragCanceling
  )
  editorMode.moveUnselectedItemsInputMode.removeEventListener(
    'drag-canceling',
    moveInputModeOnDragCanceling
  )
  editorMode.moveSelectedItemsInputMode.removeEventListener(
    'drag-finished',
    moveInputModeOnDragFinished
  )
  editorMode.moveUnselectedItemsInputMode.removeEventListener(
    'drag-finished',
    moveInputModeOnDragFinished
  )
  editorMode.moveSelectedItemsInputMode.removeEventListener(
    'drag-finishing',
    moveInputModeOnDragFinishing
  )
  editorMode.moveUnselectedItemsInputMode.removeEventListener(
    'drag-finishing',
    moveInputModeOnDragFinishing
  )
  editorMode.moveSelectedItemsInputMode.removeEventListener(
    'drag-started',
    moveInputModeOnDragStarted
  )
  editorMode.moveUnselectedItemsInputMode.removeEventListener(
    'drag-started',
    moveInputModeOnDragStarted
  )
  editorMode.moveSelectedItemsInputMode.removeEventListener(
    'drag-starting',
    moveInputModeOnDragStarting
  )
  editorMode.moveUnselectedItemsInputMode.removeEventListener(
    'drag-starting',
    moveInputModeOnDragStarting
  )
  editorMode.moveSelectedItemsInputMode.removeEventListener('dragged', moveInputModeOnDragged)
  editorMode.moveUnselectedItemsInputMode.removeEventListener('dragged', moveInputModeOnDragged)
  editorMode.moveSelectedItemsInputMode.removeEventListener('dragging', moveInputModeOnDragging)
  editorMode.moveUnselectedItemsInputMode.removeEventListener('dragging', moveInputModeOnDragging)
  editorMode.moveSelectedItemsInputMode.removeEventListener(
    'query-position-handler',
    moveInputModeOnQueryPositionHandler
  )
  editorMode.moveUnselectedItemsInputMode.removeEventListener(
    'query-position-handler',
    moveInputModeOnQueryPositionHandler
  )
}

/**
 * Registers events to the node drop input mode.
 */
function registerItemDropInputModeEvents() {
  editorMode.nodeDropInputMode.addEventListener('drag-dropped', itemInputModeOnDragDropped)
  editorMode.nodeDropInputMode.addEventListener('drag-entered', itemInputModeOnDragEntered)
  editorMode.nodeDropInputMode.addEventListener('drag-left', itemInputModeOnDragLeft)
  editorMode.nodeDropInputMode.addEventListener('drag-over', itemInputModeOnDragOver)
  editorMode.nodeDropInputMode.addEventListener('item-created', itemInputModeOnItemCreated)
  editorMode.labelDropInputMode.addEventListener('drag-dropped', itemInputModeOnDragDropped)
  editorMode.labelDropInputMode.addEventListener('drag-entered', itemInputModeOnDragEntered)
  editorMode.labelDropInputMode.addEventListener('drag-left', itemInputModeOnDragLeft)
  editorMode.labelDropInputMode.addEventListener('drag-over', itemInputModeOnDragOver)
  editorMode.labelDropInputMode.addEventListener('item-created', itemInputModeOnItemCreated)
  // PortDropInputMode inherits drag-dropped, drag-entered, drag-left, drag-over, item-created events from
  // ItemDropInputMode, too
}

/**
 * Unregisters events from the node drop input mode.
 */
function unregisterItemDropInputModeEvents() {
  editorMode.nodeDropInputMode.removeEventListener('drag-dropped', itemInputModeOnDragDropped)
  editorMode.nodeDropInputMode.removeEventListener('drag-entered', itemInputModeOnDragEntered)
  editorMode.nodeDropInputMode.removeEventListener('drag-left', itemInputModeOnDragLeft)
  editorMode.nodeDropInputMode.removeEventListener('drag-over', itemInputModeOnDragOver)
  editorMode.nodeDropInputMode.removeEventListener('item-created', itemInputModeOnItemCreated)
  editorMode.labelDropInputMode.removeEventListener('drag-dropped', itemInputModeOnDragDropped)
  editorMode.labelDropInputMode.removeEventListener('drag-entered', itemInputModeOnDragEntered)
  editorMode.labelDropInputMode.removeEventListener('drag-left', itemInputModeOnDragLeft)
  editorMode.labelDropInputMode.removeEventListener('drag-over', itemInputModeOnDragOver)
  editorMode.labelDropInputMode.removeEventListener('item-created', itemInputModeOnItemCreated)
}

/**
 * Registers events from the edit label input mode.
 */
function registerEditLabelInputModeEvents() {
  editorMode.editLabelInputMode.addEventListener('label-added', editLabelInputModeLabelAdded)
  editorMode.editLabelInputMode.addEventListener('label-deleted', editLabelInputModeLabelDeleted)
  editorMode.editLabelInputMode.addEventListener('label-edited', editLabelInputModeLabelEdited)
  editorMode.editLabelInputMode.addEventListener(
    'label-editing-canceled',
    editLabelInputModeLabelEditingCanceled
  )
  editorMode.editLabelInputMode.addEventListener(
    'label-editing-started',
    editLabelInputModeLabelEditingStarted
  )
  editorMode.editLabelInputMode.addEventListener(
    'query-label-adding',
    editLabelInputModeOnQueryLabelAdding
  )
  editorMode.editLabelInputMode.addEventListener(
    'query-label-editing',
    editLabelInputModeOnQueryLabelEditing
  )
  editorMode.editLabelInputMode.addEventListener(
    'validate-label-text',
    editLabelInputModeOnQueryValidateLabelText
  )
}

/**
 * Unregisters events from the edit label input mode.
 */
function unregisterEditLabelInputModeEvents() {
  editorMode.editLabelInputMode.removeEventListener('label-added', editLabelInputModeLabelAdded)
  editorMode.editLabelInputMode.removeEventListener('label-deleted', editLabelInputModeLabelDeleted)
  editorMode.editLabelInputMode.removeEventListener('label-edited', editLabelInputModeLabelEdited)
  editorMode.editLabelInputMode.removeEventListener(
    'label-editing-canceled',
    editLabelInputModeLabelEditingCanceled
  )
  editorMode.editLabelInputMode.removeEventListener(
    'label-editing-started',
    editLabelInputModeLabelEditingStarted
  )
  editorMode.editLabelInputMode.removeEventListener(
    'query-label-adding',
    editLabelInputModeOnQueryLabelAdding
  )
  editorMode.editLabelInputMode.removeEventListener(
    'query-label-editing',
    editLabelInputModeOnQueryLabelEditing
  )
  editorMode.editLabelInputMode.removeEventListener(
    'validate-label-text',
    editLabelInputModeOnQueryValidateLabelText
  )
}

/**
 * Registers hover events to the input mode.
 */
function registerItemHoverInputModeEvents() {
  editorMode.itemHoverInputMode.addEventListener(
    'hovered-item-changed',
    itemHoverInputModeOnHoveredItemChanged
  )
  viewerMode.itemHoverInputMode.addEventListener(
    'hovered-item-changed',
    itemHoverInputModeOnHoveredItemChanged
  )
}

/**
 * Unregisters hover events from the input mode.
 */
function unregisterItemHoverInputModeEvents() {
  editorMode.itemHoverInputMode.removeEventListener(
    'hovered-item-changed',
    itemHoverInputModeOnHoveredItemChanged
  )
  viewerMode.itemHoverInputMode.removeEventListener(
    'hovered-item-changed',
    itemHoverInputModeOnHoveredItemChanged
  )
}

/**
 * Registers events to the bend input mode.
 */
function registerCreateBendInputModeEvents() {
  editorMode.createBendInputMode.addEventListener('bend-created', createBendInputModeOnBendCreated)
  editorMode.createBendInputMode.addEventListener(
    'drag-canceled',
    createBendInputModeOnDragCanceled
  )
  editorMode.createBendInputMode.addEventListener('dragged', createBendInputModeOnDragged)
  editorMode.createBendInputMode.addEventListener('dragging', createBendInputModeOnDragging)
}

/**
 * Unregisters events from the bend input mode.
 */
function unregisterCreateBendInputModeEvents() {
  editorMode.createBendInputMode.removeEventListener(
    'bend-created',
    createBendInputModeOnBendCreated
  )
  editorMode.createBendInputMode.removeEventListener(
    'drag-canceled',
    createBendInputModeOnDragCanceled
  )
  editorMode.createBendInputMode.removeEventListener('dragged', createBendInputModeOnDragged)
  editorMode.createBendInputMode.removeEventListener('dragging', createBendInputModeOnDragging)
}

/**
 * Registers events related to the context menu.
 */
function registerContextMenuInputModeEvents() {
  editorMode.contextMenuInputMode.addEventListener(
    'populate-menu',
    contextMenuInputModeOnPopulateMenu
  )
  viewerMode.contextMenuInputMode.addEventListener(
    'populate-menu',
    contextMenuInputModeOnPopulateMenu
  )
}

/**
 * Unregisters events related to the context menu.
 */
function unregisterContextMenuInputModeEvents() {
  editorMode.contextMenuInputMode.removeEventListener(
    'populate-menu',
    contextMenuInputModeOnPopulateMenu
  )
  viewerMode.contextMenuInputMode.removeEventListener(
    'populate-menu',
    contextMenuInputModeOnPopulateMenu
  )
}

/**
 * Registers events related to the text editor mode.
 */
function registerTextEditorInputModeEvents() {
  const textEditorInputMode = editorMode.editLabelInputMode.textEditorInputMode
  textEditorInputMode.addEventListener('editing-canceled', textEditorInputModeOnEditingCanceled)
  textEditorInputMode.addEventListener('editing-started', textEditorInputModeOnEditingStarted)
  textEditorInputMode.addEventListener('text-edited', textEditorInputModeOnTextEdited)
}

/**
 * Unregisters events related from the text editor mode.
 */
function unregisterTextEditorInputModeEvents() {
  const textEditorInputMode = editorMode.editLabelInputMode.textEditorInputMode
  textEditorInputMode.removeEventListener('editing-canceled', textEditorInputModeOnEditingCanceled)
  textEditorInputMode.removeEventListener('editing-started', textEditorInputModeOnEditingStarted)
  textEditorInputMode.removeEventListener('text-edited', textEditorInputModeOnTextEdited)
}

/**
 * Registers events related to tooltips to the input mode.
 */
function registerTooltipInputModeEvents() {
  editorMode.toolTipInputMode.addEventListener('query-tool-tip', toolTipInputModeOnQueryToolTip)
  viewerMode.toolTipInputMode.addEventListener('query-tool-tip', toolTipInputModeOnQueryToolTip)
}

/**
 * Registers events related to tooltips from the input mode.
 */
function unregisterToolTipInputModeEvents() {
  editorMode.toolTipInputMode.removeEventListener('query-tool-tip', toolTipInputModeOnQueryToolTip)
  viewerMode.toolTipInputMode.removeEventListener('query-tool-tip', toolTipInputModeOnQueryToolTip)
}

/**
 * Registers events related to group navigation to the navigation input mode.
 */
function registerNavigationInputModeEvents() {
  editorMode.navigationInputMode.addEventListener(
    'group-collapsed',
    navigationInputModeOnGroupCollapsed
  )
  editorMode.navigationInputMode.addEventListener(
    'group-collapsing',
    navigationInputModeOnGroupCollapsing
  )
  editorMode.navigationInputMode.addEventListener(
    'group-entered',
    navigationInputModeOnGroupEntered
  )
  editorMode.navigationInputMode.addEventListener(
    'group-entering',
    navigationInputModeOnGroupEntering
  )
  editorMode.navigationInputMode.addEventListener('group-exited', navigationInputModeOnGroupExited)
  editorMode.navigationInputMode.addEventListener(
    'group-exiting',
    navigationInputModeOnGroupExiting
  )
  editorMode.navigationInputMode.addEventListener(
    'group-expanded',
    navigationInputModeOnGroupExpanded
  )
  editorMode.navigationInputMode.addEventListener(
    'group-expanding',
    navigationInputModeOnGroupExpanding
  )

  viewerMode.navigationInputMode.addEventListener(
    'group-collapsed',
    navigationInputModeOnGroupCollapsed
  )
  viewerMode.navigationInputMode.addEventListener(
    'group-collapsing',
    navigationInputModeOnGroupCollapsing
  )
  viewerMode.navigationInputMode.addEventListener(
    'group-entered',
    navigationInputModeOnGroupEntered
  )
  viewerMode.navigationInputMode.addEventListener(
    'group-entering',
    navigationInputModeOnGroupEntering
  )
  viewerMode.navigationInputMode.addEventListener('group-exited', navigationInputModeOnGroupExited)
  viewerMode.navigationInputMode.addEventListener(
    'group-exiting',
    navigationInputModeOnGroupExiting
  )
  viewerMode.navigationInputMode.addEventListener(
    'group-expanded',
    navigationInputModeOnGroupExpanded
  )
  viewerMode.navigationInputMode.addEventListener(
    'group-expanding',
    navigationInputModeOnGroupExpanding
  )
}

/**
 * Unregisters events related to group navigation from the navigation input mode.
 */
function unregisterNavigationInputModeEvents() {
  editorMode.navigationInputMode.removeEventListener(
    'group-collapsed',
    navigationInputModeOnGroupCollapsed
  )
  editorMode.navigationInputMode.removeEventListener(
    'group-collapsing',
    navigationInputModeOnGroupCollapsing
  )
  editorMode.navigationInputMode.removeEventListener(
    'group-entered',
    navigationInputModeOnGroupEntered
  )
  editorMode.navigationInputMode.removeEventListener(
    'group-entering',
    navigationInputModeOnGroupEntering
  )
  editorMode.navigationInputMode.removeEventListener(
    'group-exited',
    navigationInputModeOnGroupExited
  )
  editorMode.navigationInputMode.removeEventListener(
    'group-exiting',
    navigationInputModeOnGroupExiting
  )
  editorMode.navigationInputMode.removeEventListener(
    'group-expanded',
    navigationInputModeOnGroupExpanded
  )
  editorMode.navigationInputMode.removeEventListener(
    'group-expanding',
    navigationInputModeOnGroupExpanding
  )

  viewerMode.navigationInputMode.removeEventListener(
    'group-collapsed',
    navigationInputModeOnGroupCollapsed
  )
  viewerMode.navigationInputMode.removeEventListener(
    'group-collapsing',
    navigationInputModeOnGroupCollapsing
  )
  viewerMode.navigationInputMode.removeEventListener(
    'group-entered',
    navigationInputModeOnGroupEntered
  )
  viewerMode.navigationInputMode.removeEventListener(
    'group-entering',
    navigationInputModeOnGroupEntering
  )
  viewerMode.navigationInputMode.removeEventListener(
    'group-exited',
    navigationInputModeOnGroupExited
  )
  viewerMode.navigationInputMode.removeEventListener(
    'group-exiting',
    navigationInputModeOnGroupExiting
  )
  viewerMode.navigationInputMode.removeEventListener(
    'group-expanded',
    navigationInputModeOnGroupExpanded
  )
  viewerMode.navigationInputMode.removeEventListener(
    'group-expanding',
    navigationInputModeOnGroupExpanding
  )
}

/**
 * Registers events to the click input mode.
 */
function registerClickInputModeEvents() {
  editorMode.clickInputMode.addEventListener('clicked', clickInputModeOnClicked)
  viewerMode.clickInputMode.addEventListener('clicked', clickInputModeOnClicked)
}

/**
 * Unregisters events from the click input mode.
 */
function unregisterClickInputModeEvents() {
  editorMode.clickInputMode.removeEventListener('clicked', clickInputModeOnClicked)
  viewerMode.clickInputMode.removeEventListener('clicked', clickInputModeOnClicked)
}

/**
 * Registers events to the click input mode.
 */
function registerHandleInputModeEvents() {
  editorMode.handleInputMode.addEventListener('drag-canceled', handleInputModeOnDragCanceled)
  editorMode.handleInputMode.addEventListener('drag-canceling', handleInputModeOnDragCanceling)
  editorMode.handleInputMode.addEventListener('drag-finished', handleInputModeOnDragFinished)
  editorMode.handleInputMode.addEventListener('drag-finishing', handleInputModeOnDragFinishing)
  editorMode.handleInputMode.addEventListener('drag-started', handleInputModeOnDragStarted)
  editorMode.handleInputMode.addEventListener('drag-starting', handleInputModeOnDragStarting)
  editorMode.handleInputMode.addEventListener('dragged', handleInputModeOnDragged)
  editorMode.handleInputMode.addEventListener('dragging', handleInputModeOnDragging)
}

/**
 * Unregisters events from the handle input mode.
 */
function unregisterHandleInputModeEvents() {
  editorMode.handleInputMode.removeEventListener('drag-canceled', handleInputModeOnDragCanceled)
  editorMode.handleInputMode.removeEventListener('drag-canceling', handleInputModeOnDragCanceling)
  editorMode.handleInputMode.removeEventListener('drag-finished', handleInputModeOnDragFinished)
  editorMode.handleInputMode.removeEventListener('drag-finishing', handleInputModeOnDragFinishing)
  editorMode.handleInputMode.removeEventListener('drag-started', handleInputModeOnDragStarted)
  editorMode.handleInputMode.removeEventListener('drag-starting', handleInputModeOnDragStarting)
  editorMode.handleInputMode.removeEventListener('dragged', handleInputModeOnDragged)
  editorMode.handleInputMode.removeEventListener('dragging', handleInputModeOnDragging)
}

/**
 * Registers events to the move viewport input mode.
 */
function registerMoveViewportInputModeEvents() {
  editorMode.moveViewportInputMode.addEventListener(
    'drag-canceled',
    moveViewportInputModeOnDragCanceled
  )
  editorMode.moveViewportInputMode.addEventListener(
    'drag-canceling',
    moveViewportInputModeOnDragCanceling
  )
  editorMode.moveViewportInputMode.addEventListener(
    'drag-finished',
    moveViewportInputModeOnDragFinished
  )
  editorMode.moveViewportInputMode.addEventListener(
    'drag-finishing',
    moveViewportInputModeOnDragFinishing
  )
  editorMode.moveViewportInputMode.addEventListener(
    'drag-started',
    moveViewportInputModeOnDragStarted
  )
  editorMode.moveViewportInputMode.addEventListener(
    'drag-starting',
    moveViewportInputModeOnDragStarting
  )
  editorMode.moveViewportInputMode.addEventListener('dragged', moveViewportInputModeOnDragged)
  editorMode.moveViewportInputMode.addEventListener('dragging', moveViewportInputModeOnDragging)

  viewerMode.moveViewportInputMode.addEventListener(
    'drag-canceled',
    moveViewportInputModeOnDragCanceled
  )
  viewerMode.moveViewportInputMode.addEventListener(
    'drag-canceling',
    moveViewportInputModeOnDragCanceling
  )
  viewerMode.moveViewportInputMode.addEventListener(
    'drag-finished',
    moveViewportInputModeOnDragFinished
  )
  viewerMode.moveViewportInputMode.addEventListener(
    'drag-finishing',
    moveViewportInputModeOnDragFinishing
  )
  viewerMode.moveViewportInputMode.addEventListener(
    'drag-started',
    moveViewportInputModeOnDragStarted
  )
  viewerMode.moveViewportInputMode.addEventListener(
    'drag-starting',
    moveViewportInputModeOnDragStarting
  )
  viewerMode.moveViewportInputMode.addEventListener('dragged', moveViewportInputModeOnDragged)
  viewerMode.moveViewportInputMode.addEventListener('dragging', moveViewportInputModeOnDragging)
}

/**
 * Unregisters events from the move viewport input mode.
 */
function unregisterMoveViewportInputModeEvents() {
  editorMode.moveViewportInputMode.removeEventListener(
    'drag-canceled',
    moveViewportInputModeOnDragCanceled
  )
  editorMode.moveViewportInputMode.removeEventListener(
    'drag-canceling',
    moveViewportInputModeOnDragCanceling
  )
  editorMode.moveViewportInputMode.removeEventListener(
    'drag-finished',
    moveViewportInputModeOnDragFinished
  )
  editorMode.moveViewportInputMode.removeEventListener(
    'drag-finishing',
    moveViewportInputModeOnDragFinishing
  )
  editorMode.moveViewportInputMode.removeEventListener(
    'drag-started',
    moveViewportInputModeOnDragStarted
  )
  editorMode.moveViewportInputMode.removeEventListener(
    'drag-starting',
    moveViewportInputModeOnDragStarting
  )
  editorMode.moveViewportInputMode.removeEventListener('dragged', moveViewportInputModeOnDragged)
  editorMode.moveViewportInputMode.removeEventListener('dragging', moveViewportInputModeOnDragging)

  viewerMode.moveViewportInputMode.removeEventListener(
    'drag-canceled',
    moveViewportInputModeOnDragCanceled
  )
  viewerMode.moveViewportInputMode.removeEventListener(
    'drag-canceling',
    moveViewportInputModeOnDragCanceling
  )
  viewerMode.moveViewportInputMode.removeEventListener(
    'drag-finished',
    moveViewportInputModeOnDragFinished
  )
  viewerMode.moveViewportInputMode.removeEventListener(
    'drag-finishing',
    moveViewportInputModeOnDragFinishing
  )
  viewerMode.moveViewportInputMode.removeEventListener(
    'drag-started',
    moveViewportInputModeOnDragStarted
  )
  viewerMode.moveViewportInputMode.removeEventListener(
    'drag-starting',
    moveViewportInputModeOnDragStarting
  )
  viewerMode.moveViewportInputMode.removeEventListener('dragged', moveViewportInputModeOnDragged)
  viewerMode.moveViewportInputMode.removeEventListener('dragging', moveViewportInputModeOnDragging)
}

/**
 * Registers events to the create edge input mode.
 */
function registerCreateEdgeInputModeEvents() {
  editorMode.createEdgeInputMode.addEventListener('edge-created', createEdgeInputModeOnEdgeCreated)
  editorMode.createEdgeInputMode.addEventListener(
    'edge-creation-started',
    createEdgeInputModeOnEdgeCreationStarted
  )
  editorMode.createEdgeInputMode.addEventListener(
    'gesture-canceled',
    createEdgeInputModeOnGestureCanceled
  )
  editorMode.createEdgeInputMode.addEventListener(
    'gesture-canceling',
    createEdgeInputModeOnGestureCanceling
  )
  editorMode.createEdgeInputMode.addEventListener(
    'gesture-finished',
    createEdgeInputModeOnGestureFinished
  )
  editorMode.createEdgeInputMode.addEventListener(
    'gesture-finishing',
    createEdgeInputModeOnGestureFinishing
  )
  editorMode.createEdgeInputMode.addEventListener(
    'gesture-started',
    createEdgeInputModeOnGestureStarted
  )
  editorMode.createEdgeInputMode.addEventListener(
    'gesture-starting',
    createEdgeInputModeOnGestureStarting
  )
  editorMode.createEdgeInputMode.addEventListener('moved', createEdgeInputModeOnMoved)
  editorMode.createEdgeInputMode.addEventListener('moving', createEdgeInputModeOnMoving)
  editorMode.createEdgeInputMode.addEventListener('port-added', createEdgeInputModeOnPortAdded)
}

/**
 * Unregisters events from the create edge input mode.
 */
function unregisterCreateEdgeInputModeEvents() {
  editorMode.createEdgeInputMode.removeEventListener(
    'edge-created',
    createEdgeInputModeOnEdgeCreated
  )
  editorMode.createEdgeInputMode.removeEventListener(
    'edge-creation-started',
    createEdgeInputModeOnEdgeCreationStarted
  )
  editorMode.createEdgeInputMode.removeEventListener(
    'gesture-canceled',
    createEdgeInputModeOnGestureCanceled
  )
  editorMode.createEdgeInputMode.removeEventListener(
    'gesture-canceling',
    createEdgeInputModeOnGestureCanceling
  )
  editorMode.createEdgeInputMode.removeEventListener(
    'gesture-finished',
    createEdgeInputModeOnGestureFinished
  )
  editorMode.createEdgeInputMode.removeEventListener(
    'gesture-finishing',
    createEdgeInputModeOnGestureFinishing
  )
  editorMode.createEdgeInputMode.removeEventListener(
    'gesture-started',
    createEdgeInputModeOnGestureStarted
  )
  editorMode.createEdgeInputMode.removeEventListener(
    'gesture-starting',
    createEdgeInputModeOnGestureStarting
  )
  editorMode.createEdgeInputMode.removeEventListener('moved', createEdgeInputModeOnMoved)
  editorMode.createEdgeInputMode.removeEventListener('moving', createEdgeInputModeOnMoving)
  editorMode.createEdgeInputMode.removeEventListener('port-added', createEdgeInputModeOnPortAdded)
}

/**
 * Registers selection events to the graphComponent.
 */
function registerSelectionEvents() {
  graphComponent.selection.addEventListener('item-added', onItemSelectionAdded)
  graphComponent.selection.addEventListener('item-removed', onItemSelectionRemoved)
}

/**
 * Unregisters selection events from the graphComponent.
 */
function unregisterSelectionEvents() {
  graphComponent.selection.removeEventListener('item-added', onItemSelectionAdded)
  graphComponent.selection.removeEventListener('item-removed', onItemSelectionRemoved)
}

/**
 * Registers event handlers for undo engine events.
 */
function registerUndoEvents() {
  const undoEngine = graphComponent.graph.undoEngine
  undoEngine.addEventListener('property-changed', undoEngineOnPropertyChanged)
  undoEngine.addEventListener('unit-redone', undoEngineOnUnitRedone)
  undoEngine.addEventListener('unit-undone', undoEngineOnUnitUndone)
}

/**
 * Unregisters event handlers for undo engine events.
 */
function unregisterUndoEvents() {
  const undoEngine = graphComponent.graph.undoEngine
  undoEngine.removeEventListener('property-changed', undoEngineOnPropertyChanged)
  undoEngine.removeEventListener('unit-redone', undoEngineOnUnitRedone)
  undoEngine.removeEventListener('unit-undone', undoEngineOnUnitUndone)
}

const eventRegistration = {
  registerGraphComponentKeyEvents,
  unregisterGraphComponentKeyEvents,
  registerClipboardCopierEvents,
  unregisterClipboardCopierEvents,
  registerGraphComponentPointerEvents,
  unregisterGraphComponentPointerEvents,
  registerGraphComponentRenderEvents,
  unregisterGraphComponentRenderEvents,
  registerGraphComponentViewportEvents,
  unregisterGraphComponentViewportEvents,
  registerNodeEvents,
  unregisterNodeEvents,
  registerEdgeEvents,
  unregisterEdgeEvents,
  registerBendEvents,
  unregisterBendEvents,
  registerPortEvents,
  unregisterPortEvents,
  registerLabelEvents,
  unregisterLabelEvents,
  registerHierarchyEvents,
  unregisterHierarchyEvents,
  registerFoldingEvents,
  unregisterFoldingEvents,
  registerGraphRenderEvents,
  unregisterGraphRenderEvents,
  registerGraphComponentEvents,
  unregisterGraphComponentEvents,
  registerInputModeEvents,
  unregisterInputModeEvents,
  registerMoveInputModeEvents,
  unregisterMoveInputModeEvents,
  registerItemDropInputModeEvents,
  unregisterItemDropInputModeEvents,
  registerEditLabelInputModeEvents,
  unregisterEditLabelInputModeEvents,
  registerItemHoverInputModeEvents,
  unregisterItemHoverInputModeEvents,
  registerCreateBendInputModeEvents,
  unregisterCreateBendInputModeEvents,
  registerContextMenuInputModeEvents,
  unregisterContextMenuInputModeEvents,
  registerTextEditorInputModeEvents,
  unregisterTextEditorInputModeEvents,
  registerTooltipInputModeEvents,
  unregisterToolTipInputModeEvents,
  registerNavigationInputModeEvents,
  unregisterNavigationInputModeEvents,
  registerClickInputModeEvents,
  unregisterClickInputModeEvents,
  registerHandleInputModeEvents,
  unregisterHandleInputModeEvents,
  registerMoveViewportInputModeEvents,
  unregisterMoveViewportInputModeEvents,
  registerCreateEdgeInputModeEvents,
  unregisterCreateEdgeInputModeEvents,
  registerSelectionEvents,
  unregisterSelectionEvents,
  registerUndoEvents,
  unregisterUndoEvents
}

/**
 * Invoked when the display has to be invalidated.
 */
function onDisplaysInvalidated(args, sender) {
  log(sender, 'Displays Invalidated')
}

/**
 * Invoked when the port of an edge changes.
 */
function onEdgePortsChanged(args, sender) {
  logWithType(sender, `Edge Ports Changed: ${args.item}`, 'EdgePortsChanged')
}

/**
 * Invoked when the style of an edge changes.
 */
function onEdgeStyleChanged(args, sender) {
  logWithType(sender, `Edge Style Changed: ${args.item}`, 'EdgeStyleChanged')
}

/**
 * Invoked when the tag of an edge changes.
 */
function onEdgeTagChanged(args, sender) {
  logWithType(sender, `Edge Tag Changed: ${args.item}`, 'EdgeTagChanged')
}

/**
 * Invoked when an edge has been created.
 */
function onEdgeCreated(args, sender) {
  logWithType(sender, `Edge Created: ${args.item}`, 'EdgeCreated')
}

/**
 * Invoked when an edge has been removed.
 */
function onEdgeRemoved(args, sender) {
  logWithType(sender, `Edge Removed: ${args.item}`, 'EdgeRemoved')
}

/**
 * Invoked when a label has been added.
 */
function onLabelAdded(args, sender) {
  logWithType(sender, `Label Added: ${args.item}`, 'LabelAdded')
}

/**
 * Invoked when a label has been added.
 */
function onLabelPreferredSizeChanged(args, sender) {
  logWithType(sender, `Label Preferred Size Changed: ${args.item}`, 'LabelPreferredSizeChanged')
}

/**
 * Invoked when the parameter of a label has changed.
 */
function onLabelLayoutParameterChanged(args, sender) {
  logWithType(sender, `Label Layout Parameter Changed: ${args.item}`, 'LabelLayoutParameterChanged')
}

/**
 * Invoked when the style of a label has changed.
 */
function onLabelStyleChanged(args, sender) {
  logWithType(sender, `Label Style Changed: ${args.item}`, 'LabelStyleChanged')
}

/**
 * Invoked when the tag of a label has changed.
 */
function onLabelTagChanged(args, sender) {
  logWithType(sender, `Label Tag Changed: ${args.item}`, 'LabelTagChanged')
}

/**
 * Invoked when the text of a label has changed.
 */
function onLabelTextChanged(args, sender) {
  logWithType(sender, `Label Text Changed: ${args.item}`, 'LabelTextChanged')
}

/**
 * Invoked when the text of a label has been removed.
 */
function onLabelRemoved(args, sender) {
  logWithType(sender, `Label Removed: ${args.item}`, 'LabelRemoved')
}

/**
 * Invoked when the layout of a node has changed.
 */
function onNodeLayoutChanged(node, oldLayout, sender) {
  logWithType(sender, `Node Layout Changed: ${node}`, 'NodeLayoutChanged')
}

/**
 * Invoked when the style of a node has changed.
 */
function onNodeStyleChanged(args, sender) {
  logWithType(sender, `Node Style Changed: ${args.item}`, 'NodeStyleChanged')
}

/**
 * Invoked when the tag of a node has changed.
 */
function onNodeTagChanged(args, sender) {
  logWithType(sender, `Node Tag Changed: ${args.item}`, 'NodeTagChanged')
}

/**
 * Invoked when a node has been created.
 */
function onNodeCreated(args, sender) {
  logWithType(sender, `Node Created: ${args.item}`, 'NodeCreated')
}

/**
 * Invoked when a node has been removed.
 */
function onNodeRemoved(args, sender) {
  logWithType(sender, `Node Removed: ${args.item}`, 'NodeRemoved')
}

/**
 * Invoked when a port has been added.
 */
function onPortAdded(args, sender) {
  logWithType(sender, `Port Added: ${args.item}`, 'PortAdded')
}

/**
 * Invoked when the location parameter of a port has changed.
 */
function onPortLocationParameterChanged(args, sender) {
  logWithType(
    sender,
    `Port Location Parameter Changed: ${args.item}`,
    'PortLocationParameterChanged'
  )
}

/**
 * Invoked when the style of a port has changed.
 */
function onPortStyleChanged(args, sender) {
  logWithType(sender, `Port Style Changed: ${args.item}`, 'PortStyleChanged')
}

/**
 * Invoked when the tag of a port has changed.
 */
function onPortTagChanged(args, sender) {
  logWithType(sender, `Port Tag Changed: ${args.item}`, 'PortTagChanged')
}

/**
 * Invoked when a port has been removed.
 */
function onPortRemoved(args, sender) {
  logWithType(sender, `Port Removed: ${args.item}`, 'PortRemoved')
}

/**
 * Invoked when a bend has been added.
 */
function onBendAdded(args, sender) {
  logWithType(sender, `Bend Added: ${args.item}`, 'BendAdded')
}

/**
 * Invoked when the location of a bend has changed.
 */
function onBendLocationChanged(bend, oldLocation, sender) {
  logWithType(sender, `Bend Location Changed: ${bend}`, 'BendLocationChanged')
}

/**
 * Invoked when the tag of a bend has changed.
 */
function onBendTagChanged(args, sender) {
  logWithType(sender, `Bend Tag Changed: ${args.item}`, 'BendTagChanged')
}

/**
 * Invoked when a bend has been removed.
 */
function onBendRemoved(args, sender) {
  logWithType(sender, `Bend Removed: ${args.item}`, 'BendRemoved')
}

/**
 * Invoked when the parent of a node has changed.
 */
function onParentChanged(args, sender) {
  logWithType(
    sender,
    `Parent Changed: ${args.parent} -> ${graphComponent.graph.getParent(args.item)}`,
    'ParentChanged'
  )
}

/**
 * Invoked when the group node status of a node has changed.
 */
function onIsGroupNodeChanged(args, sender) {
  logWithType(sender, `Group State Changed: ${args.isGroupNode}`, 'IsGroupNodeChanged')
}

/**
 * Invoked when a group has been collapsed.
 */
function onGroupCollapsed(args, sender) {
  logWithType(sender, `Group Collapsed: ${args.item}`, 'GroupCollapsed')
}

/**
 * Invoked when a group has been expanded.
 */
function onGroupExpanded(args, sender) {
  logWithType(sender, `Group Expanded: ${args.item}`, 'GroupExpanded')
}

/**
 * Invoked when a property has changed.
 * @param args An object that contains the event data
 * @param view The source of the event
 */
function onPropertyChanged(args, view) {
  logWithType(view, `Property Changed: ${args.propertyName}`, 'PropertyChanged')
}

/**
 * Invoked when the entire graph has been copied to clipboard.
 */
function clipboardOnGraphCopiedToClipboard(args, sender) {
  log(sender, 'Graph Copied to Clipboard')
}

/**
 * Invoked when a node has been copied to clipboard.
 */
function clipboardOnNodeCopiedToClipboard(args, sender) {
  log(sender, 'Graph Item Copied to Clipboard')
}

/**
 * Invoked when an edge has been copied to clipboard.
 */
function clipboardOnEdgeCopiedToClipboard(args, sender) {
  log(sender, 'Graph Item Copied to Clipboard')
}

/**
 * Invoked when a port has been copied to clipboard.
 */
function clipboardOnPortCopiedToClipboard(args, sender) {
  log(sender, 'Graph Item Copied to Clipboard')
}

/**
 * Invoked when a label has been copied to clipboard.
 */
function clipboardOnLabelCopiedToClipboard(args, sender) {
  log(sender, 'Graph Item Copied to Clipboard')
}

/**
 * Invoked when a style has been copied to clipboard.
 */
function clipboardOnObjectCopiedToClipboard(args, sender) {
  log(sender, 'Object Copied to Clipboard')
}

/**
 * Invoked when the entire graph has been copied from the clipboard.
 */
function clipboardOnGraphCopiedFromClipboard(args, sender) {
  log(sender, 'Graph Copied From Clipboard')
}

/**
 * Invoked when a node has been copied from the clipboard.
 */
function clipboardOnNodeCopiedFromClipboard(args, sender) {
  log(sender, 'Graph Item Copied to Clipboard')
}

/**
 * Invoked when an edge has been copied from the clipboard.
 */
function clipboardOnEdgeCopiedFromClipboard(args, sender) {
  log(sender, 'Graph Item Copied to Clipboard')
}

/**
 * Invoked when a port has been copied from the clipboard.
 */
function clipboardOnPortCopiedFromClipboard(args, sender) {
  log(sender, 'Graph Item Copied to Clipboard')
}

/**
 * Invoked when a label has been copied from the clipboard.
 */
function clipboardOnLabelCopiedFromClipboard(args, sender) {
  log(sender, 'Graph Item Copied to Clipboard')
}

/**
 * Invoked when a style has been copied from the clipboard.
 */
function clipboardOnObjectCopiedFromClipboard(args, sender) {
  log(sender, 'Object Copied From Clipboard')
}

/**
 * Invoked when the entire graph has been duplicated.
 */
function clipboardOnGraphDuplicated(args, sender) {
  log(sender, 'Graph Duplicated')
}

/**
 * Invoked when a node has been duplicated.
 */
function clipboardOnNodeDuplicated(args, sender) {
  log(sender, 'Graph Item Duplicated')
}

/**
 * Invoked when an edge has been duplicated.
 */
function clipboardOnEdgeDuplicated(args, sender) {
  log(sender, 'Graph Item Duplicated')
}

/**
 * Invoked when a port has been duplicated.
 */
function clipboardOnPortDuplicated(args, sender) {
  log(sender, 'Graph Item Duplicated')
}

/**
 * Invoked when a label has been duplicated.
 */
function clipboardOnLabelDuplicated(args, sender) {
  log(sender, 'Graph Item Duplicated')
}

/**
 * Invoked when a style has been duplicated.
 */
function clipboardOnObjectDuplicated(args, sender) {
  log(sender, 'Object Duplicated')
}

/**
 * Invoked before a clipboard copy operation starts.
 */
function clipboardOnItemsCopying(args, sender) {
  log(sender, 'Items Copying')
}

/**
 * Invoked after a clipboard copy operation has finished.
 */
function clipboardOnItemsCopied(args, sender) {
  log(sender, 'Items Copied')
}

/**
 * Invoked before a clipboard cut operation starts.
 */
function clipboardOnItemsCutting(args, sender) {
  log(sender, 'Items Cutting')
}

/**
 * Invoked after a clipboard cut operation has finished.
 */
function clipboardOnItemsCut(args, sender) {
  log(sender, 'Items Cut')
}

/**
 * Invoked before a clipboard paste operation starts.
 */
function clipboardOnItemsPasting(args, sender) {
  log(sender, 'Items Pasting')
}

/**
 * Invoked after a clipboard paste operation has finished.
 */
function clipboardOnItemsPasted(args, sender) {
  log(sender, 'Items Pasted')
}

/**
 * Invoked before a clipboard duplicate operation starts.
 */
function clipboardOnItemsDuplicating(args, sender) {
  log(sender, 'Items Duplicating')
}

/**
 * Invoked after a clipboard duplicate operation has finished.
 */
function clipboardOnItemsDuplicated(args, sender) {
  log(sender, 'Items Duplicated')
}

/**
 * Invoked when the currentItem property has changed its value
 */
function componentOnCurrentItemChanged(args, sender) {
  log(sender, 'GraphComponent CurrentItemChanged')
}

/**
 * Invoked when keys are being pressed, i.e. keydown.
 */
function componentOnKeyDown(args, sender) {
  const modifierText = getModifierText(args)
  logWithType(
    sender,
    `GraphComponent KeyDown: ${args.key}${modifierText.length > 0 ? ` (modifiers: ${modifierText})` : ''}`,
    'GraphComponentKeyDown'
  )
}

/**
 * Invoked when keys are being released, i.e. keyup.
 */
function componentOnKeyUp(args, sender) {
  const modifierText = getModifierText(args)
  logWithType(
    sender,
    `GraphComponent KeyUp: ${args.key}${modifierText.length > 0 ? ` (modifiers: ${modifierText})` : ''}`,
    'GraphComponentKeyUp'
  )
}

/**
 * Invoked when the user clicked the pointer.
 */
function componentOnPointerClick(args, sender) {
  log(sender, `GraphComponent PointerClick, clicks: ${args.clickCount}`)
}

/**
 * Invoked when the pointer is being moved while at least one of the pointer buttons is pressed.
 */
function componentOnPointerDrag(args, sender) {
  log(sender, 'GraphComponent PointerDrag')
}

/**
 * Invoked when the pointer has entered the canvas.
 */
function componentOnPointerEnter(args, sender) {
  log(sender, 'GraphComponent PointerEnter')
}

/**
 * Invoked when the pointer has exited the canvas.
 */
function componentOnPointerLeave(args, sender) {
  log(sender, 'GraphComponent PointerLeave')
}

/**
 * Invoked when the pointer capture has been lost.
 */
function componentOnPointerLostCapture(args, sender) {
  log(sender, 'GraphComponent PointerLostCapture')
}

/**
 * Invoked when the pointer has been moved in world coordinates.
 */
function componentOnPointerMove(args, sender) {
  log(sender, 'GraphComponent PointerMove')
}

/**
 * Invoked when a pointer button has been pressed.
 */
function componentOnPointerDown(args, sender) {
  log(sender, 'GraphComponent PointerDown')
}

/**
 * Invoked when the pointer button has been released.
 */
function componentOnPointerUp(args, sender) {
  log(sender, 'GraphComponent PointerUp')
}

/**
 * Invoked when the pointer input has been canceled.
 */
function componentOnPointerCancel(args, sender) {
  log(sender, 'GraphComponent PointerCancel')
}

/**
 * Invoked when the mouse wheel has turned.
 */
function componentOnMouseWheelTurned(args, sender) {
  log(sender, 'GraphComponent MouseWheelTurned')
}

/**
 * Invoked when a long press gesture has been performed with a touch pointer.
 */
function componentOnPointerLongPress(args, sender) {
  log(sender, 'GraphComponent LongPress')
}

/**
 * Invoked when a long press gesture has been performed with a touch pointer.
 */
function componentOnPointerLongRest(args, sender) {
  log(sender, 'GraphComponent LongRest')
}

/**
 * Invoked before the visual tree is painted.
 */
function componentOnPrepareRenderContext(args, sender) {
  log(sender, 'GraphComponent PrepareRenderContext')
}

/**
 * Invoked after the visual tree has been updated.
 */
function componentOnUpdatedVisual(args, sender) {
  log(sender, 'GraphComponent UpdatedVisual')
}

/**
 * Invoked before the visual tree is updated.
 */
function componentOnUpdatingVisual(args, sender) {
  log(sender, 'GraphComponent UpdatingVisual')
}

/**
 * Invoked when the viewport property has been changed.
 */
function componentOnViewportChanged(args, sender) {
  log(sender, 'GraphComponent ViewportChanged')
}

/**
 * Invoked when the value of the zoom property has been changed.
 */
function componentOnZoomChanged(args, sender) {
  log(sender, 'GraphComponent ZoomChanged')
}

/**
 * Invoked when the empty canvas area has been clicked.
 */
function geimOnCanvasClicked(args, sender) {
  log(sender, 'GraphEditorInputMode CanvasClicked')
}

/**
 * Invoked when an item has been deleted interactively by this mode.
 */
function geimOnDeletedItem(args, sender) {
  log(sender, 'GraphEditorInputMode DeletedItem')
}

/**
 * Invoked just before the deleteSelection method has deleted the selection after all selected items have been
 * removed.
 */
function geimOnDeletedSelection(args, sender) {
  log(sender, 'GraphEditorInputMode DeletedSelection')
}

/**
 * Invoked just before the deleteSelection method starts its work and will be followed by any number of DeletedItem
 * events and finalized by a DeletedSelection event.
 */
function geimOnDeletingSelection(args, sender) {
  log(sender, 'GraphEditorInputMode DeletingSelection')
}

/**
 * Invoked when an item has been clicked.
 */
function geimOnItemClicked(args, sender) {
  log(sender, `GraphEditorInputMode ItemClicked ${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when an item has been double clicked.
 */
function geimOnItemDoubleClicked(args, sender) {
  log(sender, `GraphEditorInputMode ItemDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when an item has been left-clicked.
 */
function geimOnItemLeftClicked(args, sender) {
  log(sender, `GraphEditorInputMode ItemLeftClicked${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when an item has been left double-clicked.
 */
function geimOnItemLeftDoubleClicked(args, sender) {
  log(
    sender,
    `GraphEditorInputMode ItemLeftDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`
  )
}

/**
 * Invoked when an item has been right clicked.
 */
function geimOnItemRightClicked(args, sender) {
  log(sender, `GraphEditorInputMode ItemRightClicked${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when an item has been right double-clicked.
 */
function geimOnItemRightDoubleClicked(args, sender) {
  log(
    sender,
    `GraphEditorInputMode ItemRightDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`
  )
}

/**
 * Invoked when a label has been added.
 */
function geimOnLabelAdded(args, sender) {
  log(sender, 'GraphEditorInputMode LabelAdded')
}

/**
 * Invoked when the label text has been changed.
 */
function geimOnLabelEdited(args, sender) {
  log(sender, 'GraphEditorInputMode LabelEdited')
}

/**
 * Invoked when a single or multi select operation has been finished.
 */
function geimOnMultiSelectionFinished(args, sender) {
  log(sender, 'GraphEditorInputMode MultiSelectionFinished')
}

/**
 * Invoked when a single or multi select operation has been started.
 */
function geimOnMultiSelectionStarted(args, sender) {
  log(sender, 'GraphEditorInputMode MultiSelectionStarted')
}

/**
 * Invoked when this mode has created a node in response to user interaction.
 */
function geimOnNodeCreated(args, sender) {
  log(sender, 'GraphEditorInputMode NodeCreated')
}

/**
 * Invoked when a node has been reparented interactively.
 */
function geimOnNodeReparented(args, sender) {
  log(sender, 'GraphEditorInputMode NodeReparented')
}

/**
 * Invoked after an edge's source and/or target ports have been changed as the result of an input gesture.
 */
function geimOnEdgePortsChanged(args, sender) {
  const edge = args.item
  log(
    sender,
    `GraphEditorInputMode Edge ${edge} Ports Changed to ${edge.sourcePort}->${edge.targetPort}`
  )
}

/**
 * Invoked when the context menu over an item is about to be opened to determine the contents of the Menu.
 */
function geimOnPopulateItemContextMenu(args, sender) {
  log(
    sender,
    `GraphEditorInputMode PopulateItemContextMenu${args.handled ? '(Handled)' : '(Unhandled)'}`
  )
}

/**
 * Invoked when the pointer is hovering over an item to determine the tool tip to display.
 */
function geimOnQueryItemToolTip(args, sender) {
  log(sender, `GraphEditorInputMode QueryItemToolTip${args.handled ? '(Handled)' : '(Unhandled)'}`)
}

/**
 * Invoked when the empty canvas area has been clicked.
 */
function gvimOnCanvasClicked(args, sender) {
  log(sender, 'GraphViewerInputMode CanvasClicked')
}

/**
 * Invoked when an item has been clicked.
 */
function gvimOnItemClicked(args, sender) {
  log(sender, 'GraphViewerInputMode ItemClicked')
}

/**
 * Invoked when an item has been double-clicked.
 */
function gvimOnItemDoubleClicked(args, sender) {
  log(sender, 'GraphViewerInputMode ItemDoubleClicked')
}

/**
 * Invoked when an item has been left-clicked.
 */
function gvimOnItemLeftClicked(args, sender) {
  log(sender, 'GraphViewerInputMode ItemLeftClicked')
}

/**
 * Invoked when an item has been left double-clicked.
 */
function gvimOnItemLeftDoubleClicked(args, sender) {
  log(sender, 'GraphViewerInputMode ItemLeftDoubleClicked')
}

/**
 * Invoked when an item has been right-clicked.
 */
function gvimOnItemRightClicked(args, sender) {
  log(sender, 'GraphViewerInputMode ItemRightClicked')
}

/**
 * Invoked when an item has been right double-clicked.
 */
function gvimOnItemRightDoubleClicked(args, sender) {
  log(sender, 'GraphViewerInputMode ItemRightDoubleClicked')
}

/**
 * Invoked when a single or multi select operation has been finished.
 */
function gvimOnMultiSelectionFinished(args, sender) {
  log(sender, 'GraphViewerInputMode MultiSelectionFinished')
}

/**
 * Invoked when a single or multi select operation has been started.
 */
function gvimOnMultiSelectionStarted(args, sender) {
  log(sender, 'GraphViewerInputMode MultiSelectionStarted')
}

/**
 * Invoked when the context menu over an item is about to be opened to determine the contents of the Menu.
 */
function gvimOnPopulateItemContextMenu(args, sender) {
  log(sender, 'GraphViewerInputMode PopulateItemContextMenu')
}

/**
 * Invoked when the pointer is hovering over an item to determine the tool tip to display.
 */
function gvimOnQueryItemToolTip(args, sender) {
  log(sender, 'GraphViewerInputMode QueryItemToolTip')
}

/**
 * Invoked when the drag has been canceled.
 */
function moveInputModeOnDragCanceled(args, sender) {
  logWithType(sender, 'MoveInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked before the drag will be canceled.
 */
function moveInputModeOnDragCanceling(args, sender) {
  logWithType(sender, 'MoveInputMode DragCanceling', 'DragCanceling')
}

/**
 * Invoked once the drag has been finished.
 */
function moveInputModeOnDragFinished(args, sender) {
  logWithType(sender, 'MoveInputMode DragFinished', 'DragFinished')
}

/**
 * Invoked before the drag will be finished.
 */
function moveInputModeOnDragFinishing(args, sender) {
  logWithType(sender, `MoveInputMode DragFinishing${getAffectedItems(sender)}`, 'DragFinishing')
}

/**
 * Invoked at the end of every drag.
 */
function moveInputModeOnDragged(args, sender) {
  logWithType(sender, 'MoveInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag is starting.
 */
function moveInputModeOnDragging(args, sender) {
  logWithType(sender, 'MoveInputMode Dragging', 'Dragging')
}

/**
 * Invoked once the drag is initialized and has started.
 */
function moveInputModeOnDragStarted(args, sender) {
  logWithType(sender, `MoveInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
}

/**
 * Invoked once the drag is starting.
 */
function moveInputModeOnDragStarting(args, sender) {
  logWithType(sender, 'MoveInputMode DragStarting', 'DragStarting')
}

/**
 * Invoked when a drag is recognized for MoveInputMode.
 */
function moveInputModeOnQueryPositionHandler(args, sender) {
  log(sender, 'MoveInputMode QueryPositionHandler')
}

/**
 * Invoked when the drag operation is dropped.
 */
function itemInputModeOnDragDropped(args, sender) {
  logWithType(sender, `${getDropInputModeName(sender)} DragDropped`, 'DragDropped')
}

/**
 * Invoked when the drag operation enters the CanvasComponent.
 */
function itemInputModeOnDragEntered(args, sender) {
  logWithType(sender, `${getDropInputModeName(sender)} DragEntered`, 'DragEntered')
}

/**
 * Invoked when the drag operation leaves the CanvasComponent.
 */
function itemInputModeOnDragLeft(args, sender) {
  logWithType(sender, `${getDropInputModeName(sender)} DragLeft`, 'DragLeft')
}

/**
 * Invoked when the drag operation drags over the CanvasComponent.
 */
function itemInputModeOnDragOver(args, sender) {
  logWithType(sender, `${getDropInputModeName(sender)} DragOver`, 'DragOver')
}

/**
 * Invoked when a new item gets created by the drag operation.
 */
function itemInputModeOnItemCreated(args, sender) {
  logWithType(sender, `${getDropInputModeName(sender)} ItemCreated`, 'ItemCreated')
}

function getDropInputModeName(sender) {
  if (sender instanceof LabelDropInputMode) {
    return 'LabelDropInputMode'
  }
  return 'NodeDropInputMode'
}

/**
 * Invoked when the item that is being hovered over with the pointer changes.
 */
function itemHoverInputModeOnHoveredItemChanged(args, sender) {
  logWithType(
    sender,
    `HoverInputMode Item changed from ${args.oldItem} to ${args.item !== null ? args.item.toString() : 'null'}`,
    'HoveredItemChanged'
  )
}

/**
 * Invoked once a bend creation gesture has been recognized.
 */
function createBendInputModeOnBendCreated(args, sender) {
  log(sender, 'CreateBendInputMode Bend Created')
}

/**
 * Invoked when the drag on a bend has been canceled.
 */
function createBendInputModeOnDragCanceled(args, sender) {
  logWithType(sender, 'CreateBendInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked at the end of every drag on a bend.
 */
function createBendInputModeOnDragged(args, sender) {
  logWithType(sender, 'CreateBendInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag on a bend is starting.
 */
function createBendInputModeOnDragging(args, sender) {
  logWithType(sender, 'CreateBendInputMode Dragging', 'Dragging')
}

/**
 * Invoked when the context menu is about to be shown.
 */
function contextMenuInputModeOnPopulateMenu(args, sender) {
  log(sender, 'ContextMenuInputMode Populate Context Menu')
}

/**
 * Invoked if the editing has not been finished.
 */
function textEditorInputModeOnEditingCanceled(args, sender) {
  log(sender, 'TextEditorInputMode Editing Canceled')
}

/**
 * Invoked if the editing when text editing is started.
 */
function textEditorInputModeOnEditingStarted(args, sender) {
  log(sender, 'TextEditorInputMode Editing Started')
}

/**
 * Invoked once the text has been edited.
 */
function textEditorInputModeOnTextEdited(args, sender) {
  log(sender, 'TextEditorInputMode Text Edited')
}

/**
 * Invoked when this mode queries the tool tip for a certain query location.
 */
function toolTipInputModeOnQueryToolTip(args, sender) {
  log(sender, 'TooltipInputMode QueryToolTip')
}

/**
 * Invoked once a click has been detected.
 */
function clickInputModeOnClicked(args, sender) {
  const modifierText = getModifierText(args)
  const details = `buttons: ${PointerButtons[args.pointerButtons]}, clicks: ${args.clickCount}${modifierText.length > 0 ? `, modifiers: ${modifierText})` : ''}`
  log(sender, `ClickInputMode Clicked (${details})`)
}

/**
 * Invoked when the drag has been canceled.
 */
function handleInputModeOnDragCanceled(args, sender) {
  logWithType(sender, 'HandleInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked before the drag will be canceled.
 */
function handleInputModeOnDragCanceling(args, sender) {
  logWithType(sender, 'HandleInputMode DragCanceling', 'DragCanceling')
}

/**
 * Invoked once the drag has been finished.
 */
function handleInputModeOnDragFinished(args, sender) {
  logWithType(sender, 'HandleInputMode DragFinished', 'DragFinished')
}

/**
 * Invoked before the drag will be finished.
 */
function handleInputModeOnDragFinishing(args, sender) {
  logWithType(sender, `HandleInputMode DragFinishing${getAffectedItems(sender)}`, 'DragFinishing')
}

/**
 * Invoked at the end of every drag.
 */
function handleInputModeOnDragged(args, sender) {
  logWithType(sender, 'HandleInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag is starting.
 */
function handleInputModeOnDragging(args, sender) {
  logWithType(sender, 'HandleInputMode Dragging', 'Dragging')
}

/**
 * Invoked once the drag is initialized and has started.
 */
function handleInputModeOnDragStarted(args, sender) {
  logWithType(sender, `HandleInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
}

/**
 * Invoked once the drag is starting.
 */
function handleInputModeOnDragStarting(args, sender) {
  logWithType(sender, 'HandleInputMode DragStarting', 'DragStarting')
}

/**
 * Invoked when the drag has been canceled.
 */
function moveViewportInputModeOnDragCanceled(args, sender) {
  logWithType(sender, 'MoveViewportInputMode DragCanceled', 'DragCanceled')
}

/**
 * Invoked before the drag will be canceled.
 */
function moveViewportInputModeOnDragCanceling(args, sender) {
  logWithType(sender, 'MoveViewportInputMode DragCanceling', 'DragCanceling')
}

/**
 * Invoked once the drag has been finished.
 */
function moveViewportInputModeOnDragFinished(args, sender) {
  logWithType(sender, 'MoveViewportInputMode DragFinished', 'DragFinished')
}

/**
 * Invoked before the drag will be finished.
 */
function moveViewportInputModeOnDragFinishing(args, sender) {
  logWithType(sender, `MoveViewportInputMode DragFinishing`, 'DragFinishing')
}

/**
 * Invoked at the end of every drag.
 */
function moveViewportInputModeOnDragged(args, sender) {
  logWithType(sender, 'MoveViewportInputMode Dragged', 'Dragged')
}

/**
 * Invoked once the drag is starting.
 */
function moveViewportInputModeOnDragging(args, sender) {
  logWithType(sender, 'MoveViewportInputMode Dragging', 'Dragging')
}

/**
 * Invoked once the drag is initialized and has started.
 */
function moveViewportInputModeOnDragStarted(args, sender) {
  logWithType(sender, `MoveViewportInputMode DragStarted`, 'DragStarted')
}

/**
 * Invoked once the drag is starting.
 */
function moveViewportInputModeOnDragStarting(args, sender) {
  logWithType(sender, 'MoveViewportInputMode DragStarting', 'DragStarting')
}

/**
 * Invoked whenever a group has been collapsed.
 */
function navigationInputModeOnGroupCollapsed(args, sender) {
  logWithType(sender, `NavigationInputMode Group Collapsed: ${args.item}`, 'GroupCollapsed')
}

/**
 * Invoked before a group will be collapsed.
 */
function navigationInputModeOnGroupCollapsing(args, sender) {
  logWithType(sender, `NavigationInputMode Group Collapsing: ${args.item}`, 'Group Collapsing')
}

/**
 * Invoked whenever a group has been entered.
 */
function navigationInputModeOnGroupEntered(args, sender) {
  logWithType(sender, `NavigationInputMode Group Entered: ${args.item}`, 'Group Entered')
}

/**
 * Invoked before a group will be entered.
 */
function navigationInputModeOnGroupEntering(args, sender) {
  logWithType(sender, `NavigationInputMode Group Entering: ${args.item}`, 'Group Entering')
}

/**
 * Invoked whenever a group has been exited.
 */
function navigationInputModeOnGroupExited(args, sender) {
  logWithType(sender, `NavigationInputMode Group Exited: ${args.item}`, 'Group Exited')
}

/**
 * Invoked before a group will be exited.
 */
function navigationInputModeOnGroupExiting(args, sender) {
  logWithType(sender, `NavigationInputMode Group Exiting: ${args.item}`, 'Group Exiting')
}

/**
 * Invoked when a group has been expanded.
 */
function navigationInputModeOnGroupExpanded(args, sender) {
  logWithType(sender, `NavigationInputMode Group Expanded: ${args.item}`, 'Group Expanded')
}

/**
 * Invoked before a group has been expanded.
 */
function navigationInputModeOnGroupExpanding(args, sender) {
  logWithType(sender, `NavigationInputMode Group Expanding: ${args.item}`, 'Group Expanding')
}

/**
 * Invoked after an edge has been created by this mode.
 */
function createEdgeInputModeOnEdgeCreated(args, sender) {
  log(sender, 'CreateEdgeInputMode Edge Created')
}

/**
 * Invoked when the edge creation has started.
 */
function createEdgeInputModeOnEdgeCreationStarted(args, sender) {
  log(sender, 'CreateEdgeInputMode Edge Creation Started')
}

/**
 * Invoked when the edge creation gesture has been canceled.
 */
function createEdgeInputModeOnGestureCanceled(args, sender) {
  log(sender, 'CreateEdgeInputMode Gesture Canceled')
}

/**
 * Invoked before the gesture will be canceled.
 */
function createEdgeInputModeOnGestureCanceling(args, sender) {
  log(sender, 'CreateEdgeInputMode Gesture Canceling')
}

/**
 * Invoked once the gesture has been finished.
 */
function createEdgeInputModeOnGestureFinished(args, sender) {
  log(sender, 'CreateEdgeInputMode Gesture Finished')
}

/**
 * Invoked before the gesture will be finished.
 */
function createEdgeInputModeOnGestureFinishing(args, sender) {
  log(sender, 'CreateEdgeInputMode Gesture Finishing')
}

/**
 * Invoked once the gesture is initialized and has started.
 */
function createEdgeInputModeOnGestureStarted(args, sender) {
  log(sender, 'CreateEdgeInputMode Gesture Started')
}

/**
 * Invoked once the gesture is starting.
 */
function createEdgeInputModeOnGestureStarting(args, sender) {
  log(sender, 'CreateEdgeInputMode Gesture Starting')
}

/**
 * Invoked at the end of every drag or move.
 */
function createEdgeInputModeOnMoved(args, sender) {
  log(sender, 'CreateEdgeInputMode Moved')
}

/**
 * Invoked at the start of every drag or move.
 */
function createEdgeInputModeOnMoving(args, sender) {
  log(sender, 'CreateEdgeInputMode Moving')
}

/**
 * Invoked when this instance adds a port to the source or target node during completion of the edge creation gesture.
 */
function createEdgeInputModeOnPortAdded(args, sender) {
  log(sender, 'CreateEdgeInputMode Port Added')
}

/**
 * Invoked when an item changed its selection state from selected to unselected or vice versa.
 */
function onItemSelectionAdded(args, sender) {
  log(sender, 'GraphComponent Item Selection Added')
}

/**
 * Invoked when an item changed its selection state from selected to unselected or vice versa.
 */
function onItemSelectionRemoved(args, sender) {
  log(sender, 'GraphComponent Item Selection Removed')
}

/**
 * Invoked when a adding a new label is finished.
 */
function editLabelInputModeLabelAdded(args, sender) {
  log(sender, 'Label Added')
}

/**
 * Invoked when a removing a label is finished.
 */
function editLabelInputModeLabelDeleted(args, sender) {
  log(sender, 'Label Deleted')
}

/**
 * Invoked when the label editing process is finished.
 */
function editLabelInputModeLabelEdited(args, sender) {
  log(sender, 'Label Edited')
}

/**
 * Invoked when the label editing process is canceled.
 */
function editLabelInputModeLabelEditingCanceled(args, sender) {
  log(sender, 'Label Text Editing Canceled')
}

/**
 * Invoked when the label editing process is started.
 */
function editLabelInputModeLabelEditingStarted(args, sender) {
  log(sender, 'Label Text Editing Started')
}

/**
 * Invoked when a label is about to be added.
 */
function editLabelInputModeOnQueryLabelAdding(args, sender) {
  log(sender, 'Query Label Adding')
}

/**
 * Invoked when the label editing process is about to be started.
 */
function editLabelInputModeOnQueryLabelEditing(args, sender) {
  log(sender, 'Query Label Editing')
}

/**
 * Invoked when a label that is about to be added or edited.
 */
function editLabelInputModeOnQueryValidateLabelText(args, sender) {
  log(sender, 'Validate Label Text')
}

/**
 * Invoked when the value of the {@link UndoEngine.canUndo}, {@link UndoEngine.canRedo},
 * {@link UndoEngine.undoName}, {@link UndoEngine.redoName}, or {@link UndoEngine.token}
 * property changes.
 */
function undoEngineOnPropertyChanged(args, sender) {
  log(sender, `UndoEngine Property Changed: ${args.propertyName}`)
}

/**
 * Invoked when the undo engine undoes an edit in its queue.
 */
function undoEngineOnUnitUndone(args, sender) {
  log(sender, 'Undo performed')
}

/**
 * Invoked when the undo engine redoes a previously undone edit.
 */
function undoEngineOnUnitRedone(args, sender) {
  log(sender, 'Redo performed')
}

function getModifierText(args) {
  return args.modifiers !== 0
    ? `${args.shiftKey ? ' Shift' : ''}${args.ctrlKey ? ' Control' : ''}${args.altKey ? ' Alt' : ''}${args.metaKey ? ' Meta' : ''}`
    : ''
}

function clearButtonClick() {
  eventView.clear()
}

/**
 * Creates the log message without type.
 */
function log(sender, message) {
  logWithType(sender, message, null)
}

/**
 * Creates the log message with the given type.
 */
function logWithType(sender, message, type) {
  if (!type) {
    type = message
  }

  let category = 'Unknown'
  if (sender instanceof IInputMode) {
    category = 'InputMode'
  } else if (sender instanceof CanvasComponent || sender instanceof GraphClipboard) {
    category = 'GraphComponent'
  } else if (
    sender instanceof IModelItem ||
    sender instanceof IGraph ||
    sender instanceof IFoldingView ||
    sender instanceof UndoEngine
  ) {
    category = 'Graph'
  }

  eventView.addMessage(message, type, category)
}

function initializeGraphComponent() {
  graphComponent = new GraphComponent('graphComponent')
}

function initializeInputModes() {
  editorMode = new GraphEditorInputMode()
  editorMode.itemHoverInputMode.hoverItems = GraphItemTypes.ALL
  editorMode.nodeDropInputMode.enabled = true
  editorMode.labelDropInputMode.enabled = true
  editorMode.labelDropInputMode.useLocationForParameter = true
  // initially, we want to disable editing orthogonal edges altogether
  editorMode.orthogonalEdgeEditingContext.enabled = false

  viewerMode = new GraphViewerInputMode()
  viewerMode.itemHoverInputMode.hoverItems = GraphItemTypes.ALL

  graphComponent.inputMode = editorMode

  // use two finger panning to allow easier editing with touch gestures
  configureTwoPointerPanning(graphComponent)
}

function initializeGraph() {
  const graph = graphComponent.graph
  initDemoStyles(graph, { foldingEnabled: true, orthogonalEditing: true })
  graph.nodeDefaults.size = new Size(60, 40)
  graph.edgeDefaults.labels.style = new LabelStyle({
    backgroundFill: 'white',
    padding: [3, 5, 3, 5]
  })
}

function initializeDragAndDropPanel() {
  const panel = document.getElementById('drag-and-drop-panel')
  panel.appendChild(createDraggableNode())
  panel.appendChild(createDraggableLabel())
}

function createDraggableNode() {
  // create the node visual
  const exportComponent = new GraphComponent()
  exportComponent.graph.createNode(new Rect(0, 0, 30, 30), graphComponent.graph.nodeDefaults.style)
  exportComponent.updateContentBounds()
  const svgExport = new SvgExport(exportComponent.contentBounds)
  const dataUrl = SvgExport.encodeSvgDataUrl(
    SvgExport.exportSvgString(svgExport.exportSvg(exportComponent))
  )
  const div = document.createElement('div')
  div.setAttribute('style', 'width: 30px; height: 30px; margin: 0 10px; touch-action: none;')
  div.setAttribute('title', 'Draggable Node')
  const img = document.createElement('img')
  img.setAttribute('style', 'width: auto; height: auto;')
  img.setAttribute('src', dataUrl)
  div.appendChild(img)

  // register the startDrag listener
  const startDrag = () => {
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
      dragPreview
    )
    dragSource.addEventListener('query-continue-drag', (evt) => {
      if (evt.dropTarget === null) {
        dragPreview.classList.remove('hidden')
      } else {
        dragPreview.classList.add('hidden')
      }
    })
  }

  img.addEventListener(
    'pointerdown',
    (event) => {
      startDrag()
      event.preventDefault()
    },
    false
  )

  return div
}

function createDraggableLabel() {
  // create the label visual
  const defaultLabelParameter = graphComponent.graph.nodeDefaults.labels.layoutParameter
  const defaultLabelStyle = graphComponent.graph.nodeDefaults.labels.style
  const exportComponent = new GraphComponent()
  const dummyNode = exportComponent.graph.createNode(
    new Rect(0, 0, 30, 30),
    INodeStyle.VOID_NODE_STYLE
  )
  exportComponent.graph.addLabel(dummyNode, 'Label', defaultLabelParameter, defaultLabelStyle)
  exportComponent.contentBounds = new Rect(0, 0, 30, 30)
  const svgExport = new SvgExport(exportComponent.contentBounds)
  const dataUrl = SvgExport.encodeSvgDataUrl(
    SvgExport.exportSvgString(svgExport.exportSvg(exportComponent))
  )
  const div = document.createElement('div')
  div.setAttribute('style', 'width: 30px; height: 30px; margin: 0 10px; touch-action: none;')
  div.setAttribute('title', 'Draggable Label')
  const img = document.createElement('img')
  img.setAttribute('style', 'width: auto; height: auto;')
  img.setAttribute('src', dataUrl)
  div.appendChild(img)

  // register the startDrag listener
  const startDrag = () => {
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
      dragPreview
    )
    dragSource.addEventListener('query-continue-drag', (evt) => {
      if (evt.dropTarget === null) {
        dragPreview.classList.remove('hidden')
      } else {
        dragPreview.classList.add('hidden')
      }
    })
  }

  img.addEventListener(
    'pointerdown',
    (event) => {
      startDrag()
      event.preventDefault()
    },
    false
  )

  return div
}

function setupToolTips() {
  editorMode.toolTipItems = GraphItemTypes.NODE
  editorMode.addEventListener('query-item-tool-tip', (evt) => {
    evt.toolTip = `ToolTip for ${evt.item}`
    evt.handled = true
  })

  viewerMode.toolTipItems = GraphItemTypes.NODE
  viewerMode.addEventListener('query-item-tool-tip', (evt) => {
    evt.toolTip = `ToolTip for ${evt.item}`
    evt.handled = true
  })
}

function setupContextMenu() {
  editorMode.contextMenuItems = GraphItemTypes.NODE
  viewerMode.contextMenuItems = GraphItemTypes.NODE
  const listener = (evt) => {
    console.log('Menu')
    evt.contextMenu = [
      {
        label: 'Context Menu Action',
        action: () => log(editorMode.contextMenuInputMode, 'Context Menu Item Action')
      }
    ]
    evt.handled = true
  }
  editorMode.addEventListener('populate-item-context-menu', listener)
  viewerMode.addEventListener('populate-item-context-menu', listener)
}

function enableFolding() {
  const graph = graphComponent.graph

  // enabled changing ports
  const decorator = graph.decorator.edges.reconnectionPortCandidateProvider
  decorator.addFactory((edge) =>
    IEdgeReconnectionPortCandidateProvider.fromAllNodeAndEdgeCandidates(edge)
  )

  manager = new FoldingManager(graph)
  foldingView = manager.createFoldingView()
  graphComponent.graph = foldingView.graph
}

function enableUndo() {
  const defaultGraph = manager.masterGraph
  if (defaultGraph !== null) {
    defaultGraph.undoEngineEnabled = true
  }
}

/**
 * Binds all event-check-boxes to the appropriate functions
 */
function bindEventCheckBoxes() {
  const elements = document.querySelectorAll("input[data-action='ToggleEvents']")
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]

    element.addEventListener('click', (_) => {
      const eventKind = element.getAttribute('data-event-kind')
      if (eventKind) {
        const enable = element.checked
        const fn = enable
          ? eventRegistration[`register${eventKind}Events`]
          : eventRegistration[`unregister${eventKind}Events`]
        if (typeof fn === 'function') {
          fn()
        } else if (typeof window.console !== 'undefined') {
          console.log(`NOT FOUND: ${eventKind}`)
        }
      }
    })
  }
}

function initializeUI() {
  bindEventCheckBoxes()

  document.querySelector('#toggle-editing').addEventListener('click', () => {
    if (graphComponent.inputMode === editorMode) {
      graphComponent.inputMode = viewerMode
    } else {
      graphComponent.inputMode = editorMode
    }
  })

  const orthogonalEditingButton = document.querySelector('#demo-orthogonal-editing-button')
  orthogonalEditingButton.addEventListener('click', () => {
    editorMode.orthogonalEdgeEditingContext.enabled = orthogonalEditingButton.checked
  })

  document.querySelector('#clear-log-button').addEventListener('click', () => clearButtonClick())

  const toggleLogGrouping = document.querySelector('#toggle-log-grouping')
  toggleLogGrouping.addEventListener('click', () => {
    eventView.groupEvents = toggleLogGrouping.checked
  })
}

/**
 * The GraphComponent
 */
let graphComponent

/**
 * Returns the number of affected items as string.
 */
function getAffectedItems(sender) {
  const items = sender.affectedItems

  const nodeCount = items.ofType(INode).size
  const edgeCount = items.ofType(IEdge).size
  const bendCount = items.ofType(IBend).size
  const labelCount = items.ofType(ILabel).size
  const portCount = items.ofType(IPort).size
  return (
    `(${items.size} items: ${nodeCount} nodes, ${bendCount} bends, ${edgeCount} edges,` +
    ` ${labelCount} labels, ${portCount} ports)`
  )
}

/**
 * Initialize expand-collapse behavior for option headings.
 */
function initOptionHeadings() {
  const optionsHeadings = document.getElementsByClassName('event-options-heading')
  for (let i = 0; i < optionsHeadings.length; i++) {
    const heading = optionsHeadings[i]
    optionsHeadings[i].addEventListener('click', (e) => {
      e.preventDefault()
      const parentNode = heading.parentNode
      const optionsElements = parentNode.getElementsByClassName('event-options-content')
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
    heading.addEventListener('click', (evt) => {
      if (evt.target instanceof HTMLDivElement) {
        evt.target.scrollIntoView()
      }
    })
  }
}

run().then(finishLoading)
