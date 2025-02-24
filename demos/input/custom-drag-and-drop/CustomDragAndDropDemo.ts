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
  DragDropEffects,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  IGraph,
  License,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size
} from '@yfiles/yfiles'
import { ColorDropInputMode } from './ColorDropInputMode'
import SampleData from './resources/SampleData'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { finishLoading } from '@yfiles/demo-resources/demo-page'

const PALETTE_SIZE = 15

async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  initializeInputModes(graphComponent)

  initializeStyles(graphComponent.graph)

  initializePalette()

  createSampleGraph(graphComponent.graph)

  // center the sample graph in the visible area
  graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Adds support for drop operations and enables interactive editing for the given graph component.
 */
function initializeInputModes(graphComponent: GraphComponent): void {
  const graphEditorInputMode = new GraphEditorInputMode()

  // add the input mode to drop colors
  graphEditorInputMode.add(new ColorDropInputMode())

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Specifies the default styles for nodes and edges.
 */
function initializeStyles(graph: IGraph): void {
  graph.nodeDefaults.size = new Size(50, 50)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: 'darkgray',
    stroke: '#ffffff00'
  })

  graph.edgeDefaults.shareStyleInstance = false
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px solid darkgray'
  })
}

/**
 * Creates a sample graph for this demo.
 */
function createSampleGraph(graph: IGraph): void {
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    layout: 'layout'
  })
  builder.createEdgesSource({
    data: SampleData.edges,
    id: 'id',
    sourceId: 'source',
    targetId: 'target'
  })
  builder.buildGraph()
}

/**
 * Populates the palette with some colors, which can be dragged from the palette and dropped onto
 * a node or edge.
 */
function initializePalette(): void {
  const palette = document.getElementById('palette')!
  generateColors(PALETTE_SIZE, 100, 50)
    .map((color) => createPaletteEntry(color))
    .forEach((entry) => palette.appendChild(entry))
}

/**
 * Creates an array with the specified count of different colors.
 */
function generateColors(count: number, saturation: number, lightness: number): string[] {
  const colors = []
  for (let i = 0; i < count; i++) {
    const hue = Math.trunc((360 / count) * i)
    const color = `hsla(${hue},${saturation}%,${lightness}%)`
    colors.push(color)
  }
  return colors
}

/**
 * Creates HTML element that visualizes the given color in the drag and drop panel.
 */
function createPaletteEntry(color: string): HTMLElement {
  // create an image that visualizes the color
  const paletteImage = document.createElement('div')
  paletteImage.className = 'palette-image'
  paletteImage.style.backgroundColor = color

  // create a div element that holds the image of the color
  const paletteEntry = document.createElement('div')
  paletteEntry.className = 'palette-entry'
  paletteEntry.draggable = true
  paletteEntry.appendChild(paletteImage)

  const startDrag = () => {
    const dragPreview = document.createElement('div')
    dragPreview.appendChild(paletteImage.cloneNode(true))

    ColorDropInputMode.startDrag(paletteEntry, color, DragDropEffects.ALL, true, dragPreview)
  }

  // start the drop input mode when a drag from the palette begins
  paletteEntry.addEventListener(
    'dragstart',
    (event) => {
      event.preventDefault()
      startDrag()
    },
    false
  )

  return paletteEntry
}

run().then(finishLoading)
