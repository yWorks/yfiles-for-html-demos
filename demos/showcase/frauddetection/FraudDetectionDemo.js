/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) 2026 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  FilteredGraphWrapper,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  License,
  OrganicLayout,
  Size
} from '@yfiles/yfiles'

import {
  closeFraudDetectionView,
  openInspectionViewForItem
} from './fraud-detection/inspection-view'
import { initializeLayout } from './interactive-layout'
import { ConnectionEdgeStyle } from './styles/ConnectionEdgeStyle'
import { bankFraudData } from './resources/bank-fraud-data'
import { insuranceFraudData } from './resources/insurance-fraud-data'
import licenseData from '../../../lib/license.json'
import { finishLoading, showLoadingIndicator } from '@yfiles/demo-app/demo-page'
import {
  calculateComponents,
  clearFraudHighlights,
  focusFraudComponent,
  initializeFraudHighlights,
  updateFraudWarnings
} from './fraud-detection/fraud-components'
import { EntityNodeStyle } from './styles/EntityNodeStyle'
import { getEntityData, getTimeEntry } from './entity-data'
import { Timeline } from './timeline/Timeline'
import { detectBankFraud, detectInsuranceFraud } from './fraud-detection/fraud-detection'
import './resources/fraud-detection-demo.css'
import { enableWebGLRendering, setWebGLStyles } from './styles/initialize-webgl-styles'
import { initializeHighlights } from './initialize-highlights'
import { clearPropertiesView, initializePropertiesView } from './properties-view'
import { enableTooltips } from './entity-tooltip'
import { useSingleSelection } from '../mindmap/interaction/single-selection'

/**
 * The main graph component that displays the graph.
 */
let graphComponent

/**
 * The methods that control the layout
 */
let startLayout
let stopLayout

/**
 * The graph component that displays the timeline.
 */
let timeline

/**
 * Starts a demo which shows fraud detection on a graph with changing time-frames. Since the nodes
 * have different timestamps (defined in their tag object), they will only appear in some
 * time-frames. Time-frames are chosen using a timeline component.
 */
async function run() {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')
  initializeGraphComponent()
  initializeHighlights(graphComponent)
  initializeGraph()

  await enableWebGLRendering(graphComponent)

  enableTooltips(graphComponent)

  initializeTimelineComponent('timeline-component', graphComponent)
  const layout = initializeLayout(graphComponent)

  startLayout = layout.startLayout
  stopLayout = layout.stopLayout

  initializeFraudHighlights(graphComponent)

  initializePropertiesView(graphComponent)

  await loadSampleGraph(bankFraudData)

  initializeUI()
}

/**
 * Binds the UI elements in the toolbar to actions.
 */
function initializeUI() {
  const bankFraudDescription = document.querySelector('#bank-fraud-detection')
  const insuranceFraudDescription = document.querySelector('#insurance-fraud-detection')
  const samples = document.querySelector('#samples')
  samples.addEventListener('change', async () => {
    clearPropertiesView()
    // if an inspection view is open, close it
    closeFraudDetectionView()
    if (samples.value === 'bank-fraud') {
      bankFraudDescription.removeAttribute('hidden')
      insuranceFraudDescription.setAttribute('hidden', 'hidden')
      await loadSampleGraph(bankFraudData)
    } else {
      bankFraudDescription.setAttribute('hidden', 'hidden')
      insuranceFraudDescription.removeAttribute('hidden')
      await loadSampleGraph(insuranceFraudData)
    }
  })
}

/**
 * Initializes the main graph component and its interactive behavior.
 */
function initializeGraphComponent() {
  const inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowCreateEdge: false,
    allowCreateBend: false,
    allowDuplicate: false,
    allowGroupingOperations: false,
    allowClipboardOperations: false,
    allowUndoOperations: false,
    allowEditLabelOnDoubleClick: false,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    selectableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NONE,
    showHandleItems: GraphItemTypes.NONE,
    deletableItems: GraphItemTypes.NONE,
    movableSelectedItems: GraphItemTypes.NODE,
    clickHitTestOrder: [GraphItemTypes.NODE, GraphItemTypes.EDGE]
  })
  inputMode.moveSelectedItemsInputMode.enabled = false
  inputMode.marqueeSelectionInputMode.enabled = false

  inputMode.addEventListener('item-double-clicked', (evt) => {
    openInspectionViewForItem(evt.item, graphComponent)
  })

  graphComponent.inputMode = inputMode

  // limit the minimum and the maximum zoom of the graphComponent
  graphComponent.minimumZoom = 0.2
  graphComponent.maximumZoom = 3

  useSingleSelection(graphComponent)
}

