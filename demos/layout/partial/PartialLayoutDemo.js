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
  CircularLayout,
  ComponentAssignmentStrategy,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  GroupNodeLabelModel,
  HierarchicalLayout,
  IEdge,
  INode,
  LabelStyle,
  LayoutExecutor,
  License,
  Mapper,
  OrganicLayout,
  OrthogonalLayout,
  PartialLayout,
  PartialLayoutData,
  PartialLayoutOrientation,
  PartialLayoutRoutingStyle,
  PolylineEdgeStyle,
  Size,
  SubgraphPlacement
} from '@yfiles/yfiles'
import { createDemoGroupStyle, createDemoNodeStyle } from '@yfiles/demo-app/demo-styles'
import licenseData from '../../../lib/license.json'
import { addNavigationButtons, finishLoading } from '@yfiles/demo-app/demo-page'

let graphComponent

let partialNodesMapper
let partialEdgesMapper

let partialNodeStyle
let partialGroupStyle
let partialEdgeStyle
let fixedNodeStyle
let fixedGroupNodeStyle
let fixedEdgeStyle

async function run() {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  // initialize default styles
  initializeGraph()

  // initialize interactive behavior
  initializeInputModes()

  // bind toolbar buttons to actions
  initializeUI()

  // load the first scenario
  await loadScenario()
}

/**
 * Runs a partial layout considering all selected options and partial/fixed nodes.
 */
