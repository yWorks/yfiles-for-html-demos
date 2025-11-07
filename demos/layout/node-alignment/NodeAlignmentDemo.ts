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
  AlignmentStageAlignmentPolicy,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  type IGraph,
  type IInputModeContext,
  type INode,
  type IPoint,
  type IRenderTreeElement,
  LayoutExecutor,
  License,
  MoveInputMode,
  type NodeDropInputMode,
  SimpleNode
} from '@yfiles/yfiles'
import { createConfiguredLayoutAlgorithm, createDefaultSettings } from './configure-layout'
import { SnapDistanceVisualCreator } from './SnapDistanceVisualCreator'
import { sampleData } from './resources/node-alignment-data'
import { DragAndDropPanel, type DragAndDropPanelItem } from '@yfiles/demo-utils/DragAndDropPanel'
import { finishLoading } from '@yfiles/demo-app/demo-page'
import licenseData from '../../../lib/license.json'
import { createDemoShapeNodeStyle, initDemoStyles } from '@yfiles/demo-app/demo-styles'
import { enableSingleSelection } from './SingleSelectionHelper'

/**
 * The settings for re-aligning the nodes in the demo's graph.
 */
const layoutSettings = createDefaultSettings()

async function run(): Promise<void> {
  License.value = licenseData

  // initialize the graph component
  const graphComponent = new GraphComponent('graphComponent')
  createSampleGraph(graphComponent.graph)

  // for new nodes, use colors different from the colors used for nodes in the sample graph
  initDemoStyles(graphComponent.graph)

  // enable undo and redo for this demo
  graphComponent.graph.undoEngineEnabled = true

  graphComponent.focusIndicatorManager.enabled = false

  // create and populate a palette component from which new nodes may be dragged and dropped
  // into the demo's graph component
  createDragPanel()

  // enable interactive editing as well as visible hints for areas that will result in new node
  // positions due to re-aligning nodes after dropping a node from the demo's palette into the
  // demo's graph component
  configureInteraction(graphComponent)

  // configure the controls for editing the layout settings used for re-aligning the nodes in the
  // demo's graph
  initializeUI(graphComponent)

  // center the sample graph inside the visible area
  await graphComponent.fitGraphBounds()
}

/**
 * Creates and populates a palette component that provides templates for new nodes.
 * Dragging a template from the palette and dropping said template in the demo's graph component
 * will create a new node in the graph component (that looks like the dropped template).
 * While dragging a template over the demo's graph component, gray columns and rows are shown
 * in the background of the demo's graph component. If the center of the dropped node is inside
 * one of those columns and/or rows, the nodes in the demo's graph will be re-aligned automatically.
 */
function createDragPanel(): void {
  const panel = new DragAndDropPanel(document.getElementById('dnd-panel')!)
  panel.maxItemWidth = 160
  panel.populatePanel(createNodeTemplates())
}

/**
 * Create the set of templates for the demo's palette panel.
 */
function createNodeTemplates(): DragAndDropPanelItem<INode>[] {
  return [
    new SimpleNode({ layout: [0, 0, 30, 30], style: createDemoShapeNodeStyle('round-rectangle') }),
    new SimpleNode({ layout: [0, 0, 90, 30], style: createDemoShapeNodeStyle('round-rectangle') }),
    new SimpleNode({ layout: [0, 0, 30, 30], style: createDemoShapeNodeStyle('diamond') }),
    new SimpleNode({ layout: [0, 0, 90, 30], style: createDemoShapeNodeStyle('diamond') }),
    new SimpleNode({ layout: [0, 0, 30, 30], style: createDemoShapeNodeStyle('ellipse') }),
    new SimpleNode({ layout: [0, 0, 90, 30], style: createDemoShapeNodeStyle('ellipse') })
  ]
}

/**
 * Configures interactive editing.
 * Most notably, this method enables support for creating new nodes through Drag and Drop
 * operations and showing visual hints for areas that will result in new node positions due to
 * re-aligning nodes after dropping a node from the demo's palette into the demo's graph component.
 */
