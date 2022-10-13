/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.5.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  DefaultGraph,
  DragDropEffects,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IEdge,
  IEnumerable,
  IGraph,
  IModelItem,
  INode,
  InputModeEventArgs,
  Insets,
  ItemEventArgs,
  License,
  MoveInputMode,
  PolylineEdgeStyle,
  QueryContinueDragEventArgs,
  Rect,
  ShapeNodeShape,
  ShapeNodeStyle,
  Stroke,
  SvgExport
} from 'yfiles'
import { GraphDropInputMode } from '../../input/graph-drag-and-drop/GraphDropInputMode'
import { ClearAreaLayoutHelper } from './ClearAreaLayoutHelper'
import { addClass, bindAction, bindCommand, removeClass, showApp } from '../../resources/demo-app'

import { applyDemoTheme } from '../../resources/demo-styles'
import { fetchLicense } from '../../resources/fetch-license'
import { BrowserDetection } from '../../utils/BrowserDetection'

// @ts-ignore
let graphComponent: GraphComponent = null

/**
 * Performs layout and animation during the drag and drop operation.
 */
// @ts-ignore
let layoutHelper: ClearAreaLayoutHelper = null

/**
 * Determines whether or not components are kept during drag.
 */
let keepComponents = false

/**
 * Counts the components and is used as component id.
 */
let componentCount = 0

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  initializeInputModes()
  initializeGraph()
  await initializePalette()

  await loadSampleGraph()
  registerCommands()

  showApp(graphComponent)
}

/**
 * Registers the {@link GraphEditorInputMode} as the {@link CanvasComponent.inputMode}
 * and initializes the input mode for dropping components.
 */
