/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  GraphComponent,
  GraphViewerInputMode,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutLayeringStrategy,
  ICommand,
  IIncrementalHintsFactory,
  ILabel,
  IList,
  IModelItem,
  INode,
  LabelPlacements,
  LabelSideReferences,
  LayoutGraphAdapter,
  LayoutMode,
  License,
  PreferredPlacementDescriptor,
  TemplateNodeStyle
} from 'yfiles'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import { SchemaComponent } from './SchemaComponent.js'
import samples from './samples.js'

/** @type {HierarchicLayout} */
let layout = null
/** @type {boolean} */
let layouting = false

/** @type {GraphComponent} */
let graphComponent = null
/** @type {SchemaComponent} */
let schemaComponent = null

/** @type {IList.<INode>} */
let existingNodes = null

/**
 * Shows building a graph from business data with class
 * {@link TreeBuilder}.
 * This demo provides a schema graph component for interactive manipulation
 * of the result graph structure and content.
 *
 * In order to visualize the nodes, {@link TemplateNodeStyle} is used. The style's
 * node template can also be changed interactively in order to display arbitrary data
 * of the business data associated with the node.
 * @param {*} licenseData
 */
function run(licenseData) {
  License.value = licenseData

  graphComponent = new GraphComponent('graphComponent')

  schemaComponent = new SchemaComponent('schemaGraphComponent', graphComponent.graph, () => {
    // noinspection JSIgnoredPromiseFromCall
    buildGraphFromData(true)
  })

  const graph = graphComponent.graph

  // configure the input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // configure label placement
  const preferredPlacementDescriptor = new PreferredPlacementDescriptor({
    sideOfEdge: LabelPlacements.RIGHT_OF_EDGE,
    sideReference: LabelSideReferences.ABSOLUTE_WITH_RIGHT_IN_NORTH,
    distanceToEdge: 5
  })
  preferredPlacementDescriptor.freeze()
  graph.mapperRegistry.createConstantMapper(
    ILabel.$class,
    PreferredPlacementDescriptor.$class,
    LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
    preferredPlacementDescriptor
  )

  // create a layout
  layout = createLayout()

  initializeSamplesComboBox()

  // load the initial data from samples
  // noinspection JSIgnoredPromiseFromCall
  loadSample(samples[0])

  // register toolbar and other GUI element commands
  registerCommands()

  // initialize the demo
  showApp(graphComponent)
}

/**
 * Bind various UI elements to the appropriate commands
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)

  bindAction("button[data-command='BuildGraph']", () => {
    // noinspection JSIgnoredPromiseFromCall
    buildGraphFromData(false)
  })
  bindAction("button[data-command='UpdateGraph']", () => {
    // noinspection JSIgnoredPromiseFromCall
    buildGraphFromData(true)
  })
  bindChangeListener("select[data-command='SetSampleData']", () => {
    const i = document.getElementById('samplesComboBox').selectedIndex
    if (samples && samples[i]) {
      // noinspection JSIgnoredPromiseFromCall
      loadSample(samples[i])
      // noinspection JSIgnoredPromiseFromCall
      buildGraphFromData(false)
    }
  })
}

/**
 * Builds the graph from data.
 * @param {boolean} update <code>true</code> when the following layout should be incremental, <code>false</code>
 *   otherwise
 * @returns {!Promise}
 */
async function buildGraphFromData(update) {
  if (layouting) {
    return
  }

  if (update) {
    // remember existing nodes
    existingNodes = graphComponent.graph.nodes.toList()
    try {
      schemaComponent.treeBuilder.updateGraph()
    } catch (err) {
      alert(`${err.message}`)
    }
  } else {
    graphComponent.graph.clear()
    try {
      schemaComponent.treeBuilder.buildGraph()
    } catch (err) {
      alert(`${err.message}`)
    }
    graphComponent.fitGraphBounds()
  }

  await applyLayout(update)
}

/**
 * Applies the layout.
 * @param {boolean} update <code>true</code> when the following layout should be incremental, <code>false</code>
 *   otherwise
 * @returns {!Promise}
 */
async function applyLayout(update) {
  if (layouting) {
    return
  }

  if (update) {
    // configure from scratch layout
    layout.layoutMode = LayoutMode.INCREMENTAL
  } else {
    layout.layoutMode = LayoutMode.FROM_SCRATCH
  }

  const layoutData = new HierarchicLayoutData({
    incrementalHints: (item, hintsFactory) => {
      if (INode.isInstance(item) && !existingNodes.includes(item)) {
        return hintsFactory.createLayerIncrementallyHint(item)
      }
      return null
    }
  })
  layouting = true
  try {
    await graphComponent.morphLayout(layout, '1s', layoutData)
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  } finally {
    layouting = false
  }
}

/**
 * Loads the given sample data and builds the graph using the {@link SchemaComponent}
 * @param {!object} sample The sample to use for instantiation / initialization
 * @returns {!Promise}
 */
async function loadSample(sample) {
  graphComponent.graph.clear()

  const sampleClone = JSON.parse(JSON.stringify(sample))
  schemaComponent.loadSample(sampleClone)
  schemaComponent.treeBuilder.buildGraph()
  await applyLayout(false)
}

/**
 * Initializes the samples combobox with the loaded sample data
 */
function initializeSamplesComboBox() {
  const samplesComboBox = document.getElementById('samplesComboBox')
  for (let i = 0; i < samples.length; i++) {
    const option = document.createElement('option')
    option.textContent = samples[i].name
    option.value = samples[i]
    samplesComboBox.appendChild(option)
  }
}

/**
 * Creates and configures a hierarchic layout.
 * @returns {!HierarchicLayout}
 */
function createLayout() {
  const hierarchicLayout = new HierarchicLayout()
  hierarchicLayout.orthogonalRouting = true
  hierarchicLayout.integratedEdgeLabeling = true
  hierarchicLayout.fromScratchLayeringStrategy =
    HierarchicLayoutLayeringStrategy.HIERARCHICAL_TOPMOST
  return hierarchicLayout
}

// run the demo
loadJson().then(run)
