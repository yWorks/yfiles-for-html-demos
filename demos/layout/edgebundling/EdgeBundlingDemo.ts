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
  BundledEdgeRouter,
  BundledEdgeRouterData,
  CircularLayout,
  CircularLayoutData,
  CircularLayoutPartitioningPolicy,
  Color,
  ConnectedComponents,
  Cursor,
  CurveFittingStage,
  EdgeBundleDescriptor,
  EdgeStyleIndicatorRenderer,
  FreeNodeLabelModel,
  GenericLabeling,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IEdge,
  IGraph,
  ILayoutAlgorithm,
  IModelItem,
  INode,
  LayoutData,
  LayoutExecutor,
  License,
  Mapper,
  NodeStyleIndicatorRenderer,
  OrganicEdgeRouter,
  Point,
  PopulateItemContextMenuEventArgs,
  RadialLayout,
  RadialLayoutData,
  RadialTreeLayout,
  Rect,
  ResultItemMapping,
  SingleLayerSubtreePlacer,
  StraightLineEdgeRouter,
  TreeLayout,
  TreeReductionStage,
  TreeReductionStageData
} from '@yfiles/yfiles'

import { DemoEdgeStyle, DemoNodeStyle } from './DemoStyles'
import RadialTreeSampleData from './resources/radial-tree'
import BccCircularSampleData from './resources/bccCircular'
import CircularSampleData from './resources/circular'
import RadialSampleData from './resources/radial'
import TreeSampleData from './resources/tree'
import RoutingSampleData from './resources/routing'
import { fetchLicense } from '@yfiles/demo-resources/fetch-license'
import {
  addNavigationButtons,
  finishLoading,
  showLoadingIndicator
} from '@yfiles/demo-resources/demo-page'

type NodeData = { id: number; layout: { x: number; y: number; w: number; h: number } }

type GraphData = { nodes: [{ nodeData: NodeData }]; edges: [{ source: number; target: number }] }

/**
 * The GraphComponent
 */
let graphComponent: GraphComponent = null!

/**
 * Holds the component index for each node.
 * It is necessary for determining in circular layouts the circle id in graphs with more than one
 * connected components.
 */
let componentsMap: ResultItemMapping<INode, number> | undefined

/**
 * Holds the edge bundle descriptors for each edge.
 */
const bundleDescriptorMap = new Mapper<IEdge, EdgeBundleDescriptor>()

/**
 * Holds whether an edge has to be bundled or not.
 */
const bundlesMap = new Mapper<IEdge, boolean>()

// inits the UI's elements
const samplesComboBox = document.querySelector<HTMLSelectElement>('#sample-combo-box')!
const bundlingStrengthSlider = document.querySelector<HTMLInputElement>(
  '#bundling-strength-slider'
)!
const bundlingStrengthLabel = document.querySelector<HTMLInputElement>('#bundling-strength-label')!

async function run(): Promise<void> {
  License.value = await fetchLicense()
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')
  // create the input mode
  createInputMode()

  // set the default styles
  initializeGraph()

  // load the sample graph and run the layout
  await onSampleChanged()

  // wire up the UI
  initializeUI()
}

/**
 * Creates the input mode.
 */
function createInputMode(): void {
  const mode = new GraphEditorInputMode({
    focusableItems: GraphItemTypes.NONE,
    showHandleItems: GraphItemTypes.NONE,
    // disable node moving
    movableSelectedItems: GraphItemTypes.NONE,
    clickHitTestOrder: [GraphItemTypes.NODE, GraphItemTypes.EDGE]
  })

  // disallow interactive bend creation
  mode.allowCreateBend = false

  // when an item is deleted, calculate the new components and apply the layout
  mode.addEventListener('deleted-selection', async () => {
    calculateConnectedComponents()
    await applyLayout()
  })

  // when an edge is created, calculate the new components and apply the layout
  mode.createEdgeInputMode.addEventListener('edge-created', async () => {
    calculateConnectedComponents()
    await applyLayout()
  })

  // when a node is created, calculate the new components
  mode.addEventListener('node-created', () => {
    calculateConnectedComponents()
  })

  // when a drag operation has finished, apply a layout
  mode.moveSelectedItemsInputMode.addEventListener('drag-finished', async () => await applyLayout())
  mode.moveUnselectedItemsInputMode.addEventListener(
    'drag-finished',
    async () => await applyLayout()
  )

  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  mode.itemHoverInputMode.hoverCursor = Cursor.POINTER
  mode.itemHoverInputMode.addEventListener('hovered-item-changed', (evt) => {
    const item = evt.item
    const highlights = graphComponent.highlights
    highlights.clear()
    if (item) {
      if (item instanceof INode) {
        graphComponent.graph.edgesAt(item).forEach((edge) => {
          highlights.add(edge)
          highlights.add(item !== edge.sourceNode ? edge.sourceNode : edge.targetNode)
        })
        highlights.add(item)
      } else if (item instanceof IEdge) {
        highlights.add(item)
        highlights.add(item.sourceNode)
        highlights.add(item.targetNode)
      }
    }
  })

  // Add an event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  mode.addEventListener('populate-item-context-menu', (evt) => populateContextMenu(evt))

  graphComponent.inputMode = mode
}

