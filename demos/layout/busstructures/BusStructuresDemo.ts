/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
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
  IGraph,
  License,
  List,
  PolylineEdgeStyle,
  Size
} from 'yfiles'

import SampleData from './resources/SampleData'
import { DemoNodeStyle, initDemoStyles } from '../../resources/demo-styles'
import {
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

const busStructuresToggle = document.getElementById('bus-structures-toggle') as HTMLInputElement
const beforeBusSlider = document.getElementById('before-bus-slider') as HTMLInputElement
const afterBusSlider = document.getElementById('after-bus-slider') as HTMLInputElement
const busPresetSelect = document.getElementById('bus-preset-select') as HTMLSelectElement

/**
 * Displays the demo's graph.
 */
let graphComponent: GraphComponent

/**
 * State guard to prevent concurrent layout calculations.
 */
let layoutRunning = false

/**
 * A collection of colors which is used to distinguish the different buses.
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

/**
 * Bootstraps the demo.
 * @param licenseData The yFiles license information.
 */
async function run(licenseData: object): Promise<void> {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')

  configureGraph(graphComponent.graph)

  // create the demo's sample graph
  loadGraph(graphComponent.graph)

  // arange the sample graph
  await runLayout()

  // enable interactive editing
  graphComponent.inputMode = new GraphEditorInputMode()

  registerCommands()
  showApp(graphComponent)
}

/**
 * Arranges the demo's graph with {@link HierarchicLayout}.
 * The hierarchic layout algorithm is configured to route edges in bus structures.
 */
async function runLayout(): Promise<void> {
  if (layoutRunning) {
    return Promise.resolve()
  }
  layoutRunning = true
  disableUI(true)

  const graph = graphComponent.graph
  // we collect each star structure with more than 5 incoming/outgoing edges as a bus structure
  const busses = busStructuresToggle.checked ? getBusStructures(graph) : []

  // clear previous edge highlights
  graph.edges.forEach(edge => graph.setStyle(edge, graph.edgeDefaults.getStyleInstance()))
  // set new highlights: use a common line color for all edges belonging to the same bus structure
  for (const busEdges of busses) {
    highlightEdges(graph, busEdges)
  }

  // create a configured hierarchic layout instance
  const layout = new HierarchicLayout({
    orthogonalRouting: true,
    automaticEdgeGrouping: true
  })

  // create layout data that defines bus structures
  const layoutData = createHierarchicLayoutData(graph, busses)

  try {
    // apply the layout
    await graphComponent.morphLayout({ layout, layoutData, morphDuration: '700ms' })
  } catch (error) {
    const reporter = (window as any).reportError
    if (typeof reporter === 'function') {
      reporter(error)
    } else {
      throw error
    }
  } finally {
    layoutRunning = false
    disableUI(false)
  }
}

/**
 * Creates the layout data defining bus structures for the {@link HierarchicLayout} based
 * on the current UI state.
 * @param graph The graph that will be laid out.
 * @param busses An array of edge lists, each list defining one bus structure.
 */
function createHierarchicLayoutData(graph: IGraph, busses: List<IEdge>[]): HierarchicLayoutData {
  const hierarchicLayoutData = new HierarchicLayoutData()

  for (const busEdges of busses) {
    const busDescriptor = new HierarchicLayoutBusDescriptor()

    // maybe limit the bus structure sizes
    const busSettings = getBusSettings(busPresetSelect.value, busEdges.size)
    if (busSettings !== null) {
      busDescriptor.maximumNodesBeforeBus = busSettings.maxBeforeBus
      busDescriptor.maximumNodesAfterBus = busSettings.maxAfterBus
    }

    // add the bus descriptor to the layout data
    const busCollection = hierarchicLayoutData.buses.add(busDescriptor)

    // specify which edges are part of this bus
    busCollection.items = busEdges
  }

  return hierarchicLayoutData
}

/**
 * Returns settings for bus structure descriptors of {@link HierarchicLayoutData}.
 * @param busStylePreset The desired bus style preset.
 * @param elementCount The number of elements in the bus that is to be configured
 */
function getBusSettings(
  busStylePreset: string,
  elementCount: number
): { maxBeforeBus: number; maxAfterBus: number } | null {
  let beforeBusValue = 0
  let afterBusValue = 0
  switch (busStylePreset) {
    case 'balanced':
      // the default bus structure setting without further configuration
      return null
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
  return {
    maxBeforeBus: beforeBusValue,
    maxAfterBus: afterBusValue
  }
}

/**
 * Returns an array of edge lists. The edges in each list should be grouped into one bus structure.
 * This demo identifies those structure by looking for stars that are made up from incoming
 * or outgoing edges.
 * @param graph The graph to check for star structures.
 * @return An array of edge lists that should be grouped into a bus.
 */
function getBusStructures(graph: IGraph): List<IEdge>[] {
  const busStructures: List<IEdge>[] = []

  // find star roots with incoming edges
  const starRootsIncoming = graph.nodes.filter(node => graph.inEdgesAt(node).size > 5)
  starRootsIncoming.forEach(root => busStructures.push(graph.inEdgesAt(root).toList()))

  // find star roots with outgoing edges
  const starRootsOutgoing = graph.nodes.filter(node => graph.outEdgesAt(node).size > 5)
  starRootsOutgoing.forEach(root => busStructures.push(graph.outEdgesAt(root).toList()))

  return busStructures
}

/**
 * Highlights the given edges by applying a specific color to each edge.
 * @param graph The graph whose edges will be highlighted.
 * @param edgeList The edges that will be highlighted.
 */
function highlightEdges(graph: IGraph, edgeList: List<IEdge>): void {
  // in this demo we just assign a color based on the number of edges for the bus structure
  const style = newEdgeStyle(colors[edgeList.size % colors.length])
  for (const edge of edgeList) {
    graph.setStyle(edge, style)
  }
}

/**
 * Returns an edge style with the given color.
 * @param color The line color for the created edge style.
 */
function newEdgeStyle(color: string): PolylineEdgeStyle {
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
 * Configures default visualizations for the given graph.
 * @param graph The demo's graph.
 */
function configureGraph(graph: IGraph): void {
  initDemoStyles(graph)

  graph.nodeDefaults.shareStyleInstance = false
  ;(graph.nodeDefaults.style as DemoNodeStyle).cssClass = 'node-color'
  graph.nodeDefaults.size = new Size(50, 30)
  graph.edgeDefaults.style = newEdgeStyle('#BBBBBB')
  graph.edgeDefaults.shareStyleInstance = false
}

/**
 * Creates a sample graph structure from the demo's sample data.
 * @param graph The demo's graph.
 */
function loadGraph(graph: IGraph): void {
  const data = SampleData
  const builder = new GraphBuilder(graph)
  builder.createNodesSource(data.nodes, 'id')
  builder.createEdgesSource(data.edges, 'source', 'target')
  builder.buildGraph()
}

/**
 * Helper function to set a value to a given slider element in the UI.
 */
function setSliderValue(sliderId: string, value: number): void {
  const slider = document.getElementById(sliderId) as HTMLInputElement
  const sliderLabel = slider.nextElementSibling
  slider.value = String(isFinite(value) ? value : 20)
  sliderLabel!.textContent = value.toString()
}

/**
 * Helper function to disable UI during layout animation
 */
function disableUI(disabled: boolean): void {
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
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  const busSliders = document.getElementById('bus-sliders') as HTMLSpanElement
  bindChangeListener("input[data-command='ToggleBusStructures']", async useBusStructures => {
    busSliders.style.opacity = useBusStructures && busPresetSelect.value === 'custom' ? '1' : '0.5'
    await runLayout()
  })

  const beforeBusLabel = document.getElementById('before-bus-label') as HTMLLabelElement
  const afterBusLabel = document.getElementById('after-bus-label') as HTMLLabelElement
  addNavigationButtons(busPresetSelect)
  bindChangeListener("select[data-command='SelectBusPreset']", async preset => {
    busSliders.style.opacity = preset === 'custom' ? '1' : '0.5'
    if (preset === 'custom') {
      if (afterBusLabel.textContent === 'Infinity') {
        setSliderValue('after-bus-slider', 5)
      }
      if (beforeBusLabel.textContent === 'Infinity') {
        setSliderValue('before-bus-slider', 5)
      }
    }
    await runLayout()
  })

  bindChangeListener('#before-bus-slider', async () => {
    beforeBusLabel.textContent = beforeBusSlider.value.toString()
    await runLayout()
  })

  bindChangeListener('#after-bus-slider', async () => {
    afterBusLabel.textContent = afterBusSlider.value.toString()
    await runLayout()
  })

  bindAction("button[data-command='Layout']", runLayout)
}

// run the demo
loadJson().then(checkLicense).then(run)
