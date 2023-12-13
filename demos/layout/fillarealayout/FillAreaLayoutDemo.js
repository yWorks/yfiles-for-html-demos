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
  CanvasComponent,
  ComponentAssignmentStrategy,
  FillAreaLayout,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IBend,
  IEdge,
  IModelItem,
  INode,
  ISelectionModel,
  LayoutExecutor,
  License,
  OrthogonalEdgeEditingContext,
  OrthogonalEdgeEditingPolicy,
  Point,
  Rect,
  SelectionEventArgs
} from 'yfiles'

import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import SampleData from './resources/SampleData.js'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * Stores the bounding rectangle of the selected nodes that get deleted.
 * @type {Rect}
 */
let selectionRect = null

/**
 * Stores the current component assignment strategy.
 * @type {ComponentAssignmentStrategy}
 */
let componentAssignmentStrategy = ComponentAssignmentStrategy.SINGLE

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  initializeInputModes()

  initDemoStyles(graphComponent.graph)
  loadGraph('hierarchic')

  // bind the buttons to their functionality
  initializeUI()
}

/**
 * Initializes the {@link GraphEditorInputMode} as the {@link CanvasComponent.inputMode}
 * and registers handlers which are called when selected nodes are deleted.
 */
function initializeInputModes() {
  // create a GraphEditorInputMode instance and install the edit mode into the canvas.
  const editMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext()
  })
  editMode.createEdgeInputMode.orthogonalEdgeCreation = OrthogonalEdgeEditingPolicy.ALWAYS
  editMode.orthogonalBendRemoval = OrthogonalEdgeEditingPolicy.ALWAYS
  graphComponent.inputMode = editMode

  // registers handlers which are called when selected nodes are deleted
  editMode.addDeletingSelectionListener(onDeletingSelection)
  editMode.addDeletedSelectionListener(onDeletedSelection)
}

/**
 * Prepares the {@link LayoutExecutor} that is called after the selection is deleted.
 * @param {!object} sender
 * @param {!SelectionEventArgs.<IModelItem>} event
 */
function onDeletingSelection(sender, event) {
  // determine the bounds of the selection
  selectionRect = getBounds(event.selection)
}

/**
 * Calls the prepared {@link LayoutExecutor}.
 * @param {!object} sender
 * @param {!SelectionEventArgs.<IModelItem>} evt
 * @returns {!Promise}
 */
async function onDeletedSelection(sender, evt) {
  // configure the layout that will fill free space
  const layout = new FillAreaLayout({
    componentAssignmentStrategy: componentAssignmentStrategy,
    area: selectionRect.toYRectangle()
  })

  // configure the LayoutExecutor that will perform the layout and morph the result
  const executor = new LayoutExecutor({ graphComponent, layout, duration: '150ms' })
  await executor.start()

  selectionRect = null
}

/**
 * The bounds including the nodes of the selection.
 * @param {!ISelectionModel.<IModelItem>} selection
 * @returns {!Rect}
 */
function getBounds(selection) {
  let bounds = Rect.EMPTY
  selection.forEach((item) => {
    if (item instanceof INode) {
      bounds = Rect.add(bounds, item.layout.toRect())
    } else if (item instanceof IEdge) {
      bounds = bounds.add(item.sourcePort.location)
      item.bends.forEach((bend) => {
        bounds = bounds.add(bend.location.toPoint())
      })
      bounds = bounds.add(item.targetPort.location)
    } else if (item instanceof IBend) {
      bounds = new Rect(item.location.x, item.location.y, 1, 1)
    }
  })
  return bounds
}

/**
 * Loads the sample graph associated with the given name
 * @param {!string} sampleName
 */
function loadGraph(sampleName) {
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
  if (data.groups) {
    builder.createGroupNodesSource({
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
}

/**
 * Registers commands and actions for the items in the toolbar.
 */
function initializeUI() {
  const sampleGraphs = document.querySelector('#sample-graphs')

  addNavigationButtons(sampleGraphs).addEventListener('change', () => {
    const selectedIndex = sampleGraphs.selectedIndex
    const selectedOption = sampleGraphs.options[selectedIndex]
    loadGraph(selectedOption.value)
  })

  const assignmentStrategies = document.querySelector('#component-assignment-strategies')
  assignmentStrategies.addEventListener('change', () => {
    const selectedOption = assignmentStrategies.options[assignmentStrategies.selectedIndex]
    switch (selectedOption.value) {
      case 'single':
        componentAssignmentStrategy = ComponentAssignmentStrategy.SINGLE
        break
      case 'connected':
        componentAssignmentStrategy = ComponentAssignmentStrategy.CONNECTED
        break
      case 'clustering':
        componentAssignmentStrategy = ComponentAssignmentStrategy.CLUSTERING
        break
    }
  })
}

run().then(finishLoading)