/**
 * Populates the context menu based on the item the mouse hovers over
 * @param args The event args.
 */
function populateContextMenu(args: PopulateItemContextMenuEventArgs<IModelItem>): void {
  if (args.handled) {
    return
  }

  // In this demo, we use the following custom hit testing to prefer nodes.
  const hits = graphComponent.graphModelManager.hitElementsAt(args.queryLocation)

  // Check whether an edge or a node was hit
  const hit = hits.at(0)

  if (hit instanceof IEdge || hit instanceof INode) {
    let selectedEdges: IEdge[]

    if (hit instanceof IEdge) {
      // update the hit edge and all other possible selected edges
      selectedEdges = graphComponent.selection.edges.toArray()
      selectedEdges.push(hit)
    } else {
      // update the hit node and all other possible selected nodes and update their adjacent edges
      const selectedNodes = graphComponent.selection.nodes.toArray()
      selectedNodes.push(hit)

      selectedEdges = []
      selectedNodes.forEach((node) => {
        if (graphComponent.graph.degree(node) > 0) {
          selectedEdges = selectedEdges.concat(graphComponent.graph.edgesAt(node).toArray())
        }
      })
    }

    const menuItems = []
    const result = countBundledEdges(selectedEdges)
    if (result.countUnbundled > 0) {
      const text = hit instanceof IEdge ? 'Bundle Selected Edges' : 'Bundle Edges At Selected Nodes'
      menuItems.push({
        label: text,
        action: () => updateBundlingForSelectedEdges(selectedEdges, true)
      })
    }
    if (result.countBundled > 0) {
      const text =
        hit instanceof IEdge ? 'Un-bundle Selected Edges' : 'Un-bundle Edges At Selected Nodes'
      menuItems.push({
        label: text,
        action: () => updateBundlingForSelectedEdges(selectedEdges, false)
      })
    }

    if (menuItems.length > 0) {
      args.contextMenu = menuItems
    }
  }
}

/**
 * Counts the number of bundled and unbundled edges of a given selection.
 * @param edges The selected edges
 * @returns The number of bundled and unbundled edges as an object
 */
function countBundledEdges(edges: Array<IEdge>): { countBundled: number; countUnbundled: number } {
  let countBundled = 0
  let countUnbundled = 0

  edges.forEach((edge) => {
    if (bundlesMap.get(edge)) {
      countBundled++
    }

    if (!bundlesMap.get(edge)) {
      countUnbundled++
    }
  })
  return { countBundled, countUnbundled }
}

/**
 * Enables or disables the edge bundling for the given edge.
 * @param edges The edges to update
 * @param isBundled True if the edges should be bundled, false otherwise
 */
async function updateBundlingForSelectedEdges(
  edges: Array<IEdge>,
  isBundled: boolean
): Promise<void> {
  edges.forEach((edge) => {
    bundlesMap.set(edge, isBundled)
    if (!isBundled) {
      bundleDescriptorMap.set(edge, new EdgeBundleDescriptor({ bundled: isBundled }))
    } else {
      // if null is set, the default descriptor will be used
      bundleDescriptorMap.set(edge, null)
    }
  })
  await applyLayout()
}

