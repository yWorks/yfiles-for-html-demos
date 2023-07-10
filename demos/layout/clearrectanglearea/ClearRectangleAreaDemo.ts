/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2023 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  BaseClass,
  ClearAreaStrategy,
  ComponentAssignmentStrategy,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HandleInputMode,
  HandlePositions,
  IHandle,
  IHitTestable,
  IHitTester,
  IInputModeContext,
  INode,
  INodeHitTester,
  InputModeEventArgs,
  IRenderContext,
  IVisualTemplate,
  License,
  ModifierKeys,
  MoveInputMode,
  MultiplexingInputMode,
  MutableRectangle,
  ObservableCollection,
  Point,
  Rect,
  RectangleIndicatorInstaller,
  RectangleReshapeHandleProvider,
  Size,
  SvgVisual
} from 'yfiles'

import { ClearAreaLayoutHelper } from './ClearAreaLayoutHelper'
import { LayoutOptions } from './LayoutOptions'
import { RectanglePositionHandler } from './RectanglePositionHandler'

import SampleData from './resources/SampleData'
import { applyDemoTheme, createDemoGroupStyle, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

// UI components
const samplesComboBox = document.getElementById('sample-graph-combobox') as HTMLSelectElement

const clearingStrategyComboBox = document.getElementById(
  'clearing-strategy-combobox'
) as HTMLSelectElement

const componentAssignmentStrategyComboBox = document.getElementById(
  'component-assignment-strategy-combobox'
) as HTMLSelectElement

/**
 * The rectangular area used for clearing
 */
const clearRect: MutableRectangle = new MutableRectangle(0, 0, 100, 100)

/**
 * Options to control the layout behavior.
 */
const options: LayoutOptions = new LayoutOptions(
  ClearAreaStrategy.PRESERVE_SHAPES,
  ComponentAssignmentStrategy.SINGLE,
  false
)

/**
 * The group node we are currently inside.
 */
let groupNode: INode | null

/**
 * Performs layout and animation while dragging the rectangle.
 */
let layoutHelper: ClearAreaLayoutHelper

/**
 * A  {@link IHitTester} to determine the group node we are currently hovering.
 */
let nodeHitTester: INodeHitTester | null

/**
 * The GraphComponent
 */
let graphComponent: GraphComponent

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initializeUI()

  initializeInputModes()

  initializeGraph()
}

/**
 * Syncs combo box selected index with initially loaded sample and {@link options} set.
 * Also binds actions to toolbars.
 */
function initializeUI(): void {
  samplesComboBox.selectedIndex = 0
  clearingStrategyComboBox.selectedIndex = options.clearAreaStrategy.valueOf()
  componentAssignmentStrategyComboBox.selectedIndex = options.componentAssignmentStrategy.valueOf()

  addNavigationButtons(samplesComboBox).addEventListener('change', () => {
    loadGraph(samplesComboBox.options[samplesComboBox.selectedIndex].value)
  })

  document
    .querySelector<HTMLSelectElement>('#clearing-strategy-combobox')!
    .addEventListener('change', onClearingStrategyChanged)
  document
    .querySelector<HTMLSelectElement>('#component-assignment-strategy-combobox')!
    .addEventListener('change', onComponentAssignmentStrategyChanged)
}

/**
 * sets the clearing area strategy in {@link options} on combo box selected index changed
 */
function onClearingStrategyChanged(): void {
  const strategy = clearingStrategyComboBox.options[clearingStrategyComboBox.selectedIndex].value
  options.clearAreaStrategy = ClearAreaStrategy[
    strategy as keyof typeof ClearAreaStrategy
  ] as ClearAreaStrategy
}

/**
 * sets the components assignment strategy in {@link options} on combo box selected index changed
 */
function onComponentAssignmentStrategyChanged(): void {
  const strategy =
    componentAssignmentStrategyComboBox.options[componentAssignmentStrategyComboBox.selectedIndex]
      .value

  options.componentAssignmentStrategy = ComponentAssignmentStrategy[
    strategy as keyof typeof ComponentAssignmentStrategy
  ] as ComponentAssignmentStrategy
}

/**
 * Enables undo/redo support and initializes the default styles.
 */
