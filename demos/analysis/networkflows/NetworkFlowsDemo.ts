/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2022 by yWorks GmbH, Vor dem Kreuzberg 28,
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
  Color,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  EdgeStyleDecorationInstaller,
  FreeEdgeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HierarchicLayout,
  HierarchicLayoutData,
  ICanvasObjectDescriptor,
  ICommand,
  ICompoundEdit,
  IEdge,
  IGraph,
  ILabel,
  ILabelOwner,
  IMapper,
  IModelItem,
  IncrementalHintItemMapping,
  INode,
  ItemClickedEventArgs,
  LabelPlacements,
  LayoutMode,
  LayoutOrientation,
  License,
  Mapper,
  MaximumFlow,
  MinimumCostFlow,
  MinimumCostFlowResult,
  PartitionGrid,
  PartitionGridData,
  PreferredPlacementDescriptor,
  Rect,
  Size,
  StyleDecorationZoomPolicy
} from 'yfiles'

import HTMLPopupSupport from './HTMLPopupSupport'
import {
  EmptyReshapeHandleProvider,
  MinCutUndoUnit,
  NetworkFlowInputMode,
  TagUndoUnit
} from './NetworkFlowsHelper'
import { MinCutLine, NetworkFlowEdgeStyle, NetworkFlowNodeStyle } from './DemoStyles'
import {
  addNavigationButtons,
  bindAction,
  bindChangeListener,
  bindCommand,
  checkLicense,
  showApp
} from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

/**
 * The GraphComponent.
 */
let graphComponent: GraphComponent

/**
 * The visual object which renders the minimum cut line.
 */
let minCutLine: MinCutLine

/**
 * Manages a Popup which offers some interactive HTML elements.
 */
let edgePopup: HTMLPopupSupport

/**
 * Determines if a layout is currently running.
 */
let inLayout = false

/**
 * Holds the latest flow values for each edge.
 */
const lastFlowMap: IMapper<IEdge, number> = new Mapper()

/**
 * Constant for MAX-FLOW algorithm.
 */
const MAX_FLOW = 0

/**
 * Constant for MIN-COST algorithm.
 */
const MIN_COST_FLOW = 1

/**
 * Constant for MAX-FLOW-MIN-COST algorithm.
 */
const MAX_FLOW_MIN_CUT = 2

/**
 * Holds the graph nodes that have to change if one of their adjacent edges is deleted.
 */
let nodesToChange: INode[] = []

/**
 * Holds the compoundEdit which brackets multiple undo units
 * which are created during dragging.
 */
let compoundEdit: ICompoundEdit

const newButton = document.getElementById('newButton') as HTMLButtonElement
const algorithmComboBox = document.getElementById('algorithmComboBox') as HTMLSelectElement
const reloadButton = document.getElementById('reloadButton') as HTMLButtonElement
const layoutButton = document.getElementById('layoutButton') as HTMLButtonElement
const edgePopupContent = document.getElementById('edgePopupContent') as HTMLElement
const costForm = document.getElementById('cost-form') as HTMLInputElement
const flowLabel = document.getElementById('flowInformationLabel') as HTMLElement
const flowInput = document.getElementById('flowValue') as HTMLInputElement
const costPlusButton = document.getElementById('costPlus') as HTMLButtonElement
const costMinusButton = document.getElementById('costMinus') as HTMLButtonElement
const applyButton = document.getElementById('apply') as HTMLButtonElement

/**
 * Runs the demo.
 */