function configureInteraction(graphComponent: GraphComponent): void {
  // show visual hints for areas that result in new node positions due to re-aligning nodes
  // the hints are gray columns and rows in the background of the demo's graph component
  const snapDistanceRenderTreeElement = graphComponent.renderTree.createElement(
    graphComponent.renderTree.backgroundGroup,
    new SnapDistanceVisualCreator()
  )

  // create an input mode for interactive editing
  const inputMode = new GraphEditorInputMode({
    movableSelectedItems: 'node',
    showHandleItems: 'none'
  })
  // additionally, run the alignment layout calculation whenever a new node is created
  // this listener is invoked when a node is created by clicking on free space in the demo's
  // graph component or when a node template from the demo's palette is dropped into the demo's
  // graph component
  // note, even though the alignment layout calculation runs whenever a new node is created,
  // the positions of the nodes in the demo's graph only change if the distance between the center
  // of an existing node and the center of the new node is less than or equal to the current snap
  // distance
  inputMode.addEventListener('node-created', async () => alignNodes(graphComponent))

  // configure the visual hints that are displayed during Drag and Drop operations
  const nodeDropInputMode = inputMode.nodeDropInputMode
  nodeDropInputMode.addEventListener('drag-entered', (evt, inputNode) =>
    initializeHints(evt.context, inputNode, snapDistanceRenderTreeElement)
  )
  nodeDropInputMode.addEventListener('drag-left', () => disposeHints(snapDistanceRenderTreeElement))
  nodeDropInputMode.addEventListener('drag-dropped', () =>
    disposeHints(snapDistanceRenderTreeElement)
  )
  nodeDropInputMode.addEventListener('drag-over', (_, inputNode) =>
    updateHints(inputNode, snapDistanceRenderTreeElement)
  )
  nodeDropInputMode.enabled = true

  // display the same visual hints when moving an existing node
  const mim = inputMode.moveSelectedItemsInputMode
  mim.addEventListener('drag-started', (evt, inputMove) => {
    initializeHints(evt.context, inputMove, snapDistanceRenderTreeElement)

    // force the graph component to render the initial state of the hints visualization
    getGraphComponent(evt.context).updateVisual()
  })
  mim.addEventListener('dragged', (_, inputMove) =>
    updateHints(inputMove, snapDistanceRenderTreeElement)
  )
  mim.addEventListener('drag-finished', async (evt) => {
    disposeHints(snapDistanceRenderTreeElement)

    // run the alignment layout calculation after a node has been moved
    return await alignNodes(getGraphComponent(evt.context))
  })

  graphComponent.inputMode = inputMode

  // only one graph item may be selected at a time to prevent multiple nodes from being moved at
  // the same time
  enableSingleSelection(graphComponent)
}

/**
 * Starts displaying the visual hints for areas that will result in new node positions after
 * dropping or moving a node.
 */
function initializeHints(
  context: IInputModeContext,
  mode: MoveInputMode | NodeDropInputMode,
  snapDistanceRenderTreeElement: IRenderTreeElement
): void {
  // the render tree element for the hints has to be marked as dirty to make yFiles rendering framework
  // request a visualization of the hints
  snapDistanceRenderTreeElement.dirty = true

  // calculate the columns and rows to be displayed as visual hints
  // if a column or row contains the current mouse position, this column or row is highlighted
  // because dropping a dragged node template at this position will result in new node positions
  // when running the alignment layout algorithm
  ;(snapDistanceRenderTreeElement.tag as SnapDistanceVisualCreator).initialize(
    getGraphComponent(context),
    getNodeCenter(mode),
    layoutSettings
  )
}

/**
 * Updates the visual hints for a new positions during Drag and Drop drag and node move operations.
 * Dropping a dragged node template or ending node movement at the current position will result in
 * new node positions when running the alignment layout algorithm.
 */
function updateHints(
  mode: MoveInputMode | NodeDropInputMode,
  snapDistanceRenderTreeElement: IRenderTreeElement
): void {
  const SnapDistanceVisualCreator = snapDistanceRenderTreeElement.tag as SnapDistanceVisualCreator
  snapDistanceRenderTreeElement.dirty = SnapDistanceVisualCreator.updateNodeCenter(
    getNodeCenter(mode)
  )
}

/**
 * Stops displaying the visual hints for areas that will result in new node positions after
 * dropping or moving a node.
 */
function disposeHints(snapDistanceRenderTreeElement: IRenderTreeElement): void {
  ;(snapDistanceRenderTreeElement.tag as SnapDistanceVisualCreator).clear()
  snapDistanceRenderTreeElement.dirty = true
}

