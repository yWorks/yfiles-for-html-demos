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
  DashStyle,
  EventArgs,
  GeneralPath,
  GraphComponent,
  GraphEditorInputMode,
  HandleInputMode,
  INode,
  License,
  List,
  ModifierKeys,
  MouseButtons,
  NodeStyleDecorationInstaller,
  PathType,
  Point,
  PointBasedSnapLine,
  Size,
  SnapContext,
  SnapLineOrientation,
  SnapLineSnapTypes,
  SnapLineVisualizationType,
  SnapResult,
  SnapTypes,
  Stroke
} from 'yfiles'

import EditablePathNodeStyle, { PathHandle, updateHandles } from './EditablePathNodeStyle'
import { applyDemoTheme, createDemoEdgeStyle } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent = null!

async function run(): Promise<void> {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  // initialize the graph
  initializeGraph()

  // initialize the input mode
  graphComponent.inputMode = createEditorMode()

  graphComponent.fitGraphBounds()

  graphComponent.graph.undoEngine!.clear()
}

/**
 * Sets a custom node style instance as a template for newly created
 * nodes in the graph.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph

  graph.undoEngineEnabled = true

  const selectionStroke = new Stroke({
    fill: 'black',
    thickness: 2,
    dashStyle: DashStyle.DASH
  }).freeze()

  // Highlight the selected nodes along their outline
  graph.decorator.nodeDecorator.selectionDecorator.setFactory(
    (node) => node.style instanceof EditablePathNodeStyle,
    (node) =>
      new NodeStyleDecorationInstaller({
        zoomPolicy: 'view-coordinates',
        margins: 0,
        nodeStyle: new EditablePathNodeStyle({
          path: (node.style as EditablePathNodeStyle).path,
          stroke: selectionStroke,
          fill: null
        })
      })
  )

  // Create a new style and use it as default node style
  graph.nodeDefaults.style = new EditablePathNodeStyle({
    fill: '#FF6C00',
    stroke: '1.5px #662b00'
  })
  graph.nodeDefaults.size = new Size(200, 200)

  // Set some defaults for the edges
  graph.edgeDefaults.style = createDemoEdgeStyle()

  // Create some graph elements with the above defined styles.
  createSampleGraph()
}

/**
 * Creates the default input mode for the graphComponent,
 * a {@link GraphEditorInputMode} configured to show and create path handles.
 */
