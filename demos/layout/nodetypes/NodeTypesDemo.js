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
  CircularLayout,
  CircularLayoutData,
  CompactNodePlacer,
  ComponentLayout,
  ComponentLayoutData,
  EdgeRouter,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutData,
  ICommand,
  ILayoutAlgorithm,
  INode,
  LayoutData,
  License,
  NodeTypeAwareSequencer,
  OrganicEdgeRouter,
  OrganicLayout,
  OrganicLayoutData,
  Size,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage
} from 'yfiles'
import {
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import {
  CircularSampleData,
  ComponentSampleData,
  HierarchicSampleData,
  OrganicSampleData,
  TreeSampleData
} from './resources/SampleData.js'
import NodeTypePanel from '../../utils/NodeTypePanel.js'
import { DemoEdgeStyle, DemoNodeStyle } from '../../resources/demo-styles.js'

/**
 * Type describing a sample graph and the according layout algorithm to run on it.
 * @typedef {Object} Sample
 * @property {string} name
 * @property {ILayoutAlgorithm} layout
 * @property {LayoutData} layoutData
 * @property {*} sampleData
 * @property {boolean} [directed]
 */

/**
 * Initialization of the five samples.
 */
const samples = [
  createHierarchicSample(),
  createOrganicSample(),
  createTreeSample(),
  createCircularSample(),
  createComponentSample()
]

const sampleComboBox = document.querySelector('#sample-combo-box')

/**
 * The graph component holding the graph and shown in this demo.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * Runs this demo.
 * @param {!object} licenseData
 * @returns {!Promise}
 */
async function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  configureGraphComponent()
  registerCommands()
  prepareSampleList()
  initializeTypePanel()
  await loadSample()
  showApp(graphComponent)
}

/**
 * Gets the type of the given node from its tag.
 *
 * @param {!INode} node the node to query the type for
 * @returns {*}
 */
function getNodeType(node) {
  // The implementation for this demo assumes that on the INode.tag a type property
  // (a number) exists. Note though that for the layout's node type feature arbitrary objects from
  // an arbitrary sources may be used. In other applications one could, for example, use the color
  // or shape of the node's style as type or its label text, please see the following snippets:

  // Use the fill color of the node assuming that the style is an instance of ShapeNodeStyle
  // (does not work in this demo!)
  // return (node.style as ShapeNodeStyle).fill

  // Use the label text of the node as type
  // return node.labels.size > 0 ? node.labels.get(0).text : null

  return (node.tag && node.tag.type) || 0
}

/**
 * Creates and configures the {@link HierarchicLayout} and the {@link HierarchicLayoutData}
 * such that node types are considered.
 * @returns {!Sample}
 */
function createHierarchicSample() {
  // create hierarchic layout - no further settings on the algorithm necessary to support types
  const layout = new HierarchicLayout()

  // the node types are specified as delegate on the nodeTypes property of the layout data
  const layoutData = new HierarchicLayoutData({ nodeTypes: getNodeType })

  return {
    name: 'Hierarchic',
    layout,
    layoutData,
    sampleData: HierarchicSampleData,
    directed: true
  }
}

/**
 * Creates and configures the {@link OrganicLayout} and the {@link OrganicLayoutData}
 * such that node types are considered.
 * @returns {!Sample}
 */
function createOrganicSample() {
  // create an organic layout wrapped by an organic edge router
  const layout = new OrganicEdgeRouter(
    // to consider node types, substructures handling (stars, parallel structures and cycles)
    // on the organic layout is enabled - otherwise types have no influence
    new OrganicLayout({
      deterministic: true,
      considerNodeSizes: true,
      minimumNodeDistance: 30,
      starSubstructureStyle: 'circular',
      starSubstructureTypeSeparation: false,
      parallelSubstructureStyle: 'rectangular',
      parallelSubstructureTypeSeparation: false,
      cycleSubstructureStyle: 'circular'
    })
  )

  // the node types are specified as delegate on the nodeTypes property of the layout data
  const layoutData = new OrganicLayoutData({ nodeTypes: getNodeType })

  return { name: 'Organic', layout, layoutData, sampleData: OrganicSampleData }
}

/**
 * Creates and configures the {@link TreeLayout} and the {@link TreeLayoutData}
 * such that node types are considered.
 * @returns {!Sample}
 */
function createTreeSample() {
  //create a tree layout including a reduction stage to support non-tree graphs too
  const layout = new TreeLayout({ defaultNodePlacer: new CompactNodePlacer() })
  const edgeRouter = new EdgeRouter({ scope: 'route-affected-edges' })
  const reductionStage = new TreeReductionStage({
    nonTreeEdgeRouter: edgeRouter,
    nonTreeEdgeSelectionKey: edgeRouter.affectedEdgesDpKey
  })
  layout.prependStage(reductionStage)

  // the node types are specified as delegate on the nodeTypes property of the layout data
  const layoutData = new TreeLayoutData({ nodeTypes: getNodeType })

  return { name: 'Tree', layout, layoutData, sampleData: TreeSampleData, directed: true }
}

/**
 * Creates and configures the {@link CircularLayout} and the {@link CircularLayoutData}
 * such that node types are considered.
 * @returns {!Sample}
 */
function createCircularSample() {
  //create a circular layout and specify the NodeTypeAwareSequencer as sequencer responsible
  // for the ordering on the circle - this is necessary to support node types
  const layout = new CircularLayout()
  layout.singleCycleLayout.nodeSequencer = new NodeTypeAwareSequencer()

  // the node types are specified as delegate on the nodeTypes property of the layout data
  const layoutData = new CircularLayoutData({ nodeTypes: getNodeType })

  return { name: 'Circular', layout, layoutData, sampleData: CircularSampleData }
}

