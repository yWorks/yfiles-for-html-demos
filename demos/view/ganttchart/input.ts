/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AdjustContentBoundsPolicy,
  type CanvasComponent,
  type CreateEdgeInputMode,
  EventRecognizers,
  type GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphSnapContext,
  GridConstraintProvider,
  GridInfo,
  GridSnappableItems,
  GridSnapTypes,
  HandleInputMode,
  type HoveredItemChangedEventArgs,
  IEdge,
  type IHandle,
  INode,
  LabelEventArgs,
  NodeEventArgs,
  Point,
  ShowPortCandidates,
  SnappableItems
} from '@yfiles/yfiles'
import { hideActivityInfo, hideInfo, showActivityInfo, showInfo } from './info-panel'
import { ganttDayWidth, getDate } from './gantt-utils'
import { TimeHandle, TimeHandleRenderer } from './activity-node/ActivityNodeHandleProvider'
import { ganttActivityHeight } from './sweepline-layout'
import { CreateActivityInputMode } from './CreateActivityInputMode'
import { getActivity } from './resources/data-model'

/**
 * Creates and configures an input mode for the interaction.
 */
export function configureInteraction(
  graphComponent: GraphComponent,
  modelChangedCallback: () => Promise<void>
): void {
  // create and configure the new editor mode
  const graphEditorInputMode = new GraphEditorInputMode({
    allowCreateBend: false,
    allowCreateNode: false,
    showHandleItems: GraphItemTypes.NODE,
    adjustContentBoundsPolicy: AdjustContentBoundsPolicy.NEVER,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    clickHitTestOrder: [GraphItemTypes.NODE, GraphItemTypes.EDGE],
    marqueeSelectableItems: GraphItemTypes.NONE,
    createEdgeInputMode: { startOverCandidateOnly: false }
  })

  // configure an input mode that moves unselected nodes
  configureNodeMovement(graphEditorInputMode, modelChangedCallback)

  // enable the node/edge highlighting on hover
  enableHighlighting(graphEditorInputMode)

  // enable and configure snapping to grid for the nodes
  initializeGridSnapping(graphEditorInputMode)

  // initializes an input mode to handle drag operations and perform the necessary
  // updates on the background and tasks component
  initializeNodeDragging(graphEditorInputMode, modelChangedCallback)

  // add an input mode for creating new activity nodes on drag
  configureActivityNodeCreation(graphEditorInputMode, modelChangedCallback)

  // update the activity data information when the label changes
  graphEditorInputMode.editLabelInputMode.addEventListener('label-edited', (evt) => {
    const owner = evt.item.owner
    if (owner instanceof INode) {
      getActivity(owner).name = evt.item.text
    }
  })
  graphEditorInputMode.addEventListener('label-added', (evt) => {
    const owner = evt.item.owner
    if (owner instanceof INode) {
      getActivity(owner).name = evt.item.text
    }
  })

  graphEditorInputMode.addEventListener('deleted-item', async (evt) => {
    if (evt.details instanceof NodeEventArgs) {
      await modelChangedCallback()
      hideActivityInfo()
    } else if (evt.details instanceof LabelEventArgs && evt.details.owner instanceof INode) {
      getActivity(evt.details.owner).name = ''
    }
  })

  graphEditorInputMode.addEventListener('item-left-clicked', (evt, inputMode) => {
    if (evt.item instanceof INode) {
      showActivityInfo(getActivity(evt.item), evt.item.layout.center, inputMode.graphComponent!)
    } else {
      hideActivityInfo()
    }
  })

  // on click on the empty space, hide the node info popup
  graphEditorInputMode.addEventListener('canvas-clicked', () => hideActivityInfo())

  // hide the node popup if the label is being edited
  graphEditorInputMode.editLabelInputMode.textEditorInputMode.addEventListener(
    'editing-started',
    () => hideActivityInfo()
  )

  // Use a different look for the handles that change the lead/follow-up time of activities
  graphEditorInputMode.handleInputMode.handlesRenderer = new TimeHandleRenderer()

  // configure an edge input mode to create edges on shift + left mouse button
  enableCreateEdgeOnShift(graphEditorInputMode.createEdgeInputMode)

  // assign editor input mode
  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Configures the hover input mode responsible for highlighting activity nodes or dependencies.
 */
function enableHighlighting(graphEditorInputMode: GraphEditorInputMode): void {
  // configure node and edge highlights on hover
  graphEditorInputMode.itemHoverInputMode.enabled = true
  graphEditorInputMode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE | GraphItemTypes.NODE
  graphEditorInputMode.itemHoverInputMode.addEventListener('hovered-item-changed', updateHighlights)
}

/**
 * Creates a HandleInputMode that manages the node drag operations.
 */
function initializeNodeDragging(
  graphEditorInputMode: GraphEditorInputMode,
  modelChangedCallback: () => Promise<void>
): void {
  // create the customized input mode
  const handleInputMode = new HandleInputMode()

  handleInputMode.addEventListener('drag-started', (evt) => {
    hideActivityInfo()
    showInfoBox(handleInputMode.currentHandle!, evt.context.canvasComponent!)
  })

  handleInputMode.addEventListener('dragged', (evt) => {
    showInfoBox(handleInputMode.currentHandle!, evt.context.canvasComponent!)
  })

  // apply the graph modifications when a handle has been dragged
  handleInputMode.addEventListener('drag-finished', async () => {
    hideInfo()
    await modelChangedCallback()
  })

  handleInputMode.addEventListener('drag-canceled', () => hideInfo())

  graphEditorInputMode.handleInputMode = handleInputMode
}

/**
 * Creates an input mode that allows for creating new activity nodes on mouse-drag.
 */
function configureActivityNodeCreation(
  graphEditorInputMode: GraphEditorInputMode,
  modelChangedCallback: () => Promise<void>
): void {
  // create the customized input mode
  const createActivityInputMode = new CreateActivityInputMode()
  createActivityInputMode.addEventListener('drag-started', () => hideActivityInfo())
  createActivityInputMode.addEventListener(
    'drag-finished',
    async () => await modelChangedCallback()
  )

  // add the input mode with the same priority as MarqueeSelectionInputMode
  createActivityInputMode.priority = graphEditorInputMode.marqueeSelectionInputMode.priority
  graphEditorInputMode.add(createActivityInputMode)
}

/**
 * Initializes the node snapping feature so that a vertical grid is created and
 * the nodes are snapped based on their timestamp (in hours).
 */
function initializeGridSnapping(graphEditorInputMode: GraphEditorInputMode): void {
  // install a grid to enable snapping to hours
  const gridInfo = new GridInfo(ganttDayWidth)

  graphEditorInputMode.snapContext = new GraphSnapContext({
    snappableItems: SnappableItems.NONE,
    gridSnappableItems: GridSnappableItems.NODE,
    gridSnapType: GridSnapTypes.VERTICAL_LINES,
    visualizeSnapResults: false,
    nodeGridConstraintProvider: new GridConstraintProvider(gridInfo)
  })
}

/**
 * Configures an edge input mode that allows the edge creation on shift + left mouse button.
 */
function enableCreateEdgeOnShift(createEdgeInputMode: CreateEdgeInputMode): void {
  // start the edge creation on shift + left mouse button
  createEdgeInputMode.beginRecognizer = (eventSource, evt) =>
    EventRecognizers.MOUSE_DOWN(eventSource, evt) &&
    EventRecognizers.SHIFT_IS_DOWN(eventSource, evt)

  // configure edge creation
  createEdgeInputMode.allowSelfLoops = false
  createEdgeInputMode.allowCreateBend = false
  createEdgeInputMode.forceSnapToCandidate = true
  createEdgeInputMode.showPortCandidates = ShowPortCandidates.END
  // only allow edges to connect to explicit candidates to make sure edges only connect to the correct side of a
  // node
  createEdgeInputMode.useHitItemsCandidatesOnly = true

  createEdgeInputMode.enforceBendCreationRecognizer = EventRecognizers.NEVER
  createEdgeInputMode.portCandidateResolutionRecognizer = EventRecognizers.NEVER
  createEdgeInputMode.directionalConstraintRecognizer = EventRecognizers.NEVER
}

/**
 * Shows an info box at the position of the given handle.
 * @param handle The handle to show the info box for.
 * @param canvasComponent The CanvasComponent the info box is shown in.
 */
function showInfoBox(handle: IHandle, canvasComponent: CanvasComponent): void {
  const location = handle.location.toPoint()
  let text: string
  if (handle instanceof TimeHandle) {
    const duration = handle.getDuration()
    const label = handle.isFollowUpTime ? 'Follow-up Time' : 'Lead Time'
    text = `${label}: ${duration} h`
  } else {
    text = getDate(location.x).format()
  }

  // We can calculate the position, since we know that the handle is always positioned at the node's center.
  showInfo(text, new Point(location.x, location.y - ganttActivityHeight / 2), canvasComponent)
}

/**
 * Updates the highlighted nodes and edges when the mouse is moved over a
 * node or an edge.
 */
function updateHighlights(evt: HoveredItemChangedEventArgs): void {
  const highlights = (evt.context!.canvasComponent as GraphComponent).highlights

  // remove previous highlights
  highlights.clear()
  const item = evt.item

  if (item === null) {
    return
  }
  highlights.add(item)
  if (item instanceof INode) {
    // highlight dependencies and their activities
    evt.context!.graph!.inEdgesAt(item).forEach((edge) => {
      highlights.add(edge)
      highlights.add(edge.sourceNode)
    })
  } else if (item instanceof IEdge) {
    // highlight the source and target activity
    highlights.add(item.sourceNode)
    highlights.add(item.targetNode)
  }
}

function configureNodeMovement(
  graphEditorInputMode: GraphEditorInputMode,
  modelChangedCallback: () => Promise<void>
): void {
  const moveSelectedItemsInputMode = graphEditorInputMode.moveSelectedItemsInputMode
  const moveUnselectedItemsInputMode = graphEditorInputMode.moveUnselectedItemsInputMode
  graphEditorInputMode.movableUnselectedItems = graphEditorInputMode.movableSelectedItems =
    GraphItemTypes.NODE

  moveUnselectedItemsInputMode.addEventListener('drag-started', hideActivityInfo)
  moveUnselectedItemsInputMode.addEventListener('drag-finished', modelChangedCallback)
  moveSelectedItemsInputMode.addEventListener('drag-started', hideActivityInfo)
  moveSelectedItemsInputMode.addEventListener('drag-finished', modelChangedCallback)
}
