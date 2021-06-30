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
  Class,
  ComponentAssignmentStrategy,
  DefaultLabelStyle,
  EdgeRouter,
  FoldingManager,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  HierarchicLayout,
  ICommand,
  IEdge,
  IEdgeStyle,
  ILayoutAlgorithm,
  IModelItem,
  INode,
  INodeStyle,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  License,
  Mapper,
  OrganicEdgeRouter,
  OrganicLayout,
  OrthogonalLayout,
  PartialLayout,
  PartialLayoutData,
  PartialLayoutEdgeRoutingStrategy,
  PartialLayoutOrientation,
  Size,
  SubgraphPlacement,
  YBoolean
} from 'yfiles'

import { DemoEdgeStyle, DemoGroupStyle, DemoNodeStyle } from '../../resources/demo-styles'
import {
  bindAction,
  bindChangeListener,
  bindCommand,
  readGraph,
  setComboboxValue,
  showApp
} from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

// We need to load the modules 'router-polyline' and 'router-other' explicitly to prevent
// tree-shaking tools from removing this dependency which is needed for 'PartialLayout'.
Class.ensure(EdgeRouter, OrganicEdgeRouter)

let graphComponent: GraphComponent

let partialNodesMapper: Mapper<INode, boolean>
let partialEdgesMapper: Mapper<IEdge, boolean>

let partialNodeStyle: INodeStyle
let partialGroupStyle: INodeStyle
let partialEdgeStyle: IEdgeStyle
let fixedNodeStyle: INodeStyle
let fixedGroupNodeStyle: INodeStyle
let fixedEdgeStyle: IEdgeStyle

function run(licenseData: any): void {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')

  // initialize default styles
  initializeGraph()

  // initialize interactive behavior
  initializeInputModes()

  // bind toolbar buttons to actions
  registerCommands()

  // load the first scenario
  loadScenario()

  showApp(graphComponent)
}

/**
 * Runs a partial layout considering all selected options and partial/fixed nodes.
 */
async function runLayout() {
  setUIDisabled(true)

  // configure layout
  const distance = Number.parseFloat(getElementById<HTMLInputElement>('node-distance').value)
  const partialLayout = new PartialLayout({
    coreLayout: getSubgraphLayout(),
    componentAssignmentStrategy: getComponentAssignmentStrategy(),
    subgraphPlacement: getSubgraphPlacement(),
    edgeRoutingStrategy: getEdgeRoutingStrategy(),
    layoutOrientation: getLayoutOrientation(),
    minimumNodeDistance: Number.isNaN(distance) ? 0 : distance,
    allowMirroring: getElementById<HTMLInputElement>('mirroring').checked,
    considerNodeAlignment: getElementById<HTMLInputElement>('snapping').checked
  })

  // mark partial elements for the layout algorithm
  const partialLayoutData = new PartialLayoutData({
    affectedNodes: (node: INode): boolean => !isFixed(node),
    affectedEdges: (edge: IEdge): boolean => !isFixed(edge)
  })
  // run layout algorithm
  try {
    await graphComponent.morphLayout(partialLayout, '0.5s', partialLayoutData)
  } finally {
    setUIDisabled(false)
  }
}

/**
 * Retrieves the selected layout for partial components.
 */
function getSubgraphLayout(): ILayoutAlgorithm {
  const distance = Number.parseFloat(getElementById<HTMLInputElement>('node-distance').value)
  const layout: string = getElementById<HTMLInputElement>('subgraph-layout').value
  switch (layout) {
    default:
    case 'Hierarchic': {
      return new HierarchicLayout({
        minimumLayerDistance: distance,
        nodeToNodeDistance: distance
      })
    }
    case 'Orthogonal': {
      return new OrthogonalLayout({
        gridSpacing: distance
      })
    }
    case 'Organic': {
      return new OrganicLayout({
        minimumNodeDistance: distance
      })
    }
    case 'Circular': {
      const circularLayout = new CircularLayout()
      circularLayout.singleCycleLayout.minimumNodeDistance = distance
      circularLayout.balloonLayout.minimumNodeDistance = distance
      return circularLayout
    }
  }
}

/**
 * Retrieves the assignment strategy, either single nodes or components.
 */
function getComponentAssignmentStrategy(): ComponentAssignmentStrategy {
  const componentAssignment: string = getElementById<HTMLInputElement>('component-assignment').value
  switch (componentAssignment) {
    default:
    case 'Single':
      return ComponentAssignmentStrategy.SINGLE
    case 'Connected':
      return ComponentAssignmentStrategy.CONNECTED
  }
}

/**
 * Retrieves the positioning strategy, either nodes are place close to the barycenter of their neighbors or their
 * initial location.
 */
function getSubgraphPlacement(): SubgraphPlacement {
  const placement: string = getElementById<HTMLInputElement>('subgraph-positioning').value
  switch (placement) {
    default:
    case 'Barycenter':
      return SubgraphPlacement.BARYCENTER
    case 'From Sketch':
      return SubgraphPlacement.FROM_SKETCH
  }
}

