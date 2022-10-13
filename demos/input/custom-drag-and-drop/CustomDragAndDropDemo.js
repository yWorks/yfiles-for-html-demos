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
import {
  DragDropEffects,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IGraph,
  License,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size
} from 'yfiles'
import { bindCommand, showApp } from '../../resources/demo-app.js'
import { ColorDropInputMode } from './ColorDropInputMode.js'
import SampleData from './resources/SampleData.js'

import { applyDemoTheme } from '../../resources/demo-styles.js'
import { fetchLicense } from '../../resources/fetch-license.js'
import { BrowserDetection } from '../../utils/BrowserDetection.js'

const PALETTE_SIZE = 15

/**
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  initializeInputModes(graphComponent)

  initializeStyles(graphComponent.graph)

  initializePalette()

  createSampleGraph(graphComponent.graph)

  // center the sample graph in the visible area
  graphComponent.fitGraphBounds()

  // enable undo and redo
  graphComponent.graph.undoEngineEnabled = true

  registerCommands(graphComponent)

  showApp(graphComponent)
}

/**
 * Adds support for drop operations and enables interactive editing for the given graph component.
 * @param {!GraphComponent} graphComponent
 */
function initializeInputModes(graphComponent) {
  const graphEditorInputMode = new GraphEditorInputMode()

  // add the input mode to drop colors
  graphEditorInputMode.add(new ColorDropInputMode())

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Specifies the default styles for nodes and edges.
 * @param {!IGraph} graph
 */
function initializeStyles(graph) {
  graph.nodeDefaults.size = new Size(50, 50)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ELLIPSE,
    fill: 'darkgray',
    stroke: '#00ffffff'
  })

  graph.edgeDefaults.shareStyleInstance = false
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '5px solid darkgray'
  })
}

/**
 * Creates a sample graph for this demo.
 * @param {!IGraph} graph
 */
function createSampleGraph(graph) {
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
function initializePalette() {
  const palette = document.getElementById('palette')
  generateColors(PALETTE_SIZE, 100, 50)
    .map(color => createPaletteEntry(color))
    .forEach(entry => palette.appendChild(entry))
}

/**
 * Creates an array with the specified count of different colors.
 * @param {number} count
 * @param {number} saturation
 * @param {number} lightness
 * @returns {!Array.<string>}
 */
function generateColors(count, saturation, lightness) {
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
 * @param {!string} color
 * @returns {!HTMLElement}
 */
function createPaletteEntry(color) {
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

    ColorDropInputMode.startDrag(
      paletteEntry,
      color,
      DragDropEffects.ALL,
      true,
      BrowserDetection.pointerEvents ? dragPreview : null
    )
  }

  // start the drop input mode when a drag from the palette begins
  paletteEntry.addEventListener(
    'dragstart',
    event => {
      event.preventDefault()
      startDrag()
    },
    false
  )

  return paletteEntry
}

/**
 * Registers commands and actions for the items in the toolbar.
 * @param {!GraphComponent} graphComponent
 */
function registerCommands(graphComponent) {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
}

// noinspection JSIgnoredPromiseFromCall
run()