function run(licenseData: any): void {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  initializeGraph()
  initializeGraphComponent()
  createEditorInputMode()
  graphComponent.fitGraphBounds()
  createSampleGraph()
  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes the graph.
 * Sets up styles and visual decorations of graph elements.
 */
function initializeGraph(): void {
  const graph = graphComponent.graph

  // initialize default node/edge styles
  graph.nodeDefaults.style = new NetworkFlowNodeStyle()
  graph.nodeDefaults.size = new Size(60, 30)
  graph.edgeDefaults.style = new NetworkFlowEdgeStyle()

  // enable the undo engine
  graph.undoEngineEnabled = true

  graph.edgeDefaults.labels.layoutParameter = FreeEdgeLabelModel.INSTANCE.createDefaultParameter()

  graph.edgeDefaults.labels.style = new DefaultLabelStyle({
    font: '11px Arial',
    backgroundStroke: 'skyblue',
    backgroundFill: 'aliceblue',
    insets: [3, 5, 3, 5]
  })

  const decorator = graph.decorator
  decorator.nodeDecorator.reshapeHandleProviderDecorator.setImplementation(
    new EmptyReshapeHandleProvider()
  )

  const edgeStyleHighlight = new EdgeStyleDecorationInstaller({
    edgeStyle: new NetworkFlowEdgeStyle(Color.DARK_ORANGE),
    zoomPolicy: StyleDecorationZoomPolicy.WORLD_COORDINATES
  })
  decorator.edgeDecorator.highlightDecorator.setImplementation(edgeStyleHighlight)
  decorator.edgeDecorator.selectionDecorator.hideImplementation()

  decorator.labelDecorator.selectionDecorator.hideImplementation()
  decorator.labelDecorator.focusIndicatorDecorator.hideImplementation()
}

/**
 * Initializes the GraphComponent.
 * Sets up visual decorations of the canvas.
 */
function initializeGraphComponent(): void {
  minCutLine = new MinCutLine()
  graphComponent.highlightGroup.addChild(minCutLine, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)

  // We use the EdgePathLabelModel for the edge pop-up
  const edgeLabelModel = new EdgePathLabelModel({
    autoRotation: false,
    sideOfEdge: EdgeSides.LEFT_OF_EDGE,
    distance: 25
  })

  // Creates the pop-up for the edge pop-up template
  edgePopup = new HTMLPopupSupport(
    graphComponent,
    edgePopupContent,
    edgeLabelModel.createDefaultParameter()
  )

  graphComponent.addZoomChangedListener(() => graphComponent.invalidate())
}

/**
 * Creates and configures the input mode.
 */
function createEditorInputMode(): void {
  const inputMode = new GraphEditorInputMode({
    allowAddLabel: false,
    allowEditLabel: false,
    allowClipboardOperations: true,
    allowCreateBend: false,
    deletableItems: GraphItemTypes.ALL & ~GraphItemTypes.LABEL
  })

  const networkFlowsInputMode = new NetworkFlowInputMode()
  networkFlowsInputMode.priority = 1
  networkFlowsInputMode.addDragFinished(async (item, oldTag) => {
    // crates undo units for tag changes
    if (item instanceof INode) {
      const tagUndoUnit = new TagUndoUnit(
        'Supply/demand changed',
        'Supply/demand changed',
        oldTag,
        item.tag,
        item
      )
      graphComponent.graph.undoEngine!.addUnit(tagUndoUnit)
      runFlowAlgorithm()
      if (compoundEdit) {
        compoundEdit.commit()
      }
    } else if (item instanceof IEdge) {
      const tagUndoUnit = new TagUndoUnit(
        'Capacity changed',
        'Capacity changed',
        oldTag,
        item.tag,
        item
      )
      graphComponent.graph.undoEngine!.addUnit(tagUndoUnit)
      calculateNodeSize(item.sourceNode!)
      calculateNodeSize(item.targetNode!)
      runFlowAlgorithm()
      await runLayout(true)
      if (compoundEdit) {
        compoundEdit.commit()
      }
    }
  })
  networkFlowsInputMode.addDragStartedListener(() => {
    compoundEdit = graphComponent.graph.beginEdit('Dragging', 'Dragging')
  })

  inputMode.add(networkFlowsInputMode)

  // deletion
  inputMode.addDeletedSelectionListener(async () => {
    const deletedCompoundEdit = graphComponent.graph.beginEdit('Element deleted', 'Element deleted')
    // if an edge was removed, calculate the new node size of its endpoints
    if (nodesToChange.length > 0) {
      nodesToChange.forEach(node => {
        if (graphComponent.graph.contains(node)) {
          calculateNodeSize(node)
        }
      })
      nodesToChange = []
    }
    runFlowAlgorithm()
    await runLayout(true)
    deletedCompoundEdit.commit()
  })

  inputMode.addDeletingSelectionListener((sender, args) => {
    edgePopup.currentItem = null
    // collect all nodes that are endpoints of removed edges
    args.selection.forEach(item => {
      if (item instanceof IEdge) {
        nodesToChange.push(item.sourceNode!)
        nodesToChange.push(item.targetNode!)
      }
    })
  })

  // do not allow self-loops
  inputMode.createEdgeInputMode.allowSelfloops = false

  // edge creation
  inputMode.createEdgeInputMode.addEdgeCreatedListener(async (sender, args) => {
    const edgeCreatedCompoundEdit = graphComponent.graph.beginEdit('EdgeCreation', 'EdgeCreation')
    const edge = args.item as IEdge & { sourceNode: INode; targetNode: INode }
    edge.tag = {
      capacity: 10,
      cost: 1,
      color: Color.CORNFLOWER_BLUE,
      id: graphComponent.graph.edges.size
    }

    updateEdgeThickness(edge)

    // update the size of the source and target nodes
    calculateNodeSize(edge.sourceNode)
    calculateNodeSize(edge.targetNode)
    runFlowAlgorithm()
    await runLayout(true, [edge.sourceNode, edge.targetNode])
    edgeCreatedCompoundEdit.commit()
  })

  // node creation
  inputMode.addNodeCreatedListener((sender, event) => {
    event.item.tag = {
      supply: 0,
      flow: 0,
      adjustable: algorithmComboBox.selectedIndex === MIN_COST_FLOW
    }
  })

  inputMode.addCanvasClickedListener(() => (edgePopup.currentItem = null))

  inputMode.addItemClickedListener(onClicked)
  graphComponent.inputMode = inputMode
}

/**
 * Presents a popup that provides buttons for increasing/decreasing the edge capacity.
 * @param sender The sender of the event
 * @param args The event data
 */
function onClicked(sender: any, args: ItemClickedEventArgs<IModelItem>): void {
  const item = args.item
  if (item instanceof ILabel && item.tag === 'cost') {
    costForm.value = parseInt(item.text).toString()
    edgePopup.currentItem = item.owner
    return
  }

  edgePopup.currentItem = null
}

/**
 * Calculates the node size based on the thickness of incoming and outgoing edges.
 * @param node The given node
 */
function calculateNodeSize(node: INode): void {
  const graph = graphComponent.graph

  const incomingCapacity = graph.inEdgesAt(node).sum(inEdge => inEdge.tag.capacity)
  const outgoingCapacity = graph.outEdgesAt(node).sum(outEdge => outEdge.tag.capacity)

  const height = Math.max(incomingCapacity, outgoingCapacity)
  const newBounds = new Rect(node.layout.x, node.layout.y, node.layout.width, Math.max(height, 30))
  graph.setNodeLayout(node, newBounds)
}

/**
 * Updates the thickness of the given edge. The thickness is the percentage of flow that passes through an edge in
 * comparison to the overall thickness.
 * @param edge The given edge
 */
function updateEdgeThickness(edge: IEdge): void {
  if (edge.labels.size === 0) {
    // add label for capacity
    graphComponent.graph.addLabel({
      owner: edge,
      text: `0 / ${edge.tag.capacity}`,
      layoutParameter: new FreeEdgeLabelModel().createDefaultParameter(),
      style: new DefaultLabelStyle({ textFill: 'black' })
    })

    // add label for cost
    if (algorithmComboBox.selectedIndex === MIN_COST_FLOW) {
      graphComponent.graph.addLabel({
        owner: edge,
        text: `${edge.tag.cost} \u20AC `,
        tag: 'cost',
        style: graphComponent.graph.edgeDefaults.labels.style
      })
    }
  }
}

/**
 * Runs the flow algorithm.
 */
function runFlowAlgorithm(): void {
  const graph = graphComponent.graph

  if (inLayout || graph.nodes.size === 0) {
    return
  }

  // update the node tags
  graphComponent.graph.nodes.forEach(node => {
    node.tag = { ...node.tag, cut: false, source: false, sink: false }
  })

  // determine the algorithm to run
  let flowValue: number
  switch (algorithmComboBox.selectedIndex) {
    case MAX_FLOW_MIN_CUT:
      flowValue = calculateMaxFlowMinCut(true)
      break
    case MIN_COST_FLOW:
      flowValue = calculateMinCostFlow()
      break
    default:
    case MAX_FLOW:
      flowValue = calculateMaxFlowMinCut(false)
      break
  }

  // update flow information
  flowLabel.innerHTML = `${
    (algorithmComboBox[algorithmComboBox.selectedIndex] as HTMLOptionElement).text
  }`
  flowLabel.style.display = 'inline-block'
  flowInput.style.display = 'inline-block'
  flowInput.value = flowValue.toString()
}

/**
 * Runs the maximum flow minimum cost algorithm.
 * @param minCut True if the min cut should be also calculated, false otherwise
 * @return The calculated maximum flow.
 */
function calculateMaxFlowMinCut(minCut: boolean): number {
  const graph = graphComponent.graph

  if (graph.nodes.size === 1) {
    graph.nodes.first().tag = {
      flow: 0,
      supply: 0,
      adjustable: false,
      cut: false,
      source: false,
      target: false
    }
    return 0
  }

  graph.edges.forEach(edge => {
    const labels = edge.labels
    if (labels.size > 1) {
      graph.remove(labels.get(1))
    }
  })

  const sourceNodes = getSourceNodes()
  const sinkNodes = getSinkNodes()

  // calculate the maximum flow using the edge capacities stored in the edge tags
  const maxFlowMinCut = new MaximumFlow({
    sources: sourceNodes,
    sinks: sinkNodes,
    // the capacity of an edge is stored in its tag
    capacities: edge => edge.tag.capacity
  })

  const maxFlowMinCutResult = maxFlowMinCut.run(graph)
  graph.nodes.forEach(node => {
    const flow = (graph.inDegree(node) > 0 ? graph.inEdgesAt(node) : graph.outEdgesAt(node)).sum(
      (edge: IEdge): number => maxFlowMinCutResult.flow.get(edge) || 0
    )
    node.tag = {
      flow,
      supply: 0,
      adjustable: false
    }
  })

  sourceNodes.forEach(sourceNode => (sourceNode.tag.source = true))
  sinkNodes.forEach(sinkNode => (sinkNode.tag.sink = true))

  // add the flow values as tags to edges
  maxFlowMinCutResult.flow.forEach(({ key, value }) => (key.tag.flow = value))

  if (minCut) {
    // add tags for the nodes that belong to the cut
    maxFlowMinCutResult.sourcePartition.forEach(node => (node.tag.cut = true))

    maxFlowMinCutResult.sinkPartition.forEach(node => (node.tag.cut = false))
  }

  // show the result
  visualizeResult()
  return maxFlowMinCutResult.maximumFlow
}

/**
 * Runs the minimum cost flow algorithm.
 * @return The calculated minimum cost.
 */
function calculateMinCostFlow(): number {
  const graph = graphComponent.graph
  let minCostFlowResult: MinimumCostFlowResult | null = null
  try {
    const minCostFlow = new MinimumCostFlow({
      maximumCapacities: edge => edge.tag.capacity,
      costs: edge => (edge.tag && edge.tag.cost ? edge.tag.cost : 0),
      // the supply or demand of a node was calculated in calculateMaxFlow and set as node tag
      supply: node => (node.tag.supply ? node.tag.supply * node.layout.height : 0)
    })

    minCostFlowResult = minCostFlow.run(graph)
  } catch (err) {
    alert(err)
  } finally {
    // store the flow for each edge in its tag
    graph.edges.forEach(edge => {
      edge.tag.flow = minCostFlowResult ? minCostFlowResult.flow.get(edge) || 0 : 0

      if (edge.labels.size > 1) {
        // add label for cost
        graph.setLabelText(edge.labels.get(1), `${edge.tag.cost} \u20AC `)
      } else {
        // add label for cost
        graph.addLabel({
          owner: edge,
          text: `${edge.tag.cost} \u20AC `,
          tag: 'cost',
          style: graph.edgeDefaults.labels.style
        })
      }
    })

    // show the result
    visualizeResult()

    let flow = 0
    graph.nodes.forEach(node => {
      if (graph.inDegree(node) > 0) {
        flow = graph.inEdgesAt(node).sum(edge => edge.tag.flow)
      }
      node.tag = {
        flow,
        supply: node.tag.supply,
        adjustable: true
      }
    })

    getSupplyNodes(graph).forEach(supplyNode => (supplyNode.tag.source = true))
    getDemandNodes(graph).forEach(demandNode => (demandNode.tag.sink = true))
  }
  return minCostFlowResult ? minCostFlowResult.totalCost : 0
}

/**
 * Returns an array of all supply-nodes.
 * @param graph The input graph
 * @return An array of all supply-nodes.
 */
function getSupplyNodes(graph: IGraph): INode[] {
  const supplyNodes: INode[] = []
  graph.nodes.forEach(node => {
    if (node.tag.supply > 0) {
      supplyNodes.push(node)
    }
  })
  return supplyNodes
}

/**
 * Returns an array of all demand-nodes.
 * @param graph The input graph
 * @return An array of all demand-nodes.
 */
function getDemandNodes(graph: IGraph): INode[] {
  const demandNodes: INode[] = []
  graph.nodes.forEach(node => {
    if (node.tag.supply < 0) {
      demandNodes.push(node)
    }
  })
  return demandNodes
}

/**
 * Run a hierarchic layout.
 * @param incremental True if the algorithm should run in incremental mode, false otherwise
 * @param additionalIncrementalNodes An array of the incremental nodes
 */
async function runLayout(
  incremental: boolean,
  additionalIncrementalNodes?: INode[]
): Promise<void> {
  const graph = graphComponent.graph

  if (inLayout || graph.nodes.size === 0) {
    return
  }

  inLayout = true
  setUIDisabled(true)

  const layoutAlgorithm = new HierarchicLayout()
  layoutAlgorithm.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
  layoutAlgorithm.integratedEdgeLabeling = true
  layoutAlgorithm.backLoopRouting = true

  const layoutData = new HierarchicLayoutData({
    edgeThickness: edge => edge.tag.capacity
  })

  if (incremental && algorithmComboBox.selectedIndex !== MAX_FLOW_MIN_CUT) {
    layoutAlgorithm.layoutMode = LayoutMode.INCREMENTAL

    // mark all sources and sinks as well as passed additional nodes as incremental
    const hintsFactory = layoutAlgorithm.createIncrementalHintsFactory()!
    const incrementalNodesMapper = new Mapper()
    getSourceNodes().forEach(node =>
      incrementalNodesMapper.set(node, hintsFactory.createLayerIncrementallyHint(node))
    )
    getSinkNodes().forEach(node =>
      incrementalNodesMapper.set(node, hintsFactory.createLayerIncrementallyHint(node))
    )
    if (additionalIncrementalNodes) {
      additionalIncrementalNodes.forEach(node =>
        incrementalNodesMapper.set(node, hintsFactory.createLayerIncrementallyHint(node))
      )
    }
    layoutData.incrementalHints = IncrementalHintItemMapping.from(incrementalNodesMapper)
  } else {
    layoutAlgorithm.layoutMode = LayoutMode.FROM_SCRATCH
  }

  // sources will be in the first layer, sinks in the last layer
  const layerConstraints = layoutData.layerConstraints
  getSourceNodes().forEach(node => layerConstraints.placeAtTop(node))

  getSinkNodes().forEach(node => layerConstraints.placeAtBottom(node))

  if (algorithmComboBox.selectedIndex === MAX_FLOW_MIN_CUT) {
    layoutData.partitionGridData = new PartitionGridData({
      grid: new PartitionGrid(1, 2, 0, 150, 0, 0),
      cellIds: (node: INode, grid: PartitionGrid) =>
        node.tag.cut ? grid.createCellId(0, 0) : grid.createCellId(0, 1)
    })
  }

  layoutData.edgeLabelPreferredPlacement.delegate = key => {
    const preferredPlacementDescriptor = new PreferredPlacementDescriptor()
    if (key.tag === 'cost') {
      preferredPlacementDescriptor.sideOfEdge = LabelPlacements.LEFT_OF_EDGE
      preferredPlacementDescriptor.distanceToEdge = 5
    } else {
      preferredPlacementDescriptor.sideOfEdge = LabelPlacements.ON_EDGE
    }

    preferredPlacementDescriptor.freeze()
    return preferredPlacementDescriptor
  }

  await graphComponent.morphLayout(layoutAlgorithm, '1s', layoutData)
  graph.edges.forEach((edge: IEdge): void => {
    if (lastFlowMap.get(edge) !== edge.tag.flow) {
      graphComponent.highlightIndicatorManager.addHighlight(edge)
      lastFlowMap.set(edge, edge.tag.flow)
    }
  })

  setTimeout((): void => {
    graphComponent.highlightIndicatorManager.clearHighlights()
  }, 1000)

  inLayout = false
  setUIDisabled(false)

  if (algorithmComboBox.selectedIndex === MAX_FLOW_MIN_CUT) {
    updateMinCutLine()
  }
}

/**
 * Returns the source nodes of the graph, i.e., the ones with in-degree 0.
 * @return An array of the source nodes of the graph, i.e., the ones with in-degree 0
 */
function getSourceNodes(): INode[] {
  const sourceNodes: INode[] = []
  const graph = graphComponent.graph
  graph.nodes.forEach(node => {
    if (graph.inDegree(node) === 0 && graph.outDegree(node) !== 0) {
      sourceNodes.push(node)
    }
  })
  // Special case: No node with in-degree 0 was found, take the first node of the graph
  if (sourceNodes.length === 0) {
    sourceNodes.push(graph.nodes.first())
  }
  sourceNodes.forEach(node => (node.tag.source = true))
  return sourceNodes
}

/**
 * Returns the sink nodes of the graph, i.e., the ones with out-degree 0.
 * @return An array of the sink nodes of the graph, i.e., the ones with out-degree 0
 */
function getSinkNodes(): INode[] {
  const sinkNodes: INode[] = []
  const graph = graphComponent.graph
  graph.nodes.forEach(node => {
    if (graph.outDegree(node) === 0 && graph.inDegree(node) !== 0) {
      sinkNodes.push(node)
    }
  })
  // Special case: No node with out-degree 0 was found, take the first node of the graph that is not already marked as source
  if (sinkNodes.length === 0) {
    const randomSink = graph.nodes.find(node => !node.tag.source)
    if (randomSink) {
      sinkNodes.push(randomSink)
    }
  }
  sinkNodes.forEach(node => (node.tag.sink = true))
  return sinkNodes
}

/**
 * Updates the min cut line.
 */
function updateMinCutLine(): void {
  const graph = graphComponent.graph
  const graphBounds = graphComponent.contentRect

  // hold the old bounds to store in the undo unit
  const oldBounds = new Rect(minCutLine.bounds)

  if (graph.edges.size > 0) {
    // find the center between the last "source-cut"-layer and the first "target-cut"-layer
    minCutLine.visible = true
    let minX: number = Number.NEGATIVE_INFINITY
    let maxX: number = Number.POSITIVE_INFINITY
    graph.nodes.forEach(node => {
      if (node.tag.cut) {
        minX = Math.max(minX, node.layout.maxX)
      } else {
        maxX = Math.min(maxX, node.layout.x)
      }
    })

    if (isFinite(minX) && isFinite(maxX)) {
      minCutLine.bounds = new Rect(
        (minX + maxX) * 0.5 - 5,
        graphBounds.y - 30,
        10,
        graphBounds.height + 60
      )
    } else {
      minCutLine.bounds = Rect.EMPTY
    }

    // create the undo unit
    const tagUndoUnit = new MinCutUndoUnit(
      'Min cut changed',
      'Min cut changed',
      oldBounds,
      minCutLine.bounds,
      minCutLine
    )
    graphComponent.graph.undoEngine!.addUnit(tagUndoUnit)
  } else {
    minCutLine.visible = false
    graphComponent.invalidate()
  }
}

/**
 * Decorates the nodes and the edges of the graph based on the result of the algorithm.
 */
function visualizeResult(): void {
  const graph = graphComponent.graph

  const gradientCount = 50
  const colors = generateColors(Color.DARK_BLUE, Color.CORNFLOWER_BLUE, gradientCount)
  const extrema = calculateExtrema(graph, false)
  const diff = extrema.max - extrema.min

  graph.edges.forEach(edge => {
    let colorIndex = 0
    if (edge.tag.capacity !== 0) {
      if (diff === 0) {
        colorIndex = gradientCount - 1
      } else {
        const flowPercentage = (edge.tag.flow * 100) / edge.tag.capacity
        const colorScale = (gradientCount - 1) / diff
        colorIndex = Math.floor((flowPercentage - extrema.min) * colorScale) % gradientCount
      }
      edge.tag.color = colors[colorIndex]
    }
    const textLabelStyle = new DefaultLabelStyle({
      font: '11px bold Arial',
      textFill: edge.tag.capacity === 0 || colorIndex < colors.length * 0.4 ? 'black' : 'cyan'
    })

    const label = edge.labels.get(0)
    graph.setStyle(label, textLabelStyle)
    graph.setLabelText(label, `${edge.tag.flow} / ${edge.tag.capacity}`)
  })

  graphComponent.invalidate()
}

/**
 * Calculates the extrema of the capacities or flows of the edges.
 * @param graph The given graph
 * @param useCapacity True if capacity should be used, false otherwise
 */
function calculateExtrema(graph: IGraph, useCapacity: boolean): { min: number; max: number } {
  let min: number = Number.MAX_VALUE
  let max: number = -Number.MAX_VALUE

  graph.edges.forEach(edge => {
    let value = 0
    if (edge.tag && edge.tag.capacity !== 0) {
      value = useCapacity ? edge.tag.capacity : (edge.tag.flow * 100) / edge.tag.capacity
    }

    min = Math.min(min, value)
    max = Math.max(max, value)
  })

  return {
    min,
    max
  }
}

/**
 * Generates random colors for nodes and edges.
 * @param startColor The start color
 * @param endColor The end color
 * @param gradientCount The number of gradient steps
 * @return An array or random gradient colors
 */
function generateColors(startColor: Color, endColor: Color, gradientCount: number): Color[] {
  const colors: Color[] = []
  const stepCount = gradientCount - 1

  for (let i = 0; i < gradientCount; i++) {
    const r = (startColor.r * (stepCount - i) + endColor.r * i) / stepCount
    const g = (startColor.g * (stepCount - i) + endColor.g * i) / stepCount
    const b = (startColor.b * (stepCount - i) + endColor.b * i) / stepCount
    const a = (startColor.a * (stepCount - i) + endColor.a * i) / stepCount
    colors[i] = new Color(r | 0, g | 0, b | 0, a | 0)
  }
  return colors.reverse()
}

/**
 * Wires up the UI.
 */
function registerCommands(): void {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    graphComponent.graph.undoEngine!.clear()
  })
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindChangeListener("select[data-command='AlgorithmSelectionChanged']", onAlgorithmChanged)
  addNavigationButtons(algorithmComboBox)
  bindAction("button[data-command='Reload']", () => {
    edgePopup.currentItem = null
    createSampleGraph()
  })
  bindAction("button[data-command='Layout']", () => {
    edgePopup.currentItem = null
    runLayout(false)
  })
  costPlusButton.addEventListener('click', () => updateCostForm(1), true)
  costMinusButton.addEventListener('click', () => updateCostForm(-1), true)
  applyButton.addEventListener(
    'click',
    () => {
      runFlowAlgorithm()
      runLayout(true)
    },
    true
  )
}