/**
 * Initializes the graph with default styles and decorators for highlights and selections.
 */
function initializeGraph() {
  // default node style
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new EntityNodeStyle()
  graph.nodeDefaults.size = new Size(30, 30)

  // default edge style
  graph.edgeDefaults.style = new ConnectionEdgeStyle()

  graphComponent.graph.decorator.nodes.focusRenderer.hide()
}

/**
 * Builds the graph based on the given dataset.
 * @param graph The graph where the elements are added
 * @param data The sample data
 */
async function buildGraph(graph, data) {
  graph.clear()

  function convertDates(dates) {
    return Array.isArray(dates) ? dates.map((e) => new Date(e)) : [new Date(dates)]
  }

  const builder = new GraphBuilder(graph)
  const entityNodesSource = builder.createNodesSource(data.nodesSource, 'id')
  entityNodesSource.nodeCreator.tagProvider = (entity) => ({
    ...entity,
    enter: convertDates(entity.enter),
    exit: convertDates(entity.exit)
  })
  builder.createEdgesSource(data.edgesSource, 'from', 'to')
  builder.buildGraph()
}

/**
 * Runs an organic layout on the complete initial graph.
 */
async function runInitialLayout(graph) {
  // run an initial layout
  const organicLayout = new OrganicLayout({
    deterministic: true,
    allowNodeOverlaps: false,
    defaultPreferredEdgeLength: 50,
    componentLayout: { style: 'packed-compact-circle' }
  })
  graph.applyLayout(organicLayout)
  await graphComponent.fitGraphBounds()
}

/**
 * Loads a graph from the given JSON data.
 * @param data The JSON data from which the graph is retrieved.
 */
async function loadSampleGraph(data) {
  // deactivate UI
  await setBusy(true)

  clearFraudHighlights()

  // stop the layout for the graph change
  stopLayout()

  // read the sample data and populate the wrapped graph,
  // so nodes outside the current timeframe are hidden and can appear later
  const wrappedGraph = graphComponent.graph.wrappedGraph
  await buildGraph(wrappedGraph, data)

  // calculate the connected components of the given graph
  calculateComponents()

  // if there is a timeline, add the new entities
  if (timeline) {
    timeline.stop()
    timeline.items = wrappedGraph.nodes.map(getEntityData).toArray()
  }

  // run a layout on the complete graph
  // to have nice initial locations even for the currently hidden nodes
  await runInitialLayout(wrappedGraph)

  // initializes the element styles using WebGL rendering if this is supported by the browser
  setWebGLStyles(graphComponent)

  void startLayout()

  // re-activate UI
  await setBusy(false)

  // focus on a component containing fraudsters
  void focusFraudComponent()
}

function initializeTimelineComponent(selector, graphComponent) {
  timeline = new Timeline(selector, getTimeEntry)

  // filter the elements that are not part of the current timeframe
  const filteredGraph = new FilteredGraphWrapper(graphComponent.graph, (node) =>
    timeline.filter(getEntityData(node))
  )
  graphComponent.graph = filteredGraph
  timeline.setFilterChangedListener(() => {
    filteredGraph.nodePredicateChanged()

    const bankFraud = document.querySelector('#samples').value === 'bank-fraud'
    const fraudsters = bankFraud
      ? detectBankFraud(graphComponent)
      : detectInsuranceFraud(graphComponent)

    updateFraudWarnings(fraudsters)
  })
  timeline.setBarSelectListener((items) => {
    const selection = graphComponent.selection
    selection.clear()

    const selectedItems = new Set(items.map((item) => item.id))
    graphComponent.graph.nodes.forEach((node) => {
      const entity = getEntityData(node)
      if (selectedItems.has(entity.id)) {
        selection.add(node)
      }
    })
  })
  timeline.setBarHoverListener((items) => {
    const highlights = graphComponent.highlights
    highlights.clear()

    const selected = new Set(items.map((item) => item.id))

    graphComponent.graph.nodes.forEach((node) => {
      const entity = getEntityData(node)
      if (selected.has(entity.id)) {
        highlights.add(node)
      }
    })
  })
  return timeline
}

/**
 * Marks whether the demo is currently loading a sample graph.
 * When busy, the mouse cursor is changed and the toolbar as well as the input modes are disabled.
 */
async function setBusy(state) {
  graphComponent.inputMode.waiting = state
  document.querySelector('#samples').disabled = state
  await showLoadingIndicator(state)
}

void run().then(finishLoading)