function initializeInputModes(): void {
  // create a GraphEditorInputMode instance
  const graphEditorInputMode = new GraphEditorInputMode({
    focusableItems: 'none'
  })
  // add newly created nodes to their only component
  graphEditorInputMode.addNodeCreatedListener(
    (sender, event) => (event.item.tag = { component: componentCount++ })
  )
  // change color of new edges to the color of the component if source and target belong to the same component
  graphEditorInputMode.createEdgeInputMode.addEdgeCreatedListener((sender, event) => {
    const edge = event.item
    if (edge.sourceNode!.tag.component === edge.targetNode!.tag.component) {
      graphComponent.graph.setStyle(
        edge,
        new PolylineEdgeStyle({
          stroke: new Stroke((edge.sourceNode!.style as ShapeNodeStyle).fill, 5)
        })
      )
    }
  })

  // add a new component id to nodes in duplicated component
  const duplicateCopier = graphComponent.clipboard.duplicateCopier
  duplicateCopier.addNodeCopiedListener((sender, event) => {
    event.copy.tag = { component: componentCount }
  })
  // add a new component id to nodes in copied component
  const fromCopier = graphComponent.clipboard.fromClipboardCopier
  fromCopier.addNodeCopiedListener((sender, event) => {
    event.copy.tag = { component: componentCount }
  })
  graphEditorInputMode.addElementsDuplicatedListener(() => {
    updateGraph()
    componentCount++
  })
  graphEditorInputMode.addElementsPastedListener(() => {
    updateGraph()
    componentCount++
  })

  // configure move input mode to drag components
  graphEditorInputMode.moveInputMode.addDragStartedListener(onDragStarted)
  graphEditorInputMode.moveInputMode.addDraggedListener(onDragged)
  graphEditorInputMode.moveInputMode.addDragFinishedListener(onDragFinished)
  graphEditorInputMode.moveInputMode.addDragCanceledListener(onDragCanceled)

  // add the input mode to drop components
  const graphDropInputMode = new GraphDropInputMode()
  graphDropInputMode.addDragEnteredListener(onDragStarted)
  graphDropInputMode.addDragOverListener(onDragged)
  graphDropInputMode.addItemCreatedListener(onDragFinished)
  graphDropInputMode.addDragLeftListener(onDragCanceled)
  graphEditorInputMode.add(graphDropInputMode)

  let deleting = false
  graphEditorInputMode.addDeletingSelectionListener(() => (deleting = true))
  graphEditorInputMode.addDeletedSelectionListener(() => (deleting = false))

  // select the whole component when selecting a graph element
  graphComponent.selection.addItemSelectionChangedListener((sender, event) => {
    if (deleting) {
      return
    }

    let changedNode: INode | null = null
    if (event.item instanceof INode) {
      changedNode = event.item
    } else if (event.item instanceof IEdge) {
      changedNode =
        event.item.sourceNode!.tag.component === event.item.targetNode!.tag.component
          ? event.item.sourceNode
          : null
    }

    if (changedNode) {
      const component = graphComponent.graph.nodes.filter(
        (node: INode) => node.tag.component === changedNode!.tag.component
      )
      component.forEach((node: INode) => {
        graphComponent.selection.setSelected(node, event.itemSelected)
        graphComponent.graph.edgesAt(node).forEach(edge => {
          if (component.includes(edge.sourceNode!) && component.includes(edge.targetNode!)) {
            edge.bends.forEach(bend => {
              graphComponent.selection.setSelected(bend, event.itemSelected)
            })
            graphComponent.selection.setSelected(edge, event.itemSelected)
          }
        })
      })
    }
  })

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Updates the graph after a component was added using clipboard operations
 */
function updateGraph(): void {
  const component = graphComponent.graph.nodes
    .filter(node => node.tag.component === componentCount)
    .toList()

  const layoutHelper = new ClearAreaLayoutHelper(graphComponent, component, keepComponents)
  layoutHelper.initializeLayout()
  layoutHelper.runLayout()

  // update the selection of the new component
  graphComponent.selection.clear()
  graphComponent.graph.nodes.forEach(node =>
    graphComponent.selection.setSelected(node, node.tag.component === componentCount)
  )
}

/**
 * Initializes the default styles.
 */
function initializeGraph(): void {
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
async function initializePalette(): Promise<void> {
  // retrieve the panel element
  const panel = document.getElementById('palette')

  let sampleComponents: Array<object> = []
  const response = await fetch('./resources/PaletteComponents.json')
  if (response.ok) {
    sampleComponents = await response.json()
  }

  // add a visual for each node style to the palette
  sampleComponents.forEach(component => {
    addComponentVisual(component, panel!)
  })
}

/**
 * Creates and adds a visual for the given style in the drag and drop panel.
 */
function addComponentVisual(component: any, panel: HTMLElement): void {
  const componentGraph = getComponentGraph(component)
  const div = document.createElement('div')
  div.setAttribute('style', 'width: 150px; height: 150px; margin: 10px auto; cursor: grab;')
  const img = document.createElement('img')
  img.setAttribute('style', 'width: auto; height: auto;')
  img.setAttribute('src', createComponentVisual(componentGraph))

  const startDrag = (): void => {
    const dragPreview = document.createElement('div')
    dragPreview.appendChild(img.cloneNode(true))

    const dragSource = GraphDropInputMode.startDrag(
      div,
      componentGraph,
      DragDropEffects.ALL,
      true,
      BrowserDetection.pointerEvents ? dragPreview : null
    )

    dragSource.addQueryContinueDragListener((src: object, args: QueryContinueDragEventArgs) => {
      if (args.dropTarget === null) {
        removeClass(dragPreview, 'hidden')
      } else {
        addClass(dragPreview, 'hidden')
      }
    })
  }

  img.addEventListener(
    'mousedown',
    event => {
      startDrag()
      event.preventDefault()
    },
    false
  )
  img.addEventListener(
    'touchstart',
    event => {
      startDrag()
      event.preventDefault()
    },
    BrowserDetection.passiveEventListeners ? { passive: false } : false
  )
  div.appendChild(img)
  panel.appendChild(div)
}

/**
 * Builds a graph from the given component.
 * @yjs:keep=nodeData,edgeData
 */
function getComponentGraph(component: any): IGraph {
  const componentGraph = new DefaultGraph()
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
    layout: (data: any) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  builder.createEdgesSource(component.edgeData, 'source', 'target', 'id')

  return builder.buildGraph()
}

/**
 * Creates an SVG data string for a node with the given style.
 */
function createComponentVisual(componentGraph: IGraph): string {
  const exportComponent = new GraphComponent()
  exportComponent.graph = componentGraph

  exportComponent.updateContentRect(new Insets(5))

  const svgExport = new SvgExport(exportComponent.contentRect)
  const svg = svgExport.exportSvg(exportComponent)
  const svgString = SvgExport.exportSvgString(svg)
  return SvgExport.encodeSvgDataUrl(svgString)
}

/**
 * The component is upon to be moved or resized.
 */
function onDragStarted(sender: object): void {
  let component
  if (sender instanceof GraphDropInputMode) {
    const graphDropInputMode = sender
    const graph = graphDropInputMode.dropData as IGraph
    component = graph.nodes
  } else if (sender instanceof MoveInputMode) {
    const moveInputMode = sender
    component = moveInputMode.affectedItems.filter(item => item instanceof INode)
  }
  layoutHelper = new ClearAreaLayoutHelper(
    graphComponent,
    component as IEnumerable<INode>,
    keepComponents
  )
  layoutHelper.initializeLayout()
}

/**
 * The component is currently be moved or resized.
 * For each drag a new layout is calculated and applied if the previous one is completed.
 */
function onDragged(sender: object): void {
  if (sender instanceof GraphDropInputMode) {
    const graphDropInputMode = sender
    layoutHelper.location = graphDropInputMode.mousePosition.toPoint()
  } else if (sender instanceof MoveInputMode) {
    const moveInputMode = sender
    layoutHelper.location =
      moveInputMode.inputModeContext!.canvasComponent!.lastEventLocation.toPoint()
  }
  layoutHelper.runLayout()
}

/**
 * Dragging the component has been canceled.
 * The state before the gesture must be restored.
 */
function onDragCanceled(): void {
  layoutHelper.cancelLayout()
}

/**
 * The component has been dropped.
 * We execute the layout to the final state.
 */
function onDragFinished(
  sender: object,
  itemEventArgs: ItemEventArgs<IGraph> | InputModeEventArgs
): void {
  if (sender instanceof GraphDropInputMode) {
    const graphDropInputMode = sender
    const eventArgs = itemEventArgs as ItemEventArgs<IGraph>
    layoutHelper.location = graphDropInputMode.dropLocation
    layoutHelper.component = eventArgs.item.nodes
    // specify the dropped nodes as a single component
    eventArgs.item.nodes.forEach(node => {
      node.tag = { component: componentCount }
    })
    componentCount++
    layoutHelper.finishLayout()
  } else if (sender instanceof MoveInputMode) {
    const moveInputMode = sender
    layoutHelper.location =
      moveInputMode.inputModeContext!.canvasComponent!.lastEventLocation.toPoint()
    layoutHelper.component = moveInputMode.affectedItems.filter(
      (item: IModelItem) => item instanceof INode
    ) as IEnumerable<INode>
  }
}

/**
 * Loads the initial graph.
 * @yjs:keep=nodeData,edgeData
 */
async function loadSampleGraph(): Promise<void> {
  const response = await fetch('./resources/SampleGraph.json')
  if (response.ok) {
    const sample = await response.json()

    const defaultNodeSize = graphComponent.graph.nodeDefaults.size
    const builder = new GraphBuilder(graphComponent.graph)
    builder.createNodesSource({
      data: sample.nodeData,
      id: 'id',
      layout: (data: any) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
    })
    builder.createEdgesSource(sample.edgeData, 'source', 'target', 'id')
    builder.buildGraph()

    graphComponent.fitGraphBounds()

    graphComponent.graph.nodes.forEach(node => {
      node.tag.component = componentCount
    })
    componentCount++
  }
}

/**
 * Registers commands and actions for the items in the toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  bindAction("input[data-command='KeepComponents']", () => {
    keepComponents = !keepComponents
  })
}

// noinspection JSIgnoredPromiseFromCall
run()
