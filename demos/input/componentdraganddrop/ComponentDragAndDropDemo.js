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
  CanvasComponent,
  DragDropEffects,
  Graph,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IEdge,
  IEnumerable,
  IGraph,
  IModelItem,
  INode,
  InputModeEventArgs,
  ItemEventArgs,
  License,
  MoveInputMode,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Stroke,
  SvgExport
} from '@yfiles/yfiles'
import { GraphDropInputMode } from './GraphDropInputMode'
import { ClearAreaLayoutHelper } from './ClearAreaLayoutHelper'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'
let graphComponent = null
/**
 * Performs layout and animation during the drag and drop operation.
 */
let layoutHelper = null
/**
 * Determines whether components are kept during drag.
 */
let keepComponents = false
/**
 * Counts the components and is used as component id.
 */
let componentCount = 0
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('#graphComponent')
  initializeInputModes()
  initializeGraph()
  await initializePalette()
  await loadSampleGraph()
  initializeUI()
}
/**
 * Registers the {@link GraphEditorInputMode} as the {@link CanvasComponent.inputMode}
 * and initializes the input mode for dropping components.
 */
function initializeInputModes() {
  // create a GraphEditorInputMode instance
  const graphEditorInputMode = new GraphEditorInputMode({
    focusableItems: 'none'
  })
  // add newly created nodes to their only component
  graphEditorInputMode.addEventListener(
    'node-created',
    (evt) => (evt.item.tag = { component: componentCount++ })
  )
  // change color of new edges to the color of the component if source and target belong to the same component
  graphEditorInputMode.createEdgeInputMode.addEventListener('edge-created', (evt) => {
    const edge = evt.item
    if (edge.sourceNode.tag.component === edge.targetNode.tag.component) {
      graphComponent.graph.setStyle(
        edge,
        new PolylineEdgeStyle({
          stroke: new Stroke(edge.sourceNode.style.fill, 5)
        })
      )
    }
  })
  // add a new component id to nodes in duplicated component
  const duplicateCopier = graphComponent.clipboard.duplicateCopier
  duplicateCopier.addEventListener('node-copied', (evt) => {
    evt.copy.tag = { component: componentCount }
  })
  // add a new component id to nodes in copied component
  const fromCopier = graphComponent.clipboard.fromClipboardCopier
  fromCopier.addEventListener('node-copied', (evt) => {
    evt.copy.tag = { component: componentCount }
  })
  graphEditorInputMode.addEventListener('items-duplicated', () => {
    updateGraph()
    componentCount++
  })
  graphEditorInputMode.addEventListener('items-pasted', () => {
    updateGraph()
    componentCount++
  })
  // configure the move input mode to drag components
  // both moving of selected and unselected nodes can be supported,
  // so both moveSelectedItemsInputMode and moveUnselectedItemsInputMode have to be configured
  configureMoveInputModes(graphEditorInputMode.moveSelectedItemsInputMode)
  configureMoveInputModes(graphEditorInputMode.moveUnselectedItemsInputMode)
  // add the input mode to drop components
  const graphDropInputMode = new GraphDropInputMode()
  graphDropInputMode.addEventListener('drag-entered', function () {
    const graph = graphDropInputMode.dropData
    layoutHelper = new ClearAreaLayoutHelper(graphComponent, graph.nodes, keepComponents)
    layoutHelper.initializeLayout()
  })
  graphDropInputMode.addEventListener('drag-over', () => {
    layoutHelper.location = graphDropInputMode.pointerPosition.toPoint()
    layoutHelper.runLayout()
  })
  graphDropInputMode.addEventListener('item-created', (itemEventArgs) => {
    const eventArgs = itemEventArgs
    layoutHelper.location = graphDropInputMode.dropLocation
    layoutHelper.component = eventArgs.item.nodes
    // specify the dropped nodes as a single component
    eventArgs.item.nodes.forEach((node) => {
      node.tag = { component: componentCount }
    })
    componentCount++
    layoutHelper.finishLayout()
  })
  graphDropInputMode.addEventListener('drag-left', () => {
    layoutHelper.cancelLayout()
  })
  graphEditorInputMode.add(graphDropInputMode)
  let deleting = false
  graphEditorInputMode.addEventListener('deleting-selection', () => (deleting = true))
  graphEditorInputMode.addEventListener('deleted-selection', () => (deleting = false))
  // select the whole component when selecting a graph element
  graphComponent.selection.addEventListener('item-added', (evt) => {
    if (deleting) {
      return
    }
    onSelectionChanged(evt.item, true)
  })
  graphComponent.selection.addEventListener('item-removed', (evt) => {
    if (deleting) {
      return
    }
    onSelectionChanged(evt.item, false)
  })
  graphComponent.inputMode = graphEditorInputMode
}
/**
 * Updates the selected whenever an item is being selected or deselected.
 */