function initializeGraph(): void {
  graphComponent.graph.undoEngineEnabled = true
  initDemoStyles(graphComponent.graph)
  loadGraph('hierarchic')
  graphComponent.graph.undoEngine!.clear()
}

/**
 * Registers the {@link GraphEditorInputMode} as the {@link GraphComponent} InputMode
 * and initializes the rectangular area so that it is drawn and can be moved and resized.
 */
function initializeInputModes(): void {
  // create a GraphEditorInputMode instance
  const editMode = new GraphEditorInputMode()

  // and install the edit mode into the canvas.
  graphComponent.inputMode = editMode

  // visualize it
  const rectangleIndicatorInstaller = new RectangleIndicatorInstaller(clearRect)
  rectangleIndicatorInstaller.template = new ClearRectTemplate()

  rectangleIndicatorInstaller.addCanvasObject(
    graphComponent.canvasContext,
    graphComponent.highlightGroup,
    clearRect
  )

  addClearRectInputModes(editMode)
}

/**
 * Adds the input modes that handle the resizing and movement of the rectangular area.
 * @param inputMode the input mode
 */
function addClearRectInputModes(inputMode: MultiplexingInputMode): void {
  // create handles for interactively resizing the rectangle
  const rectangleHandles = new RectangleReshapeHandleProvider(clearRect)
  rectangleHandles.minimumSize = new Size(10, 10)

  // create a mode that deals with the handles
  const handleInputMode = new HandleInputMode({
    priority: 1
  })

  // add it to the graph editor mode
  inputMode.add(handleInputMode)

  // now the handles
  const inputModeContext = IInputModeContext.createInputModeContext(handleInputMode)
  const handleCollection = new ObservableCollection<IHandle>()

  handleCollection.add(rectangleHandles.getHandle(inputModeContext, HandlePositions.NORTH_EAST))
  handleCollection.add(rectangleHandles.getHandle(inputModeContext, HandlePositions.NORTH_WEST))
  handleCollection.add(rectangleHandles.getHandle(inputModeContext, HandlePositions.SOUTH_EAST))
  handleCollection.add(rectangleHandles.getHandle(inputModeContext, HandlePositions.SOUTH_WEST))

  handleInputMode.handles = handleCollection

  // create a mode that allows for dragging the rectangle at the sides
  const moveInputMode = new MoveInputMode({
    positionHandler: new RectanglePositionHandler(clearRect),
    hitTestable: IHitTestable.create((context, location) => clearRect.contains(location)),
    priority: 41
  })

  // handle dragging the rectangle
  moveInputMode.addDragStartingListener((sender, evt) => onDragStarting(sender, evt))
  moveInputMode.addDraggedListener((sender, evt) => onDragged(sender, evt))
  moveInputMode.addDragCanceledListener(onDragCanceled)
  moveInputMode.addDragFinishedListener(onDragFinished)

  // handle resizing the rectangle
  handleInputMode.addDragStartingListener((sender, evt) => onDragStarting(sender, evt))
  handleInputMode.addDraggedListener((sender, evt) => onDragged(sender, evt))
  handleInputMode.addDragCanceledListener(onDragCanceled)
  handleInputMode.addDragFinishedListener(onDragFinished)

  // add it to the edit mode
  inputMode.add(moveInputMode)
}

/**
 * The rectangular area is upon to be moved or resized.
 */
function onDragStarting(sender: any, e: InputModeEventArgs): void {
  const lookup = e.context.lookup(INodeHitTester.$class) as INodeHitTester
  nodeHitTester = lookup || null
  layoutHelper = new ClearAreaLayoutHelper(graphComponent, clearRect, options)
  layoutHelper.initializeLayout()
}

/**
 * The rectangular area is currently be moved or resized.
 * For each drag a new layout is calculated and applied if the previous one is completed.
 */