/**
 * Sets the default styles for the graph elements and initializes the highlight.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph
  // set the node and edge default styles
  graph.nodeDefaults.style = new DemoNodeStyle()
  graph.edgeDefaults.style = new DemoEdgeStyle()
  graph.nodeDefaults.labels.layoutParameter = FreeNodeLabelModel.CENTER

  // hide the selection indication
  graph.decorator.nodes.selectionRenderer.hide()
  graph.decorator.edges.selectionRenderer.hide()

  // configure the node/edge highlighting
  graph.decorator.nodes.highlightRenderer.addConstant(
    new NodeStyleIndicatorRenderer({
      nodeStyle: new DemoNodeStyle(Color.RED),
      zoomPolicy: 'world-coordinates'
    })
  )

  graph.decorator.edges.highlightRenderer.addConstant(
    new EdgeStyleIndicatorRenderer({ edgeStyle: new DemoEdgeStyle(6, Color.RED, Color.GOLD) })
  )

  // when a node is selected, select also the adjacent edges
  graphComponent.selection.addEventListener('item-added', (evt) => {
    const item = evt.item
    const selection = graphComponent.selection
    if (item instanceof INode) {
      selection.add(item)
      graph.edgesAt(item).forEach((edge) => {
        selection.add(edge)
      })
    }
  })
}

/**
 * Called when the selected item in the graph chooser combo box has changed.
 */
async function onSampleChanged(): Promise<void> {
  let sampleData: any
  switch (samplesComboBox.selectedIndex) {
    default:
    case LayoutAlgorithm.SINGLE_CYCLE:
      sampleData = CircularSampleData
      break
    case LayoutAlgorithm.CIRCULAR:
      sampleData = BccCircularSampleData
      break
    case LayoutAlgorithm.RADIAL:
      sampleData = RadialSampleData
      break
    case LayoutAlgorithm.RADIAL_TREE:
      sampleData = RadialTreeSampleData
      break
    case LayoutAlgorithm.TREE:
      sampleData = TreeSampleData
      break
    case LayoutAlgorithm.ROUTER:
      sampleData = RoutingSampleData
  }
  // clear the current graph
  graphComponent.graph.clear()
  // set the UI busy
  await setBusy(true)

  // load the graph
  await loadGraph(graphComponent.graph, sampleData)
  await runLayout()
}

/**
 * Parses the JSON and creates the graph elements.
 * @param graph The graph to populate with the items.
 * @param graphData The JSON data
 */
async function loadGraph(graph: IGraph, graphData: GraphData): Promise<void> {
  await setBusy(true)

  graph.clear()

  const builder = new GraphBuilder({
    graph: graph,
    nodes: [
      {
        data: graphData.nodes,
        id: 'id',
        layout: (data: NodeData): Rect => {
          const layout = data.layout
          return new Rect(
            layout.x,
            layout.y,
            layout.w || graph.nodeDefaults.size.width,
            layout.h || graph.nodeDefaults.size.height
          )
        },
        labels: ['name']
      }
    ],
    edges: [{ data: graphData.edges, sourceId: 'source', targetId: 'target' }]
  })
  graph = builder.buildGraph()

  graph.edges.forEach((edge) => {
    bundlesMap.set(edge, true)
  })

  // calculate the connected components of the new graph
  calculateConnectedComponents()
}

/**
 * Runs the layout.
 */
async function runLayout() {
  const selectedIndex = samplesComboBox.selectedIndex
  let layoutAlgorithm: ILayoutAlgorithm
  let layoutData: LayoutData
  switch (selectedIndex) {
    default:
    case 0:
    case 1: {
      layoutAlgorithm = createCircularLayout(selectedIndex === 0)
      layoutData = new CircularLayoutData({ edgeBundleDescriptors: bundleDescriptorMap })
      break
    }
    case 2: {
      layoutAlgorithm = createRadialLayout()
      layoutData = new RadialLayoutData({ edgeBundleDescriptors: bundleDescriptorMap })
      break
    }
    case 3:
    case 4: {
      layoutAlgorithm = selectedIndex === 3 ? createRadialTreeLayout() : createTreeLayout()
      layoutData = new TreeReductionStageData({ edgeBundleDescriptors: bundleDescriptorMap })
      break
    }
    case 5: {
      layoutAlgorithm = createBundleEdgeRouter()
      layoutData = new BundledEdgeRouterData({ edgeBundleDescriptors: bundleDescriptorMap })
    }
  }

  // Ensure that the LayoutExecutor class is not removed by build optimizers
  // It is needed for the 'applyLayoutAnimated' method in this demo.
  LayoutExecutor.ensure()

  // to apply bezier fitting, append the CurveFittingLayoutStage to the layout algorithm
  // we could also enable the bezier fitting from the edge bundling descriptor but, we would like for this demo to
  // have small error
  layoutAlgorithm = new CurveFittingStage({ coreLayout: layoutAlgorithm, maximumError: 1 })

  // run the layout
  await graphComponent.applyLayoutAnimated(layoutAlgorithm, '0.0s', layoutData)
  await setBusy(false)
  // if the selected algorithm is circular, change the node style to circular sectors
  if (
    selectedIndex === LayoutAlgorithm.SINGLE_CYCLE ||
    selectedIndex === LayoutAlgorithm.CIRCULAR
  ) {
    updateNodeInformation(layoutData as CircularLayoutData)
  }
}

