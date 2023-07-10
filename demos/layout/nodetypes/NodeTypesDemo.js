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
  BalloonLayout,
  BalloonLayoutData,
  CircularLayout,
  CircularLayoutData,
  CompactDiskLayout,
  CompactDiskLayoutData,
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
  License,
  NodeTypeAwareSequencer,
  OrganicEdgeRouter,
  OrganicLayout,
  OrganicLayoutData,
  RadialLayout,
  RadialLayoutData,
  Size,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage
} from 'yfiles'
import {
  BalloonSampleData,
  CircularSampleData,
  CompactDiskSampleData,
  ComponentSampleData,
  HierarchicSampleData,
  OrganicSampleData,
  RadialSampleData,
  TreeSampleData
} from './resources/SampleData.js'
import NodeTypePanel from 'demo-utils/NodeTypePanel'
import {
  applyDemoTheme,
  colorSets,
  createDemoEdgeStyle,
  createDemoNodeStyle
} from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

/**
 * Type describing a sample graph and the according layout algorithm to run on it.
 * @typedef {Object} Sample
 * @property {string} name
 * @property {ILayoutAlgorithm} layout
 * @property {LayoutData} layoutData
 * @property {SampleData} sampleData
 * @property {boolean} [directed]
 */

/**
 * Initialization of the seven samples.
 */
const samples = [
  createHierarchicSample(),
  createOrganicSample(),
  createTreeSample(),
  createBalloonSample(),
  createCircularSample(),
  createRadialSample(),
  createComponentSample(),
  createCompactDiskSample()
]

/**
 * The color sets for the three different node types.
 */
const typeColors = ['demo-palette-21', 'demo-palette-22', 'demo-palette-23']

/**
 * The graph component holding the graph and shown in this demo.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * Runs this demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)
  configureGraphComponent()
  initializeUI()
  prepareSampleList()
  initializeTypePanel()
  await loadSample()
}

/**
 * Gets the type of the given node from its tag.
 *
 * @param {!INode} node the node to query the type for
 * @returns {number}
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

  const tag = node.tag
  return (tag && tag.type) || 0
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
 * Creates and configures the {@link BalloonLayout} and the {@link BalloonLayoutData}
 * such that node types are considered.
 * @returns {!Sample}
 */
function createBalloonSample() {
  //create a balloon layout including a reduction stage to support non-tree graphs too
  const layout = new BalloonLayout()
  const reductionStage = new TreeReductionStage()
  reductionStage.nonTreeEdgeRouter = reductionStage.createStraightLineRouter()
  layout.prependStage(reductionStage)

  // the node types are specified as delegate on the nodeTypes property of the layout data
  const layoutData = new BalloonLayoutData({ nodeTypes: getNodeType })

  return { name: 'Balloon', layout, layoutData, sampleData: BalloonSampleData, directed: true }
}

/**
 * Creates and configures the {@link CompactDiskLayout} and the {@link CompactDiskLayoutData}
 * such that node types are considered.
 * @returns {!Sample}
 */
function createCompactDiskSample() {
  //create a compact disk layout with a little additional node distance (since the nodes
  // are not circles and this algorithm treats them as such)
  const layout = new CompactDiskLayout({
    minimumNodeDistance: 20
  })

  // the node types are specified as delegate on the nodeTypes property of the layout data
  const layoutData = new CompactDiskLayoutData({ nodeTypes: getNodeType })

  return { name: 'Compact Disk', layout, layoutData, sampleData: CompactDiskSampleData }
}

/**
 * Creates and configures the {@link RadialLayout} and the {@link RadialLayoutData}
 * such that node types are considered.
 * @returns {!Sample}
 */
function createRadialSample() {
  //create a compact disk layout with a little additional node distance (since the nodes
  // are not circles and this algorithm treats them as such)
  const layout = new RadialLayout({ minimumLayerDistance: 150 })

  // the node types are specified as delegate on the nodeTypes property of the layout data
  const layoutData = new RadialLayoutData({ nodeTypes: getNodeType })

  return { name: 'Radial Layout', layout, layoutData, sampleData: RadialSampleData }
}

/**
 * Applies the current layout style to the current graph.
 * @param {boolean} animate
 * @param {boolean} considerTypes
 * @returns {!Promise}
 */
async function applyCurrentLayout(animate, considerTypes) {
  const sampleComboBox = document.querySelector('#sample-combo-box')

  const { layout, layoutData } = samples[sampleComboBox.selectedIndex]
  const data = considerTypes ? layoutData : null
  if (animate) {
    await graphComponent.morphLayout(layout, '1000ms', data)
  } else {
    graphComponent.graph.applyLayout(layout, data)
  }
}

/**
 * Loads the sample currently selected in the combo box, populates the graph and applies
 * the respective layout algorithm.
 * @param {boolean} [previewWithoutNodeTypes=false]
 * @returns {!Promise}
 */
