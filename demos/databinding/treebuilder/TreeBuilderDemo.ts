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
  GraphComponent,
  GraphViewerInputMode,
  HierarchicalLayout,
  HierarchicalLayoutData,
  HierarchicalLayoutLayeringStrategy,
  IList,
  INode,
  LabelEdgeSides,
  LabelSideReferences,
  LayoutExecutor,
  License,
  TreeBuilder
} from '@yfiles/yfiles'
import { SchemaComponent } from './SchemaComponent'
import samples from './samples'

import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-resources/demo-page'

const samplesComboBox = document.querySelector<HTMLSelectElement>('#samples')!

let layout: HierarchicalLayout
let layoutData: HierarchicalLayoutData
let layouting = false

let graphComponent: GraphComponent
let schemaComponent: SchemaComponent

let existingNodes: IList<INode>

/**
 * Shows building a graph from business data with class
 * {@link TreeBuilder}.
 * This demo provides a schema graph component for interactive manipulation
 * of the result graph structure and content.
 *
 * In order to visualize the nodes, {@link LitNodeStyle} is used. The style's
 * node template can also be changed interactively in order to display arbitrary data
 * of the business data associated with the node.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run(): Promise<void> {
  License.value = await fetchLicense()

  graphComponent = new GraphComponent('graphComponent')
  schemaComponent = new SchemaComponent('schemaGraphComponent', graphComponent.graph, () => {
    // noinspection JSIgnoredPromiseFromCall
    buildGraphFromData(true)
  })

  // configure the input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // initialize the layout algorithm used in this demo
  initializeLayout()

  initializeSamplesComboBox()

  // load the initial data from samples
  // noinspection JSIgnoredPromiseFromCall
  loadSample(samples[0])

  // register toolbar and other GUI element actions
  initializeUI()
}

/**
 * Bind various UI elements to the appropriate actions
 */
function initializeUI(): void {
  document
    .querySelector<HTMLButtonElement>('#build-graph-button')!
    .addEventListener('click', async (): Promise<void> => {
      samplesComboBox.disabled = true
      await buildGraphFromData(false)
      samplesComboBox.disabled = false
    })
  document
    .querySelector<HTMLButtonElement>('#update-graph-button')!
    .addEventListener('click', async (): Promise<void> => {
      samplesComboBox.disabled = true
      await buildGraphFromData(true)
      samplesComboBox.disabled = false
    })

  addNavigationButtons(samplesComboBox).addEventListener('change', async (): Promise<void> => {
    const i = samplesComboBox.selectedIndex
    if (samples && samples[i]) {
      samplesComboBox.disabled = true
      await loadSample(samples[i])
      await buildGraphFromData(true)
      samplesComboBox.disabled = false
    }
  })
}

/**
 * Builds the graph from data.
 * @param update `true` when the following layout should be incremental, `false`
 *   otherwise
 */
async function buildGraphFromData(update: boolean): Promise<void> {
  if (layouting) {
    return
  }

  if (update) {
    // remember existing nodes
    existingNodes = graphComponent.graph.nodes.toList()
    try {
      schemaComponent.treeBuilder.updateGraph()
    } catch (err) {
      alert(`${(err as Error).message}`)
    }
  } else {
    graphComponent.graph.clear()
    try {
      schemaComponent.treeBuilder.buildGraph()
    } catch (err) {
      alert(`${(err as Error).message}`)
    }
    await graphComponent.fitGraphBounds()
  }

  await applyLayout(update)
}

/**
 * Applies the layout.
 * @param update `true` when the following layout should be incremental, `false`
 *   otherwise
 */
async function applyLayout(update: boolean): Promise<void> {
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
 * Loads the given sample data and builds the graph using the {@link SchemaComponent}
 * @param sample The sample to use for instantiation / initialization
 */
async function loadSample(sample: object): Promise<void> {
  graphComponent.graph.clear()

  const sampleClone = JSON.parse(JSON.stringify(sample))
  schemaComponent.loadSample(sampleClone)
  schemaComponent.treeBuilder.buildGraph()
  await applyLayout(false)
}

/**
 * Initializes the samples combobox with the loaded sample data
 */
function initializeSamplesComboBox(): void {
  for (let i = 0; i < samples.length; i++) {
    const option = document.createElement('option')
    option.label = samples[i].name
    // @ts-ignore The value should be a string, but this seems to work, anyway.
    option.value = samples[i]
    samplesComboBox.appendChild(option)
  }
}

/**
 * Configures the demo's layout algorithm as well as suitable layout data.
 */
function initializeLayout() {
  // initialize layout algorithm
  layout = new HierarchicalLayout({
    fromScratchLayeringStrategy: HierarchicalLayoutLayeringStrategy.HIERARCHICAL_TOPMOST
  })

  // initialize layout data
  // configure label placement
  layoutData = new HierarchicalLayoutData({
    edgeLabelPreferredPlacements: new EdgeLabelPreferredPlacement({
      edgeSide: LabelEdgeSides.RIGHT_OF_EDGE,
      sideReference: LabelSideReferences.ABSOLUTE_WITH_RIGHT_ABOVE,
      distanceToEdge: 5
    }),
    incrementalNodes: (node) => !existingNodes.includes(node)
  })
}

run().then(finishLoading)
