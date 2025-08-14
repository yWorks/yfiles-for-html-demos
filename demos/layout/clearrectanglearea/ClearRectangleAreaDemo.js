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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ClearAreaStrategy,
  ComponentAssignmentStrategy,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HandleInputMode,
  HandlePositions,
  IHandle,
  IHitTestable,
  IHitTester,
  IInputModeContext,
  INode,
  InputModeContext,
  InputModeEventArgs,
  License,
  ModifierKeys,
  MoveInputMode,
  MultiplexingInputMode,
  MutableRectangle,
  ObservableCollection,
  Point,
  Rect,
  RectangleReshapeHandleProvider,
  Size
} from '@yfiles/yfiles'

import { ClearAreaLayoutHelper } from './ClearAreaLayoutHelper'
import { LayoutOptions } from './LayoutOptions'
import { RectanglePositionHandler } from './RectanglePositionHandler'

import SampleData from './resources/SampleData'
import { createDemoGroupStyle, initDemoStyles } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
import { RectangleRenderer } from '@yfiles/demo-utils/RectangleRenderer'

// UI components
const samplesComboBox = document.querySelector('#sample-graph-combobox')

const clearingStrategyComboBox = document.querySelector('#clearing-strategy-combobox')

const componentAssignmentStrategyComboBox = document.querySelector(
  '#component-assignment-strategy-combobox'
)

/**
 * The rectangular area used for clearing
 */
const clearRect = new MutableRectangle(0, 0, 100, 100)

/**
 * Options to control the layout behavior.
 */
const options = new LayoutOptions(
  ClearAreaStrategy.PRESERVE_SHAPES,
  ComponentAssignmentStrategy.SINGLE,
  false
)

/**
 * The group node we are currently inside.
 */
let groupNode

/**
 * Performs layout and animation while dragging the rectangle.
 */
let layoutHelper

/**
 * A  {@link IHitTester} to determine the group node we are currently hovering.
 */
let nodeHitTester

/**
 * The GraphComponent
 */
let graphComponent

/**
 * Runs the demo.
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  initializeUI()

  initializeInputModes()

  initializeGraph()
}

/**
 * Syncs combo box selected index with initially loaded sample and {@link options} set.
 * Also binds actions to toolbars.
 */
function initializeUI() {
  samplesComboBox.selectedIndex = 0
  clearingStrategyComboBox.selectedIndex = options.clearAreaStrategy.valueOf()
  componentAssignmentStrategyComboBox.selectedIndex = options.componentAssignmentStrategy.valueOf()

  addNavigationButtons(samplesComboBox).addEventListener('change', () => {
    loadGraph(samplesComboBox.options[samplesComboBox.selectedIndex].value)
  })

  document
    .querySelector('#clearing-strategy-combobox')
    .addEventListener('change', onClearingStrategyChanged)
  document
    .querySelector('#component-assignment-strategy-combobox')
    .addEventListener('change', onComponentAssignmentStrategyChanged)
}

/**
 * sets the clearing area strategy in {@link options} on combo box selected index changed
 */
function onClearingStrategyChanged() {
  const strategy = clearingStrategyComboBox.options[clearingStrategyComboBox.selectedIndex].value
  options.clearAreaStrategy = ClearAreaStrategy[strategy]
}

/**
 * sets the components assignment strategy in {@link options} on combo box selected index changed
 */
function onComponentAssignmentStrategyChanged() {
  const strategy =
    componentAssignmentStrategyComboBox.options[componentAssignmentStrategyComboBox.selectedIndex]
      .value

  options.componentAssignmentStrategy = ComponentAssignmentStrategy[strategy]
}

/**
 * Enables undo/redo support and initializes the default styles.
 */
function initializeGraph() {
  graphComponent.graph.undoEngineEnabled = true
  initDemoStyles(graphComponent.graph)
  loadGraph('hierarchical')
  graphComponent.graph.undoEngine.clear()
}

/**
 * Registers the {@link GraphEditorInputMode} as the {@link GraphComponent} InputMode
 * and initializes the rectangular area so that it is drawn and can be moved and resized.
 */
function initializeInputModes() {
  // create a GraphEditorInputMode instance
  const editMode = new GraphEditorInputMode()

  // and install the edit mode into the canvas.
  graphComponent.inputMode = editMode

  // visualize it

  graphComponent.renderTree.createElement(
    graphComponent.renderTree.highlightGroup,
    clearRect,
    new RectangleRenderer('rgba(77,131,153,0.65)', 'rgba(0,187,255,0.65)')
  )

  addClearRectInputModes(editMode)
}

/**
 * Adds the input modes that handle the resizing and movement of the rectangular area.
 * @param inputMode the input mode
 */
