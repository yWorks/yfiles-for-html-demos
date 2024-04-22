/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  AdjacencyGraphBuilder,
  DefaultLabelStyle,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphFocusIndicatorManager,
  GraphSelectionIndicatorManager,
  HandleInputMode,
  HorizontalTextAlignment,
  ICanvasObjectDescriptor,
  License,
  MouseWheelBehaviors,
  Rect,
  ScrollBarVisibility,
  TextWrapping,
  VerticalTextAlignment,
  VoidNodeStyle
} from 'yfiles'
import { TimeHandleTemplate } from './activity-node/ActivityNodeHandleProvider'
import type { Activity } from './resources/data-model'
import { ganttChartData as dataModel } from './resources/gantt-chart-data'
import {
  colorPalette,
  GanttTimestamp,
  getActivityWidth,
  getLeadWidth,
  getTaskColor,
  getTaskForId,
  getX
} from './gantt-utils'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { ActivityNodeLabelModel } from './activity-node/ActivityNodeLabelModel'
import { TaskComponent } from './components/TaskComponent'
import { hideActivityInfo } from './info-panel'
import {
  ganttActivityHeight,
  getActivityY,
  getTotalTasksHeight,
  updateSubRows
} from './sweepline-layout'
import { TimelineComponent } from './components/TimelineComponent'
import { configureInteraction } from './input'
import { ActivityNodeStyle } from './activity-node/ActivityNodeStyle'
import { GridVisual } from './GridVisual'
import { RestrictedViewportLimiter } from './RestrictedViewportLimiter'
import { RoutingEdgeStyle } from './RoutingEdgeStyle'
import { ActivityNodePositionHandler } from './activity-node/ActivityNodePositionHandler'

/**
 * The main graph component displaying activities and their dependencies.
 */
let graphComponent: GraphComponent

/**
 * The html component that visualizes the tasks.
 */
let taskComponent: TaskComponent

async function run(): Promise<void> {
  License.value = await fetchLicense()
  // create and initializes the main graph component
  graphComponent = createGraphComponent()

  // create the component that visualizes the tasks and add the tasks from the data-model
  taskComponent = new TaskComponent('task-component', graphComponent)

  // create the component that visualizes the timeline
  new TimelineComponent('timeline-component', graphComponent)

  // configure graph item styles
  initializeStyles()
  configureInteraction(graphComponent, onGraphModified)

  // create the graph items from the source data
  await populateGraph()

  taskComponent.createTasks()
  updateScrollArea()
}

/**
 * Creates the graph from the data model.
 */
async function populateGraph(): Promise<void> {
  const graph = graphComponent.graph
  const graphBuilder = new AdjacencyGraphBuilder(graph)

  const nodesSource = graphBuilder.createNodesSource(
    dataModel.activities,
    (activity) => activity.id
  )
  nodesSource.nodeCreator.layoutProvider = (activity): Rect => {
    return new Rect(
      getX(new GanttTimestamp(activity.startDate)) - getLeadWidth(activity),
      getActivityY(activity),
      getActivityWidth(activity),
      ganttActivityHeight
    )
  }
  nodesSource.nodeCreator.styleProvider = (activity): ActivityNodeStyle => {
    const task = getTaskForId(activity.taskId)
    return new ActivityNodeStyle(getTaskColor(task))
  }
  nodesSource.nodeCreator.tagProvider = (activity): Activity => activity

  nodesSource.nodeCreator.createLabelBinding('name')

  // Create all nodes of the graph
  graphBuilder.buildGraph()

  // Now add the edges, which require specific port location models, so we cannot create
  // them via GraphBuilder
  for (const activity of dataModel.activities) {
    const targetNode = graphBuilder.getNodeById(activity.id)!
    for (const dependency of activity.dependencies || []) {
      const sourceNode = graphBuilder.getNodeById(dependency)
      if (sourceNode) {
        const sourcePort = graph.addPort(sourceNode, FreeNodePortLocationModel.NODE_RIGHT_ANCHORED)
        const targetPort = graph.addPort(targetNode, FreeNodePortLocationModel.NODE_LEFT_ANCHORED)
        graph.createEdge(sourcePort, targetPort)
      }
    }
  }

  // put overlapping nodes in sub rows
  await updateSubRows(graphComponent, false)
}

/**
 *  Creates and assigns the default styles for graph items
 */
function initializeStyles(): void {
  // set the activity node style as default in the graph
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ActivityNodeStyle(colorPalette[0])
  // set a default label style with character wrapping
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    textFill: '#fff',
    wrapping: TextWrapping.CHARACTER_ELLIPSIS,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER,
    verticalTextAlignment: VerticalTextAlignment.CENTER
  })
  // set the label model that places the label centered in the "main" activity part of the node
  graph.nodeDefaults.labels.layoutParameter = new ActivityNodeLabelModel().createDefaultParameter()

  // set the edge style as graph default
  graph.edgeDefaults.style = new RoutingEdgeStyle(20, 20)

  // disable default node decorators
  const nodeDecorator = graph.decorator.nodeDecorator
  nodeDecorator.reshapeHandleProviderDecorator.hideImplementation()
  nodeDecorator.positionHandlerDecorator.setImplementationWrapper(
    (node, wrappedHandler) => new ActivityNodePositionHandler(node!, wrappedHandler)
  )
  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    nodeStyle: VoidNodeStyle.INSTANCE
  })
}

/**
 * Does the necessary updates after all structural graph changes,
 * i.e. updating the sub-row information and refreshing the background.
 */
async function onGraphModified(): Promise<void> {
  // update the multi-line placement
  await updateSubRows(graphComponent, true)
  // update the lane height of each task
  taskComponent.updateTasks()

  updateScrollArea()

  // trigger a background refresh
  graphComponent.backgroundGroup.dirty = true
  graphComponent.invalidate()
}

/**
 * Configures the main graph component displaying activities and their dependencies.
 */
function createGraphComponent(): GraphComponent {
  const gc = new GraphComponent('graphComponent')
  applyDemoTheme(gc)

  // switch on the horizontal scrollbar
  gc.horizontalScrollBarPolicy = ScrollBarVisibility.ALWAYS
  // switch off mousewheel zoom
  gc.mouseWheelBehavior = MouseWheelBehaviors.SCROLL
  gc.mouseWheelScrollFactor = 50

  // install a viewport limiter, so it's impossible to scroll out of the graph area
  gc.viewportLimiter = new RestrictedViewportLimiter()

  // limit zoom to 1
  gc.maximumZoom = 1
  gc.minimumZoom = 1

  // add the background visualization to the component
  const gridVisual = new GridVisual(dataModel)
  gc.backgroundGroup.addChild(gridVisual, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)

  // Use a different look for the handles that change the lead/follow-up time of activities
  gc.resources.set(HandleInputMode.HANDLE_DRAWING_RESIZE_VARIANT2_KEY, new TimeHandleTemplate())

  gc.addViewportChangedListener(() => hideActivityInfo())

  return gc
}

/**
 * Updates the scrollable area for the component.
 */
function updateScrollArea(): void {
  graphComponent.updateContentRect()
  const mainCr = graphComponent.contentRect

  // updateContentRect for the graphComponent will calculate the y-coordinate and the height
  // of the content rectangle from the bounds of all activity nodes.
  // Instead, we want the y-direction to extend from 0 to the total height of all tasks.
  graphComponent.contentRect = new Rect(mainCr.x, 0, mainCr.width, getTotalTasksHeight())
}

void run().then(finishLoading)