function onSelectionChanged(item, selected) {
  let changedNode = null
  if (item instanceof INode) {
    changedNode = item
  } else if (item instanceof IEdge) {
    changedNode =
      item.sourceNode.tag.component === item.targetNode.tag.component ? item.sourceNode : null
  }
  if (changedNode) {
    const component = graphComponent.graph.nodes.filter(
      (node) => node.tag.component === changedNode.tag.component
    )
    component.forEach((node) => {
      setSelected(node, selected)
      graphComponent.graph.edgesAt(node).forEach((edge) => {
        if (component.includes(edge.sourceNode) && component.includes(edge.targetNode)) {
          edge.bends.forEach((bend) => {
            setSelected(bend, selected)
          })
          setSelected(edge, selected)
        }
      })
    })
  }
}
/**
 * Adds the listeners for drag operations on the given inputMode.
 * This demo supports moving of both selected and unselected nodes.
 */
function configureMoveInputModes(moveInputMode) {
  moveInputMode.addEventListener('drag-started', onDragStarted)
  moveInputMode.addEventListener('dragged', onDragged)
  moveInputMode.addEventListener('drag-finished', dragFinished)
  moveInputMode.addEventListener('drag-canceled', dragCanceled)
}
/**
 * Selected or deselects the given item.
 */
function setSelected(item, selected) {
  if (selected) {
    graphComponent.selection.add(item)
  } else {
    graphComponent.selection.remove(item)
  }
}
/**
 * Initializes the layout when a node has been moved.
 */
function onDragStarted(_evt, moveInputMode) {
  const component = moveInputMode.affectedItems.filter((item) => item instanceof INode)
  layoutHelper = new ClearAreaLayoutHelper(graphComponent, component, keepComponents)
  layoutHelper.initializeLayout()
}
/**
 * Updates the layout when a node has been moved.
 */
function onDragged(_evt, _moveInputMode) {
  layoutHelper.location = graphComponent.lastEventLocation.toPoint()
  layoutHelper.runLayout()
}
/**
 * Finalizes the component after a node movement.
 */
function dragFinished(_evt, moveInputMode) {
  layoutHelper.location = graphComponent.lastEventLocation.toPoint()
  layoutHelper.component = moveInputMode.affectedItems.filter((item) => item instanceof INode)
}
/**
 * Cancels the layout when the drag operation has been canceled.
 */
function dragCanceled(_evt, _moveInputMode) {
  layoutHelper.cancelLayout()
}
/**
 * Updates the graph after a component was added using clipboard operations
 */
function updateGraph() {
  const component = graphComponent.graph.nodes
    .filter((node) => node.tag.component === componentCount)
    .toList()
  const layoutHelper = new ClearAreaLayoutHelper(graphComponent, component, keepComponents)
  layoutHelper.initializeLayout()
  layoutHelper.runLayout()
  // update the selection of the new component
  graphComponent.selection.clear()
  graphComponent.graph.nodes.forEach((node) =>
    setSelected(node, node.tag.component === componentCount)
  )
}
/**
 * Initializes the default styles.
 */
function initializeGraph() {
  graphComponent.graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: '#c1c1c1',
    stroke: null
  })
  graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px #c1c1c1'
  })
}
/**
 * Populates the palette with the graphs stored in the resources folder.
 */