function onDragged(sender: any, e: InputModeEventArgs): void {
  if (isShiftPressed(e)) {
    // We do not change the layout now, instead we check if we are hovering a group node.
    // If so, we use that group node inside which the cleared area should be located.
    // In addition, the group node is highlighted to better recognize him.
    if (nodeHitTester != null) {
      const hitGroupNode = getHitGroupNode(e.context)
      if (hitGroupNode !== groupNode) {
        if (groupNode != null) {
          graphComponent.highlightIndicatorManager.removeHighlight(groupNode)
        }
        if (hitGroupNode != null) {
          graphComponent.highlightIndicatorManager.addHighlight(hitGroupNode)
        }
        groupNode = hitGroupNode
      }
    }
  } else {
    if (isShiftChanged(e) && groupNode != null) {
      // now we remove the highlight of the group
      graphComponent.highlightIndicatorManager.removeHighlight(groupNode)
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
function onDragCanceled(): void {
  layoutHelper.cancelLayout()
  groupNode = null
}

/**
 * Moving or resizing the rectangular area has been finished.
 * We execute the layout to the final state.
 */
function onDragFinished(): void {
  layoutHelper.stopLayout()
  groupNode = null
}

/**
 * Determines the group node on that the mouse is currently hovering. If there is no
 * group node null is returned.
 */
function getHitGroupNode(context: IInputModeContext): INode | null {
  if (nodeHitTester) {
    return nodeHitTester
      .enumerateHits(context, context.canvasComponent!.lastEventLocation)
      .find(n => graphComponent.graph.isGroupNode(n))
  }
  return null
}

/**
 * Determines whether {@link ModifierKeys} SHIFT is currently is pressed.
 */
function isShiftPressed(e: InputModeEventArgs): boolean {
  return (
    (e.context.canvasComponent!.lastMouseEvent.modifiers & ModifierKeys.SHIFT) ===
    ModifierKeys.SHIFT
  )
}

/**
 * Determines whether {@link ModifierKeys} SHIFT state has been changed.
 */
function isShiftChanged(e: InputModeEventArgs): boolean {
  return (
    (e.context.canvasComponent!.lastMouseEvent.changedModifiers & ModifierKeys.SHIFT) ===
    ModifierKeys.SHIFT
  )
}

/**
 * Loads the sample graph associated with the given name
 */
function loadGraph(sampleName: string): void {
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
    layout: (data: any) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  if (data.groups) {
    const nodesSource = builder.createGroupNodesSource({
      data: data.groups,
      id: 'id',
      parentId: 'parentId',
      layout: (data: any) => data // the data object itself has x, y, width, height properties
    })
    const groupStyle = createDemoGroupStyle({})
    // set hitTransparentContentArea to false so group nodes are properly hit in getHitGroupNode
    groupStyle.hitTransparentContentArea = false
    nodesSource.nodeCreator.defaults.style = groupStyle
  }
  builder.createEdgesSource(data.edges, 'source', 'target', 'id')

  builder.buildGraph()

  graph.edges.forEach(edge => {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort!, Point.from(edge.tag.sourcePort))
    }
    if (edge.tag.targetPort) {
      graph.setPortLocation(edge.targetPort!, Point.from(edge.tag.targetPort))
    }
    edge.tag.bends.forEach((bend: { x: number; y: number }) => {
      graph.addBend(edge, bend)
    })
  })

  graphComponent.fitGraphBounds()
  graphComponent.graph.undoEngine!.clear()

  // move the clear rectangle to the default initial position
  clearRect.relocate(new Point(0, 0))
}

/**
 * Visual template used for the clear rectangle
 */
class ClearRectTemplate extends BaseClass(IVisualTemplate) {
  createVisual(context: IRenderContext, bounds: Rect, dataObject: object): SvgVisual | null {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

    rect.setAttribute('fill', 'rgba(0,187,255,0.65)')
    rect.setAttribute('stroke', 'rgba(77,131,153,0.65)')
    rect.setAttribute('stroke-width', '1.5')
    rect.setAttribute('x', `${bounds.x}`)
    rect.setAttribute('y', `${bounds.y}`)
    rect.setAttribute('width', `${bounds.width}`)
    rect.setAttribute('height', `${bounds.height}`)

    return new SvgVisual(rect)
  }

  updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual,
    bounds: Rect,
    dataObject: object
  ): SvgVisual | null {
    return this.createVisual(context, bounds, dataObject)
  }
}

run().then(finishLoading)
