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
  Class,
  EdgePathLabelModel,
  EdgeSides,
  ExteriorLabelModel,
  GeneralPath,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphInputMode,
  GroupNodeStyle,
  GroupNodeStyleTabPosition,
  HandleInputMode,
  HandlePositions,
  HierarchicLayout,
  IGraph,
  IHandle,
  IHitTestable,
  IInputModeContext,
  LayoutExecutor,
  License,
  MoveInputMode,
  MutableRectangle,
  ObservableCollection,
  Point,
  RectangleHandle,
  RectangleIndicatorInstaller,
  Size
} from 'yfiles'

import PositionHandler from './PositionHandler'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import type { JSONGraph } from 'demo-utils/json-model'
import graphData from './graph-data.json'

/**
 * Application Features - Application Features Base
 *
 * The base application with a general toolbar and a ready to use {@link GraphComponent} that is
 * initialized with simple styles and a {@link GraphEditorInputMode} to enable default graph editing
 * gestures.
 */
let graphComponent: GraphComponent

/**
 * region that will be exported
 */
let exportRect: MutableRectangle = null!

/**
 * Bootstraps the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // create the input Mode and the rectangular indicator
  initializeInputModes()

  // configures default styles for newly created graph elements
  initializeGraph(graphComponent.graph)

  // build the graph from the given data set
  buildGraph(graphComponent.graph, graphData)

  // layout and center the graph
  Class.ensure(LayoutExecutor)
  graphComponent.graph.applyLayout(
    new HierarchicLayout({ orthogonalRouting: true, minimumLayerDistance: 35 })
  )
  graphComponent.fitGraphBounds()

  // enable undo after the initial graph was populated since we don't want to allow undoing that
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Creates nodes and edges according to the given data.
 */
function buildGraph(graph: IGraph, graphData: JSONGraph): void {
  const graphBuilder = new GraphBuilder(graph)

  graphBuilder.createNodesSource({
    data: graphData.nodeList.filter((item) => !item.isGroup),
    id: (item) => item.id,
    parentId: (item) => item.parentId
  })

  graphBuilder
    .createGroupNodesSource({
      data: graphData.nodeList.filter((item) => item.isGroup),
      id: (item) => item.id
    })
    .nodeCreator.createLabelBinding((item) => item.label)

  graphBuilder.createEdgesSource({
    data: graphData.edgeList,
    sourceId: (item) => item.source,
    targetId: (item) => item.target
  })

  graphBuilder.buildGraph()
}

/**
 *  Creates the input Mode and the rectangular indicator.
 */
function initializeInputModes(): void {
  // Create a GraphEditorInputMode instance
  const editMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  // and install the edit mode into the canvas.
  graphComponent.inputMode = editMode

  // create the model for the export rectangle
  exportRect = new MutableRectangle(-30, -30, 240, 240)

  // visualize it
  const installer = new RectangleIndicatorInstaller(exportRect)
  installer.addCanvasObject(
    graphComponent.createRenderContext(),
    graphComponent.backgroundGroup,
    exportRect
  )

  addExportRectInputModes(editMode)
}

/**
 * Adds the view modes that handle the resizing and movement of the export rectangle.
 */
function addExportRectInputModes(inputMode: GraphInputMode): void {
  // create a mode that deals with the handles
  const exportHandleInputMode = new HandleInputMode({
    priority: 1
  })
  // add it to the graph editor mode
  inputMode.add(exportHandleInputMode)

  // now the handles
  const newDefaultCollectionModel = new ObservableCollection<IHandle>()
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.NORTH_EAST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.NORTH_WEST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.SOUTH_EAST, exportRect))
  newDefaultCollectionModel.add(new RectangleHandle(HandlePositions.SOUTH_WEST, exportRect))
  exportHandleInputMode.handles = newDefaultCollectionModel

  // create a mode that allows for dragging the export rectangle at the sides
  const moveInputMode = new MoveInputMode({
    positionHandler: new PositionHandler(exportRect),
    hitTestable: IHitTestable.create((context: IInputModeContext, location: Point): boolean => {
      const path = new GeneralPath(5)
      path.appendRectangle(exportRect, false)
      return path.pathContains(location, context.hitTestRadius + 3 / context.zoom)
    })
  })

  // add it to the edit mode
  moveInputMode.priority = 41
  inputMode.add(moveInputMode)
}

/**
 * Initializes the defaults for the styling in this demo.
 *
 * @param graph The graph.
 */
function initializeGraph(graph: IGraph): void {
  // set styles for this demo
  initDemoStyles(graph)

  const groupNodeStyle = graph.groupNodeDefaults.style as GroupNodeStyle
  groupNodeStyle.tabPosition = GroupNodeStyleTabPosition.LEFT

  // set sizes and locations specific for this demo
  graph.nodeDefaults.size = new Size(40, 40)

  graph.nodeDefaults.labels.layoutParameter = new ExteriorLabelModel({
    insets: 5
  }).createParameter('south')
  graph.edgeDefaults.labels.layoutParameter = new EdgePathLabelModel({
    distance: 5,
    autoRotation: true
  }).createRatioParameter({ sideOfEdge: EdgeSides.BELOW_EDGE })
}

run().then(finishLoading)