/**
 * Creates and configures the circular layout algorithm.
 * @param singleCycle True if the layout should be single-cycle, false otherwise
 * @returns The configured circular layout algorithm
 */
function createCircularLayout(singleCycle: boolean): CircularLayout {
  const circularLayout = new CircularLayout()

  if (singleCycle) {
    circularLayout.partitioningPolicy = CircularLayoutPartitioningPolicy.SINGLE_CYCLE
    circularLayout.partitionDescriptor.minimumNodeDistance = 0
  }
  configureEdgeBundling(circularLayout)
  return circularLayout
}

/**
 * Creates and configures the radial layout algorithm.
 * @returns The configured radial layout algorithm
 */
function createRadialLayout(): RadialLayout {
  const radialLayout = new RadialLayout()
  configureEdgeBundling(radialLayout)
  return radialLayout
}

/**
 * Creates and configures the radial tree layout algorithm.
 * @returns The configured radial tree layout algorithm
 */
function createRadialTreeLayout(): RadialTreeLayout {
  const radialTreeLayout = new RadialTreeLayout()
  createTreeReductionStage(radialTreeLayout.treeReductionStage)
  return radialTreeLayout
}

/**
 * Creates and configures the tree layout algorithm.
 * @returns The configured tree layout algorithm
 */
function createTreeLayout(): TreeLayout {
  const treeLayout = new TreeLayout()
  ;(treeLayout.defaultSubtreePlacer as SingleLayerSubtreePlacer).edgeRoutingStyle = 'straight-line'

  createTreeReductionStage(treeLayout.treeReductionStage)
  return treeLayout
}

/**
 * Creates and configures the tree reduction stage.
 */
function createTreeReductionStage(treeReductionStage: TreeReductionStage): void {
  treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()

  configureEdgeBundling(treeReductionStage)
}

/**
 * Creates and configures the edge bundling stage
 */
function createBundleEdgeRouter(): ILayoutAlgorithm {
  const edgeBundlingStage = new BundledEdgeRouter(new StraightLineEdgeRouter())
  configureEdgeBundling(edgeBundlingStage)
  return new GenericLabeling({ coreLayout: edgeBundlingStage, scope: 'node-labels' })
}

/**
 * Configures the edge bundling descriptor.
 * @param layoutAlgorithm The layout algorithm to integrate the edge bundling
 */
function configureEdgeBundling(
  layoutAlgorithm: BundledEdgeRouter | CircularLayout | RadialLayout | TreeReductionStage
): void {
  // we could either enable here the bezier fitting or append the CurveFittingLayoutStage to our layout algorithm
  // if we would like to adjust the approximation error
  // bundlingDescriptor.bezierFitting = true;
  layoutAlgorithm.edgeBundling.bundlingStrength = parseFloat(bundlingStrengthSlider.value)
  layoutAlgorithm.edgeBundling.defaultBundleDescriptor = new EdgeBundleDescriptor({ bundled: true })
}

/**
 * Updates the circle information for each node.
 * @param layoutData The current layout data
 */