function addClearRectInputModes(inputMode) {
  // create handles for interactively resizing the rectangle
  const rectangleHandles = new RectangleReshapeHandleProvider(clearRect)
  rectangleHandles.minimumSize = new Size(10, 10)

  // create a mode that deals with the handles
  const handleInputMode = new HandleInputMode({ priority: 1 })

  // add it to the graph editor mode
  inputMode.add(handleInputMode)

  // now the handles
  const inputModeContext = new InputModeContext(inputMode.createInputModeContext(), handleInputMode)
  const handleCollection = new ObservableCollection()

  handleCollection.add(rectangleHandles.getHandle(inputModeContext, HandlePositions.TOP_RIGHT))
  handleCollection.add(rectangleHandles.getHandle(inputModeContext, HandlePositions.TOP_LEFT))
  handleCollection.add(rectangleHandles.getHandle(inputModeContext, HandlePositions.BOTTOM_RIGHT))
  handleCollection.add(rectangleHandles.getHandle(inputModeContext, HandlePositions.BOTTOM_LEFT))

  handleInputMode.handles = handleCollection

  // create a mode that allows for dragging the rectangle at the sides
  const moveInputMode = new MoveInputMode({
    positionHandler: new RectanglePositionHandler(clearRect),
    hitTestable: IHitTestable.create((context, location) => clearRect.toRect().contains(location)),
    priority: 41
  })

  // handle dragging the rectangle
  moveInputMode.addEventListener('drag-starting', (evt, inputMove) =>
    onDragStarting(evt, inputMove)
  )
  moveInputMode.addEventListener('dragged', (evt, inputMove) => onDragged(evt, inputMove))
  moveInputMode.addEventListener('drag-canceled', onDragCanceled)
  moveInputMode.addEventListener('drag-finished', onDragFinished)

  // handle resizing the rectangle
  handleInputMode.addEventListener('drag-starting', (evt, inputHandle) =>
    onDragStarting(evt, inputHandle)
  )
  handleInputMode.addEventListener('dragged', (evt, inputHandle) => onDragged(evt, inputHandle))
  handleInputMode.addEventListener('drag-canceled', onDragCanceled)
  handleInputMode.addEventListener('drag-finished', onDragFinished)

  // add it to the edit mode
  inputMode.add(moveInputMode)
}

/**
 * The rectangular area is upon to be moved or resized.
 */
function onDragStarting(e, _inputMode) {
  const lookup = e.context.lookup(IHitTester)
  nodeHitTester = lookup || null
  layoutHelper = new ClearAreaLayoutHelper(graphComponent, clearRect, options)
  layoutHelper.initializeLayout()
}

/**
 * The rectangular area is currently be moved or resized.
 * For each drag a new layout is calculated and applied if the previous one is completed.
 */
function onDragged(e, _inputMode) {
  if (isShiftPressed(e)) {
    // We do not change the layout now, instead we check if we are hovering a group node.
    // If so, we use that group node inside which the cleared area should be located.
    // In addition, the group node is highlighted to better recognize him.
    if (nodeHitTester != null) {
      const hitGroupNode = getHitGroupNode(e.context)
      if (hitGroupNode !== groupNode) {
        if (groupNode != null) {
          graphComponent.highlights.remove(groupNode)
        }
        if (hitGroupNode != null) {
          graphComponent.highlights.add(hitGroupNode)
        }
        groupNode = hitGroupNode
      }
    }
  } else {
    if (isShiftChanged(e) && groupNode != null) {
      // now we remove the highlight of the group
      graphComponent.highlights.remove(groupNode)
    }

    // invoke the layout calculation and animation
    layoutHelper.groupNode = groupNode
    // noinspection JSIgnoredPromiseFromCall
    layoutHelper.runLayout()
  }
}

/**
 * Moving or resizing the rectangular area has been canceled.
 * The state before the gesture must be restored.
 */
function onDragCanceled() {
  layoutHelper.cancelLayout()
  groupNode = null
}

/**
 * Moving or resizing the rectangular area has been finished.
 * We execute the layout to the final state.
 */
function onDragFinished() {
  layoutHelper.stopLayout()
  groupNode = null
}

/**
 * Determines the group node on that the mouse is currently hovering. If there is no
 * group node null is returned.
 */
function getHitGroupNode(context) {
  if (!nodeHitTester) {
    return null
  }
  const hits = nodeHitTester.enumerateHits(
    context,
    context.canvasComponent.lastEventLocation,
    GraphItemTypes.NODE
  )
  return hits.find((n) => graphComponent.graph.isGroupNode(n))
}

/**
 * Determines whether {@link ModifierKeys} SHIFT is currently is pressed.
 */
function isShiftPressed(e) {
  return e.context.canvasComponent.lastInputEvent.shiftKey
}

/**
 * Determines whether {@link ModifierKeys} SHIFT state has been changed.
 */
function isShiftChanged(e) {
  return (
    (e.context.canvasComponent.lastInputEvent.changedModifiers & ModifierKeys.SHIFT) ===
    ModifierKeys.SHIFT
  )
}

/**
 * Loads the sample graph associated with the given name
 */
function loadGraph(sampleName) {
  // @ts-ignore We don't have proper types for the sample data
  const data = SampleData[sampleName]

  const graph = graphComponent.graph
  graph.clear()

  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    parentId: 'parentId',
    layout: (data) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  const groupStyle = createDemoGroupStyle({})
  // set hitTransparentContentArea to false so group nodes are properly hit in getHitGroupNode
  groupStyle.hitTransparentContentArea = false
  graph.groupNodeDefaults.style = groupStyle
  if (data.groups) {
    const nodesSource = builder.createGroupNodesSource({
      data: data.groups,
      id: 'id',
      parentId: 'parentId',
      layout: (data) => data // the data object itself has x, y, width, height properties
    })
  }
  builder.createEdgesSource(data.edges, 'source', 'target', 'id')

  builder.buildGraph()

  graph.edges.forEach((edge) => {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort, Point.from(edge.tag.sourcePort))
    }
    if (edge.tag.targetPort) {
      graph.setPortLocation(edge.targetPort, Point.from(edge.tag.targetPort))
    }
    edge.tag.bends.forEach((bend) => {
      graph.addBend(edge, bend)
    })
  })

  graphComponent.fitGraphBounds()
  graphComponent.graph.undoEngine.clear()

  // move the clear rectangle to the default initial position
  clearRect.setLocation(new Point(0, 0))
}

run().then(finishLoading)