/**
 * Retrieves the edge routing strategy for partial edges and edges connected to partial nodes.
 */
function getEdgeRoutingStrategy(): PartialLayoutEdgeRoutingStrategy {
  const edgeRouting: string = getElementById<HTMLInputElement>('edge-routing-style').value
  switch (edgeRouting) {
    default:
    case 'Automatic':
      return PartialLayoutEdgeRoutingStrategy.AUTOMATIC
    case 'Orthogonal':
      return PartialLayoutEdgeRoutingStrategy.ORTHOGONAL
    case 'Straightline':
      return PartialLayoutEdgeRoutingStrategy.STRAIGHTLINE
    case 'Organic':
      return PartialLayoutEdgeRoutingStrategy.ORGANIC
    case 'Octilinear':
      return PartialLayoutEdgeRoutingStrategy.OCTILINEAR
  }
}

/**
 * Retrieves the layout orientation for partial components.
 */
function getLayoutOrientation(): PartialLayoutOrientation {
  const orientation: string = getElementById<HTMLInputElement>('layout-orientation').value
  switch (orientation) {
    default:
    case 'None':
      return PartialLayoutOrientation.NONE
    case 'Auto-detect':
      return PartialLayoutOrientation.AUTO_DETECT
    case 'Top to Bottom':
      return PartialLayoutOrientation.TOP_TO_BOTTOM
    case 'Bottom to Top':
      return PartialLayoutOrientation.BOTTOM_TO_TOP
    case 'Left to Right':
      return PartialLayoutOrientation.LEFT_TO_RIGHT
    case 'Right to Left':
      return PartialLayoutOrientation.RIGHT_TO_LEFT
  }
}

/**
 * Activates folding, sets the defaults for new graph elements and registers mappers
 */
function initializeGraph(): void {
  const foldingManager = new FoldingManager()
  graphComponent.graph = foldingManager.createFoldingView().graph

  // initialize styles
  partialNodeStyle = newDemoNodeStyle('', false)
  partialGroupStyle = newDemoNodeStyle('', true)
  partialEdgeStyle = newDemoEdgeStyle('partial-edge')
  fixedNodeStyle = newDemoNodeStyle('fixed-node', false)
  fixedGroupNodeStyle = newDemoNodeStyle('fixed-group-node', true)
  fixedEdgeStyle = newDemoEdgeStyle('fixed-edge')

  const graph = graphComponent.graph
  graphComponent.navigationCommandsEnabled = true

  graph.nodeDefaults.size = new Size(60, 30)
  graph.nodeDefaults.style = partialNodeStyle
  graph.edgeDefaults.style = partialEdgeStyle

  const labelModel = new InteriorStretchLabelModel({ insets: 4 })
  graph.groupNodeDefaults.labels.layoutParameter = labelModel.createParameter(
    InteriorStretchLabelModelPosition.NORTH
  )
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'left',
    textFill: 'white'
  })
  graph.groupNodeDefaults.style = partialGroupStyle

  // Create and register mappers that specify partial graph elements
  partialNodesMapper = new Mapper({ defaultValue: true })
  partialEdgesMapper = new Mapper({ defaultValue: true })
}

/**
 * Creates a new style instance for nodes in this demo.
 * @param cssClassName The name of the CSS class to use for the new style instance.
 * @param group If true, a DemoGroupStyle instance is created;
 * otherwise a DemoNodeStyle instance  is created.
 */
function newDemoNodeStyle(cssClassName: string, group: boolean): INodeStyle {
  if (group) {
    const style = new DemoGroupStyle()
    style.isCollapsible = true
    style.cssClass = cssClassName
    return style
  } else {
    const style = new DemoNodeStyle()
    style.cssClass = cssClassName
    return style
  }
}

/**
 * Creates a new style instance for edges in this demo.
 * @param cssClassName The name of the CSS class to use for the new style instance.
 */
function newDemoEdgeStyle(cssClassName: string): IEdgeStyle {
  const style = new DemoEdgeStyle()
  style.cssClass = cssClassName
  return style
}

/**
 * Configures input modes to interact with the graph structure.
 */
function initializeInputModes(): void {
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    allowEditLabel: false
  })
  inputMode.addItemDoubleClickedListener((sender, args) => {
    // a graph element was double clicked => toggle its fixed/partial state
    setFixed(args.item, !isFixed(args.item))
  })
  // add a label to newly created nodes and mark the node as non-fixed
  inputMode.addNodeCreatedListener((sender, args) => {
    const node = args.item
    const graph = graphComponent.graph
    if (graph.isGroupNode(node)) {
      graph.addLabel(node, 'Group')
    } else {
      graph.addLabel(node, graph.nodes.size.toString())
    }
    setFixed(node, false)
  })
  inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
    setFixed(args.item, false)
  })
  inputMode.navigationInputMode.addGroupCollapsedListener((sender, args) => {
    const group = args.item
    updateStyle(group, isFixed(group))
  })
  inputMode.navigationInputMode.addGroupExpandedListener((sender, args) => {
    const group = args.item
    updateStyle(group, isFixed(group))
  })
  graphComponent.inputMode = inputMode
}