async function initializePalette() {
  // retrieve the panel element
  const panel = document.querySelector('#palette')
  let sampleComponents = []
  const response = await fetch('./resources/PaletteComponents.json')
  if (response.ok) {
    sampleComponents = await response.json()
  }
  // add a visual for each node style to the palette
  sampleComponents.forEach((component) => {
    addComponentVisual(component, panel)
  })
}
/**
 * Creates and adds a visual for the given style in the drag and drop panel.
 */
function addComponentVisual(component, panel) {
  const componentGraph = getComponentGraph(component)
  const div = document.createElement('div')
  div.setAttribute(
    'style',
    'width: 150px; height: 150px; margin: 10px auto; cursor: grab; touch-action: none;'
  )
  const img = document.createElement('img')
  img.setAttribute('style', 'width: auto; height: auto;')
  img.setAttribute('src', createComponentVisual(componentGraph))
  const startDrag = () => {
    const dragPreview = document.createElement('div')
    dragPreview.appendChild(img.cloneNode(true))
    const dragSource = GraphDropInputMode.startDrag(
      div,
      componentGraph,
      DragDropEffects.ALL,
      true,
      dragPreview
    )
    dragSource.addEventListener('query-continue-drag', (evt) => {
      if (evt.dropTarget === null) {
        dragPreview.classList.remove('hidden')
      } else {
        dragPreview.classList.add('hidden')
      }
    })
  }
  img.addEventListener(
    'pointerdown',
    (event) => {
      startDrag()
      event.preventDefault()
    },
    false
  )
  div.appendChild(img)
  panel.appendChild(div)
}
/**
 * Builds a graph from the given component.
 * @yjs:keep = nodeData,edgeData
 */
function getComponentGraph(component) {
  const componentGraph = new Graph()
  componentGraph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ELLIPSE,
    stroke: component.color,
    fill: component.color
  })
  componentGraph.edgeDefaults.style = new PolylineEdgeStyle({ stroke: `5px ${component.color}` })
  const defaultNodeSize = componentGraph.nodeDefaults.size
  const builder = new GraphBuilder(componentGraph)
  builder.createNodesSource({
    data: component.nodeData,
    id: 'id',
    layout: (data) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  builder.createEdgesSource(component.edgeData, 'source', 'target', 'id')
  return builder.buildGraph()
}
/**
 * Creates an SVG data string for a node with the given style.
 */
function createComponentVisual(componentGraph) {
  const exportComponent = new GraphComponent()
  exportComponent.graph = componentGraph
  exportComponent.updateContentBounds(5)
  const svgExport = new SvgExport(exportComponent.contentBounds)
  const svg = svgExport.exportSvg(exportComponent)
  // Dispose of the component and remove its references to the graph
  exportComponent.cleanUp()
  exportComponent.graph = new Graph()
  const svgString = SvgExport.exportSvgString(svg)
  return SvgExport.encodeSvgDataUrl(svgString)
}
/**
 * Loads the initial graph.
 * @yjs:keep = nodeData,edgeData
 */
async function loadSampleGraph() {
  const response = await fetch('./resources/SampleGraph.json')
  if (response.ok) {
    const sample = await response.json()
    const defaultNodeSize = graphComponent.graph.nodeDefaults.size
    const builder = new GraphBuilder(graphComponent.graph)
    builder.createNodesSource({
      data: sample.nodeData,
      id: 'id',
      layout: (data) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
    })
    builder.createEdgesSource(sample.edgeData, 'source', 'target', 'id')
    builder.buildGraph()
    void graphComponent.fitGraphBounds()
    graphComponent.graph.nodes.forEach((node) => {
      node.tag.component = componentCount
    })
    componentCount++
  }
}
/**
 * Registers actions for the items in the toolbar.
 */
function initializeUI() {
  document.querySelector('#keep-components').addEventListener('click', () => {
    keepComponents = !keepComponents
  })
}
run().then(finishLoading)