/**
 * Handles a selection change in the algorithm combo box.
 */
async function onAlgorithmChanged() {
  updateDescriptionText()

  graphComponent.selection.clear()

  edgePopup.currentItem = null

  const graph = graphComponent.graph
  if (graph.nodes.size > 0) {
    minCutLine.visible = algorithmComboBox.selectedIndex === MAX_FLOW_MIN_CUT

    // make sure that there is flow in case the algorithm changed to "Minimum Cost Problem"
    graph.nodes.forEach(node => {
      if (graph.inDegree(node) === 0) {
        node.tag.supply = 0.5
      } else if (graph.outDegree(node) === 0) {
        node.tag.supply = -0.5
      } else {
        node.tag.supply = 0
      }
    })

    runFlowAlgorithm()
    await runLayout(false)
    graphComponent.graph.undoEngine!.clear()
  }
}

/**
 * Updates the description text based on the selected algorithm.
 */
function updateDescriptionText(): void {
  const selectedIndex = algorithmComboBox.selectedIndex
  const descriptionText = document.getElementById('description') as HTMLElement
  let i = 0
  for (let child = descriptionText.firstElementChild; child; child = child.nextElementSibling) {
    ;(child as HTMLDivElement).style.display = i === selectedIndex ? 'block' : 'none'
    ++i
  }
}