async function loadSample(previewWithoutNodeTypes = false) {
  const sampleComboBox = document.querySelector('#sample-combo-box')
  const sample = samples[sampleComboBox.selectedIndex]
  graphComponent.graph.clear()

  // Use the GraphBuilder to load sample data from json
  const builder = new GraphBuilder(graphComponent.graph)
  builder.createNodesSource({
    data: sample.sampleData.nodeList,
    id: 'id',
    layout: 'layout',
    tag: 'tag',
    style: dataItem => {
      if (dataItem.tag) {
        // Create node style depending on type tag
        return createDemoNodeStyle(typeColors[dataItem.tag.type])
      }
      return createDemoNodeStyle()
    }
  })
  const edgesSource = builder.createEdgesSource({
    data: sample.sampleData.edgeList,
    sourceId: 'source',
    targetId: 'target',
    tag: null
  })
  const defaultEdgeStyle = createDemoEdgeStyle({
    showTargetArrow: sample.directed
  })
  edgesSource.edgeCreator.defaults.style = defaultEdgeStyle
  builder.buildGraph()

  graphComponent.graph.edgeDefaults.style = defaultEdgeStyle

  await arrangeGraph(false, previewWithoutNodeTypes)

  // Make the sample change non-undoable
  graphComponent.graph.undoEngine.clear()
}

/**
 * Arranges the graph with an optional preview arrangement that shows the layout result when
 * ignoring the node types.
 * @param {boolean} animate whether the layout should be animated
 * @param {boolean} previewWithoutNodeTypes whether the layout should first run ignoring the node types to make
 *  the difference easily visible
 * @returns {!Promise}
 */
async function arrangeGraph(animate, previewWithoutNodeTypes) {
  setUIDisabled(true)
  // Run a layout without considering the node types
  if (previewWithoutNodeTypes) {
    updateLayoutPopup(true, 'Node types are <u>not considered</u>')
    // Apply the current layout that is associated with the newly loaded sample
    await applyCurrentLayout(animate, false)
    graphComponent.fitGraphBounds()
    // Add some delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    updateLayoutPopup(true, 'Node types <u>are considered</u>')
  }

  // Run a layout when considering the node types
  await applyCurrentLayout(true, true)

  graphComponent.fitGraphBounds()
  updateLayoutPopup(false)
  setUIDisabled(false)
}

/**
 * Sets up a {@link GraphEditorInputMode} and configures the defaults for the graph component.
 */
function configureGraphComponent() {
  const geim = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE
  })
  geim.nodeCreator = (context, graph, location, _) => {
    const node = graph.createNodeAt(location)
    setNodeType(node, 0)
    return node
  }
  graphComponent.inputMode = geim

  graphComponent.graph.nodeDefaults.shareStyleInstance = false
  graphComponent.graph.nodeDefaults.size = new Size(40, 40)
  graphComponent.graph.nodeDefaults.style = createDemoNodeStyle()

  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Specifies the type of the given node by storing it in the node's tag.
 * This function is used as callback by the type panel when changing the type via the panel.
 * @param {!INode} node
 * @param {number} type
 */
function setNodeType(node, type) {
  // We set a new tag and style so that this change is easily undo-able
  node.tag = { type: type }
  graphComponent.graph.setStyle(node, createDemoNodeStyle(typeColors[type]))
}

/**
 * Initializes the {@link NodeTypePanel} that allows for changing a node's type.
 */
function initializeTypePanel() {
  const typePanel = new NodeTypePanel(graphComponent, typeColors, colorSets)
  typePanel.nodeTypeChanged = (item, newType) => {
    setNodeType(item, newType)
    graphComponent.selection.clear()
  }

  typePanel.typeChanged = async () => {
    await arrangeGraph(true, false)
  }

  graphComponent.selection.addItemSelectionChangedListener(
    () => (typePanel.currentItems = graphComponent.selection.selectedNodes.toArray())
  )
}

/**
 * Initializes the sample combo box.
 */
function prepareSampleList() {
  const sampleComboBox = document.querySelector('#sample-combo-box')
  for (const sample of samples) {
    const optionElement = document.createElement('option')
    optionElement.text = sample.name
    optionElement.value = sample.name
    sampleComboBox.add(optionElement)
  }
  sampleComboBox.selectedIndex = 0
}

/**
 * Binds actions to the buttons in the toolbar.
 */
function initializeUI() {
  document.querySelector('#layout-button').addEventListener('click', async () => {
    await arrangeGraph(true, true)
  })

  document.querySelector('#reset-button').addEventListener('click', async () => {
    await loadSample(true)
  })

  const sampleComboBox = document.querySelector('#sample-combo-box')
  sampleComboBox.addEventListener('change', () => loadSample(true))
  addNavigationButtons(sampleComboBox)
}

/**
 * Disables the HTML elements of the UI.
 * @param {boolean} disabled true if the element should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  document.querySelector('#reset-button').disabled = disabled
  document.querySelector('#layout-button').disabled = disabled
  document.querySelector('#sample-combo-box').disabled = disabled
  graphComponent.inputMode.enabled = !disabled
}

/**
 * Updates the layout popup visibility and text.
 * @param {boolean} visible true if the popup should be visible, false otherwise
 * @param text the desired text
 * @param {!string} [text]
 */
function updateLayoutPopup(visible, text) {
  const popup = document.querySelector('#loadingPopup')
  popup.className = visible ? 'visible' : ''
  if (text != null) {
    popup.innerHTML = text
  }
}

void run().then(finishLoading)
