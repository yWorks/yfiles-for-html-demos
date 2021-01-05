/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CanvasComponent,
  ComponentAssignmentStrategy,
  FillAreaLayout,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IBend,
  ICommand,
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

import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { initDemoStyles } from '../../resources/demo-styles'
import SampleData from './resources/SampleData'

// @ts-ignore
let graphComponent: GraphComponent = null

/**
 * Stores the bounding rectangle of the selected nodes that get deleted.
 */
let selectionRect: Rect | null = null

/**
 * Stores the current component assignment strategy.
 */
let componentAssignmentStrategy: ComponentAssignmentStrategy = ComponentAssignmentStrategy.SINGLE

async function run(licenseData: object): Promise<void> {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

  initializeInputModes()
  await initializeGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Initializes the {@link GraphEditorInputMode} as the {@link CanvasComponent#inputMode}
 * and registers handlers which are called when selected nodes are deleted.
 */
function initializeInputModes(): void {
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
 */
function onDeletingSelection(sender: object, event: SelectionEventArgs<IModelItem>): void {
  // determine the bounds of the selection
  selectionRect = getBounds(event.selection)
}

/**
 * Calls the prepared {@link LayoutExecutor}.
 */
async function onDeletedSelection(
  sender: object,
  evt: SelectionEventArgs<IModelItem>
): Promise<void> {
  // configure the layout that will fill free space
  const layout = new FillAreaLayout({
    componentAssignmentStrategy: componentAssignmentStrategy,
    area: selectionRect!.toYRectangle()
  })

  // configure the LayoutExecutor that will perform the layout and morph the result
  const executor = new LayoutExecutor({ graphComponent, layout, duration: '150ms' })
  await executor.start()

  selectionRect = null
}

/**
 * The bounds including the nodes of the selection.
 */
function getBounds(selection: ISelectionModel<IModelItem>): Rect {
  let bounds = Rect.EMPTY
  selection.forEach(item => {
    if (item instanceof INode) {
      bounds = Rect.add(bounds, item.layout.toRect())
    } else if (item instanceof IEdge) {
      bounds = bounds.add(item.sourcePort!.location)
      item.bends.forEach(bend => {
        bounds = bounds.add(bend.location.toPoint())
      })
      bounds = bounds.add(item.targetPort!.location)
    } else if (item instanceof IBend) {
      bounds = new Rect(item.location.x, item.location.y, 1, 1)
    }
  })
  return bounds
}

/**
 * Initializes styles and loads a sample graph.
 */
function initializeGraph(): void {
  initDemoStyles(graphComponent.graph)
  loadGraph('hierarchic')
}

/**
 * Loads the sample graph associated with the given name
 */
function loadGraph(sampleName: string): void {
  // @ts-ignore
  const data = SampleData[sampleName]

  const graph = graphComponent.graph
  graph.clear()

  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    parentId: 'parentId',
    layout: (data: any) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height),
    labels: ['label']
  })
  if (data.groups) {
    builder.createGroupNodesSource({
      data: data.groups,
      id: 'id',
      parentId: 'parentId',
      layout: (data: any) => data // the data object itself has x, y, width, height properties
    })
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
      graph.addBend(edge, Point.from(bend))
    })
  })

  graphComponent.fitGraphBounds()
}

/**
 * Registers commands and actions for the items in the toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='PreviousSample']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    if (selectedIndex > 0) {
      sampleGraphs.selectedIndex = selectedIndex - 1
      loadGraph(sampleGraphs.options[sampleGraphs.selectedIndex].value)
      updateButtons(sampleGraphs)
    }
  })
  bindAction("button[data-command='NextSample']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    if (selectedIndex < sampleGraphs.options.length - 1) {
      sampleGraphs.selectedIndex = selectedIndex + 1
      loadGraph(sampleGraphs.options[sampleGraphs.selectedIndex].value)
      updateButtons(sampleGraphs)
    }
  })

  const sampleGraphs = document.getElementById('sample-graphs') as HTMLSelectElement
  bindChangeListener("select[data-command='SelectSampleGraph']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    const selectedOption = sampleGraphs.options[selectedIndex]
    loadGraph(selectedOption.value)
    updateButtons(sampleGraphs)
  })

  const assignmentStrategies = document.getElementById(
    'component-assignment-strategies'
  ) as HTMLSelectElement
  bindChangeListener("select[data-command='SelectAssignmentStrategy']", () => {
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

/**
 * Updates the enabled state of the next- and previous-sample-button according to which sample is currently used.
 */
function updateButtons(sampleGraphs: HTMLSelectElement): void {
  const selectedIndex = sampleGraphs.selectedIndex
  const previousSample = document.getElementById('previous-sample-button') as HTMLButtonElement
  const nextSample = document.getElementById('next-sample-button') as HTMLButtonElement
  const maxReached = selectedIndex === sampleGraphs.options.length - 1
  const minReached = selectedIndex === 0
  nextSample.disabled = maxReached
  previousSample.disabled = minReached
}

// start tutorial
loadJson().then(run)
