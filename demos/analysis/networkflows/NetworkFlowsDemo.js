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
  Color,
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  FreeEdgeLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphFocusIndicatorManager,
  GraphHighlightIndicatorManager,
  GraphItemTypes,
  GraphSelectionIndicatorManager,
  HierarchicLayout,
  HierarchicLayoutData,
  ICanvasObjectDescriptor,
  ICompoundEdit,
  IEdge,
  IGraph,
  ILabel,
  ILabelOwner,
  IMapper,
  IModelItem,
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
  VoidEdgeStyle,
  VoidLabelStyle
} from 'yfiles'

import HTMLPopupSupport from './HTMLPopupSupport.js'
import {
  EmptyReshapeHandleProvider,
  MinCutUndoUnit,
  NetworkFlowInputMode,
  TagUndoUnit
} from './NetworkFlowsHelper.js'
import { MinCutLine, NetworkFlowEdgeStyle, NetworkFlowNodeStyle } from './DemoStyles.js'

import { applyDemoTheme } from 'demo-resources/demo-styles'
import { fetchLicense } from 'demo-resources/fetch-license'
import { addNavigationButtons, finishLoading } from 'demo-resources/demo-page'

/**
 * The GraphComponent.
 * @type {GraphComponent}
 */
let graphComponent

/**
 * The visual object which renders the minimum cut line.
 * @type {MinCutLine}
 */
let minCutLine

/**
 * Manages a Popup which offers some interactive HTML elements.
 * @type {HTMLPopupSupport}
 */
let edgePopup

/**
 * Determines if a layout is currently running.
 * @type {boolean}
 */
let inLayout = false

/**
 * Holds the latest flow values for each edge.
 */
const lastFlowMap = new Mapper()

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
 * @type {Array}
 */
let nodesToChange = []

/**
 * Holds the compoundEdit which brackets multiple undo units
 * which are created during dragging.
 * @type {ICompoundEdit}
 */
let compoundEdit

const newButton = document.querySelector('#new-button')
const algorithmComboBox = document.querySelector('#algorithm-combo-box')
const reloadButton = document.querySelector('#reload-button')
const layoutButton = document.querySelector('#layout-button')
const edgePopupContent = document.querySelector('#edgePopupContent')
const costForm = document.querySelector('#cost-form')
const flowLabel = document.querySelector('#flowInformationLabel')
const flowInput = document.querySelector('#flowValue')
/**
 * Runs the demo.
 * @returns {!Promise}
 */
async function run() {
  License.value = await fetchLicense()
  graphComponent = new GraphComponent('graphComponent')
  applyDemoTheme(graphComponent)

  initializeGraph()
  initializeGraphComponent()
  createEditorInputMode()
  graphComponent.fitGraphBounds()
  createSampleGraph()
  initializeUI()
}

/**
 * Initializes the graph.
 * Sets up styles and visual decorations of graph elements.
 */
function initializeGraph() {
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

  graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.setImplementation(
    new EmptyReshapeHandleProvider()
  )

  graphComponent.selectionIndicatorManager = new GraphSelectionIndicatorManager({
    edgeStyle: VoidEdgeStyle.INSTANCE,
    labelStyle: VoidLabelStyle.INSTANCE
  })
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    labelStyle: VoidLabelStyle.INSTANCE
  })
  graphComponent.highlightIndicatorManager = new GraphHighlightIndicatorManager({
    edgeStyle: new NetworkFlowEdgeStyle(Color.DARK_ORANGE)
  })
}

/**
 * Initializes the GraphComponent.
 * Sets up visual decorations of the canvas.
 */
