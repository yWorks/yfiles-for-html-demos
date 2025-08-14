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
  EdgeLabelPreferredPlacement,
  SmartEdgeLabelModel,
  GraphBuilder,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  IList,
  INode,
  LabelEdgeSides,
  LabelSideReferences,
  LayoutExecutor,
  License,
  Size
} from '@yfiles/yfiles'

import SamplesData from './samples'
import { EdgesSourceDialog, NodesSourceDialog } from './EditSourceDialog'
import { SourcesListBox } from './SourcesListBox'
import {
  EdgesSourceDefinition,
  EdgesSourceDefinitionBuilderConnector,
  NodesSourceDefinition,
  NodesSourceDefinitionBuilderConnector,
  SourcesFactory
} from './ModelClasses'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'
const samplesComboBox = document.querySelector('#samples-combobox')

const samples = SamplesData

let layout
let layoutData
let layouting = false

let graphComponent
let graphBuilder

let existingNodes

/**
 * Shows building a graph from business data with class
 * {@link GraphBuilder}.
 * This demo provides text input elements for interactive changes of the
 * sample data that is used to build a graph.
 *
 * In order to visualize the nodes, {@link LitNodeStyle} is used. The style's
 * node template can also be changed interactively in order to display arbitrary data
 * of the business data associated with the node.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run() {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  graph.nodeDefaults.size = new Size(150, 60)
  graph.edgeDefaults.labels.layoutParameter = new SmartEdgeLabelModel().createParameterFromSource(0)

  // configure the input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // initialize the layout algorithm used in this demo
  initializeLayout()

  initializeSamplesComboBox()

  // load the initial data from samples
  loadSample(samples[0])

  // noinspection JSIgnoredPromiseFromCall
  buildGraphFromData(false)

  // register toolbar and other GUI element actions
  initializeUI()
}

/**
 * Bind various UI elements to the appropriate actions.
 */
function initializeUI() {
  document.querySelector('#build-graph-button').addEventListener('click', async () => {
    samplesComboBox.disabled = true
    await buildGraphFromData(false)
    samplesComboBox.disabled = false
  })

  document.querySelector('#update-graph-button').addEventListener('click', async () => {
    samplesComboBox.disabled = true
    await buildGraphFromData(true)
    samplesComboBox.disabled = false
  })

  samplesComboBox.addEventListener('change', async () => {
    const i = samplesComboBox.selectedIndex
    if (samples && samples[i]) {
      samplesComboBox.disabled = true
      loadSample(samples[i])
      await buildGraphFromData(false)
      samplesComboBox.disabled = false
    }
  })

  addNavigationButtons(samplesComboBox)
}

/**
 * Builds the graph from data.
 * @param update `true` when the following layout should be incremental, `false`
 *   otherwise
 */
async function buildGraphFromData(update) {
  if (layouting) {
    return
  }

  if (update) {
    // remember existing nodes
    existingNodes = graphComponent.graph.nodes.toList()
    try {
      graphBuilder.updateGraph()
    } catch (e) {
      alert(`${e.message}`)
    }
  } else {
    graphBuilder.graph.clear()
    try {
      graphBuilder.buildGraph()
    } catch (e) {
      alert(`${e.message}`)
    }
    graphComponent.fitGraphBounds()
  }

  await applyLayout(update)
}

/**
 * Applies the layout.
 * @param update `true` when the following layout should be incremental, `false`
 *   otherwise
 */
async function applyLayout(update) {
  if (layouting) {
    return
  }
  layout.fromSketchMode = update
  layouting = true

  try {
    // Ensure that the LayoutExecutor class is not removed by build optimizers
    // It is needed for the 'applyLayoutAnimated' method in this demo.
    LayoutExecutor.ensure()

    await graphComponent.applyLayoutAnimated(layout, '1s', layoutData)
  } finally {
    layouting = false
  }
}

/**
 * Instantiates the GraphBuilder and sources list boxes and applies the given sample data
 * @param sample The sample to use for instantiation / initialization
 */
function loadSample(sample) {
  const sampleClone = JSON.parse(JSON.stringify(sample))

  // create the GraphBuilder
  graphBuilder = new GraphBuilder(graphComponent.graph)

  const sourcesFactory = new SourcesFactory(graphBuilder)

  const { nodesSourcesListBox, edgesSourcesListBox } = createSourcesLists(sourcesFactory)

  sampleClone.nodesSources.forEach((nodesSourceDefinition) => {
    const connector = sourcesFactory.createNodesSourceConnector(
      nodesSourceDefinition.name,
      nodesSourceDefinition
    )
    connector.applyDefinition()
    nodesSourcesListBox.addDefinition(connector)
  })

  sampleClone.edgesSources.forEach((edgesSourceDefinition) => {
    const connector = sourcesFactory.createEdgesSourceConnector(
      edgesSourceDefinition.name,
      edgesSourceDefinition
    )
    connector.applyDefinition()
    edgesSourcesListBox.addDefinition(connector)
  })
}

/**
 * Initializes the samples combobox with the loaded sample data
 */
function initializeSamplesComboBox() {
  for (let i = 0; i < samples.length; i++) {
    const option = document.createElement('option')
    option.label = samples[i].name
    // @ts-ignore The value should be a string, but this seems to work, anyway.
    option.value = samples[i]
    samplesComboBox.appendChild(option)
  }
}

function removeAllChildren(htmlElement) {
  while (htmlElement.lastChild) {
    htmlElement.removeChild(htmlElement.lastChild)
  }
}

/**
 * Instantiates the sources list boxes
 */
function createSourcesLists(sourcesFactory) {
  const nodeSourcesListRootElement = document.querySelector('#nodesSourcesList')
  const edgesSourcesListRootElement = document.querySelector('#edgesSourcesList')
  removeAllChildren(nodeSourcesListRootElement)
  removeAllChildren(edgesSourcesListRootElement)

  const nodesSourcesListBox = new SourcesListBox(
    (sourceName) => sourcesFactory.createNodesSourceConnector(sourceName),
    NodesSourceDialog,
    nodeSourcesListRootElement,
    () => {
      buildGraphFromData(true)
    }
  )

  const edgesSourcesListBox = new SourcesListBox(
    (sourceName) => sourcesFactory.createEdgesSourceConnector(sourceName),
    EdgesSourceDialog,
    edgesSourcesListRootElement,
    () => {
      buildGraphFromData(true)
    }
  )

  return { nodesSourcesListBox, edgesSourcesListBox }
}

/**
 * Configures the demo's layout algorithm as well as suitable layout data.
 */
function initializeLayout() {
  // initialize layout algorithm
  layout = new HierarchicalLayout({ fromScratchLayeringStrategy: 'hierarchical-topmost' })

  // initialize layout data
  // configure label placement
  layoutData = new HierarchicalLayoutData({
    edgeLabelPreferredPlacements: new EdgeLabelPreferredPlacement({
      edgeSide: LabelEdgeSides.RIGHT_OF_EDGE,
      sideReference: LabelSideReferences.ABSOLUTE_WITH_RIGHT_ABOVE,
      distanceToEdge: 5
    })
  })
}

run().then(finishLoading)
