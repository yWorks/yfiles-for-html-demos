/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Arrow,
  ArrowType,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  HierarchicLayout,
  HierarchicLayoutBusDescriptor,
  HierarchicLayoutData,
  ICommand,
  IEdge,
  License,
  PolylineEdgeStyle
} from 'yfiles'

import SampleData from './resources/SampleData.js'
import { initDemoStyles } from '../../resources/demo-styles.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

const busStructuresToggle = document.getElementById('bus-structures-toggle')
const beforeBusSlider = document.getElementById('before-bus-slider')
const afterBusSlider = document.getElementById('after-bus-slider')
const busSliders = document.getElementById('bus-sliders')
const busPresetSelect = document.getElementById('bus-preset-select')

/** @type {GraphComponent} */
let graphComponent = null

/** @type {boolean} */
let layoutRunning = false

/**
 * A collection of colors which is used to distinguish the different buses.
 * @type {string[]}
 */
const colors = [
  'crimson',
  'darkturquoise',
  'cornflowerblue',
  'darkslateblue',
  'gold',
  'mediumslateblue',
  'forestgreen',
  'mediumvioletred',
  'darkcyan',
  'chocolate',
  'limegreen',
  'mediumorchid',
  'royalblue',
  'orangered'
]

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  // configure the input mode
  graphComponent.inputMode = new GraphEditorInputMode()
  graphComponent.graph.undoEngineEnabled = true

  // create the graph
  loadGraph(graphComponent.graph)
  runLayout()

  // clear the undo engine to prevent undo of initial graph
  graphComponent.graph.undoEngine.clear()

  registerCommands()
  showApp(graphComponent)
}

/**
 * Applies the {@link HierarchicLayout} configured with the {@link HierarchicLayoutData} as given
 * by the current UI state.
 */
async function runLayout() {
  if (layoutRunning) {
    return
  }
  layoutRunning = true
  disableUI(true)

  // clear previous edge highlights
  const graph = graphComponent.graph
  graph.edges.forEach(edge => graph.setStyle(edge, graph.edgeDefaults.getStyleInstance()))

  const layout = new HierarchicLayout({
    orthogonalRouting: true,
    automaticEdgeGrouping: true
  })
  const layoutData = createHierarchicLayoutData()

  // apply the layout
  try {
    await graphComponent.morphLayout({ layout, layoutData, morphDuration: '700ms' })
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  } finally {
    layoutRunning = false
    disableUI(false)
  }
}

/**
 * Loads the graph from the sample JSON data and configures some default styles.
 */
function loadGraph(graph) {
  initDemoStyles(graph)
  graph.nodeDefaults.shareStyleInstance = false
  graph.nodeDefaults.style.cssClass = 'node-color'
  graph.nodeDefaults.size = [50, 30]
  graph.edgeDefaults.style = getEdgeStyle('#BBBBBB')
  graph.edgeDefaults.shareStyleInstance = false

  const data = SampleData
  const builder = new GraphBuilder(graph)
  builder.createNodesSource(data.nodes, 'id')
  builder.createEdgesSource(data.edges, 'source', 'target')
  builder.buildGraph()
}

/**
 * Creates the layout data for the {@link HierarchicLayout} based on the current UI state.
 * @return {HierarchicLayoutData}
 */
function createHierarchicLayoutData() {
  const hierarchicLayoutData = new HierarchicLayoutData()

  // parse the current UI state to create the respective configuration
  if (busStructuresToggle.checked) {
    // we assign buses to each star structure with more than 5 incoming/outgoing edges
    const busStructures = getBusStructures()
    busStructures.forEach(edgeList => {
      highlightEdges(edgeList)

      const busDescriptor = new HierarchicLayoutBusDescriptor()

      // maybe limit the bus structure sizes
      const busSettings = getBusSettings(busPresetSelect.value, edgeList.size)
      if (busSettings) {
        busDescriptor.maximumNodesBeforeBus = busSettings.maxBeforeBus
        busDescriptor.maximumNodesAfterBus = busSettings.maxAfterBus
      }

      // add the bus descriptor to the layout data
      const busCollection = hierarchicLayoutData.buses.add(busDescriptor)

      // specify which edges are part of this bus
      busCollection.items = edgeList
    })
  }

  return hierarchicLayoutData
}

/**
 * Returns settings for the bus structures of the {@link HierarchicLayoutData} based on the current
 * UI state.
 * @param {string} preset A selected preset in the UI
 * @param {number} elementCount The number of elements in the bus that is to be configured
 * @return {null | {maxBeforeBus: number, maxAfterBus: number}}
 */