function updateNodeInformation(layoutData: CircularLayoutData): void {
  const graph = graphComponent.graph
  const circleNodes = new Mapper<string, INode[]>()
  const circleCenters = new Mapper<string, Point>()

  // store the nodes that belong to each circle
  graph.nodes.forEach((node) => {
    const circleId = layoutData.circleIdsResult.get(node)
    const componentId = componentsMap!.get(node)
    const id = circleId !== null ? `${circleId} ${componentId}` : '-1'
    if (id !== '-1') {
      if (!circleNodes.get(id)) {
        circleNodes.set(id, [])
      }
      circleNodes.get(id)!.push(node)
    }
  })

  // calculate the center of each circle
  for (const entry of circleNodes.entries) {
    const circleId = entry.key
    const entryNodes = entry.value
    if (circleId !== '-1' && entryNodes?.length > 2) {
      circleCenters.set(circleId, calculateCircleCenter(entryNodes))
    }
  }

  // store to the node's tag the circle id, the center of the circle and the nodes that belong to the node's circle
  // this information is needed for the creation of the circular sector node style
  graph.nodes.forEach((node) => {
    const circleId = layoutData.circleIdsResult.get(node)
    const componentId = componentsMap!.get(node)
    // add to the tag an id consisted of the component to which this node belongs plus the circle id
    const id = circleId !== null ? `${circleId} ${componentId}` : '-1'
    node.tag = {
      circleId: id,
      center: circleCenters.get(id)!,
      circleNodeSize: circleNodes.get(id)?.length || 0
    }
  })

  graphComponent.invalidate()
}

/**
 * Calculates the coordinates of the circle formed by the given points
 * @param circleNodes An array containing the 3 points that form the circle
 * @returns The coordinates of the center of the circle
 */
function calculateCircleCenter(circleNodes: Array<INode>): Point {
  const p1 = circleNodes[0].layout.center
  const p2 = circleNodes[1].layout.center
  const p3 = circleNodes[2].layout.center

  const idet =
    2 * (p1.x * p2.y - p2.x * p1.y - p1.x * p3.y + p3.x * p1.y + p2.x * p3.y - p3.x * p2.y)
  const a = p1.x * p1.x + p1.y * p1.y
  const b = p2.x * p2.x + p2.y * p2.y
  const c = p3.x * p3.x + p3.y * p3.y
  const centerX = (a * (p2.y - p3.y) + b * (p3.y - p1.y) + c * (p1.y - p2.y)) / idet
  const centerY = (a * (p3.x - p2.x) + b * (p1.x - p3.x) + c * (p2.x - p1.x)) / idet
  return new Point(centerX, centerY)
}

/**
 * Calculates the connected components of the current graph.
 */
function calculateConnectedComponents(): void {
  const graph = graphComponent.graph
  const selectedIndex = samplesComboBox.selectedIndex
  if (
    selectedIndex === LayoutAlgorithm.SINGLE_CYCLE ||
    selectedIndex === LayoutAlgorithm.CIRCULAR
  ) {
    const result = new ConnectedComponents().run(graph)
    componentsMap = result.nodeComponentIds
  }
}

/**
 * Wires up the UI.
 */
function initializeUI(): void {
  addNavigationButtons(samplesComboBox).addEventListener('change', onSampleChanged)

  bundlingStrengthSlider.addEventListener(
    'change',
    async () => {
      bundlingStrengthLabel.textContent = bundlingStrengthSlider.value.toString()
      await applyLayout()
    },
    true
  )
}

/**
 * Configures the busy indicator and runs the layout.
 */
async function applyLayout(): Promise<void> {
  await setBusy(true)
  // set some small time out to enable the busy indicator
  setTimeout(() => {
    runLayout()
  }, 5)
}

/**
 * Determines whether the UI is busy or not.
 * @param isBusy True if the UI is busy, false otherwise
 */
async function setBusy(isBusy: boolean): Promise<void> {
  ;(graphComponent.inputMode as GraphEditorInputMode).enabled = !isBusy
  if (isBusy) {
    graphComponent.htmlElement.classList.add('gc-busy')
  } else {
    graphComponent.htmlElement.classList.remove('gc-busy')
  }
  setUIDisabled(isBusy)
  await showLoadingIndicator(isBusy)
}

/**
 * Enables/disables the UI's elements.
 * @param disabled True if the UI's elements should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  samplesComboBox.disabled = disabled

  bundlingStrengthSlider.disabled = disabled
  bundlingStrengthLabel.disabled = disabled
}

enum LayoutAlgorithm {
  SINGLE_CYCLE = 0,
  CIRCULAR = 1,
  RADIAL = 2,
  RADIAL_TREE = 3,
  TREE = 4,
  ROUTER = 5
}

run().then(finishLoading)