function createEditorMode(): GraphEditorInputMode {
  const graphEditorInputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // add handle input to handle change shape handles
  const changeShapeHandleInputMode = new HandleInputMode({
    priority: graphEditorInputMode.handleInputMode.priority - 1,
    exclusive: true
  })
  graphEditorInputMode.add(changeShapeHandleInputMode)

  const locations: List<Point> = new List<Point>()
  changeShapeHandleInputMode.snapContext = new SnapContext()
  changeShapeHandleInputMode.snapContext.createSnapResultsModelManager(
    graphComponent
  ).canvasObjectGroup = graphComponent.inputModeGroup
  changeShapeHandleInputMode.snapContext.addInitializingListener((_, evt) => {
    locations.clear()
    if (currentNode) {
      const outline = currentNode.style.renderer
        .getShapeGeometry(currentNode, currentNode.style)
        .getOutline()
      if (outline) {
        const coords = [0, 0, 0, 0, 0, 0]
        const cursor = outline.createCursor()
        while (cursor.moveNext()) {
          switch (cursor.getCurrent(coords)) {
            case PathType.LINE_TO:
            case PathType.MOVE_TO:
              locations.add(cursor.currentEndPoint)
              break
          }
        }
      }
    }
  })

  changeShapeHandleInputMode.snapContext.addCollectSnapResultsListener((_, evt) => {
    locations
      .filter((p) => Math.abs(p.x - evt.newLocation.x) < evt.snapDistance)
      .forEach((p) => {
        const sl = new PointBasedSnapLine(
          new Point(p.x, evt.newLocation.y),
          SnapLineOrientation.VERTICAL,
          SnapLineSnapTypes.CENTER,
          SnapLineVisualizationType.BLANK_VARIABLE_LINE,
          p,
          null,
          1 / (1 + Math.abs(p.x - evt.newLocation.x))
        )
        evt.addSnapResult(
          SnapResult.createSnapLineSnapResult(
            1 / (1 + Math.abs(p.x - evt.newLocation.x)),
            new Point(p.x - evt.newLocation.x, 0),
            p,
            sl,
            new Point(p.x, evt.newLocation.y),
            null,
            SnapTypes.SNAPPED_X
          )
        )
      })
    locations
      .filter((p) => Math.abs(p.y - evt.newLocation.y) < evt.snapDistance)
      .forEach((p) => {
        const sl = new PointBasedSnapLine(
          new Point(evt.newLocation.x, p.y),
          SnapLineOrientation.HORIZONTAL,
          SnapLineSnapTypes.CENTER,
          SnapLineVisualizationType.BLANK_VARIABLE_LINE,
          p,
          null,
          1 / (1 + Math.abs(p.y - evt.newLocation.y))
        )
        evt.addSnapResult(
          SnapResult.createSnapLineSnapResult(
            1 / (1 + Math.abs(p.y - evt.newLocation.y)),
            new Point(0, p.y - evt.newLocation.y),
            p,
            sl,
            new Point(evt.newLocation.x, p.y),
            null,
            SnapTypes.SNAPPED_Y
          )
        )
      })
  })

  let currentNode: INode | null = null

  // hide handles when a node is removed
  graphComponent.graph.addNodeRemovedListener((_, evt) => {
    if (evt.item === currentNode) {
      changeShapeHandleInputMode.cancel()
      changeShapeHandleInputMode.handles.clear()
      currentNode = null
    }
  })

  // deselect the control point handles using right-click on canvas
  graphEditorInputMode.addCanvasClickedListener((_, evt) => {
    if (evt.mouseButtons === MouseButtons.RIGHT) {
      changeShapeHandleInputMode.handles.clear()
    }
  })

  // select existing or add new handles on double-click on path
  graphEditorInputMode.addItemLeftDoubleClickedListener((_, evt) => {
    if (evt.item instanceof INode && evt.item.style instanceof EditablePathNodeStyle) {
      const existingHandle = evt.item.style
        .getHandles(evt.context, evt.item)
        .find((handle) => handle.location.distanceTo(evt.location) < evt.context.hitTestRadius)
      if (existingHandle) {
        changeShapeHandleInputMode.handles.clear()
        // if we were clicked with the modifier presses, remove the corresponding segment instead
        if (
          (evt.modifiers & ModifierKeys.SHIFT) === ModifierKeys.SHIFT &&
          existingHandle instanceof PathHandle
        ) {
          existingHandle.removeSegment()
          currentNode = null
        } else {
          changeShapeHandleInputMode.handles.add(existingHandle)
          currentNode = evt.item
        }
        evt.handled = true
      } else if (evt.item.style.splitPath(evt.item, evt.location)) {
        changeShapeHandleInputMode.handles.clear()
        // find the closest handle, which should be the new handle...
        const createdHandle = evt.item.style
          .getHandles(evt.context, evt.item)
          .orderBy((handle) => handle.location.distanceTo(evt.location))
          .at(0)
        if (createdHandle) {
          changeShapeHandleInputMode.handles.clear()
          changeShapeHandleInputMode.handles.add(createdHandle)
          currentNode = evt.item
          evt.handled = true
        }
      } else {
        updateHandles(evt.item, changeShapeHandleInputMode)
        currentNode = evt.item
        evt.handled = true
      }
    }
  })

  // remove a handle and control point on right click
  graphEditorInputMode.addItemRightClickedListener((_, evt) => {
    let handle = null
    if (currentNode && changeShapeHandleInputMode.handles.size > 3) {
      handle = changeShapeHandleInputMode.handles.find(
        (h) => h instanceof PathHandle && h.location.distanceTo(evt.location) < 10
      )
      if (handle) {
        ;(handle as PathHandle).removeSegment()
        ;(currentNode.style as EditablePathNodeStyle).normalizePath(
          currentNode,
          graphEditorInputMode.graph!
        )

        // reset handles to update their locations and order
        changeShapeHandleInputMode.handles.clear()
        ;(currentNode.style as EditablePathNodeStyle)
          .getHandles(evt.context, currentNode)
          .forEach((handle) => changeShapeHandleInputMode.handles.add(handle))
        graphEditorInputMode.graph!.invalidateDisplays()
      }
    }
  })

  graphComponent.graph.undoEngine!.addUnitUndoneListener((_, evt) => {
    updateHandles(currentNode, changeShapeHandleInputMode)
  })
  graphComponent.graph.undoEngine!.addUnitRedoneListener((_, evt) => {
    updateHandles(currentNode, changeShapeHandleInputMode)
  })

  return graphEditorInputMode
}

/**
 * Creates the initial sample graph.
 */
function createSampleGraph(): void {
  const graph = graphComponent.graph
  graph.nodeDefaults.shareStyleInstance = false

  const n1 = graph.createNode()

  const path = new GeneralPath(4)
  path.moveTo(0, 0)
  path.lineTo(0.5, 0.25)
  path.lineTo(1, 0)
  path.lineTo(1, 1)
  path.lineTo(0, 1)
  path.close()

  const n2 = graph.createNode({
    layout: [300, 0, 200, 100],
    style: new EditablePathNodeStyle({ path, fill: '#FF6C00', stroke: '1.5px #662b00' })
  })

  graph.createEdge(n1, n2)
}

run().then(finishLoading)
