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
import {
  AlignmentStageAlignmentPolicy,
  Class,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  ICanvasObjectDescriptor,
  LayoutExecutor,
  License,
  MoveInputMode,
  SimpleNode
} from 'yfiles'
import { createConfiguredLayoutAlgorithm, createDefaultSettings } from './configure-layout.js'
import { SnapDistanceVisualCreator } from './SnapDistanceVisualCreator.js'
import { sampleData } from './resources/node-alignment-data.js'
import { DragAndDropPanel } from 'demo-utils/DragAndDropPanel'
import { finishLoading } from 'demo-resources/demo-page'
import { fetchLicense } from 'demo-resources/fetch-license'
import {
  applyDemoTheme,
  createDemoShapeNodeStyle,
  initDemoStyles
} from 'demo-resources/demo-styles'
import { enableSingleSelection } from '../../input/singleselection/SingleSelectionHelper.js'

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
Class.ensure(LayoutExecutor)

/**
 * The settings for re-aligning the nodes in the demo's graph.
 */
const layoutSettings = createDefaultSettings()

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  // initialize the graph component
  const graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

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
  graphComponent.fitGraphBounds()
}

/**
 * Creates and populates a palette component that provides templates for new nodes.
 * Dragging a template from the palette and dropping said template in the demo's graph component
 * will create a new node in the graph component (that looks like the dropped template).
 * While dragging a template over the demo's graph component, gray columns and rows are shown
 * in the background of the demo's graph component. If the center of the dropped node is inside
 * one of those columns and/or rows, the nodes in the demo's graph will be re-aligned automatically.
 */
function createDragPanel() {
  const panel = new DragAndDropPanel(document.getElementById('dnd-panel'))
  panel.maxItemWidth = 160
  panel.populatePanel(createNodeTemplates())
}

/**
 * Create the set of templates for the demo's palette panel.
 * @returns {!Array.<DragAndDropPanelItem.<INode>>}
 */
function createNodeTemplates() {
  return [
    new SimpleNode({
      layout: [0, 0, 30, 30],
      style: createDemoShapeNodeStyle('round-rectangle')
    }),
    new SimpleNode({
      layout: [0, 0, 90, 30],
      style: createDemoShapeNodeStyle('round-rectangle')
    }),
    new SimpleNode({
      layout: [0, 0, 30, 30],
      style: createDemoShapeNodeStyle('diamond')
    }),
    new SimpleNode({
      layout: [0, 0, 90, 30],
      style: createDemoShapeNodeStyle('diamond')
    }),
    new SimpleNode({
      layout: [0, 0, 30, 30],
      style: createDemoShapeNodeStyle('ellipse')
    }),
    new SimpleNode({
      layout: [0, 0, 90, 30],
      style: createDemoShapeNodeStyle('ellipse')
    })
  ]
}

/**
 * Configures interactive editing.
 * Most notably, this method enables support for creating new nodes through Drag and Drop
 * operations and showing visual hints for areas that will result in new node positions due to
 * re-aligning nodes after dropping a node from the demo's palette into the demo's graph component.
 * @param {!GraphComponent} graphComponent
 */
