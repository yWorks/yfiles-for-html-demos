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
  DashStyle,
  GeneralPath,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  HandleInputMode,
  INode,
  License,
  List,
  NodeStyleIndicatorRenderer,
  OrthogonalSnapLine,
  PathType,
  Point,
  PointerButtons,
  Size,
  SnapConstraint,
  SnapLineOrientation,
  SnapLineSnapTypes,
  SnapReferenceVisualizationType,
  SnapResult,
  Stroke
} from '@yfiles/yfiles'
import { EditablePathNodeStyle, PathHandle, updateHandles } from './EditablePathNodeStyle'
import { createDemoEdgeStyle } from '@yfiles/demo-resources/demo-styles'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
let graphComponent = null
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  // initialize the graph
  initializeGraph()
  // initialize the input mode
  graphComponent.inputMode = createEditorMode()
  void graphComponent.fitGraphBounds()
  graphComponent.graph.undoEngine.clear()
}
/**
 * Sets a custom node style instance as a template for newly created
 * nodes in the graph.
 */
function initializeGraph() {
  const graph = graphComponent.graph
  graph.undoEngineEnabled = true
  const selectionStroke = new Stroke({
    fill: 'black',
    thickness: 2,
    dashStyle: DashStyle.DASH
  }).freeze()
  // Highlight the selected nodes along their outline
  graph.decorator.nodes.selectionRenderer.addFactory(
    (node) => node.style instanceof EditablePathNodeStyle,
    (node) =>
      new NodeStyleIndicatorRenderer({
        zoomPolicy: 'view-coordinates',
        margins: 0,
        nodeStyle: new EditablePathNodeStyle({
          path: node.style.path,
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
function createEditorMode() {
  const graphEditorInputMode = new GraphEditorInputMode()
  // add handle input to handle change shape handles
  const changeShapeHandleInputMode = new HandleInputMode({
    priority: graphEditorInputMode.handleInputMode.priority - 1,
    exclusive: true
  })
  graphEditorInputMode.add(changeShapeHandleInputMode)
  const locations = new List()
  changeShapeHandleInputMode.snapContext = new GraphSnapContext()
  changeShapeHandleInputMode.snapContext.createSnapResultsModelManager(
    graphComponent
  ).renderTreeGroup = graphComponent.renderTree.inputModeGroup
  changeShapeHandleInputMode.snapContext.addEventListener('initializing', () => {
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
  changeShapeHandleInputMode.snapContext.addEventListener('collect-snap-results', (evt) => {
    locations
      .filter((p) => Math.abs(p.x - evt.newLocation.x) < evt.snapDistance)
      .forEach((p) => {
        const location = new Point(p.x, evt.newLocation.y)
        const sl = new OrthogonalSnapLine(
          SnapLineOrientation.VERTICAL,
          SnapLineSnapTypes.CENTER,
          SnapReferenceVisualizationType.BLANK_VARIABLE_LINE,
          p,
          false,
          1 / (1 + Math.abs(p.x - evt.newLocation.x))
        )
        const constraint = SnapConstraint.createLineConstraint(
          location,
          evt.newLocation,
          evt.snapDistance,
          new Point(0, 1)
        )
        if (constraint) {
          evt.addSnapResult(
            SnapResult.createLineSnapResult(
              constraint,
              1 / (1 + Math.abs(p.x - evt.newLocation.x)),
              null,
              null,
              location,
              sl
            )
          )
        }
      })
    locations
      .filter((p) => Math.abs(p.y - evt.newLocation.y) < evt.snapDistance)
      .forEach((p) => {
        const location = new Point(evt.newLocation.x, p.y)
        const sl = new OrthogonalSnapLine(
          SnapLineOrientation.HORIZONTAL,
          SnapLineSnapTypes.CENTER,
          SnapReferenceVisualizationType.BLANK_VARIABLE_LINE,
          p,
          false,
          1 / (1 + Math.abs(p.y - evt.newLocation.y))
        )
        const constraint = SnapConstraint.createLineConstraint(
          location,
          evt.newLocation,
          evt.snapDistance,
          new Point(1, 0)
        )
        if (constraint) {
          evt.addSnapResult(
            SnapResult.createLineSnapResult(
              constraint,
              1 / (1 + Math.abs(p.y - evt.newLocation.y)),
              null,
              null,
              location,
              sl
            )
          )
        }
      })
  })
  let currentNode = null
  // hide handles when a node is removed
  graphComponent.graph.addEventListener('node-removed', (evt) => {
    if (evt.item === currentNode) {
      changeShapeHandleInputMode.cancel()
      changeShapeHandleInputMode.handles.clear()
      currentNode = null
    }
  })
  // deselect the control point handles using right-click on canvas
  graphEditorInputMode.addEventListener('canvas-clicked', (evt) => {
    if (evt.pointerButtons === PointerButtons.MOUSE_RIGHT) {
      changeShapeHandleInputMode.handles.clear()
    }
  })
  // select existing or add new handles on double-click on path
  graphEditorInputMode.addEventListener('item-left-double-clicked', (evt) => {
    if (evt.item instanceof INode && evt.item.style instanceof EditablePathNodeStyle) {
      const existingHandle = evt.item.style
        .getHandles(evt.item)
        .find((handle) => handle.location.distanceTo(evt.location) < evt.context.hitTestRadius)
      if (existingHandle) {
        changeShapeHandleInputMode.handles.clear()
        // if we were clicked with the modifier presses, remove the corresponding segment instead
        if (evt.shiftKey && existingHandle instanceof PathHandle) {
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
          .getHandles(evt.item)
          .toSorted((handle1, handle2) =>
            Math.sign(
              handle1.location.distanceTo(evt.location) - handle2.location.distanceTo(evt.location)
            )
          )
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
  graphEditorInputMode.addEventListener('item-right-clicked', (evt) => {
    let handle = null
    if (currentNode && changeShapeHandleInputMode.handles.size > 3) {
      handle = changeShapeHandleInputMode.handles.find(
        (h) => h instanceof PathHandle && h.location.distanceTo(evt.location) < 10
      )
      if (handle) {
        handle.removeSegment()
        currentNode.style.normalizePath(currentNode, graphEditorInputMode.graph)
        // reset handles to update their locations and order
        changeShapeHandleInputMode.handles.clear()
        currentNode.style
          .getHandles(currentNode)
          .forEach((handle) => changeShapeHandleInputMode.handles.add(handle))
        graphEditorInputMode.graph.invalidateDisplays()
      }
    }
  })
  graphComponent.graph.undoEngine.addEventListener('unit-undone', () => {
    updateHandles(currentNode, changeShapeHandleInputMode)
  })
  graphComponent.graph.undoEngine.addEventListener('unit-redone', () => {
    updateHandles(currentNode, changeShapeHandleInputMode)
  })
  return graphEditorInputMode
}
/**
 * Creates the initial sample graph.
 */
function createSampleGraph() {
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