/**
 * Sets the given item as fixed or movable and changes its color to indicate its new state.
 */
function setFixed(item: IModelItem, fixed: boolean): void {
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
function isFixed(item: IModelItem): boolean {
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
function getMasterItem(item: IModelItem): IModelItem | null {
  const graph = graphComponent.graph
  const foldingView = graph.foldingView!
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
function updateStyle(item: IModelItem, fixed: boolean): void {
  const graph = graphComponent.graph
  if (item instanceof INode) {
    const foldingView = graph.foldingView!
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
function setSelectionFixed(fixed: boolean): void {
  const selection = graphComponent.selection
  selection.selectedNodes.forEach(node => {
    setFixed(node, fixed)
  })
  selection.selectedEdges.forEach(edge => {
    setFixed(edge, fixed)
  })
}

/**
 * Binds commands to the buttons in the toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  bindAction("button[data-command='LockSelection']", () => {
    setSelectionFixed(true)
  })
  bindAction("button[data-command='UnlockSelection']", () => {
    setSelectionFixed(false)
  })
  bindAction("button[data-command='Layout']", runLayout)

  bindChangeListener("select[data-command='SelectSample']", loadScenario)
  bindAction("button[data-command='Refresh']", loadScenario)
}

/**
 * Loads one of four scenarios that come with a sample graph and a layout configuration.
 */
async function loadScenario(): Promise<void> {
  partialNodesMapper.clear()
  partialEdgesMapper.clear()

  const ioHandler = new GraphMLIOHandler()
  ioHandler.addInputMapper(
    INode.$class,
    YBoolean.$class,
    PartialLayout.AFFECTED_NODES_DP_KEY.name!,
    partialNodesMapper
  )
  ioHandler.addInputMapper(
    IEdge.$class,
    YBoolean.$class,
    PartialLayout.AFFECTED_EDGES_DP_KEY.name!,
    partialEdgesMapper
  )

  const sample = getElementById<HTMLSelectElement>('select-sample')
    .value.substring(10)
    .toLowerCase()
  const path = `resources/${sample}.graphml`
  switch (sample) {
    default:
    case 'Hierarchic':
      setOptions(
        'Hierarchic',
        'Connected',
        'Barycenter',
        'Orthogonal',
        'Top to Bottom',
        5,
        true,
        true
      )
      break
    case 'Orthogonal':
      setOptions('Orthogonal', 'Single', 'Barycenter', 'Orthogonal', 'None', 20, false, true)
      break
    case 'Organic':
      setOptions('Organic', 'Single', 'Barycenter', 'Automatic', 'None', 30, true, false)
      break
    case 'Circular':
      setOptions('Circular', 'Connected', 'Barycenter', 'Automatic', 'None', 10, true, false)
      break
  }

  const graph = graphComponent.graph
  await readGraph(ioHandler, graph, path)
  graph.nodes.forEach(node => {
    const fixed = isFixed(node)
    updateStyle(node, fixed)
  })
  graph.edges.forEach(edge => {
    updateStyle(edge, isFixed(edge))
  })
  graphComponent.fitGraphBounds()
}

/**
 * Update the options according to the current scenario.
 */
function setOptions(
  subgraphLayout: string,
  componentAssignmentStrategy: string,
  subgraphPlacement: string,
  edgeRoutingStrategy: string,
  layoutOrientation: string,
  minimumNodeDistance: number,
  allowMirroring: boolean,
  nodeSnapping: boolean
): void {
  setComboboxValue('subgraph-layout', subgraphLayout)
  setComboboxValue('component-assignment', componentAssignmentStrategy)
  setComboboxValue('subgraph-positioning', subgraphPlacement)
  setComboboxValue('edge-routing-style', edgeRoutingStrategy)
  setComboboxValue('layout-orientation', layoutOrientation)
  getElementById<HTMLInputElement>('node-distance').value = minimumNodeDistance.toString()
  getElementById<HTMLInputElement>('mirroring').value = allowMirroring.toString()
  getElementById<HTMLInputElement>('snapping').value = nodeSnapping.toString()
}

/**
 * Enables/disables the buttons in the toolbar and the input mode. This is used for managing the toolbar during
 * layout calculation.
 */
function setUIDisabled(disabled: boolean): void {
  getElementById<HTMLSelectElement>('lock-selection').disabled = disabled
  getElementById<HTMLSelectElement>('unlock-selection').disabled = disabled
  getElementById<HTMLSelectElement>('select-sample').disabled = disabled
  getElementById<HTMLInputElement>('refresh').disabled = disabled
  getElementById<HTMLInputElement>('layout').disabled = disabled
}

/**
 * Returns a reference to the first element with the specified ID in the current document.
 * @return A reference to the first element with the specified ID in the current document.
 */
function getElementById<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T
}

// run the demo
loadJson().then(run)