async function runLayout() {
  setUIDisabled(true)

  // configure layout
  const distance = Number.parseFloat(document.querySelector(`#node-distance`).value)
  const partialLayout = new PartialLayout({
    coreLayout: getSubgraphLayout(),
    componentAssignmentStrategy: getComponentAssignmentStrategy(),
    subgraphPlacement: getSubgraphPlacement(),
    edgeRoutingStyle: getEdgeRoutingStyle(),
    layoutOrientation: getLayoutOrientation(),
    minimumNodeDistance: Number.isNaN(distance) ? 0 : distance,
    allowMirroring: document.querySelector(`#mirroring`).checked,
    considerNodeAlignment: document.querySelector(`#snapping`).checked
  })

  // mark partial elements for the layout algorithm
  const partialLayoutData = new PartialLayoutData({
    scope: { nodes: (node) => !isFixed(node), edges: (edge) => !isFixed(edge) }
  })

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  // run layout algorithm
  try {
    await graphComponent.applyLayoutAnimated(partialLayout, '0.5s', partialLayoutData)
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Retrieves the selected layout for partial components.
 */
function getSubgraphLayout() {
  const distance = Number.parseFloat(document.querySelector(`#node-distance`).value)
  const layout = document.querySelector(`#subgraph-layout`).value
  switch (layout) {
    case 'hierarchical': {
      return new HierarchicalLayout({ minimumLayerDistance: distance, nodeDistance: distance })
    }
    case 'orthogonal': {
      return new OrthogonalLayout({ gridSpacing: distance })
    }
    case 'organic': {
      return new OrganicLayout({ defaultMinimumNodeDistance: distance })
    }
    case 'circular': {
      const circularLayout = new CircularLayout()
      circularLayout.partitionDescriptor.minimumNodeDistance = distance
      circularLayout.backboneLayout.minimumNodeDistance = distance
      return circularLayout
    }
    default:
      return new HierarchicalLayout({ minimumLayerDistance: distance, nodeDistance: distance })
  }
}

/**
 * Retrieves the assignment strategy, either single nodes or components.
 */
function getComponentAssignmentStrategy() {
  const componentAssignment = document.querySelector(`#component-assignment`).value
  switch (componentAssignment) {
    case 'single':
      return ComponentAssignmentStrategy.SINGLE
    case 'connected':
      return ComponentAssignmentStrategy.CONNECTED
    default:
      return ComponentAssignmentStrategy.SINGLE
  }
}

/**
 * Retrieves the positioning strategy, either nodes are place close to the barycenter of their neighbors or their
 * initial location.
 */
function getSubgraphPlacement() {
  const placement = document.querySelector(`#subgraph-positioning`).value
  switch (placement) {
    case 'barycenter':
      return SubgraphPlacement.BARYCENTER
    case 'from-sketch':
      return SubgraphPlacement.FROM_SKETCH
    default:
      return SubgraphPlacement.BARYCENTER
  }
}

/**
 * Retrieves the edge routing strategy for partial edges and edges connected to partial nodes.
 */
function getEdgeRoutingStyle() {
  const edgeRouting = document.querySelector(`#edge-routing-style`).value
  switch (edgeRouting) {
    case 'automatic':
      return PartialLayoutRoutingStyle.AUTOMATIC
    case 'orthogonal':
      return PartialLayoutRoutingStyle.ORTHOGONAL
    case 'straight-line':
      return PartialLayoutRoutingStyle.STRAIGHT_LINE
    case 'organic':
      return PartialLayoutRoutingStyle.ORGANIC
    case 'octilinear':
      return PartialLayoutRoutingStyle.OCTILINEAR
    default:
      return PartialLayoutRoutingStyle.AUTOMATIC
  }
}

/**
 * Retrieves the layout orientation for partial components.
 */
function getLayoutOrientation() {
  const orientation = document.querySelector(`#layout-orientation`).value
  switch (orientation) {
    default:
    case 'none':
      return PartialLayoutOrientation.NONE
    case 'auto-detect':
      return PartialLayoutOrientation.AUTO_DETECT
    case 'top-to-bottom':
      return PartialLayoutOrientation.TOP_TO_BOTTOM
    case 'bottom-to-top':
      return PartialLayoutOrientation.BOTTOM_TO_TOP
    case 'left-to-right':
      return PartialLayoutOrientation.LEFT_TO_RIGHT
    case 'right-to-left':
      return PartialLayoutOrientation.RIGHT_TO_LEFT
  }
}

/**
 * Activates folding, sets the defaults for new graph elements and registers mappers
 */
function initializeGraph() {
  const foldingManager = new FoldingManager()
  graphComponent.graph = foldingManager.createFoldingView().graph

  // initialize styles
  partialNodeStyle = createNodeStyle(true)
  partialGroupStyle = createGroupNodeStyle(true)
  partialEdgeStyle = createEdgeStyle(true)
  fixedNodeStyle = createNodeStyle(false)
  fixedGroupNodeStyle = createGroupNodeStyle(false)
  fixedEdgeStyle = createEdgeStyle(false)

  const graph = graphComponent.graph
  graphComponent.navigationCommandsEnabled = true

  graph.nodeDefaults.size = new Size(60, 30)
  graph.nodeDefaults.style = partialNodeStyle
  graph.edgeDefaults.style = partialEdgeStyle

  graph.groupNodeDefaults.labels.layoutParameter =
    new GroupNodeLabelModel().createTabBackgroundParameter()
  graph.groupNodeDefaults.labels.style = new LabelStyle({
    horizontalTextAlignment: 'left',
    textFill: 'white'
  })
  graph.groupNodeDefaults.style = partialGroupStyle

  // Create and register mappers that specify partial graph elements
  partialNodesMapper = new Mapper()
  partialNodesMapper.defaultValue = true
  partialEdgesMapper = new Mapper()
  partialEdgesMapper.defaultValue = true
}

/**
 * Creates a new style instance for nodes in this demo.
 * @param partial Whether the node is partial or fixed.
 */
function createNodeStyle(partial) {
  return createDemoNodeStyle(partial ? 'demo-orange' : 'demo-palette-58')
}

/**
 * Creates a new style instance for group nodes in this demo.
 * @param partial Whether the node is partial or fixed.
 */
function createGroupNodeStyle(partial) {
  const palette = partial ? 'demo-palette-12' : 'demo-palette-58'
  return createDemoGroupStyle({ colorSetName: palette, foldingEnabled: true })
}

/**
 * Creates a new style instance for edges in this demo.
 * @param partial Whether the edge is partial or fixed.
 */
function createEdgeStyle(partial) {
  const edgeColor = partial ? '#ff6c00' : '#4d4d4d'
  return new PolylineEdgeStyle({
    stroke: `1.5px ${edgeColor}`,
    targetArrow: `${edgeColor} small triangle`
  })
}

/**
 * Configures input modes to interact with the graph structure.
 */
function initializeInputModes() {
  const inputMode = new GraphEditorInputMode({ allowEditLabel: false })
  inputMode.addEventListener('item-double-clicked', (evt) => {
    // a graph element was double-clicked => toggle its fixed/partial state
    setFixed(evt.item, !isFixed(evt.item))
  })
  // add a label to newly created nodes and mark the node as non-fixed
  inputMode.addEventListener('node-created', (evt) => {
    const node = evt.item
    const graph = graphComponent.graph
    if (graph.isGroupNode(node)) {
      graph.addLabel(node, 'Group')
    } else {
      graph.addLabel(node, graph.nodes.size.toString())
    }
    setFixed(node, false)
  })
  inputMode.createEdgeInputMode.addEventListener('edge-created', (evt) => {
    setFixed(evt.item, false)
  })
  inputMode.navigationInputMode.addEventListener('group-collapsed', (evt) => {
    const group = evt.item
    updateStyle(group, isFixed(group))
  })
  inputMode.navigationInputMode.addEventListener('group-expanded', (evt) => {
    const group = evt.item
    updateStyle(group, isFixed(group))
  })
  graphComponent.inputMode = inputMode
}

/**
 * Sets the given item as fixed or movable and changes its color to indicate its new state.
 */
function setFixed(item, fixed) {
  const masterItem = getMasterItem(item)
  if (masterItem instanceof INode) {
    partialNodesMapper.set(masterItem, !fixed)
    updateStyle(item, fixed)
  } else if (masterItem instanceof IEdge) {
    partialEdgesMapper.set(masterItem, !fixed)
    updateStyle(item, fixed)
  }
}

/**
 * Returns if a given item is considered fixed or shall be rearranged by the layout algorithm.
 * Note that an edge always gets rerouted if any of its end nodes may be moved.
 */
function isFixed(item) {
  const masterItem = getMasterItem(item)
  if (masterItem instanceof INode) {
    return !partialNodesMapper.get(masterItem)
  } else if (masterItem instanceof IEdge) {
    return !partialEdgesMapper.get(masterItem)
  }
  return false
}

/**
 * Returns the master item for the given item.
 * Since folding is supported in this demo, partial/fixed states are stored for the master items to stay consistent
 * when expanding/collapsing group nodes.
 */
function getMasterItem(item) {
  const graph = graphComponent.graph
  const foldingView = graph.foldingView
  if (foldingView.manager.masterGraph.contains(item)) {
    return item
  }
  if (graph.contains(item)) {
    return foldingView.getMasterItem(item)
  }
  return null
}

/**
 * Updates the style of the given item when the partial/fixed state has changed.
 */
function updateStyle(item, fixed) {
  const graph = graphComponent.graph
  if (item instanceof INode) {
    const foldingView = graph.foldingView
    const masterGraph = foldingView.manager.masterGraph
    if (masterGraph.isGroupNode(foldingView.getMasterItem(item))) {
      graph.setStyle(item, fixed ? fixedGroupNodeStyle : partialGroupStyle)
    } else {
      graph.setStyle(item, fixed ? fixedNodeStyle : partialNodeStyle)
    }
  } else if (item instanceof IEdge) {
    graph.setStyle(item, fixed ? fixedEdgeStyle : partialEdgeStyle)
  }
}

/**
 * Updates the partial/fixed state of all graph elements that are currently selected.
 */
function setSelectionFixed(fixed) {
  const selection = graphComponent.selection
  selection.nodes.forEach((node) => {
    setFixed(node, fixed)
  })
  selection.edges.forEach((edge) => {
    setFixed(edge, fixed)
  })
}

/**
 * Binds actions to the buttons in the toolbar.
 */
function initializeUI() {
  document.querySelector('#lock-selection').addEventListener('click', () => {
    setSelectionFixed(true)
  })
  document.querySelector('#unlock-selection').addEventListener('click', () => {
    setSelectionFixed(false)
  })
  document.querySelector('#layout').addEventListener('click', runLayout)

  addNavigationButtons(document.querySelector('#select-sample')).addEventListener(
    'change',
    loadScenario
  )
  document.querySelector('#refresh').addEventListener('click', loadScenario)
}

/**
 * Loads one of four scenarios that come with a sample graph and a layout configuration.
 */
async function loadScenario() {
  partialNodesMapper.clear()
  partialEdgesMapper.clear()

  const ioHandler = new GraphMLIOHandler()
  ioHandler.addInputMapper(INode, Boolean, PartialLayout.NODE_SCOPE_DATA_KEY.id, partialNodesMapper)
  ioHandler.addInputMapper(IEdge, Boolean, PartialLayout.EDGE_SCOPE_DATA_KEY.id, partialEdgesMapper)

  const sample = document.querySelector(`#select-sample`).value

  const path = `resources/${sample}.graphml`
  switch (sample) {
    default:
    case 'hierarchical':
      setOptions(
        'hierarchical',
        'connected',
        'barycenter',
        'orthogonal',
        'top-to-bottom',
        5,
        true,
        true
      )
      break
    case 'orthogonal':
      setOptions('orthogonal', 'single', 'barycenter', 'orthogonal', 'none', 20, false, true)
      break
    case 'organic':
      setOptions('organic', 'single', 'barycenter', 'automatic', 'none', 30, true, false)
      break
    case 'circular':
      setOptions('circular', 'connected', 'barycenter', 'automatic', 'none', 10, true, false)
      break
  }

  const graph = graphComponent.graph
  await ioHandler.readFromURL(graph, path)
  graph.nodes.forEach((node) => {
    const fixed = isFixed(node)
    updateStyle(node, fixed)
  })
  graph.edges.forEach((edge) => {
    updateStyle(edge, isFixed(edge))
  })
  await graphComponent.fitGraphBounds()
}

/**
 * Update the options according to the current scenario.
 */
function setOptions(
  subgraphLayout,
  componentAssignmentStrategy,
  subgraphPlacement,
  edgeRoutingStrategy,
  layoutOrientation,
  minimumNodeDistance,
  allowMirroring,
  nodeSnapping
) {
  document.querySelector('#subgraph-layout').value = subgraphLayout
  document.querySelector('#component-assignment').value = componentAssignmentStrategy
  document.querySelector('#subgraph-positioning').value = subgraphPlacement
  document.querySelector('#edge-routing-style').value = edgeRoutingStrategy
  document.querySelector('#layout-orientation').value = layoutOrientation
  document.querySelector(`#node-distance`).value = minimumNodeDistance.toString()
  document.querySelector(`#mirroring`).value = allowMirroring.toString()
  document.querySelector(`#snapping`).value = nodeSnapping.toString()
}

/**
 * Enables/disables the buttons in the toolbar and the input mode. This is used for managing the toolbar during
 * layout calculation.
 */
function setUIDisabled(disabled) {
  document.querySelector(`#lock-selection`).disabled = disabled
  document.querySelector(`#unlock-selection`).disabled = disabled
  document.querySelector(`#select-sample`).disabled = disabled
  document.querySelector(`#refresh`).disabled = disabled
  document.querySelector(`#layout`).disabled = disabled
}

run().then(finishLoading)