/**
 * Retrieves the graph component associated to the given input mode.
 */
function getGraphComponent(context: IInputModeContext): GraphComponent {
  return context.canvasComponent as GraphComponent
}

/**
 * Determines the node center for updating the visual hints for areas that will result in new node
 * positions after dropping or moving a node.
 */
function getNodeCenter(mode: MoveInputMode | NodeDropInputMode): IPoint {
  if (mode instanceof MoveInputMode) {
    const node = mode.affectedItems.first() as INode
    return node.layout.center
  } else {
    return mode.pointerPosition
  }
}

/**
 * Runs the alignment layout calculation for the graph in the given graph component.
 * This method is called whenever a new node is created in said graph.
 */
async function alignNodes(graphComponent: GraphComponent): Promise<void> {
  const algorithm = createConfiguredLayoutAlgorithm(layoutSettings)
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: algorithm,
    animateViewport: false,
    animationDuration: '0.5s'
  })
  await layoutExecutor.start()
}

/**
 * Creates a sample graph for this demo.
 */
function createSampleGraph(graph: IGraph): void {
  // for sample nodes, use colors different from the colors used for new nodes created later
  initDemoStyles(graph, { theme: 'demo-lightblue' })

  const graphBuilder = new GraphBuilder(graph)

  // create nodes
  graphBuilder.createNodesSource({ data: sampleData.nodes, id: 'id', layout: 'layout' })

  // create edges
  graphBuilder.createEdgesSource({ data: sampleData.edges, sourceId: 'source', targetId: 'target' })

  graphBuilder.buildGraph()
}

/**
 * Adds event listeners to the controls for editing the demo's layout settings that update said
 * settings and start the alignment layout calculation whenever a setting is changed.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document
    .querySelector<HTMLButtonElement>('#align-nodes-button')!
    .addEventListener('click', async () => await alignNodes(graphComponent))

  const alignmentControl = document.querySelector<HTMLSelectElement>('#alignment-policy')!
  alignmentControl.selectedIndex = indexOf(alignmentControl, layoutSettings.alignmentPolicy)
  alignmentControl.addEventListener('change', async () => {
    const value = alignmentControl.value as keyof typeof AlignmentStageAlignmentPolicy
    const policy = AlignmentStageAlignmentPolicy[value]
    layoutSettings.alignmentPolicy = policy as AlignmentStageAlignmentPolicy
    await alignNodes(graphComponent)
  })

  const nodeDistanceControl = document.querySelector<HTMLInputElement>('#minimum-node-distance')!
  nodeDistanceControl.value = `${layoutSettings.minimumNodeDistance}`
  nodeDistanceControl.addEventListener('change', async () => {
    layoutSettings.minimumNodeDistance = parseValue(nodeDistanceControl.value)
    await alignNodes(graphComponent)
  })

  const snapDistanceControl = document.querySelector<HTMLInputElement>('#snap-distance')!
  snapDistanceControl.value = `${layoutSettings.snapDistance}`
  snapDistanceControl.addEventListener('change', async () => {
    layoutSettings.snapDistance = parseValue(snapDistanceControl.value)
    await alignNodes(graphComponent)
  })

  const separateStripesControl = document.querySelector<HTMLInputElement>('#separate-stripes')!
  separateStripesControl.checked = layoutSettings.separateStripes
  separateStripesControl.addEventListener('change', async () => {
    layoutSettings.separateStripes = separateStripesControl.checked
    await alignNodes(graphComponent)
  })
}

/**
 * Determines the index of the option that corresponds to the given
 * {@link AlignmentStageAlignmentPolicy} value.
 */
function indexOf(select: HTMLSelectElement, policy: AlignmentStageAlignmentPolicy): number {
  let idx = -1
  for (const option of select.options) {
    ++idx

    const value = option.value as keyof typeof AlignmentStageAlignmentPolicy
    if (AlignmentStageAlignmentPolicy[value] === policy) {
      return idx
    }
  }
  return idx
}

/**
 * Parses the given string as non-negative number.
 */
function parseValue(value: string): number {
  return Math.max(0, Number.parseFloat(value))
}

void run().then(finishLoading)
