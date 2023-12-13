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
import {
  ComponentArrangementStyles,
  ComponentLayout,
  FilteredGraphWrapper,
  GraphComponent,
  GraphViewerInputMode,
  IGraph,
  InteriorLabelModel,
  License,
  VoidNodeStyle,
  YDimension
} from 'yfiles'
import TextData from './TextData'
import {
  AssignNodeSizesStage,
  buildTagCloud,
  createAssignNodeSizeStageLayoutData,
  updateTagCloud
} from './TagCloudHelper'
import { fetchLicense } from 'demo-resources/fetch-license'
import { finishLoading } from 'demo-resources/demo-page'
import { applyDemoTheme } from 'demo-resources/demo-styles'

// The minimum frequency of the words to be shown in the tag cloud visualization
let minFrequency = 80

/**
 * Runs the demo.
 */
async function run(): Promise<void> {
  License.value = await fetchLicense()

  const graphComponent = new GraphComponent('#graphComponent')
  applyDemoTheme(graphComponent)

  // restrict user interaction to panning (and zooming)
  graphComponent.inputMode = new GraphViewerInputMode()

  // add support for temporarily hiding nodes
  // (i.e. hiding the "words" with frequency less than the desired minimum frequency)
  configureFiltering(graphComponent)

  // initialize default node style and default node label positions
  initializeGraph(graphComponent.graph)

  // builds the tag cloud graph
  buildTagCloud(graphComponent.graph, TextData, minFrequency)

  // run the layout
  await runLayout(graphComponent)

  // wire up the UI
  initializeUI(graphComponent)
}

/**
 * Configures filtering for the graph of the given graph component.
 * @param graphComponent the demo's main graph view.
 */
function configureFiltering(graphComponent: GraphComponent): void {
  // only nodes with frequency greater than or equal to the minimum frequency will be visible.
  graphComponent.graph = new FilteredGraphWrapper(
    graphComponent.graph,
    (node) => !node.tag || node.tag.frequency >= minFrequency,
    () => false
  )
}

/**
 * Sets the default node style as well as the default node label position.
 * @param graph the graph for which default settings are configured.
 */
function initializeGraph(graph: IGraph): void {
  graph.nodeDefaults.style = VoidNodeStyle.INSTANCE
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.NORTH
}

/**
 * Updates the graph in the given graph component for the current minimum frequency.
 * @param graphComponent the demo's main graph view.
 */
function updateFilteredGraph(graphComponent: GraphComponent): void {
  const filteredGraph = graphComponent.graph as FilteredGraphWrapper
  minFrequency = getMinFrequencyValue()
  updateTagCloud(filteredGraph.wrappedGraph!, TextData, minFrequency)
  filteredGraph.nodePredicateChanged()
}

/**
 * Runs component layout to calculate new positions for nodes.
 * Since the demo's tag cloud graph has no edges, each node is a single component in itself.
 * @param graphComponent the demo's main graph view.
 */
async function runLayout(graphComponent: GraphComponent): Promise<void> {
  disableUI(true)
  let style
  switch (document.querySelector<HTMLSelectElement>('#layoutStyle')!.selectedIndex) {
    default:
    case 0:
      style = ComponentArrangementStyles.PACKED_COMPACT_CIRCLE
      break
    case 1:
      style = ComponentArrangementStyles.PACKED_COMPACT_RECTANGLE
      break
  }
  // configure the component layout and use the AssignNodeSizesStage that will change the size of the
  // nodes before the layout
  const componentLayout = new ComponentLayout({
    coreLayout: new AssignNodeSizesStage(),
    style,
    componentSpacing: 0,
    gridSpacing: 0,
    considerLabels: false,
    preferredSize: new YDimension(400, 200)
  })

  // create the layout data that will pass the information about the node sizes to the
  // AssignNodeSizesStage
  const layoutData = createAssignNodeSizeStageLayoutData()
  await graphComponent.morphLayout(componentLayout, '0.8s', layoutData)
  disableUI(false)
}

/**
 * Binds actions to the demo's UI controls.
 * @param graphComponent the demo's main graph view.
 */
function initializeUI(graphComponent: GraphComponent): void {
  document.querySelector('#layoutStyle')!.addEventListener('change', async () => {
    await runLayout(graphComponent)
  })

  document.querySelector('#frequencySlider')!.addEventListener('change', async () => {
    document.querySelector<HTMLElement>('#frequencySliderLabel')!.textContent =
      String(getMinFrequencyValue())
    updateFilteredGraph(graphComponent)
    await runLayout(graphComponent)
  })
}

function getMinFrequencyValue() {
  return parseInt(document.querySelector<HTMLInputElement>('#frequencySlider')!.value)
}

/**
 * Helper function to disable UI during layout animation.
 */
function disableUI(disable: boolean) {
  document.querySelector<HTMLInputElement>('#layoutStyle')!.disabled = disable
  document.querySelector<HTMLInputElement>('#frequencySlider')!.disabled = disable
}

run().then(finishLoading)