function configureInteraction(graphComponent) {
  // show visual hints for areas that result in new node positions due to re-aligning nodes
  // the hints are gray columns and rows in the background of the demo's graph component
  const snapDistanceCanvasObject = graphComponent.backgroundGroup.addChild(
    new SnapDistanceVisualCreator(),
    ICanvasObjectDescriptor.DYNAMIC_DIRTY_INSTANCE
  )

  // create an input mode for interactive editing
  const inputMode = new GraphEditorInputMode({
    movableItems: 'node',
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
  inputMode.addNodeCreatedListener(async () => alignNodes(graphComponent))

  // configure the visual hints that are displayed during Drag and Drop operations
  const nodeDropInputMode = inputMode.nodeDropInputMode
  nodeDropInputMode.addDragEnteredListener((inputNode) =>
    initializeHints(inputNode, snapDistanceCanvasObject)
  )
  nodeDropInputMode.addDragLeftListener(() => disposeHints(snapDistanceCanvasObject))
  nodeDropInputMode.addDragDroppedListener(() => disposeHints(snapDistanceCanvasObject))
  nodeDropInputMode.addDragOverListener((inputNode) =>
    updateHints(inputNode, snapDistanceCanvasObject)
  )
  nodeDropInputMode.enabled = true

  // display the same visual hints when moving an existing node
  const mim = inputMode.moveInputMode
  mim.addDragStartedListener((inputMove) => {
    initializeHints(inputMove, snapDistanceCanvasObject)

    // force the graph component to render the initial state of the hints visualization
    getGraphComponent(inputMove).updateVisual()
  })
  mim.addDraggedListener((inputMove) => updateHints(inputMove, snapDistanceCanvasObject))
  mim.addDragFinishedListener(async (inputMove) => {
    disposeHints(snapDistanceCanvasObject)

    // run the alignment layout calculation after a node has been moved
    return await alignNodes(getGraphComponent(inputMove))
  })

  graphComponent.inputMode = inputMode

  // only one graph item may be selected at a time to prevent multiple nodes from being moved at
  // the same time
  enableSingleSelection(graphComponent)
}

/**
 * Starts displaying the visual hints for areas that will result in new node positions after
 * dropping or moving a node.
 * @param {!(MoveInputMode|NodeDropInputMode)} mode
 * @param {!ICanvasObject} snapDistanceCanvasObject
 */
function initializeHints(mode, snapDistanceCanvasObject) {
  // the canvas object for the hints has to be marked as dirty to make yFiles rendering framework
  // request a visualization of the hints
  snapDistanceCanvasObject.dirty = true

  // calculate the columns and rows to be displayed as visual hints
  // if a column or row contains the current mouse position, this column or row is highlighted
  // because dropping a dragged node template at this position will result in new node positions
  // when running the alignment layout algorithm
  snapDistanceCanvasObject.userObject.initialize(
    getGraphComponent(mode),
    getNodeCenter(mode),
    layoutSettings
  )
}

/**
 * Updates the visual hints for a new positions during Drag and Drop drag and node move operations.
 * Dropping a dragged node template or ending node movement at the current position will result in
 * new node positions when running the alignment layout algorithm.
 * @param {!(MoveInputMode|NodeDropInputMode)} mode
 * @param {!ICanvasObject} snapDistanceCanvasObject
 */
function updateHints(mode, snapDistanceCanvasObject) {
  const SnapDistanceVisualCreator = snapDistanceCanvasObject.userObject
  snapDistanceCanvasObject.dirty = SnapDistanceVisualCreator.updateNodeCenter(getNodeCenter(mode))
}

/**
 * Stops displaying the visual hints for areas that will result in new node positions after
 * dropping or moving a node.
 * @param {!ICanvasObject} snapDistanceCanvasObject
 */
function disposeHints(snapDistanceCanvasObject) {
  snapDistanceCanvasObject.userObject.clear()
  snapDistanceCanvasObject.dirty = true
}

/**
 * Retrieves the graph component associated to the given input mode.
 * @param {!(MoveInputMode|NodeDropInputMode)} mode
 * @returns {!GraphComponent}
 */
function getGraphComponent(mode) {
  return mode.inputModeContext.canvasComponent
}

/**
 * Determines the node center for updating the visual hints for areas that will result in new node
 * positions after dropping or moving a node.
 * @param {!(MoveInputMode|NodeDropInputMode)} mode
 * @returns {!IPoint}
 */
function getNodeCenter(mode) {
  if (mode instanceof MoveInputMode) {
    const node = mode.affectedItems.first()
    return node.layout.center
  } else {
    return mode.mousePosition
  }
}

/**
 * Runs the alignment layout calculation for the graph in the given graph component.
 * This method is called whenever a new node is created in said graph.
 * @param {!GraphComponent} graphComponent
 * @returns {!Promise}
 */
async function alignNodes(graphComponent) {
  const algorithm = createConfiguredLayoutAlgorithm(layoutSettings)
  await graphComponent.morphLayout({ layout: algorithm, animateViewport: false })
}

/**
 * Creates a sample graph for this demo.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
  // for sample nodes, use colors different from the colors used for new nodes created later
  initDemoStyles(graph, { theme: 'demo-lightblue' })

  const graphBuilder = new GraphBuilder(graph)

  // create nodes
  graphBuilder.createNodesSource({
    data: sampleData.nodes,
    id: 'id',
    layout: 'layout'
  })

  // create edges
  graphBuilder.createEdgesSource({
    data: sampleData.edges,
    sourceId: 'source',
    targetId: 'target'
  })

  graphBuilder.buildGraph()
}

/**
 * Adds event listeners to the controls for editing the demo's layout settings that update said
 * settings and start the alignment layout calculation whenever a setting is changed.
 * @param {!GraphComponent} graphComponent
 */
function initializeUI(graphComponent) {
  document
    .querySelector('#align-nodes-button')
    .addEventListener('click', async () => await alignNodes(graphComponent))

  const alignmentControl = document.querySelector('#alignment-policy')
  alignmentControl.selectedIndex = indexOf(alignmentControl, layoutSettings.alignmentPolicy)
  alignmentControl.addEventListener('change', async () => {
    const value = alignmentControl.value
    const policy = AlignmentStageAlignmentPolicy[value]
    layoutSettings.alignmentPolicy = policy
    await alignNodes(graphComponent)
  })

  const nodeDistanceControl = document.querySelector('#minimum-node-distance')
  nodeDistanceControl.value = `${layoutSettings.minimumNodeDistance}`
  nodeDistanceControl.addEventListener('change', async () => {
    layoutSettings.minimumNodeDistance = parseValue(nodeDistanceControl.value)
    await alignNodes(graphComponent)
  })

  const snapDistanceControl = document.querySelector('#snap-distance')
  snapDistanceControl.value = `${layoutSettings.snapDistance}`
  snapDistanceControl.addEventListener('change', async () => {
    layoutSettings.snapDistance = parseValue(snapDistanceControl.value)
    await alignNodes(graphComponent)
  })

  const separateStripesControl = document.querySelector('#separate-stripes')
  separateStripesControl.checked = layoutSettings.separateStripes
  separateStripesControl.addEventListener('change', async () => {
    layoutSettings.separateStripes = separateStripesControl.checked
    await alignNodes(graphComponent)
  })
}

/**
 * Determines the index of the option that corresponds to the given
 * {@link AlignmentStageAlignmentPolicy} value.
 * @param {!HTMLSelectElement} select
 * @param {!AlignmentStageAlignmentPolicy} policy
 * @returns {number}
 */
function indexOf(select, policy) {
  let idx = -1
  for (const option of select.options) {
    ++idx

    const value = option.value
    if (AlignmentStageAlignmentPolicy[value] === policy) {
      return idx
    }
  }
  return idx
}

/**
 * Parses the given string as non-negative number.
 * @param {!string} value
 * @returns {number}
 */
function parseValue(value) {
  return Math.max(0, Number.parseFloat(value))
}

void run().then(finishLoading)