/**
 * Creates and configures the {@link ComponentLayout} and the {@link ComponentLayoutData}
 * such that node types are considered.
 * @returns {!Sample}
 */
function createComponentSample() {
  // create a component layout with default settings
  const layout = new ComponentLayout()

  // note that with the default component arrangement style the types of nodes have an influence
  // already - however, if in a row only components with nodes of the same type should be
  // allowed, this can be achieved by specifying the style as follows:
  // layout.style = ComponentArrangementStyles.MULTI_ROWS_TYPE_SEPARATED

  // the node types are specified as delegate on the nodeTypes property of the layout data
  const layoutData = new ComponentLayoutData({ nodeTypes: getNodeType })

  return { name: 'Component', layout, layoutData, sampleData: ComponentSampleData }
}

/**
 * Applies the current layout style to the current graph.
 * @param {boolean} animate
 * @returns {!Promise}
 */
async function applyCurrentLayout(animate) {
  setUIDisabled(true)

  const { layout, layoutData } = samples[sampleComboBox.selectedIndex]
  const considerTypes = document.getElementById('consider-types').checked
  const data = considerTypes ? layoutData : null
  if (animate) {
    await graphComponent.morphLayout(layout, '700ms', data)
  } else {
    graphComponent.graph.applyLayout(layout, data)
  }

  setUIDisabled(false)
}

/**
 * Loads the sample currently selected in the combo box, populates the graph and applies
 * the respective layout algorithm.
 * @returns {!Promise}
 */
async function loadSample() {
  const sample = samples[sampleComboBox.selectedIndex]
  graphComponent.graph.clear()

  // Use the GraphBuilder to load sample data from json
  const builder = new GraphBuilder(graphComponent.graph)
  const nodesSource = builder.createNodesSource({
    data: sample.sampleData.nodeList,
    id: 'id',
    layout: 'layout',
    tag: 'tag'
  })
  nodesSource.nodeCreator.styleBindings.addBinding(
    'cssClass',
    item => `type-${(item.tag && item.tag.type) || 0}`
  )
  const edgesSource = builder.createEdgesSource({
    data: sample.sampleData.edgeList,
    sourceId: 'source',
    targetId: 'target',
    tag: null
  })
  const defaultEdgeStyle = new DemoEdgeStyle()
  defaultEdgeStyle.showTargetArrows = !!sample.directed
  edgesSource.edgeCreator.defaults.style = defaultEdgeStyle
  builder.buildGraph()

  // Apply the current layout that is associated with the newly loaded sample
  await applyCurrentLayout(false)

  graphComponent.graph.edgeDefaults.style = defaultEdgeStyle

  graphComponent.fitGraphBounds()

  // Make the sample change non-undoable
  graphComponent.graph.undoEngine.clear()
}

/**
 * Sets up a {@link GraphEditorInputMode} and configures the defaults for the graph component.
 */
function configureGraphComponent() {
  const geim = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })
  geim.nodeCreator = (context, graph, location, parent) => {
    const node = graph.createNodeAt(location)
    setNodeType(node, 0)
    return node
  }
  graphComponent.inputMode = geim

  graphComponent.graph.nodeDefaults.shareStyleInstance = false
  graphComponent.graph.nodeDefaults.size = new Size(40, 40)
  graphComponent.graph.nodeDefaults.style = new DemoNodeStyle()

  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Specifies the type of the given node by storing it in the node's tag.
 * This function is used as callback by the the type panel when changing the type via the panel.
 * @param {!INode} node
 * @param {number} type
 */
function setNodeType(node, type) {
  // We set a new tag and style so that this change is easily undo-able
  node.tag = { type: type }
  const newStyle = node.style.clone()
  newStyle.cssClass = `type-${type}`
  graphComponent.graph.setStyle(node, newStyle)
}

/**
 * Initializes the {@link NodeTypePanel} that allows for changing a node's type.
 */
function initializeTypePanel() {
  const typePanel = new NodeTypePanel(graphComponent)
  typePanel.nodeTypeChanged = (item, newType) => {
    setNodeType(item, newType)
    graphComponent.selection.clear()
  }

  typePanel.typeChanged = () => {
    const considerTypes = document.getElementById('consider-types').checked
    if (considerTypes) {
      applyCurrentLayout(true)
    }
  }

  graphComponent.selection.addItemSelectionChangedListener(
    () => (typePanel.currentItems = graphComponent.selection.selectedNodes.toArray())
  )
}

/**
 * Initializes the sample combo box.
 */
function prepareSampleList() {
  for (const sample of samples) {
    const optionElement = document.createElement('option')
    optionElement.text = sample.name
    optionElement.value = sample.name
    sampleComboBox.add(optionElement)
  }
  sampleComboBox.selectedIndex = 0
}

/**
 * Binds the various actions to the buttons in the toolbar.
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindAction("button[data-command='Layout']", () => applyCurrentLayout(true))
  bindAction("button[data-command='Reset']", loadSample)
  bindChangeListener('#sample-combo-box', loadSample)
  addNavigationButtons(sampleComboBox)
  bindAction('#consider-types', () => applyCurrentLayout(true))
}

/**
 * Disables the HTML elements of the UI.
 * @param {boolean} disabled true if the element should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector("button[data-command='Reset']").disabled = disabled
  document.querySelector("button[data-command='Layout']").disabled = disabled
  sampleComboBox.disabled = disabled
  graphComponent.inputMode.enabled = !disabled
}

loadJson().then(checkLicense).then(run)