function getBusSettings(preset, elementCount) {
  let beforeBusValue
  let afterBusValue
  switch (preset) {
    case 'balanced':
      return null // the default bus structure setting without further configuration
    case 'squares':
      // eslint-disable-next-line no-case-declarations
      const rowLength = Math.ceil(Math.sqrt(elementCount))
      beforeBusValue = Math.floor(rowLength / 2)
      afterBusValue = Math.ceil(rowLength / 2)
      break
    case 'leaves':
      beforeBusValue = 1
      afterBusValue = 1
      break
    case 'left-aligned':
      beforeBusValue = 0
      afterBusValue = Number.POSITIVE_INFINITY
      break
    case 'right-aligned':
      beforeBusValue = Number.POSITIVE_INFINITY
      afterBusValue = 0
      break
    case 'custom':
      beforeBusValue = parseInt(beforeBusSlider.value)
      afterBusValue = parseInt(afterBusSlider.value)
  }
  setSliderValue('before-bus-slider', beforeBusValue)
  setSliderValue('after-bus-slider', afterBusValue)
  return {
    maxBeforeBus: beforeBusValue,
    maxAfterBus: afterBusValue
  }
}

/**
 * Helper function to set a value to a given slider element in the UI.
 */
function setSliderValue(sliderId, value) {
  const slider = document.getElementById(sliderId)
  const sliderLabel = slider.nextElementSibling
  slider.value = isFinite(value) ? value : 20
  sliderLabel.textContent = value.toString()
}

/**
 * Returns an array of edge lists that should be grouped into a bus structure. This demo identifies
 * those structure by looking for stars that are made up from incoming or outgoing edges.
 * @return {IListEnumerable.<IEdge>[]} An array of edge lists that should be grouped into a bus.
 */
function getBusStructures() {
  const busStructures = []
  const graph = graphComponent.graph

  // find star roots with incoming edges
  const starRootsIncoming = graphComponent.graph.nodes.filter(node => {
    return graphComponent.graph.inEdgesAt(node).size > 5
  })
  starRootsIncoming.forEach(root => busStructures.push(graph.inEdgesAt(root)))

  // find star roots with outgoing edges
  const starRootsOutgoing = graphComponent.graph.nodes.filter(node => {
    return graphComponent.graph.outEdgesAt(node).size > 5
  })
  starRootsOutgoing.forEach(root => busStructures.push(graph.outEdgesAt(root)))

  return busStructures
}

/**
 * Highlights the given edges by applying a specific color to each edge.
 * @param {IListEnumerable.<IEdge>} edgeList
 */
function highlightEdges(edgeList) {
  const graph = graphComponent.graph

  // in this demo we just assign a color based on the number of edges for the bus structure
  const color = colors[edgeList.size % colors.length]
  edgeList.forEach(edge => {
    graph.setStyle(edge, getEdgeStyle(color))
  })
}

/**
 * Returns an edge style with the given color.
 * @param {string} color
 * @return {PolylineEdgeStyle}
 */
function getEdgeStyle(color) {
  return new PolylineEdgeStyle({
    stroke: `3px ${color}`,
    targetArrow: new Arrow({
      fill: color,
      type: ArrowType.TRIANGLE
    }),
    smoothingLength: 15
  })
}

/**
 * Helper function to disable UI during layout animation
 * @param {boolean} disabled
 */
function disableUI(disabled) {
  busStructuresToggle.disabled = disabled
  busPresetSelect.disabled = disabled || !busStructuresToggle.checked
  beforeBusSlider.disabled =
    disabled || !busStructuresToggle.checked || busPresetSelect.value !== 'custom'
  afterBusSlider.disabled =
    disabled || !busStructuresToggle.checked || busPresetSelect.value !== 'custom'
}

/**
 * Binds commands to the buttons in the toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  bindChangeListener("input[data-command='ToggleBusStructures']", useBusStructures => {
    busSliders.style.opacity = useBusStructures && busPresetSelect.value === 'custom' ? '1' : '0.5'
    runLayout()
  })

  bindChangeListener("select[data-command='SelectBusPreset']", preset => {
    busSliders.style.opacity = preset === 'custom' ? '1' : '0.5'
    if (preset === 'custom') {
      if (afterBusSlider.nextElementSibling.textContent === 'Infinity') {
        setSliderValue('after-bus-slider', 5)
      }
      if (beforeBusSlider.nextElementSibling.textContent === 'Infinity') {
        setSliderValue('before-bus-slider', 5)
      }
    }
    runLayout()
  })

  bindChangeListener('#before-bus-slider', () => {
    document.getElementById('before-bus-label').textContent = beforeBusSlider.value.toString()
    runLayout()
  })

  bindChangeListener('#after-bus-slider', () => {
    document.getElementById('after-bus-label').textContent = afterBusSlider.value.toString()
    runLayout()
  })

  bindAction("button[data-command='Layout']", runLayout)
}

// run the demo
loadJson().then(run)