function initializeGraphComponent() {
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
function createEditorInputMode() {
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
      graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
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
      graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
      calculateNodeSize(item.sourceNode)
      calculateNodeSize(item.targetNode)
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

  inputMode.addDeletingSelectionListener((_, evt) => {
    edgePopup.currentItem = null
    // collect all nodes that are endpoints of removed edges
    evt.selection.forEach(item => {
      if (item instanceof IEdge) {
        nodesToChange.push(item.sourceNode)
        nodesToChange.push(item.targetNode)
      }
    })
  })

  // do not allow self-loops
  inputMode.createEdgeInputMode.allowSelfloops = false

  // edge creation
  inputMode.createEdgeInputMode.addEdgeCreatedListener(async (_, evt) => {
    const edgeCreatedCompoundEdit = graphComponent.graph.beginEdit('EdgeCreation', 'EdgeCreation')
    const edge = evt.item
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
  inputMode.addNodeCreatedListener((_, evt) => {
    evt.item.tag = {
      supply: 0,
      flow: 0,
      adjustable: algorithmComboBox.selectedIndex === MIN_COST_FLOW
    }
  })

  inputMode.addCanvasClickedListener(() => (edgePopup.currentItem = null))

  // Presents a popup that provides buttons for increasing/decreasing the edge capacity.
  inputMode.addItemClickedListener((_, evt) => {
    const item = evt.item
    if (item instanceof ILabel && item.tag === 'cost') {
      costForm.value = parseInt(item.text).toString()
      edgePopup.currentItem = item.owner
      return
    }

    edgePopup.currentItem = null
  })

  graphComponent.inputMode = inputMode
}

/**
 * Calculates the node size based on the thickness of incoming and outgoing edges.
 * @param {!INode} node The given node
 */
function calculateNodeSize(node) {
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
 * @param {!IEdge} edge The given edge
 */
function updateEdgeThickness(edge) {
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
function runFlowAlgorithm() {
  const graph = graphComponent.graph

  if (inLayout || graph.nodes.size === 0) {
    return
  }

  // update the node tags
  graphComponent.graph.nodes.forEach(node => {
    node.tag = { ...node.tag, cut: false, source: false, sink: false }
  })

  // determine the algorithm to run
  let flowValue
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
  flowLabel.innerHTML = `${algorithmComboBox[algorithmComboBox.selectedIndex].textContent}`
  flowLabel.style.display = 'inline-block'
  flowInput.style.display = 'inline-block'
  flowInput.value = flowValue.toString()
}

/**
 * Runs the maximum flow minimum cost algorithm.
 * @param {boolean} minCut True if the min cut should be also calculated, false otherwise
 * @returns {number} The calculated maximum flow.
 */
function calculateMaxFlowMinCut(minCut) {
  const graph = graphComponent.graph

  if (graph.nodes.size === 1) {
    const singleNode = graph.nodes.at(0)
    singleNode.tag = {
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
      edge => maxFlowMinCutResult.flow.get(edge) || 0
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
 * @returns {number} The calculated minimum cost.
 */
function calculateMinCostFlow() {
  const graph = graphComponent.graph
  let minCostFlowResult = null
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
 * @param {!IGraph} graph The input graph
 * @returns {!Array.<INode>} An array of all supply-nodes.
 */
function getSupplyNodes(graph) {
  const supplyNodes = []
  graph.nodes.forEach(node => {
    if (node.tag.supply > 0) {
      supplyNodes.push(node)
    }
  })
  return supplyNodes
}

/**
 * Returns an array of all demand-nodes.
 * @param {!IGraph} graph The input graph
 * @returns {!Array.<INode>} An array of all demand-nodes.
 */
function getDemandNodes(graph) {
  const demandNodes = []
  graph.nodes.forEach(node => {
    if (node.tag.supply < 0) {
      demandNodes.push(node)
    }
  })
  return demandNodes
}

/**
 * Run a hierarchic layout.
 * @param {boolean} incremental True if the algorithm should run in incremental mode, false otherwise
 * @param additionalIncrementalNodes An array of the incremental nodes
 * @param {!Array.<INode>} [additionalIncrementalNodes]
 * @returns {!Promise}
 */
async function runLayout(incremental, additionalIncrementalNodes) {
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
    const hintsFactory = layoutAlgorithm.createIncrementalHintsFactory()
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
    layoutData.incrementalHints = incrementalNodesMapper
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
      cellIds: (node, grid) => (node.tag.cut ? grid.createCellId(0, 0) : grid.createCellId(0, 1))
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
  graph.edges.forEach(edge => {
    if (lastFlowMap.get(edge) !== edge.tag.flow) {
      graphComponent.highlightIndicatorManager.addHighlight(edge)
      lastFlowMap.set(edge, edge.tag.flow)
    }
  })

  setTimeout(() => {
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
 * @returns {!Array.<INode>} An array of the source nodes of the graph, i.e., the ones with in-degree 0
 */
function getSourceNodes() {
  const sourceNodes = []
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
 * @returns {!Array.<INode>} An array of the sink nodes of the graph, i.e., the ones with out-degree 0
 */
function getSinkNodes() {
  const sinkNodes = []
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
function updateMinCutLine() {
  const graph = graphComponent.graph
  const graphBounds = graphComponent.contentRect

  // hold the old bounds to store in the undo unit
  const oldBounds = new Rect(minCutLine.bounds)

  if (graph.edges.size > 0) {
    // find the center between the last "source-cut"-layer and the first "target-cut"-layer
    minCutLine.visible = true
    let minX = Number.NEGATIVE_INFINITY
    let maxX = Number.POSITIVE_INFINITY
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
    graphComponent.graph.undoEngine.addUnit(tagUndoUnit)
  } else {
    minCutLine.visible = false
    graphComponent.invalidate()
  }
}

/**
 * Decorates the nodes and the edges of the graph based on the result of the algorithm.
 */
function visualizeResult() {
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
 * @param {!IGraph} graph The given graph
 * @param {boolean} useCapacity True if capacity should be used, false otherwise
 * @returns {!object}
 */
function calculateExtrema(graph, useCapacity) {
  let min = Number.MAX_VALUE
  let max = -Number.MAX_VALUE

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
 * @param {!Color} startColor The start color
 * @param {!Color} endColor The end color
 * @param {number} gradientCount The number of gradient steps
 * @returns {!Array.<Color>} An array or random gradient colors
 */
function generateColors(startColor, endColor, gradientCount) {
  const colors = []
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
function initializeUI() {
  addNavigationButtons(algorithmComboBox).addEventListener('change', onAlgorithmChanged)

  reloadButton.addEventListener('click', () => {
    edgePopup.currentItem = null
    createSampleGraph()
  })
  layoutButton.addEventListener('click', () => {
    edgePopup.currentItem = null
    runLayout(false)
  })
  document.querySelector('#cost-plus').addEventListener('click', () => updateCostForm(1), true)
  document.querySelector('#cost-minus').addEventListener('click', () => updateCostForm(-1), true)
  document.querySelector('#apply').addEventListener(
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
    graphComponent.graph.undoEngine.clear()
  }
}

/**
 * Updates the description text based on the selected algorithm.
 */
function updateDescriptionText() {
  const selectedIndex = algorithmComboBox.selectedIndex
  const descriptionText = document.querySelector('#description')
  let i = 0
  for (let child = descriptionText.firstElementChild; child; child = child.nextElementSibling) {
    child.style.display = i === selectedIndex ? 'block' : 'none'
    ++i
  }
}

/**
 * Updates the value of the form and the edge tag.
 * @param {number} newValue The new value to be set
 */
function updateCostForm(newValue) {
  const form = costForm
  form.value = Math.max(parseInt(form.value) + newValue, 0).toString()

  const currentItem = edgePopup.currentItem
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
 * @param {boolean} disabled True if the elements should be disabled, false otherwise
 */
function setUIDisabled(disabled) {
  newButton.disabled = disabled
  algorithmComboBox.disabled = disabled
  reloadButton.disabled = disabled
  layoutButton.disabled = disabled
}

/**
 * Loads and prepares the input graph.
 */
function createSampleGraph() {
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

run().then(finishLoading)