/**
 * Updates the value of the form and the edge tag.
 * @param newValue The new value to be set
 */
function updateCostForm(newValue: number): void {
  const form = costForm
  form.value = Math.max(parseInt(form.value) + newValue, 0).toString()

  const currentItem = edgePopup.currentItem as ILabelOwner
  if (currentItem) {
    currentItem.tag = {
      flow: currentItem.tag.flow,
      color: currentItem.tag.color,
      capacity: currentItem.tag.capacity,
      cost: parseInt(form.value)
    }

    if (currentItem.labels.size > 1) {
      const label = currentItem.labels.get(1)
      graphComponent.graph.setLabelText(label, `${currentItem.tag.cost} \u20AC`)
    }
  }
}

/**
 * Changes the state of the UI's elements and the input's mode.
 * @param disabled True if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled: boolean): void {
  newButton.disabled = disabled
  algorithmComboBox.disabled = disabled
  reloadButton.disabled = disabled
  layoutButton.disabled = disabled
}

/**
 * Loads and prepares the input graph.
 */
function createSampleGraph(): void {
  const graph = graphComponent.graph
  graph.clear()

  minCutLine.bounds = Rect.EMPTY

  const node1 = graph.createNode()
  const node2 = graph.createNode()
  const node3 = graph.createNode()
  const node4 = graph.createNode()
  const node5 = graph.createNode()
  const node6 = graph.createNode()
  const node7 = graph.createNode()
  const node8 = graph.createNode()

  const color = Color.CORNFLOWER_BLUE
  graph.createEdge({
    source: node1,
    target: node2,
    tag: {
      capacity: 19,
      cost: 14,
      color,
      id: 1
    }
  })
  graph.createEdge({
    source: node2,
    target: node3,
    tag: {
      capacity: 15,
      cost: 16,
      color,
      id: 2
    }
  })
  graph.createEdge({
    source: node1,
    target: node3,
    tag: {
      capacity: 16,
      cost: 15,
      color,
      id: 3
    }
  })
  graph.createEdge({
    source: node1,
    target: node4,
    tag: {
      capacity: 25,
      cost: 13,
      color,
      id: 4
    }
  })
  graph.createEdge({
    source: node2,
    target: node6,
    tag: {
      capacity: 10,
      cost: 11,
      color,
      id: 5
    }
  })
  graph.createEdge({
    source: node4,
    target: node3,
    tag: {
      capacity: 15,
      cost: 13,
      color,
      id: 6
    }
  })
  graph.createEdge({
    source: node3,
    target: node5,
    tag: {
      capacity: 23,
      cost: 10,
      color,
      id: 7
    }
  })
  graph.createEdge({
    source: node4,
    target: node7,
    tag: {
      capacity: 16,
      cost: 10,
      color,
      id: 8
    }
  })
  graph.createEdge({
    source: node5,
    target: node6,
    tag: {
      capacity: 10,
      cost: 15,
      color,
      id: 9
    }
  })
  graph.createEdge({
    source: node5,
    target: node7,
    tag: {
      capacity: 10,
      cost: 16,
      color,
      id: 10
    }
  })
  graph.createEdge({
    source: node5,
    target: node8,
    tag: {
      capacity: 16,
      cost: 15,
      color,
      id: 11
    }
  })
  graph.createEdge({
    source: node6,
    target: node8,
    tag: {
      capacity: 13,
      cost: 15,
      color,
      id: 12
    }
  })
  graph.createEdge({
    source: node7,
    target: node8,
    tag: {
      capacity: 15,
      cost: 16,
      color,
      id: 13
    }
  })

  graph.edges.forEach(edge => updateEdgeThickness(edge))

  graph.nodes.forEach(node => {
    let supply = 0
    if (graph.inDegree(node) === 0) {
      supply = 0.5
    } else if (graph.outDegree(node) === 0) {
      supply = -0.5
    }
    node.tag = {
      supply,
      flow: 0.5 * node.layout.height,
      adjustable: algorithmComboBox.selectedIndex === MIN_COST_FLOW
    }

    calculateNodeSize(node)
  })

  onAlgorithmChanged()
}

// run the demo
loadJson().then(checkLicense).then(run)
