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
/* eslint-disable jsdoc/check-param-names */
import {
  CanvasComponent,
  DefaultGraph,
  DragDropEffects,
  EdgePathLabelModel,
  EdgeSides,
  FoldingManager,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphSnapContext,
  GridSnapTypes,
  IGraph,
  ILabelModelParameter,
  Insets,
  License,
  SvgExport
} from 'yfiles'
import { GraphDropInputMode } from './GraphDropInputMode'
import { applyDemoTheme, initDemoStyles } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'

let graphComponent: GraphComponent

let graphDropInputMode: GraphDropInputMode

async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // enable the option to expand and collapse group nodes
  const masterGraph = new DefaultGraph()
  const manager = new FoldingManager(masterGraph)
  graphComponent.graph = manager.createFoldingView().graph

  // enable undo support
  masterGraph.undoEngineEnabled = true

  initializeInputModes()

  initDemoStyles(graphComponent.graph, { foldingEnabled: true })

  await initializePalette()

  initializeUI()
}

/**
 * Registers the {@link GraphEditorInputMode} as the {@link CanvasComponent.inputMode}
 * and initializes the input mode for dropping graphs.
 */
function initializeInputModes(): void {
  // configure graph editor with snapping enabled
  const graphEditorInputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    snapContext: new GraphSnapContext({
      nodeToNodeDistance: 30,
      nodeToEdgeDistance: 20,
      snapOrthogonalMovement: false,
      snapDistance: 10,
      snapSegmentsToSnapLines: true,
      snapBendsToSnapLines: true,
      gridSnapType: GridSnapTypes.ALL
    })
  })

  // add the input mode to drop graphs
  graphDropInputMode = new GraphDropInputMode()
  graphDropInputMode.snappingEnabled = true
  graphDropInputMode.showPreview = true
  graphDropInputMode.allowFolderNodeAsParent = false
  graphEditorInputMode.add(graphDropInputMode)

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Populates the palette with the graphs stored in the 'resources' folder.
 */
async function initializePalette(): Promise<void> {
  const palette = document.getElementById('palette')!

  // load the graphs to drag from a JSON file
  const response = await fetch('./resources/graphs.json')
  if (response.ok) {
    const graphDataList = await response.json()
    // add for each graph a div element to the palette element
    graphDataList.forEach((graphData: any) => {
      const graph = toGraph(graphData)
      const paletteEntry = createPaletteEntry(graph)
      palette.appendChild(paletteEntry)
    })
  }
}

/**
 * Creates an HTML element that visualizes the given graph in the drag and drop panel.
 */
function createPaletteEntry(graph: IGraph): HTMLElement {
  // create an image that visualizes the graph
  const paletteImage = document.createElement('img')
  paletteImage.setAttribute('src', toSvg(graph))

  // create a div element that holds the image of the graph
  const paletteEntry = document.createElement('div')
  paletteEntry.appendChild(paletteImage)

  const startDrag = () => {
    const dragPreview = document.createElement('div')
    dragPreview.appendChild(paletteImage.cloneNode(true))

    // start the drop input mode when a drag from the palette begins
    const dragSource = GraphDropInputMode.startDrag(
      paletteEntry,
      graph,
      DragDropEffects.ALL,
      true,
      dragPreview
    )

    dragSource.addQueryContinueDragListener((src, evt) => {
      // hide the preview if there is currently to valid drop target
      if (evt.dropTarget) {
        dragPreview.classList.add('hidden')
      } else {
        dragPreview.classList.remove('hidden')
      }
    })
  }

  // listen for mouse drag events
  paletteEntry.addEventListener(
    'mousedown',
    (event) => {
      startDrag()
      event.preventDefault()
    },
    false
  )

  // listen for touch drag events
  paletteEntry.addEventListener(
    'touchstart',
    (event) => {
      startDrag()
      event.preventDefault()
    },
    { passive: false }
  )

  return paletteEntry
}

type NodeData = {
  id: number
  layout: {
    x: number
    y: number
    width: number
    height: number
  }
  label: string
  parent?: number
}

type EdgeData = {
  id: number
  source: number
  target: number
  label: {
    text: string
    ratio: number
  }
  bends?: { x: number; y: number }[]
}

type GraphData = {
  nodes: NodeData[]
  groups: NodeData[]
  edges: EdgeData[]
}

/**
 * Builds a graph from the given graph data.
 * @yjs:keep = nodes,edges
 */
function toGraph(graphData: GraphData): IGraph {
  // enable the option to expand and collapse group nodes
  const masterGraph = new DefaultGraph()
  const manager = new FoldingManager(masterGraph)
  const graph = manager.createFoldingView().graph

  initDemoStyles(graph, { foldingEnabled: true })

  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: graphData.nodes,
    id: 'id',
    parentId: 'parent',
    layout: 'layout',
    labels: ['label']
  })
  builder.createGroupNodesSource({
    data: graphData.groups,
    id: 'id',
    layout: 'layout',
    labels: ['label']
  })
  builder.createEdgesSource({
    data: graphData.edges,
    id: 'id',
    sourceId: 'source',
    targetId: 'target',
    labels: [{ text: 'label.text', layoutParameter: createLabelParameter }],
    bends: 'bends'
  })

  return builder.buildGraph()
}

/**
 * Creates an edge label parameter for placing a label along the path of an edge.
 * @param ratio The ratio at which to place the label at the edge path. A ratio of 0.0 will place
 * the label at the source side of the edge path, a ratio of 1.0 at the target side. The default is 0.5.
 */
function createLabelParameter({
  label: { ratio = 0.5 }
}: {
  label: { ratio: number }
}): ILabelModelParameter {
  return new EdgePathLabelModel().createRatioParameter({
    edgePathRatio: ratio,
    sideOfEdge: EdgeSides.ABOVE_EDGE
  })
}

/**
 * Creates an SVG image for the given graph.
 */
function toSvg(graph: IGraph): string {
  const exportComponent = new GraphComponent()
  exportComponent.graph = graph
  exportComponent.updateContentRect(new Insets(5))

  const svgExport = new SvgExport(exportComponent.contentRect)
  svgExport.scale = 0.5
  const svg = svgExport.exportSvg(exportComponent)
  const svgString = SvgExport.exportSvgString(svg)
  return SvgExport.encodeSvgDataUrl(svgString)
}

/**
 * Registers actions for the demo-specific items in the toolbar.
 */
function initializeUI(): void {
  const previewButton = document.querySelector<HTMLInputElement>('#show-preview')!
  const snappingButton = document.querySelector<HTMLInputElement>('#enable-snapping')!
  const folderButton = document.querySelector<HTMLInputElement>('#folders-as-parents')!

  // button to enable or disable the preview shown during the drag and drop operation
  previewButton.addEventListener('click', () => {
    graphDropInputMode.showPreview = previewButton.checked
    if (!previewButton.checked && snappingButton.checked) {
      snappingButton.click()
    }
  })

  // button to enable or disable the snapping during the drag and drop operation
  snappingButton.addEventListener('click', () => {
    graphDropInputMode.snappingEnabled = snappingButton.checked
    if (snappingButton.checked && !previewButton.checked) {
      previewButton.click()
    }
  })

  // button to allow or disable dropping of graphs on folder nodes
  folderButton.addEventListener('click', () => {
    graphDropInputMode.allowFolderNodeAsParent = folderButton.checked
  })
}

run().then(finishLoading)
